import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;
export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 8,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS mqtt_messages (
      id BIGSERIAL PRIMARY KEY,
      received_at TIMESTAMPTZ NOT NULL,
      topic TEXT NOT NULL,
      packet_qos SMALLINT NOT NULL DEFAULT 0,
      packet_retain BOOLEAN NOT NULL DEFAULT FALSE,
      payload_bytes INTEGER NOT NULL,
      truncated BOOLEAN NOT NULL DEFAULT FALSE,
      parse_ok BOOLEAN NOT NULL,
      parse_error TEXT,
      mac_id TEXT,
      panel_time_raw TEXT,
      panel_time TIMESTAMPTZ,
      clock_delta_seconds DOUBLE PRECISION,
      net_con TEXT,
      firmware_version TEXT,
      cms_status TEXT,
      op_mode TEXT,
      zone_count SMALLINT NOT NULL DEFAULT 0,
      missing_fields TEXT[] NOT NULL DEFAULT '{}',
      zone_values JSONB NOT NULL DEFAULT '{}',
      payload JSONB,
      raw_payload TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS diagnostic_devices (
      mac_id TEXT PRIMARY KEY,
      label TEXT NOT NULL DEFAULT '',
      added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      watched BOOLEAN NOT NULL DEFAULT FALSE,
      last_received_at TIMESTAMPTZ,
      last_live_received_at TIMESTAMPTZ,
      last_topic TEXT,
      packet_qos SMALLINT,
      packet_retain BOOLEAN,
      panel_time_raw TEXT,
      panel_time TIMESTAMPTZ,
      clock_delta_seconds DOUBLE PRECISION,
      net_con TEXT,
      firmware_version TEXT,
      cms_status TEXT,
      op_mode TEXT,
      zone_count SMALLINT NOT NULL DEFAULT 0,
      missing_fields TEXT[] NOT NULL DEFAULT '{}',
      zone_values JSONB NOT NULL DEFAULT '{}',
      payload_bytes INTEGER
    );
    ALTER TABLE diagnostic_devices ADD COLUMN IF NOT EXISTS watched BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE diagnostic_devices ADD COLUMN IF NOT EXISTS last_received_at TIMESTAMPTZ;
    ALTER TABLE diagnostic_devices ADD COLUMN IF NOT EXISTS last_live_received_at TIMESTAMPTZ;
    ALTER TABLE diagnostic_devices ADD COLUMN IF NOT EXISTS last_topic TEXT;
    ALTER TABLE diagnostic_devices ADD COLUMN IF NOT EXISTS packet_qos SMALLINT;
    ALTER TABLE diagnostic_devices ADD COLUMN IF NOT EXISTS packet_retain BOOLEAN;
    ALTER TABLE diagnostic_devices ADD COLUMN IF NOT EXISTS panel_time_raw TEXT;
    ALTER TABLE diagnostic_devices ADD COLUMN IF NOT EXISTS panel_time TIMESTAMPTZ;
    ALTER TABLE diagnostic_devices ADD COLUMN IF NOT EXISTS clock_delta_seconds DOUBLE PRECISION;
    ALTER TABLE diagnostic_devices ADD COLUMN IF NOT EXISTS net_con TEXT;
    ALTER TABLE diagnostic_devices ADD COLUMN IF NOT EXISTS firmware_version TEXT;
    ALTER TABLE diagnostic_devices ADD COLUMN IF NOT EXISTS cms_status TEXT;
    ALTER TABLE diagnostic_devices ADD COLUMN IF NOT EXISTS op_mode TEXT;
    ALTER TABLE diagnostic_devices ADD COLUMN IF NOT EXISTS zone_count SMALLINT NOT NULL DEFAULT 0;
    ALTER TABLE diagnostic_devices ADD COLUMN IF NOT EXISTS missing_fields TEXT[] NOT NULL DEFAULT '{}';
    ALTER TABLE diagnostic_devices ADD COLUMN IF NOT EXISTS zone_values JSONB NOT NULL DEFAULT '{}';
    ALTER TABLE diagnostic_devices ADD COLUMN IF NOT EXISTS payload_bytes INTEGER;
    CREATE INDEX IF NOT EXISTS mqtt_messages_received_idx
      ON mqtt_messages (received_at DESC);
    CREATE INDEX IF NOT EXISTS mqtt_messages_mac_received_idx
      ON mqtt_messages (mac_id, received_at DESC);
    CREATE INDEX IF NOT EXISTS mqtt_messages_topic_received_idx
      ON mqtt_messages (topic, received_at DESC);
  `);
}

export async function pruneOldMessages() {
  await pool.query(
    "DELETE FROM mqtt_messages WHERE received_at < NOW() - ($1 * INTERVAL '1 day')",
    [config.retentionDays]
  );
}
