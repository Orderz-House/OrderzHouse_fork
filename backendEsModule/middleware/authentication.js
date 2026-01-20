import jwt from "jsonwebtoken";
import pool from "../models/db.js";

const authentication = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(403).json({ message: "forbidden" });
    }

    const token = req.headers.authorization.split(" ").pop();

    jwt.verify(token, process.env.JWT_SECRET, async (err, result) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: "The token is invalid or expired",
        });
      }

      // Check if user is deleted (from token or DB)
      if (result.is_deleted === true) {
        return res.status(401).json({
          success: false,
          message: "Account has been deleted",
        });
      }

      // Double-check in DB to ensure user still exists and is not deleted
      try {
        const userCheck = await pool.query(
          "SELECT id FROM users WHERE id = $1 AND is_deleted = FALSE",
          [result.userId]
        );
        if (userCheck.rows.length === 0) {
          return res.status(401).json({
            success: false,
            message: "Account has been deleted",
          });
        }
      } catch (dbErr) {
        console.error("Auth middleware DB check error:", dbErr);
        // Continue if DB check fails (don't block request, but log error)
      }

      req.token = result;
      next();
    });
  } catch (error) {
    return res.status(403).json({ message: "forbidden" });
  }
};

const authSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: Token required"));
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error: Invalid token"));
      }

      // attach user to socket
      socket.user = decoded;
      console.log("🔐 Socket authenticated:", decoded);
      next();
    });
  } catch (err) {
    console.error("authSocket error:", err);
    next(new Error("Authentication error"));
  }
};

export { authentication, authSocket };
export default authentication;
