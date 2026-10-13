import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { roles, database } from "../services/mongodb.service.js";
import { PermissionField } from "../utils/constants.js";

const router = express.Router();

const branchKeys = [
  "Branch_Name",
  "Code",
  "Region",
  "Hub",
  "Vertical",
  "Zone",
  "State",
  "District",
  "City",
  "Building_Name",
  "Pin_Code",
  "Risk_Category",
  "Branch_Locality",
  "Post_Office",
  "Mail_Address",
  "Contact_Person",
  "Mobile_Number",
  "Branch_Land_Phone",
  "Branch_Mobile",
  "Current_Status",
  "Support_Type",
];

router.get("/:Code", permissionMiddleware(roles), async (req, res) => {
  try {
    const branch = await database.branches.findOne({
      Code: req.params.Code,
    });
    if (!branch) {
      return res
        .status(404)
        .json({ statusCode: 404, statusMessage: "Device not found" });
    }
    return res
      .status(200)
      .json({ statusCode: 200, statusMessage: "success", data: branch });
  } catch (error) {
    return res
      .status(500)
      .json({ statusCode: 500, statusMessage: "Something went wrong." });
  }
});

router.get(
  "/config/getBranchDropDowns",
  permissionMiddleware(roles),
  async (req, res) => {
    try {
      const config = await database.staticDB.findOne({
        type: "branchDropDown",
      });
      if (!config) {
        return res
          .status(404)
          .json({ statusCode: 404, statusMessage: "Config not found!" });
      }
      return res
        .status(200)
        .json({ statusCode: 200, statusMessage: "success", data: config });
    } catch (error) {
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

router.post(
  "/config/updateBranchDropDowns",
  permissionMiddleware(roles),
  async (req, res) => {
    // @params
    // {
    //   dropDownType: "regions",
    //   value: ["Updated", "Values"]
    // }
    // Essentially send the array of the corresponding dropDownType completely after edits.
    // So that insertion and deletion can be done in the same route.

    const { updateVal, type, dropType } = req.body;
    try {
      if (!dropType || !updateVal || !type) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "Bad Request. Missing Information",
        });
      }
      let updatedDoc;
      if (type === "del") {
        updatedDoc = await database.staticDB.findOneAndUpdate(
          { type: "branchDropDown" },
          { $pull: { [dropType]: updateVal } },
          { returnDocument: "after" }
        );
        database.adminLogs.insertOne({
          userId: req.user.userId,
          userEmail: req.user.user,
          type: "branchDropDown",
          message: `Deleted ${updateVal} from ${dropType}`,
          timestamp: Date.now(),
        });
      } else if (type === "insert") {
        updatedDoc = await database.staticDB.findOneAndUpdate(
          { type: "branchDropDown" },
          { $push: { [dropType]: updateVal } },
          { returnDocument: "after" }
        );
        database.adminLogs.insertOne({
          userId: req.user.userId,
          userEmail: req.user.user,
          type: "branchDropDown",
          message: `Updated ${dropType} with ${updateVal}`,
          timestamp: Date.now(),
        });
      }

      return res
        .status(200)
        .json({ statusCode: 200, statusMessage: "success", data: updatedDoc });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

router.get(
  "/config/getDropDowns",
  permissionMiddleware(roles),
  async (req, res) => {
    try {
      const config = await database.staticDB.findOne({
        type: "branchDropDown",
      });
      if (!config) {
        return res
          .status(404)
          .json({ statusCode: 404, statusMessage: "Config not found!" });
      }
      return res
        .status(200)
        .json({ statusCode: 200, statusMessage: "success", data: config });
    } catch (error) {
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

router.post(
  "/config/updateDropDowns",
  permissionMiddleware(roles),
  async (req, res) => {
    // @params
    // {
    //   dropDownType: "regions",
    //   value: ["Updated", "Values"]
    // }
    // Essentially send the array of the corresponding dropDownType completely after edits.
    // So that insertion and deletion can be done in the same route.

    const { updateVal, type, dropType } = req.body;
    try {
      if (!dropType || !updateVal || !type) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "Bad Request. Missing Information",
        });
      }
      let updatedDoc;
      if (type === "del") {
        updatedDoc = await database.staticDB.findOneAndUpdate(
          { type: "branchDropDown" },
          { $pull: { [dropType]: updateVal } },
          { returnDocument: "after" }
        );
        database.adminLogs.insertOne({
          userId: req.user.userId,
          userEmail: req.user.user,
          type: "branchDropDown",
          message: `Deleted ${updateVal} from ${dropType}`,
          timestamp: Date.now(),
        });
      } else if (type === "insert") {
        updatedDoc = await database.staticDB.findOneAndUpdate(
          { type: "branchDropDown" },
          { $push: { [dropType]: updateVal } },
          { returnDocument: "after" }
        );
        database.adminLogs.insertOne({
          userId: req.user.userId,
          userEmail: req.user.user,
          type: "branchDropDown",
          message: `Updated ${dropType} with ${updateVal}`,
          timestamp: Date.now(),
        });
      }

      return res
        .status(200)
        .json({ statusCode: 200, statusMessage: "success", data: updatedDoc });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

router.post(
  "/",
  permissionMiddleware(roles, PermissionField.Flags.EditDevice),
  async (req, res) => {
    const data = req.body || {};
    try {
      if (!data.branch) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "Bad Request. Missing Information",
        });
      }
      const branch = {};
      for (const key of branchKeys) {
        if (!data.branch.hasOwnProperty(key)) {
          return res.status(400).json({
            statusCode: 400,
            statusMessage: "Bad Request. Missing data key - " + key,
          });
        }
        branch[key] = data.branch[key];
      }
      await database.branches.updateOne(
        { Code: branch.Code },
        { $set: branch },
        { upsert: true }
      );

      await database.buffer.updateMany(
        { "branch.Code": branch.Code },
        {
          $set: {
            "branch.Branch_Name": branch.Branch_Name,
            "branch.Code": branch.Code,
            "branch.Region": branch.Region,
            "branch.Hub": branch.Hub,
            "branch.Vertical": branch.Vertical
          },
        }
      );

      database.adminLogs.insertOne({
        userId: req.user.userId,
        userEmail: req.user.user,
        type: "branches",
        message: `Updated/Inserted branch with code ${
          branch.Code || "Unknown"
        }`,
        timestamp: Date.now(),
      });
      return res
        .status(200)
        .json({ statusCode: 200, statusMessage: "success" });
    } catch (error) {
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

router.delete(
  "/:Code",
  permissionMiddleware(roles, PermissionField.Flags.EditDevice), // Using EditDevice as it's the flag used in POST
  async (req, res) => {
    try {
      const code = req.params.Code;
      const result = await database.branches.deleteMany({
        Code: code,
      });
      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ statusCode: 404, statusMessage: "Branch not found" });
      }

      // Unset branch info from devices
      await database.devices.updateMany(
        { Branch_Code: code },
        { $unset: { Branch_Code: "", Branch_Name: "" } }
      );

      // Unset branch info from buffer
      await database.buffer.updateMany(
        { "branch.Code": code },
        { $set: { branch: {} } }
      );

      database.adminLogs.insertOne({
        userId: req.user.userId,
        userEmail: req.user.user,
        type: "branches",
        message: `Deleted branch with code ${code}`,
        timestamp: Date.now(),
      });
      return res
        .status(200)
        .json({ statusCode: 200, statusMessage: "success" });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

export default router;
