export const createContentResources = async (
  db,
  tableExists,
  logAdminAction
) => {
  const resources = [];

  /**
   * ===============================
   * Categories Resource
   * ===============================
   */
  resources.push({
    resource: db.table("categories"),
    options: {
      id: "categories",
      navigation: { name: "Content Management", icon: "Tag" },
      listProperties: ["id", "name", "description"],
      showProperties: ["id", "name", "description"],
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
  });

  /**
   * ===============================
   * Sub-Categories Resource
   * ===============================
   */
  resources.push({
    resource: db.table("sub_categories"),
    options: {
      id: "sub_categories",
      navigation: { name: "Content Management", icon: "Tags" },
      listProperties: ["id", "name", "category_id", "description", "created_at"],
      showProperties: ["id", "name", "category_id", "description", "created_at"],
      editProperties: ["name", "category_id", "description"],
      filterProperties: ["name", "category_id"],
      properties: {
        name: { isRequired: true },
        category_id: {
          reference: "categories",
          type: "reference",
          isRequired: true,
          description: "Parent category this sub-category belongs to",
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

  /**
   * ===============================
   * News Resource
   * ===============================
   */
  resources.push({
    resource: db.table("news"),
    options: {
      id: "news",
      navigation: { name: "Content Management", icon: "Newspaper" },
      listProperties: ["id", "title", "is_approved", "created_by", "created_at"],
      showProperties: [
        "id",
        "title",
        "content",
        "image_url",
        "is_approved",
        "created_by",
        "created_at",
        "updated_at",
      ],
      editProperties: ["title", "content", "image_url", "is_approved"],
      filterProperties: ["title", "is_approved", "created_by"],
      properties: {
        title: { isRequired: true },
        content: { type: "textarea", props: { rows: 5 }, isRequired: true },
        image_url: { type: "string" },
        is_approved: {
          type: "boolean",
          props: { trueLabel: "Approved", falseLabel: "Pending" },
        },
        created_by: {
          reference: "admins", // can be "freelancers" or "clients"
          type: "reference",
          isVisible: { list: true, show: true, edit: false, filter: true },
        },
      },
      actions: {
        new: {
          before: async (request, context) => {
            if (context.currentAdmin) {
              request.payload = {
                ...request.payload,
                created_by: context.currentAdmin.id,
              };
            }
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Created new news: "${request.payload.title}"`
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
                `Updated news ID: ${request.params.recordId}`
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
                `DELETED news ID: ${request.params.recordId}`
              );
            }
            return response;
          },
        },
      },
    },
  });

  /**
   * ===============================
   * Freelancer Completion Resource
   * ===============================
   */
  resources.push({
    resource: db.table("freelancer_completion"),
    options: {
      id: "freelancer_completion",
      navigation: { name: "Content Management", icon: "CheckCircle" },
      listProperties: [
        "id",
        "project_id",
        "freelancer_id",
        "status",
        "completion_requested_at",
        "payment_released_at",
      ],
      showProperties: [
        "id",
        "project_id",
        "freelancer_id",
        "status",
        "completion_requested_at",
        "payment_released_at",
        "created_at",
        "updated_at",
      ],
      editProperties: ["status", "payment_released_at"],
      filterProperties: ["status", "project_id", "freelancer_id"],
      properties: {
        project_id: {
          reference: "projects",
          type: "reference",
          isRequired: true,
        },
        freelancer_id: {
          reference: "freelancers",
          type: "reference",
          isRequired: true,
        },
        status: {
          type: "string",
          availableValues: [
            { value: "pending", label: "Pending" },
            { value: "completed", label: "Completed" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ],
        },
      },
      actions: {
        new: {
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Created freelancer completion for project ID: ${request.payload.project_id}`
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
                `Updated freelancer completion ID: ${request.params.recordId}`
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
                `DELETED freelancer completion ID: ${request.params.recordId}`
              );
            }
            return response;
          },
        },
      },
    },
  });

  return resources;
};
