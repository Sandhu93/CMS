const macAddressPattern = /^[0-9a-f]{12}$/i;

export function isMacDeviceId(value) {
  if (typeof value !== "string") return false;
  return macAddressPattern.test(value.trim().replace(/[:-]/g, ""));
}

/**
 * Store MAC-based device IDs in the same format used by the panels and MQTT
 * topics: uppercase hexadecimal pairs separated by colons.
 */
export function normalizeDeviceId(value) {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  const compact = trimmed.replace(/[:-]/g, "");
  if (!macAddressPattern.test(compact)) return trimmed.toUpperCase();

  return compact.toUpperCase().match(/.{2}/g).join(":");
}
