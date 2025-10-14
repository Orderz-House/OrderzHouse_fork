import bcrypt from "bcryptjs";
import { logAdminAction } from "../logger.js";

/**
 * ✅ Admin authentication (only role_id = 1 is allowed)
 */
export const authenticateAdmin = (pool) => {
  return async (email, password) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email.toLowerCase()]
      );
      const user = rows[0];

      if (!user) {
        await logAdminAction(
          null,
          email,
          "❌ Failed login - User not found",
          null,
          pool
        );
        throw new Error("Invalid email or password");
      }

      if (user.role_id !== 1) {
        await logAdminAction(
          user.id,
          user.email,
          `⚠ Unauthorized login attempt - Role ID: ${user.role_id}`,
          user.role_id,
          pool
        );
        throw new Error("You are not allowed to login as admin");
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await logAdminAction(
          user.id,
          user.email,
          "❌ Failed login - Invalid password",
          user.role_id,
          pool
        );
        throw new Error("Invalid email or password");
      }

      await logAdminAction(
        user.id,
        user.email,
        "✅ Admin login successful",
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
        `❌ Authentication error: ${error.message}`,
        null,
        pool
      );
      throw new Error(error.message || "Authentication failed");
    }
  };
};

/**
 * ✅ Unified AdminJS + HTTP logger
 * Logs:
 * - AdminJS actions (new/edit/delete/list/etc.)
 * - API requests under `/admin`
 */
export const createAdminLogMiddleware = (pool) => {
  return (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;

    const logAction = (statusCode) => {
      if (!req.user) return;

      let message = null;

      // 🔹 AdminJS resource actions
      if (req.originalUrl.includes("/admin/resources")) {
        const urlParts = req.originalUrl.split("/");
        const resourceIndex = urlParts.indexOf("resources");
        const resource = urlParts[resourceIndex + 1] || "unknown";
        const recordId = urlParts[resourceIndex + 2] || null;

        message = `⚡ Admin ${req.user.email} executed ${
          req.method
        } on ${resource}${
          recordId ? ` (ID: ${recordId})` : ""
        } - Status: ${statusCode}`;
      }

      // 🔹 Custom API routes (`/admin/...`)
      else if (req.originalUrl.startsWith("/admin")) {
        message = `🌐 [API] Admin ${req.user.email} -> ${req.method} ${req.originalUrl} - Status: ${statusCode}`;
      }

      if (message) {
        logAdminAction(
          req.user.id,
          req.user.email,
          message,
          req.user.role_id,
          pool
        ).catch(() => {});
      }
    };

    res.send = function (body) {
      logAction(res.statusCode);
      return originalSend.call(this, body);
    };

    res.json = function (body) {
      logAction(res.statusCode);
      return originalJson.call(this, body);
    };

    next();
  };
};
