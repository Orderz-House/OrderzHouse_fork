// Admin/resources/freelancers.js
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
        // Role management - Hidden for freelancers resource
        role_id: {
          isVisible: { list: false, filter: false, show: false, edit: false },
        },
        
        // User identification
        first_name: { 
          isRequired: true,
          description: "Freelancer's first name"
        },
        last_name: { 
          isRequired: true,
          description: "Freelancer's last name"
        },
        email: { 
          isRequired: true,
          type: "email",
          description: "Freelancer's email address"
        },
        username: { 
          isRequired: true,
          description: "Freelancer username"
        },
        password: {
          type: "password",
          isVisible: { list: false, show: false, edit: true, filter: false },
          description: "Freelancer password (leave empty to keep current)"
        },
        phone_number: { 
          isRequired: true,
          description: "Freelancer's phone number"
        },
        country: { 
          isRequired: true,
          description: "Freelancer's country"
        },
        
        // Profile and media
        profile_pic_url: {
          type: "url",
          description: "Profile picture URL",
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        
        // Freelancer-specific fields
        rating: {
          type: "number",
          description: "Freelancer rating (0.0 - 5.0)",
          props: {
            min: 0,
            max: 5,
            step: 0.1
          }
        },
        wallet: {
          type: "number",
          description: "Freelancer wallet balance",
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
      
      // Enhanced styling for freelancer interface
      styles: {
        '.freelancer-header': {
          'background': 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
          'color': 'white',
          'padding': '1rem',
          'border-radius': '8px 8px 0 0'
        },
        '.freelancer-row': {
          'background': '#fff8e1',
          'border-left': '4px solid #ff9800'
        },
        '.freelancer-badge': {
          'background': '#ff9800',
          'color': 'white',
          'padding': '0.25rem 0.5rem',
          'border-radius': '4px',
          'font-size': '0.75rem'
        },
        '.rating-high': {
          'color': '#4caf50',
          'font-weight': 'bold'
        },
        '.rating-medium': {
          'color': '#ff9800',
          'font-weight': 'bold'
        },
        '.rating-low': {
          'color': '#f44336',
          'font-weight': 'bold'
        }
      },

      actions: {
        // Filter to show only freelancers (role_id = 3)
        list: {
          before: async (request) => {
            request.query = {
              ...request.query,
              "filters.role_id": "3",
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
            // Add freelancer-specific enhancements
            if (response.records) {
              response.records = response.records.map(record => {
                record.params.role_name = 'Freelancer';
                record.params.full_name = `${record.params.first_name} ${record.params.last_name}`;
                
                // Add rating class for styling
                const rating = parseFloat(record.params.rating) || 0;
                if (rating >= 4) record.params.rating_class = 'rating-high';
                else if (rating >= 2.5) record.params.rating_class = 'rating-medium';
                else record.params.rating_class = 'rating-low';
                
                return record;
              });
            }
            return response;
          }
        },

        // Create new freelancer
        new: {
          before: async (request) => {
            if (request.payload) {
              // Set freelancer-specific defaults
              request.payload.role_id = 3; // Freelancer role only
              request.payload.is_deleted = false;
              request.payload.violation_count = 0;
              request.payload.rating = 0.0; // Start with 0 rating
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
                `Created new Freelancer: ${request.payload.email} (${request.payload.first_name} ${request.payload.last_name})`
              );
            }
            return response;
          },
        },

        // Edit freelancer
        edit: {
          before: async (request) => {
            if (request.payload) {
              request.payload.updated_at = new Date().toISOString();
              
              // Ensure role remains freelancer
              request.payload.role_id = 3;
              
              // Handle password updates
              if (request.payload.password && request.payload.password.trim() === '') {
                delete request.payload.password; // Don't update if empty
              }
              
              // Validate rating range
              if (request.payload.rating !== undefined) {
                const rating = parseFloat(request.payload.rating);
                if (rating < 0 || rating > 5) {
                  throw new Error('Rating must be between 0 and 5');
                }
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
                `Updated Freelancer ID: ${request.params.recordId} - Email: ${
                  request.payload.email || "N/A"
                }`
              );
            }
            return response;
          },
        },

        // Soft delete freelancer
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
                `SOFT DELETED Freelancer with ID: ${request.params.recordId}`
              );
            }
            return response;
          },
        },

        // Custom freelancer actions
        adjustRating: {
          actionType: 'record',
          icon: 'Star',
          variant: 'warning',
          component: false,
          handler: async (request, response, context) => {
            const { record, resource } = context;
            const currentRating = parseFloat(record.params.rating) || 0;
            const newRating = Math.min(5, Math.max(0, currentRating + 0.5)); // Increase by 0.5
            
            await resource.update(record.id(), {
              rating: newRating,
              updated_at: new Date().toISOString()
            });
            
            if (context.currentAdmin) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `ADJUSTED RATING for Freelancer ID: ${record.id()} from ${currentRating} to ${newRating}`
              );
            }
            
            return {
              notice: {
                message: `Rating updated to ${newRating}!`,
                type: 'success'
              }
            };
          }
        },

        // Add funds to wallet
        addFunds: {
          actionType: 'record',
          icon: 'DollarSign',
          variant: 'success',
          component: false,
          handler: async (request, response, context) => {
            const { record, resource } = context;
            const currentWallet = parseFloat(record.params.wallet) || 0;
            const addAmount = 10.0; // Add $10
            const newWallet = currentWallet + addAmount;
            
            await resource.update(record.id(), {
              wallet: newWallet,
              updated_at: new Date().toISOString()
            });
            
            if (context.currentAdmin) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `ADDED $${addAmount} to Freelancer ID: ${record.id()} wallet. New balance: $${newWallet}`
              );
            }
            
            return {
              notice: {
                message: `Added $${addAmount} to wallet. New balance: $${newWallet}`,
                type: 'success'
              }
            };
          }
        },

        // Suspend freelancer
        suspend: {
          actionType: 'record',
          icon: 'Ban',
          variant: 'danger',
          component: false,
          handler: async (request, response, context) => {
            const { record, resource } = context;
            const currentViolations = parseInt(record.params.violation_count) || 0;
            
            await resource.update(record.id(), {
              violation_count: currentViolations + 1,
              is_verified: false, // Remove verification on suspension
              updated_at: new Date().toISOString()
            });
            
            if (context.currentAdmin) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `SUSPENDED Freelancer ID: ${record.id()} - Violation count: ${currentViolations + 1}`
              );
            }
            
            return {
              notice: {
                message: `Freelancer suspended! Violation count: ${currentViolations + 1}`,
                type: 'warning'
              }
            };
          }
        },

        // Restore freelancer
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
                `RESTORED Freelancer ID: ${record.id()}`
              );
            }
            
            return {
              notice: {
                message: 'Freelancer successfully restored!',
                type: 'success'
              }
            };
          }
        }
      },
    },
  };
};