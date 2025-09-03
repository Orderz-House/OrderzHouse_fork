// Admin/resources/projects.js
export const createProjectsResource = async (db, tableExists, logAdminAction) => {
  const { subCategoriesTableExists } = tableExists;

  return {
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
      sort: { sortBy: "created_at", direction: "desc" },
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
  };
};