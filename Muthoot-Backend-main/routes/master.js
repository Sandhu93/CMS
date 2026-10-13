import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { database, roles } from "../services/mongodb.service.js";
import { PermissionField } from "../utils/constants.js";

const router = express.Router();

router.get(
  "/",
  permissionMiddleware(roles, PermissionField.Flags.EditDevice),
  async (req, res) => {
    try {
      let devices;
      if (!req.query.noDevice)
        devices = await database.devices
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
          .toArray();
      let branches = await database.branches
        .find(
          {},
          {
            projection: {
              _id: 0,
              Branch_Name: 1,
              Code: 1,
              Region: 1,
              Hub: 1,
              Current_Status: 1,
            },
          }
        )
        .sort({ Branch_Name: 1 })
        .toArray();
      return res.status(200).json({
        statusCode: 200,
        statusMessage: "success",
        data: { devices, branches },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

export default router;
