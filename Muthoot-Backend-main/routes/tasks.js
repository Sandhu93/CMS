import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { roles, database } from "../services/mongodb.service.js";
import { PermissionField } from "../utils/constants.js";
import { io } from "../models/backend.js";
import { Mutex } from "async-mutex";

const router = express.Router();
const claimMutex = new Mutex();

router.get(
  "/",
  permissionMiddleware(roles, PermissionField.Flags.ViewStatus),
  async (req, res) => {
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
      const openGroups = await database.tasks
        .find({
          status: "open",
          "tasks.assigneeEmail": userEmail,
          "tasks.time": { $gte: past24Hours },
        })
        .toArray();

      // Get the recent 50 groups for the user
      const recentGroupsPipeline = [
        { $match: { "tasks.time": { $gte: past24Hours } } }, // Filter for tasks within the last 24 hours
        { $sort: { "tasks.time": -1 } },
        { $skip: (page - 1) * size },
        { $limit: size },
        { $project: { _id: 0 } },
      ];
      const recentGroups = await database.tasks
        .aggregate(recentGroupsPipeline)
        .toArray();

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

router.post(
  "/claim/:taskSlNo",
  permissionMiddleware(roles, PermissionField.Flags.ViewStatus),
  async (req, res) => {
    const release = await claimMutex.acquire();
    const userEmail = req.user.user;
    const taskSlNo = parseInt(req.params.taskSlNo);
    const note = req.body.note;
    try {
      if (!note) {
        return res
          .status(400)
          .json({ statusCode: 400, statusMessage: "Note is required." });
      }

      if (note.length > 2000) {
        return res
          .status(400)
          .json({ statusCode: 400, statusMessage: "Note length is too long." });
      }

      const user = await database.auth.findOne({ email: userEmail });
      if (!user) {
        return res
          .status(404)
          .json({ statusCode: 404, statusMessage: "User not found" });
      }
      // Find the group containing the task
      const group = await database.tasks.findOne({ "tasks.slNo": taskSlNo });
      if (!group) {
        return res
          .status(404)
          .json({ statusCode: 404, statusMessage: "Task not found." });
      }

      // Check if the task is already claimed
      if (group.tasks.find((task) => task.slNo === taskSlNo).assignee) {
        return res
          .status(400)
          .json({ statusCode: 400, statusMessage: "Task already claimed." });
      }

      await database.tasks.updateOne(
        { "tasks.slNo": taskSlNo },
        {
          $set: {
            "tasks.$.assignee": user.name,
            "tasks.$.assigneeEmail": userEmail,
            "tasks.$.status": "inprogress",
            "tasks.$.note": note,
          },
        }
      );
      let task = group.tasks.find((task) => task.slNo === taskSlNo);
      task.assignee = user.name;
      task.assigneeEmail = userEmail;
      task.status = "inprogress";
      task.note = note;
      // set the task to group
      group.tasks = group.tasks.map((t) => (t.slNo === taskSlNo ? task : t));
      io.emit("taskClaim", group, taskSlNo, user.name, note);

      database.adminLogs.insertOne({
        userId: req.user.userId,
        userEmail: req.user.user,
        type: "task",
        message: `Claimed task with slNo ${taskSlNo}`,
        timestamp: Date.now(),
      });

      res.status(200).json({
        statusCode: 200,
        statusMessage: "Task claimed successfully.",
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    } finally {
      release();
    }
  }
);

router.post(
  "/close/:taskSlNo",
  permissionMiddleware(roles, PermissionField.Flags.ViewStatus),
  async (req, res) => {
    const taskSlNo = parseInt(req.params.taskSlNo);
    const userEmail = req.user.user;
    try {
      // Find the group containing the task
      const group = await database.tasks.findOne({ "tasks.slNo": taskSlNo });
      if (!group) {
        return res
          .status(404)
          .json({ statusCode: 404, statusMessage: "Task not found." });
      }

      let task = group.tasks.find((task) => task.slNo === taskSlNo);
      // Check if the task is claimed
      if (!task.assigneeEmail) {
        return res
          .status(400)
          .json({ statusCode: 400, statusMessage: "Task not claimed." });
      }
      // Check if the user is the assignee
      if (task.assigneeEmail !== userEmail) {
        return res
          .status(403)
          .json({ statusCode: 403, statusMessage: "Forbidden." });
      }

      // Check if the task is already closed
      if (task.status === "closed") {
        return res
          .status(400)
          .json({ statusCode: 400, statusMessage: "Task already closed." });
      }

      await database.tasks.updateOne(
        { "tasks.slNo": taskSlNo },
        { $set: { "tasks.$.status": "closed" } }
      );
      task.status = "closed";
      // set the task to group
      group.tasks = group.tasks.map((t) => (t.slNo === taskSlNo ? task : t));
      io.emit("taskClose", group, taskSlNo);

      database.adminLogs.insertOne({
        userId: req.user.userId,
        userEmail: req.user.user,
        type: "task",
        message: `Closed task with slNo ${taskSlNo}`,
        timestamp: Date.now(),
      });

      res.status(200).json({
        statusCode: 200,
        statusMessage: "Task closed successfully.",
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

// router.get("/:macID", permissionMiddleware(roles, PermissionField.Flags.ViewStatusDetailed), async (req, res) => {
//     try {
//       const item = await database.buffer.findOne({
//         mac_id: req.params.macID,
//       });
//       item.device = {};
//       item.branch = {};
//       if (!item) {
//         return res
//           .status(404)
//           .json({ statusCode: 404, statusMessage: "Device not found" });
//       }
//       const device = await database.devices.findOne({
//         Device_ID: req.params.macID,
//       });
//       if (device) {
//         item.device = device;
//         delete item.device._id;
//         const branch = await database.branches.findOne({
//           Code: device.Branch_Code,
//         });
//         if (branch) {
//           item.branch = branch;
//           delete item.branch._id;
//         }
//       }
//       return res
//         .status(200)
//         .json({ statusCode: 200, statusMessage: "success", data: item });
//     } catch (error) {
//       return res
//         .status(500)
//         .json({ statusCode: 500, statusMessage: "Something went wrong." });
//     }
//   }
// );

export default router;
