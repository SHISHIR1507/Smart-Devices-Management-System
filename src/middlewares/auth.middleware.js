import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

export const authenticate = (req, res, next) => {
  const token = req.cookies.jwt || req.headers["authorization"]?.split(" ")[1];
  
  if (!token) {
    return next(new ApiError("Not authenticated", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    return next(new ApiError("Invalid or expired token", 401));
  }
};
