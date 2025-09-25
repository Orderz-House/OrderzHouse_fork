// Admin/resources/courses.js
export const createCoursesResource = async (db, logAdminAction) => {
  const resources = [];

  /**
   * ===============================
   * Courses (Read-Only)
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
        "created_at",
      ],
      showProperties: [
        "id",
        "title",
        "description",
        "price",
        "status",
        "duration",
        "title_ar",
        "description_ar",
        "created_at",
        "updated_at",
        "enrollments",
      ],
      filterProperties: ["title", "price", "status", "created_at"],

      sort: { sortBy: "created_at", direction: "desc" },

      properties: {
        id: { isId: true },
        title: { isRequired: true },
        title_ar: {
          isVisible: { list: false },
          props: { style: { direction: "rtl" } },
        },
        description: { type: "richtext" },
        description_ar: {
          type: "richtext",
          isVisible: { list: false },
          props: { style: { direction: "rtl" } },
        },
        price: {
          type: "number",
          isRequired: true,
          props: { step: 0.01, min: 0 },
          description: "Course price in JD",
        },
        status: {
          type: "string",
          availableValues: [
            { value: "draft", label: "Draft" },
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
          ],
        },
        duration: { type: "string" },
        is_deleted: { type: "boolean", isVisible: false },
        created_at: {
          type: "datetime",
          isVisible: { list: true, show: true, edit: false },
        },
        updated_at: {
          type: "datetime",
          isVisible: { list: false, show: true, edit: false },
        },

        // Read-only property showing enrolled freelancers
        enrollments: {
          type: "mixed",
          isVisible: { list: false, show: true, edit: false },
          description: "Freelancers enrolled in this course",
        },
      },

      actions: {
        list: { isAccessible: true },
        show: {
          isAccessible: true,
          after: async (response) => {
            if (response.record) {
              const courseId = response.record.params.id;
              try {
                const enrollments = await db
                  .table("course_enrollments")
                  .leftJoin(
                    "users as freelancers",
                    "course_enrollments.freelancer_id",
                    "freelancers.id"
                  )
                  .select(
                    "course_enrollments.id as enrollment_id",
                    "freelancers.id as freelancer_id",
                    "freelancers.first_name",
                    "freelancers.last_name",
                    "freelancers.email",
                    "course_enrollments.status",
                    "course_enrollments.progress",
                    "course_enrollments.enrolled_at"
                  )
                  .where("course_enrollments.course_id", courseId)
                  .orderBy("course_enrollments.enrolled_at", "desc");

                response.record.params.enrollments = enrollments.map((e) => ({
                  freelancer_id: e.freelancer_id,
                  freelancer_name: `${e.first_name} ${e.last_name}`,
                  freelancer_email: e.email,
                  status: e.status,
                  progress: e.progress,
                  enrolled_at: e.enrolled_at,
                }));
              } catch (err) {
                console.error("Error fetching enrollments:", err);
                response.record.params.enrollments = [];
              }
            }
            return response;
          },
        },
        new: { isAccessible: false },
        edit: { isAccessible: false },
        delete: { isAccessible: false },
      },
    },
  });

  /**
   * ===============================
   * Course Materials (Read-Only)
   * ===============================
   */
  resources.push({
    resource: db.table("course_materials"),
    options: {
      id: "course_materials",
      navigation: { name: "Course Management", icon: "FileText" },

      listProperties: ["id", "course_id", "file_url"],
      showProperties: ["id", "course_id", "file_url"],
      filterProperties: ["course_id"],

      properties: {
        id: { isId: true },
        course_id: {
          type: "reference",
          reference: "courses",
          description: "Linked course",
        },
        file_url: { type: "string", description: "URL of uploaded material" },
      },

      actions: {
        list: { isAccessible: true },
        show: { isAccessible: true },
        new: { isAccessible: false },
        edit: { isAccessible: false },
        delete: { isAccessible: false },
      },
    },
  });

  /**
   * ===============================
   * Course Enrollments (Read-Only)
   * ===============================
   */
  resources.push({
    resource: db.table("course_enrollments"),
    options: {
      id: "course_enrollments",
      navigation: { name: "Course Management", icon: "Users" },

      listProperties: [
        "id",
        "course_id",
        "freelancer_id",
        "status",
        "progress",
        "enrolled_at",
      ],
      showProperties: [
        "id",
        "course_id",
        "freelancer_id",
        "status",
        "progress",
        "enrolled_at",
      ],
      filterProperties: ["course_id", "freelancer_id", "status"],

      properties: {
        id: { isId: true },
        course_id: {
          type: "reference",
          reference: "courses",
          description: "Course this enrollment belongs to",
        },
        freelancer_id: {
          type: "reference",
          reference: "freelancers",
          description: "Freelancer enrolled",
        },
        enrolled_at: { type: "datetime", description: "Date of enrollment" },
        status: {
          type: "string",
          availableValues: [
            { value: "active", label: "Active" },
            { value: "paused", label: "Paused" },
            { value: "completed", label: "Completed" },
          ],
          description: "Enrollment status",
        },
        progress: {
          type: "number",
          props: { min: 0, max: 100 },
          description: "Progress percentage",
        },
      },

      actions: {
        list: { isAccessible: true },
        show: { isAccessible: true },
        new: { isAccessible: false },
        edit: { isAccessible: false },
        delete: { isAccessible: false },
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
