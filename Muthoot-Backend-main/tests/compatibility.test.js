import test from "node:test";
import assert from "node:assert/strict";
import { isMacDeviceId, normalizeDeviceId } from "../utils/deviceId.js";
import { normalizeZoneFields } from "../utils/mqttCompatibility.js";
import { zone16 } from "../utils/constants.js";

test("normalizes compact and lowercase MAC IDs to uppercase colon format", () => {
  assert.equal(normalizeDeviceId("ba06f2d8330d"), "BA:06:F2:D8:33:0D");
  assert.equal(normalizeDeviceId("ba:06:f2:d8:33:0d"), "BA:06:F2:D8:33:0D");
  assert.equal(isMacDeviceId("BA-06-F2-D8-33-0D"), true);
  assert.equal(isMacDeviceId("not-a-mac"), false);
});

test("normalizes all present zone values through zone 16", () => {
  const state = {
    ZONE_1: "0",
    ZONE_8: "1",
    ZONE_9: 0,
    ZONE_16: "1",
  };

  normalizeZoneFields(state);

  assert.deepEqual(state, {
    ZONE_1: 0,
    ZONE_8: 1,
    ZONE_9: 0,
    ZONE_16: 1,
  });
});

test("defines names for all 16 default panel zones", () => {
  assert.equal(zone16.length, 16);
  assert.equal(zone16[8], "Manager Door");
  assert.equal(zone16[15], "Spare 16");
});
