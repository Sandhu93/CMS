# MQTT Diagnostics

The backend now records MQTT messages at the point they arrive from the broker. This is diagnostic telemetry only; it does not change panel state handling, notifications, or offline decisions.

Each captured record contains:

- `received_at`: backend server time when the MQTT message arrived.
- `topic`: MQTT topic received by the backend.
- `mac_id`: normalized colon-format device ID when JSON parsing succeeds.
- `bytes`: original payload size.
- `parse_ok` and `parse_error`: whether the payload was valid JSON.
- `fields`: JSON field names present in the message.
- `raw_payload`: the received JSON/text payload, limited by `MQTT_CAPTURE_MAX_BYTES`.

Records are written locally as newline-delimited JSON to `MQTT_CAPTURE_FILE` (default: `logs/mqtt-ingress.ndjson`). The latest receipt per device is calculated from that file. This diagnostic journal does not write to MongoDB. Delete or archive the file periodically if it becomes large.

## API

The endpoints require the same authorization token and `ViewStatus` permission as the status page.

Recent messages from all devices, defaulting to the last hour:

```text
GET /api/mqttDiagnostics?limit=100
```

Messages for one device:

```text
GET /api/mqttDiagnostics?macID=BA:06:F2:D8:33:0D&since=2026-09-22T00:00:00Z&limit=100
```

Latest receipt per device:

```text
GET /api/mqttDiagnostics/latest?limit=500
```

## Interpretation

- No `mqttIngress` record for the expected period: the backend did not receive a message. Investigate panel connectivity, broker delivery, topic, credentials, or the backend MQTT connection.
- A record exists with `parse_ok=false`: the broker delivered data, but the payload is malformed or not JSON.
- A valid recent record exists but the dashboard remains offline: inspect backend processing, MongoDB buffer updates, or the offline status logic.
- `received_at` is recent but the panel `Date_time` is old: the panel is publishing, but its RTC or timestamp generation is stale.
- `mqttLatest.last_received_at` is recent while the UI is stale: investigate dashboard API/socket updates rather than the panel or broker.

The current offline cron still uses the panel-reported `Date_time`; this diagnostic change deliberately does not alter that behavior. It gives us evidence first, so the offline rule can be corrected separately without hiding a real device failure.
