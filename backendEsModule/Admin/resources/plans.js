export const createPlansResource = async (db, logAdminAction) => {
  return {
    resource: db.table("plans"),
    options: {
      id: "plans",
      navigation: { name: "Subscription Management", icon: "CreditCard" },

      listProperties: ["id", "name", "price", "duration_days", "created_at"],
      showProperties: [
        "id",
        "name",
        "description",
        "price",
        "duration_days",
        "created_at",
        "updated_at",
      ],
      editProperties: ["name", "description", "price", "duration_days"],
      filterProperties: ["name", "price", "duration_days"],

      properties: {
        name: { isRequired: true, description: "Plan name" },
        description: { type: "richtext", description: "Plan description" },
        price: {
          type: "number",
          isRequired: true,
          props: { min: 0, step: 0.01 },
        },
        duration_days: {
          type: "number",
          isRequired: true,
          description: "Duration in days",
        },
        created_at: {
          type: "datetime",
          isVisible: { list: true, show: true, edit: false, filter: false },
        },
        updated_at: {
          type: "datetime",
          isVisible: { list: false, show: true, edit: false, filter: false },
        },
      },

      actions: {
        new: {
          before: async (request) => {
            if (request.payload) {
              if (!request.payload.created_at)
                request.payload.created_at = new Date().toISOString();
              if (!request.payload.updated_at)
                request.payload.updated_at = new Date().toISOString();
            }
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Created new Plan: ${request.payload.name}`
              );
            }
            return response;
          },
        },

        edit: {
          before: async (request) => {
            if (request.payload) {
              request.payload.updated_at = new Date().toISOString();
            }
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Edited Plan ID: ${request.params.recordId} - ${request.payload.name}`
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
                `Deleted Plan ID: ${request.params.recordId}`
              );
            }
            return response;
          },
        },
      },
    },
  };
};
