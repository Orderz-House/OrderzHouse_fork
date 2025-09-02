import AdminJS from "adminjs";
import session from "express-session";
import Connect from "connect-pg-simple";
import dotenv from "dotenv";
import { Adapter, Database, Resource } from "@adminjs/sql";
import { componentLoader, Components } from "./Admin/adminUi.js";
import pg from "pg";
import bcrypt from "bcryptjs";

// Import separated modules
import { dashboardHandler, analyticsHandler } from "./Admin/handlers.js";
import { logAdminAction } from "./Admin/logger.js";
import { createResourceConfigs } from "./Admin/resources.js";
import { checkTableExists } from "./Admin/utils.js";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export const AdminInit = async (app) => {
  const AdminJSExpress = (await import("@adminjs/express")).default;
  AdminJS.registerAdapter({ Database, Resource });

  const db = await new Adapter("postgresql", {
    connectionString: process.env.DB_URL,
    database: "OrderzHouse",
  }).init();

  // Check which tables exist
  const [subCategoriesTableExists, paymentsTableExists, receiptsTableExists] =
    await Promise.all([
      checkTableExists("sub_categories", pool),
      checkTableExists("payments", pool),
      checkTableExists("receipts", pool),
    ]);

  // Get resource configurations
  const resources = await createResourceConfigs(
    db,
    { subCategoriesTableExists, paymentsTableExists, receiptsTableExists },
    logAdminAction
  );

  const admin = new AdminJS({
    rootPath: "/admin",
    componentLoader,
    dashboard: {
      component: Components.Dashboard,
      handler: () => dashboardHandler(pool),
    },
    branding: {
      companyName: "OrderzHouse Admin",
      logo: "https://ti8ah.com/wp-content/uploads/2025/07/OrderzHouse-Logo-01-.png",
      softwareBrothers: false,
      theme: {
        colors: {
          primary100: "#3b82f6",
          primary80: "#60a5fa",
          primary60: "#93c5fd",
          primary40: "#bfdbfe",
          primary20: "#dbeafe",
        },
      },
    },
    pages: {
      analytics: {
        component: Components.Analytics,
        handler: (request) => analyticsHandler(request, pool),
        icon: "BarChart3",
      },
    },
    resources,
  });

  if (process.env.NODE_ENV !== "production") admin.watch();

  const ConnectSession = Connect(session);
  const sessionStore = new ConnectSession({
    conObject: {
      connectionString: process.env.DB_URL,
      ssl: process.env.NODE_ENV === "production",
    },
    tableName: "session",
    createTableIfMissing: true,
  });

  // -------------------------------
  // Auth & Logging Fixes
  // -------------------------------
  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
    authenticate: async (email, password) => {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND role_id = 1",
        [email.toLowerCase()]
      );
      const user = rows[0];

      if (user) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
          // Log successful login with correct user_id & role_id
          await logAdminAction(
            user.id,
            user.email,
            `Admin login successful for ${user.first_name} ${user.last_name} (${user.email})`,
            1, // role_id = 1 for admin
            pool
          );
          return user;
        } else {
          await logAdminAction(
            null,
            email,
            `Failed login attempt for ${email} - Invalid password`,
            null,
            pool
          );
        }
      } else {
        await logAdminAction(
          null,
          email,
          `Failed login attempt for ${email} - User not found or not admin`,
          null,
          pool
        );
      }
      return null;
    },
    cookiePassword: process.env.COOKIE_SECRET || "some-secret",
  });

  // -------------------------------
  // Middleware for logging admin actions
  // -------------------------------
  const logAdminActionMiddleware = (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;

    const logAction = () => {
      if (shouldLogAction(req)) {
        const action = `${req.method} ${req.originalUrl}`;
        const resourceInfo = extractResourceInfo(req.originalUrl);
        const logMessage = `Admin ${req.user.email} performed ${req.method}${resourceInfo} - Status: ${res.statusCode}`;
        logAdminAction(req.user.id, req.user.email, logMessage, req.user.role_id, pool).catch(() => {});
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

  function shouldLogAction(req) {
    return (
      req.user &&
      req.originalUrl.startsWith("/admin/api") &&
      !req.originalUrl.includes("/dashboard") &&
      !req.originalUrl.includes("/analytics") &&
      !req.originalUrl.includes("/logs") &&
      req.method !== "GET"
    );
  }

  function extractResourceInfo(url) {
    const urlParts = url.split("/");
    if (urlParts.includes("resources")) {
      const resourceIndex = urlParts.indexOf("resources");
      if (resourceIndex + 1 < urlParts.length) {
        const resource = urlParts[resourceIndex + 1];
        const recordId = urlParts[resourceIndex + 2] || null;
        return recordId ? ` on ${resource} ID: ${recordId}` : ` on ${resource}`;
      }
    }
    return "";
  }

  app.use(admin.options.rootPath, logAdminActionMiddleware, adminRouter);

  // -------------------------------
  // Dashboard & Logs API
  // -------------------------------
  app.get("/api/admin/dashboard", async (req, res) => {
    try {
      const dashboardData = await dashboardHandler(pool);
      res.json(dashboardData);
    } catch (error) {
      console.error("Dashboard API error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const analyticsData = await analyticsHandler(req, pool);
      res.json(analyticsData);
    } catch (error) {
      console.error("Analytics API error:", error);
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });

  // Logs endpoint with correct role_id and email
  app.get("/api/admin/dashboard/logs", async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query(`
        SELECT l.id, l.user_id, l.action, l.created_at,
               COALESCE(u.first_name, 'System') as first_name,
               COALESCE(u.last_name, 'Admin') as last_name,
               COALESCE(u.email, 'system@admin') as email,
               COALESCE(u.role_id, 1) as role_id
        FROM logs l
        LEFT JOIN users u ON u.id = l.user_id
        ORDER BY l.created_at DESC
        LIMIT 20
      `);
      client.release();

      res.json({
        success: true,
        recentLogs: result.rows || [],
      });
    } catch (error) {
      console.error("Logs API error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch logs",
        recentLogs: [],
      });
    }
  });

  console.log(`✅ AdminJS mounted at ${admin.options.rootPath}`);
};
