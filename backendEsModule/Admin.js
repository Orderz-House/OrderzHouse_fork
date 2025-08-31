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
        `SELECT COUNT(*)::int AS count FROM projects WHERE is_deleted = false OR is_deleted IS NULL`
      ),
      client.query(
        `SELECT COUNT(*)::int AS count FROM appointments WHERE status = 'pending'`
      ),
      client.query(
        `SELECT COALESCE(SUM(amount), 0)::numeric AS total FROM payments`
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
      client.query(
        `SELECT id, first_name, last_name, email, created_at, role_id FROM users ORDER BY created_at DESC LIMIT 5`
      ),
      client.query(
        `SELECT id, status, appointment_date, created_at FROM appointments ORDER BY created_at DESC LIMIT 5`
      ),
    ]);

    const [
      usersCount,
      clientsCount,
      freelancersCount,
      coursesCount,
      plansCount,
      projectsCount,
      pendingAppointments,
      totalRevenue,
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
        totalRevenue: parseFloat(totalRevenue[0]?.total) || 0,
      },
      chartData: { userTrends, appointmentStats },
      recentUsers,
      recentAppointments,
    };
  } finally {
    client.release();
  }
};

const analyticsHandler = async (request) => {
  const range = request?.query?.range || "7d";
  const client = await pool.connect();

  try {
    let dateFilter = "";
    let intervalGroup = "DATE(created_at)";
    let paymentDateFilter = "";

    switch (range) {
      case "7d":
        dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'";
        paymentDateFilter =
          "WHERE payment_date >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case "30d":
        dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'";
        paymentDateFilter =
          "WHERE payment_date >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      case "90d":
        dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'";
        paymentDateFilter =
          "WHERE payment_date >= CURRENT_DATE - INTERVAL '90 days'";
        intervalGroup = "DATE_TRUNC('week', created_at)";
        break;
      case "1y":
        dateFilter = "WHERE created_at >= CURRENT_DATE - INTERVAL '1 year'";
        paymentDateFilter =
          "WHERE payment_date >= CURRENT_DATE - INTERVAL '1 year'";
        intervalGroup = "DATE_TRUNC('month', created_at)";
        break;
    }

    const queries = await Promise.all([
      // Enhanced table statistics
      client.query(`
        SELECT 'users' as name, COUNT(*) as count,
               COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d
        FROM users
        UNION ALL
        SELECT 'projects' as name, COUNT(*) as count,
               COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d
        FROM projects WHERE is_deleted = false OR is_deleted IS NULL
        UNION ALL
        SELECT 'appointments' as name, COUNT(*) as count,
               COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d
        FROM appointments
        UNION ALL
        SELECT 'courses' as name, COUNT(*) as count,
               COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as growth7d
        FROM courses
        UNION ALL
        SELECT 'payments' as name, COUNT(*) as count,
               COUNT(*) FILTER (WHERE payment_date >= CURRENT_DATE - INTERVAL '7 days') as growth7d
        FROM payments
      `),

      // User growth trends with real data
      client.query(`
        SELECT ${intervalGroup} as date,
               COUNT(CASE WHEN role_id = 2 THEN 1 END)::int as clients,
               COUNT(CASE WHEN role_id = 3 THEN 1 END)::int as freelancers,
               COUNT(*)::int as total
        FROM users 
        ${dateFilter}
        GROUP BY ${intervalGroup} 
        ORDER BY date ASC
      `),

      // User distribution
      client.query(`
        SELECT CASE 
            WHEN role_id = 2 THEN 'Clients'
            WHEN role_id = 3 THEN 'Freelancers'
            ELSE 'Others'
          END as name, 
          COUNT(*)::int as value
        FROM users 
        GROUP BY role_id
        ORDER BY value DESC
      `),

      // Appointment statistics
      client.query(`
        SELECT status, COUNT(*)::int as count
        FROM appointments 
        GROUP BY status
        ORDER BY 
          CASE status 
            WHEN 'pending' THEN 1 
            WHEN 'accepted' THEN 2 
            WHEN 'rejected' THEN 3 
            WHEN 'cancelled' THEN 4 
          END
      `),

      // Project categories - FIXED
      client.query(`
        SELECT COALESCE(c.name, 'Uncategorized') as category, 
               COUNT(p.id)::int as count,
               COUNT(CASE WHEN p.status = 'completed' THEN 1 END)::int as completed,
               COUNT(CASE WHEN p.status = 'in_progress' THEN 1 END)::int as in_progress,
               COUNT(CASE WHEN p.status = 'active' THEN 1 END)::int as active,
               COUNT(CASE WHEN (p.status = '' OR p.status IS NULL) THEN 1 END)::int as draft
        FROM projects p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.is_deleted = false
        GROUP BY c.id, c.name
        ORDER BY count DESC
      `),

      // Project status breakdown - FIXED to handle all status cases
      client.query(`
        SELECT 
          CASE 
            WHEN status = '' OR status IS NULL THEN 'draft'
            WHEN status = 'active' THEN 'active'
            WHEN status = 'in_progress' THEN 'in_progress'
            WHEN status = 'completed' THEN 'completed'
            WHEN status = 'cancelled' THEN 'cancelled'
            ELSE 'draft'
          END as status,
          COUNT(*)::int as count,
          AVG(NULLIF(budget_max - budget_min, 0))::int as avg_budget
        FROM projects
        WHERE is_deleted = false
        GROUP BY CASE 
          WHEN status = '' OR status IS NULL THEN 'draft'
          WHEN status = 'active' THEN 'active'
          WHEN status = 'in_progress' THEN 'in_progress'
          WHEN status = 'completed' THEN 'completed'
          WHEN status = 'cancelled' THEN 'cancelled'
          ELSE 'draft'
        END
        ORDER BY count DESC
      `),

      // Payment analytics with receipts
      client.query(`
        SELECT 
          SUM(p.amount)::numeric as total_revenue,
          COUNT(p.id)::int as total_transactions,
          SUM(CASE WHEN p.project_id IS NOT NULL THEN p.amount ELSE 0 END)::numeric as project_revenue,
          SUM(CASE WHEN p.order_id IS NOT NULL THEN p.amount ELSE 0 END)::numeric as order_revenue,
          SUM(CASE WHEN p.payment_date >= CURRENT_DATE - INTERVAL '30 days' THEN p.amount ELSE 0 END)::numeric as monthly_revenue,
          AVG(p.amount)::numeric as avg_transaction,
          COUNT(r.id)::int as total_receipts
        FROM payments p
        LEFT JOIN receipts r ON p.id = r.payment_id
      `),

      // Payment trends over time
      client.query(`
        SELECT DATE(payment_date) as date,
               SUM(amount)::numeric as amount,
               COUNT(*)::int as transactions
        FROM payments 
        ${paymentDateFilter}
        GROUP BY DATE(payment_date) 
        ORDER BY date ASC
      `),

      // Payment breakdown by type
      client.query(`
        SELECT 
          CASE 
            WHEN project_id IS NOT NULL THEN 'Project Payments'
            WHEN order_id IS NOT NULL THEN 'Order Payments'
            WHEN temp_project_id IS NOT NULL THEN 'Temp Project Payments'
            ELSE 'Other Payments'
          END as label,
          SUM(amount)::numeric as amount,
          COUNT(*)::int as count
        FROM payments
        GROUP BY 
          CASE 
            WHEN project_id IS NOT NULL THEN 'Project Payments'
            WHEN order_id IS NOT NULL THEN 'Order Payments'
            WHEN temp_project_id IS NOT NULL THEN 'Temp Project Payments'
            ELSE 'Other Payments'
          END
        ORDER BY amount DESC
      `),

      // Overview metrics - FIXED project status handling
      client.query(`
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM users WHERE role_id = 2) as total_clients,
          (SELECT COUNT(*) FROM users WHERE role_id = 3) as total_freelancers,
          (SELECT COUNT(*) FROM projects WHERE is_deleted = false) as total_projects,
          (SELECT COUNT(*) FROM projects WHERE status = 'completed' AND is_deleted = false) as completed_projects,
          (SELECT COUNT(*) FROM projects WHERE status IN ('active', 'in_progress') AND is_deleted = false) as active_projects,
          (SELECT COUNT(*) FROM projects WHERE (status = '' OR status IS NULL) AND is_deleted = false) as draft_projects,
          (SELECT COUNT(*) FROM courses) as total_courses,
          (SELECT COUNT(*) FROM appointments WHERE DATE(created_at) = CURRENT_DATE) as appointments_today,
          (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE) as new_users_today,
          (SELECT COUNT(*) FROM projects WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as projects_this_week,
          (SELECT COUNT(*) FROM payments WHERE DATE(payment_date) = CURRENT_DATE) as payments_today,
          (SELECT COUNT(*) FROM receipts) as total_receipts
      `),
    ]);

    const [
      tableStats,
      userGrowthRaw,
      userDistribution,
      appointmentStats,
      projectCategories,
      projectStatusStats,
      paymentOverview,
      paymentTrends,
      paymentTypeBreakdown,
      overviewMetrics,
    ] = queries.map((q) => q.rows);

    // Process user growth data
    const userGrowth = userGrowthRaw.map((row) => ({
      date: row.date instanceof Date ? row.date.toISOString() : row.date,
      clients: parseInt(row.clients) || 0,
      freelancers: parseInt(row.freelancers) || 0,
      total: parseInt(row.total) || 0,
      count: parseInt(row.total) || 0,
    }));

    // Process payment trends
    const processedPaymentTrends = paymentTrends.map((row) => ({
      date: row.date instanceof Date ? row.date.toISOString() : row.date,
      amount: parseFloat(row.amount) || 0,
      transactions: parseInt(row.transactions) || 0,
    }));

    const overview = overviewMetrics[0] || {};
    const paymentData = paymentOverview[0] || {};

    const processedOverview = {
      totalUsers: parseInt(overview.total_users) || 0,
      totalClients: parseInt(overview.total_clients) || 0,
      totalFreelancers: parseInt(overview.total_freelancers) || 0,
      totalProjects: parseInt(overview.total_projects) || 0,
      completedProjects: parseInt(overview.completed_projects) || 0,
      activeProjects: parseInt(overview.active_projects) || 0,
      totalCourses: parseInt(overview.total_courses) || 0,
      appointmentsToday: parseInt(overview.appointments_today) || 0,
      newUsersToday: parseInt(overview.new_users_today) || 0,
      projectsThisWeek: parseInt(overview.projects_this_week) || 0,
      paymentsToday: parseInt(overview.payments_today) || 0,
      totalReceipts: parseInt(overview.total_receipts) || 0,
      totalRevenue: parseFloat(paymentData.total_revenue) || 0,
      totalTransactions: parseInt(paymentData.total_transactions) || 0,
      projectRevenue: parseFloat(paymentData.project_revenue) || 0,
      orderRevenue: parseFloat(paymentData.order_revenue) || 0,
      monthlyRevenue: parseFloat(paymentData.monthly_revenue) || 0,
      avgTransaction: parseFloat(paymentData.avg_transaction) || 0,
    };

    const projectCategoriesWithColors = projectCategories.map((cat, index) => ({
      ...cat,
      color: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"][
        index % 6
      ],
    }));

    const paymentStats =
      paymentTypeBreakdown.length > 0
        ? paymentTypeBreakdown.map((stat, index) => ({
            ...stat,
            color:
              ["#10b981", "#8b5cf6", "#3b82f6", "#f59e0b"][index] || "#6b7280",
          }))
        : [];

    return {
      overview: processedOverview,
      userStats: { daily: userGrowth },
      projectStats: {
        byStatus: projectStatusStats,
        byCategory: projectCategoriesWithColors,
      },
      paymentStats,
      paymentTrends: processedPaymentTrends,
      tableStats: tableStats.map((stat) => ({
        ...stat,
        count: parseInt(stat.count) || 0,
        growth7d: parseInt(stat.growth7d) || 0,
      })),
      userDistribution,
      appointmentStats,
    };
  } catch (error) {
    console.error("Analytics handler error:", error);
    return {
      overview: {},
      userStats: { daily: [] },
      projectStats: { byStatus: [], byCategory: [] },
      paymentStats: [],
      paymentTrends: [],
      tableStats: [],
      userDistribution: [],
      appointmentStats: [],
    };
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

  const [subCategoriesTableExists, paymentsTableExists, receiptsTableExists] =
    await Promise.all([
      checkTableExists("sub_categories"),
      checkTableExists("payments"),
      checkTableExists("receipts"),
    ]);

  console.log(`Database tables check:`);
  console.log(
    `- sub_categories: ${subCategoriesTableExists ? "EXISTS" : "MISSING"}`
  );
  console.log(`- payments: ${paymentsTableExists ? "EXISTS" : "MISSING"}`);
  console.log(`- receipts: ${receiptsTableExists ? "EXISTS" : "MISSING"}`);

  const createUserResource = (roleId, resourceId, navigationName) => ({
    resource: db.table("users"),
    options: {
      id: resourceId,
      navigation: { name: navigationName, icon: "Users" },
      listProperties: ["id", "first_name", "last_name", "email", "created_at"],
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

  const resources = [
    // User Management
    createUserResource(2, "clients", "User Management"),
    createUserResource(3, "freelancers", "User Management"),

    // Content Management
    {
      resource: db.table("courses"),
      options: {
        id: "courses",
        navigation: { name: "Content Management", icon: "Book" },
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
      resource: db.table("categories"),
      options: {
        id: "categories",
        navigation: { name: "Content Management", icon: "Book" },
        listProperties: ["id", "name", "description"],
        properties: {
          name: { isRequired: true },
          description: { type: "textarea", props: { rows: 3 } },
        },
      },
    },

    // Business Management
    {
      resource: db.table("plans"),
      options: {
        id: "plans",
        navigation: { name: "Business Management", icon: "CreditCard" },
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
        properties: {
          name: { isRequired: true },
          price: {
            type: "currency",
            props: { currency: "USD" },
            isRequired: true,
          },
          duration: {
            type: "number",
            props: { min: 1 },
            isRequired: true,
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
        navigation: { name: "Business Management", icon: "Calendar" },
        listProperties: [
          "id",
          "freelancer_id",
          "status",
          "appointment_type",
          "appointment_date",
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
        sort: { sortBy: "created_at", direction: "desc" },
        properties: {
          freelancer_id: {
            reference: "freelancers",
            type: "reference",
            isRequired: true,
          },
          status: {
            availableValues: [
              { value: "pending", label: "🟡 Pending" },
              { value: "accepted", label: "✅ Accepted" },
              { value: "rejected", label: "❌ Rejected" },
              { value: "cancelled", label: "🚫 Cancelled" },
            ],
            isRequired: true,
          },
          appointment_type: {
            availableValues: [
              { value: "online", label: "💻 Online" },
              { value: "in-person", label: "🤝 In Person" },
              { value: "phone", label: "📞 Phone Call" },
            ],
            isRequired: true,
          },
          appointment_date: { type: "datetime", isRequired: true },
          message: {
            type: "textarea",
            props: { rows: 3 },
            description: "Appointment details",
          },
        },
      },
    },

    // Project Management
    {
      resource: db.table("projects"),
      options: {
        id: "projects",
        navigation: { name: "Project Management", icon: "Briefcase" },
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
            ? { reference: "sub_categories", type: "reference" }
            : { type: "number", description: "Sub Category ID" },
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
              { value: "draft", label: "📝 Draft" },
              { value: "active", label: "🔴 Active" },
              { value: "in_progress", label: "🔄 In Progress" },
              { value: "completed", label: "✅ Completed" },
              { value: "cancelled", label: "❌ Cancelled" },
            ],
            isRequired: true,
          },
          assigned_freelancer_id: {
            reference: "freelancers",
            type: "reference",
          },
          is_deleted: { type: "boolean" },
        },
        actions: {
          new: {
            before: async (request) => {
              if (request.payload && !request.payload.status) {
                request.payload.status = "draft";
              }
              return request;
            },
          },
        },
      },
    },
  ];

  // Add sub_categories if table exists
  if (subCategoriesTableExists) {
    resources.push({
      resource: db.table("sub_categories"),
      options: {
        id: "sub_categories",
        navigation: { name: "Content Management", icon: "Book" },
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

  // Add payments resource if table exists
  if (paymentsTableExists) {
    resources.push({
      resource: db.table("payments"),
      options: {
        id: "payments",
        navigation: { name: "Financial Management", icon: "DollarSign" },
        listProperties: [
          "id",
          "payer_id",
          "receiver_id",
          "amount",
          "payment_date",
          "project_id",
          "order_id",
        ],
        showProperties: [
          "id",
          "payer_id",
          "receiver_id",
          "amount",
          "payment_date",
          "project_id",
          "order_id",
          "temp_project_id",
        ],
        editProperties: [
          "payer_id",
          "receiver_id",
          "amount",
          "project_id",
          "order_id",
          "temp_project_id",
        ],
        filterProperties: [
          "payer_id",
          "receiver_id",
          "project_id",
          "order_id",
          "payment_date",
        ],
        sort: { sortBy: "payment_date", direction: "desc" },
        properties: {
          payer_id: {
            reference: "users",
            type: "reference",
            isRequired: true,
            description: "User who made the payment",
          },
          receiver_id: {
            reference: "users",
            type: "reference",
            isRequired: true,
            description: "User who received the payment",
          },
          amount: {
            type: "currency",
            props: { currency: "USD" },
            isRequired: true,
          },
          payment_date: { type: "datetime", isRequired: true },
          project_id: {
            reference: "projects",
            type: "reference",
            description: "Related project",
          },
          order_id: { type: "number", description: "Related order ID" },
          temp_project_id: {
            type: "number",
            description: "Temporary project ID",
          },
        },
      },
    });
  }

  // Add receipts resource if table exists
  if (receiptsTableExists) {
    resources.push({
      resource: db.table("receipts"),
      options: {
        id: "receipts",
        navigation: { name: "Financial Management", icon: "FileText" },
        listProperties: ["id", "payment_id", "receipt_url"],
        showProperties: ["id", "payment_id", "receipt_url"],
        editProperties: ["payment_id", "receipt_url"],
        filterProperties: ["payment_id"],
        sort: { sortBy: "id", direction: "desc" },
        properties: {
          payment_id: {
            reference: "payments",
            type: "reference",
            isRequired: true,
            description: "Related payment",
          },
          receipt_url: {
            type: "url",
            isRequired: true,
            description: "URL to receipt document",
          },
        },
      },
    });
  }

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
      const analyticsData = await analyticsHandler(req);
      res.json(analyticsData);
    } catch (error) {
      console.error("Analytics API error:", error);
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });

  // Payment and Receipt statistics endpoint
  app.get("/api/admin/financial/stats", async (req, res) => {
    try {
      const client = await pool.connect();

      const result = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM payments) as total_payments,
          (SELECT COUNT(*) FROM receipts) as total_receipts,
          (SELECT SUM(amount) FROM payments WHERE DATE(payment_date) = CURRENT_DATE) as today_revenue,
          (SELECT COUNT(*) FROM payments WHERE DATE(payment_date) = CURRENT_DATE) as today_transactions,
          (SELECT AVG(amount) FROM payments) as avg_transaction_amount,
          (SELECT COUNT(*) FROM payments WHERE project_id IS NOT NULL) as project_payments,
          (SELECT COUNT(*) FROM payments WHERE order_id IS NOT NULL) as order_payments,
          (SELECT COUNT(*) FROM receipts WHERE payment_id IN (SELECT id FROM payments WHERE payment_date >= CURRENT_DATE - INTERVAL '7 days')) as receipts_this_week
      `);

      client.release();
      res.json(result.rows[0] || {});
    } catch (error) {
      console.error("Financial stats error:", error);
      res.status(500).json({ error: "Failed to fetch financial statistics" });
    }
  });

  // Export endpoint for data
  app.get("/api/admin/export/:table", async (req, res) => {
    try {
      const { table } = req.params;
      const allowedTables = [
        "users",
        "projects",
        "appointments",
        "courses",
        "categories",
        "payments",
        "receipts",
      ];

      if (!allowedTables.includes(table)) {
        return res.status(400).json({ error: "Invalid table name" });
      }

      const client = await pool.connect();

      let query = `SELECT * FROM ${table}`;
      if (table === "payments") {
        query += ` ORDER BY payment_date DESC`;
      } else if (
        ["users", "projects", "appointments", "courses", "categories"].includes(
          table
        )
      ) {
        query += ` ORDER BY created_at DESC`;
      } else {
        query += ` ORDER BY id DESC`;
      }

      const result = await client.query(query);
      client.release();

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${table}_export_${
          new Date().toISOString().split("T")[0]
        }.json"`
      );
      res.json({
        table: table,
        exported_at: new Date().toISOString(),
        total_records: result.rows.length,
        data: result.rows,
      });
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  console.log(`✅ AdminJS mounted at ${admin.options.rootPath}`);
};
