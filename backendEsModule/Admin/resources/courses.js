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
      listProperties: ["id", "title", "price", "created_at"],
      showProperties: [
        "id",
        "title",
        "description",
        "price",
        "created_at",
        "updated_at",
      ],
      editProperties: [
        "title",
        "description",
        "price",
        "title_ar",
        "description_ar",
      ],
      filterProperties: ["title", "price", "created_at"],

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
        price: { type: "number", isRequired: true, props: { step: 0.01 } },
        is_deleted: { type: "boolean", isVisible: false },
        created_at: {
          type: "datetime",
          isVisible: { list: true, show: true, edit: false },
        },
        updated_at: {
          type: "datetime",
          isVisible: { list: false, show: true, edit: false },
        },
      },

      actions: {
        new: {
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload?.title) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Created Course: ${request.payload.title}`
              );
            }
            return response;
          },
        },
        edit: {
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
      listProperties: ["id", "course_id", "title", "file_type", "created_at"],
      showProperties: [
        "id",
        "course_id",
        "title",
        "file_type",
        "file_url",
        "description",
        "created_at",
      ],
      editProperties: [
        "course_id",
        "title",
        "file_type",
        "file_url",
        "description",
      ],

      properties: {
        id: { isId: true },
        course_id: {
          type: "reference",
          reference: "courses",
          isRequired: true,
        },
        title: { isRequired: true },
        file_url: { isRequired: true },
        file_type: {
          type: "string",
          availableValues: [
            { value: "pdf", label: "PDF" },
            { value: "video", label: "Video" },
            { value: "image", label: "Image" },
            { value: "document", label: "Document" },
            { value: "presentation", label: "Presentation" },
            { value: "spreadsheet", label: "Spreadsheet" },
          ],
          isRequired: true,
        },
        description: { type: "textarea", isVisible: { list: false } },
        created_at: {
          type: "datetime",
          isVisible: { list: true, show: true, edit: false },
        },
      },
    },
  });

  /**
   * ===============================
   * Course Enrollments Resource
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
        "enrolled_at",
        "progress",
      ],
      showProperties: [
        "id",
        "course_id",
        "freelancer_id",
        "enrolled_at",
        "progress",
      ],
      editProperties: ["course_id", "freelancer_id", "progress"],

      properties: {
        id: { isId: true },
        course_id: {
          type: "reference",
          reference: "courses", // links to courses resource
          isRequired: true,
        },
        freelancer_id: {
          type: "reference",
          reference: "freelancers", // ✅ now points to your Freelancer resource
          isRequired: true,
        },
        enrolled_at: {
          type: "datetime",
          isVisible: { list: true, show: true, edit: false },
        },
        progress: {
          type: "number",
          validation: { min: 0, max: 100 },
          props: { step: 0.01, suffix: "%" },
        },
      },

      actions: {
        new: {
          after: async (response, request, context) => {
            if (context.currentAdmin && request.payload?.course_id) {
              await logAdminAction(
                context.currentAdmin.id,
                context.currentAdmin.email,
                `Enrolled Freelancer ID: ${request.payload.freelancer_id} into Course ID: ${request.payload.course_id}`
              );
            }
            return response;
          },
        },
        edit: {
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
