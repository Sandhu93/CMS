import {MongoClient} from "mongodb";
import {config} from 'dotenv';

config();

const mongoConnection = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

await mongoConnection.connect();
console.log("Connected to Database");

export const database = {
    logs: mongoConnection.db("database").collection("logs"),
    buffer: mongoConnection.db("database").collection("databuffers"),
    auth: mongoConnection.db("database").collection("auth"),
    devices: mongoConnection.db("database").collection("devices"),
    branches: mongoConnection.db("database").collection("branches"),
    notification: mongoConnection.db("database").collection("notification"),
    attendance: mongoConnection.db("database").collection("attendance"),
    roles: mongoConnection.db("database").collection("roles"),
    stats: mongoConnection.db("database").collection("stats"),
    tasks: mongoConnection.db("database").collection("tasks"),
    counters: mongoConnection.db("database").collection("counters"),
    staticDB: mongoConnection.db("database").collection("static"),
    adminLogs: mongoConnection.db("database").collection("adminLogs"),
};

const tempRoles = await database.roles.find().toArray();
export const roles = tempRoles.map((role) => {
    return {
        name: role.name,
        desc: role.desc,
        permissions: BigInt(role.permissions),
        value: role.value,
    };
});
console.log("Fetched Roles");
