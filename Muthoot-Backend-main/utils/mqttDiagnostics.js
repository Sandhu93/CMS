import { normalizeDeviceId } from "./deviceId.js";

const DEFAULT_MAX_BYTES = 16 * 1024;

function maxPayloadBytes() {
  const configured = Number.parseInt(process.env.MQTT_CAPTURE_MAX_BYTES, 10);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_MAX_BYTES;
}

export function mqttCaptureEnabled() {
  return process.env.MQTT_CAPTURE_ENABLED !== "false";
}

export function buildMqttIngressRecord(topic, message, receivedAt = new Date()) {
  const bytes = Buffer.isBuffer(message)
    ? message
    : Buffer.from(String(message ?? ""), "utf8");
  const rawPayload = bytes.toString("utf8");
  const maxBytes = maxPayloadBytes();
  const truncated = bytes.length > maxBytes;
  const rawForStorage = truncated
    ? bytes.subarray(0, maxBytes).toString("utf8")
    : rawPayload;

  let parseOk = false;
  let parsedPayload;
  let parseError = null;
  let macId = null;
  let fields = [];

  try {
    parsedPayload = JSON.parse(rawPayload);
    if (!parsedPayload || typeof parsedPayload !== "object" || Array.isArray(parsedPayload)) {
      throw new Error("MQTT JSON payload must be an object");
    }
    parseOk = true;
    fields = Object.keys(parsedPayload).sort();
    macId = normalizeDeviceId(parsedPayload.mac_id) || null;
  } catch (error) {
    parseError = error instanceof Error ? error.message : String(error);
  }

  return {
    received_at: receivedAt,
    topic: String(topic ?? ""),
    bytes: bytes.length,
    truncated,
    parse_ok: parseOk,
    parse_error: parseError,
    mac_id: macId,
    fields,
    raw_payload: rawForStorage,
  };
}
