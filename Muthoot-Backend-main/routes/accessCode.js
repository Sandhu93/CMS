import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { roles } from "../services/mongodb.service.js";
import { PermissionField } from "../utils/constants.js";

const router = express.Router();

router.get("/:macID", permissionMiddleware(roles, PermissionField.Flags.AccessCode), async (req, res) => {
    try {
      return res.status(200).json({
        statusCode: 200,
        statusMessage: "success",
        data: { code: "thisisatestcodegeneratedasaplaceholder" },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

export default router;