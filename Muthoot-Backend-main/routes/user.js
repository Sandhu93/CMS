import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { roles, database } from "../services/mongodb.service.js";
import jwt from "jsonwebtoken";
import { update } from "../models/authentication.js";

const router = express.Router();

router.get("/", permissionMiddleware(roles), async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res
      .status(401)
      .json({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  try {
    const { user: email } = jwt.verify(token, process.env.JWT_SALT);
    const user = await database.auth.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ statusCode: 404, statusMessage: "User not found" });
    }
    return res.status(200).json({
      statusCode: 200,
      statusMessage: "success",
      data: {
        name: user.name,
        role: roles.find((x) => x.value === user.role).name,
        email: user.email,
        mfaEnabled: user.mfa ? true : false,
        token,
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ statusCode: 401, statusMessage: "Invalid Token" });
  }
});

router.post("/api/user", permissionMiddleware(roles), async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res
      .status(401)
      .json({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  try {
    const { user: email } = jwt.verify(token, process.env.JWT_SALT);
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        statusCode: 400,
        statusMessage: "Bad Request. Missing Information",
      });
    }
    let user = await database.auth.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ statusCode: 404, statusMessage: "User not found" });
    }
    user = await update(email, { name });
    if (user.statusCode === 200) {
      database.adminLogs.insertOne({
        userId: req.user.userId,
        userEmail: req.user.user,
        type: "auth",
        message: `Changed name to ${name}`,
        timestamp: Date.now(),
      });
      return res
        .status(200)
        .json({ statusCode: 200, statusMessage: "success" });
    } else {
      return res.status(user.statusCode).json({ ...user });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ statusCode: 401, statusMessage: "Invalid Token" });
  }
});

export default router;