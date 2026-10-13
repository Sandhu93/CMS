import { mqttOnConnect, mqttOnMessage } from "../models/mqtt.client.js";
import mqtt from "mqtt";

const client = mqtt.connect(process.env.MQTT_ADDRESS);
client.on("connect", () => mqttOnConnect(client));
client.on("message", (topic, message) => mqttOnMessage(topic, message));
console.log("Mqtt Initialized");
client.on("disconnect", () => console.log("MQTT Disconnected"));
client.on("error", (err) => console.error(err));

export const mqttClient = client;
