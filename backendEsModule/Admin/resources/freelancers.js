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
        "active_enrollments",
        "completed_courses",
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
        "active_enrollments",
        "completed_courses",
        "total_enrollments",
        "average_progress",
        "last_course_activity",
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
        "active_enrollments",
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

        // Course enrollment related fields
        active_enrollments: {
          type: "number",
          isVisible: { list: true, show: true, edit: false, filter: true },
          description: "Number of active course enrollments",
        },
        completed_courses: {
          type: "number",
          isVisible: { list: true, show: true, edit: false, filter: false },
          description: "Number of completed courses",
        },
        total_enrollments: {
          type: "number",
          isVisible: { list: false, show: true, edit: false, filter: false },
          description: "Total number of course enrollments",
        },
        average_progress: {
          type: "number",
          isVisible: { list: false, show: true, edit: false, filter: false },
          description: "Average progress across all enrolled courses",
        },
        last_course_activity: {
          type: "datetime",
          isVisible: { list: false, show: true, edit: false, filter: false },
          description: "Last time freelancer accessed any course",
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
        ".enrollments-high": {
          color: "#10b981",
          "font-weight": "bold",
        },
        ".enrollments-medium": {
          color: "#eab308",
          "font-weight": "bold",
        },
        ".enrollments-none": {
          color: "#64748b",
          "font-style": "italic",
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
              // Get freelancer IDs for enrollment queries
              const freelancerIds = response.records.map(record => record.params.id);
              
              let enrollmentData = {};
              if (freelancerIds.length > 0) {
                try {
                  // Get active enrollments count
                  const activeEnrollments = await db.table("course_enrollments")
                    .select("freelancer_id")
                    .count("* as count")
                    .whereIn("freelancer_id", freelancerIds)
                    .whereIn("enrollment_status", ["active", "paused"])
                    .groupBy("freelancer_id");

                  // Get completed courses count
                  const completedCourses = await db.table("course_enrollments")
                    .select("freelancer_id")
                    .count("* as count")
                    .whereIn("freelancer_id", freelancerIds)
                    .where("enrollment_status", "completed")
                    .groupBy("freelancer_id");

                  // Organize data by freelancer_id
                  activeEnrollments.forEach(item => {
                    if (!enrollmentData[item.freelancer_id]) {
                      enrollmentData[item.freelancer_id] = {};
                    }
                    enrollmentData[item.freelancer_id].active = parseInt(item.count);
                  });

                  completedCourses.forEach(item => {
                    if (!enrollmentData[item.freelancer_id]) {
                      enrollmentData[item.freelancer_id] = {};
                    }
                    enrollmentData[item.freelancer_id].completed = parseInt(item.count);
                  });
                } catch (error) {
                  console.error("Error fetching enrollment data:", error);
                }
              }

              response.records = response.records.map((record) => {
                record.params.role_name = "Freelancer";
                record.params.full_name = `${record.params.first_name} ${record.params.last_name}`;

                // Rating styling
                const rating = parseFloat(record.params.rating) || 0;
                if (rating >= 4.0) record.params.rating_class = "rating-high";
                else if (rating >= 3.0) record.params.rating_class = "rating-medium";
                else record.params.rating_class = "rating-low";

                // Enrollment data
                const freelancerId = record.params.id;
                const activeCount = enrollmentData[freelancerId]?.active || 0;
                const completedCount = enrollmentData[freelancerId]?.completed || 0;

                record.params.active_enrollments = activeCount;
                record.params.completed_courses = completedCount;

                // Enrollment styling
                if (activeCount >= 3) record.params.enrollments_class = "enrollments-high";
                else if (activeCount >= 1) record.params.enrollments_class = "enrollments-medium";
                else record.params.enrollments_class = "enrollments-none";

                return record;
              });
            }
            return response;
          },
        },

        show: {
          after: async (response) => {
            if (response.record) {
              const freelancerId = response.record.params.id;
              
              try {
                // Get detailed enrollment information
                const enrollments = await db.table("course_enrollments")
                  .leftJoin("courses", "course_enrollments.course_id", "courses.id")
                  .select(
                    "course_enrollments.*",
                    "courses.title as course_title",
                    "courses.description as course_description"
                  )
                  .where("course_enrollments.freelancer_id", freelancerId)
                  .orderBy("course_enrollments.enrolled_at", "desc");

                // Calculate statistics
                const activeCount = enrollments.filter(e => ["active", "paused"].includes(e.enrollment_status)).length;
                const completedCount = enrollments.filter(e => e.enrollment_status === "completed").length;
                const totalCount = enrollments.length;

                // Calculate average progress
                let averageProgress = 0;
                if (enrollments.length > 0) {
                  const totalProgress = enrollments.reduce((sum, e) => sum + (parseFloat(e.progress) || 0), 0);
                  averageProgress = Math.round(totalProgress / enrollments.length);
                }

                // Get last activity
                const lastActivity = enrollments.reduce((latest, enrollment) => {
                  const activityDate = enrollment.last_accessed_at || enrollment.enrolled_at;
                  return (!latest || new Date(activityDate) > new Date(latest)) ? activityDate : latest;
                }, null);

                response.record.params.active_enrollments = activeCount;
                response.record.params.completed_courses = completedCount;
                response.record.params.total_enrollments = totalCount;
                response.record.params.average_progress = averageProgress;
                response.record.params.last_course_activity = lastActivity;

              } catch (error) {
                console.error("Error fetching detailed enrollment data:", error);
                response.record.params.active_enrollments = 0;
                response.record.params.completed_courses = 0;
                response.record.params.total_enrollments = 0;
                response.record.params.average_progress = 0;
              }
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

        // New action to view freelancer's enrollments
        viewEnrollments: {
          actionType: "record",
          icon: "BookOpen",
          variant: "info",
          component: false,
          handler: async (request, response, context) => {
            const { record } = context;
            const freelancerName = `${record.params.first_name} ${record.params.last_name}`;
            
            return {
              redirectUrl: `/admin/resources/course_enrollments?filters.freelancer_id=${record.params.id}`,
              notice: {
                message: `Viewing enrollments for ${freelancerName}`,
                type: "info"
              }
            };
          }
        },

        // New action to enroll freelancer in a course
        enrollInCourse: {
          actionType: "record",
          icon: "Plus",
          variant: "success",
          component: false,
          handler: async (request, response, context) => {
            const { record } = context;
            const freelancerName = `${record.params.first_name} ${record.params.last_name}`;
            
            return {
              redirectUrl: `/admin/resources/course_enrollments/actions/new?freelancer_id=${record.params.id}&freelancer_name=${encodeURIComponent(freelancerName)}`,
              notice: {
                message: `Creating new enrollment for ${freelancerName}`,
                type: "info"
              }
            };
          }
        },

        // New action to view course progress summary
        viewCourseProgress: {
          actionType: "record",
          icon: "TrendingUp",
          variant: "info",
          component: false,
          isVisible: (context) => {
            return context.record && (context.record.params.active_enrollments > 0 || context.record.params.completed_courses > 0);
          },
          handler: async (request, response, context) => {
            const { record } = context;
            const freelancerName = `${record.params.first_name} ${record.params.last_name}`;
            
            // This could redirect to a custom dashboard or detailed progress view
            return {
              redirectUrl: `/admin/resources/course_enrollments?filters.freelancer_id=${record.params.id}&sort=progress&direction=desc`,
              notice: {
                message: `Viewing course progress for ${freelancerName}`,
                type: "info"
              }
            };
          }
        }
      },
    },
  };
};