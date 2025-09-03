// Admin/resources/system.js
export const createSystemResource = async (db, logAdminAction) => {
  return {
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
  };
};