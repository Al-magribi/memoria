import jwt from "jsonwebtoken";
import User from "../models/UserSchema.js";

export const verify = () => {
  return async (req, res, next) => {
    try {
      const { token } = req.cookies;

      if (!token) {
        return res.status(401).json({
          message: "Access denied. No token provided.",
        });
      }

      const decoded = jwt.verify(token, process.env.SECRET);

      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          message: "Invalid token. User not found.",
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          message: "Account is deactivated.",
        });
      }

      // Add user to request object
      req.user = user;

      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          message: "Invalid token.",
        });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired.",
        });
      }
      return res.status(500).json({
        message: "Internal server error during authentication.",
      });
    }
  };
};
