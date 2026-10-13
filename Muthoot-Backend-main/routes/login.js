import express from "express";
import { authenticate } from "../models/authentication.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { username, password } = req.body;
    const user = await authenticate(username, password);
    if (user.statusCode === 200) {
      if (user.data.hasSetPassword === false) {
        return res.status(200).json({
          statusMessage: "setPassword",
          user: user.data,
        });
      }
      if (user.data.mfaEnabled) {
        return res
          .status(200)
          .json({ statusCode: 200, statusMessage: "success", mfa: true });
      }
      delete user.data.mfa;
      delete user.data.userId;
      res
        .status(200)
        .json({ statusCode: 200, statusMessage: "success", user: user.data });
    } else {
      res.status(404).json({ ...user });
    }
});

export default router;