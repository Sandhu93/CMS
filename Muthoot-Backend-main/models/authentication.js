import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PermissionField } from "../utils/constants.js";
import { database, roles } from "../services/mongodb.service.js";

const jwtSalt = process.env.JWT_SALT;
const collection = database.auth;

//adding user to db
export async function create(email, password, name, role) {
    //check if user exist
    const user = await collection.findOne({ email: email });
    //validate
    if (user) {
      return {
        statusCode: 400,
        statusText: `Bad Request. This email already exists: ${email}`,
      };
    }
    const newUser = {
      email: email,
      name: name,
      role: role,
      password: bcrypt.hashSync(password, 10),
      mfa: false,
      hasSetPassword: false,
    };

    //insert user
    const result = await collection.insertOne(newUser);
    return {
      statusCode: 200,
      data: result,
    };
}


// update user
export async function update(email, payload = {}) {
    const user = await collection.findOne({ email: email });
    if (!user) {
      return {
        statusCode: 404,
        statusText: "User not found",
      };
    }
    const newUser = {
      hasSetPassword: true,
    };
    if (payload.password) {
      newUser.password = bcrypt.hashSync(payload.password, 10);
    }
    if (payload.name) {
      newUser.name = payload.name;
    }
    // update user
    const result = await collection.updateOne(
      { email: email },
      { $set: newUser }
    );
    return {
      statusCode: 200,
    };
}


export async function authenticate(email, password) {
  //find the user using email
  const user = await collection.findOne({ email });
  //if user is truthy then sign the token
  if (!user) {
    return {
      statusCode: 404,
      statusText: "User not found",
    };
  } else if (!bcrypt.compareSync(password, user.password)) {
    return {
      statusCode: 401,
      statusText: "Incorrect Password",
    };
  }
  let token;
  if (!user.mfa) {
    token = jwt.sign({ user: email, role: user.role, userId: user._id }, jwtSalt, {
      expiresIn: "7d",
    });
  }
  const role = roles.find((x) => x.value === user.role);
  const permissions = Object.entries(PermissionField.Flags);
  const perm =
    role.permissions & PermissionField.Flags.Administrator
      ? PermissionField.All
      : BigInt(role.permissions);
  return {
    statusCode: 200,
    data: {
      userId: user._id,
      name: user.name,
      role: user.role,
      permissions: permissions.filter((x) => perm & x[1]).map((x) => x[0]),
      email: user.email,
      mfa: user.mfa,
      mfaEnabled: user.mfa ? true : false,
      hasSetPassword: user.hasSetPassword,
      token,
    },
  };
}