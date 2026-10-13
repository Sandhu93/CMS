const sensitiveKey = /(password|passwd|secret|token|credential|private.?key|api.?key)/i;
const requiredFields = ["mac_id", "Date_time", "CMS_status", "Net_Con", "Op_Mode"];

export function normalizeDeviceId(value) {
  if (typeof value !== "string") return null;
  const compact = value.trim().replaceAll(":", "").replaceAll("-", "");
  if (!/^[0-9a-fA-F]{12}$/.test(compact)) return null;
  return compact.toUpperCase().match(/.{2}/g).join(":");
}

function redactValue(value) {
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        sensitiveKey.test(key) ? "[REDACTED]" : redactValue(child),
      ])
    );
  }
  return value;
}

export function parsePanelTime(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const input = value.trim();
  if (/^(RTC_UNAVAILABLE|0{4}-0{2}-0{2})/i.test(input)) return null;

  const isoWithZone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/i;
  const isoLocal = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
  let normalized = input;
  if (isoLocal.test(input)) normalized = `${input}+05:30`;
  else if (!isoWithZone.test(input)) return null;

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function buildMessageRecord(topic, message, packet, receivedAt, maxPayloadBytes) {
  const bytes = Buffer.isBuffer(message) ? message : Buffer.from(String(message ?? ""));
  const fullText = bytes.toString("utf8");
  const truncated = bytes.length > maxPayloadBytes;
  let payload = null;
  let parseOk = false;
  let parseError = null;
  let normalized = {};
  let fields = [];

  try {
    const parsed = JSON.parse(fullText);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Payload JSON must be an object");
    }
    normalized = redactValue(parsed);
    payload = normalized;
    fields = Object.keys(parsed);
    parseOk = true;
  } catch (error) {
    parseError = error instanceof Error ? error.message : String(error);
  }

  const macId = normalizeDeviceId(normalized.mac_id);
  const panelTimeRaw = typeof normalized.Date_time === "string"
    ? normalized.Date_time
    : null;
  const panelTime = parsePanelTime(panelTimeRaw);
  const zoneValues = {};
  for (let index = 1; index <= 16; index += 1) {
    const key = `ZONE_${index}`;
    if (Object.hasOwn(normalized, key)) zoneValues[key] = normalized[key];
  }
  const zoneCount = Object.keys(zoneValues).length;
  const required = [...requiredFields, ...Array.from(
    { length: zoneCount > 8 ? 16 : 8 },
    (_, index) => `ZONE_${index + 1}`
  )];
  const missingFields = required.filter((key) => !Object.hasOwn(normalized, key));
  const storedText = parseOk
    ? JSON.stringify(normalized).slice(0, maxPayloadBytes)
    : bytes.subarray(0, maxPayloadBytes).toString("utf8");
  const storedPayload = truncated ? null : payload;

  return {
    receivedAt,
    topic: String(topic ?? ""),
    qos: Number(packet?.qos ?? 0),
    retain: Boolean(packet?.retain),
    payloadBytes: bytes.length,
    truncated,
    parseOk,
    parseError,
    macId,
    panelTimeRaw,
    panelTime,
    clockDeltaSeconds: panelTime ? (receivedAt.getTime() - panelTime.getTime()) / 1000 : null,
    netCon: typeof normalized.Net_Con === "string" ? normalized.Net_Con : null,
    firmwareVersion: typeof normalized.Version === "string" ? normalized.Version : null,
    cmsStatus: typeof normalized.CMS_status === "string" ? normalized.CMS_status : null,
    opMode: typeof normalized.Op_Mode === "string" ? normalized.Op_Mode : null,
    zoneCount,
    missingFields,
    zoneValues,
    payload: storedPayload,
    rawPayload: storedText,
  };
}
