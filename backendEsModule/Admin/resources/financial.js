export const createFinancialResources = async (
  db,
  tableExists,
  logAdminAction
) => {
  const { paymentsTableExists, receiptsTableExists } = tableExists;
  const resources = [];

  // ---------------------------
  // Payments Resource
  // ---------------------------
  if (paymentsTableExists) {
    resources.push({
      resource: db.table("payments"),
      options: {
        id: "payments",
        navigation: { name: "Financial Management", icon: "DollarSign" },

        listProperties: [
          "id",
          "payer_id",
          "receiver_id",
          "amount",
          "payment_date",
          "project_id",
          "order_id",
        ],
        showProperties: [
          "id",
          "payer_id",
          "receiver_id",
          "amount",
          "payment_date",
          "project_id",
          "order_id",
          "temp_project_id",
        ],
        editProperties: [
          "payer_id",
          "receiver_id",
          "amount",
          "payment_date",
          "project_id",
          "order_id",
          "temp_project_id",
        ],
        filterProperties: [
          "payer_id",
          "receiver_id",
          "project_id",
          "order_id",
          "payment_date",
        ],

        sort: { sortBy: "payment_date", direction: "desc" },

        properties: {
          payer_id: {
            reference: "clients", // 👈 clients = payers
            type: "reference",
            isRequired: true,
            description: "Client who made the payment",
          },
          receiver_id: {
            reference: "freelancers", // 👈 freelancers = receivers
            type: "reference",
            isRequired: true,
            description: "Freelancer who received the payment",
          },
          amount: {
            type: "currency",
            props: { currency: "USD" },
            isRequired: true,
          },
          payment_date: { type: "datetime", isRequired: true },
          project_id: {
            reference: "projects",
            type: "reference",
            description: "Related project",
          },
          order_id: { type: "number", description: "Related order ID" },
          temp_project_id: {
            type: "number",
            description: "Temporary project ID",
          },
        },

        actions: {
          new: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Created new payment: $${request.payload.amount} from Client ${request.payload.payer_id} to Freelancer ${request.payload.receiver_id}`
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
                  `Updated payment ID: ${request.params.recordId} - Amount: $${
                    request.payload.amount || "N/A"
                  }`
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
                  `DELETED payment ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
        },
      },
    });
  }

  // ---------------------------
  // Receipts Resource
  // ---------------------------
  if (receiptsTableExists) {
    resources.push({
      resource: db.table("receipts"),
      options: {
        id: "receipts",
        navigation: { name: "Financial Management", icon: "FileText" },

        listProperties: ["id", "payment_id", "receipt_url"],
        showProperties: ["id", "payment_id", "receipt_url"],
        editProperties: ["payment_id", "receipt_url"],
        filterProperties: ["payment_id"],

        sort: { sortBy: "id", direction: "desc" },

        properties: {
          payment_id: {
            reference: "payments", // 👈 ties directly to payments
            type: "reference",
            isRequired: true,
            description: "Related payment",
          },
          receipt_url: {
            type: "url",
            isRequired: true,
            description: "URL to receipt document",
          },
        },

        actions: {
          new: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Created new receipt for payment ID: ${request.payload.payment_id}`
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
                  `Updated receipt ID: ${request.params.recordId}`
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
                  `DELETED receipt ID: ${request.params.recordId}`
                );
              }
              return response;
            },
          },
        },
      },
    });
  }

  return resources;
};
