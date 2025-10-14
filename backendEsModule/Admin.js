import AdminJS from "adminjs";
import session from "express-session";
import Connect from "connect-pg-simple";
import dotenv from "dotenv";
import { Adapter, Database, Resource } from "@adminjs/sql";
import { componentLoader, Components } from "./Admin/adminUi.js";
import pg from "pg";

import { dashboardHandler, analyticsHandler } from "./Admin/handlers.js";
import { createResourceConfigs } from "./Admin/resources/resources.js";
import { checkTableExists } from "./Admin/utils.js";
import {
  authenticateAdmin,
  createAdminLogMiddleware,
} from "./Admin/middleware/adminAuth.js";
import adminRoutes from "./Admin/routes/admin.js";
import { adminThemeConfig } from "../frontend/admin-components/adminTheme/theme.js";

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

  db.pool = pool;
  app.locals.pool = pool;

  // Check extra tables if needed
  const [
    subCategoriesTableExists,
    paymentsTableExists,
    receiptsTableExists,
    coursesTableExists,
    courseMaterialsTableExists,
    courseEnrollmentsTableExists,
  ] = await Promise.all([
    checkTableExists("sub_categories", pool),
    checkTableExists("payments", pool),
    checkTableExists("receipts", pool),
    checkTableExists("courses", pool),
    checkTableExists("course_materials", pool),
    checkTableExists("course_enrollments", pool),
  ]);

  const tableExists = (tableName) => {
    const tableMap = {
      sub_categories: subCategoriesTableExists,
      payments: paymentsTableExists,
      receipts: receiptsTableExists,
      courses: coursesTableExists,
      course_materials: courseMaterialsTableExists,
      course_enrollments: courseEnrollmentsTableExists,
    };
    return tableMap[tableName] || false;
  };

  const resources = await createResourceConfigs(
  db,
  tableExists,
  (await import("./Admin/logger.js")).logAdminAction,
  pool  
);

  const admin = new AdminJS({
    rootPath: "/admin",
    componentLoader,
    dashboard: {
      component: Components.Dashboard,
      handler: () => dashboardHandler(pool),
    },
    branding: {
      companyName: "OrderzHouse Admin Panel",
      withMadeWithLove: false,
      logo: "https://ti8ah.com/wp-content/uploads/2025/07/OrderzHouse-Logo-01-.png",
      softwareBrothers: false,
      favicon:
        "https://ti8ah.com/wp-content/uploads/2025/07/OrderzHouse-Logo-01-.png",
      theme: adminThemeConfig,
    },
    pages: {
      // analytics: {
      //   component: Components.Analytics, // your UsersAnalytics page
      //   handler: (request) => analyticsHandler(request, pool), // optional extra data
      //   icon: "BarChart3",
      // },
    },
    resources,
  });

  if (process.env.NODE_ENV !== "production") admin.watch();

  // Session setup
  const ConnectSession = Connect(session);
  const sessionStore = new ConnectSession({
    conObject: {
      connectionString: process.env.DB_URL,
      ssl: process.env.NODE_ENV === "production",
    },
    tableName: "session",
    createTableIfMissing: true,
  });

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate: authenticateAdmin(pool),
      cookiePassword: process.env.COOKIE_SECRET || "some-secret",
    },
    null,
    {
      secret: process.env.COOKIE_SECRET || "some-secret",
      saveUninitialized: false,
      resave: false,
      store: sessionStore,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      },
    }
  );

  app.use(admin.options.rootPath, createAdminLogMiddleware(pool), adminRouter);

  // Protect custom admin API routes
  const requireAdmin = (req, res, next) => {
    if (!req.session || !req.session.adminUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (req.session.adminUser.role_id !== 1) {
      return res.status(403).json({ error: "Admin access required" });
    }
    req.user = req.session.adminUser;
    next();
  };

  app.use("/admin", requireAdmin, adminRoutes);

  // --- NEW: Single User Analytics API endpoint ---
  app.get("/analytics/users", requireAdmin, async (req, res) => {
    try {
      const { timeRange } = req.query;
      const analytics = await getUsersAnalytics(pool, timeRange);
      res.json(analytics);
    } catch (err) {
      console.error("Analytics API error:", err);
      res.status(500).json({ error: "Failed to fetch user analytics" });
    }
  });

  console.log(
    `✅ OrderzHouse Admin Panel mounted at ${admin.options.rootPath}`
  );
};
