import bcrypt from "bcryptjs";

export const createFreelancersResource = async (db, logAdminAction) => {
  return {
    resource: db.table("users"),
    options: {
      id: "freelancers",
      navigation: { name: "Freelancer Management", icon: "Code" },

      listProperties: [
        "id",
        "first_name",
        "last_name",
        "email",
        "username",
        "phone_number",
        "country",
        "rating",
        "wallet",
        "is_verified",
        "is_online",
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
        "rating",
        "wallet",
        "violation_count",
        "is_verified",
        "is_deleted",
        "is_online",
        "socket_id",
        "created_at",
        "updated_at",
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
        "rating",
        "wallet",
        "is_verified",
        "is_deleted",
      ],

      filterProperties: [
        "first_name",
        "last_name",
        "email",
        "username",
        "country",
        "rating",
        "is_verified",
        "is_deleted",
        "is_online",
      ],

      sort: { sortBy: "rating", direction: "desc" },

      properties: {
        role_id: {
          isVisible: { list: false, filter: false, show: false, edit: false },
        },

        first_name: {
          isRequired: true,
          description: "Freelancer's first name",
        },
        last_name: {
          isRequired: true,
          description: "Freelancer's last name",
        },
        email: {
          isRequired: true,
          type: "email",
          description: "Freelancer's email address",
        },
        username: {
          isRequired: true,
          description: "Freelancer username",
        },
        password: {
          type: "password",
          isRequired: false,
          isVisible: { list: false, show: false, edit: true, filter: false },
          description:
            "Freelancer password (required for new freelancers, leave empty to keep current when editing)",
        },
        phone_number: {
          isRequired: true,
          description: "Freelancer's phone number",
        },
        country: {
          isRequired: true,
          description: "Freelancer's country",
        },

        profile_pic_url: {
          type: "url",
          description: "Profile picture URL",
          isVisible: { list: false, show: true, edit: true, filter: false },
        },

        rating: {
          type: "number",
          description: "Freelancer rating (0-5 stars)",
          props: { min: 0, max: 5, step: 0.1 },
        },
        wallet: {
          type: "number",
          description: "Freelancer wallet balance",
          props: { min: 0, step: 0.01 },
        },
        violation_count: {
          type: "number",
          isVisible: { list: false, show: true, edit: false, filter: false },
          description: "Number of policy violations",
        },

        is_verified: {
          type: "boolean",
          description: "Account verification status",
        },
        is_deleted: {
          type: "boolean",
          isVisible: { list: false, show: true, edit: true, filter: true },
          description: "Account status",
        },
        is_online: {
          type: "boolean",
          isVisible: { list: true, show: true, edit: false, filter: true },
          description: "Current online status",
        },

        socket_id: {
          type: "string",
          isVisible: { list: false, show: true, edit: false, filter: false },
          description: "Socket connection ID",
        },
        created_at: {
          type: "datetime",
          isVisible: { list: true, show: true, edit: false, filter: false },
          description: "Account creation date",
        },
        updated_at: {
          type: "datetime",
          isVisible: { list: false, show: true, edit: false, filter: false },
          description: "Last update date",
        },
      },

      styles: {
        ".freelancer-header": {
          background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
          color: "white",
          padding: "1rem",
          "border-radius": "8px 8px 0 0",
        },
        ".freelancer-row": {
          background: "#e3f2fd",
          "border-left": "4px solid #2196f3",
        },
        ".rating-high": {
          color: "#4caf50",
          "font-weight": "bold",
        },
        ".rating-medium": {
          color: "#ff9800",
          "font-weight": "bold",
        },
        ".rating-low": {
          color: "#f44336",
          "font-weight": "bold",
        },
      },

      actions: {
        list: {
          before: async (request) => {
            request.query = {
              ...request.query,
              "filters.role_id": "3",
            };

            if (!request.query["filters.is_deleted"]) {
              request.query = {
                ...request.query,
                "filters.is_deleted": "false",
              };
            }

            return request;
          },
          after: async (response) => {
            if (response.records) {
              response.records = response.records.map((record) => {
                record.params.role_name = "Freelancer";
                record.params.full_name = `${record.params.first_name} ${record.params.last_name}`;

                const rating = parseFloat(record.params.rating) || 0;
                if (rating >= 4.0) record.params.rating_class = "rating-high";
                else if (rating >= 3.0)
                  record.params.rating_class = "rating-medium";
                else record.params.rating_class = "rating-low";

                return record;
              });
            }
            return response;
          },
        },

        new: {
          before: async (request) => {
            if (request.payload) {
              if (
                !request.payload.password ||
                request.payload.password.trim() === ""
              ) {
                throw new Error("Password is required for new freelancers");
              }

              request.payload.role_id = 3;
              request.payload.is_deleted = false;
              request.payload.violation_count = 0;
              request.payload.rating = request.payload.rating || 0.0;
              request.payload.wallet = request.payload.wallet || 0.0;
              request.payload.is_online = false;

              if (!request.payload.created_at) {
                request.payload.created_at = new Date().toISOString();
              }
              if (!request.payload.updated_at) {
                request.payload.updated_at = new Date().toISOString();
              }

              if (request.payload.password?.trim()) {
                request.payload.password = await bcrypt.hash(
                  request.payload.password,
                  10
                );
              }
            }
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Created new Freelancer: ${request.payload.email} (${request.payload.first_name} ${request.payload.last_name})`
              );
            }
            return response;
          },
        },

        edit: {
          before: async (request) => {
            if (request.payload) {
              request.payload.updated_at = new Date().toISOString();

              request.payload.role_id = 3;

              if (
                !request.payload.password ||
                request.payload.password.trim() === ""
              ) {
                delete request.payload.password; 
              } else if (request.payload.password?.trim()) {
                request.payload.password = await bcrypt.hash(
                  request.payload.password,
                  10
                );
              }

              if (request.payload.rating !== undefined) {
                const rating = parseFloat(request.payload.rating);
                if (rating < 0 || rating > 5) {
                  throw new Error("Rating must be between 0 and 5");
                }
              }

              if (request.payload.wallet !== undefined) {
                const wallet = parseFloat(request.payload.wallet);
                if (wallet < 0) {
                  throw new Error("Wallet balance cannot be negative");
                }
              }
            }
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Updated Freelancer ID: ${request.params.recordId} - Email: ${
                  request.payload.email || "N/A"
                }`
              );
            }
            return response;
          },
        },

        delete: {
          before: async (request) => {
            request.payload = {
              is_deleted: true,
              updated_at: new Date().toISOString(),
            };
            request.method = "POST";
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `SOFT DELETED Freelancer with ID: ${request.params.recordId}`
              );
            }
            return response;
          },
        },

        restore: {
          actionType: "record",
          icon: "Refresh",
          variant: "success",
          component: false,
          isVisible: (context) => {
            return context.record && context.record.params.is_deleted === true;
          },
          handler: async (request, response, context) => {
            const { record, resource } = context;

            await resource.update(record.id(), {
              is_deleted: false,
              updated_at: new Date().toISOString(),
            });

            if (context.currentAdmin) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `RESTORED Freelancer ID: ${record.id()}`
              );
            }

            return {
              notice: {
                message: "Freelancer successfully restored!",
                type: "success",
              },
            };
          },
        },
      },
    },
  };
};
