import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { database, roles } from "../services/mongodb.service.js";
import { PermissionField } from "../utils/constants.js";
import jwt from "jsonwebtoken";
import { AsyncParser } from "@json2csv/node";

const router = express.Router();

router.get(
  "/history",
  permissionMiddleware(roles, PermissionField.Flags.ViewHistory),
  async (req, res) => {
    const query = req.query;
    if (!query.page) query.page = { size: 25, number: 1 };
    if (!query.page.size) query.page.size = 25;
    if (!query.page.number) query.page.number = 1;
    if (!query.filter) query.filter = {};
    const page = parseInt(query.page.number);
    const size = Math.min(200, parseInt(query.page.size));
    const sortOrder = query.filter.timestamp ? 1 : -1;
    try {
      const search = [];
      if (query.filter.macID) {
        search.push({
          $match: {
            mac_id: {
              $regex: new RegExp(query.filter.macID[0], 'i'),
            },
          },
        });
      } else if (query.filter.BranchName) {
        search.push({
          $match: {
            "branch.Branch_Name": {
              $regex: new RegExp(query.filter.BranchName[0], 'i'),
            },
          },
        });
      } else if (query.filter.BranchCode) {
        console.log(query.filter.BranchCode);
        search.push({
          $match: {
            "branch.Code": {
              $regex: new RegExp(query.filter.BranchCode[0], 'i'),
            },
          },
        });
      }

      if(query.filter.type) {
        if(query.filter.type[0].includes("Mode")){
          search.push({
            $match: {
              type: "mode",
            }
          });
        }else if(query.filter.type[0].includes("Triggers")){
          search.push({
            $match: {
              message: /Trigger/
            }
          })
        }else if(query.filter.type[0].includes("Bypass")){
          search.push({
            $match: {
              message: /Bypass/
            }
          })
        }
      }

      if (query.filter.timestamp) {
        console.log(query.filter.timestamp);
        console.log(new Date(query.filter.timestamp));
        let timeFilter = {
          $match: {
            timestamp: {
              $gte: new Date(query.filter.timestamp[0]),
            },
          },
        };
        if (query.filter.timestamp[1])
          timeFilter["$match"]["timestamp"]["$lte"] = new Date(
            query.filter.timestamp[1]
          );

        search.push(timeFilter);
      }
      const pipeline = [
        {
          $sort: { timestamp: sortOrder },
        },
        {
          $lookup: {
            from: "devices",
            localField: "mac_id",
            foreignField: "Device_ID",
            as: "device",
          },
        },
        {
          $unwind: {
            path: "$device",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            device: {
              $cond: [{ $eq: ["$device", null] }, {}, "$device"],
            },
          },
        },
        {
          $lookup: {
            from: "branches",
            localField: "device.Branch_Code",
            foreignField: "Code",
            as: "branch",
          },
        },
        {
          $unwind: {
            path: "$branch",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            branch: {
              $cond: [{ $eq: ["$branch", null] }, {}, "$branch"],
            },
          },
        },
        ...search,
        {
          $skip: (page - 1) * size,
        },
        {
          $limit: size,
        },
        {
          $project: {
            level: 1,
            timestamp: 1,
            key: 1,
            type: 1,
            message: 1,
            duration: 1,
            mac_id: 1,
            Branch_Name: "$branch.Branch_Name",
          },
        },
      ];
      let logData = await database.logs.aggregate(pipeline).toArray();
      return res.status(200).json({
        statusCode: 200,
        statusMessage: "success",
        data: logData,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

router.get("/attendance/download", async (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res
      .status(401)
      .json({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  let role;
  let parsedToken;
  try {
    parsedToken = jwt.verify(token, process.env.JWT_SALT);
    role = parsedToken.role;
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ statusCode: 401, statusMessage: "Invalid Token" });
  }
  const userRole = roles.find((x) => x.value === role);
  if (!userRole)
    return res
      .status(403)
      .json({ statusCode: 403, statusMessage: "Forbidden. Unknown Role" });
  try {
    if (
      userRole.permissions & PermissionField.Flags.Administrator ||
      userRole.permissions & PermissionField.Flags.ViewAttendance
    ) {
      try {
        // Fetch todays data from attendance collection
        let today = new Date();
        today.setUTCHours(0, 0, 0, 0); // set time to 00:00:00.000 UTC
        let todayISO = today.toISOString();
        const pipeline = [
          {
            $lookup: {
              from: "devices",
              localField: "mac_id",
              foreignField: "Device_ID",
              as: "device",
            },
          },
          {
            $unwind: {
              path: "$device",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              device: {
                $cond: [{ $eq: ["$device", null] }, {}, "$device"],
              },
            },
          },
          {
            $lookup: {
              from: "branches",
              localField: "device.Branch_Code",
              foreignField: "Code",
              as: "branch",
            },
          },
          {
            $unwind: {
              path: "$branch",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              branch: {
                $cond: [{ $eq: ["$branch", null] }, {}, "$branch"],
              },
            },
          },
          {
            $match: {
              day: {
                $eq: todayISO,
              },
            },
          },
          {
            $project: {
              _id: 0,
              Day: "$day",
              "Check In Time": { $ifNull: ["$checkIn", "--"] },
              "Check Out Time": { $ifNull: ["$checkOut", "--"] },
              Duration: "$duration",
              "Mac Id": "$mac_id",
              "Branch Name": "$branch.Branch_Name",
            },
          },
        ];
        let logData = await database.attendance.aggregate(pipeline).toArray();
        console.log(todayISO, logData);
        const opts = {};
        const transformOpts = {};
        const asyncOpts = {};
        const parser = new AsyncParser(opts, asyncOpts, transformOpts);
        const csv = await parser.parse(logData).promise();
        res.header("Content-Type", "text/csv");
        res.attachment(`attendance-${todayISO}.csv`);
        return res.send(csv);
      } catch (error) {
        console.log(error);
        return res
          .status(500)
          .json({ statusCode: 500, statusMessage: "Something went wrong." });
      }
    }
  } catch (err) {
    console.log(err);
  }
  return res.status(403).json({ statusCode: 403, statusMessage: "Forbidden" });
});
router.get(
  "/attendance/counters",
  permissionMiddleware(roles, PermissionField.Flags.ViewAttendance),
  async (req, res) => {
    let today = new Date();
    today.setHours(0, 0, 0, 0); // set time to 00:00:00.000
    let todayISO = today.toISOString();

    let pipeline = [
      {
        $addFields: {
          convertedDay: {
            $dateFromString: {
              dateString: "$day",
            },
          },
        },
      },
      {
        $match: {
          convertedDay: {
            $gte: new Date(todayISO),
          },
        },
      },
      {
        $group: {
          _id: null,
          TotalCheckIn: {
            $sum: {
              $cond: [{ $ifNull: ["$checkIn", false] }, 1, 0],
            },
          },
          TotalCheckOut: {
            $sum: {
              $cond: [{ $ifNull: ["$checkOut", false] }, 1, 0],
            },
          },
        },
      },
    ];

    try {
      const result = await database.attendance.aggregate(pipeline).toArray();
      res.json({
        statusCode: 200,
        data: {
          checkInTotal: result[0]?.TotalCheckIn || 0,
          checkOutTotal: result[0]?.TotalCheckOut || 0,
        },
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.toString() });
    }
  }
);
router.get(
  "/attendance",
  permissionMiddleware(roles, PermissionField.Flags.ViewAttendance),
  async (req, res) => {
    const query = req.query;
    if (!query.page) query.page = { size: 25, number: 1 };
    if (!query.page.size) query.page.size = 25;
    if (!query.page.number) query.page.number = 1;
    if (!query.filter) query.filter = {};
    const page = parseInt(query.page.number);
    const size = Math.min(200, parseInt(query.page.size));
    try {
      const search = [];
      if (query.filter.macID) {
        search.push({
          $match: {
            mac_id: {
               $regex: new RegExp(query.filter.macID[0], 'i'),
            },
          },
        });
      } else if (query.filter.BranchName) {
        search.push({
          $match: {
            "branch.Branch_Name": {
               $regex: new RegExp(query.filter.BranchName[0], 'i'),
            },
          },
        });
      } else if (query.filter.BranchCode) {
        search.push({
          $match: {
            "device.Code": {
               $regex: new RegExp(query.filter.BranchCode[0], 'i'),
            },
          },
        });
      }
      if (query.filter.timestamp) {
        console.log(query.filter.timestamp);
        console.log(new Date(query.filter.timestamp));
        let timeFilter = {
          $match: {
            timestamp: {
              $gte: query.filter.timestamp[0],
            },
          },
        };
        if (query.filter.timestamp[1])
          timeFilter["$match"]["timestamp"]["$lte"] = query.filter.timestamp[1];

        search.push(timeFilter);
      }
      const pipeline = [
        {
          $sort: {
            day: -1,
            mac_id: 1,
          },
        },
        {
          $lookup: {
            from: "devices",
            localField: "mac_id",
            foreignField: "Device_ID",
            as: "device",
          },
        },
        {
          $unwind: {
            path: "$device",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            device: {
              $cond: [{ $eq: ["$device", null] }, {}, "$device"],
            },
          },
        },
        {
          $lookup: {
            from: "branches",
            localField: "device.Branch_Code",
            foreignField: "Code",
            as: "branch",
          },
        },
        {
          $unwind: {
            path: "$branch",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            branch: {
              $cond: [{ $eq: ["$branch", null] }, {}, "$branch"],
            },
          },
        },
        ...search,
        {
          $skip: (page - 1) * size,
        },
        {
          $limit: size,
        },
        {
          $project: {
            day: 1,
            checkIn: 1,
            checkOut: 1,
            duration: 1,
            mac_id: 1,
            Branch_Name: "$branch.Branch_Name",
          },
        },
      ];
      let logData = await database.attendance.aggregate(pipeline).toArray();
      return res.status(200).json({
        statusCode: 200,
        statusMessage: "success",
        data: logData,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

router.get("/history/exportData", async (req, res) => {
  try {
    const query = req.query;
    if (!query.filter) query.filter = {};
    const search = [];
    if (query.filter.macID) {
      search.push({
        $match: {
          mac_id: {
            $regex: new RegExp(query.filter.macID[0], 'i'),
          },
        },
      });
    } else if (query.filter.BranchName) {
      search.push({
        $match: {
          "branch.Branch_Name": {
            $regex: new RegExp(query.filter.BranchName[0], 'i'),
          },
        },
      });
    } else if (query.filter.BranchCode) {
      console.log(query.filter.BranchCode);
      search.push({
        $match: {
          "branch.Code": {
            $regex: new RegExp(query.filter.BranchCode[0], 'i'),
          },
        },
      });
    }

    if(query.filter.type) {
      if(query.filter.type[0].includes("Mode")){
        search.push({
          $match: {
            type: "mode",
          }
        });
      }else if(query.filter.type[0].includes("Triggers")){
        search.push({
          $match: {
            message: /Trigger/
          }
        })
      }else if(query.filter.type[0].includes("Bypass")){
        search.push({
          $match: {
            message: /Bypass/
          }
        })
      }
    }

    if (query.filter.timestamp) {
      console.log(query.filter.timestamp);
      console.log(new Date(query.filter.timestamp));
      let timeFilter = {
        $match: {
          timestamp: {
            $gte: new Date(query.filter.timestamp[0]),
          },
        },
      };
      if (query.filter.timestamp[1])
        timeFilter["$match"]["timestamp"]["$lte"] = new Date(
          query.filter.timestamp[1]
        );

      search.push(timeFilter);
    }
    const pipeline = [
      {
        $sort: { timestamp: -1 },
      },
      {
        $lookup: {
          from: "devices",
          localField: "mac_id",
          foreignField: "Device_ID",
          as: "device",
        },
      },
      {
        $unwind: {
          path: "$device",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          device: {
            $cond: [{ $eq: ["$device", null] }, {}, "$device"],
          },
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "device.Branch_Code",
          foreignField: "Code",
          as: "branch",
        },
      },
      {
        $unwind: {
          path: "$branch",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          branch: {
            $cond: [{ $eq: ["$branch", null] }, {}, "$branch"],
          },
        },
      },
      ...search,
      {
        $limit: 100,
      },
      {
        $project: {
          level: 1,
          timestamp: 1,
          key: 1,
          type: 1,
          message: 1,
          duration: 1,
          mac_id: 1,
          Branch_Name: "$branch.Branch_Name",
        },
      },
    ];
    let data = await database.logs.aggregate(pipeline).toArray();
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((header) => row[header]));
    const csvData = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=data.csv");
    res.send(csvData);
  } catch (error) {
    console.error("Error generating CSV:", error);
    res.status(500).send({error: "Error generating CSV"});
  }
});
export default router;
