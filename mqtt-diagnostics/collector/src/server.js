import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { initializeDatabase, pool, pruneOldMessages } from "./db.js";
import { mqttStatus, runMqttRoundTrip, startMqtt } from "./mqtt.js";
import { normalizeDeviceId } from "./normalize.js";

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: ["http://localhost:4173", "http://127.0.0.1:4173"] }));
app.use(express.json({ limit: "32kb" }));
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

async function insertRecord(record) {
  await pool.query(
    `INSERT INTO mqtt_messages (
      received_at, topic, packet_qos, packet_retain, payload_bytes, truncated,
      parse_ok, parse_error, mac_id, panel_time_raw, panel_time, clock_delta_seconds,
      net_con, firmware_version, cms_status, op_mode, zone_count, missing_fields,
      zone_values, payload, raw_payload
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19::jsonb,$20::jsonb,$21
    )`,
    [
      record.receivedAt, record.topic, record.qos, record.retain, record.payloadBytes,
      record.truncated, record.parseOk, record.parseError, record.macId,
      record.panelTimeRaw, record.panelTime, record.clockDeltaSeconds,
      record.netCon, record.firmwareVersion, record.cmsStatus, record.opMode,
      record.zoneCount, record.missingFields, JSON.stringify(record.zoneValues),
      record.payload === null ? null : JSON.stringify(record.payload), record.rawPayload,
    ]
  );
  if (record.macId) {
    await pool.query(`
      INSERT INTO diagnostic_devices (
        mac_id, last_received_at, last_live_received_at, last_topic, packet_qos, packet_retain,
        panel_time_raw, panel_time, clock_delta_seconds, net_con, firmware_version,
        cms_status, op_mode, zone_count, missing_fields, zone_values, payload_bytes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,$17)
      ON CONFLICT (mac_id) DO UPDATE SET
        last_received_at = GREATEST(diagnostic_devices.last_received_at, EXCLUDED.last_received_at),
        last_live_received_at = CASE
          WHEN EXCLUDED.last_live_received_at IS NOT NULL AND (
            diagnostic_devices.last_live_received_at IS NULL
            OR diagnostic_devices.last_live_received_at <= EXCLUDED.last_live_received_at
          ) THEN EXCLUDED.last_live_received_at
          ELSE diagnostic_devices.last_live_received_at
        END,
        last_topic = CASE WHEN COALESCE(diagnostic_devices.last_received_at, '-infinity'::timestamptz) <= EXCLUDED.last_received_at THEN EXCLUDED.last_topic ELSE diagnostic_devices.last_topic END,
        packet_qos = CASE WHEN COALESCE(diagnostic_devices.last_received_at, '-infinity'::timestamptz) <= EXCLUDED.last_received_at THEN EXCLUDED.packet_qos ELSE diagnostic_devices.packet_qos END,
        packet_retain = CASE WHEN COALESCE(diagnostic_devices.last_received_at, '-infinity'::timestamptz) <= EXCLUDED.last_received_at THEN EXCLUDED.packet_retain ELSE diagnostic_devices.packet_retain END,
        panel_time_raw = CASE WHEN COALESCE(diagnostic_devices.last_received_at, '-infinity'::timestamptz) <= EXCLUDED.last_received_at THEN EXCLUDED.panel_time_raw ELSE diagnostic_devices.panel_time_raw END,
        panel_time = CASE WHEN COALESCE(diagnostic_devices.last_received_at, '-infinity'::timestamptz) <= EXCLUDED.last_received_at THEN EXCLUDED.panel_time ELSE diagnostic_devices.panel_time END,
        clock_delta_seconds = CASE WHEN COALESCE(diagnostic_devices.last_received_at, '-infinity'::timestamptz) <= EXCLUDED.last_received_at THEN EXCLUDED.clock_delta_seconds ELSE diagnostic_devices.clock_delta_seconds END,
        net_con = CASE WHEN COALESCE(diagnostic_devices.last_received_at, '-infinity'::timestamptz) <= EXCLUDED.last_received_at THEN EXCLUDED.net_con ELSE diagnostic_devices.net_con END,
        firmware_version = CASE WHEN COALESCE(diagnostic_devices.last_received_at, '-infinity'::timestamptz) <= EXCLUDED.last_received_at THEN EXCLUDED.firmware_version ELSE diagnostic_devices.firmware_version END,
        cms_status = CASE WHEN COALESCE(diagnostic_devices.last_received_at, '-infinity'::timestamptz) <= EXCLUDED.last_received_at THEN EXCLUDED.cms_status ELSE diagnostic_devices.cms_status END,
        op_mode = CASE WHEN COALESCE(diagnostic_devices.last_received_at, '-infinity'::timestamptz) <= EXCLUDED.last_received_at THEN EXCLUDED.op_mode ELSE diagnostic_devices.op_mode END,
        zone_count = CASE WHEN COALESCE(diagnostic_devices.last_received_at, '-infinity'::timestamptz) <= EXCLUDED.last_received_at THEN EXCLUDED.zone_count ELSE diagnostic_devices.zone_count END,
        missing_fields = CASE WHEN COALESCE(diagnostic_devices.last_received_at, '-infinity'::timestamptz) <= EXCLUDED.last_received_at THEN EXCLUDED.missing_fields ELSE diagnostic_devices.missing_fields END,
        zone_values = CASE WHEN COALESCE(diagnostic_devices.last_received_at, '-infinity'::timestamptz) <= EXCLUDED.last_received_at THEN EXCLUDED.zone_values ELSE diagnostic_devices.zone_values END,
        payload_bytes = CASE WHEN COALESCE(diagnostic_devices.last_received_at, '-infinity'::timestamptz) <= EXCLUDED.last_received_at THEN EXCLUDED.payload_bytes ELSE diagnostic_devices.payload_bytes END
    `, [
      record.macId, record.receivedAt, record.retain ? null : record.receivedAt,
      record.topic, record.qos, record.retain,
      record.panelTimeRaw, record.panelTime, record.clockDeltaSeconds, record.netCon,
      record.firmwareVersion, record.cmsStatus, record.opMode, record.zoneCount,
      record.missingFields, JSON.stringify(record.zoneValues), record.payloadBytes,
    ]);
  }
}

const freshness = `CASE
  WHEN EXTRACT(EPOCH FROM (NOW() - last_received_at)) <= $1 THEN 'recent'
  WHEN EXTRACT(EPOCH FROM (NOW() - last_received_at)) <= $2 THEN 'delayed'
  ELSE 'offline'
END`;

app.get("/api/health", asyncRoute(async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*)::integer AS messages_1h,
        COUNT(*) FILTER (WHERE NOT parse_ok)::integer AS parse_errors_1h,
        COUNT(DISTINCT mac_id)::integer AS devices_1h,
        MAX(received_at) AS last_received_at
      FROM mqtt_messages WHERE received_at >= NOW() - INTERVAL '1 hour'
    `);
    res.json({
      api: "ok",
      database: "ok",
      mqtt: { ...mqttStatus },
      capture: result.rows[0],
      thresholds: {
        recentSeconds: config.recentSeconds,
        offlineSeconds: config.offlineSeconds,
        retentionDays: config.retentionDays,
      },
    });
  } catch (error) {
    console.error(`Health query failed: ${error.message}`);
    res.status(503).json({ api: "ok", database: "error", error: "Database unavailable", mqtt: mqttStatus });
  }
}));

app.post("/api/roundtrip", asyncRoute(async (req, res) => {
  const qos = req.body?.qos;
  if (qos !== 0 && qos !== 1) {
    return res.status(400).json({ error: "Choose MQTT QoS 0 or 1" });
  }

  try {
    const result = await runMqttRoundTrip(qos);
    if (!result.payloadMatch) {
      return res.status(502).json({ ...result, error: "Broker echo payload did not match the sent payload" });
    }
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "MQTT round-trip failed";
    return res.status(message.includes("connected and subscribed") ? 503 : 502).json({ error: message });
  }
}));

app.get("/api/summary", asyncRoute(async (req, res) => {
  const minutes = Math.min(Math.max(Number.parseInt(req.query.minutes ?? "60", 10) || 60, 1), 1440);
  const result = await pool.query(`
    SELECT COUNT(*)::integer AS message_count,
      COUNT(*) FILTER (WHERE NOT parse_ok)::integer AS parse_errors,
      COUNT(*) FILTER (WHERE panel_time IS NULL AND parse_ok)::integer AS invalid_panel_time,
      COUNT(DISTINCT mac_id)::integer AS unique_devices,
      COUNT(*) FILTER (WHERE net_con = 'wifi')::integer AS wifi_messages,
      COUNT(*) FILTER (WHERE net_con = 'ethernet')::integer AS ethernet_messages,
      COUNT(*) FILTER (WHERE net_con = 'none')::integer AS no_transport_messages,
      COUNT(*) FILTER (WHERE zone_count > 8)::integer AS sixteen_zone_messages,
      COUNT(*) FILTER (WHERE cardinality(missing_fields) > 0)::integer AS messages_missing_fields
    FROM mqtt_messages
    WHERE received_at >= NOW() - ($1 * INTERVAL '1 minute')
  `, [minutes]);
  const chart = await pool.query(`
    SELECT date_trunc('minute', received_at) -
        (EXTRACT(MINUTE FROM received_at)::integer % 5) * INTERVAL '1 minute' AS bucket,
      COUNT(*)::integer AS count,
      COUNT(DISTINCT mac_id)::integer AS devices
    FROM mqtt_messages
    WHERE received_at >= NOW() - ($1 * INTERVAL '1 minute')
    GROUP BY bucket ORDER BY bucket
  `, [minutes]);
  res.json({ minutes, totals: result.rows[0], traffic: chart.rows });
}));

app.get("/api/devices", asyncRoute(async (req, res) => {
  const search = String(req.query.search ?? "").trim().slice(0, 64);
  const status = String(req.query.status ?? "all");
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit ?? "500", 10) || 500, 1), 2000);
  const result = await pool.query(`
    WITH status_rows AS (
      SELECT mac_id, last_received_at, last_live_received_at, last_topic AS topic, packet_qos, packet_retain,
        panel_time_raw, panel_time, clock_delta_seconds, net_con, firmware_version,
        cms_status, op_mode, zone_count, missing_fields, zone_values, payload_bytes,
        watched, label,
        CASE
          WHEN last_live_received_at IS NULL AND last_received_at IS NOT NULL THEN 'retained_only'
          WHEN last_live_received_at IS NULL THEN 'never_seen'
          ELSE ${freshness.replaceAll("last_received_at", "last_live_received_at")}
        END AS receive_status,
        EXTRACT(EPOCH FROM (NOW() - last_live_received_at))::integer AS age_seconds
      FROM diagnostic_devices
    )
    SELECT * FROM status_rows
    WHERE ($3 = '' OR mac_id ILIKE '%' || $3 || '%')
      AND ($4 = 'all' OR receive_status = $4)
    ORDER BY last_live_received_at DESC NULLS LAST, last_received_at DESC NULLS LAST LIMIT $5
  `, [config.recentSeconds, config.offlineSeconds, search, status, limit]);
  res.json({ data: result.rows, thresholds: { recentSeconds: config.recentSeconds, offlineSeconds: config.offlineSeconds } });
}));

app.get("/api/watchlist", asyncRoute(async (_req, res) => {
  const result = await pool.query("SELECT mac_id, label, added_at FROM diagnostic_devices WHERE watched ORDER BY added_at DESC");
  res.json({ data: result.rows });
}));

app.post("/api/watchlist", asyncRoute(async (req, res) => {
  const macId = normalizeDeviceId(req.body?.macId);
  const label = String(req.body?.label ?? "").trim().slice(0, 80);
  if (!macId) return res.status(400).json({ error: "Enter a valid MAC ID (colon or compact format)" });
  const result = await pool.query(`
    INSERT INTO diagnostic_devices (mac_id, label, watched) VALUES ($1, $2, TRUE)
    ON CONFLICT (mac_id) DO UPDATE SET label = EXCLUDED.label, watched = TRUE
    RETURNING mac_id, label, added_at
  `, [macId, label]);
  res.status(201).json({ data: result.rows[0] });
}));

app.delete("/api/watchlist/:macId", asyncRoute(async (req, res) => {
  const macId = normalizeDeviceId(req.params.macId);
  if (!macId) return res.status(400).json({ error: "Invalid MAC ID" });
  await pool.query(`
    WITH removed AS (
      DELETE FROM diagnostic_devices WHERE mac_id = $1 AND last_received_at IS NULL
      RETURNING mac_id
    )
    UPDATE diagnostic_devices SET watched = FALSE
    WHERE mac_id = $1 AND NOT EXISTS (SELECT 1 FROM removed)
  `, [macId]);
  res.status(204).end();
}));

app.get("/api/messages", asyncRoute(async (req, res) => {
  const macId = String(req.query.macId ?? "").trim().toUpperCase().slice(0, 32);
  const topic = String(req.query.topic ?? "").trim().slice(0, 256);
  const parse = String(req.query.parse ?? "all");
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit ?? "100", 10) || 100, 1), 500);
  const result = await pool.query(`
    SELECT id, received_at, topic, packet_qos, packet_retain, payload_bytes,
      truncated, parse_ok, parse_error, mac_id, panel_time_raw, panel_time,
      clock_delta_seconds, net_con, firmware_version, cms_status, op_mode,
      zone_count, missing_fields, zone_values, payload, raw_payload
    FROM mqtt_messages
    WHERE ($1 = '' OR mac_id = $1)
      AND ($2 = '' OR topic = $2)
      AND ($3 = 'all' OR parse_ok = ($3 = 'valid'))
    ORDER BY received_at DESC LIMIT $4
  `, [macId, topic, parse, limit]);
  res.json({ data: result.rows });
}));

app.get("/api/devices/:macId/intervals", asyncRoute(async (req, res) => {
  const macId = String(req.params.macId ?? "").trim().toUpperCase().slice(0, 32);
  const result = await pool.query(`
    WITH recent AS (
      SELECT received_at,
        EXTRACT(EPOCH FROM received_at - LAG(received_at) OVER (ORDER BY received_at)) AS gap_seconds
      FROM mqtt_messages
      WHERE mac_id = $1 AND packet_retain = FALSE
        AND received_at >= NOW() - INTERVAL '7 days'
    )
    SELECT COUNT(gap_seconds)::integer AS intervals,
      ROUND(AVG(gap_seconds)::numeric, 1) AS average_seconds,
      ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY gap_seconds)::numeric, 1) AS median_seconds,
      ROUND(percentile_cont(0.95) WITHIN GROUP (ORDER BY gap_seconds)::numeric, 1) AS p95_seconds,
      ROUND(MAX(gap_seconds)::numeric, 1) AS max_seconds
    FROM recent
  `, [macId]);
  res.json({ macId, ...result.rows[0] });
}));

app.get("/api", (_req, res) => res.json({ service: "Watchguardian MQTT diagnostics API" }));
app.use((error, _req, res, _next) => {
  console.error(`API request failed: ${error.message}`);
  res.status(500).json({ error: "Request failed" });
});

await initializeDatabase();
await pruneOldMessages();
setInterval(() => {
  void pruneOldMessages().catch((error) => console.error(`Retention cleanup failed: ${error.message}`));
}, 60 * 60 * 1000).unref();

const mqttClient = startMqtt(insertRecord);
const server = app.listen(config.port, "0.0.0.0", () => {
  console.info(`Diagnostics API listening on ${config.port}`);
});

async function shutdown(signal) {
  console.info(`Shutting down on ${signal}`);
  server.close();
  mqttClient.end(true);
  await pool.end();
  process.exit(0);
}
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
