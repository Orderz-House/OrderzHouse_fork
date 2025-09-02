// Admin/resources/clients.js
export const createClientsResource = async (db, logAdminAction) => {
  return {
    resource: db.table("users"),
    options: {
      id: "clients",
      navigation: { name: "Client Management", icon: "UserCheck" },
      listProperties: [
        "id",
        "first_name",
        "last_name",
        "email",
        "username",
        "phone_number",
        "country",
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
        "wallet",
        "violation_count",
        "is_deleted",
        "is_verified",
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
        "is_verified",
        "is_deleted",
        "is_online",
      ],
      sort: { sortBy: "created_at", direction: "desc" },
      properties: {
        // Role management - Hidden for clients resource
        role_id: {
          isVisible: { list: false, filter: false, show: false, edit: false },
        },
        
        // User identification
        first_name: { 
          isRequired: true,
          description: "Client's first name"
        },
        last_name: { 
          isRequired: true,
          description: "Client's last name"
        },
        email: { 
          isRequired: true,
          type: "email",
          description: "Client's email address"
        },
        username: { 
          isRequired: true,
          description: "Client username"
        },
        password: {
          type: "password",
          isVisible: { list: false, show: false, edit: true, filter: false },
          description: "Client password (leave empty to keep current)"
        },
        phone_number: { 
          isRequired: true,
          description: "Client's phone number"
        },
        country: { 
          isRequired: true,
          description: "Client's country"
        },
        
        // Profile and media
        profile_pic_url: {
          type: "url",
          description: "Profile picture URL",
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        
        // Client-specific fields
        wallet: {
          type: "number",
          description: "Client wallet balance",
          props: {
            min: 0,
            step: 0.01
          }
        },
        violation_count: {
          type: "number",
          isVisible: { list: false, show: true, edit: false, filter: false },
          description: "Number of policy violations"
        },
        
        // Rating field - hidden for clients
        rating: {
          isVisible: { list: false, filter: false, show: false, edit: false },
        },
        
        // Status fields
        is_verified: {
          type: "boolean",
          description: "Account verification status"
        },
        is_deleted: {
          type: "boolean",
          isVisible: { list: false, show: true, edit: true, filter: true },
          description: "Account status"
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
          description: "Socket connection ID"
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
      
      // Enhanced styling for client interface
      styles: {
        '.client-header': {
          'background': 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
          'color': 'white',
          'padding': '1rem',
          'border-radius': '8px 8px 0 0'
        },
        '.client-row': {
          'background': '#e8f5e8',
          'border-left': '4px solid #4caf50'
        },
        '.client-badge': {
          'background': '#4caf50',
          'color': 'white',
          'padding': '0.25rem 0.5rem',
          'border-radius': '4px',
          'font-size': '0.75rem'
        },
        '.wallet-high': {
          'color': '#4caf50',
          'font-weight': 'bold'
        },
        '.wallet-medium': {
          'color': '#ff9800',
          'font-weight': 'bold'
        },
        '.wallet-low': {
          'color': '#f44336',
          'font-weight': 'bold'
        }
      },

      actions: {
        // Filter to show only clients (role_id = 2)
        list: {
          before: async (request) => {
            request.query = {
              ...request.query,
              "filters.role_id": "2",
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
            // Add client-specific enhancements
            if (response.records) {
              response.records = response.records.map(record => {
                record.params.role_name = 'Client';
                record.params.full_name = `${record.params.first_name} ${record.params.last_name}`;
                
                // Add wallet class for styling
                const wallet = parseFloat(record.params.wallet) || 0;
                if (wallet >= 100) record.params.wallet_class = 'wallet-high';
                else if (wallet >= 25) record.params.wallet_class = 'wallet-medium';
                else record.params.wallet_class = 'wallet-low';
                
                return record;
              });
            }
            return response;
          }
        },

        // Create new client
        new: {
          before: async (request) => {
            if (request.payload) {
              // Set client-specific defaults
              request.payload.role_id = 2; // Client role only
              request.payload.is_deleted = false;
              request.payload.violation_count = 0;
              request.payload.rating = null; // Clients don't have ratings
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
                `Created new Client: ${request.payload.email} (${request.payload.first_name} ${request.payload.last_name})`
              );
            }
            return response;
          },
        },

        // Edit client
        edit: {
          before: async (request) => {
            if (request.payload) {
              request.payload.updated_at = new Date().toISOString();
              
              // Ensure role remains client
              request.payload.role_id = 2;
              
              // Handle password updates
              if (request.payload.password && request.payload.password.trim() === '') {
                delete request.payload.password; // Don't update if empty
              }
              
              // Validate wallet amount
              if (request.payload.wallet !== undefined) {
                const wallet = parseFloat(request.payload.wallet);
                if (wallet < 0) {
                  throw new Error('Wallet balance cannot be negative');
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
                `Updated Client ID: ${request.params.recordId} - Email: ${
                  request.payload.email || "N/A"
                }`
              );
            }
            return response;
          },
        },

        // Soft delete client
        delete: {
          before: async (request) => {
            request.payload = {
              is_deleted: true,
              updated_at: new Date().toISOString()
            };
            request.method = 'POST';
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `SOFT DELETED Client with ID: ${request.params.recordId}`
              );
            }
            return response;
          },
        },

        // Custom client actions
        addCredit: {
          actionType: 'record',
          icon: 'Plus',
          variant: 'success',
          component: false,
          handler: async (request, response, context) => {
            const { record, resource } = context;
            const currentWallet = parseFloat(record.params.wallet) || 0;
            const addAmount = 25.0; // Add $25 credit
            const newWallet = currentWallet + addAmount;
            
            await resource.update(record.id(), {
              wallet: newWallet,
              updated_at: new Date().toISOString()
            });
            
            if (context.currentAdmin) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `ADDED $${addAmount} credit to Client ID: ${record.id()} wallet. New balance: $${newWallet}`
              );
            }
            
            return {
              notice: {
                message: `Added $${addAmount} credit to wallet. New balance: $${newWallet}`,
                type: 'success'
              }
            };
          }
        },

        // Deduct credit
        deductCredit: {
          actionType: 'record',
          icon: 'Minus',
          variant: 'warning',
          component: false,
          handler: async (request, response, context) => {
            const { record, resource } = context;
            const currentWallet = parseFloat(record.params.wallet) || 0;
            const deductAmount = 10.0; // Deduct $10
            const newWallet = Math.max(0, currentWallet - deductAmount); // Don't go below 0
            
            await resource.update(record.id(), {
              wallet: newWallet,
              updated_at: new Date().toISOString()
            });
            
            if (context.currentAdmin) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `DEDUCTED $${deductAmount} from Client ID: ${record.id()} wallet. New balance: $${newWallet}`
              );
            }
            
            return {
              notice: {
                message: `Deducted $${deductAmount} from wallet. New balance: $${newWallet}`,
                type: 'warning'
              }
            };
          }
        },

        // Flag client for review
        flagForReview: {
          actionType: 'record',
          icon: 'Flag',
          variant: 'danger',
          component: false,
          handler: async (request, response, context) => {
            const { record, resource } = context;
            const currentViolations = parseInt(record.params.violation_count) || 0;
            
            await resource.update(record.id(), {
              violation_count: currentViolations + 1,
              updated_at: new Date().toISOString()
            });
            
            if (context.currentAdmin) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `FLAGGED Client ID: ${record.id()} for review - Violation count: ${currentViolations + 1}`
              );
            }
            
            return {
              notice: {
                message: `Client flagged for review! Violation count: ${currentViolations + 1}`,
                type: 'warning'
              }
            };
          }
        },

        // Restore client
        restore: {
          actionType: 'record',
          icon: 'Refresh',
          variant: 'success',
          component: false,
          handler: async (request, response, context) => {
            const { record, resource } = context;
            
            await resource.update(record.id(), {
              is_deleted: false,
              updated_at: new Date().toISOString()
            });
            
            if (context.currentAdmin) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `RESTORED Client ID: ${record.id()}`
              );
            }
            
            return {
              notice: {
                message: 'Client successfully restored!',
                type: 'success'
              }
            };
          }
        },

        // Toggle verification
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
                `${!currentStatus ? 'VERIFIED' : 'UNVERIFIED'} Client ID: ${record.id()}`
              );
            }
            
            return {
              notice: {
                message: `Client ${!currentStatus ? 'verified' : 'unverified'} successfully!`,
                type: 'success'
              }
            };
          }
        },

        // Bulk actions for clients
        bulkAddCredit: {
          actionType: 'bulk',
          icon: 'DollarSign',
          variant: 'success',
          component: false,
          handler: async (request, response, context) => {
            const { records, resource } = context;
            const creditAmount = 10.0; // $10 per client
            
            for (const record of records) {
              const currentWallet = parseFloat(record.params.wallet) || 0;
              const newWallet = currentWallet + creditAmount;
              
              await resource.update(record.id(), {
                wallet: newWallet,
                updated_at: new Date().toISOString()
              });
            }
            
            if (context.currentAdmin) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `BULK ADDED $${creditAmount} credit to ${records.length} clients`
              );
            }
            
            return {
              notice: {
                message: `Successfully added $${creditAmount} credit to ${records.length} clients!`,
                type: 'success'
              }
            };
          }
        }
      },
    },
  };
};