import jwt from "jsonwebtoken";
import { PermissionFlags } from "../utils/constants.js";

const jwtSalt = process.env.JWT_SALT;

export function permissionMiddleware(roles, permission) {
  return (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ statusCode: 401, statusMessage: "Unauthorized" });
    }
    let role;
    try {
      const parsedToken = jwt.verify(token, jwtSalt);
      role = parsedToken.role;
      req.user = parsedToken;
    } catch (error) {
      console.log(error);
      return res
        .status(401)
        .json({ statusCode: 401, statusMessage: "Invalid Token" });
    }
    if (permission) {
      const userRole = roles.find((x) => x.value === role);
      if (!userRole)
        return res
          .status(403)
          .json({ statusCode: 403, statusMessage: "Forbidden. Unknown Role" });
      try {
        if (
          userRole.permissions & PermissionFlags.Administrator ||
          userRole.permissions & permission
        ) {
          return next();
        }
      } catch (err) {
        console.log(err);
      }
      return res
        .status(403)
        .json({ statusCode: 403, statusMessage: "Forbidden" });
    }
    next();
  };
}
