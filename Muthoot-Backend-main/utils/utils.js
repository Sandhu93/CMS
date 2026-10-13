import request from 'request';
import { Mutex } from 'async-mutex';
import { io } from '../models/backend.js';
import { database } from '../services/mongodb.service.js';

export function diffObjects(oldObj, newObj) {
    let diff = {};
  
    for (let key in newObj) {
      if (oldObj[key] && typeof oldObj[key] === 'object' && newObj[key] && typeof newObj[key] === 'object') {
        let nestedDiff = diffObjects(oldObj[key], newObj[key]);
        if (Object.keys(nestedDiff).length > 0) {
          diff[key] = nestedDiff;
        }
      } else if (oldObj[key] !== newObj[key]) {
        diff[key] = newObj[key];
      }
    }
  
    return diff;
}

export const async_request = async (options) => {
    return new Promise((resolve) => {

        request(options, (error, response) => {
            if (error || !response) {
                resolve({
                    error: true,
                    message: error ? error.message : "Server Unavailable"
                });
            }else{
                resolve({
                    statusCode: response.statusCode,
                    headers: response.headers,
                    body: response.body
                });
             }
        });
    });
};

export class LogHandler {
    constructor(database) {
        this.database = database;
    }
    async log(level, message, details) {
        let start = new Date();
        start = start.getTime() + (start.getTimezoneOffset() * 60000);
        start = new Date(start + (3600000*+5.5));
        const logEntry = {
            level: level,
            timestamp: start,
            mac_id: details.deviceState.mac_id,
            key: details.key,
            type: details.type,
            message: message,
            duration: null,
        };

        const previousDocument = await this.database.find({ mac_id: logEntry.mac_id, key: logEntry.key }).sort({"timestamp": -1}).limit(1).toArray().catch(() => {});
        if(previousDocument && previousDocument[0]) {
            // Get difference of previous document timestamp and current
            const previousTimestamp = new Date(previousDocument[0].timestamp);
            logEntry.duration = logEntry.timestamp - previousTimestamp;
        }

        // Assuming logs is a MongoDB collection
        if(process.env.DEVELOPMENT !== 'true') await this.database.insertOne(logEntry).catch(err => {
            if (err) {
                console.error("Error inserting log:", err);
            }
        });
        else console.log(logEntry);
    }
}

export async function notify(socket, database, message) {
    message.timestamp = new Date();
    console.log("-------NOTIFICATION SENT", message);
    socket.emit("notification", message);
    if(process.env.DEVELOPMENT !== 'true') database.notification.insertOne(message);
}

export function createRoleKey(name, currentList) {
    let count = 1;
    let key = name.split(" ").join("").toLowerCase();
    if(currentList.includes(key)) {
        while(currentList.includes(key + count)) {
            count++;
        }
        return key + count;
    }
    return key;
}

// const groupExample = {
//     slNo: 1,
//     status: "open",
//     branchCode: "B001",
//     branchName: "Branch 1",
//     region: "Region 1",
//     slNos: [1, 2],
//     tasks: [taskExample, taskExample],
// }

// const taskExample = {
//     slNo: 1,
//     time: 1249392920,
//     zone: "Zone 1",
//     status: "todo",
//     assignee: "User 1",
//     assigneeEmail: "test@example.com",
//   }

//   const partialTaskExample = {
//     branchCode: "B001",
//     branchName: "Branch 1",
//     region: "Region 1",
//     zone: "Zone 1",
//   }

// The taskCreation function is used to create a task object in the database.
// slNo is unique and is auto-incremented.
// group exists if the task is part of a group and will be the slNo of the parent task.
const mutex = new Mutex();
let devTaskCounter;
let devGroupCounter;

export async function taskCreation(partialTask) {
    const release = await mutex.acquire();
    try {
        // Get and increment the task slNo
        let taskCounter;
        if (process.env.DEVELOPMENT === 'true') {
            if(!devTaskCounter) {
                devTaskCounter = await database.counters.findOne({ _id: "task" });
            }
            devTaskCounter += 1;
            taskCounter = devTaskCounter;
        } else {
            taskCounter = await database.counters.findOneAndUpdate(
                { _id: "task" },
                { $inc: { seq: 1 } },
                { upsert: true, returnOriginal: false }
            );
        }

        // Find an open group with the same branchCode and region
        let group = await database.tasks.findOne({
            branchCode: partialTask.branchCode,
            region: partialTask.region,
            status: "open"
        });

        const task = {
            zone: partialTask.zone,
            slNo: taskCounter.value.seq,
            time: Date.now(),
            status: "todo",
        };

        if (group) {
            // If there is an open group, check if a similar task exists
            const similarTaskExists = group.tasks.find(
                existingTask => existingTask.zone === task.zone && existingTask.status !== 'closed'
            );

            
            if (!similarTaskExists) {
                if (process.env.DEVELOPMENT === 'true') {
                    console.log("Task created:", task);
                    io.emit("taskAdd", group, task);
                    return task;
                }
                // If no similar task exists, add the task to the group
                await database.tasks.updateOne(
                    { _id: group._id },
                    {
                        $push: {
                            slNos: task.slNo,
                            tasks: task
                        }
                    }
                );
            } else {
                if(process.env.DEVELOPMENT === 'true'){
                    io.emit("taskAdd", group, task);
                    devTaskCounter += -1;
                }else{
                    taskCounter = await database.counters.findOneAndUpdate(
                        { _id: "task" },
                        { $inc: { seq: -1 } },
                        { upsert: true, returnOriginal: false }
                    );
                    // Update the date of the existing similar task
                    await database.tasks.updateOne(
                        { _id: group._id, "tasks.slNo": similarTaskExists.slNo },
                        { $set: { "tasks.$.time": task.time } }
                    );
                }
                return null;
            }
        } else {
            // Get and increment the group slNo
            let groupCounter;
            if (process.env.DEVELOPMENT === 'true') {
                if(!devGroupCounter) {
                    devGroupCounter = await database.counters.findOne({ _id: "group" });
                }
                devGroupCounter += 1;
                groupCounter = devGroupCounter;
            } else {
                groupCounter = await database.counters.findOneAndUpdate(
                    { _id: "group" },
                    { $inc: { seq: 1 } },
                    { upsert: true, returnOriginal: false }
                );
            }

            // If there is no open group, create a new group
            group = {
                slNo: groupCounter.value.seq,
                slNos: [task.slNo],
                status: "open",
                branchName: partialTask.branchName,
                branchCode: partialTask.branchCode,
                region: partialTask.region,
                tasks: [task],
            };
            if (process.env.DEVELOPMENT === 'true') {
                console.log("Task created:", task);
                io.emit("taskAdd", group, task);
                return task;
            }
            await database.tasks.insertOne(group);
        }

        io.emit("taskAdd", group, task);
        return task;
    } finally {
        release();
    }
}
export async function removeDuplicates() {
    const release = await mutex.acquire();
    try {
        // Get all the groups
        const groups = await database.tasks.find({}).toArray();

        for (const group of groups) {
            const uniqueTasks = [];
            const taskZones = new Set();

            for (const task of group.tasks) {
                if (!taskZones.has(task.zone) || task.status === 'closed') {
                    taskZones.add(task.zone);
                    uniqueTasks.push(task);
                }
            }

            // Update the group with the unique tasks
            await database.tasks.updateOne(
                { _id: group._id },
                { $set: { tasks: uniqueTasks } }
            );
        }
    } finally {
        release();
    }
}
// removeDuplicates().then(() => console.log("Duplicates removed"));
