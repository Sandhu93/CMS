import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { roles, database } from "../services/mongodb.service.js";
import { mqttClient } from "../services/mqtt.service.js";

const router = express.Router();

router.use(permissionMiddleware(roles));

router.get("/:macID/:mode", async (req, res) => {
    try {
      if (!req.params.macID || !req.params.mode) {
        return res
          .status(400)
          .json({ statusCode: 400, statusMessage: "Bad Request" });
      }
      if (!["D", "N"].includes(req.params.mode)) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "Bad Request. Invalid Mode",
        });
      }
      const device = await database.buffer.findOne({
        mac_id: req.params.macID,
      });
      if (!device) {
        return res
          .status(404)
          .json({ statusCode: 404, statusMessage: "Device not found" });
      }
      mqttClient.publish(
        req.params.macID,
        JSON.stringify({ key: "mode", value: req.params.mode })
      );
      database.adminLogs.insertOne({
        userId: req.user.userId,
        userEmail: req.user.user,
        type: "mode",
        message: `Changed mode of ${device.mac_id} (${device.branch?.Code || "Unknown"}) to ${req.params.mode === "D" ? "Day" : "Night"}`,
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