import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { roles, database } from "../services/mongodb.service.js";
import { PermissionField } from "../utils/constants.js";
import { io } from "../models/backend.js";
import { Mutex } from "async-mutex";

const router = express.Router();
const claimMutex = new Mutex();

router.get( "/", permissionMiddleware(roles, PermissionField.Flags.ViewStatus), async (req, res) => {
    const userEmail = req.user.user;
    const query = req.query;
    if (!query.page) query.page = { size: 50, number: 1 };
    if (!query.page.size) query.page.size = 50;
    if (!query.page.number) query.page.number = 1;
    const page = parseInt(query.page.number);
    const size = Math.min(200, parseInt(query.page.size));
    const currentTime = Date.now();
    const past24Hours = currentTime - 24 * 60 * 60 * 1000;
    try {
      // Get all open groups for the user
      const openGroups = await database.tasks.find({ status: "open", "tasks.assigneeEmail": userEmail, "tasks.time": { $lt: past24Hours } }).toArray();

      // Get the recent 50 groups for the user
      const recentGroupsPipeline = [
        { $match: { "tasks.time": { $lt: past24Hours } } }, // Filter for tasks within the last 24 hours
        { $sort: { "tasks.time": -1 } },
        { $skip: (page - 1) * size },
        { $limit: size },
        { $project: { _id: 0 } },
      ];
      const recentGroups = await database.tasks.aggregate(recentGroupsPipeline).toArray();

      res.status(200).json({
        statusCode: 200,
        statusMessage: "success",
        data: {
          openGroups,
          recentGroups,
        },
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);
export default router;
