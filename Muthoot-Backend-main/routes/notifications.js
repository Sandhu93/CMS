import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { database, roles } from "../services/mongodb.service.js";

const router = express.Router();

router.get("/", permissionMiddleware(roles), async (req, res) => {
  const query = req.query;
  if (!query.page) query.page = { size: 50, number: 1 };
  if (!query.page.size) query.page.size = 50;
  if (!query.page.number) query.page.number = 1;
  if (!query.filter) query.filter = {};
  const page = parseInt(query.page.number);
  const size = Math.min(200, parseInt(query.page.size));
  try {
    const pipeline = [
      {
        $sort: { _id: -1 },
      },
      {
        $skip: (page - 1) * size,
      },
      {
        $limit: size,
      },
    ];
    let notificationData = await database.notification
      .aggregate(pipeline)
      .toArray();
    return res.status(200).json({
      statusCode: 200,
      statusMessage: "success",
      data: notificationData,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ statusCode: 500, statusMessage: "Something went wrong." });
  }
});


export default router;