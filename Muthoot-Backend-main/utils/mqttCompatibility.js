export function normalizeZoneValue(value) {
  if (value === undefined || value === null || value === "") return value;

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : value;
}

export function normalizeZoneFields(deviceState, maxZones = 16) {
  for (let i = 1; i <= maxZones; i += 1) {
    const key = `ZONE_${i}`;
    if (Object.prototype.hasOwnProperty.call(deviceState, key)) {
      deviceState[key] = normalizeZoneValue(deviceState[key]);
    }
  }
  return deviceState;
}

export function hasExtendedZoneData(deviceState) {
  return Array.from({ length: 8 }, (_, index) => index + 9)
    .some((index) => Object.prototype.hasOwnProperty.call(deviceState, `ZONE_${index}`));
}
