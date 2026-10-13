import { appendFile, mkdir } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildMqttIngressRecord,
  mqttCaptureEnabled,
} from "../utils/mqttDiagnostics.js";

const backendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let writeQueue = Promise.resolve();

export function mqttCaptureFilePath() {
  const configured = process.env.MQTT_CAPTURE_FILE || "logs/mqtt-ingress.ndjson";
  return isAbsolute(configured) ? configured : resolve(backendDirectory, configured);
}

export async function recordMqttIngress(topic, message, receivedAt = new Date()) {
  if (!mqttCaptureEnabled()) return null;

  const record = buildMqttIngressRecord(topic, message, receivedAt);
  const filePath = mqttCaptureFilePath();
  const line = `${JSON.stringify(record)}\n`;

  // Serialize appends so bursts of MQTT messages cannot interleave records.
  writeQueue = writeQueue
    .catch(() => {})
    .then(async () => {
      await mkdir(dirname(filePath), { recursive: true });
      await appendFile(filePath, line, "utf8");
    });

  await writeQueue;
  return record;
}
