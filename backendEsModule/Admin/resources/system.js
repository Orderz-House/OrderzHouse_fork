// Admin/resources/system.js
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const createSystemResource = async (db, logAdminAction) => {
  return {
    resource: db.table("logs"), // Make sure this table exists
    options: {
      id: "logs",
      navigation: { name: "System Management", icon: "Activity" },
      listProperties: [
        "id",
        "user_id",
        "action_type",
        "entity_type",
        "entity_id",
        "message",
        "level",
        "status",
        "created_at",
      ],
      showProperties: [
        "id",
        "user_id",
        "action_type",
        "entity_type",
        "entity_id",
        "message",
        "level",
        "metadata",
        "status",
        "created_at",
      ],
      editProperties: [],
      filterProperties: [
        "user_id",
        "action_type",
        "entity_type",
        "entity_id",
        "level",
        "status",
        "created_at",
      ],
      sort: { sortBy: "created_at", direction: "desc" },
      properties: {
        user_id: {
          reference: "admins", // Must match registered resource ID
          type: "reference",
          description: "Admin user who performed the action",
        },
        action_type: {
          type: "string",
          description: "Type of action performed",
        },
        entity_type: {
          type: "string",
          description: "Entity affected by the action",
        },
        entity_id: { type: "number", description: "ID of the affected entity" },
        message: {
          type: "textarea",
          description: "Detailed message about the action",
        },
        level: {
          type: "string",
          description: "Log level (info, warning, error)",
          default: "info",
        },
        metadata: { type: "json", description: "Additional metadata" },
        status: {
          type: "string",
          description: "Log status",
          default: "active",
        },
        created_at: {
          type: "datetime",
          description: "Timestamp (Jordan time)",
        },
      },
      actions: {
        new: { isVisible: false },
        edit: { isVisible: false },
        delete: { isVisible: false },

        // Format timestamps for list view
        list: {
          after: async (response) => {
            if (response.records) {
              response.records = response.records.map((record) => {
                if (record.params.created_at) {
                  record.params.created_at = dayjs(record.params.created_at)
                    .tz("Asia/Amman")
                    .format("YYYY-MM-DD HH:mm:ss");
                }
                return record;
              });
            }
            return response;
          },
        },

        // Format timestamps for show view
        show: {
          after: async (response) => {
            if (response.record && response.record.params.created_at) {
              response.record.params.created_at = dayjs(
                response.record.params.created_at
              )
                .tz("Asia/Amman")
                .format("YYYY-MM-DD HH:mm:ss");
            }
            return response;
          },
        },

        // Hook example for logging actions safely
        afterActionLog: {
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Performed action on logs`
              );
            }
            return response;
          },
        },
      },
    },
  };
};
