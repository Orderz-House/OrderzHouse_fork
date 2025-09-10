// Admin/resources/projects.js
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const createProjectsResource = async (db, logAdminAction) => {
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
        "sub_category_id",
        "budget_min",
        "budget_max",
        "status",
        "completion_status",
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
        "completion_status",
        "completion_requested_at",
        "payment_released_at",
        "assigned_freelancer_id",
        "is_deleted",
        "created_at",
        "updated_at",
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
        "completion_status",
        "assigned_freelancer_id",
        "is_deleted",
      ],

      filterProperties: [
        "title",
        "user_id",
        "category_id",
        "sub_category_id",
        "status",
        "completion_status",
        "assigned_freelancer_id",
        "is_deleted",
        "created_at",
      ],

      sort: { sortBy: "created_at", direction: "desc" },

      properties: {
        user_id: {
          reference: "clients", // points to your Clients resource
          type: "reference",
          description: "Client who created the project",
          isRequired: true,
        },
        assigned_freelancer_id: {
          reference: "freelancers", // points to your Freelancers resource
          type: "reference",
          description: "Freelancer assigned to this project",
        },
        category_id: {
          reference: "categories",
          type: "reference",
          description: "Main project category",
          isRequired: true,
        },
        sub_category_id: {
          reference: "sub_categories",
          type: "reference",
          description: "Optional sub-category",
        },
        title: { type: "string", isRequired: true },
        description: { type: "textarea", props: { rows: 4 }, isRequired: true },
        budget_min: { type: "currency", props: { currency: "USD" } },
        budget_max: { type: "currency", props: { currency: "USD" } },
        duration: { type: "string" },
        location: { type: "string" },
        status: {
          type: "string",
          availableValues: [
            { value: "draft", label: "Draft" },
            { value: "active", label: "Active" },
            { value: "in_progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ],
        },
        completion_status: {
          type: "string",
          availableValues: [
            { value: "not_started", label: "Not Started" },
            { value: "requested", label: "Completion Requested" },
            { value: "approved", label: "Completion Approved" },
            { value: "rejected", label: "Completion Rejected" },
          ],
        },
        completion_requested_at: { type: "datetime" },
        payment_released_at: { type: "datetime" },
        is_deleted: { type: "boolean" },
        created_at: { type: "datetime" },
        updated_at: { type: "datetime" },
      },

      actions: {
        new: {
          before: async (request) => {
            if (request.payload && request.payload.is_deleted === undefined) {
              request.payload.is_deleted = false;
            }
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
                `Created new project: "${request.payload.title}" (Budget: $${request.payload.budget_min}-${request.payload.budget_max})`
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
                `Edited project ID: ${request.params.recordId}`
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
                `Deleted project ID: ${request.params.recordId}`
              );
            }
            return response;
          },
        },

        // Format timestamps for list view
        list: {
          after: async (response) => {
            if (response.records) {
              response.records = response.records.map((record) => {
                [
                  "created_at",
                  "updated_at",
                  "completion_requested_at",
                  "payment_released_at",
                ].forEach((field) => {
                  if (record.params[field]) {
                    record.params[field] = dayjs(record.params[field])
                      .tz("Asia/Amman")
                      .format("YYYY-MM-DD HH:mm:ss");
                  }
                });
                return record;
              });
            }
            return response;
          },
        },

        // Format timestamps for show view
        show: {
          after: async (response) => {
            if (response.record) {
              [
                "created_at",
                "updated_at",
                "completion_requested_at",
                "payment_released_at",
              ].forEach((field) => {
                if (response.record.params[field]) {
                  response.record.params[field] = dayjs(
                    response.record.params[field]
                  )
                    .tz("Asia/Amman")
                    .format("YYYY-MM-DD HH:mm:ss");
                }
              });
            }
            return response;
          },
        },
      },
    },
  };
};
