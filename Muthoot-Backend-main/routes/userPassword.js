import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { database, roles } from "../services/mongodb.service.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { update } from "../models/authentication.js";

const router = express.Router();

router.post("/", permissionMiddleware(roles), async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res
      .status(401)
      .json({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  try {
    const { user: email } = jwt.verify(token, process.env.JWT_SALT);
    const { password, newPassword } = req.body;
    if (!password || !newPassword) {
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
    const verified = await bcrypt.compare(password, user.password);
    if (!verified) {
      return res.status(400).json({
        statusCode: 400,
        statusMessage: "Bad Request. Invalid Password",
      });
    }
    if (password === newPassword) {
      return res.status(400).json({
        statusCode: 400,
        statusMessage:
          "Bad Request. New password cannot be same as old password",
      });
    }
    user = await update(email, { password: newPassword });
    if (user.statusCode === 200) {
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
