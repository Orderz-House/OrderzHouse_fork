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

const checkTableExists = async (tableName) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name = $1`,
      [tableName]
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

  // Check for optional columns and tables
  const [
    usersHasUpdatedAt,
    categoriesHasCreatedAt,
    categoriesHasUpdatedAt,
    appointmentsHasUpdatedAt,
    appointmentsHasClientId,
    subCategoriesTableExists,
  ] = await Promise.all([
    checkColumnExists("users", "updated_at"),
    checkColumnExists("categories", "created_at"),
    checkColumnExists("categories", "updated_at"),
    checkColumnExists("appointments", "updated_at"),
    checkColumnExists("appointments", "client_id"),
    checkTableExists("sub_categories"),
  ]);

  // Dashboard data handler
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
        client.query(`SELECT COUNT(*)::int AS count FROM projects`),
        client.query(
          `SELECT COUNT(*)::int AS count FROM appointments WHERE status = $1`,
          ["pending"]
        ),
        client.query(`
          SELECT 
            COUNT(CASE WHEN status = 'pending' THEN 1 END)::int as pending,
            COUNT(CASE WHEN status = 'accepted' THEN 1 END)::int as accepted,
            COUNT(CASE WHEN status = 'rejected' THEN 1 END)::int as rejected,
            COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::int as cancelled
          FROM appointments
        `),
        client.query(`
          SELECT DATE(created_at) as date,
                 COUNT(CASE WHEN role_id = 2 THEN 1 END)::int as clients,
                 COUNT(CASE WHEN role_id = 3 THEN 1 END)::int as freelancers
          FROM users 
          WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY DATE(created_at) ORDER BY date
        `),
        client.query(
          `SELECT status, COUNT(*)::int as count FROM appointments GROUP BY status ORDER BY 
           CASE status 
             WHEN 'pending' THEN 1 
             WHEN 'accepted' THEN 2 
             WHEN 'rejected' THEN 3 
             WHEN 'cancelled' THEN 4 
           END`
        ),
        client.query(
          `SELECT id, first_name, email, created_at, role_id FROM users ORDER BY created_at DESC LIMIT 5`
        ),
        client.query(`
          SELECT a.id, a.status, a.appointment_date, a.created_at
          FROM appointments a
          ORDER BY a.created_at DESC LIMIT 5
        `),
      ]);

      const [
        usersCount,
        clientsCount,
        freelancersCount,
        coursesCount,
        plansCount,
        projectsCount,
        pendingAppointments,
        appointmentBreakdown,
        userTrendsRaw,
        appointmentStats,
        recentUsers,
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

      return {
        metrics: {
          usersCount: usersCount[0]?.count || 0,
          clientsCount: clientsCount[0]?.count || 0,
          freelancersCount: freelancersCount[0]?.count || 0,
          coursesCount: coursesCount[0]?.count || 0,
          plansCount: plansCount[0]?.count || 0,
          projectsCount: projectsCount[0]?.count || 0,
          pendingAppointments: pendingAppointments[0]?.count || 0,
          appointmentBreakdown: appointmentBreakdown[0] || {
            pending: 0,
            accepted: 0,
            rejected: 0,
            cancelled: 0,
          },
        },
        chartData: { userTrends, appointmentStats },
        recentUsers,
        recentAppointments,
      };
    } finally {
      client.release();
    }
  };

  // Analytics data handler
  const analyticsHandler = async () => {
    const client = await pool.connect();
    try {
      const queries = await Promise.all([
        client.query(`
          SELECT 'users' as name, COUNT(*) as count,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d
          FROM users
          UNION ALL
          SELECT 'appointments' as name, COUNT(*) as count,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d
          FROM appointments
          UNION ALL
          SELECT 'courses' as name, COUNT(*) as count,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d
          FROM courses
          UNION ALL
          SELECT 'projects' as name, COUNT(*) as count,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d
          FROM projects
        `),
        client.query(`
          SELECT CASE 
              WHEN role_id = 2 THEN 'Clients'
              WHEN role_id = 3 THEN 'Freelancers'
              ELSE 'Others'
            END as name, COUNT(*)::int as value
          FROM users GROUP BY role_id
        `),
        client.query(
          `SELECT status, COUNT(*)::int as count FROM appointments GROUP BY status`
        ),
      ]);

      const [tableStats, userDistribution, appointmentStats] = queries.map(
        (q) => q.rows
      );

      return {
        tableStats,
        userDistribution,
        appointmentStats,
        analytics: {
          users: {
            active: userDistribution.reduce((sum, item) => sum + item.value, 0),
          },
          conversion: { rate: 12.5 },
        },
      };
    } finally {
      client.release();
    }
  };

  // User resource factory
  const createUserResource = (roleId, resourceId, navigationName) => ({
    resource: db.table("users"),
    options: {
      id: resourceId,
      navigation: { name: navigationName },
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
      filterProperties: ["email", "first_name", "last_name"],
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

  // Build resources array
  const resources = [
    // Users
    createUserResource(2, "clients", "Users"),
    createUserResource(3, "freelancers", "Users"),

    // Courses
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
        navigation: { name: "Courses" },
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

    // Categories
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
  ];

  // Add sub_categories resource if the table exists
  if (subCategoriesTableExists) {
    resources.push({
      resource: db.table("sub_categories"),
      options: {
        id: "sub_categories",
        navigation: { name: "Categories" },
        listProperties: ["id", "name", "category_id", "description"],
        showProperties: [
          "id",
          "name",
          "category_id",
          "description",
          "created_at",
          "updated_at",
        ],
        editProperties: ["name", "category_id", "description"],
        filterProperties: ["name", "category_id"],
        properties: {
          name: { isRequired: true },
          category_id: {
            reference: "categories",
            type: "reference",
            isRequired: true,
          },
          description: { type: "textarea", props: { rows: 3 } },
        },
      },
    });
  }

  // Continue with other resources
  resources.push(
    // Plans
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

    // Appointments
    {
      resource: db.table("appointments"),
      options: {
        id: "appointments",
        navigation: { name: "Appointments" },
        listProperties: [
          "id",
          "freelancer_id",
          "status",
          "appointment_type",
          "appointment_date",
          "message",
          "created_at",
        ],
        showProperties: [
          "id",
          "freelancer_id",
          "message",
          "status",
          "appointment_type",
          "appointment_date",
          "created_at",
        ],
        editProperties: [
          "freelancer_id",
          "message",
          "status",
          "appointment_type",
          "appointment_date",
        ],
        filterProperties: ["status", "appointment_type", "freelancer_id"],
        sort: {
          sortBy: "created_at",
          direction: "desc",
        },
        properties: {
          id: {
            isVisible: { list: true, show: true, edit: false, filter: false },
            position: 1,
          },
          freelancer_id: {
            reference: "freelancers",
            type: "reference",
            isRequired: true,
            position: 2,
          },
          status: {
            availableValues: [
              { value: "pending", label: "🟡 Pending" },
              { value: "accepted", label: "✅ Accepted" },
              { value: "rejected", label: "❌ Rejected" },
              { value: "cancelled", label: "🚫 Cancelled" },
            ],
            isRequired: true,
            position: 3,
            components: {
              list: Components.StatusBadge || undefined,
            },
          },
          appointment_type: {
            availableValues: [
              { value: "online", label: "💻 Online" },
              { value: "in-person", label: "🤝 In Person" },
              { value: "phone", label: "📞 Phone Call" },
            ],
            isRequired: true,
            position: 4,
          },
          appointment_date: {
            type: "datetime",
            isRequired: true,
            position: 5,
          },
          message: {
            type: "textarea",
            props: { rows: 3 },
            position: 6,
            description: "Client's message or appointment details",
          },
          created_at: {
            isVisible: { edit: false, new: false },
            type: "datetime",
            position: 7,
          },
        },
        actions: {
          new: {
            before: async (request) => {
              if (request.payload) {
                if (!request.payload.status) request.payload.status = "pending";
                if (!request.payload.appointment_type)
                  request.payload.appointment_type = "online";
              }
              return request;
            },
          },
          list: {
            before: async (request) => {
              // Default to show pending appointments first if no filter applied
              if (!request.query["filters.status"]) {
                request.query.sortBy = "status";
                request.query.direction = "asc"; // pending comes first alphabetically
              }
              return request;
            },
          },
          // Quick Accept Action
          accept: {
            actionType: "record",
            icon: "Check",
            variant: "success",
            component: false,
            handler: async (request, response, context) => {
              const { record, currentAdmin } = context;
              const client = await pool.connect();

              try {
                await client.query(
                  `UPDATE appointments SET status = 'accepted' WHERE id = $1`,
                  [record.params.id]
                );

                return {
                  record: record.toJSON(currentAdmin),
                  notice: {
                    message: `✅ Appointment #${record.params.id} has been accepted!`,
                    type: "success",
                  },
                  redirectUrl: context.h.listUrl("appointments"),
                };
              } catch (error) {
                return {
                  record: record.toJSON(currentAdmin),
                  notice: {
                    message: "❌ Error accepting appointment: " + error.message,
                    type: "error",
                  },
                };
              } finally {
                client.release();
              }
            },
            guard: (context) => {
              return context.record?.params?.status === "pending";
            },
          },
          // Quick Reject Action
          reject: {
            actionType: "record",
            icon: "X",
            variant: "danger",
            component: false,
            handler: async (request, response, context) => {
              const { record, currentAdmin } = context;
              const client = await pool.connect();

              try {
                await client.query(
                  `UPDATE appointments SET status = 'rejected' WHERE id = $1`,
                  [record.params.id]
                );

                return {
                  record: record.toJSON(currentAdmin),
                  notice: {
                    message: `❌ Appointment #${record.params.id} has been rejected.`,
                    type: "success",
                  },
                  redirectUrl: context.h.listUrl("appointments"),
                };
              } catch (error) {
                return {
                  record: record.toJSON(currentAdmin),
                  notice: {
                    message: "❌ Error rejecting appointment: " + error.message,
                    type: "error",
                  },
                };
              } finally {
                client.release();
              }
            },
            guard: (context) => {
              return context.record?.params?.status === "pending";
            },
          },
          // Reschedule Action
          reschedule: {
            actionType: "record",
            icon: "Calendar",
            variant: "primary",
            showInDrawer: true,
            component: Components.RescheduleForm || undefined,
            handler: async (request, response, context) => {
              const { record, currentAdmin } = context;
              const client = await pool.connect();

              if (request.method === "post") {
                try {
                  const { appointment_date } = request.payload;

                  await client.query(
                    `UPDATE appointments SET appointment_date = $1 WHERE id = $2`,
                    [appointment_date, record.params.id]
                  );

                  return {
                    record: record.toJSON(currentAdmin),
                    notice: {
                      message: `📅 Appointment #${record.params.id} has been rescheduled!`,
                      type: "success",
                    },
                    redirectUrl: context.h.listUrl("appointments"),
                  };
                } catch (error) {
                  return {
                    record: record.toJSON(currentAdmin),
                    notice: {
                      message:
                        "❌ Error rescheduling appointment: " + error.message,
                      type: "error",
                    },
                  };
                } finally {
                  client.release();
                }
              }

              // GET request - show the form
              return {
                record: record.toJSON(currentAdmin),
              };
            },
            guard: (context) => {
              return ["pending", "accepted"].includes(
                context.record?.params?.status
              );
            },
          },
          // Cancel Action (for accepted appointments)
          cancel: {
            actionType: "record",
            icon: "Ban",
            variant: "danger",
            component: false,
            handler: async (request, response, context) => {
              const { record, currentAdmin } = context;
              const client = await pool.connect();

              try {
                await client.query(
                  `UPDATE appointments SET status = 'cancelled' WHERE id = $1`,
                  [record.params.id]
                );

                return {
                  record: record.toJSON(currentAdmin),
                  notice: {
                    message: `🚫 Appointment #${record.params.id} has been cancelled.`,
                    type: "success",
                  },
                  redirectUrl: context.h.listUrl("appointments"),
                };
              } catch (error) {
                return {
                  record: record.toJSON(currentAdmin),
                  notice: {
                    message:
                      "❌ Error cancelling appointment: " + error.message,
                    type: "error",
                  },
                };
              } finally {
                client.release();
              }
            },
            guard: (context) => {
              return context.record?.params?.status === "accepted";
            },
          },
          // Bulk Accept Action
          bulkAccept: {
            actionType: "bulk",
            icon: "Check",
            variant: "success",
            component: false,
            handler: async (request, response, context) => {
              const { records, currentAdmin } = context;
              const client = await pool.connect();

              try {
                const recordIds = records.map((r) => r.params.id);
                const result = await client.query(
                  `UPDATE appointments SET status = 'accepted' WHERE id = ANY($1) AND status = 'pending'`,
                  [recordIds]
                );

                return {
                  records: records.map((record) => record.toJSON(currentAdmin)),
                  notice: {
                    message: `✅ ${result.rowCount} appointments have been accepted!`,
                    type: "success",
                  },
                  redirectUrl: context.h.listUrl("appointments"),
                };
              } catch (error) {
                return {
                  records: records.map((record) => record.toJSON(currentAdmin)),
                  notice: {
                    message:
                      "❌ Error accepting appointments: " + error.message,
                    type: "error",
                  },
                };
              } finally {
                client.release();
              }
            },
          },
          // Bulk Reject Action
          bulkReject: {
            actionType: "bulk",
            icon: "X",
            variant: "danger",
            component: false,
            handler: async (request, response, context) => {
              const { records, currentAdmin } = context;
              const client = await pool.connect();

              try {
                const recordIds = records.map((r) => r.params.id);
                const result = await client.query(
                  `UPDATE appointments SET status = 'rejected' WHERE id = ANY($1) AND status = 'pending'`,
                  [recordIds]
                );

                return {
                  records: records.map((record) => record.toJSON(currentAdmin)),
                  notice: {
                    message: `❌ ${result.rowCount} appointments have been rejected.`,
                    type: "success",
                  },
                  redirectUrl: context.h.listUrl("appointments"),
                };
              } catch (error) {
                return {
                  records: records.map((record) => record.toJSON(currentAdmin)),
                  notice: {
                    message:
                      "❌ Error rejecting appointments: " + error.message,
                    type: "error",
                  },
                };
              } finally {
                client.release();
              }
            },
          },
        },
      },
    },

    // Freelancing
    {
      resource: db.table("subscriptions"),
      options: {
        id: "subscriptions",
        navigation: { name: "Freelancing" },
        listProperties: ["id", "freelancer_id", "plan_id"],
        showProperties: ["id", "freelancer_id", "plan_id"],
        editProperties: ["freelancer_id", "plan_id"],
        filterProperties: ["freelancer_id", "plan_id"],
        properties: {
          freelancer_id: {
            reference: "freelancers",
            type: "reference",
            isRequired: true,
          },
          plan_id: {
            reference: "plans",
            type: "reference",
            isRequired: true,
          },
        },
      },
    },
    {
      resource: db.table("projects"),
      options: {
        id: "projects",
        navigation: { name: "Freelancing" },
        listProperties: [
          "id",
          "title",
          "user_id",
          "category_id",
          "status",
          "budget_min",
          "budget_max",
          "assigned_freelancer_id",
          "created_at",
        ],
        showProperties: [
          "id",
          "title",
          "description",
          "user_id",
          "category_id",
          "sub_category_id",
          "budget_min",
          "budget_max",
          "duration",
          "location",
          "status",
          "assigned_freelancer_id",
          "is_deleted",
          "created_at",
          "updated_at",
        ],
        editProperties: [
          "title",
          "description",
          "user_id",
          "category_id",
          "sub_category_id",
          "budget_min",
          "budget_max",
          "duration",
          "location",
          "status",
          "assigned_freelancer_id",
        ],
        filterProperties: [
          "title",
          "status",
          "category_id",
          "user_id",
          "assigned_freelancer_id",
        ],
        properties: {
          title: { isRequired: true },
          description: {
            type: "textarea",
            props: { rows: 4 },
            isRequired: true,
          },
          user_id: {
            reference: "clients",
            type: "reference",
            isRequired: true,
          },
          category_id: {
            reference: "categories",
            type: "reference",
            isRequired: true,
          },
          sub_category_id: subCategoriesTableExists
            ? {
                reference: "sub_categories",
                type: "reference",
                description: "Sub Category",
              }
            : {
                type: "number",
                description: "Sub Category ID",
              },
          budget_min: {
            type: "currency",
            props: { currency: "USD" },
            isRequired: true,
          },
          budget_max: {
            type: "currency",
            props: { currency: "USD" },
            isRequired: true,
          },
          duration: { type: "string" },
          location: { type: "string" },
          status: {
            availableValues: [
              { value: "draft", label: "Draft" },
              { value: "active", label: "Active" },
              { value: "in_progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ],
            isRequired: true,
          },
          assigned_freelancer_id: {
            reference: "freelancers",
            type: "reference",
          },
          is_deleted: { type: "boolean" },
          created_at: {
            type: "datetime",
            isVisible: { edit: false, new: false },
          },
          updated_at: {
            type: "datetime",
            isVisible: { edit: false, new: false },
          },
        },
        actions: {
          new: {
            before: async (request) => {
              if (request.payload) {
                if (!request.payload.status) request.payload.status = "draft";
                if (!request.payload.is_deleted)
                  request.payload.is_deleted = false;
              }
              return request;
            },
          },
        },
      },
    }
  );

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
      analytics: { component: Components.Analytics, handler: analyticsHandler },
    },
    resources,
  });

  if (process.env.NODE_ENV !== "production") admin.watch();

  // Session configuration
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

  // API endpoints
  app.get("/api/admin/dashboard", async (req, res) => {
    try {
      const dashboardData = await dashboardHandler();
      res.json(dashboardData);
    } catch (error) {
      console.error("Dashboard API error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const analyticsData = await analyticsHandler();
      res.json(analyticsData);
    } catch (error) {
      console.error("Analytics API error:", error);
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });

  console.log(`✅ AdminJS mounted at ${admin.options.rootPath}`);
};
