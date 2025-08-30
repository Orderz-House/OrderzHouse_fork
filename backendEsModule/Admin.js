import AdminJS from "adminjs";
import session from "express-session";
import Connect from "connect-pg-simple";
import dotenv from "dotenv";
import { Adapter, Database, Resource } from "@adminjs/sql";
import { componentLoader, Components } from "./Admin/adminUi.js";
import pg from "pg";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

const DEFAULT_ADMIN = {
  email: "admin@example.com",
  password: "password",
};

const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return DEFAULT_ADMIN;
  }
  return null;
};

export const AdminInit = async (app) => {
  const AdminJSExpress = (await import("@adminjs/express")).default;

  AdminJS.registerAdapter({ Database, Resource });

  const db = await new Adapter("postgresql", {
    connectionString: process.env.DB_URL,
    database: "OrderzHouse",
  }).init();

  const dashboardHandler = async () => {
    const client = await pool.connect();
    try {
      const [{ count: usersCount }] = (
        await client.query(`SELECT COUNT(*)::int AS count FROM users`)
      ).rows;
      const [{ count: coursesCount }] = (
        await client.query(`SELECT COUNT(*)::int AS count FROM courses`)
      ).rows;
      const [{ count: pendingAppointments }] = (
        await client.query(
          `SELECT COUNT(*)::int AS count FROM appointments WHERE status = $1`,
          ["pending"]
        )
      ).rows;

      return {
        metrics: { usersCount, coursesCount, pendingAppointments },
        message: "Dashboard ready",
      };
    } finally {
      client.release();
    }
  };

  const admin = new AdminJS({
    rootPath: "/admin",
    componentLoader,
    dashboard: {
      component: Components.Dashboard,
      handler: dashboardHandler,
    },
    branding: {
      companyName: "OrderzHouse Admin",
      logo: false,
      softwareBrothers: false,
    },
    resources: [
      {
        resource: db.table("users"),
        options: { id: "users", navigation: { name: "Users" } },
      },
      {
        resource: db.table("categories"),
        options: { id: "categories", navigation: { name: "Freelancing" } },
      },
      {
        resource: db.table("appointments"),
        options: { id: "appointments", navigation: { name: "Appointments" } },
      },
      {
        resource: db.table("courses"),
        options: { id: "courses", navigation: { name: "Courses" } },
      },
      {
        resource: db.table("course_materials"),
        options: {
          id: "course_materials",
          navigation: { name: "Courses" },
          properties: { course_id: { reference: "courses" } },
        },
      },
      {
        resource: db.table("course_enrollments"),
        options: {
          id: "course_enrollments",
          navigation: { name: "Courses" },
          properties: {
            course_id: { reference: "courses" },
            freelancer_id: { reference: "users" },
          },
        },
      },

      {
        resource: db.table("subscriptions"),
        options: {
          id: "subscriptions",
          navigation: { name: "Freelancing" },
          properties: {
            freelancer_id: { reference: "users" },
            plan_id: { reference: "plans" },
          },
        },
      },
      {
        resource: db.table("projects"),
        options: {
          id: "projects",
          navigation: { name: "Freelancing" },
          properties: {
            user_id: { reference: "users" },
            category_id: { reference: "categories" },
            sub_category_id: { reference: "sub_categories" },
            assigned_freelancer_id: { reference: "users" },
          },
        },
      },
      {
        resource: db.table("plans"),
        options: {
          id: "plans",
          navigation: { name: "Freelancing" },
        },
      },
      {
        resource: db.table("categories"),
        options: {
          id: "freelancing_categories",
          navigation: { name: "Freelancing" },
        },
      },
    ],
    pages: {
      analytics: { label: "Analytics", component: Components.Analytics },
      usersPage: { label: "Users", component: Components.UsersPage },
      coursesPage: { label: "Courses", component: Components.CoursesPage },
      appointmentsPage: {
        label: "Appointments",
        component: Components.AppointmentsPage,
      },
      ordersPage: { label: "Orders", component: Components.OrdersPage },
    },
  });

  if (process.env.NODE_ENV !== "production") {
    admin.watch();
  }

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
      authenticate,
      cookieName: "adminjs",
      cookiePassword: process.env.ADMIN_COOKIE_SECRET,
    },
    null,
    {
      store: sessionStore,
      resave: true,
      saveUninitialized: true,
      secret: process.env.ADMIN_COOKIE_SECRET,
      cookie: {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      },
      name: "adminjs",
    }
  );

  app.use(admin.options.rootPath, adminRouter);
  console.log(`✅ AdminJS mounted at ${admin.options.rootPath}`);
};
