import test from "node:test";
import assert from "node:assert/strict";
import {
  buildMqttIngressRecord,
} from "../utils/mqttDiagnostics.js";

test("records valid MQTT payload metadata and normalizes the device ID", () => {
  const receivedAt = new Date("2026-09-22T10:00:00.000Z");
  const record = buildMqttIngressRecord(
    "sensor",
    Buffer.from('{"mac_id":"ba06f2d8330d","ZONE_1":1}'),
    receivedAt
  );

  assert.equal(record.received_at, receivedAt);
  assert.equal(record.topic, "sensor");
  assert.equal(record.parse_ok, true);
  assert.equal(record.mac_id, "BA:06:F2:D8:33:0D");
  assert.deepEqual(record.fields, ["ZONE_1", "mac_id"]);
  assert.equal(record.raw_payload, '{"mac_id":"ba06f2d8330d","ZONE_1":1}');
  assert.equal(record.truncated, false);
});

test("records malformed payloads without throwing", () => {
  const record = buildMqttIngressRecord("sensor", "not-json");

  assert.equal(record.parse_ok, false);
  assert.equal(record.mac_id, null);
  assert.equal(record.fields.length, 0);
  assert.match(record.parse_error, /JSON/);
  assert.equal(record.raw_payload, "not-json");
});

test("limits stored payload size while preserving the original byte count", () => {
  const previous = process.env.MQTT_CAPTURE_MAX_BYTES;
  process.env.MQTT_CAPTURE_MAX_BYTES = "5";
  try {
    const record = buildMqttIngressRecord("sensor", "123456789");
    assert.equal(record.bytes, 9);
    assert.equal(record.truncated, true);
    assert.equal(record.raw_payload, "12345");
  } finally {
    if (previous === undefined) delete process.env.MQTT_CAPTURE_MAX_BYTES;
    else process.env.MQTT_CAPTURE_MAX_BYTES = previous;
  }
});
