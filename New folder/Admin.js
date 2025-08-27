import AdminJS from "adminjs";
import Connect from "connect-pg-simple";
import session from "express-session";
import dotenv from "dotenv";
import { Adapter, Database, Resource } from "@adminjs/sql";

dotenv.config();

const DEFAULT_ADMIN = {
  email: "admin@example.com",
  password: "password",
};

const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

export const AdminInit = async (app) => {
  const AdminJSExpress = (await import("@adminjs/express")).default;

  AdminJS.registerAdapter({
    Database,
    Resource,
  });

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
          properties: {
            created_at: { isVisible: false },
            updated_at: { isVisible: false },
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
