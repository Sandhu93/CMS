import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { roles } from "../services/mongodb.service.js";

const router = express.Router();

router.get("/:macID", permissionMiddleware(roles), async (req, res) => {
  try {
    return res.status(200).json({
      statusCode: 200,
      statusMessage: "success",
      data: { password: "12345678" },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ statusCode: 500, statusMessage: "Something went wrong." });
  }
});

export default router;