import AdminJS from "adminjs";
import session from "express-session";
import Connect from "connect-pg-simple";
import dotenv from "dotenv";
import { Adapter, Database, Resource } from "@adminjs/sql";

dotenv.config();

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

  const admin = new AdminJS({
    rootPath: "/admin",
    resources: [
      {
        resource: db.table("users"),
        options: {
          id: "users",
          navigation: { name: "Users" }, 
          filterProperties: ["email", "name", "role"],
        },
      },
      {
        resource: db.table("categories"),
        options: {
          id: "freelancing_types",
          navigation: { name: "Freelancing" }, 
        },
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
    ],
  });

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
