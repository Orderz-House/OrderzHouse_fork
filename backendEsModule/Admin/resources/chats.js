import AdminJS from "adminjs";
import { Components } from "../adminUi.js"; 
export const createChatsResource = async (db, logAdminAction) => {
  return {
    resource: { model: "messages", client: db },
    options: {
      navigation: { name: "Chats", icon: "Chat" },
      actions: {
        new: { isAccessible: false },
        edit: { isAccessible: false },
        delete: { isAccessible: false },

        viewChat: {
          actionType: "record",
          icon: "Chat",
          component: Components.Chats, 
        },
      },
      listProperties: ["id", "project_id", "sender_id", "content", "time_sent"],
      showProperties: ["id", "project_id", "sender_id", "content", "time_sent"],
      filterProperties: ["project_id", "sender_id"],
      properties: {
        id: { isVisible: { list: true, filter: false, show: true, edit: false } },
        content: { type: "richtext" },
        time_sent: { type: "datetime" },
      },
    },
  };
};
