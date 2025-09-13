import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const createPaymentsResource = async (db) => {
  return {
    resource: db.table("payments"), // main table is payments
    options: {
      id: "payments",
      navigation: { name: "Financial Management", icon: "CreditCard" },

      listProperties: [
        "id",
        "payer_id",
        "receiver_id",
        "project_id",
        "amount",
        "payment_date",
        "status",
        "escrow_id",
        "receipt_id",
        "created_at",
        "released_at",
        "receipt_url",
      ],

      showProperties: [
        "id",
        "payer_id",
        "receiver_id",
        "project_id",
        "amount",
        "order_id",
        "payment_date",
        "status",
        "escrow_id",
        "released_at",
        "receipt_id",
        "receipt_url",
        "created_at",
        "updated_at",
      ],

      properties: {
        payer_id: {
          reference: "clients",
          type: "reference",
          description: "User paying the amount",
        },
        receiver_id: {
          reference: "freelancers",
          type: "reference",
          description: "User receiving the payment",
        },
        project_id: {
          reference: "projects",
          type: "reference",
          description: "Project linked to payment",
        },
        amount: { type: "currency", props: { currency: "USD" } },
        order_id: { type: "number" },
        payment_date: { type: "datetime" },
        status: { type: "string" },
        released_at: { type: "datetime" },
        receipt_url: { type: "string" },
        escrow_id: {
          type: "number",
          isVisible: { list: false, filter: false },
        },
        receipt_id: {
          type: "number",
          isVisible: { list: false, filter: false },
        },
        created_at: { type: "datetime" },
        updated_at: { type: "datetime" },
      },

      actions: {
        // Disable create, edit, delete
        new: { isAccessible: false },
        edit: { isAccessible: false },
        delete: { isAccessible: false },

        // Format timestamps for list
        list: {
          after: async (response) => {
            if (response.records) {
              response.records = response.records.map((record) => {
                [
                  "payment_date",
                  "released_at",
                  "created_at",
                  "updated_at",
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

        // Format timestamps for show
        show: {
          after: async (response) => {
            if (response.record) {
              [
                "payment_date",
                "released_at",
                "created_at",
                "updated_at",
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
