import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { roles, database } from "../services/mongodb.service.js";
import { PermissionField } from "../utils/constants.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/", permissionMiddleware(roles, PermissionField.Flags.ViewUsers), async (req, res) => {
    try {
      const users = await database.auth.find().toArray();
      for (let i = 0; i < users.length; i++) {
        delete users[i].password;
        users[i].mfa = users[i].mfa ? true : false;
      }
      return res
        .status(200)
        .json({ statusCode: 200, statusMessage: "success", data: users });
    } catch (error) {
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

router.patch("/", permissionMiddleware(roles, PermissionField.Flags.EditUser), async (req, res) => {
    const { email, name, role } = req.body;
    if (!email || (!name && !role)) {
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
    const user = await database.auth.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ statusCode: 404, statusMessage: "User not found" });
    }
    const updateFields = {};
    if (name) updateFields.name = name;
    if (role) updateFields.role = role;
    await database.auth.updateOne({ email }, { $set: updateFields });
    return res.status(200).json({
      statusCode: 200,
      statusMessage: "success",
      data: { email, name, role, mfa: Boolean(user.mfa) },
    });
  }
);

router.delete("/", permissionMiddleware(roles, PermissionField.Flags.EditUser), async (req, res) => {
    const token = req.headers.authorization;
    try {
      const { user: ogEmail } = jwt.verify(token, process.env.JWT_SALT);
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "Bad Request. Missing Information",
        });
      }
      if (ogEmail === email) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "Bad Request. You cannot delete yourself.",
        });
      }
      const user = await database.auth.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ statusCode: 404, statusMessage: "User not found" });
      }
      await database.auth.deleteOne({ email });
      
      database.adminLogs.insertOne({
        userId: req.user.userId,
        userEmail: req.user.user,
        type: "auth",
        message: `Deleted user with email ${email}`,
        timestamp: Date.now(),
      });

      return res
        .status(200)
        .json({ statusCode: 200, statusMessage: "success", data: email });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

export default router;