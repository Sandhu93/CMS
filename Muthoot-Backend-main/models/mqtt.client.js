import { notify, taskCreation, diffObjects } from "../utils/utils.js";
import { database } from "../services/mongodb.service.js";
import { zone as defaultZone, zone16 as defaultZone16 } from "../utils/constants.js";
import { normalizeDeviceId } from "../utils/deviceId.js";
import { hasExtendedZoneData, normalizeZoneFields } from "../utils/mqttCompatibility.js";
import { io as socket } from "./backend.js";
import { logger } from "./logger.js";
import { recordMqttIngress } from "../services/mqttDiagnostics.service.js";

const ModeLongs = {
    D: "Day",
    N: "Night",
    M: "Maintenance",
}

export const mqttOnConnect = (client) => {
  console.log(`Connected to MQTT broker: ${process.env.MQTT_ADDRESS}`);
  console.log("Subscribing to topic: sensor");
  client.subscribe(process.env.MQTT_TOPIC.split(","), (err) => {
    console.log(err);
  });
};

export const mqttOnMessage = (topic, message) => {
    const receivedAt = new Date();
    void recordMqttIngress(topic, message, receivedAt).catch((error) => {
        console.error("MQTT ingress recording failed", error);
    });
    try {
        message = message.toString();
        const deviceState = JSON.parse(message);
        console.log("-------MQTT Message Received", deviceState.mac_id);
        handleMessage({ topic, payload: deviceState });
    } catch (e) {
        console.error(e);
    }
}
  
const handleMessage = async(msg) => {
    const deviceState = msg.payload;   
    deviceState.mac_id = normalizeDeviceId(deviceState.mac_id);
    if (!deviceState.mac_id) {
        console.error("MQTT message missing mac_id");
        return;
    }
    const dateStr = deviceState["Date_time"];
    let dateObj;
    if(!dateStr){
        dateObj = new Date();
        dateObj = dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000);
        dateObj = new Date(dateObj + (3600000*+5.5));
    }else{
        try {
            if(dateStr.includes("T")){
                dateObj = new Date(`${dateStr}.000+05:30`);
            } else {
                let parts = dateStr.split(" ");
                if (parts.length >= 2) {
                    let timeStr = parts[0];
                    let date = parts[1];
                    date = date.split("-").reverse().join("-");
                    dateObj = new Date(`${date}T${timeStr}.000+05:30`);
                } else {
                    dateObj = new Date("invalid");
                }
            }
        } catch(e) {
            dateObj = new Date("invalid");
        }
    }

    if (!dateObj || isNaN(dateObj.getTime())) {
        dateObj = new Date();
        dateObj = dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000);
        dateObj = new Date(dateObj + (3600000*+5.5));
    }

    deviceState["Date_time"] = dateObj.toISOString();
    normalizeZoneFields(deviceState);
    deviceState.device = {};
    deviceState.branch = {};
    let device = await database.devices.findOne({ Device_ID: deviceState.mac_id }).catch(() => {});
    if(!device) device = {};
    else {
        deviceState.device.Branch_Code = device.Branch_Code;
        deviceState.device.Device_ID = device.Device_ID;
        if(deviceState.device.Current_Status) deviceState.device.Current_Status = device.Current_Status;
        else deviceState.device.Current_Status = "Active";
    }
    let branch = await database.branches.findOne({ Code: device.Branch_Code }).catch(() => {});
    if(!branch) branch = {};
    else {
        deviceState.branch.Branch_Name = branch.Branch_Name;
        deviceState.branch.Code = branch.Code;
        deviceState.branch.Region = branch.Region;
        deviceState.branch.Hub = branch.Hub;
        deviceState.branch.Vertical = branch.Vertical;
    }
    socket.emit("data", deviceState);
    const prevState = await database.buffer.findOne({
      mac_id: deviceState.mac_id,
    });
    try{
        let differences = diffObjects(prevState, deviceState);
        let diffKeys = Object.keys(differences);
        console.log(differences);
        // if(diffKeys.length){
        //     console.log(deviceState.mac_id, prevState, deviceState);
        // }
    }catch(e){
        console.log("diffObjects error: ", e);
    }
    if (process.env.DEVELOPMENT !== "true")
      await database.buffer.updateOne(
        { mac_id: deviceState.mac_id },
        { $set: deviceState },
        { upsert: true }
      );
    if (!prevState) {
      console.error("Error fetching previous xstate");
      return;
    }
    //
    // if(process.env.DEVELOPMENT === 'true') notify(socket,database,{
    //     title: "Device Online",
    //     message: `Device in ${branch.Branch_Name || "--"} (${deviceState.mac_id}) is Online`,
    //     color: "yellow",
    //     link: `/dashboard/status/${deviceState.mac_id}`
    // });
    for (const key in prevState) {
        const oldValue = prevState[key];
        const newValue = deviceState[key];

        if (["_id", "mac_id", "Date_time"].includes(key)) {
            continue;
        }
        if (oldValue !== newValue) {
            // Battery
            if(key === "Bat_Voltage") {
                if (newValue < process.env.MAX_BATTERY * 0.3) {
                    logger.log(
                        "critical",
                        "Battery status: bW:High to bR:Low bR:Battery",
                        { deviceState, key, type: "battery" }
                    );
                    // SEND NOTIFICATION, SOMETHING LIKE THIS
                    notify(socket,database, {
                        title: "Battery Low",
                        message: `Name: ${branch.Branch_Name || "--"}
                        Code: ${branch.Code || "--"}
                        Region: ${branch.Region|| "--"}
                        Vertical: ${branch.Vertical|| "--"}
                        Mode: ${ModeLongs[deviceState.Op_Mode]}`,
                        color: "yellow",
                        link: `/dashboard/status/${deviceState.mac_id}`
                    });
                }else if (newValue > process.env.MAX_BATTERY * 0.3) {
                    logger.log("info", "Battery status: bW:Low to bG:High bG:Battery", {
                        deviceState,
                        key,
                        type: "battery",
                    });
                    notify(socket,database, {
                        title: "Battery High",
                        message: `Name: ${branch.Branch_Name || "--"}
                        Code: ${branch.Code || "--"}
                        Region: ${branch.Region|| "--"}
                        Vertical: ${branch.Vertical|| "--"}
                        Mode: ${ModeLongs[deviceState.Op_Mode]}`,
                        color: "green",
                        link: `/dashboard/status/${deviceState.mac_id}`
                    });
                }
            }
            // CMS Status: Wont work cuz we have to check for it
            if (key === "CMS_status") {
                if (newValue === "online") {
                    logger.log(
                        "info",
                        "Alert Status changed: bR:Offline to bG:Online",
                        { deviceState, key, type: "alert" }
                    );
                    notify(socket,database, {
                        title: "Device Online",
                        message: `Name: ${branch.Branch_Name || "--"}
                        Code: ${branch.Code || "--"}
                        Region: ${branch.Region|| "--"}
                        Vertical: ${branch.Vertical|| "--"}
                        Mode: ${ModeLongs[deviceState.Op_Mode]}`,
                        color: "green",
                        link: `/dashboard/status/${deviceState.mac_id}`
                    });
                }
                // if (newValue === "offline") { // THis is managed by the cron job
                //     logger.log(
                //     "critical",
                //     "Alert Status changed: bG:Online to bR:Offline",
                //     { deviceState, key, type: "alert" }
                //     );
                // }
            }

            // Operation Mode
            if (key === "Op_Mode") {
                const colors = {
                    N: "W",
                    M: "Y",
                    D: "Y",
                };
                logger.log(
                    newValue === 'M' ? "warning" : "info",
                    `Mode changed: b${colors[oldValue]}:${ModeLongs[oldValue]} to b${colors[newValue]}:${ModeLongs[newValue]}`,
                    { deviceState, key, type: "mode" }
                );
                // Attendance
                if(newValue === 'D') {
                    let start = new Date();
                    start = start.getTime() + (start.getTimezoneOffset() * 60000);
                    start = new Date(start + (3600000*+5.5));
                    const Day = new Date(start);
                    start.setHours(0,0,0,0);
                    if(process.env.DEVELOPMENT !== 'true') {
                        await database.attendance.updateOne(
                            { day: start.toISOString(), mac_id: deviceState.mac_id },
                            {
                                $setOnInsert: {
                                    checkIn: Day.toISOString(),
                                },
                                $unset: {
                                    checkOut: true,
                                    duration: true
                                }
                            },
                            { upsert: true }
                        );
                    }
                }else if(newValue === 'N') {
                    let start = new Date();
                    start = start.getTime() + (start.getTimezoneOffset() * 60000);
                    start = new Date(start + (3600000*+5.5));
                    const Night = new Date(start);
                    start.setHours(0,0,0,0);
                    const attendance = await database.attendance.findOne({ day: start.toISOString(), mac_id: deviceState.mac_id });
                    let duration = null;
                    if(attendance && attendance.checkIn) {
                        duration = Night - new Date(attendance.checkIn);
                    }
                    if(process.env.DEVELOPMENT !== 'true') await database.attendance.updateOne({ day: start.toISOString(), mac_id: deviceState.mac_id }, {
                        $set: {
                            checkOut: Night.toISOString(),
                            duration: duration,
                        }
                    }, { upsert: true });
                }
                notify(socket,database, {
                    title: `Mode Changed to ${ModeLongs[newValue]}`,
                    message: `Name: ${branch.Branch_Name || "--"}
                    Code: ${branch.Code || "--"}
                    Region: ${branch.Region|| "--"}
                    Vertical: ${branch.Vertical|| "--"}
                        Mode: ${ModeLongs[deviceState.Op_Mode]}`,
                    color: newValue === 'M' ? "yellow" : "green",
                    link: `/dashboard/status/${deviceState.mac_id}`
                });
            }

            // Connectivity
            if (key === "Net_Con") {
                if (newValue === "wifi") {
                    logger.log(
                        "info",
                        `Connectivity changed: bB:${oldValue} to bB:Wi-Fi`,
                        { deviceState, key, type: "connectivity" }
                    );
                    notify(socket,database, {
                        title: "Connectivity Changed to Wi-Fi",
                        message: `Name: ${branch.Branch_Name || "--"}
                        Code: ${branch.Code || "--"}
                        Region: ${branch.Region|| "--"}
                        Vertical: ${branch.Vertical|| "--"}
                        Mode: ${ModeLongs[deviceState.Op_Mode]}`,
                        color: "green",
                        link: `/dashboard/status/${deviceState.mac_id}`
                    });
                } else if (newValue === "cellular") {
                    logger.log(
                        "info",
                        `Connectivity changed: bB:${oldValue} to bB:Cellular`,
                        { deviceState, key, type: "connectivity" }
                    );
                    notify(socket,database, {
                        title: "Connectivity Changed to Cellular",
                        message: `Name: ${branch.Branch_Name || "--"}
                        Code: ${branch.Code || "--"}
                        Region: ${branch.Region|| "--"}
                        Vertical: ${branch.Vertical|| "--"}
                        Mode: ${ModeLongs[deviceState.Op_Mode]}`,
                        color: "green",
                        link: `/dashboard/status/${deviceState.mac_id}`
                    });
                } else if (newValue === "ethernet") {
                    logger.log(
                        "info",
                        `Connectivity changed: bB:${oldValue} to bB:Ethernet`,
                        { deviceState, key, type: "connectivity" }
                    );
                    notify(socket,database, {
                        title: "Connectivity Changed to Ethernet",
                        message: `Name: ${branch.Branch_Name || "--"}
                        Code: ${branch.Code || "--"}
                        Region: ${branch.Region|| "--"}
                        Vertical: ${branch.Vertical|| "--"}
                        Mode: ${ModeLongs[deviceState.Op_Mode]}`,
                        color: "green",
                        link: `/dashboard/status/${deviceState.mac_id}`
                    });
                }
            }
        }
    }
    // Zone
    zoneCheck(deviceState, device, branch, prevState);
};

const zoneCheck = async (deviceState, device, branch, prevState) => {
    const extendedZonePayload = hasExtendedZoneData(deviceState);
    const configuredZones = Array.isArray(device.Zones) ? device.Zones : [];
    const zone = configuredZones.length >= (extendedZonePayload ? 16 : 8)
      ? configuredZones
      : (extendedZonePayload ? defaultZone16 : defaultZone);
    
    // Bypass check
    for(let i = 1; i <= zone.length; i++) {
      if (deviceState[`Z${i}_bp`] !== prevState[`Z${i}_bp`]) {
        if (deviceState[`Z${i}_bp`] === '1') {
          logger.log(
            "critical",
            `Zone Changed: Zone ${i} (${zone[i - 1]}) bY:Bypassed`,
            { deviceState, key: `Z${i}_bp`, type: "zone" }
          );
          notify(socket, database, {
            title: `Zone ${i} (${zone[i - 1]}) Bypassed`,
            message: `Name: ${branch.Branch_Name || "--"}
            Code: ${branch.Code|| "--"}
            Region: ${branch.Region|| "--"}
            Vertical: ${branch.Vertical|| "--"}
                        Mode: ${ModeLongs[deviceState.Op_Mode]}`,
            color: "red",
            link: `/dashboard/status/${deviceState.mac_id}`
          });
          continue;
        } else{
          logger.log(
            "info",
            `Zone Changed: Zone ${i} (${zone[i - 1]}) bW:Functional`,
            { deviceState, key: `Z${i}_bp`, type: "zone" }
          );
          notify(socket, database, {
            title: `Zone ${i} (${zone[i - 1]}) Functional`,
            message: `Name: ${branch.Branch_Name || "--"}
            Code: ${branch.Code || "--"}
            Region: ${branch.Region|| "--"}
            Vertical: ${branch.Vertical|| "--"}
                        Mode: ${ModeLongs[deviceState.Op_Mode]}`,
            color: "green",
            link: `/dashboard/status/${deviceState.mac_id}`
          });
          continue;
        }
      }
    }
  
    for (let i = 1; i <= zone.length; i++) {
      // If zone is bypassed
      if (deviceState[`Z${i}_bp`] === '1') {
        continue;
      }
      // If zone is not bypassed
      if (deviceState[`ZONE_${i}`] !== prevState[`ZONE_${i}`]) {
        if (deviceState[`ZONE_${i}`] === 1) {
          logger.log(
            "critical",
            `Zone Changed: Zone ${i} (${zone[i - 1]}) bR:Triggered`,
            { deviceState, key: `ZONE_${i}`, type: "zone" }
          );
          notify(socket, database, {
            title: `Zone ${i} (${zone[i - 1]}) Triggered`,
            message: `Name: ${branch.Branch_Name || "--"}
            Code: ${branch.Code || "--"}
            Region: ${branch.Region|| "--"}
            Vertical: ${branch.Vertical|| "--"}
                        Mode: ${ModeLongs[deviceState.Op_Mode]}`,
            color: "red",
            link: `/dashboard/status/${deviceState.mac_id}`
          });
          taskCreation({
            branchCode: branch.Code,
            branchName: branch.Branch_Name,
            macID: deviceState.mac_id,
            region: branch.Region,
            zone: zone[i - 1],
          });
          continue;
        } else {
          logger.log(
            "info",
            `Zone Changed: Zone ${i} (${zone[i - 1]}) bW:Normal Mode`,
            { deviceState, key: `ZONE_${i}`, type: "zone" }
          );
          notify(socket, database, {
            title: `Zone ${i} (${zone[i - 1]}) Normal`,
            message: `Name: ${branch.Branch_Name || "--"}
            Code: ${branch.Code || "--"}
            Region: ${branch.Region|| "--"}
            Vertical: ${branch.Vertical|| "--"}
                        Mode: ${ModeLongs[deviceState.Op_Mode]}`,
            color: "green",
            link: `/dashboard/status/${deviceState.mac_id}`
          });
          continue;
        }
      }
    }
  };
