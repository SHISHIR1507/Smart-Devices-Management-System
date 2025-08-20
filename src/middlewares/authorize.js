import ApiError from "../utils/ApiError.js";

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError("Not authenticated", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError("You are not authorized to access this resource", 403));
    }

    next(); 
  };
};
