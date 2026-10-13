import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { roles, database } from "../services/mongodb.service.js";
import { PermissionField } from "../utils/constants.js";
import { normalizeDeviceId } from "../utils/deviceId.js";
import { buildStatusList } from "../utils/statusVisibility.js";

const router = express.Router();

router.get("/", permissionMiddleware(roles, PermissionField.Flags.ViewStatus), async (req, res) => {
    const showUnregistered = req.query.raw;
    try {
      const [items, devices, branches] = await Promise.all([
        database.buffer.find().toArray(),
        database.devices
          .find(
            {},
            {
              projection: {
                _id: 0,
                Device_ID: 1,
                Branch_Code: 1,
                Current_Status: 1,
              },
            }
          )
          .toArray(),
        database.branches
          .find(
            {},
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
          .toArray(),
      ]);
      const visibleItems = buildStatusList(items, devices, branches, Boolean(showUnregistered));
      res
        .status(200)
        .json({ statusCode: 200, statusMessage: "success", data: visibleItems });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

router.get("/:macID", permissionMiddleware(roles, PermissionField.Flags.ViewStatusDetailed), async (req, res) => {
    try {
      const macID = normalizeDeviceId(req.params.macID);
      const item = await database.buffer.findOne({ mac_id: macID });
      if (!item) {
        return res
          .status(404)
          .json({ statusCode: 404, statusMessage: "Device not found" });
      }
      const registeredDevice = await database.devices.findOne({
        Device_ID: macID,
      });
      if (registeredDevice?.Current_Status === "Inactive") {
        return res
          .status(404)
          .json({ statusCode: 404, statusMessage: "Device is inactive" });
      }
      item.device = {};
      item.branch = {};
      const device = registeredDevice;
      if (device) {
        item.device = device;
        delete item.device._id;
        const branch = await database.branches.findOne({
          Code: device.Branch_Code,
        });
        if (branch) {
          item.branch = branch;
          delete item.branch._id;
        }
      }
      return res
        .status(200)
        .json({ statusCode: 200, statusMessage: "success", data: item });
    } catch (error) {
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

export default router;
