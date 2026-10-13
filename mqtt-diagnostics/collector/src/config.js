const intSetting = (name, fallback, min, max) => {
  const parsed = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max
    ? parsed
    : fallback;
};

export const config = {
  port: intSetting("PORT", 5003, 1, 65535),
  databaseUrl: process.env.DATABASE_URL,
  mqttUrl: process.env.MQTT_URL,
  mqttTopic: process.env.MQTT_TOPIC || "sensor",
  mqttRoundTripTopic: process.env.MQTT_ROUNDTRIP_TOPIC || "watchguardian/diagnostics/roundtrip",
  mqttUsername: process.env.MQTT_USERNAME || undefined,
  mqttPassword: process.env.MQTT_PASSWORD || undefined,
  mqttClientId: process.env.MQTT_CLIENT_ID || "",
  mqttQos: intSetting("MQTT_SUBSCRIPTION_QOS", 1, 0, 2),
  maxPayloadBytes: intSetting("MQTT_CAPTURE_MAX_BYTES", 16384, 256, 1048576),
  retentionDays: intSetting("CAPTURE_RETENTION_DAYS", 14, 1, 365),
  recentSeconds: intSetting("DEVICE_RECENT_SECONDS", 300, 1, 86400),
  offlineSeconds: intSetting("DEVICE_OFFLINE_SECONDS", 900, 2, 604800),
};

if (!config.databaseUrl) throw new Error("DATABASE_URL is required");
if (!config.mqttUrl) throw new Error("MQTT_URL is required");
if (
  !config.mqttRoundTripTopic
  || /[+#\s]/.test(config.mqttRoundTripTopic)
  || config.mqttRoundTripTopic.startsWith("/")
  || config.mqttRoundTripTopic.endsWith("/")
  || config.mqttRoundTripTopic.split("/").some((level) => !level)
) {
  throw new Error("MQTT_ROUNDTRIP_TOPIC must be a valid publishable topic without wildcards or empty levels");
}
if (config.offlineSeconds <= config.recentSeconds) {
  throw new Error("DEVICE_OFFLINE_SECONDS must be greater than DEVICE_RECENT_SECONDS");
}
