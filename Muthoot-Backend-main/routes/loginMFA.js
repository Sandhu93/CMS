import express from "express";
import { authenticate } from "../models/authentication.js";
import { totp } from "speakeasy";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", async (req, res) => {
  const { username, password, token } = req.body;
  const user = await authenticate(username, password);
  if (user.statusCode === 200) {
    if (!user.data.mfaEnabled) {
      return res.status(400).json({
        statusCode: 400,
        statusMessage: "Bad Request. MFA not enabled for this user.",
      });
    }
    const verified = totp.verify({
      secret: user.data.mfa,
      encoding: "base32",
      token: token,
    });
    delete user.data.mfa;
    if (verified) {
      const token = jwt.sign(
        { user: username, role: user.data.role, userId: user.data.userId },
        process.env.JWT_SALT,
        {
          expiresIn: "7d",
        }
      );
      delete user.data.userId;
      user.data.token = token;
      res
        .status(200)
        .json({ statusCode: 200, statusMessage: "success", user: user.data });
    } else {
      res.status(400).json({
        statusCode: 400,
        statusMessage: "Bad Request. Invalid Token",
      });
    }
  } else {
    res.status(404).json({ ...user });
  }
});

export default router;