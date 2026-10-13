import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { roles } from "../services/mongodb.service.js";
import { totp, generateSecret } from "speakeasy";
import qrcode from "qrcode";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/", permissionMiddleware(roles), async (req, res) => {
  // Generate a new MFA secret
  const secret = generateSecret();

  // Generate a QR code URL
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
  // Return the secret and the QR code URL
  res.json({
    statusCode: 200,
    statusMessage: "success",
    data: { secret: secret.base32, qrCodeUrl },
  });
});

router.post("/", permissionMiddleware(roles), async (req, res) => {
  // Get the secret and token from the request body
  const { secret, token } = req.body;

  // Verify the token
  const verified = totp.verify({
    secret: secret,
    encoding: "base32",
    token: token,
  });

  if (verified) {
    const verifyToken = req.headers.authorization;
    if (!verifyToken) {
      return res
        .status(401)
        .json({ statusCode: 401, statusMessage: "Unauthorized" });
    }
    try {
      const { user: email } = jwt.verify(verifyToken, process.env.JWT_SALT);
      // If the token is valid, store the secret in user.mfa
      await database.auth.updateOne({ email }, { $set: { mfa: secret } });
      // Return the backup codes
      res.json({ statusCode: 200, statusMessage: "success" });
    } catch (error) {
      console.log(error);
      return res
        .status(401)
        .json({ statusCode: 401, statusMessage: "Invalid Token" });
    }
  } else {
    // If the token is not valid, return an error
    res.json({ statusCode: 400, statusMessage: "Invalid Token" });
  }
});

export default router;