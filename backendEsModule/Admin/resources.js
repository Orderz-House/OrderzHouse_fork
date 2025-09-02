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
    // All Users Resource - Complete User Management
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
          "username",
          "role_id",
          "phone_number",
          "country",
          "is_verified",
          "is_online",
          "rating",
          "wallet",
          "violation_count",
          "created_at",
        ],
        showProperties: [
          "id",
          "first_name",
          "last_name",
          "email",
          "username",
          "role_id",
          "phone_number",
          "country",
          "profile_pic_url",
          "is_deleted",
          "is_verified",
          "is_online",
          "rating",
          "rating_sum",
          "rating_count",
          "wallet",
          "violation_count",
          "category_id",
          "reason_for_disruption",
          "socket_id",
          "created_at",
        ],
        editProperties: [
          "first_name",
          "last_name",
          "email",
          "username",
          "password",
          "role_id",
          "phone_number",
          "country",
          "profile_pic_url",
          "is_verified",
          "wallet",
          "category_id",
          "reason_for_disruption",
        ],
        filterProperties: [
          "first_name",
          "last_name",
          "email",
          "username",
          "role_id",
          "country",
          "is_verified",
          "is_deleted",
          "is_online",
        ],
        sort: { sortBy: "created_at", direction: "desc" },
        properties: {
          role_id: {
            availableValues: [
              { value: 1, label: "Admin" },
              { value: 2, label: "Client" },
              { value: 3, label: "Freelancer" },
            ],
            isRequired: true,
          },
          password: {
            type: "password",
            isVisible: { list: false, show: false, edit: true, filter: false },
          },
          first_name: { isRequired: true },
          last_name: { isRequired: true },
          email: { isRequired: true },
          username: { isRequired: true },
          phone_number: { isRequired: true },
          country: { isRequired: true },
          profile_pic_url: {
            type: "url",
            description: "Profile picture URL",
          },
          is_verified: {
            type: "boolean",
            description: "User verification status",
          },
          is_deleted: {
            type: "boolean",
            isVisible: { list: false, show: true, edit: false, filter: true },
          },
          is_online: {
            type: "boolean",
            isVisible: { list: true, show: true, edit: false, filter: true },
          },
          rating: {
            type: "number",
            props: { min: 0, max: 5, step: 0.1 },
            isVisible: { list: true, show: true, edit: false, filter: false },
          },
          rating_sum: {
            type: "number",
            isVisible: { list: false, show: true, edit: false, filter: false },
          },
          rating_count: {
            type: "number",
            isVisible: { list: false, show: true, edit: false, filter: false },
          },
          wallet: {
            type: "currency",
            props: { currency: "USD" },
          },
          violation_count: {
            type: "number",
            isVisible: { list: true, show: true, edit: false, filter: false },
          },
          category_id: {
            reference: "categories",
            type: "reference",
            description: "Primary category for freelancers",
          },
          socket_id: {
            type: "string",
            isVisible: { list: false, show: true, edit: false, filter: false },
          },
          reason_for_disruption: {
            type: "textarea",
            props: { rows: 3 },
            description: "Reason for account disruption or suspension",
          },
          created_at: {
            type: "datetime",
            isVisible: { list: true, show: true, edit: false, filter: false },
          },
        },
        actions: {
          new: {
            before: async (request) => {
              if (request.payload && !request.payload.is_deleted) {
                request.payload.is_deleted = false;
              }
              if (request.payload && !request.payload.violation_count) {
                request.payload.violation_count = 0;
              }
              if (request.payload && !request.payload.rating) {
                request.payload.rating = 0.0;
              }
              if (request.payload && !request.payload.wallet) {
                request.payload.wallet = 0.0;
              }
              return request;
            },
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                const roleLabel =
                  request.payload.role_id === 1
                    ? "Admin"
                    : request.payload.role_id === 2
                    ? "Client"
                    : "Freelancer";
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Created new ${roleLabel}: ${request.payload.email} (${request.payload.first_name} ${request.payload.last_name})`
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
                  `Updated user ID: ${request.params.recordId} - Email: ${
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
                  `DELETED user with ID: ${request.params.recordId} - PERMANENT DELETION`
                );
              }
              return response;
            },
          },
        },
      },
    },

    // Clients Only - Filtered User View
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
          "username",
          "phone_number",
          "country",
          "is_verified",
          "wallet",
          "created_at",
        ],
        showProperties: [
          "id",
          "first_name",
          "last_name",
          "email",
          "username",
          "phone_number",
          "country",
          "profile_pic_url",
          "is_verified",
          "wallet",
          "violation_count",
          "created_at",
        ],
        editProperties: [
          "first_name",
          "last_name",
          "email",
          "username",
          "password",
          "phone_number",
          "country",
          "profile_pic_url",
          "is_verified",
          "wallet",
        ],
        filterProperties: [
          "first_name",
          "last_name",
          "email",
          "country",
          "is_verified",
        ],
        properties: {
          role_id: {
            isVisible: { list: false, filter: false, show: false, edit: false },
          },
          password: { type: "password" },
          first_name: { isRequired: true },
          last_name: { isRequired: true },
          email: { isRequired: true },
          username: { isRequired: true },
          phone_number: { isRequired: true },
          country: { isRequired: true },
          profile_pic_url: { type: "url" },
          is_verified: { type: "boolean" },
          wallet: { type: "currency", props: { currency: "USD" } },
          violation_count: {
            type: "number",
            isVisible: { list: false, show: true, edit: false, filter: false },
          },
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
              if (request.payload) {
                request.payload.role_id = 2;
                request.payload.is_deleted = false;
                request.payload.violation_count = 0;
                request.payload.rating = 0.0;
                request.payload.wallet = request.payload.wallet || 0.0;
              }
              return request;
            },
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Created new client: ${request.payload.email} (${request.payload.first_name} ${request.payload.last_name})`
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
                  `Updated client ID: ${request.params.recordId}`
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
                  `DELETED client with ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
        },
      },
    },

    // Freelancers Only - Filtered User View
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
          "username",
          "phone_number",
          "country",
          "is_verified",
          "rating",
          "wallet",
          "category_id",
          "created_at",
        ],
        showProperties: [
          "id",
          "first_name",
          "last_name",
          "email",
          "username",
          "phone_number",
          "country",
          "profile_pic_url",
          "is_verified",
          "rating",
          "rating_sum",
          "rating_count",
          "wallet",
          "violation_count",
          "category_id",
          "created_at",
        ],
        editProperties: [
          "first_name",
          "last_name",
          "email",
          "username",
          "password",
          "phone_number",
          "country",
          "profile_pic_url",
          "is_verified",
          "wallet",
          "category_id",
        ],
        filterProperties: [
          "first_name",
          "last_name",
          "email",
          "country",
          "is_verified",
          "category_id",
        ],
        properties: {
          role_id: {
            isVisible: { list: false, filter: false, show: false, edit: false },
          },
          password: { type: "password" },
          first_name: { isRequired: true },
          last_name: { isRequired: true },
          email: { isRequired: true },
          username: { isRequired: true },
          phone_number: { isRequired: true },
          country: { isRequired: true },
          profile_pic_url: { type: "url" },
          is_verified: { type: "boolean" },
          rating: {
            type: "number",
            props: { min: 0, max: 5, step: 0.1 },
            isVisible: { list: true, show: true, edit: false, filter: false },
          },
          rating_sum: {
            type: "number",
            isVisible: { list: false, show: true, edit: false, filter: false },
          },
          rating_count: {
            type: "number",
            isVisible: { list: false, show: true, edit: false, filter: false },
          },
          wallet: { type: "currency", props: { currency: "USD" } },
          violation_count: {
            type: "number",
            isVisible: { list: false, show: true, edit: false, filter: false },
          },
          category_id: {
            reference: "categories",
            type: "reference",
            description: "Primary freelancer category",
          },
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
              if (request.payload) {
                request.payload.role_id = 3;
                request.payload.is_deleted = false;
                request.payload.violation_count = 0;
                request.payload.rating = 0.0;
                request.payload.wallet = request.payload.wallet || 0.0;
              }
              return request;
            },
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Created new freelancer: ${request.payload.email} (${request.payload.first_name} ${request.payload.last_name})`
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
                  `Updated freelancer ID: ${request.params.recordId}`
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
                  `DELETED freelancer with ID: ${request.params.recordId}`
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
          "is_deleted",
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
          "is_deleted",
        ],
        filterProperties: [
          "title",
          "status",
          "category_id",
          "user_id",
          "assigned_freelancer_id",
          "is_deleted",
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
              if (request.payload && request.payload.is_deleted === undefined) {
                request.payload.is_deleted = false;
              }
              return request;
            },
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Created new project: "${request.payload.title}" - Budget: $${request.payload.budget_min}-${request.payload.budget_max}`
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
                  `Updated project ID: ${request.params.recordId} - Title: "${
                    request.payload.title || "N/A"
                  }"`
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
                  `DELETED project ID: ${request.params.recordId}`
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
                  `Created new category: "${request.payload.name}"`
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
                  `Updated category ID: ${request.params.recordId}`
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
                  `DELETED category ID: ${request.params.recordId}`
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
          action: {
            type: "textarea",
            description: "Admin action performed",
          },
          created_at: { type: "datetime" },
        },
        actions: {
          new: { isVisible: false },
          edit: { isVisible: false },
          delete: { isVisible: false },
        },
      },
    },
  ];

  // Add optional sub-categories resource
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
                  `Created new sub-category: "${request.payload.name}"`
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
                  `Updated sub-category ID: ${request.params.recordId}`
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
                  `DELETED sub-category ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
        },
      },
    });
  }

  // Add optional payments resource
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
                  `Created new payment: $${request.payload.amount} from user ${request.payload.payer_id} to user ${request.payload.receiver_id}`
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
                  `Updated payment ID: ${request.params.recordId} - Amount: $${
                    request.payload.amount || "N/A"
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
                  `DELETED payment ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
        },
      },
    });
  }

  // Add optional receipts resource
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
                  `Created new receipt for payment ID: ${request.payload.payment_id}`
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
                  `Updated receipt ID: ${request.params.recordId}`
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
                  `DELETED receipt ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
        },
      },
    });
  }

  return resources;
};
