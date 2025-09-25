// Admin/resources/offers.js
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const createOffersResource = async (db, logAdminAction) => {
  return {
    resource: db.table("offers"),
    options: {
      id: "offers",
      navigation: { name: "Project Management", icon: "FileText" },

      listProperties: [
        "id",
        "freelancer_id",
        "project_id", // will show raw ID now
        "bid_amount",
        "delivery_time",
        "offer_status",
        "submitted_at",
      ],

      showProperties: [
        "id",
        "freelancer_id",
        "project_id", // raw ID
        "bid_amount",
        "delivery_time",
        "proposal",
        "offer_status",
        "submitted_at",
        "created_at",
        "updated_at",
      ],

      editProperties: [
        "freelancer_id",
        "project_id", // raw ID
        "bid_amount",
        "delivery_time",
        "proposal",
        "offer_status",
      ],

      filterProperties: [
        "freelancer_id",
        "project_id",
        "bid_amount",
        "delivery_time",
        "offer_status",
        "submitted_at",
      ],

      sort: { sortBy: "submitted_at", direction: "desc" },

      properties: {
        freelancer_id: {
          reference: "freelancers",
          type: "reference",
          description: "Freelancer making the offer",
          isRequired: true,
        },
        project_id: {
          type: "number", // show raw project ID
          description: "Project ID (shows raw ID, not title)",
          isRequired: true,
        },
        bid_amount: {
          type: "currency",
          props: { currency: "USD" },
          isRequired: true,
        },
        delivery_time: {
          type: "number",
          description: "Delivery time in days",
          isRequired: true,
        },
        proposal: { type: "textarea", props: { rows: 4 } },
        offer_status: {
          type: "string",
          availableValues: [
            { value: "pending", label: "Pending" },
            { value: "accepted", label: "Accepted" },
            { value: "rejected", label: "Rejected" },
          ],
          default: "pending",
        },
        submitted_at: { type: "datetime", isDisabled: true },
        created_at: { type: "datetime", isDisabled: true },
        updated_at: { type: "datetime", isDisabled: true },
      },

      actions: {
        new: {
          before: async (request) => {
            if (request.payload && !request.payload.offer_status) {
              request.payload.offer_status = "pending";
            }
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Created new offer by freelancer ID: ${request.payload.freelancer_id} for project ID: ${request.payload.project_id}`
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
                `Edited offer ID: ${request.params.recordId}`
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
                `Deleted offer ID: ${request.params.recordId}`
              );
            }
            return response;
          },
        },

        list: {
          after: async (response) => {
            if (response.records) {
              response.records = response.records.map((record) => {
                ["submitted_at", "created_at", "updated_at"].forEach(
                  (field) => {
                    if (record.params[field]) {
                      record.params[field] = dayjs(record.params[field])
                        .tz("Asia/Amman")
                        .format("YYYY-MM-DD HH:mm:ss");
                    }
                  }
                );
                return record;
              });
            }
            return response;
          },
        },

        show: {
          after: async (response) => {
            if (response.record) {
              ["submitted_at", "created_at", "updated_at"].forEach((field) => {
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
