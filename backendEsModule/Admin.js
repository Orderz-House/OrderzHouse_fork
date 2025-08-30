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

      const [{ count: clientsCount }] = (
        await client.query(
          `SELECT COUNT(*)::int AS count FROM users WHERE role_id = 2`
        )
      ).rows;

      const [{ count: freelancersCount }] = (
        await client.query(
          `SELECT COUNT(*)::int AS count FROM users WHERE role_id = 3`
        )
      ).rows;

      const [{ count: coursesCount }] = (
        await client.query(
          `SELECT COUNT(*)::int AS count FROM courses WHERE is_deleted = false`
        )
      ).rows;

      const [{ count: enrollmentsCount }] = (
        await client.query(
          `SELECT COUNT(*)::int AS count FROM course_enrollments`
        )
      ).rows;

      const [{ count: pendingAppointments }] = (
        await client.query(
          `SELECT COUNT(*)::int AS count FROM appointments WHERE status = $1`,
          ["pending"]
        )
      ).rows;

      const recentUsers = (
        await client.query(
          `SELECT id, first_name, email, created_at, role_id
             FROM users
             ORDER BY created_at DESC
             LIMIT 5`
        )
      ).rows;

      const recentEnrollments = (
        await client.query(
          `SELECT ce.id, 
                  c.title as course_title, 
                  u.first_name as freelancer_name, 
                  ce.progress, 
                  ce.enrolled_at
             FROM course_enrollments ce
             JOIN courses c ON ce.course_id = c.id
             JOIN users u ON ce.freelancer_id = u.id
             ORDER BY ce.enrolled_at DESC
             LIMIT 5`
        )
      ).rows;

      const recentAppointments = (
        await client.query(
          `SELECT id, message, status, appointment_date, created_at
             FROM appointments
             ORDER BY created_at DESC
             LIMIT 5`
        )
      ).rows;

      return {
        metrics: {
          usersCount,
          clientsCount,
          freelancersCount,
          coursesCount,
          enrollmentsCount,
          pendingAppointments,
        },
        recentUsers,
        recentEnrollments,
        recentAppointments,
        message: "Course Management System",
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
        options: {
          id: "clients",
          navigation: { name: "Manage Clients" },
          filterProperties: ["email", "first_name"],
          listProperties: [
            "id",
            "first_name",
            "last_name",
            "email",
            "created_at",
          ],
          showProperties: [
            "id",
            "first_name",
            "last_name",
            "email",
            "role_id",
            "created_at",
            "updated_at",
          ],
          editProperties: ["first_name", "last_name", "email", "password"],
          properties: {
            role_id: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false,
              },
            },
            password: {
              type: "password",
            },
          },
          actions: {
            list: {
              before: async (request, context) => {
                request.query = {
                  ...request.query,
                  "filters.role_id": "2",
                };
                return request;
              },
            },
            new: {
              before: async (request, context) => {
                if (request.payload) {
                  request.payload.role_id = 2;
                }
                return request;
              },
            },
          },
        },
      },
      {
        resource: db.table("users"),
        options: {
          id: "freelancers",
          navigation: { name: "Manage Freelancers" },
          filterProperties: ["email", "first_name"],
          listProperties: [
            "id",
            "first_name",
            "last_name",
            "email",
            "created_at",
          ],
          showProperties: [
            "id",
            "first_name",
            "last_name",
            "email",
            "role_id",
            "created_at",
            "updated_at",
          ],
          editProperties: ["first_name", "last_name", "email", "password"],
          properties: {
            role_id: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false,
              },
            },
            password: {
              type: "password",
            },
          },
          actions: {
            list: {
              before: async (request, context) => {
                request.query = {
                  ...request.query,
                  "filters.role_id": "3",
                };
                return request;
              },
            },
            new: {
              before: async (request, context) => {
                if (request.payload) {
                  request.payload.role_id = 3;
                }
                return request;
              },
            },
          },
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
        resource: db.table("plans"),
        options: {
          id: "plans",
          navigation: { name: "Subscription Plans" },
          listProperties: ["id", "name", "price", "duration", "description"],
          showProperties: [
            "id",
            "name",
            "price",
            "duration",
            "description",
            "features",
          ],
          editProperties: [
            "name",
            "price",
            "duration",
            "description",
            "features",
          ],
          filterProperties: ["name", "price", "duration"],
          properties: {
            name: {
              type: "string",
              isRequired: true,
            },
            price: {
              type: "currency",
              isRequired: true,
              props: {
                currency: "USD",
              },
            },
            duration: {
              type: "number",
              isRequired: true,
              props: {
                min: 1,
                step: 1,
              },
              description: "Duration in days",
            },
            description: {
              type: "textarea",
              props: {
                rows: 4,
              },
            },
            features: {
              type: "mixed",
              isArray: true,
              props: {
                placeholder: "Enter plan features (one per line)",
              },
            },
          },
        },
      },
      {
        resource: db.table("appointments"),
        options: { id: "appointments", navigation: { name: "Appointments" } },
      },
      {
        resource: db.table("courses"),
        options: {
          id: "courses",
          navigation: { name: "Courses" },
          listProperties: ["id", "title", "price", "created_at", "is_deleted"],
          showProperties: [
            "id",
            "title",
            "description",
            "title_ar",
            "description_ar",
            "price",
            "is_deleted",
            "created_at",
          ],
          editProperties: [
            "title",
            "description",
            "title_ar",
            "description_ar",
            "price",
            "is_deleted",
          ],
          filterProperties: ["title", "is_deleted"],
          properties: {
            price: {
              type: "currency",
              props: {
                currency: "USD",
              },
            },
            is_deleted: {
              type: "boolean",
            },
            description: {
              type: "textarea",
            },
            description_ar: {
              type: "textarea",
            },
          },
        },
      },
      {
        resource: db.table("course_materials"),
        options: {
          id: "course_materials",
          navigation: { name: "Courses" },
          listProperties: ["id", "course_id", "file_url"],
          showProperties: ["id", "course_id", "file_url"],
          editProperties: ["course_id", "file_url"],
          filterProperties: ["course_id"],
          properties: {
            course_id: {
              reference: "courses",
              type: "reference",
            },
            file_url: {
              type: "url",
            },
          },
        },
      },
      {
        resource: db.table("course_enrollments"),
        options: {
          id: "course_enrollments",
          navigation: { name: "Courses" },
          listProperties: [
            "id",
            "course_id",
            "freelancer_id",
            "enrolled_at",
            "progress",
          ],
          showProperties: [
            "id",
            "course_id",
            "freelancer_id",
            "enrolled_at",
            "progress",
          ],
          editProperties: ["course_id", "freelancer_id", "progress"],
          filterProperties: ["course_id", "freelancer_id", "progress"],
          properties: {
            course_id: {
              reference: "courses",
              type: "reference",
            },
            freelancer_id: {
              reference: "freelancers",
              type: "reference",
            },
            progress: {
              type: "number",
              props: {
                min: 0,
                max: 100,
                step: 0.01,
              },
            },
            enrolled_at: {
              type: "datetime",
              isVisible: { edit: false },
            },
          },
          actions: {
            new: {
              before: async (request, context) => {
                if (request.payload && !request.payload.enrolled_at) {
                  request.payload.enrolled_at = new Date();
                }
                return request;
              },
            },
          },
        },
      },
    ],
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
