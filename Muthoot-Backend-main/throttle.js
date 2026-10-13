
require('dotenv').config();
const { MongoClient } = require('mongodb');
const PermissionField = require('./library/permission.js');

async function deleteDuplicateEntries() {
  const mongoUrl = process.env.MONGODB_URI; // Replace with your MongoDB connection URL
  const dbName = 'database'; // Replace with your database name
  const collectionName = 'logs'; // Replace with your collection name

  const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Create an aggregation pipeline to identify duplicates
    const pipeline = [
      {
        $group: {
          _id: {
            mac_id: '$mac_id',
            key: '$key',
            type: '$type',
          },
          count: { $sum: 1 },
          docs: { $push: '$$ROOT' },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ];

    const duplicates = await collection.aggregate(pipeline).toArray();

    // Iterate over duplicate groups and remove duplicates with a timestamp difference less than 5 minutes
    for (const duplicateGroup of duplicates) {
      const sortedDocs = duplicateGroup.docs.sort((a, b) => a.timestamp - b.timestamp);
      for (let i = 1; i < sortedDocs.length; i++) {
        const timeDifference = (sortedDocs[i].timestamp - sortedDocs[i - 1].timestamp) / 1000; // Convert to seconds
        if (timeDifference < 300) { // 300 seconds = 5 minutes
          // Remove the duplicate with a smaller timestamp
          await collection.deleteOne({ _id: sortedDocs[i]._id });
          console.log(`Duplicate entry removed: ${JSON.stringify(sortedDocs[i])}`);
        }
      }
    }

    console.log('Duplicates removed successfully.');

  } finally {
    await client.close();
  }
}

// deleteDuplicateEntries().catch(console.error);


async function aggregate() {
  const mongoUrl = process.env.MONGODB_URI; // Replace with your MongoDB connection URL
  const dbName = 'database'; // Replace with your database name
  const collectionName = 'logs'; // Replace with your collection name

  const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Create an aggregation pipeline to identify duplicates
    let pipeline = [
      {
        $lookup: {
          from: "devices",
          localField: "mac_id",
          foreignField: "Device_ID",
          as: "device"
        }
      },
      {
        $unwind: "$device" // Unwind the 'device' array created by the $lookup
      },
      {
        $lookup: {
          from: "branches",
          localField: "device.Branch_Code",
          foreignField: "Code",
          as: "branch"
        }
      },
      {
        $unwind: "$branch" // Unwind the 'branch' array created by the second $lookup
      }
    ];

    const duplicates = await collection.aggregate(pipeline).toArray();

    console.log(JSON.stringify(duplicates, null, 2));

  } finally {
    await client.close();
  }
}
// aggregate().catch(console.error);

const roles = [
  {
      name: "Super Admin",
      desc: "Super Admins have top tier access to the entire dashboard",
      value: "superadmin",
      permissions: (PermissionField.Flags.Administrator) + ""
  },
  {
      name: "Admin",
      desc: "Admins have access to all the features of the dashboard except for the user management",
      value: "admin",
      permissions: (PermissionField.Flags.ViewStatus | PermissionField.Flags.ViewStatusDetailed | PermissionField.Flags.ChangeMode | PermissionField.Flags.AccessCode | PermissionField.Flags.ReverseAlarm | PermissionField.Flags.ResetAlarm | PermissionField.Flags.NetworkPassword | PermissionField.Flags.ViewRoles | PermissionField.Flags.ViewUsers) + ""
  },
  {
      name: "User",
      desc: "Users can only view the dashboard. They will receive alerts and can monitor the charts",
      value: "user",
      permissions: (PermissionField.Flags.ViewStatus | PermissionField.Flags.ViewStatusDetailed) + ""
  },
];

async function pushRoles() {
  const mongoUrl = process.env.MONGODB_URI; // Replace with your MongoDB connection URL
  const dbName = 'database'; // Replace with your database name

  const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const rolesCollection = db.collection('roles');

    // Insert the roles array into the "roles" collection
    const result = await rolesCollection.insertMany(roles);
    console.log(`${result.insertedCount} roles added to the "roles" collection.`);
  } finally {
    client.close();
  }
}
// pushRoles().catch(console.error);