import { config } from 'dotenv';
config();
import { MongoClient } from "mongodb";
import { database } from '../services/mongodb.service.js';

async function purge() {
    const mongoUrl = process.env.MONGODB_URI; // Replace with your MongoDB connection URL
    const dbName = 'database'; // Replace with your database name
  
    const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  
    try {
      await client.connect();
      console.log('Connected to MongoDB');
  
      const db = client.db(dbName);
      const rolesCollection = db.collection('databuffers');
      const rolesCollection2 = db.collection('logs');
      const rolesCollection3 = db.collection('notification');
  
      // Insert the roles array into the "roles" collection
      const result = await rolesCollection.find({ CMS_status: "offline" }, { projection: {
        mac_id: 1,
        _id: 0
      }}).toArray();

      const macIds = result.map(doc => doc.mac_id);
      if(macIds.length === 0) {
        console.log('No documents found');
        return;
      }
      const deleteResult = await rolesCollection.deleteMany({ mac_id: { $in: macIds } });
      console.log(`${deleteResult.deletedCount} documents deleted`);
      const deleteResult2 = await rolesCollection2.deleteMany({ mac_id: { $in: macIds } });
      console.log(`${deleteResult2.deletedCount} documents deleted`);
      const deletePromises = macIds.map(macId => 
        rolesCollection3.deleteMany({ link: { $regex: new RegExp(`${macId}$`) } })
      );
      const deleteResults3 = await Promise.all(deletePromises);
      const totalDeleted = deleteResults3.reduce((total, result) => total + result.deletedCount, 0);

      console.log(`${totalDeleted} documents deleted`);
    } finally {
      client.close();
    }
}
  // purge().catch(console.error);

async function purge2() {
    const mongoUrl = process.env.MONGODB_URI; // Replace with your MongoDB connection URL
    const dbName = 'database'; // Replace with your database name
  
    const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  
    try {
      await client.connect();
      console.log('Connected to MongoDB');
  
      const db = client.db(dbName);
      const rolesCollection = db.collection('databuffers');
      const rolesCollection2 = db.collection('attendance');
  
      // Insert the roles array into the "roles" collection
      const result = await rolesCollection.find({}, { projection: {
        mac_id: 1,
        _id: 0
      }}).toArray();

      const macIds = result.map(doc => doc.mac_id);
      if(macIds.length === 0) {
        console.log('No documents found');
        return;
      }
      const deleteResult2 = await rolesCollection2.deleteMany({ mac_id: { $nin: macIds } });
      console.log(`${deleteResult2.deletedCount} documents deleted`);
    } finally {
      client.close();
    }
}
  // purge2().catch(console.error);

async function setVerticalForBranchesInBuffer() {
  const buffers = await database.buffer.find({ "branch": { $exists: true } }).toArray();
  for (const buffer of buffers) {
      console.log(`${buffer.branch.Code} - ${buffer.branch.Vertical}`);
      const branch = await database.branches.findOne({ Code: buffer.branch.Code });
      if (buffer.branch.Code && branch) {
          await database.buffer.updateOne(
              { _id: buffer._id },
              { $set: { "branch.Vertical": branch.Vertical } }
          );
      }
  }
  console.log("Vertical set for all branches in buffer");
}

async function initializeBranchAndDeviceForBuffers() {
    const buffers = await database.buffer.find({ "branch": { $exists: false } }).toArray();
    for (const buffer of buffers) {
        const device = await database.devices.findOne({ Device_ID: buffer.mac_id });
        if (device) {
            const branch = await database.branches.findOne({ Code: device.Branch_Code });
            if (branch) {
                await database.buffer.updateOne(
                    { _id: buffer._id },
                    {
                        $set: {
                            "branch": {
                                Branch_Name: branch.Branch_Name,
                                Code: branch.Code,
                                Region: branch.Region,
                                Hub: branch.Hub,
                                Vertical: branch.Vertical
                            },
                            "device": {
                                Branch_Code: device.Branch_Code,
                                Device_ID: device.Device_ID
                            }
                        }
                    }
                );
            }
        }
    }
    console.log("Branch and device initialized for all buffers");
}

async function removeInvalidEntries() {
  const buffers = await database.buffer.find({}).toArray();

  for (const buffer of buffers) {
    let updateNeeded = false;
    const updateFields = {};

    // Check if branch.Code exists
    if (buffer.branch && buffer.branch.Code) {
      const branchExists = await database.branches.findOne({ Code: buffer.branch.Code });
      if (!branchExists) {
        updateFields.branch = {};
        updateNeeded = true;
      }
    }

    // Check if device.Device_ID exists
    if (buffer.device && buffer.device.Device_ID) {
      const deviceExists = await database.devices.findOne({ Device_ID: buffer.device.Device_ID });
      if (!deviceExists) {
        updateFields.device = {};
        updateNeeded = true;
      }
    }

    // Update the buffer if needed
    if (updateNeeded) {
      await database.buffer.updateOne(
        { _id: buffer._id },
        { $set: updateFields }
      );
    }
  }

  console.log("Invalid entries removed from buffer");
}

// Call the function
// removeInvalidEntries();
// Call the functions
// setVerticalForBranchesInBuffer();
// initializeBranchAndDeviceForBuffers();