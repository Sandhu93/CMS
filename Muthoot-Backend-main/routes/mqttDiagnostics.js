import express from "express";
import { readFile } from "node:fs/promises";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { roles } from "../services/mongodb.service.js";
import { PermissionField } from "../utils/constants.js";
import { normalizeDeviceId } from "../utils/deviceId.js";
import { mqttCaptureEnabled } from "../utils/mqttDiagnostics.js";
import { mqttCaptureFilePath } from "../services/mqttDiagnostics.service.js";

const router = express.Router();

router.use(permissionMiddleware(roles, PermissionField.Flags.ViewStatus));

function parseSince(value) {
  if (value === undefined) return new Date(Date.now() - 60 * 60 * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseLimit(value) {
  const limit = Number.parseInt(value ?? "100", 10);
  if (!Number.isFinite(limit)) return 100;
  return Math.min(Math.max(limit, 1), 500);
}

async function readCaptureRecords() {
  try {
    const text = await readFile(mqttCaptureFilePath(), "utf8");
    return text
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .filter((record) => record && record.received_at);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

router.get("/", async (req, res) => {
  const since = parseSince(req.query.since);
  if (!since) {
    return res.status(400).json({
      statusCode: 400,
      statusMessage: "Invalid since timestamp",
    });
  }

  const filter = { received_at: { $gte: since } };
  if (req.query.macID) {
    const macId = normalizeDeviceId(req.query.macID);
    if (!macId) {
      return res.status(400).json({
        statusCode: 400,
        statusMessage: "Invalid macID",
      });
    }
    filter.mac_id = macId;
  }
  if (req.query.topic) filter.topic = String(req.query.topic);

  try {
    const records = await readCaptureRecords();
    const data = records
      .filter((record) => new Date(record.received_at) >= since)
      .filter((record) => !filter.mac_id || record.mac_id === filter.mac_id)
      .filter((record) => !filter.topic || record.topic === filter.topic)
      .sort((a, b) => new Date(b.received_at) - new Date(a.received_at))
      .slice(0, parseLimit(req.query.limit));

    return res.status(200).json({
      statusCode: 200,
      statusMessage: "success",
      diagnostics: {
        captureEnabled: mqttCaptureEnabled(),
        file: mqttCaptureFilePath(),
        since: since.toISOString(),
      },
      data,
    });
  } catch (error) {
    console.error("MQTT diagnostics query failed", error);
    return res.status(500).json({
      statusCode: 500,
      statusMessage: "Unable to query MQTT diagnostics",
    });
  }
});

router.get("/latest", async (req, res) => {
  try {
    const records = await readCaptureRecords();
    const latestByDevice = new Map();
    for (const record of records) {
      if (!record.mac_id) continue;
      const current = latestByDevice.get(record.mac_id);
      if (!current || new Date(record.received_at) > new Date(current.received_at)) {
        latestByDevice.set(record.mac_id, record);
      }
    }
    const data = [...latestByDevice.values()]
      .sort((a, b) => new Date(b.received_at) - new Date(a.received_at))
      .slice(0, parseLimit(req.query.limit));

    return res.status(200).json({
      statusCode: 200,
      statusMessage: "success",
      diagnostics: { captureEnabled: mqttCaptureEnabled(), file: mqttCaptureFilePath() },
      data,
    });
  } catch (error) {
    console.error("MQTT latest diagnostics query failed", error);
    return res.status(500).json({
      statusCode: 500,
      statusMessage: "Unable to query MQTT latest diagnostics",
    });
  }
});

export default router;
