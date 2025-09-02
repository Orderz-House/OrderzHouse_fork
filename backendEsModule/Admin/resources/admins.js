// Admin/resources/admins.js
export const createAdminsResource = async (db, logAdminAction) => {
  return {
    resource: db.table("users"),
    options: {
      id: "admins",
      navigation: { name: "Admin Management", icon: "Shield" },
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
        "is_deleted",
        "is_verified",
        "is_online",
        "socket_id",
        "violation_count",
        "rating",
        "wallet",
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
        "is_deleted",
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
      ],
      sort: { sortBy: "created_at", direction: "desc" },
      properties: {
        // User identification
        first_name: { 
          isRequired: true,
          description: "User's first name"
        },
        last_name: { 
          isRequired: true,
          description: "User's last name"
        },
        email: { 
          isRequired: true,
          type: "email",
          description: "User's email address"
        },
        username: { 
          isRequired: true,
          description: "Unique username"
        },
        password: {
          type: "password",
          isVisible: { list: false, show: false, edit: true, filter: false },
          description: "User password (encrypted)"
        },
        phone_number: { 
          isRequired: true,
          description: "User's phone number"
        },
        country: { 
          isRequired: true,
          description: "User's country"
        },
        
        // Role management - Hidden for admins resource
        role_id: {
          isVisible: { list: false, filter: false, show: false, edit: false },
        },
        
        // Profile and media
        profile_pic_url: {
          type: "url",
          description: "Profile picture URL",
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        
        // Status fields
        is_verified: {
          type: "boolean",
          description: "Email/account verification status"
        },
        is_deleted: {
          type: "boolean",
          isVisible: { list: false, show: true, edit: true, filter: true },
          description: "Soft delete status"
        },
        is_online: {
          type: "boolean",
          isVisible: { list: true, show: true, edit: false, filter: true },
          description: "Current online status"
        },
        
        // System fields
        socket_id: {
          type: "string",
          isVisible: { list: false, show: true, edit: false, filter: false },
          description: "Current socket connection ID"
        },
        violation_count: {
          type: "number",
          isVisible: { list: false, show: true, edit: false, filter: false },
          description: "Number of policy violations"
        },
        rating: {
          type: "number",
          isVisible: { list: false, show: true, edit: false, filter: false },
          description: "User rating (for freelancers)"
        },
        wallet: {
          type: "number",
          isVisible: { list: false, show: true, edit: false, filter: false },
          description: "User wallet balance"
        },
        created_at: {
          type: "datetime",
          isVisible: { list: true, show: true, edit: false, filter: false },
          description: "Account creation date"
        },
        updated_at: {
          type: "datetime",
          isVisible: { list: false, show: true, edit: false, filter: false },
          description: "Last update date"
        }
      },
      
      // Custom styling and UI enhancements
      styles: {
        '.admin-table': {
          'border-radius': '8px',
          'box-shadow': '0 2px 8px rgba(0,0,0,0.1)'
        },
        '.role-admin': {
          'background': '#e3f2fd',
          'color': '#1565c0',
          'font-weight': 'bold'
        },
        '.role-client': {
          'background': '#e8f5e8',
          'color': '#2e7d32'
        },
        '.role-freelancer': {
          'background': '#fff3e0',
          'color': '#ef6c00'
        },
        '.status-online': {
          'color': '#4caf50',
          'font-weight': 'bold'
        },
        '.status-offline': {
          'color': '#9e9e9e'
        },
        '.verified-user': {
          'color': '#4caf50'
        },
        '.unverified-user': {
          'color': '#ff9800'
        }
      },

      // CRUD Actions with enhanced functionality
      actions: {
        // LIST ACTION - Show only admins
        list: {
          before: async (request) => {
            // Filter to show only admins (role_id = 1)
            request.query = {
              ...request.query,
              "filters.role_id": "1",
            };
            
            // Add soft delete filter (don't show deleted users by default)
            if (!request.query['filters.is_deleted']) {
              request.query = {
                ...request.query,
                'filters.is_deleted': 'false',
              };
            }
            
            return request;
          },
          after: async (response) => {
            // Add admin-specific enhancements
            if (response.records) {
              response.records = response.records.map(record => {
                record.params.role_name = 'Admin';
                record.params.full_name = `${record.params.first_name} ${record.params.last_name}`;
                return record;
              });
            }
            return response;
          }
        },

        // NEW ACTION - Create new admin
        new: {
          before: async (request) => {
            if (request.payload) {
              // Set admin-specific defaults
              request.payload.role_id = 1; // Admin role only
              request.payload.is_deleted = false;
              request.payload.violation_count = 0;
              request.payload.rating = null; // Admins don't have ratings
              request.payload.wallet = 0.0;
              request.payload.is_online = false;
              request.payload.created_at = new Date().toISOString();
              request.payload.updated_at = new Date().toISOString();
              
              // Hash password if provided
              if (request.payload.password) {
                // Note: You should implement proper password hashing here
                // const bcrypt = require('bcrypt');
                // request.payload.password = await bcrypt.hash(request.payload.password, 10);
              }
            }
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Created new Admin: ${request.payload.email} (${request.payload.first_name} ${request.payload.last_name})`
              );
            }
            return response;
          },
        },

        // EDIT ACTION - Update admin
        edit: {
          before: async (request) => {
            if (request.payload) {
              request.payload.updated_at = new Date().toISOString();
              
              // Ensure role remains admin
              request.payload.role_id = 1;
              
              // Handle password updates
              if (request.payload.password && request.payload.password.trim() === '') {
                delete request.payload.password; // Don't update if empty
              }
            }
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Updated Admin ID: ${request.params.recordId} - Email: ${
                  request.payload.email || "N/A"
                }`
              );
            }
            return response;
          },
        },

        // DELETE ACTION - Soft delete with confirmation
        delete: {
          before: async (request) => {
            // Implement soft delete instead of hard delete
            request.payload = {
              is_deleted: true,
              updated_at: new Date().toISOString()
            };
            // Convert delete to update
            request.method = 'POST';
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `SOFT DELETED Admin with ID: ${request.params.recordId}`
              );
            }
            return response;
          },
        },

        // CUSTOM ACTIONS
        // Restore deleted user
        restore: {
          actionType: 'record',
          icon: 'Refresh',
          variant: 'success',
          component: false,
          handler: async (request, response, context) => {
            const { record, resource } = context;
            
            // Update the record to restore it
            await resource.update(record.id(), {
              is_deleted: false,
              updated_at: new Date().toISOString()
            });
            
            // Log the action
            if (context.currentAdmin) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `RESTORED user with ID: ${record.id()}`
              );
            }
            
            return {
              notice: {
                message: 'Admin successfully restored!',
                type: 'success'
              }
            };
          }
        },

        // Toggle verification status
        toggleVerification: {
          actionType: 'record',
          icon: 'Check',
          variant: 'primary',
          component: false,
          handler: async (request, response, context) => {
            const { record, resource } = context;
            const currentStatus = record.params.is_verified;
            
            await resource.update(record.id(), {
              is_verified: !currentStatus,
              updated_at: new Date().toISOString()
            });
            
            if (context.currentAdmin) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `${!currentStatus ? 'VERIFIED' : 'UNVERIFIED'} Admin ID: ${record.id()}`
              );
            }
            
            return {
              notice: {
                message: `Admin ${!currentStatus ? 'verified' : 'unverified'} successfully!`,
                type: 'success'
              }
            };
          }
        },

        // Bulk actions
        bulkDelete: {
          actionType: 'bulk',
          icon: 'Trash',
          variant: 'danger',
          component: false,
          handler: async (request, response, context) => {
            const { records, resource } = context;
            
            for (const record of records) {
              await resource.update(record.id(), {
                is_deleted: true,
                updated_at: new Date().toISOString()
              });
            }
            
            if (context.currentAdmin) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `BULK DELETED ${records.length} admins`
              );
            }
            
            return {
              notice: {
                message: `Successfully deleted ${records.length} admins!`,
                type: 'success'
              }
            };
          }
        }
      }
    },
  };
};