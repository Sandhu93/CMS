import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { database, roles } from "../services/mongodb.service.js";
import moment from "moment";

const router = express.Router();

router.get("/", permissionMiddleware(roles), async (req, res) => {
  const stats = await database.stats.findOne({ name: "offlineChart" });
  // Create an array of the last 30 days
  const oldDate = moment().subtract(30, "days");
  const days = Array.from({ length: 30 }, (v, i) =>
    oldDate.add(1, "days").startOf("day").toDate()
  );

  const data = days.map((day) => {
    // Find the corresponding entry in the stats.data array
    const entry = stats.data.find((x) => {
      const entryDate = new Date(x.day);
      return (
        entryDate.getFullYear() === day.getFullYear() &&
        entryDate.getMonth() === day.getMonth() &&
        entryDate.getDate() === day.getDate()
      );
    });

    if (entry) {
      // Count the number of unique mac_id's
      const uniqueMacIds = [...new Set(entry.devices)];
      return {
        day,
        count: uniqueMacIds.length,
      };
    } else {
      return {
        day,
        count: 0,
      };
    }
  });
  return res.status(200).json({
    statusCode: 200,
    statusMessage: "success",
    data,
  });
});

export default router;