import express from "express";
import { permissionMiddleware } from "../middlewares/permissions.js";
import { roles, database } from "../services/mongodb.service.js";
import { PermissionField } from "../utils/constants.js";
import { createRoleKey } from "../utils/utils.js";

const router = express.Router();

router.get("/", permissionMiddleware(roles, PermissionField.Flags.ViewRoles), async (req, res) => {
    try {
      const rolesTemp = JSON.parse(
        JSON.stringify(
          roles,
          (key, value) =>
            typeof value === "bigint" ? value.toString() : value // return everything else unchanged
        )
      );
      const permissions = Object.entries(PermissionField.Flags);
      for (let i = 0; i < rolesTemp.length; i++) {
        try {
          const perm = BigInt(rolesTemp[i].permissions);
          rolesTemp[i].permissions = permissions.filter((x) => perm & x[1]).map((x) => x[0]);
        } catch (e) {
          console.log(e);
          console.log(rolesTemp[i]);
        }
      }
      return res.status(200).json({
        statusCode: 200,
        statusMessage: "success",
        data: {
          roles: rolesTemp,
          permissions: Object.keys(PermissionField.Flags),
        },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

router.post("/", permissionMiddleware(roles, PermissionField.Flags.EditRole), async (req, res) => {
    try {
      const { name, desc, permissions } = req.body;
      if (!name || !desc || !permissions) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "Bad Request. Missing Information",
        });
      }
      if (!Array.isArray(permissions))
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "Bad Request. Invalid Permission",
        });
      let perm = 0n;
      for (let i = 0; i < permissions.length; i++) {
        if (!PermissionField.Flags.hasOwnProperty(permissions[i])) {
          return res.status(400).json({
            statusCode: 400,
            statusMessage: "Bad Request. Unknown Permission",
          });
        }
        perm |= PermissionField.Flags[permissions[i]];
      }
      const key = createRoleKey(
        name,
        roles.map((i) => i.value)
      );
      await database.roles.insertOne({
        name: name,
        desc: desc,
        permissions: perm.toString(),
        value: key,
      });
      roles.push({
        name: name,
        desc: desc,
        permissions: perm,
        value: key,
      });
      database.adminLogs.insertOne({
        userId: req.user.userId,
        userEmail: req.user.user,
        type: "auth",
        message:  `Created role with name ${name} and permissions ${permissions.join(", ")}`,
        timestamp: Date.now(),
      });
      return res.status(200).json({
        statusCode: 200,
        statusMessage: "success",
        data: {
          name: name,
          desc: desc,
          permissions: permissions,
          value: key,
        },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

router.patch("/", permissionMiddleware(roles, PermissionField.Flags.EditRole), async (req, res) => {
    try {
      const { value, name, desc, permissions } = req.body;
      if (!value || (!name && !desc && !permissions)) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "Bad Request. Missing Information",
        });
      }
      const roleIndex = roles.findIndex((role) => role.value === value);
      if (roleIndex === -1) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "Bad Request. Unknown Role",
        });
      }
      let updateFields = {};
      if (name) updateFields.name = name;
      if (desc) updateFields.desc = desc;
      if (permissions) {
        if (!Array.isArray(permissions))
          return res.status(400).json({
            statusCode: 400,
            statusMessage: "Bad Request. Invalid Permission",
          });
        let perm = 0n;
        for (let i = 0; i < permissions.length; i++) {
          if (!PermissionField.Flags[permissions[i]]) {
            return res.status(400).json({
              statusCode: 400,
              statusMessage: "Bad Request. Unknown Permission",
            });
          }
          perm |= PermissionField.Flags[permissions[i]];
        }
        updateFields.permissions = perm;
      }
      await database.roles.updateOne(
        { value },
        {
          $set: {
            ...updateFields,
            permissions: updateFields.permissions.toString(),
          },
        }
      );
      roles[roleIndex] = { ...roles[roleIndex], ...updateFields };
      database.adminLogs.insertOne({
        userId: req.user.userId,
        userEmail: req.user.user,
        type: "auth",
        message: `Updated role with name ${name} (${value})`, 
        timestamp: Date.now(),
      });
      return res.status(200).json({
        statusCode: 200,
        statusMessage: "success",
        data: {
          name: name || roles[roleIndex].name,
          desc: desc || roles[roleIndex].desc,
          permissions:
            permissions ||
            Object.keys(PermissionField.Flags).filter(
              (x) => roles[roleIndex].permissions & PermissionField.Flags[x]
            ),
          value: value,
        },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

router.delete("/", permissionMiddleware(roles, PermissionField.Flags.EditRole), async (req, res) => {
    try {
      const { value } = req.body;
      if (!value) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "Bad Request. Missing Role Value",
        });
      }
      const role = roles.find((role) => role.value === value);
      
      if (!role) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage: "Bad Request. Unknown Role",
        });
      }
      const userCount = await database.auth.countDocuments({ role: value });
      if (userCount > 0) {
        return res.status(400).json({
          statusCode: 400,
          statusMessage:
            "Bad Request. You need to re-assign users who have this role first.",
        });
      }
      await database.roles.deleteOne({ value });
      roles.splice(roleIndex, 1);
      database.adminLogs.insertOne({
        userId: req.user.userId,
        userEmail: req.user.user,
        type: "auth",
        message: `Deleted role with name ${role.name} (${value})`,
        timestamp: Date.now(),
      });
      return res
        .status(200)
        .json({ statusCode: 200, statusMessage: "success", data: value });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ statusCode: 500, statusMessage: "Something went wrong." });
    }
  }
);

export default router;