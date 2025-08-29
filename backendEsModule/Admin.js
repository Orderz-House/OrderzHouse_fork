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

const dashboardHandler = async () => {
  const client = await pool.connect();
  try {
    // Get total users count
    const [{ count: usersCount }] = (
      await client.query(`SELECT COUNT(*)::int AS count FROM users`)
    ).rows;
    
    // Get clients count (role_id = 2)
    const [{ count: clientsCount }] = (
      await client.query(`SELECT COUNT(*)::int AS count FROM users WHERE role_id = $1`, [2])
    ).rows;
    
    // Get freelancers count (role_id = 3)
    const [{ count: freelancersCount }] = (
      await client.query(`SELECT COUNT(*)::int AS count FROM users WHERE role_id = $1`, [3])
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
    
    const [{ count: activeProjects }] = (
      await client.query(
        `SELECT COUNT(*)::int AS count FROM projects WHERE status IN ($1, $2) AND is_deleted = false`,
        ["open", "in_progress"]
      )
    ).rows;
    
    const [{ sum: totalProjectValue }] = (
      await client.query(
        `SELECT COALESCE(SUM(budget_max), 0)::numeric AS sum FROM projects WHERE status = 'completed' AND is_deleted = false`
      )
    ).rows;

    return {
      metrics: { 
        usersCount, 
        clientsCount,
        freelancersCount,
        coursesCount, 
        pendingAppointments,
        activeProjects,
        totalProjectValue: Number(totalProjectValue) || 0
      },
      message: "Dashboard ready",
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

  const admin = new AdminJS({
    rootPath: "/admin",
    componentLoader,
    dashboard: {
      component: Components.Dashboard,
      handler: dashboardHandler,
    },
    branding: {
      companyName: "OrderzHouse",
      withMadeWithLove: false, 
      logo: false,
      favicon: "/favicon.ico", 
      theme: {
        colors: {
          primary100: '#667EEA',
          primary80: '#764BA2',
          primary60: '#8B5CF6',
          primary40: '#A78BFA',
          primary20: '#C4B5FD',
          grey100: '#1F2937',
          grey80: '#374151',
          grey60: '#6B7280',
          grey40: '#9CA3AF',
          grey20: '#E5E7EB',
          filterBg: '#F9FAFB',
          accent: '#10B981',
          hoverBg: '#F3F4F6',
        },
        fonts: {
          base: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          mono: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
        },
      },
    },
    locale: {
      translations: {
        labels: {
          loginWelcome: 'Welcome to OrderzHouse Admin',
        },
      },
    },
    assets: {
      styles: ['/admin/custom-styles.css'], 
    },
    resources: [
      // USER MANAGEMENT SECTION - CLIENTS (role_id = 2)
      {
        resource: db.table("users"),
        options: { 
          id: "clients", 
          navigation: { 
            name: "👤 Clients",
            icon: "User"
          },
          sort: {
            sortBy: 'created_at',
            direction: 'desc',
          },
          // Filter to show only clients (role_id = 2)
          listProperties: ['id', 'email', 'first_name', 'last_name', 'phone', 'created_at'],
          filterProperties: ['email', 'first_name', 'last_name', 'phone', 'created_at'],
          properties: {
            id: { isVisible: { list: true, filter: false, show: true, edit: false } },
            email: { isVisible: { list: true, filter: true, show: true, edit: true } },
            first_name: { isVisible: { list: true, filter: true, show: true, edit: true } },
            last_name: { isVisible: { list: true, filter: true, show: true, edit: true } },
            phone: { isVisible: { list: true, filter: true, show: true, edit: true } },
            role_id: { 
              isVisible: { list: false, filter: true, show: true, edit: true },
              availableValues: [
                { value: 2, label: '👤 Client' }
              ]
            },
            created_at: { 
              isVisible: { list: true, filter: true, show: true, edit: false },
              type: 'datetime',
            },
            updated_at: { 
              isVisible: { list: false, filter: false, show: true, edit: false },
              type: 'datetime',
            },
          },
          actions: {
            list: {
              before: async (request) => {
                // Add filter to show only clients
                if (request.query && !request.query['filters.role_id']) {
                  request.query['filters.role_id'] = '2';
                }
                return request;
              }
            },
            new: { 
              isVisible: true,
              before: async (request) => {
                // Auto-set role_id to 2 (client) for new records
                if (request.method === 'post' && request.payload) {
                  request.payload.role_id = 2;
                }
                return request;
              }
            },
            edit: { isVisible: true },
            delete: { isVisible: true },
            show: { isVisible: true },
          },
        },
      },

      // USER MANAGEMENT SECTION - FREELANCERS (role_id = 3)
      {
        resource: db.table("users"),
        options: { 
          id: "freelancers", 
          navigation: { 
            name: "💼 Freelancers",
            icon: "Briefcase"
          },
          sort: {
            sortBy: 'created_at',
            direction: 'desc',
          },
          // Filter to show only freelancers (role_id = 3)
          listProperties: ['id', 'email', 'first_name', 'last_name', 'phone', 'skills', 'created_at'],
          filterProperties: ['email', 'first_name', 'last_name', 'phone', 'skills', 'created_at'],
          properties: {
            id: { isVisible: { list: true, filter: false, show: true, edit: false } },
            email: { isVisible: { list: true, filter: true, show: true, edit: true } },
            first_name: { isVisible: { list: true, filter: true, show: true, edit: true } },
            last_name: { isVisible: { list: true, filter: true, show: true, edit: true } },
            phone: { isVisible: { list: true, filter: true, show: true, edit: true } },
            skills: { 
              type: 'textarea',
              isVisible: { list: true, filter: false, show: true, edit: true } 
            },
            portfolio_url: { isVisible: { list: false, filter: false, show: true, edit: true } },
            hourly_rate: { 
              type: 'currency',
              isVisible: { list: false, filter: true, show: true, edit: true } 
            },
            role_id: { 
              isVisible: { list: false, filter: true, show: true, edit: true },
              availableValues: [
                { value: 3, label: '💼 Freelancer' }
              ]
            },
            created_at: { 
              isVisible: { list: true, filter: true, show: true, edit: false },
              type: 'datetime',
            },
            updated_at: { 
              isVisible: { list: false, filter: false, show: true, edit: false },
              type: 'datetime',
            },
          },
          actions: {
            list: {
              before: async (request) => {
                // Add filter to show only freelancers
                if (request.query && !request.query['filters.role_id']) {
                  request.query['filters.role_id'] = '3';
                }
                return request;
              }
            },
            new: { 
              isVisible: true,
              before: async (request) => {
                // Auto-set role_id to 3 (freelancer) for new records
                if (request.method === 'post' && request.payload) {
                  request.payload.role_id = 3;
                }
                return request;
              }
            },
            edit: { isVisible: true },
            delete: { isVisible: true },
            show: { isVisible: true },
          },
        },
      },

      // ALL USERS (Optional - for admin overview)
      {
        resource: db.table("users"),
        options: { 
          id: "all_users", 
          navigation: { 
            name: "👥 All Users",
            icon: "Users"
          },
          sort: {
            sortBy: 'created_at',
            direction: 'desc',
          },
          properties: {
            id: { isVisible: { list: true, filter: false, show: true, edit: false } },
            email: { isVisible: { list: true, filter: true, show: true, edit: true } },
            first_name: { isVisible: { list: true, filter: true, show: true, edit: true } },
            last_name: { isVisible: { list: true, filter: true, show: true, edit: true } },
            role_id: { 
              isVisible: { list: true, filter: true, show: true, edit: true },
              availableValues: [
                { value: 1, label: '👑 Admin' },
                { value: 2, label: '👤 Client' },
                { value: 3, label: '💼 Freelancer' }
              ]
            },
            created_at: { 
              isVisible: { list: true, filter: true, show: true, edit: false },
              type: 'datetime',
            },
          },
          actions: {
            new: { isVisible: true },
            edit: { isVisible: true },
            delete: { isVisible: true },
            show: { isVisible: true },
          },
        },
      },

      // COURSE MANAGEMENT SECTION
      {
        resource: db.table("courses"),
        options: {
          id: "courses",
          navigation: { 
            name: "📚 Course Management",
            icon: "BookOpen"
          },
          sort: {
            sortBy: 'created_at',
            direction: 'desc',
          },
          properties: {
            id: { isVisible: { list: true, filter: false, show: true, edit: false } },
            title: { isVisible: { list: true, filter: true, show: true, edit: true } },
            description: { 
              type: 'textarea',
              isVisible: { list: false, filter: false, show: true, edit: true }
            },
            price: { 
              type: 'currency',
              isVisible: { list: true, filter: true, show: true, edit: true }
            },
            status: { 
              availableValues: [
                { value: 'active', label: '✅ Active' },
                { value: 'draft', label: '📝 Draft' },
                { value: 'archived', label: '🗄️ Archived' }
              ]
            },
            created_at: { 
              isVisible: { list: true, filter: true, show: true, edit: false },
              type: 'datetime',
            },
          },
        },
      },
      {
        resource: db.table("course_materials"),
        options: {
          id: "course_materials",
          navigation: { 
            name: "📚 Course Management",
            icon: "BookOpen"
          },
          parent: {
            name: "📚 Course Management",
            icon: "BookOpen"
          },
          properties: { 
            course_id: { 
              reference: "courses",
              isVisible: { list: true, filter: true, show: true, edit: true }
            }
          },
        },
      },
      {
        resource: db.table("course_enrollments"),
        options: {
          id: "course_enrollments",
          navigation: { 
            name: "📚 Course Management",
            icon: "BookOpen"
          },
          parent: {
            name: "📚 Course Management",
            icon: "BookOpen"
          },
          properties: {
            course_id: { 
              reference: "courses",
              isVisible: { list: true, filter: true, show: true, edit: true }
            },
            freelancer_id: { 
              reference: "users",
              isVisible: { list: true, filter: true, show: true, edit: true }
            },
            enrollment_date: {
              type: 'datetime',
              isVisible: { list: true, filter: true, show: true, edit: false }
            },
          },
        },
      },

      // APPOINTMENT MANAGEMENT SECTION
      {
        resource: db.table("appointments"),
        options: { 
          id: "appointments", 
          navigation: { 
            name: "📅 Appointments",
            icon: "Calendar"
          },
          sort: {
            sortBy: 'appointment_date',
            direction: 'desc',
          },
          properties: {
            status: {
              availableValues: [
                { value: 'pending', label: '⏳ Pending' },
                { value: 'confirmed', label: '✅ Confirmed' },
                { value: 'completed', label: '✔️ Completed' },
                { value: 'cancelled', label: '❌ Cancelled' }
              ]
            },
            appointment_date: {
              type: 'datetime',
              isVisible: { list: true, filter: true, show: true, edit: true }
            },
            created_at: {
              type: 'datetime',
              isVisible: { list: true, filter: true, show: true, edit: false }
            },
          },
        },
      },

      // FREELANCING SECTION
      {
        resource: db.table("categories"),
        options: {
          id: "categories",
          navigation: { 
            name: "💼 Freelancing Hub",
            icon: "Briefcase"
          },
          sort: {
            sortBy: 'name',
            direction: 'asc',
          },
          properties: {
            name: { isVisible: { list: true, filter: true, show: true, edit: true } },
            description: { 
              type: 'textarea',
              isVisible: { list: false, filter: false, show: true, edit: true }
            },
            is_active: {
              type: 'boolean',
              availableValues: [
                { value: true, label: '✅ Active' },
                { value: false, label: '❌ Inactive' }
              ]
            },
          },
        },
      },

      // PROJECTS (Enhanced with better field configuration)
      {
        resource: db.table("projects"),
        options: {
          id: "projects",
          navigation: { 
            name: "💼 Freelancing Hub",
            icon: "Briefcase"
          },
          sort: {
            sortBy: 'created_at',
            direction: 'desc',
          },
          listProperties: ['id', 'title', 'user_id', 'category_id', 'status', 'budget_min', 'budget_max', 'created_at'],
          filterProperties: ['title', 'status', 'category_id', 'user_id', 'assigned_freelancer_id', 'created_at'],
          properties: {
            id: { isVisible: { list: true, filter: false, show: true, edit: false } },
            title: { 
              isVisible: { list: true, filter: true, show: true, edit: true },
              type: 'string'
            },
            description: { 
              type: 'textarea',
              isVisible: { list: false, filter: false, show: true, edit: true }
            },
            user_id: { 
              reference: "users",
              isVisible: { list: true, filter: true, show: true, edit: true }
            },
            category_id: { 
              reference: "categories",
              isVisible: { list: true, filter: true, show: true, edit: true }
            },
            sub_category_id: { 
              isVisible: { list: false, filter: true, show: true, edit: true }
            },
            assigned_freelancer_id: { 
              reference: "users",
              isVisible: { list: false, filter: true, show: true, edit: true }
            },
            status: {
              availableValues: [
                { value: 'open', label: '🆕 Open' },
                { value: 'assigned', label: '👤 Assigned' },
                { value: 'in_progress', label: '⚡ In Progress' },
                { value: 'completed', label: '✅ Completed' },
                { value: 'cancelled', label: '❌ Cancelled' }
              ]
            },
            budget_min: { 
              type: 'currency',
              isVisible: { list: true, filter: true, show: true, edit: true }
            },
            budget_max: { 
              type: 'currency',
              isVisible: { list: true, filter: true, show: true, edit: true }
            },
            duration: {
              isVisible: { list: false, filter: false, show: true, edit: true }
            },
            location: {
              isVisible: { list: false, filter: false, show: true, edit: true }
            },
            is_deleted: {
              type: 'boolean',
              isVisible: { list: false, filter: true, show: true, edit: false }
            },
            created_at: {
              type: 'datetime',
              isVisible: { list: true, filter: true, show: true, edit: false }
            },
            updated_at: {
              type: 'datetime',
              isVisible: { list: false, filter: false, show: true, edit: false }
            },
          },
          actions: {
            new: { isVisible: true },
            edit: { isVisible: true },
            delete: { isVisible: true },
            show: { isVisible: true },
          },
        },
      },

      // PROJECT ASSIGNMENTS
      {
        resource: db.table("project_assignments"),
        options: {
          id: "project_assignments",
          navigation: { 
            name: "💼 Freelancing Hub",
            icon: "Briefcase"
          },
          sort: {
            sortBy: 'assigned_at',
            direction: 'desc',
          },
          properties: {
            id: { isVisible: { list: true, filter: false, show: true, edit: false } },
            project_id: { 
              reference: "projects",
              isVisible: { list: true, filter: true, show: true, edit: true }
            },
            freelancer_id: { 
              reference: "users",
              isVisible: { list: true, filter: true, show: true, edit: true }
            },
            status: {
              availableValues: [
                { value: 'active', label: '✅ Active' },
                { value: 'completed', label: '✔️ Completed' },
                { value: 'cancelled', label: '❌ Cancelled' }
              ]
            },
            assigned_at: {
              type: 'datetime',
              isVisible: { list: true, filter: true, show: true, edit: false }
            },
          },
        },
      },

      {
        resource: db.table("plans"),
        options: {
          id: "plans",
          navigation: { 
            name: "💼 Freelancing Hub",
            icon: "Briefcase"
          },
          properties: {
            name: { isVisible: { list: true, filter: true, show: true, edit: true } },
            price: { 
              type: 'currency',
              isVisible: { list: true, filter: true, show: true, edit: true }
            },
            features: { 
              type: 'textarea',
              isVisible: { list: false, filter: false, show: true, edit: true }
            },
            is_active: {
              type: 'boolean',
              availableValues: [
                { value: true, label: '✅ Active' },
                { value: false, label: '❌ Inactive' }
              ]
            },
          },
        },
      },
      
      {
        resource: db.table("subscriptions"),
        options: {
          id: "subscriptions",
          navigation: { 
            name: "💼 Freelancing Hub",
            icon: "Briefcase"
          },
          properties: {
            freelancer_id: { 
              reference: "users",
              isVisible: { list: true, filter: true, show: true, edit: true }
            },
            plan_id: { 
              reference: "plans",
              isVisible: { list: true, filter: true, show: true, edit: true }
            },
            status: {
              availableValues: [
                { value: 'active', label: '✅ Active' },
                { value: 'expired', label: '⏰ Expired' },
                { value: 'cancelled', label: '❌ Cancelled' }
              ]
            },
            start_date: {
              type: 'date',
              isVisible: { list: true, filter: true, show: true, edit: true }
            },
            end_date: {
              type: 'date',
              isVisible: { list: true, filter: true, show: true, edit: true }
            },
          },
        },
      },
    ],
  });

  if (process.env.NODE_ENV !== "production") {
    admin.watch();
  }

  const customCSS = `
    /* Remove AdminJS branding */
    .adminjs_SoftwareBrothers,
    .software-brothers,
    [data-testid="software-brothers"] {
      display: none !important;
    }

    /* Hide "Made with AdminJS" text */
    footer,
    .footer,
    [class*="footer"] {
      display: none !important;
    }

    /* Custom sidebar styling */
    .adminjs_Sidebar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1) !important;
    }

    /* Navigation items styling */
    .adminjs_NavigationElement {
      margin-bottom: 4px !important;
      border-radius: 8px !important;
      transition: all 0.2s ease !important;
    }

    .adminjs_NavigationElement:hover {
      background-color: rgba(255,255,255,0.1) !important;
      transform: translateX(4px) !important;
    }

    /* Active navigation item */
    .adminjs_NavigationElement.active {
      background-color: rgba(255,255,255,0.2) !important;
      border-left: 3px solid #ffffff !important;
    }

    /* Header styling */
    .adminjs_Header {
      background: white !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
      border-bottom: 1px solid #e5e7eb !important;
    }

    /* Table improvements */
    .adminjs_Table {
      box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
      border-radius: 8px !important;
      overflow: hidden !important;
    }

    /* Button styling */
    .adminjs_Button {
      border-radius: 6px !important;
      transition: all 0.2s ease !important;
    }

    .adminjs_Button:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
    }

    /* Form improvements */
    .adminjs_FormGroup {
      margin-bottom: 20px !important;
    }

    .adminjs_Input,
    .adminjs_Textarea,
    .adminjs_Select {
      border-radius: 6px !important;
      border: 1px solid #d1d5db !important;
      transition: all 0.2s ease !important;
    }

    .adminjs_Input:focus,
    .adminjs_Textarea:focus,
    .adminjs_Select:focus {
      border-color: #667eea !important;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
    }

    /* Card styling */
    .adminjs_Box {
      border-radius: 12px !important;
      box-shadow: 0 4px 6px rgba(0,0,0,0.07) !important;
      border: 1px solid #f3f4f6 !important;
    }

    /* Remove any remaining branding */
    a[href*="adminjs.co"],
    a[href*="softwarebrothers"],
    [data-testid*="software"],
    .made-with-love {
      display: none !important;
    }

    /* Improve spacing */
    .adminjs_Main {
      padding: 24px !important;
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* Project status styling */
    .adminjs_PropertyValue[data-property="status"] {
      font-weight: 600 !important;
    }

    /* Budget fields styling */
    .adminjs_PropertyValue[data-property*="budget"] {
      color: #10B981 !important;
      font-weight: 600 !important;
    }

    /* Enhanced table rows */
    .adminjs_TableRow:hover {
      background-color: #F9FAFB !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
    }
  `;

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

  app.get('/admin/custom-styles.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.send(customCSS);
  });

  app.use(admin.options.rootPath, adminRouter);
  console.log(`✅ OrderzHouse Admin Panel mounted at ${admin.options.rootPath}`);
};