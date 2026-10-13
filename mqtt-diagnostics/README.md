# Watchguardian MQTT Diagnostics

An isolated, local-only dashboard for determining whether panel messages reach the MQTT broker and diagnostic subscriber, whether payloads are valid, and whether the existing dashboard's offline result disagrees with actual MQTT receipt time.

This project stores diagnostics in its own PostgreSQL volume. It does not connect to MongoDB and does not publish commands. Compose binds the dashboard, API, and database ports to `127.0.0.1` only.

## Start

1. Copy `.env.example` to `.env`.
2. Set `MQTT_URL`, `MQTT_USERNAME`, and `MQTT_PASSWORD` to the broker values. Keep the diagnostic client ID unique; leave `MQTT_CLIENT_ID` blank to have the collector generate one. Keep credentials in `.env`, never commit it, and quote values containing spaces or `#`.
3. Start Docker Desktop, then run from this directory:

```powershell
docker compose up -d --build
```

Open <http://localhost:4173>. The API is at <http://localhost:5003/api/health>.

The collector subscribes to `sensor` by default. A new subscriber does not increase the QoS used by the publisher; the received packet's actual QoS and retained flag are recorded.

The dashboard also has a manual MQTT round-trip check. It publishes a unique payload to `MQTT_ROUNDTRIP_TOPIC/<test-id>` (default `watchguardian/diagnostics/roundtrip/<test-id>`), subscribes to that exact topic, and verifies the echoed bytes. The payload has no `mac_id`, is filtered out of telemetry storage, and never uses `sensor`; it therefore cannot create a fake panel in this collector or the production dashboard. The selected QoS 1 test reports broker PUBACK plus the subscriber echo. PUBACK confirms broker acceptance, not downstream database processing. QoS 0 has no PUBACK. The broker ACL must permit the collector's client to publish and subscribe to this diagnostics namespace. The configured round-trip topic is rejected at startup if it overlaps the telemetry subscription filter.

This is a broker-to-collector loopback test, not a production-panel payload test and not an end-to-end test of the production dashboard/backend. To test the backend's full ingestion path, use an isolated broker and isolated backend/database rather than publishing a synthetic device on production `sensor`.

To start from the workspace root after configuring `.env`, run `scripts\start-mqtt-diagnostics.ps1`.

## Stop and data

```powershell
docker compose down
```

This stops the containers and preserves the named PostgreSQL volume. Do not add `-v` unless you intend to erase the diagnostic capture. To inspect container status and logs:

```powershell
docker compose ps
docker compose logs -f collector
```

The API, UI, and PostgreSQL host port can be changed in `.env`. The UI/API/database are local-only; do not change their bindings to `0.0.0.0` for this diagnostic run.

## What is captured

- Server receipt time in UTC, topic, QoS, retained flag, byte size, parse result, and normalized MAC address.
- Panel-reported timestamp and its difference from backend receipt time. Timestamps without a timezone are interpreted as India Standard Time; malformed and unavailable RTC values remain invalid.
- Network type, firmware version, panel status, mode, zone fields present, and required fields missing.
- Redacted payload JSON. Keys matching password, secret, token, credential, private key, or API key are replaced before persistence. Malformed text payloads are stored up to the configured payload limit.
- A local watchlist. Add known colon-format or compact MAC IDs on the Devices view; watched devices with no message are shown as never seen.
- Per-device last live receipt is preserved independently of retained-message deliveries and message-body cleanup. A retained packet is not treated as proof of a currently active panel.

Records older than `CAPTURE_RETENTION_DAYS` are deleted hourly. Defaults are 14 days, 16 KiB per payload, a 5-minute recent threshold, and a 15-minute offline threshold. The dashboard always shows receipt age separately from panel clock difference; its receipt-state thresholds are diagnostic settings, not production alarm policy.

## Reading the result

- Recent message in this dashboard: broker delivered the publish to this collector. If the current dashboard still calls the panel offline, investigate its state processing, freshness rule, database update, or frontend.
- No recent message here: the collector did not receive one. Panel logs and Mosquitto broker logs are then needed to separate device/network publishing from broker acceptance or subscription delivery.
- Retained-only device: the broker delivered a stored message on subscription, but this collector has not observed a live non-retained publish from the device.
- Recent collector receipt with a large panel-clock difference: MQTT is arriving; the panel RTC or timestamp formatting is wrong.
- Parse error or missing fields: inspect firmware payload construction and version compatibility.
- Repeated connection status changes: inspect broker availability, ACLs, credentials, network, and the collector's separate MQTT client ID.

An additional subscriber only observes messages delivered to its own subscription. It does not prove that a panel attempted a publish when no message arrives. For that, compare panel serial publish results with broker-side logs.
