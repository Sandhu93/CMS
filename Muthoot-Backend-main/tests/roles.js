import { config } from 'dotenv';
config();
import { PermissionField } from '../utils/constants.js';
import { MongoClient } from "mongodb";

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