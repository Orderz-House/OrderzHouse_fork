import bcrypt from "bcrypt";

export const createAdminsResource = async (db, pool) => {
  const logAdminAction = async (adminId, email, action, details = null) => {
    if (!pool) return console.error("Pool is undefined in logAdminAction");
    try {
      await pool.query(
        "INSERT INTO logs(user_id, email, action, details, created_at) VALUES($1, $2, $3, $4, NOW())",
        [adminId, email, action, details ? JSON.stringify(details) : null]
      );
    } catch (err) {
      console.error("Error logging admin action:", err);
    }
  };

  const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const checkDuplicates = async (email, username, excludeId = null) => {
    try {
      const query = excludeId
        ? "SELECT id FROM users WHERE (email = $1 OR username = $2) AND id != $3 AND role_id = 1"
        : "SELECT id FROM users WHERE (email = $1 OR username = $2) AND role_id = 1";
      const params = excludeId
        ? [email, username, excludeId]
        : [email, username];
      const result = await pool.query(query, params);
      return result.rows.length > 0;
    } catch (err) {
      console.error("Error checking duplicates:", err);
      return false;
    }
  };

  return {
    resource: db.table("users"),
    options: {
      id: "admins",
      navigation: {
        name: "Admin Management",
        icon: "Shield",
        show: true,
      },
      listProperties: [
        "id",
        "first_name",
        "last_name",
        "email",
        "username",
        "phone_number",
        "country",
        "is_verified",
        "is_online",
        "violation_count",
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
        "is_verified",
        "profile_pic_url",
        "is_deleted",
        "is_online",
        "socket_id",
        "violation_count",
        "rating",
        "wallet",
        "last_login",
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
        "is_verified",
      ],
      filterProperties: [
        "first_name",
        "last_name",
        "email",
        "username",
        "country",
        "is_verified",
        "is_deleted",
        "is_online",
        "violation_count",
        "created_at",
      ],
      sort: {
        sortBy: "created_at",
        direction: "desc",
      },
      properties: {
        id: {
          isVisible: { list: true, show: true, edit: false, filter: false },
        },
        first_name: {
          isRequired: true,
          type: "string",
          validate: (value) => {
            if (!value || value.length < 2)
              return "First name must be at least 2 characters long";
            if (!/^[a-zA-Z\s]+$/.test(value))
              return "First name can only contain letters and spaces";
            return true;
          },
        },
        last_name: {
          isRequired: true,
          type: "string",
          validate: (value) => {
            if (!value || value.length < 2)
              return "Last name must be at least 2 characters long";
            if (!/^[a-zA-Z\s]+$/.test(value))
              return "Last name can only contain letters and spaces";
            return true;
          },
        },
        email: {
          isRequired: true,
          type: "email",
          validate: (value) => {
            if (!validateEmail(value))
              return "Please enter a valid email address";
            return true;
          },
        },
        username: {
          isRequired: true,
          type: "string",
          validate: (value) => {
            if (!value || value.length < 3)
              return "Username must be at least 3 characters long";
            if (!/^[a-zA-Z0-9_]+$/.test(value))
              return "Username can only contain letters, numbers, and underscores";
            return true;
          },
        },
        password: {
          type: "password",
          isVisible: { list: false, show: false, edit: true, filter: false },
          validate: (value, record) => {
            if (!record && (!value || value.length < 8))
              return "Password must be at least 8 characters long for new admins";
            if (value && value.length > 0 && value.length < 8)
              return "Password must be at least 8 characters long";
            return true;
          },
        },
        phone_number: {
          isRequired: true,
          type: "string",
          validate: (value) => {
            if (!validatePhone(value))
              return "Please enter a valid phone number";
            return true;
          },
        },
        country: {
          isRequired: true,
          type: "string",
        },
        role_id: {
          isVisible: false,
        },
        profile_pic_url: {
          type: "url",
          validate: (value) => {
            if (value && !/^https?:\/\/.+/.test(value))
              return "Profile picture URL must be a valid HTTP/HTTPS URL";
            return true;
          },
        },
        is_verified: {
          type: "boolean",
          availableValues: [
            { value: true, label: "Verified" },
            { value: false, label: "Not Verified" },
          ],
        },
        is_deleted: {
          type: "boolean",
          isVisible: { list: false, show: true, edit: false, filter: true },
          availableValues: [
            { value: false, label: "Active" },
            { value: true, label: "Deleted" },
          ],
        },
        is_online: {
          type: "boolean",
          isVisible: { list: true, show: true, edit: false, filter: true },
        },
        socket_id: {
          type: "string",
          isVisible: { list: false, show: true, edit: false, filter: false },
        },
        violation_count: {
          type: "number",
          isVisible: { list: true, show: true, edit: false, filter: true },
        },
        rating: {
          type: "number",
          isVisible: { list: false, show: true, edit: false, filter: false },
        },
        wallet: {
          type: "number",
          isVisible: { list: false, show: true, edit: false, filter: false },
        },
        last_login: {
          type: "datetime",
          isVisible: { list: false, show: true, edit: false, filter: false },
        },
        created_at: {
          type: "datetime",
          isVisible: { list: true, show: true, edit: false, filter: true },
        },
        updated_at: {
          type: "datetime",
          isVisible: { list: false, show: true, edit: false, filter: false },
        },
      },
      actions: {
        list: {
          before: async (request) => {
            request.query = { ...request.query, "filters.role_id": "1" };
            if (!request.query["filters.is_deleted"])
              request.query["filters.is_deleted"] = "false";
            return request;
          },
          after: async (response) => {
            if (response.records) {
              response.records = response.records.map((record) => {
                record.params.role_name = "Admin";
                record.params.full_name = `${record.params.first_name} ${record.params.last_name}`;
                record.params.status = record.params.is_deleted
                  ? "Deleted"
                  : "Active";
                return record;
              });
            }
            return response;
          },
        },
        show: {
          after: async (response) => {
            if (response.record) {
              response.record.params.role_name = "Admin";
              response.record.params.full_name = `${response.record.params.first_name} ${response.record.params.last_name}`;
              response.record.params.status = response.record.params.is_deleted
                ? "Deleted"
                : "Active";
            }
            return response;
          },
        },
        new: {
          before: async (request, context) => {
            if (!request.payload) return request;
            try {
              const {
                first_name,
                last_name,
                email,
                username,
                password,
                phone_number,
                country,
              } = request.payload;

              if (
                !first_name ||
                !last_name ||
                !email ||
                !username ||
                !password ||
                !phone_number ||
                !country
              ) {
                throw new Error("All required fields must be filled");
              }

              const hasDuplicates = await checkDuplicates(email, username);
              if (hasDuplicates)
                throw new Error(
                  "Admin with this email or username already exists"
                );

              const hashedPassword = await hashPassword(password);

              request.payload = {
                ...request.payload,
                password: hashedPassword,
                role_id: 1,
                is_deleted: false,
                violation_count: 0,
                rating: null,
                wallet: 0,
                is_online: false,
                is_verified: request.payload.is_verified ?? false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
            } catch (error) {
              request.errors = { base: error.message };
            }
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload && !request.errors) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                "Created new Admin",
                {
                  admin_email: request.payload.email,
                  admin_username: request.payload.username,
                }
              );
            }
            return response;
          },
        },
        edit: {
          before: async (request, context) => {
            if (!request.payload || !context.record) return request;
            try {
              const recordId = context.record.id();
              const { email, username, password } = request.payload;

              if (email && username) {
                const hasDuplicates = await checkDuplicates(
                  email,
                  username,
                  recordId
                );
                if (hasDuplicates)
                  throw new Error(
                    "Another admin with this email or username already exists"
                  );
              }

              if (password && password.trim() !== "") {
                request.payload.password = await hashPassword(password);
              } else {
                delete request.payload.password;
              }

              request.payload.role_id = 1;
              request.payload.updated_at = new Date().toISOString();
            } catch (error) {
              request.errors = { base: error.message };
            }
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin && context.record && !request.errors) {
              const changedFields = Object.keys(request.payload).filter(
                (key) => key !== "updated_at"
              );
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                "Updated Admin",
                {
                  admin_id: context.record.id(),
                  changed_fields: changedFields,
                }
              );
            }
            return response;
          },
        },
        delete: {
          isVisible: ({ record }) => record?.params?.is_deleted === false,
          before: async (request, context) => {
            if (!context.record) return request;

            if (
              context.currentAdmin &&
              context.currentAdmin.id === context.record.id()
            ) {
              request.errors = {
                base: "You cannot delete your own admin account",
              };
              return request;
            }

            request.payload = {
              is_deleted: true,
              updated_at: new Date().toISOString(),
            };
            request.method = "POST";
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin && context.record && !request.errors) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                "Soft deleted Admin",
                {
                  admin_id: context.record.id(),
                  admin_email: context.record.params.email,
                }
              );
            }
            return response;
          },
        },
        restore: {
          actionType: "record",
          icon: "RefreshCw",
          isVisible: ({ record }) => record?.params?.is_deleted === true,
          handler: async (request, response, context) => {
            try {
              const { record, resource } = context;
              if (!record)
                return {
                  record: null,
                  notice: { message: "Record not found", type: "error" },
                };

              const updatedRecord = await resource.update(record.id(), {
                is_deleted: false,
                updated_at: new Date().toISOString(),
              });

              if (context.currentAdmin) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  "Restored Admin",
                  {
                    admin_id: record.id(),
                    admin_email: record.params.email,
                  }
                );
              }

              return {
                record: updatedRecord.toJSON(context.currentAdmin),
                notice: {
                  message: "Admin restored successfully!",
                  type: "success",
                },
              };
            } catch (error) {
              return {
                record: null,
                notice: {
                  message: `Error restoring admin: ${error.message}`,
                  type: "error",
                },
              };
            }
          },
        },
        permanentDelete: {
          actionType: "record",
          icon: "Trash2",
          variant: "danger",
          isVisible: ({ record, currentAdmin }) => {
            return (
              record?.params?.is_deleted === true &&
              currentAdmin?.id !== record?.id()
            );
          },
          handler: async (request, response, context) => {
            try {
              const { record, resource } = context;
              if (!record)
                return {
                  record: null,
                  notice: { message: "Record not found", type: "error" },
                };

              await resource.delete(record.id());

              if (context.currentAdmin) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  "Permanently deleted Admin",
                  {
                    admin_id: record.id(),
                    admin_email: record.params.email,
                  }
                );
              }

              return {
                record: null,
                notice: {
                  message: "Admin permanently deleted!",
                  type: "success",
                },
              };
            } catch (error) {
              return {
                record: null,
                notice: {
                  message: `Error deleting admin: ${error.message}`,
                  type: "error",
                },
              };
            }
          },
        },
        bulkDelete: {
          actionType: "bulk",
          icon: "Trash",
          handler: async (request, response, context) => {
            try {
              const { records, resource, currentAdmin } = context;
              let deletedCount = 0;
              let skippedCount = 0;

              for (const record of records) {
                if (currentAdmin && currentAdmin.id === record.id()) {
                  skippedCount++;
                  continue;
                }

                await resource.update(record.id(), {
                  is_deleted: true,
                  updated_at: new Date().toISOString(),
                });
                deletedCount++;
              }

              if (context.currentAdmin && deletedCount > 0) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  "Bulk soft deleted Admins",
                  {
                    deleted_count: deletedCount,
                    skipped_count: skippedCount,
                  }
                );
              }

              let message = `Deleted ${deletedCount} admins!`;
              if (skippedCount > 0)
                message += ` (Skipped ${skippedCount} - cannot delete own account)`;

              return {
                notice: {
                  message,
                  type: deletedCount > 0 ? "success" : "warning",
                },
              };
            } catch (error) {
              return {
                notice: {
                  message: `Error in bulk delete: ${error.message}`,
                  type: "error",
                },
              };
            }
          },
        },
        bulkRestore: {
          actionType: "bulk",
          icon: "RefreshCw",
          isVisible: (context) =>
            context.query?.["filters.is_deleted"] === "true",
          handler: async (request, response, context) => {
            try {
              const { records, resource } = context;
              let restoredCount = 0;

              for (const record of records) {
                if (record.params.is_deleted) {
                  await resource.update(record.id(), {
                    is_deleted: false,
                    updated_at: new Date().toISOString(),
                  });
                  restoredCount++;
                }
              }

              if (context.currentAdmin && restoredCount > 0) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  "Bulk restored Admins",
                  { restored_count: restoredCount }
                );
              }

              return {
                notice: {
                  message: `Restored ${restoredCount} admins!`,
                  type: "success",
                },
              };
            } catch (error) {
              return {
                notice: {
                  message: `Error in bulk restore: ${error.message}`,
                  type: "error",
                },
              };
            }
          },
        },
        exportAdmins: {
          actionType: "resource",
          icon: "Download",
          handler: async (request, response, context) => {
            try {
              const { resource } = context;
              const admins = await resource.find(
                { "filters.role_id": "1" },
                {
                  limit: 1000,
                  sort: { sortBy: "created_at", direction: "desc" },
                }
              );

              const csvData = admins.map((admin) => ({
                ID: admin.id(),
                "First Name": admin.params.first_name,
                "Last Name": admin.params.last_name,
                Email: admin.params.email,
                Username: admin.params.username,
                Phone: admin.params.phone_number,
                Country: admin.params.country,
                Verified: admin.params.is_verified ? "Yes" : "No",
                Online: admin.params.is_online ? "Yes" : "No",
                Status: admin.params.is_deleted ? "Deleted" : "Active",
                "Violation Count": admin.params.violation_count || 0,
                "Created At": admin.params.created_at,
              }));

              if (context.currentAdmin) {
                await logAdminAction(
                  context.currentAdmin.id,
                  context.currentAdmin.email,
                  "Exported Admins Data",
                  { exported_count: csvData.length }
                );
              }

              return {
                notice: {
                  message: `Exported ${csvData.length} admin records`,
                  type: "success",
                },
              };
            } catch (error) {
              return {
                notice: {
                  message: `Export failed: ${error.message}`,
                  type: "error",
                },
              };
            }
          },
        },
      },
    },
  };
};
