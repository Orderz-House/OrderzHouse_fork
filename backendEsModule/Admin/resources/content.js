export const createContentResources = async (
  db,
  tableExists,
  logAdminAction
) => {
  const { subCategoriesTableExists } = tableExists;
  const resources = [];

  resources.push({
    resource: db.table("categories"),
    options: {
      id: "categories",
      navigation: { name: "Content Management", icon: "Tag" },
      listProperties: ["id", "name", "description"],
      showProperties: ["id", "name", "description"],
      editProperties: ["name", "description"],
      filterProperties: ["name"],
      properties: {
        name: { isRequired: true },
        description: { type: "textarea", props: { rows: 3 } },
      },
      actions: {
        new: {
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Created new category: "${request.payload.name}"`
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
                `Updated category ID: ${request.params.recordId}`
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
                `DELETED category ID: ${request.params.recordId}`
              );
            }
            return response;
          },
        },
      },
    },
  });

  if (subCategoriesTableExists) {
    resources.push({
      resource: db.table("sub_categories"),
      options: {
        id: "sub_categories",
        navigation: { name: "Sub-Categories", icon: "Tags" },
        listProperties: ["id", "name", "category_id", "description"],
        showProperties: ["id", "name", "category_id", "description"],
        editProperties: ["name", "category_id", "description"],
        filterProperties: ["name", "category_id"],
        properties: {
          name: { isRequired: true },
          category_id: {
            reference: "categories",
            type: "reference",
            isRequired: true,
          },
          description: { type: "textarea", props: { rows: 3 } },
        },
        actions: {
          new: {
            after: async (response, request, context) => {
              if (context.currentAdmin && request.payload) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  `Created new sub-category: "${request.payload.name}"`
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
                  `Updated sub-category ID: ${request.params.recordId}`
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
                  `DELETED sub-category ID: ${request.params.recordId}`
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
