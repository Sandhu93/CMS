import moment from "moment";
import { database } from "../services/mongodb.service.js";
import { io as socket } from "../models/backend.js";
import { logger } from "../models/logger.js";

const task = {
  slNo: 1,
  group: 1,
  time: 1249392920,
  branchCode: "B001",
  branchName: "Branch 1",
  region: "Region 1",
  zone: "Zone 1",
  status: "todo",
  assignee: "User 1",
  assigneeEmail: "test@example.com",
}


export async function offlineCronJob() {
    const items = await database.buffer.find().toArray();
    for (let item of items) {
        if(item.CMS_status === "offline") continue;
    
        const dateObj = moment(item["Date_time"]).toDate();
        // check if dateObj is 12 hours older than current time
        const now = new Date();
        const diff = now - dateObj;
        if(diff > 60 * 60 * 1000) {
            item.CMS_status = "offline";
            socket.emit("data", item);
            logger.log(
                "critical",
                "Alert Status changed: bG:Online to bR:Offline",
                { deviceState: item, key: "CMS_status", type: "alert" }
            );
            if(process.env.DEVELOPMENT !== 'true') await database.buffer.updateOne({ mac_id: item.mac_id }, { $set: { CMS_status: "offline" }}, { upsert: true }).catch(() => {});
            let device = await database.devices.findOne({ Device_ID: item.mac_id }).catch(() => {});
            if(!device) device = {};
            let branch = await database.branches.findOne({ Code: device.Branch_Code }).catch(() => {});
            if(!branch) branch = {};
            const message = {
                title: "Device Offline",
                message: `Name: ${branch.Branch_Name || "--"}
Code: ${branch.Code || "--"}
Region: ${branch.Region|| "--"}
Vertical: ${branch.Vertical|| "--"}`, // Device in ${branch.Branch_Name || "--"} (${item.mac_id}) is Offline
                color: "red",
                link: `/dashboard/status/${item.mac_id}`,
                timestamp: new Date(),
            };
            socket.emit("notification", message);
            if(process.env.DEVELOPMENT === 'true') continue;
            database.notification.insertOne(message);

            // Update offlineChart in stats collection
            const day = moment().startOf('day').toDate();
            let offlineChart = await database.stats.findOne({ name: "offlineChart" });
            if (!offlineChart) {
                offlineChart = { name: "offlineChart", data: [] };
            }
            let dayData = offlineChart.data.find(d => d.day.getTime() === day.getTime());
            if (!dayData) {
                dayData = { day, devices: [] };
                offlineChart.data.push(dayData);
            }
            dayData.devices.push(item.mac_id);
            if (offlineChart.data.length > 30) {
                offlineChart.data.shift();
            }
            await database.stats.updateOne({ name: "offlineChart" }, { $set: offlineChart }, { upsert: true });
        }
    }
}

/*

To achieve this, you can use MongoDB's aggregation framework. Here's a step-by-step plan:

Match documents where message is "Alert Status changed: bG:Online to bR:Offline" and timestamp is within the last 30 days.
Group by timestamp and mac_id to get unique combinations.
Group by timestamp and count the distinct mac_ids.
Here's the MongoDB query:

const thirtyDaysAgo = moment().subtract(30, 'days').toDate();

const pipeline = [
  {
    $match: {
      message: "Alert Status changed: bG:Online to bR:Offline",
      timestamp: { $gte: thirtyDaysAgo }
    }
  },
  {
    $group: {
      _id: { timestamp: "$timestamp", mac_id: "$mac_id" }
    }
  },
  {
    $group: {
      _id: "$_id.timestamp",
      count: { $sum: 1 }
    }
  }
];

const result = await database.logs.aggregate(pipeline).toArray();
This will give you an array of objects where each object has a _id field (representing the timestamp) and a count field (representing the distinct count of mac_ids for that timestamp).

Please note that the $date field in your timestamp object should be a valid JavaScript Date object or a string that can be parsed into a Date object. If it's not, you may need to convert it before running the aggregation.
*/