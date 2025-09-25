export const createAppointmentsResource = async (db, logAdminAction) => {
  return {
    resource: db.table("appointments"),
    options: {
      id: "appointments",
      navigation: { name: "Appointments Management", icon: "Calendar" },

      listProperties: [
        "id",
        "freelancer_id",
        "appointment_date",
        "appointment_type",
        "status",
        "message",
        "created_at",
      ],

      showProperties: [
        "id",
        "freelancer_id",
        "appointment_date",
        "appointment_type",
        "status",
        "message",
        "created_at",
      ],

      editProperties: [
        "freelancer_id",
        "appointment_date",
        "appointment_type",
        "status",
        "message",
      ],

      filterProperties: [
        "freelancer_id",
        "appointment_date",
        "appointment_type",
        "status",
      ],

      properties: {
        id: { isVisible: { list: true, show: true, edit: false, filter: true } },
        freelancer_id: {
          type: "reference",
          reference: "freelancers", 
          isRequired: true,
        },
        appointment_date: {
          type: "datetime",
          isRequired: true,
        },
        appointment_type: {
          type: "string",
          availableValues: [
            { value: "online", label: "Online" },
            { value: "offline", label: "Offline" },
          ],
          isRequired: true,
        },
        status: {
          type: "string",
          availableValues: [
            { value: "pending", label: "Pending" },
            { value: "confirmed", label: "Confirmed" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ],
          default: "pending",
        },
        message: { type: "textarea" },
        created_at: {
          type: "datetime",
          isVisible: { list: true, show: true, edit: false, filter: true },
        },
      },

      actions: {
        new: {
          before: async (request) => {
            if (request.payload) {
              if (!request.payload.created_at) {
                request.payload.created_at = new Date().toISOString();
              }
              if (!request.payload.status) {
                request.payload.status = "pending";
              }
              if (!request.payload.appointment_type) {
                request.payload.appointment_type = "online";
              }
            }
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Created new appointment for freelancer ID: ${request.payload.freelancer_id}`
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
                `Updated appointment ID: ${request.params.recordId}`
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
                `Deleted appointment ID: ${request.params.recordId}`
              );
            }
            return response;
          },
        },
      },
    },
  };
};
