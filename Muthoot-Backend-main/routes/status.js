import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { roles, database } from "../services/mongodb.service.js";
import { PermissionField } from "../utils/constants.js";

const router = express.Router();

router.get("/", permissionMiddleware(roles, PermissionField.Flags.ViewStatus), async (req, res) => {
    const showUnregistered = req.query.raw;
    try {
      const items = await database.buffer.find( { "device.Current_Status": { $ne: "Inactive" } }).toArray();
      // const devices = await database.devices.find(
      //     {},
      //     {
      //       projection: {
      //         _id: 0,
      //         Device_ID: 1,
      //         Branch_Code: 1,
      //       },
      //     }
      //   )
      //   .toArray();
      // const branches = await database.branches.find(
      //     {},
      //     {
      //       projection: {
      //         _id: 0,
      //         Code: 1,
      //         Branch_Name: 1,
      //         Region: 1,
      //         Hub: 1,
      //         Vertical: 1,
      //       },
      //     }
      //   ).toArray();
      // for (let i = 0; i < items.length; i++) {
      //   const item = items[i];
      //   const device = devices.find(
      //     (device) => device.Device_ID === item.mac_id
      //   );
      //   if (!device) {
      //     item.device = {};
      //     item.branch = null;
      //     continue;
      //   }
      //   item.device = device;
      //   // item.device.Password = device.Password.replace(/./g, "*");
      //   const branch = branches.find(
      //     (branch) => branch.Code === device.Branch_Code
      //   );
      //   item.branch = branch || null;
      // }
      res
        .status(200)
        .json({ statusCode: 200, statusMessage: "success", data: ( showUnregistered ? items.filter(item => !item.branch?.Code) : items.filter(item => item.branch?.Code) ) });
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
      const item = await database.buffer.findOne({
        mac_id: req.params.macID,
      });
      item.device = {};
      item.branch = {};
      if (!item) {
        return res
          .status(404)
          .json({ statusCode: 404, statusMessage: "Device not found" });
      }
      const device = await database.devices.findOne({
        Device_ID: req.params.macID,
      });
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