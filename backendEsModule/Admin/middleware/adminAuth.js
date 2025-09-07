import bcrypt from "bcryptjs";
import { logAdminAction } from "../logger.js";

export const authenticateAdmin = (pool) => {
  return async (email, password) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email.toLowerCase()]
      );
      const user = rows[0];

      // User not found
      if (!user) {
        await logAdminAction(
          null,
          email,
          `Failed login attempt - User not found`,
          null,
          pool
        );
        throw new Error("Invalid email or password");
      }

      // User is not admin
      if (user.role_id !== 1) {
        await logAdminAction(
          user.id,
          user.email,
          `Unauthorized login attempt - Role ID: ${user.role_id}`,
          user.role_id,
          pool
        );
        throw new Error("You are not allowed to login as admin");
      }

      // Password check
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await logAdminAction(
          user.id,
          user.email,
          `Failed login attempt - Invalid password`,
          user.role_id,
          pool
        );
        throw new Error("Invalid email or password");
      }

      // Successful login
      await logAdminAction(
        user.id,
        user.email,
        `Admin login successful`,
        user.role_id,
        pool
      );

      return {
        id: user.id,
        email: user.email,
        role_id: user.role_id,
        firstName: user.first_name,
        lastName: user.last_name,
      };
    } catch (error) {
      console.error("Authentication error:", error);
      await logAdminAction(
        null,
        email,
        `Authentication error: ${error.message}`,
        null,
        pool
      );
      throw new Error(error.message || "Authentication failed");
    }
  };
};

/**
 * Middleware to log Admin actions in AdminJS routes
 */
export const createAdminLogMiddleware = (pool) => {
  return (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;

    const logAction = () => {
      if (req.user) {
        const urlParts = req.originalUrl.split("/");
        let resource = null;
        let recordId = null;

        if (urlParts.includes("resources")) {
          const resourceIndex = urlParts.indexOf("resources");
          resource = urlParts[resourceIndex + 1] || null;
          recordId = urlParts[resourceIndex + 2] || null;
        }

        const resourceInfo = resource
          ? recordId
            ? ` on ${resource} ID: ${recordId}`
            : ` on ${resource}`
          : "";

        const logMessage = `Admin ${req.user.email} performed ${req.method}${resourceInfo} - Status: ${res.statusCode}`;
        logAdminAction(
          req.user.id,
          req.user.email,
          logMessage,
          req.user.role_id,
          pool
        ).catch(() => {});
      }
    };

    res.send = function (body) {
      logAction();
      return originalSend.call(this, body);
    };

    res.json = function (body) {
      logAction();
      return originalJson.call(this, body);
    };

    next();
  };
};
