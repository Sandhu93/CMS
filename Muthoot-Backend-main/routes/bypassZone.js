import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { roles, database } from "../services/mongodb.service.js";
import { mqttClient } from "../services/mqtt.service.js";
import { normalizeDeviceId } from "../utils/deviceId.js";

const router = express.Router();

router.use(permissionMiddleware(roles));

router.get("/:macID/:zone/:value", async (req, res) => {
    try {
      if (!req.params.macID || !req.params.zone || !req.params.value) {
        return res
          .status(400)
          .json({ statusCode: 400, statusMessage: "Bad Request" });
      }
      const zone = Number(req.params.zone);
      if (!/^\d+$/.test(req.params.zone) || !Number.isInteger(zone) || zone < 1 || zone > 16) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "Bad Request. Invalid Zone",
        });
      }
      if (!["T", "F"].includes(req.params.value)) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "Bad Request. Invalid Value",
        });
      }
      const macID = normalizeDeviceId(req.params.macID);
      const device = await database.buffer.findOne({
        mac_id: macID,
      });
      
      if (!device) {
        return res
          .status(404)
          .json({ statusCode: 404, statusMessage: "Device not found" });
      }
      mqttClient.publish(
        macID,
        JSON.stringify({ key: `Z${zone}_bp`, value: req.params.value === "T" })
      );
      database.adminLogs.insertOne({
        userId: req.user.userId,
        userEmail: req.user.user,
        type: "bypass",
        message: req.params.value === "T" ? `Bypassed ${device.mac_id} (${device.branch?.Code || 'Unknown'})` : `Removed Bypass from ${device.mac_id} (${device.branch?.Code || 'Unknown'})`,
        timestamp: Date.now(),
      });
      return res
        .status(200)
        .json({ statusCode: 200, statusMessage: "success" });
    } catch (error) {
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

export default router;
