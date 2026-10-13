import mqtt from "mqtt";
import { randomUUID } from "node:crypto";
import { config } from "./config.js";
import { buildMessageRecord } from "./normalize.js";

const requiredTopic = config.mqttTopic.trim();
if (!requiredTopic) throw new Error("MQTT_TOPIC must not be empty");

function topicFilterMatches(filter, topic) {
  const filterLevels = filter.split("/");
  const topicLevels = topic.split("/");
  for (let index = 0; index < filterLevels.length; index += 1) {
    if (filterLevels[index] === "#") return true;
    if (topicLevels[index] === undefined) return false;
    if (filterLevels[index] !== "+" && filterLevels[index] !== topicLevels[index]) return false;
  }
  return filterLevels.length === topicLevels.length;
}

for (const filter of requiredTopic.split(",").map((value) => value.trim()).filter(Boolean)) {
  if (topicFilterMatches(filter, `${config.mqttRoundTripTopic}/_probe`)) {
    throw new Error("MQTT_ROUNDTRIP_TOPIC must not match the panel telemetry subscription");
  }
}

const instanceId = randomUUID().replaceAll("-", "").slice(0, 10);
const clientId = config.mqttClientId || `wgdiag-${instanceId}`;
const roundTripTopicRoot = config.mqttRoundTripTopic.replace(/\/+$/, "");
const roundTripWaiters = new Map();
let mqttClient;

export const mqttStatus = {
  connected: false,
  subscribed: false,
  subscriptionError: null,
  clientId,
  topic: requiredTopic,
  roundTripTopic: roundTripTopicRoot,
  connectedSince: null,
  lastDisconnectAt: null,
  lastError: null,
  lastMessageAt: null,
  lastMessageMac: null,
  messagesSinceStart: 0,
  ingestErrorsSinceStart: 0,
};

export function startMqtt(onMessage) {
  mqttClient = mqtt.connect(config.mqttUrl, {
    clientId,
    username: config.mqttUsername,
    password: config.mqttPassword,
    clean: true,
    resubscribe: false,
    reconnectPeriod: 3000,
    connectTimeout: 15000,
    keepalive: 30,
  });

  mqttClient.on("connect", () => {
    mqttStatus.connected = true;
    mqttStatus.subscribed = false;
    mqttStatus.subscriptionError = null;
    mqttStatus.connectedSince = new Date().toISOString();
    mqttStatus.lastError = null;
    console.info(`MQTT connected; clientId=${clientId}; topic=${requiredTopic}`);
    mqttClient.subscribe(requiredTopic, { qos: config.mqttQos }, (error, grants) => {
      if (error) {
        mqttStatus.subscribed = false;
        mqttStatus.subscriptionError = error.message;
        mqttStatus.lastError = error.message;
        console.error(`MQTT subscribe failed: ${error.message}`);
        return;
      }
      const grant = grants?.[0];
      if (!grant || grant.qos === 128) {
        const reason = "Broker refused subscription";
        mqttStatus.subscribed = false;
        mqttStatus.subscriptionError = reason;
        mqttStatus.lastError = reason;
        console.error(`MQTT subscription refused; topic=${requiredTopic}`);
        return;
      }
      mqttStatus.subscribed = true;
      console.info(`MQTT subscription active; grantedQos=${grant?.qos ?? "unknown"}`);
    });
  });

  mqttClient.on("message", (topic, message, packet) => {
    if (topic.startsWith(`${roundTripTopicRoot}/`)) {
      roundTripWaiters.get(topic)?.({
        payload: Buffer.from(message),
        qos: Number(packet?.qos ?? 0),
        retain: Boolean(packet?.retain),
      });
      return;
    }

    const receivedAt = new Date();
    const record = buildMessageRecord(topic, message, packet, receivedAt, config.maxPayloadBytes);
    mqttStatus.lastMessageAt = receivedAt.toISOString();
    mqttStatus.lastMessageMac = record.macId;
    mqttStatus.messagesSinceStart += 1;
    void onMessage(record).catch((error) => {
      mqttStatus.ingestErrorsSinceStart += 1;
      console.error(`MQTT record insert failed: ${error.message}`);
    });
  });

  mqttClient.on("reconnect", () => {
    mqttStatus.connected = false;
    mqttStatus.subscribed = false;
    console.warn("MQTT reconnecting");
  });
  mqttClient.on("offline", () => {
    mqttStatus.connected = false;
    mqttStatus.subscribed = false;
    mqttStatus.lastDisconnectAt = new Date().toISOString();
    console.warn("MQTT client offline");
  });
  mqttClient.on("close", () => {
    mqttStatus.connected = false;
    mqttStatus.subscribed = false;
    mqttStatus.lastDisconnectAt = new Date().toISOString();
    console.warn("MQTT connection closed");
  });
  mqttClient.on("error", (error) => {
    mqttStatus.lastError = error.message;
    console.error(`MQTT client error: ${error.message}`);
  });

  return mqttClient;
}

export async function runMqttRoundTrip(qos) {
  if (qos !== 0 && qos !== 1) {
    throw new Error("Test QoS must be 0 or 1");
  }
  if (roundTripWaiters.size > 0) {
    throw new Error("A round-trip test is already running");
  }
  if (!mqttClient || !mqttStatus.connected || !mqttStatus.subscribed) {
    throw new Error("Collector must be connected and subscribed before testing");
  }

  const testId = randomUUID();
  const topic = `${roundTripTopicRoot}/${testId}`;
  const payload = Buffer.from(JSON.stringify({
    type: "watchguardian_diagnostic_roundtrip",
    test_id: testId,
    sent_at: new Date().toISOString(),
    requested_qos: qos,
    note: "diagnostic only; not panel telemetry",
  }));
  const deadline = Date.now() + 8000;
  const withDeadline = (promise) => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) return Promise.reject(new Error("Round-trip timed out"));
    let timer;
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Round-trip timed out")), remaining);
      }),
    ]).finally(() => clearTimeout(timer));
  };

  let resolveEcho;
  const echoPromise = new Promise((resolve) => { resolveEcho = resolve; });
  roundTripWaiters.set(topic, resolveEcho);
  const startedAt = Date.now();

  try {
    const grants = await withDeadline(new Promise((resolve, reject) => {
      mqttClient.subscribe(topic, { qos }, (error, granted) => {
        if (error) return reject(error);
        const grant = granted?.find((item) => item.topic === topic);
        if (!grant || grant.qos === 128) return reject(new Error("Broker refused diagnostics-topic subscription"));
        resolve(grant);
      });
    }));

    const publishCompletedAt = await withDeadline(new Promise((resolve, reject) => {
      mqttClient.publish(topic, payload, { qos }, (error) => {
        if (error) return reject(error);
        resolve(Date.now());
      });
    }));
    const echo = await withDeadline(echoPromise);
    const payloadMatch = payload.equals(echo.payload);

    return {
      testId,
      topic,
      requestedQos: qos,
      subscriptionGrantedQos: grants.qos,
      echoQos: echo.qos,
      echoRetained: echo.retain,
      brokerPublishAck: qos === 1,
      payloadMatch,
      payloadBytes: payload.length,
      roundTripMs: Date.now() - startedAt,
      publishCompletedAt: new Date(publishCompletedAt).toISOString(),
    };
  } finally {
    roundTripWaiters.delete(topic);
    if (mqttClient?.connected) {
      mqttClient.unsubscribe(topic, () => {});
    }
  }
}
