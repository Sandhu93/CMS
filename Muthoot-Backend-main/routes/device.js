import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { roles, database } from "../services/mongodb.service.js";
import { PermissionField } from "../utils/constants.js";
import { isMacDeviceId, normalizeDeviceId } from "../utils/deviceId.js";
import { io } from "../models/backend.js";

const router = express.Router();

const deviceKeys = [
  "Device_ID",
  "Date_of_Installation",
  "Warranty_Period",
  "Hardware_Version",
  "Software_Version",
  "IP_Address",
  "Modem_IP",
  "WIFI_SSID",
  "Password",
  "GSM_Number",
  "Branch_Name",
  "Branch_Code",
  "Zones",
  "Current_Status",
  "Status_Reason",
];

router.get("/:DeviceID", permissionMiddleware(roles), async (req, res) => {
  try {
    const deviceID = normalizeDeviceId(req.params.DeviceID);
    const item = await database.buffer.findOne({
      mac_id: deviceID,
    });
    const result = {
      device: {},
      branch: {},
    };
    if (!item) {
      return res
        .status(404)
        .json({ statusCode: 404, statusMessage: "Device not found" });
    }
    const device = await database.devices.findOne({
      Device_ID: deviceID,
    });
    if (device) {
      result.device = device;
      delete result.device._id;
      const branch = await database.branches.findOne(
        {
          Code: device.Branch_Code,
        },
        {
          projection: {
            _id: 0,
            Code: 1,
            Branch_Name: 1,
          },
        }
      );
      if (branch) {
        result.branch = branch;
      }
    }
    return res
      .status(200)
      .json({ statusCode: 200, statusMessage: "success", data: result });
  } catch (error) {
    return res
      .status(500)
      .json({ statusCode: 500, statusMessage: "Something went wrong." });
  }
});

router.post(
  "/",
  permissionMiddleware(roles, PermissionField.Flags.EditDevice),
  async (req, res) => {
    const data = req.body || {};
    try {
      if (!data.device) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "Bad Request. Missing Information",
        });
      }
      const device = {};
      for (const key of deviceKeys) {
        if (!data.device.hasOwnProperty(key)) {
          return res.status(400).json({
            statusCode: 400,
            statusMessage: "Bad Request. Missing data key - " + key,
          });
        }
        device[key] = data.device[key];
      }

      device.Device_ID = normalizeDeviceId(device.Device_ID);
      if (!isMacDeviceId(device.Device_ID)) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "Bad Request. Invalid Device_ID",
        });
      }

      if(device.Current_Status === 'Active') device.Status_Reason = 'None';
      
      await database.devices.updateOne(
        { Device_ID: device.Device_ID },
        { $set: device },
        { upsert: true }
      );

      const branchCode = device.Branch_Code || null;
      const branchRecord = branchCode
        ? await database.branches.findOne(
            { Code: branchCode },
            {
              projection: {
                _id: 0,
                Branch_Name: 1,
                Code: 1,
                Region: 1,
                Hub: 1,
                Vertical: 1,
              },
            }
          )
        : null;

      // Update by the canonical panel identity. Older buffer documents may not
      // have the nested device.Device_ID field populated yet.
      await database.buffer.updateMany(
        { mac_id: device.Device_ID },
        {
          $set: {
            "device.Branch_Code": branchCode,
            "device.Device_ID": device.Device_ID,
            "device.Current_Status": device.Current_Status || "Active",
            branch: branchRecord || {},
          },
        }
      );

      const updatedBufferItems = await database.buffer
        .find({ mac_id: device.Device_ID })
        .toArray();
      for (const item of updatedBufferItems) {
        io.emit("data", item);
      }

      database.adminLogs.insertOne({
        userId: req.user.userId,
        userEmail: req.user.user,
        type: "devices",
        message: `Updated/Inserted device with ID ${
          device.Device_ID || "Unknown"
        }`,
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

router.delete(
  "/:DeviceID",
  permissionMiddleware(roles, PermissionField.Flags.EditDevice),
  async (req, res) => {
    try {
      const deviceID = normalizeDeviceId(req.params.DeviceID);
      const result = await database.devices.deleteMany({
        Device_ID: deviceID,
      });
      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ statusCode: 404, statusMessage: "Device not found" });
      }

      // Unset the device field from buffer collection
      await database.buffer.updateMany(
        { mac_id: deviceID },
        { $set: { device: {}, branch: {} } }
      );

      database.adminLogs.insertOne({
        userId: req.user.userId,
        userEmail: req.user.user,
        type: "devices",
        message: `Deleted device with ID ${deviceID || "Unknown"}`,
        timestamp: Date.now(),
      });
      return res
        .status(200)
        .json({ statusCode: 200, statusMessage: "success" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

export default router;
