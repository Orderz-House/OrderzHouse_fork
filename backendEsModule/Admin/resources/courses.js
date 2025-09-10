// Admin/resources/courses.js

export const createCoursesResource = async (db, logAdminAction) => {
  const resources = [];

  /**
   * ===============================
   * Courses Resource
   * ===============================
   */
  resources.push({
    resource: db.table("courses"),
    options: {
      id: "courses",
      navigation: { name: "Course Management", icon: "BookOpen" },

      listProperties: [
        "id",
        "title",
        "price",
        "status",
        "duration",
        "enrolled_count",
        "created_at",
      ],

      showProperties: [
        "id",
        "title",
        "description",
        "price",
        "status",
        "duration",
        "enrolled_count",
        "completed_count",
        "title_ar",
        "description_ar",
        "created_at",
        "updated_at",
      ],

      editProperties: [
        "title",
        "description",
        "price",
        "status",
        "duration",
        "title_ar",
        "description_ar",
      ],

      filterProperties: ["title", "price", "status", "created_at"],

      sort: { sortBy: "created_at", direction: "desc" },

      properties: {
        id: { isId: true },

        title: {
          isRequired: true,
          description: "Course title",
        },

        title_ar: {
          isVisible: { list: false },
          props: { style: { direction: "rtl" } },
          description: "Course title in Arabic",
        },

        description: {
          type: "richtext",
          description: "Course description and content",
        },

        description_ar: {
          type: "richtext",
          isVisible: { list: false },
          props: { style: { direction: "rtl" } },
          description: "Course description in Arabic",
        },

        price: {
          type: "number",
          isRequired: true,
          props: { step: 0.01, min: 0 },
          description: "Course price in USD",
        },

        status: {
          type: "string",
          availableValues: [
            { value: "draft", label: "Draft" },
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
          ],
          description: "Course status",
        },

        duration: {
          type: "string",
          description: "Course duration (e.g., '4 weeks', '20 hours')",
          isVisible: { list: true, show: true, edit: true, filter: false },
        },

        // Virtual fields for enrollment stats
        enrolled_count: {
          type: "number",
          isVisible: { list: true, show: true, edit: false, filter: false },
          description: "Number of enrolled freelancers",
        },

        completed_count: {
          type: "number",
          isVisible: { list: false, show: true, edit: false, filter: false },
          description: "Number of freelancers who completed the course",
        },

        is_deleted: {
          type: "boolean",
          isVisible: false,
        },

        created_at: {
          type: "datetime",
          isVisible: { list: true, show: true, edit: false },
          description: "Course creation date",
        },

        updated_at: {
          type: "datetime",
          isVisible: { list: false, show: true, edit: false },
          description: "Last update date",
        },
      },

      actions: {
        list: {
          after: async (response) => {
            if (response.records) {
              // Get enrollment statistics for all courses
              const courseIds = response.records.map(
                (record) => record.params.id
              );

              let enrollmentStats = {};
              if (courseIds.length > 0) {
                try {
                  // Get enrolled count
                  const enrolledCounts = await db
                    .table("course_enrollments")
                    .select("course_id")
                    .count("* as count")
                    .whereIn("course_id", courseIds)
                    .whereIn("enrollment_status", [
                      "active",
                      "paused",
                      "completed",
                    ])
                    .groupBy("course_id");

                  // Get completed count
                  const completedCounts = await db
                    .table("course_enrollments")
                    .select("course_id")
                    .count("* as count")
                    .whereIn("course_id", courseIds)
                    .where("enrollment_status", "completed")
                    .groupBy("course_id");

                  // Organize data
                  enrolledCounts.forEach((item) => {
                    if (!enrollmentStats[item.course_id]) {
                      enrollmentStats[item.course_id] = {};
                    }
                    enrollmentStats[item.course_id].enrolled = parseInt(
                      item.count
                    );
                  });

                  completedCounts.forEach((item) => {
                    if (!enrollmentStats[item.course_id]) {
                      enrollmentStats[item.course_id] = {};
                    }
                    enrollmentStats[item.course_id].completed = parseInt(
                      item.count
                    );
                  });
                } catch (error) {
                  console.error("Error fetching enrollment stats:", error);
                }
              }

              // Add stats to records
              response.records = response.records.map((record) => {
                const courseId = record.params.id;
                record.params.enrolled_count =
                  enrollmentStats[courseId]?.enrolled || 0;
                record.params.completed_count =
                  enrollmentStats[courseId]?.completed || 0;

                return record;
              });
            }
            return response;
          },
        },

        show: {
          after: async (response) => {
            if (response.record) {
              const courseId = response.record.params.id;

              try {
                // Get detailed enrollment statistics
                const enrollmentStats = await db
                  .table("course_enrollments")
                  .select("enrollment_status")
                  .count("* as count")
                  .where("course_id", courseId)
                  .groupBy("enrollment_status");

                let totalEnrolled = 0;
                let completed = 0;
                let active = 0;
                let paused = 0;

                enrollmentStats.forEach((stat) => {
                  const count = parseInt(stat.count);
                  totalEnrolled += count;

                  switch (stat.enrollment_status) {
                    case "completed":
                      completed += count;
                      break;
                    case "active":
                      active += count;
                      break;
                    case "paused":
                      paused += count;
                      break;
                  }
                });

                response.record.params.enrolled_count = totalEnrolled;
                response.record.params.completed_count = completed;
                response.record.params.active_count = active;
                response.record.params.paused_count = paused;
              } catch (error) {
                console.error(
                  "Error fetching detailed enrollment stats:",
                  error
                );
                response.record.params.enrolled_count = 0;
                response.record.params.completed_count = 0;
              }
            }
            return response;
          },
        },

        new: {
          before: async (request) => {
            if (request.payload) {
              // Set defaults
              request.payload.status = request.payload.status || "draft";
              request.payload.is_deleted = false;

              if (!request.payload.created_at) {
                request.payload.created_at = new Date().toISOString();
              }
              request.payload.updated_at = new Date().toISOString();
            }
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload?.title) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Created Course: ${request.payload.title} (Status: ${
                  request.payload.status || "draft"
                })`
              );
            }
            return response;
          },
        },

        edit: {
          before: async (request) => {
            if (request.payload) {
              request.payload.updated_at = new Date().toISOString();
            }
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload?.title) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Edited Course ID: ${request.params.recordId} - ${request.payload.title}`
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
                `Deleted Course ID: ${request.params.recordId}`
              );
            }
            return response;
          },
        },

        // Custom action to view course enrollments
        viewEnrollments: {
          actionType: "record",
          icon: "Users",
          variant: "info",
          component: false,
          handler: async (request, response, context) => {
            const { record } = context;

            return {
              redirectUrl: `/admin/resources/course_enrollments?filters.course_id=${record.params.id}`,
              notice: {
                message: `Viewing enrollments for: ${record.params.title}`,
                type: "info",
              },
            };
          },
        },
      },
    },
  });

  /**
   * ===============================
   * Course Materials Resource
   * ===============================
   */
  resources.push({
    resource: db.table("course_materials"),
    options: {
      id: "course_materials",
      navigation: { name: "Course Management", icon: "FileText" },

      listProperties: [
        "id",
        "course_title",
        "title",
        "file_type",
        "created_at",
      ],

      showProperties: [
        "id",
        "course_id",
        "course_title",
        "title",
        "file_type",
        "file_url",
        "description",
        "created_at",
        "updated_at",
      ],

      editProperties: [
        "course_id",
        "title",
        "file_type",
        "file_url",
        "description",
      ],

      filterProperties: ["course_title", "title", "file_type"],

      sort: { sortBy: "created_at", direction: "desc" },

      properties: {
        id: { isId: true },

        course_id: {
          type: "reference",
          reference: "courses",
          isRequired: true,
          description: "Select the course this material belongs to",
        },

        course_title: {
          type: "string",
          isVisible: { list: true, show: true, edit: false, filter: true },
          description: "Course title (auto-populated)",
        },

        title: {
          isRequired: true,
          description: "Material title or name",
        },

        file_url: {
          type: "url",
          isRequired: true,
          description: "URL or path to the file",
        },

        file_type: {
          type: "string",
          availableValues: [
            { value: "pdf", label: "PDF Document" },
            { value: "video", label: "Video File" },
            { value: "image", label: "Image" },
            { value: "document", label: "Document" },
            { value: "presentation", label: "Presentation" },
            { value: "spreadsheet", label: "Spreadsheet" },
            { value: "audio", label: "Audio File" },
            { value: "zip", label: "Archive/Zip" },
            { value: "other", label: "Other" },
          ],
          isRequired: true,
          description: "Type of file or material",
        },

        description: {
          type: "textarea",
          isVisible: { list: false },
          description: "Optional description of the material content",
        },

        created_at: {
          type: "datetime",
          isVisible: { list: true, show: true, edit: false },
          description: "Upload date",
        },

        updated_at: {
          type: "datetime",
          isVisible: { list: false, show: true, edit: false },
          description: "Last update date",
        },
      },

      actions: {
        list: {
          after: async (response) => {
            if (response.records) {
              // Auto-populate course titles for list view
              const courseIds = [
                ...new Set(
                  response.records.map((record) => record.params.course_id)
                ),
              ];

              if (courseIds.length > 0) {
                try {
                  const courses = await db
                    .table("courses")
                    .select("id", "title")
                    .whereIn("id", courseIds);

                  const courseMap = {};
                  courses.forEach((course) => {
                    courseMap[course.id] = course.title;
                  });

                  response.records = response.records.map((record) => {
                    record.params.course_title =
                      courseMap[record.params.course_id] || "Unknown Course";
                    return record;
                  });
                } catch (error) {
                  console.error("Error fetching course titles:", error);
                }
              }
            }
            return response;
          },
        },

        new: {
          before: async (request) => {
            if (request.payload) {
              // Auto-populate course title
              if (request.payload.course_id) {
                try {
                  const course = await db
                    .table("courses")
                    .where("id", request.payload.course_id)
                    .first();

                  if (course) {
                    request.payload.course_title = course.title;
                  }
                } catch (error) {
                  console.error("Error fetching course:", error);
                }
              }

              if (!request.payload.created_at) {
                request.payload.created_at = new Date().toISOString();
              }
              request.payload.updated_at = new Date().toISOString();
            }
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload?.title) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Added material: ${request.payload.title} to course: ${
                  request.payload.course_title || request.payload.course_id
                }`
              );
            }
            return response;
          },
        },

        edit: {
          before: async (request) => {
            if (request.payload) {
              // Update course title if course_id changed
              if (request.payload.course_id) {
                try {
                  const course = await db
                    .table("courses")
                    .where("id", request.payload.course_id)
                    .first();

                  if (course) {
                    request.payload.course_title = course.title;
                  }
                } catch (error) {
                  console.error("Error fetching course:", error);
                }
              }

              request.payload.updated_at = new Date().toISOString();
            }
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload?.title) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Updated material ID: ${request.params.recordId} - ${request.payload.title}`
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
                `Deleted course material ID: ${request.params.recordId}`
              );
            }
            return response;
          },
        },
      },
    },
  });

  /**
   * ===============================
   * Course Enrollments Resource - FIXED VERSION
   * ===============================
   */
  resources.push({
    resource: db.table("course_enrollments"),
    options: {
      id: "course_enrollments",
      navigation: { name: "Course Management", icon: "Users" },

      listProperties: [
        "id",
        "freelancer_name",
        "freelancer_email",
        "course_title",
        "progress",
        "enrollment_status",
        "enrolled_at",
      ],

      showProperties: [
        "id",
        "freelancer_id",
        "freelancer_name",
        "freelancer_email",
        "course_id",
        "course_title",
        "progress",
        "enrollment_status",
        "enrolled_at",
        "completed_at",
        "last_accessed_at",
        "created_at",
        "updated_at",
      ],

      editProperties: [
        "freelancer_id",
        "course_id",
        "progress",
        "enrollment_status",
        "enrolled_at",
      ],

      filterProperties: [
        "freelancer_name",
        "freelancer_email",
        "course_title",
        "enrollment_status",
        "enrolled_at",
      ],

      sort: { sortBy: "enrolled_at", direction: "desc" },

      properties: {
        id: { isId: true },

        freelancer_id: {
          type: "reference",
          reference: "freelancers",
          isRequired: true,
          description: "Select freelancer to enroll",
        },

        freelancer_name: {
          type: "string",
          isVisible: { list: true, show: true, edit: false, filter: true },
          description: "Freelancer's full name (auto-populated)",
        },

        freelancer_email: {
          type: "email",
          isVisible: { list: true, show: true, edit: false, filter: true },
          description: "Freelancer's email (auto-populated)",
        },

        course_id: {
          type: "reference",
          reference: "courses",
          isRequired: true,
          description: "Select course for enrollment",
        },

        course_title: {
          type: "string",
          isVisible: { list: true, show: true, edit: false, filter: true },
          description: "Course title (auto-populated)",
        },

        progress: {
          type: "number",
          props: { min: 0, max: 100, step: 1 },
          description: "Course completion progress (0-100%)",
        },

        enrollment_status: {
          type: "string",
          availableValues: [
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
            { value: "paused", label: "Paused" },
            { value: "cancelled", label: "Cancelled" },
          ],
          description: "Current enrollment status",
        },

        enrolled_at: {
          type: "datetime",
          isRequired: true,
          description: "Enrollment date and time",
        },

        completed_at: {
          type: "datetime",
          isVisible: { list: false, show: true, edit: false, filter: false },
          description: "Course completion date (if completed)",
        },

        last_accessed_at: {
          type: "datetime",
          isVisible: { list: false, show: true, edit: false, filter: false },
          description: "Last time freelancer accessed the course",
        },

        created_at: {
          type: "datetime",
          isVisible: { list: false, show: true, edit: false, filter: false },
          description: "Record creation date",
        },

        updated_at: {
          type: "datetime",
          isVisible: { list: false, show: true, edit: false, filter: false },
          description: "Last update date",
        },
      },

      actions: {
        list: {
          after: async (response) => {
            if (response.records && response.records.length > 0) {
              console.log(
                "Processing",
                response.records.length,
                "enrollment records"
              );

              // Get all unique IDs, filter out null/undefined values
              const freelancerIds = [
                ...new Set(
                  response.records
                    .map((r) => r.params.freelancer_id)
                    .filter(Boolean)
                ),
              ];
              const courseIds = [
                ...new Set(
                  response.records
                    .map((r) => r.params.course_id)
                    .filter(Boolean)
                ),
              ];

              console.log("Freelancer IDs to fetch:", freelancerIds);
              console.log("Course IDs to fetch:", courseIds);

              let freelancerMap = {};
              let courseMap = {};

              // Fetch freelancer data if we have IDs
              if (freelancerIds.length > 0) {
                try {
                  const freelancers = await db
                    .table("users")
                    .select("id", "first_name", "last_name", "email")
                    .whereIn("id", freelancerIds)
                    .where("role_id", 3);

                  console.log("Fetched freelancers:", freelancers);

                  freelancers.forEach((freelancer) => {
                    freelancerMap[freelancer.id] = {
                      name: `${freelancer.first_name} ${freelancer.last_name}`,
                      email: freelancer.email,
                    };
                  });
                } catch (error) {
                  console.error("Error fetching freelancer data:", error);
                }
              }

              // Fetch course data if we have IDs
              if (courseIds.length > 0) {
                try {
                  const courses = await db
                    .table("courses")
                    .select("id", "title")
                    .whereIn("id", courseIds);

                  console.log("Fetched courses:", courses);

                  courses.forEach((course) => {
                    courseMap[course.id] = course.title;
                  });
                } catch (error) {
                  console.error("Error fetching course data:", error);
                }
              }

              // Update each record with populated data
              response.records = response.records.map((record) => {
                const freelancerId = record.params.freelancer_id;
                const courseId = record.params.course_id;

                const freelancer = freelancerMap[freelancerId];
                const courseTitle = courseMap[courseId];

                // Update freelancer info
                if (freelancer) {
                  record.params.freelancer_name = freelancer.name;
                  record.params.freelancer_email = freelancer.email;
                } else {
                  record.params.freelancer_name = freelancerId
                    ? `Unknown Freelancer (ID: ${freelancerId})`
                    : "No Freelancer ID";
                  record.params.freelancer_email = "N/A";
                }

                // Update course info
                if (courseTitle) {
                  record.params.course_title = courseTitle;
                } else {
                  record.params.course_title = courseId
                    ? `Unknown Course (ID: ${courseId})`
                    : "No Course ID";
                }

                console.log(`Updated record ${record.params.id}:`, {
                  freelancer_name: record.params.freelancer_name,
                  course_title: record.params.course_title,
                });

                return record;
              });
            }
            return response;
          },
        },

        show: {
          after: async (response) => {
            if (response.record) {
              const freelancerId = response.record.params.freelancer_id;
              const courseId = response.record.params.course_id;

              // Fetch freelancer data if not already populated
              if (freelancerId && !response.record.params.freelancer_name) {
                try {
                  const freelancer = await db
                    .table("users")
                    .select("first_name", "last_name", "email")
                    .where("id", freelancerId)
                    .where("role_id", 3)
                    .first();

                  if (freelancer) {
                    response.record.params.freelancer_name = `${freelancer.first_name} ${freelancer.last_name}`;
                    response.record.params.freelancer_email = freelancer.email;
                  }
                } catch (error) {
                  console.error("Error fetching freelancer for show:", error);
                }
              }

              // Fetch course data if not already populated
              if (courseId && !response.record.params.course_title) {
                try {
                  const course = await db
                    .table("courses")
                    .select("title")
                    .where("id", courseId)
                    .first();

                  if (course) {
                    response.record.params.course_title = course.title;
                  }
                } catch (error) {
                  console.error("Error fetching course for show:", error);
                }
              }
            }
            return response;
          },
        },

        new: {
          before: async (request) => {
            if (request.payload) {
              // Set defaults
              request.payload.progress = request.payload.progress || 0;
              request.payload.enrollment_status =
                request.payload.enrollment_status || "active";

              if (!request.payload.enrolled_at) {
                request.payload.enrolled_at = new Date().toISOString();
              }

              if (!request.payload.created_at) {
                request.payload.created_at = new Date().toISOString();
              }
              request.payload.updated_at = new Date().toISOString();

              // Auto-populate freelancer details
              if (request.payload.freelancer_id) {
                try {
                  const freelancer = await db
                    .table("users")
                    .where("id", request.payload.freelancer_id)
                    .where("role_id", 3)
                    .first();

                  if (freelancer) {
                    request.payload.freelancer_name = `${freelancer.first_name} ${freelancer.last_name}`;
                    request.payload.freelancer_email = freelancer.email;
                  }
                } catch (error) {
                  console.error("Error fetching freelancer:", error);
                }
              }

              // Auto-populate course details
              if (request.payload.course_id) {
                try {
                  const course = await db
                    .table("courses")
                    .where("id", request.payload.course_id)
                    .first();

                  if (course) {
                    request.payload.course_title = course.title;
                  }
                } catch (error) {
                  console.error("Error fetching course:", error);
                }
              }

              // Auto-complete if progress is 100%
              if (
                request.payload.progress >= 100 &&
                !request.payload.completed_at
              ) {
                request.payload.completed_at = new Date().toISOString();
                request.payload.enrollment_status = "completed";
              }
            }
            return request;
          },
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload?.course_id) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Enrolled ${
                  request.payload.freelancer_name ||
                  "Freelancer ID: " + request.payload.freelancer_id
                } into ${
                  request.payload.course_title ||
                  "Course ID: " + request.payload.course_id
                }`
              );
            }
            return response;
          },
        },

        edit: {
          before: async (request) => {
            if (request.payload) {
              request.payload.updated_at = new Date().toISOString();

              // Update freelancer details if changed
              if (request.payload.freelancer_id) {
                try {
                  const freelancer = await db
                    .table("users")
                    .where("id", request.payload.freelancer_id)
                    .where("role_id", 3)
                    .first();

                  if (freelancer) {
                    request.payload.freelancer_name = `${freelancer.first_name} ${freelancer.last_name}`;
                    request.payload.freelancer_email = freelancer.email;
                  }
                } catch (error) {
                  console.error("Error fetching freelancer:", error);
                }
              }

              // Update course details if changed
              if (request.payload.course_id) {
                try {
                  const course = await db
                    .table("courses")
                    .where("id", request.payload.course_id)
                    .first();

                  if (course) {
                    request.payload.course_title = course.title;
                  }
                } catch (error) {
                  console.error("Error fetching course:", error);
                }
              }

              // Auto-completion logic
              if (request.payload.progress >= 100) {
                if (!request.payload.completed_at) {
                  request.payload.completed_at = new Date().toISOString();
                }
                if (request.payload.enrollment_status !== "completed") {
                  request.payload.enrollment_status = "completed";
                }
              } else if (
                request.payload.progress < 100 &&
                request.payload.enrollment_status === "completed"
              ) {
                request.payload.completed_at = null;
                request.payload.enrollment_status = "active";
              }

              // Update last accessed time when progress changes
              if (request.payload.progress !== undefined) {
                request.payload.last_accessed_at = new Date().toISOString();
              }
            }
            return request;
          },
          after: async (response, request, context) => {
            if (
              context.currentAdmin &&
              request.payload?.progress !== undefined
            ) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Updated progress for Enrollment ID: ${request.params.recordId} → ${request.payload.progress}%`
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
                `Deleted Course Enrollment ID: ${request.params.recordId}`
              );
            }
            return response;
          },
        },
      },
    },
  });

  return resources;
};

export const createCourseResources = async (
  db,
  tableExists,
  logAdminAction
) => {
  return await createCoursesResource(db, logAdminAction);
};
