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
  return email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password
    ? DEFAULT_ADMIN
    : null;
};

const checkColumnExists = async (tableName, columnName) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
      [tableName, columnName]
    );
    return result.rows.length > 0;
  } catch {
    return false;
  } finally {
    client.release();
  }
};

export const AdminInit = async (app) => {
  const AdminJSExpress = (await import("@adminjs/express")).default;
  AdminJS.registerAdapter({ Database, Resource });

  const db = await new Adapter("postgresql", {
    connectionString: process.env.DB_URL,
    database: "OrderzHouse",
  }).init();

  const [
    usersHasUpdatedAt,
    categoriesHasCreatedAt,
    categoriesHasUpdatedAt,
    appointmentsHasUpdatedAt,
    appointmentsHasClientId,
  ] = await Promise.all([
    checkColumnExists("users", "updated_at"),
    checkColumnExists("categories", "created_at"),
    checkColumnExists("categories", "updated_at"),
    checkColumnExists("appointments", "updated_at"),
    checkColumnExists("appointments", "client_id"),
  ]);

  const dashboardHandler = async () => {
    const client = await pool.connect();
    try {
      const queries = await Promise.all([
        client.query(`SELECT COUNT(*)::int AS count FROM users`),
        client.query(
          `SELECT COUNT(*)::int AS count FROM users WHERE role_id = 2`
        ),
        client.query(
          `SELECT COUNT(*)::int AS count FROM users WHERE role_id = 3`
        ),
        client.query(`SELECT COUNT(*)::int AS count FROM courses`),
        client.query(`SELECT COUNT(*)::int AS count FROM plans`),
        client.query(
          `SELECT COUNT(*)::int AS count FROM appointments WHERE status = $1`,
          ["pending"]
        ),
        client.query(`
          SELECT DATE(created_at) as date,
                 COUNT(CASE WHEN role_id = 2 THEN 1 END)::int as clients,
                 COUNT(CASE WHEN role_id = 3 THEN 1 END)::int as freelancers
          FROM users 
          WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY DATE(created_at) ORDER BY date
        `),
        client.query(
          `SELECT status, COUNT(*)::int as count FROM appointments GROUP BY status`
        ),
        client.query(`
          SELECT DATE_TRUNC('week', enrolled_at) as week, COUNT(*)::int as enrollments
          FROM course_enrollments
          WHERE enrolled_at >= CURRENT_DATE - INTERVAL '8 weeks'
          GROUP BY DATE_TRUNC('week', enrolled_at) ORDER BY week
        `),
        client.query(
          `SELECT id, first_name, email, created_at, role_id FROM users ORDER BY created_at DESC LIMIT 5`
        ),
        client.query(
          `SELECT id, name, price, duration, description FROM plans ORDER BY id DESC LIMIT 3`
        ),
        client.query(`
          SELECT a.id, a.message, a.status, a.appointment_date, a.appointment_type, a.created_at,
                 u.first_name as freelancer_name, u.last_name as freelancer_last_name
                 ${
                   appointmentsHasClientId
                     ? ", c.first_name as client_name, c.last_name as client_last_name"
                     : ""
                 }
          FROM appointments a
          LEFT JOIN users u ON a.freelancer_id = u.id AND u.role_id = 3
          ${
            appointmentsHasClientId
              ? "LEFT JOIN users c ON a.client_id = c.id AND c.role_id = 2"
              : ""
          }
          ORDER BY a.created_at DESC LIMIT 5
        `),
      ]);

      const [
        usersCount,
        clientsCount,
        freelancersCount,
        coursesCount,
        plansCount,
        pendingAppointments,
        userTrendsRaw,
        appointmentStats,
        courseProgressRaw,
        recentUsers,
        recentPlans,
        recentAppointments,
      ] = queries.map((q) => q.rows);

      const userTrends = userTrendsRaw.map((row) => ({
        date: new Date(row.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        clients: row.clients,
        freelancers: row.freelancers,
      }));

      const courseProgress = courseProgressRaw.map((row, index) => ({
        week: `Week ${index + 1}`,
        enrollments: row.enrollments,
      }));

      return {
        metrics: {
          usersCount: usersCount[0]?.count || 0,
          clientsCount: clientsCount[0]?.count || 0,
          freelancersCount: freelancersCount[0]?.count || 0,
          coursesCount: coursesCount[0]?.count || 0,
          plansCount: plansCount[0]?.count || 0,
          pendingAppointments: pendingAppointments[0]?.count || 0,
        },
        chartData: { userTrends, appointmentStats, courseProgress },
        recentUsers,
        recentAppointments,
        message: "Hello World",
      };
    } finally {
      client.release();
    }
  };

  const analyticsHandler = async () => {
    const client = await pool.connect();
    try {
      const { range = "7d" } = {};
      const days =
        range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;

      const queries = await Promise.all([
        client.query(`
          SELECT 
            'users' as name, COUNT(*) as count,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') as growth24h,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d,
            ROUND(COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') / 7.0, 1) as avgDailyGrowth,
            MAX(created_at) as lastUpdated
          FROM users
          UNION ALL
          SELECT 
            'appointments' as name, COUNT(*) as count,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') as growth24h,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d,
            ROUND(COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') / 7.0, 1) as avgDailyGrowth,
            MAX(created_at) as lastUpdated
          FROM appointments
          UNION ALL
          SELECT 
            'courses' as name, COUNT(*) as count,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') as growth24h,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d,
            ROUND(COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') / 7.0, 1) as avgDailyGrowth,
            MAX(created_at) as lastUpdated
          FROM courses
          UNION ALL
          SELECT 
            'plans' as name, COUNT(*) as count,
            0 as growth24h, 0 as growth7d, 0 as avgDailyGrowth,
            NOW() as lastUpdated
          FROM plans
        `),
        client.query(`
          SELECT 
            DATE(created_at) as date,
            COUNT(CASE WHEN role_id = 2 THEN 1 END)::int as clients,
            COUNT(CASE WHEN role_id = 3 THEN 1 END)::int as freelancers
          FROM users 
          WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
          GROUP BY DATE(created_at)
          ORDER BY date
        `),
        client.query(`
          SELECT 
            CASE 
              WHEN role_id = 2 THEN 'Clients'
              WHEN role_id = 3 THEN 'Freelancers'
              ELSE 'Others'
            END as name,
            COUNT(*)::int as value
          FROM users 
          GROUP BY role_id
        `),
      ]);

      const [tableStats, userGrowth, userDistribution] = queries.map(
        (q) => q.rows
      );

      return {
        tableStats,
        userGrowth: userGrowth.map((row) => ({
          date: new Date(row.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          clients: row.clients,
          freelancers: row.freelancers,
        })),
        userDistribution,
        analytics: {
          revenue: { total: 0 },
          users: {
            active: userDistribution.reduce((sum, item) => sum + item.value, 0),
          },
          conversion: { rate: 12.5 },
          session: { duration: 8.3 },
        },
      };
    } finally {
      client.release();
    }
  };

  const createUserResource = (roleId, resourceId, navigationName) => ({
    resource: db.table("users"),
    options: {
      id: resourceId,
      navigation: { name: navigationName },
      filterProperties: ["email", "first_name", "last_name"],
      listProperties: ["id", "first_name", "last_name", "email", "created_at"],
      showProperties: [
        "id",
        "first_name",
        "last_name",
        "email",
        "role_id",
        "created_at",
        ...(usersHasUpdatedAt ? ["updated_at"] : []),
      ],
      editProperties: ["first_name", "last_name", "email", "password"],
      properties: {
        role_id: {
          isVisible: { list: false, filter: false, show: true, edit: false },
        },
        password: { type: "password" },
        first_name: { isRequired: true },
        last_name: { isRequired: true },
        email: { isRequired: true },
      },
      actions: {
        list: {
          before: async (request) => {
            request.query = {
              ...request.query,
              "filters.role_id": roleId.toString(),
            };
            return request;
          },
        },
        new: {
          before: async (request) => {
            if (request.payload) request.payload.role_id = roleId;
            return request;
          },
        },
      },
    },
  });

  const admin = new AdminJS({
    rootPath: "/admin",
    componentLoader,
    dashboard: { component: Components.Dashboard, handler: dashboardHandler },
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
        handler: analyticsHandler,
      },
    },
    resources: [
      createUserResource(2, "clients", "Clients"),
      createUserResource(3, "freelancers", "Freelancers"),
      {
        resource: db.table("categories"),
        options: {
          id: "categories",
          navigation: { name: "Categories" },
          listProperties: ["id", "name", "description"],
          showProperties: [
            "id",
            "name",
            "description",
            ...(categoriesHasCreatedAt ? ["created_at"] : []),
            ...(categoriesHasUpdatedAt ? ["updated_at"] : []),
          ],
          editProperties: ["name", "description"],
          filterProperties: ["name"],
          properties: {
            name: { isRequired: true },
            description: { type: "textarea", props: { rows: 3 } },
          },
        },
      },
      {
        resource: db.table("plans"),
        options: {
          id: "plans",
          navigation: { name: "Plans" },
          listProperties: ["id", "name", "price", "duration"],
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
            name: { type: "string", isRequired: true },
            price: {
              type: "currency",
              isRequired: true,
              props: { currency: "USD" },
            },
            duration: {
              type: "number",
              isRequired: true,
              props: { min: 1, step: 1 },
              description: "Duration in days",
            },
            description: { type: "textarea", props: { rows: 4 } },
            features: { type: "mixed", isArray: true },
          },
        },
      },
      {
        resource: db.table("appointments"),
        options: {
          id: "appointments",
          navigation: { name: "Appointments" },
          listProperties: [
            "id",
            ...(appointmentsHasClientId ? ["client_id"] : []),
            "freelancer_id",
            "status",
            "appointment_type",
            "appointment_date",
            "created_at",
          ],
          showProperties: [
            "id",
            ...(appointmentsHasClientId ? ["client_id"] : []),
            "freelancer_id",
            "message",
            "status",
            "appointment_type",
            "appointment_date",
            "created_at",
            ...(appointmentsHasUpdatedAt ? ["updated_at"] : []),
          ],
          editProperties: [
            ...(appointmentsHasClientId ? ["client_id"] : []),
            "freelancer_id",
            "message",
            "status",
            "appointment_type",
            "appointment_date",
          ],
          filterProperties: [
            "status",
            "appointment_type",
            "freelancer_id",
            ...(appointmentsHasClientId ? ["client_id"] : []),
          ],
          properties: {
            ...(appointmentsHasClientId
              ? {
                  client_id: {
                    reference: "clients",
                    type: "reference",
                    isRequired: true,
                  },
                }
              : {}),
            freelancer_id: {
              reference: "freelancers",
              type: "reference",
              isRequired: true,
            },
            status: {
              availableValues: [
                { value: "pending", label: "Pending" },
                { value: "confirmed", label: "Confirmed" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
              ],
              isRequired: true,
            },
            appointment_type: {
              availableValues: [
                { value: "online", label: "Online" },
                { value: "in-person", label: "In Person" },
                { value: "phone", label: "Phone Call" },
              ],
              isRequired: true,
            },
            appointment_date: {
              type: "datetime",
              isRequired: true,
            },
            message: {
              type: "textarea",
              props: { rows: 4 },
            },
            created_at: {
              isVisible: { edit: false, new: false },
              type: "datetime",
            },
          },
          actions: {
            new: {
              before: async (request) => {
                if (request.payload && !request.payload.created_at) {
                  request.payload.created_at = new Date();
                }
                if (request.payload && !request.payload.status) {
                  request.payload.status = "pending";
                }
                if (request.payload && !request.payload.appointment_type) {
                  request.payload.appointment_type = "online";
                }
                return request;
              },
            },
            edit: {
              before: async (request) => {
                return request;
              },
            },
          },
        },
      },
      {
        resource: db.table("courses"),
        options: {
          id: "courses",
          navigation: { name: "Courses" },
          listProperties: ["id", "title", "price", "is_deleted", "created_at"],
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
            title: { isRequired: true },
            price: { type: "currency", props: { currency: "USD" } },
            is_deleted: { type: "boolean" },
            description: { type: "textarea", props: { rows: 4 } },
            description_ar: { type: "textarea", props: { rows: 4 } },
          },
        },
      },
      {
        resource: db.table("course_materials"),
        options: {
          id: "course_materials",
          navigation: { name: "Course Materials", parent: "Courses" },
          listProperties: ["id", "course_id", "file_url"],
          showProperties: ["id", "course_id", "file_url"],
          editProperties: ["course_id", "file_url"],
          filterProperties: ["course_id"],
          properties: {
            course_id: {
              reference: "courses",
              type: "reference",
              isRequired: true,
            },
            file_url: { type: "url", isRequired: true },
          },
        },
      },
      {
        resource: db.table("course_enrollments"),
        options: {
          id: "course_enrollments",
          navigation: { name: "Enrollments", parent: "Courses" },
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
              isRequired: true,
            },
            freelancer_id: {
              reference: "freelancers",
              type: "reference",
              isRequired: true,
            },
            progress: {
              type: "number",
              props: { min: 0, max: 100, step: 0.01 },
            },
            enrolled_at: { type: "datetime", isVisible: { edit: false } },
          },
          actions: {
            new: {
              before: async (request) => {
                if (request.payload && !request.payload.enrolled_at) {
                  request.payload.enrolled_at = new Date();
                }
                return request;
              },
            },
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
        maxAge: 24 * 60 * 60 * 1000,
      },
      name: "adminjs",
    }
  );

  app.use(admin.options.rootPath, adminRouter);

  // API Endpoints
  const createAPIEndpoint = (path, query, errorMessage) => {
    app.get(path, async (req, res) => {
      const client = await pool.connect();
      try {
        const result = await client.query(query);
        res.json(result.rows);
      } catch (error) {
        console.error(`API Error for ${path}:`, error);
        res.status(500).json({ error: errorMessage });
      } finally {
        client.release();
      }
    });
  };

  app.get("/api/admin/dashboard", async (req, res) => {
    try {
      const dashboardData = await dashboardHandler();
      res.json(dashboardData);
    } catch (error) {
      console.error("Dashboard API error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  createAPIEndpoint(
    "/api/admin/users/clients",
    "SELECT * FROM users WHERE role_id = 2 ORDER BY created_at DESC",
    "Failed to fetch clients"
  );

  createAPIEndpoint(
    "/api/admin/users/freelancers",
    "SELECT * FROM users WHERE role_id = 3 ORDER BY created_at DESC",
    "Failed to fetch freelancers"
  );

  app.get("/api/admin/analytics", async (req, res) => {
    const client = await pool.connect();
    try {
      const { range = "7d" } = req.query;
      const days =
        range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;

      const queries = await Promise.all([
        client.query(`
          SELECT 
            'users' as name, COUNT(*) as count,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') as growth24h,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d,
            ROUND(COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') / 7.0, 1) as avgDailyGrowth,
            MAX(created_at) as lastUpdated
          FROM users
          UNION ALL
          SELECT 
            'appointments' as name, COUNT(*) as count,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') as growth24h,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d,
            ROUND(COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') / 7.0, 1) as avgDailyGrowth,
            MAX(created_at) as lastUpdated
          FROM appointments
          UNION ALL
          SELECT 
            'courses' as name, COUNT(*) as count,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') as growth24h,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d,
            ROUND(COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') / 7.0, 1) as avgDailyGrowth,
            MAX(created_at) as lastUpdated
          FROM courses
          UNION ALL
          SELECT 
            'plans' as name, COUNT(*) as count,
            0 as growth24h, 0 as growth7d, 0 as avgDailyGrowth,
            NOW() as lastUpdated
          FROM plans
        `),
        client.query(`
          SELECT 
            DATE(created_at) as date,
            COUNT(CASE WHEN role_id = 2 THEN 1 END)::int as clients,
            COUNT(CASE WHEN role_id = 3 THEN 1 END)::int as freelancers
          FROM users 
          WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
          GROUP BY DATE(created_at)
          ORDER BY date
        `),
        client.query(`
          SELECT 
            CASE 
              WHEN role_id = 2 THEN 'Clients'
              WHEN role_id = 3 THEN 'Freelancers'
              ELSE 'Others'
            END as name,
            COUNT(*)::int as value
          FROM users 
          GROUP BY role_id
        `),
        client.query(`
          SELECT 
            TO_CHAR(enrolled_at, 'Mon') as month,
            COUNT(*)::int as enrollments
          FROM course_enrollments
          WHERE enrolled_at >= CURRENT_DATE - INTERVAL '${days} days'
          GROUP BY DATE_TRUNC('month', enrolled_at), TO_CHAR(enrolled_at, 'Mon')
          ORDER BY DATE_TRUNC('month', enrolled_at)
        `),
        client.query(`
          SELECT status, COUNT(*)::int as count
          FROM appointments 
          WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
          GROUP BY status
        `),
        client.query(`
          SELECT 
            p.name as "planName",
            p.price * COUNT(CASE WHEN u.role_id = 2 THEN 1 END) as revenue
          FROM plans p
          LEFT JOIN users u ON u.role_id = 2
          GROUP BY p.id, p.name, p.price
          HAVING COUNT(CASE WHEN u.role_id = 2 THEN 1 END) > 0
        `),
        client.query(`
          SELECT 
            c.name,
            COUNT(*)::int as projects
          FROM categories c
          LEFT JOIN users u ON u.role_id = 3
          GROUP BY c.id, c.name
          HAVING COUNT(*) > 0
          ORDER BY COUNT(*) DESC
          LIMIT 5
        `),
      ]);

      const [
        tableStats,
        userGrowth,
        userDistribution,
        courseEnrollments,
        appointmentStats,
        revenueByPlan,
        categoryPerformance,
      ] = queries.map((q) => q.rows);

      const analytics = {
        tableStats,
        userGrowth: userGrowth.map((row) => ({
          date: new Date(row.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          clients: row.clients,
          freelancers: row.freelancers,
        })),
        userDistribution,
        courseEnrollments,
        appointmentStats,
        revenueByPlan,
        categoryPerformance,
        revenue: {
          total: revenueByPlan.reduce(
            (sum, item) => sum + (item.revenue || 0),
            0
          ),
        },
        users: {
          active: userDistribution.reduce((sum, item) => sum + item.value, 0),
        },
        conversion: {
          rate: 12.5,
        },
        session: {
          duration: 8.3,
        },
      };

      res.json(analytics);
    } catch (error) {
      console.error("Analytics API error:", error);
      res.status(500).json({ error: "Failed to fetch analytics data" });
    } finally {
      client.release();
    }
  });

  console.log(`✅ AdminJS mounted at ${admin.options.rootPath}`);
};
