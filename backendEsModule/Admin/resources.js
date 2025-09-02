// Admin/resources.js
import { checkTableExists } from "./utils.js";

export const createResourceConfigs = async (
  db,
  tableExists,
  logAdminAction
) => {
  const { subCategoriesTableExists, paymentsTableExists, receiptsTableExists } =
    tableExists;

  const resources = [
    // All Users Resource - User Management
    {
      resource: db.table("users"),
      options: {
        id: "users",
        navigation: { name: "User Management", icon: "Users" },
        listProperties: [
          "id",
          "first_name",
          "last_name",
          "email",
          "role_id",
          "created_at",
        ],
        showProperties: [
          "id",
          "first_name",
          "last_name",
          "email",
          "role_id",
          "created_at",
        ],
        editProperties: [
          "first_name",
          "last_name",
          "email",
          "password",
          "role_id",
        ],
        filterProperties: ["first_name", "last_name", "email", "role_id"],
        properties: {
          role_id: {
            availableValues: [
              { value: 1, label: "Admin" },
              { value: 2, label: "Client" },
              { value: 3, label: "Freelancer" },
            ],
            isRequired: true,
          },
          password: { type: "password" },
          first_name: { isRequired: true },
          last_name: { isRequired: true },
          email: { isRequired: true },
        },
        actions: {
          new: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin created new user: ${request.payload.email} (${request.payload.first_name} ${request.payload.last_name}) with role ${request.payload.role_id}`
                );
              }
              return response;
            },
          },
          edit: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin updated user ID: ${request.params.recordId} - Email: ${
                    request.payload.email || "N/A"
                  }`
                );
              }
              return response;
            },
          },
          delete: {
            after: async (response, request, context) => {
              if (context.currentAdmin) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin DELETED user with ID: ${request.params.recordId} - PERMANENT DELETION`
                );
              }
              return response;
            },
          },
        },
      },
    },

    // Clients - User Management
    {
      resource: db.table("users"),
      options: {
        id: "clients",
        navigation: { name: "User Management", icon: "Users" },
        listProperties: [
          "id",
          "first_name",
          "last_name",
          "email",
          "created_at",
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
                "filters.role_id": "2",
              };
              return request;
            },
          },
          new: {
            before: async (request) => {
              if (request.payload) request.payload.role_id = 2;
              return request;
            },
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin created new client: ${request.payload.email} (${request.payload.first_name} ${request.payload.last_name})`
                );
              }
              return response;
            },
          },
          edit: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin updated client ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
          delete: {
            after: async (response, request, context) => {
              if (context.currentAdmin) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin DELETED client with ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
        },
      },
    },

    // Freelancers - User Management
    {
      resource: db.table("users"),
      options: {
        id: "freelancers",
        navigation: { name: "User Management", icon: "Users" },
        listProperties: [
          "id",
          "first_name",
          "last_name",
          "email",
          "created_at",
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
                "filters.role_id": "3",
              };
              return request;
            },
          },
          new: {
            before: async (request) => {
              if (request.payload) request.payload.role_id = 3;
              return request;
            },
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin created new freelancer: ${request.payload.email} (${request.payload.first_name} ${request.payload.last_name})`
                );
              }
              return response;
            },
          },
          edit: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin updated freelancer ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
          delete: {
            after: async (response, request, context) => {
              if (context.currentAdmin) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin DELETED freelancer with ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
        },
      },
    },

    // Projects - Project Management
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
            props: { currency: "JD" },
            isRequired: true,
          },
          budget_max: {
            type: "currency",
            props: { currency: "JD" },
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
        },
        actions: {
          new: {
            before: async (request) => {
              if (request.payload && !request.payload.status) {
                request.payload.status = "draft";
              }
              return request;
            },
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin created new project: "${request.payload.title}" - Budget: ${request.payload.budget_min}-${request.payload.budget_max} JD`
                );
              }
              return response;
            },
          },
          edit: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin updated project ID: ${
                    request.params.recordId
                  } - Title: "${request.payload.title || "N/A"}"`
                );
              }
              return response;
            },
          },
          delete: {
            after: async (response, request, context) => {
              if (context.currentAdmin) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin DELETED project ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
        },
      },
    },

    // Appointments - Business Management
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
              { value: "pending", label: "Pending" },
              { value: "accepted", label: "Accepted" },
              { value: "rejected", label: "Rejected" },
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
          appointment_date: { type: "datetime", isRequired: true },
          message: {
            type: "textarea",
            props: { rows: 3 },
            description: "Appointment details",
          },
        },
        actions: {
          new: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin created new appointment for freelancer ${request.payload.freelancer_id} - Type: ${request.payload.appointment_type}`
                );
              }
              return response;
            },
          },
          edit: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin updated appointment ID: ${request.params.recordId} - Status: ${request.payload.status}`
                );
              }
              return response;
            },
          },
          delete: {
            after: async (response, request, context) => {
              if (context.currentAdmin) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin DELETED appointment ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
        },
      },
    },

    // Plans - Business Management
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
        filterProperties: ["name", "price"],
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
        actions: {
          new: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin created new plan: "${request.payload.name}" - Price: $${request.payload.price}`
                );
              }
              return response;
            },
          },
          edit: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin updated plan ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
          delete: {
            after: async (response, request, context) => {
              if (context.currentAdmin) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin DELETED plan ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
        },
      },
    },

    // Courses - Content Management
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
        actions: {
          new: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin created new course: "${request.payload.title}" - Price: $${request.payload.price}`
                );
              }
              return response;
            },
          },
          edit: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin updated course ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
          delete: {
            after: async (response, request, context) => {
              if (context.currentAdmin) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin DELETED course ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
        },
      },
    },

    // Categories - Content Management
    {
      resource: db.table("categories"),
      options: {
        id: "categories",
        navigation: { name: "Content Management", icon: "Tag" },
        listProperties: ["id", "name", "description"],
        showProperties: ["id", "name", "description", "created_at"],
        editProperties: ["name", "description"],
        filterProperties: ["name"],
        properties: {
          name: { isRequired: true },
          description: { type: "textarea", props: { rows: 3 } },
        },
        actions: {
          new: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin created new category: "${request.payload.name}"`
                );
              }
              return response;
            },
          },
          edit: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin updated category ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
          delete: {
            after: async (response, request, context) => {
              if (context.currentAdmin) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin DELETED category ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
        },
      },
    },

    // System Logs - System Management
    {
      resource: db.table("logs"),
      options: {
        id: "logs",
        navigation: { name: "System Management", icon: "Activity" },
        listProperties: ["id", "user_id", "action", "created_at"],
        showProperties: ["id", "user_id", "action", "created_at"],
        editProperties: [],
        filterProperties: ["user_id", "action", "created_at"],
        sort: { sortBy: "created_at", direction: "desc" },
        properties: {
          user_id: {
            reference: "users",
            type: "reference",
            description: "Admin user who performed the action",
          },
          action: { type: "textarea", description: "Admin action performed" },
          created_at: { type: "datetime" },
        },
      },
    },
  ];

  // Add optional resources based on table existence
  if (subCategoriesTableExists) {
    resources.push({
      resource: db.table("sub_categories"),
      options: {
        id: "sub_categories",
        navigation: { name: "Content Management", icon: "Tag" },
        listProperties: ["id", "name", "category_id", "description"],
        showProperties: [
          "id",
          "name",
          "category_id",
          "description",
          "created_at",
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
        actions: {
          new: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin created new sub-category: "${request.payload.name}"`
                );
              }
              return response;
            },
          },
          edit: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin updated sub-category ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
          delete: {
            after: async (response, request, context) => {
              if (context.currentAdmin) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin DELETED sub-category ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
        },
      },
    });
  }

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
          "payment_date",
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
        actions: {
          new: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin created new payment: $${request.payload.amount} from user ${request.payload.payer_id} to user ${request.payload.receiver_id}`
                );
              }
              return response;
            },
          },
          edit: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin updated payment ID: ${
                    request.params.recordId
                  } - Amount: $${request.payload.amount || "N/A"}`
                );
              }
              return response;
            },
          },
          delete: {
            after: async (response, request, context) => {
              if (context.currentAdmin) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin DELETED payment ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
        },
      },
    });
  }

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
        actions: {
          new: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin created new receipt for payment ID: ${request.payload.payment_id}`
                );
              }
              return response;
            },
          },
          edit: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin updated receipt ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
          delete: {
            after: async (response, request, context) => {
              if (context.currentAdmin) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Admin DELETED receipt ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
        },
      },
    });
  }

  // Check for verification tables
  try {
    const pool = db.pool;
    if (pool) {
      const [
        freelancerVerificationsExists,
        customerVerificationsExists,
        freelancerVerificationCategoriesExists,
      ] = await Promise.all([
        checkTableExists("freelancer_verifications", pool),
        checkTableExists("customer_verifications", pool),
        checkTableExists("freelancer_verification_categories", pool),
      ]);

      if (freelancerVerificationsExists) {
        resources.push({
          resource: db.table("freelancer_verifications"),
          options: {
            id: "freelancer_verifications",
            navigation: { name: "Verification Management", icon: "Shield" },
            listProperties: [
              "id",
              "user_id",
              "full_name",
              "country",
              "phone_number",
              "status",
              "reviewed_at",
            ],
            showProperties: [
              "id",
              "user_id",
              "full_name",
              "country",
              "phone_number",
              "bio",
              "skills",
              "portfolio_url",
              "status",
              "reviewed_at",
              "created_at",
            ],
            editProperties: [
              "user_id",
              "full_name",
              "country",
              "phone_number",
              "bio",
              "skills",
              "portfolio_url",
              "status",
              "reviewed_at",
            ],
            filterProperties: ["status", "country", "user_id"],
            sort: { sortBy: "created_at", direction: "desc" },
            properties: {
              user_id: {
                reference: "users",
                type: "reference",
                isRequired: true,
                description: "Freelancer user account",
              },
              full_name: {
                type: "string",
                isRequired: true,
                description: "Full legal name",
              },
              country: {
                type: "string",
                isRequired: true,
                description: "Country of residence",
              },
              phone_number: {
                type: "string",
                isRequired: true,
                description: "Contact phone number",
              },
              bio: {
                type: "textarea",
                props: { rows: 4 },
                description: "Professional biography",
              },
              skills: {
                type: "textarea",
                props: { rows: 3 },
                description: "Skills and expertise",
              },
              portfolio_url: {
                type: "url",
                description: "Portfolio website URL",
              },
              status: {
                availableValues: [
                  { value: "pending", label: "Pending Review" },
                  { value: "approved", label: "Approved" },
                  { value: "rejected", label: "Rejected" },
                  { value: "under_review", label: "Under Review" },
                ],
                isRequired: true,
              },
              reviewed_at: {
                type: "datetime",
                description: "When the verification was reviewed",
              },
              created_at: {
                type: "datetime",
                description: "When the verification was submitted",
              },
            },
            actions: {
              edit: {
                after: async (response, request, context) => {
                  if (context.currentAdmin && request.payload) {
                    await logAdminAction(
                      context.currentAdmin.id,
                      context.currentAdmin.email,
                      `Admin updated freelancer verification ID: ${
                        request.params.recordId
                      } - Status: ${request.payload.status || "N/A"}`
                    );
                  }
                  return response;
                },
              },
              new: {
                after: async (response, request, context) => {
                  if (context.currentAdmin && request.payload) {
                    await logAdminAction(
                      context.currentAdmin.id,
                      context.currentAdmin.email,
                      `Admin created freelancer verification for user: ${request.payload.user_id}`
                    );
                  }
                  return response;
                },
              },
            },
          },
        });
      }

      if (customerVerificationsExists) {
        resources.push({
          resource: db.table("customer_verifications"),
          options: {
            id: "customer_verifications",
            navigation: { name: "Verification Management", icon: "Shield" },
            listProperties: [
              "id",
              "user_id",
              "full_name",
              "country",
              "phone_number",
              "document_type",
              "status",
              "reviewed_at",
            ],
            showProperties: [
              "id",
              "user_id",
              "full_name",
              "country",
              "phone_number",
              "document_type",
              "document_number",
              "status",
              "reviewed_at",
              "created_at",
            ],
            editProperties: [
              "user_id",
              "full_name",
              "country",
              "phone_number",
              "document_type",
              "document_number",
              "status",
              "reviewed_at",
            ],
            filterProperties: ["status", "country", "document_type", "user_id"],
            sort: { sortBy: "created_at", direction: "desc" },
            properties: {
              user_id: {
                reference: "users",
                type: "reference",
                isRequired: true,
                description: "Customer user account",
              },
              full_name: {
                type: "string",
                isRequired: true,
                description: "Full legal name",
              },
              country: {
                type: "string",
                isRequired: true,
                description: "Country of residence",
              },
              phone_number: {
                type: "string",
                isRequired: true,
                description: "Contact phone number",
              },
              document_type: {
                type: "string",
                availableValues: [
                  { value: "passport", label: "Passport" },
                  { value: "national_id", label: "National ID" },
                  { value: "driver_license", label: "Driver's License" },
                  { value: "other", label: "Other Government ID" },
                ],
                description: "Type of identification document",
              },
              document_number: {
                type: "string",
                description: "Document identification number",
              },
              status: {
                availableValues: [
                  { value: "pending", label: "Pending Review" },
                  { value: "approved", label: "Approved" },
                  { value: "rejected", label: "Rejected" },
                  { value: "under_review", label: "Under Review" },
                ],
                isRequired: true,
              },
              reviewed_at: {
                type: "datetime",
                description: "When the verification was reviewed",
              },
              created_at: {
                type: "datetime",
                description: "When the verification was submitted",
              },
            },
            actions: {
              edit: {
                after: async (response, request, context) => {
                  if (context.currentAdmin && request.payload) {
                    await logAdminAction(
                      context.currentAdmin.id,
                      context.currentAdmin.email,
                      `Admin updated customer verification ID: ${
                        request.params.recordId
                      } - Status: ${request.payload.status || "N/A"}`
                    );
                  }
                  return response;
                },
              },
              new: {
                after: async (response, request, context) => {
                  if (context.currentAdmin && request.payload) {
                    await logAdminAction(
                      context.currentAdmin.id,
                      context.currentAdmin.email,
                      `Admin created customer verification for user: ${request.payload.user_id}`
                    );
                  }
                  return response;
                },
              },
            },
          },
        });
      }

      if (freelancerVerificationCategoriesExists) {
        resources.push({
          resource: db.table("freelancer_verification_categories"),
          options: {
            id: "freelancer_verification_categories",
            navigation: { name: "Verification Management", icon: "Shield" },
            listProperties: ["id", "user_id", "category_id"],
            showProperties: ["id", "user_id", "category_id"],
            editProperties: ["user_id", "category_id"],
            filterProperties: ["user_id", "category_id"],
            properties: {
              user_id: {
                reference: "users",
                type: "reference",
                isRequired: true,
                description: "Freelancer user",
              },
              category_id: {
                reference: "categories",
                type: "reference",
                isRequired: true,
                description: "Verified category",
              },
            },
            actions: {
              new: {
                after: async (response, request, context) => {
                  if (context.currentAdmin && request.payload) {
                    await logAdminAction(
                      context.currentAdmin.id,
                      context.currentAdmin.email,
                      `Admin linked freelancer ${request.payload.user_id} to category ${request.payload.category_id}`
                    );
                  }
                  return response;
                },
              },
              delete: {
                after: async (response, request, context) => {
                  if (context.currentAdmin) {
                    await logAdminAction(
                      context.currentAdmin.id,
                      context.currentAdmin.email,
                      `Admin removed freelancer-category link ID: ${request.params.recordId}`
                    );
                  }
                  return response;
                },
              },
            },
          },
        });
      }

      console.log(`Verification tables check completed:`);
      console.log(
        `   - Freelancer Verifications: ${freelancerVerificationsExists}`
      );
      console.log(
        `   - Customer Verifications: ${customerVerificationsExists}`
      );
      console.log(
        `   - Freelancer Verification Categories: ${freelancerVerificationCategoriesExists}`
      );
    }
  } catch (error) {
    console.error("Error checking verification tables:", error.message);
  }

  console.log(`Created ${resources.length} AdminJS resources successfully`);
  console.log(`Resource IDs: ${resources.map((r) => r.options.id).join(", ")}`);

  return resources;
};
