import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { roles } from "../services/mongodb.service.js";
import { PermissionField } from "../utils/constants.js";
import { create } from "../models/authentication.js";

const router = express.Router();

router.post("/", permissionMiddleware(roles, PermissionField.Flags.EditUser), async (req, res) => {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        statusCode: 400,
        statusMessage: "Bad Request. Missing Information",
      });
    }
    if (!Object.values(roles).map(i => i.value).includes(role)) {
      return res.status(400).json({
        statusCode: 400,
        statusMessage: "Bad Request. Invalid Role",
      });
    }
    const user = await create(email, password, name, role);
    if (user.statusCode === 200) {

      database.adminLogs.insertOne({
        userId: req.user.userId,
        userEmail: req.user.user,
        type: "auth",
        message:  `Created user with email ${email} and role ${role}`,
        timestamp: Date.now(),
      });

      return res.status(200).json({
        statusCode: 200,
        statusMessage: "success",
        data: {
          email,
          name,
          role,
          mfa: false,
          hasSetPassword: false,
        },
      });
    } else {
      return res.status(user.statusCode).json({ ...user });
    }
  }
);

export default router;