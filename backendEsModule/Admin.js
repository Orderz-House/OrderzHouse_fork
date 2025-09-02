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

  // Store pool reference in db for resources to access
  db.pool = pool;

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
      companyName: "OrderzHouse",
      withMadeWithLove: false,
      logo: "https://ti8ah.com/wp-content/uploads/2025/07/OrderzHouse-Logo-01-.png",
      softwareBrothers: false,
      theme: {
        colors: {
          // Main colors - clean and professional
          primary100: "#000000",
          primary80: "#1a1a1a", 
          primary60: "#333333",
          primary40: "#666666",
          primary20: "#999999",
          
          // Background colors - clean whites and light grays
          bg: "#ffffff",
          hoverBg: "#f8f9fa",
          
          // Navigation - light gray as requested
          sidebar: "#f8f9fa",
          navigation: "#f1f3f4",
          
          // Text colors - all black
          text: "#000000",
          label: "#000000",
          
          // Borders and accents
          border: "#e9ecef",
          filterBg: "#ffffff",
          accent: "#000000",
          
          // Button colors
          button: "#000000",
          buttonHover: "#1a1a1a",
        },
        // Custom CSS to override default styles
        overrides: {
          // Navigation sidebar - clean modern styling
          '.adminjs_SidebarNav': {
            backgroundColor: '#fafbfc !important',
            borderRight: '1px solid #e6eaef !important',
            width: '240px !important',
            boxShadow: '0 0 0 1px rgba(63,63,68,0.05), 0 1px 3px 0 rgba(63,63,68,0.15) !important'
          },
          
          // Logo area
          '.adminjs_Logo': {
            backgroundColor: '#fafbfc !important',
            padding: '20px 24px !important',
            borderBottom: '1px solid #e6eaef !important'
          },
          
          // Navigation sections
          '.adminjs_SidebarNavSection': {
            padding: '16px 0 !important'
          },
          
          '.adminjs_SidebarNavSectionTitle': {
            color: '#6b7280 !important',
            fontSize: '11px !important',
            fontWeight: '600 !important',
            textTransform: 'uppercase !important',
            letterSpacing: '0.8px !important',
            padding: '0 24px 8px 24px !important',
            margin: '0 !important'
          },
          
          // Navigation items - professional styling
          '.adminjs_SidebarNavItem': {
            color: '#374151 !important',
            padding: '8px 24px !important',
            margin: '0 8px !important',
            borderRadius: '6px !important',
            fontSize: '14px !important',
            fontWeight: '500 !important',
            transition: 'all 0.15s ease !important'
          },
          
          '.adminjs_SidebarNavItem:hover': {
            backgroundColor: '#f3f4f6 !important',
            color: '#111827 !important',
            transform: 'translateX(2px) !important'
          },
          
          '.adminjs_SidebarNavItem.active, .adminjs_SidebarNavItem[aria-current="page"]': {
            backgroundColor: '#f9fafb !important',
            color: '#111827 !important',
            borderLeft: '3px solid #3b82f6 !important',
            fontWeight: '600 !important'
          },
          
          // Navigation icons
          '.adminjs_SidebarNavItem svg': {
            marginRight: '10px !important',
            width: '16px !important',
            height: '16px !important',
            opacity: '0.7 !important'
          },
          
          '.adminjs_SidebarNavItem:hover svg': {
            opacity: '1 !important'
          },
          
          // Header styling - clean and minimal
          '.adminjs_TopBar': {
            backgroundColor: '#ffffff !important',
            borderBottom: '1px solid #e6eaef !important',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important',
            height: '60px !important',
            padding: '0 24px !important'
          },
          
          // Content area
          '.adminjs_Wrapper': {
            backgroundColor: '#ffffff !important'
          },
          
          '.adminjs_WrapperBox': {
            backgroundColor: '#ffffff !important',
            padding: '0 !important'
          },
          
          // Make all text black for content
          '.adminjs_H1, .adminjs_H2, .adminjs_H3, .adminjs_H4, .adminjs_H5, .adminjs_H6': {
            color: '#111827 !important'
          },
          
          '.adminjs_Label': {
            color: '#374151 !important'
          },
          
          '.adminjs_PropertyLabel': {
            color: '#374151 !important'
          },
          
          // User menu in header
          '.adminjs_CurrentUserNav': {
            color: '#374151 !important'
          },
          
          // Buttons
          '.adminjs_Button': {
            borderRadius: '6px !important',
            fontWeight: '500 !important',
            transition: 'all 0.15s ease !important'
          },
          
          // Tables
          '.adminjs_Table': {
            borderRadius: '8px !important',
            overflow: 'hidden !important',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1) !important'
          },
          
          '.adminjs_TableHead': {
            backgroundColor: '#f9fafb !important'
          },
          
          // Cards and boxes
          '.adminjs_Box': {
            borderRadius: '8px !important',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1) !important',
            border: '1px solid #e6eaef !important'
          },
          
          // Breadcrumbs
          '.adminjs_Breadcrumbs': {
            color: '#6b7280 !important'
          }
        }
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
          // Log successful login
          await logAdminAction(
            user.id,
            user.email,
            `Admin login successful for ${user.first_name} ${user.last_name} (${user.email})`,
            1,
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
        const resourceInfo = extractResourceInfo(req.originalUrl);
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
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const analyticsData = await analyticsHandler(req, pool);
      res.json(analyticsData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });

  // Logs endpoint
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
      res.status(500).json({
        success: false,
        error: "Failed to fetch logs",
        recentLogs: [],
      });
    }
  });

  console.log(`AdminJS mounted at ${admin.options.rootPath}`);
};