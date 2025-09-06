export const createCoursesResource = async (db, logAdminAction) => {
  const resources = [];

  // Courses Resource
  resources.push({
    resource: db.table("courses"),
    options: {
      navigation: {
        name: "Courses",
        icon: "BookOpen",
        section: {
          name: "Course Management",
          icon: "GraduationCap"
        }
      },
      properties: {
        title: {
          validation: { required: true }
        },
        title_ar: {
          isVisible: { list: false },
          props: { style: { direction: "rtl" } }
        },
        description: {
          type: "richtext",
          isVisible: { list: false }
        },
        description_ar: {
          type: "richtext",
          isVisible: { list: false },
          props: { style: { direction: "rtl" } }
        },
        price: {
          type: "number",
          validation: { required: true, min: 0 },
          props: { step: 0.01 }
        },
        updated_at: {
          isVisible: { list: false }
        },
        course_materials: {
          type: "mixed",
          isVisible: { show: true, edit: false, list: false },
          components: {
            show: "RelatedMaterials"
          }
        },
        course_enrollments: {
          type: "mixed", 
          isVisible: { show: true, edit: false, list: false },
          components: {
            show: "RelatedEnrollments"
          }
        }
      },
      actions: {
        show: {
          after: async (originalResponse, request, context) => {
            const courseId = request.params.recordId;
            
            try {
              // Fetch related materials
              const materials = await db.query(
                "SELECT * FROM course_materials WHERE course_id = $1",
                [courseId]
              );
              
              // Fetch related enrollments with user info
              const enrollments = await db.query(`
                SELECT ce.*, 
                       COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '') as freelancer_name,
                       u.email as freelancer_email 
                FROM course_enrollments ce 
                LEFT JOIN users u ON ce.freelancer_id = u.id 
                WHERE ce.course_id = $1
                ORDER BY ce.enrolled_at DESC
              `, [courseId]);
              
              originalResponse.record.params.course_materials = materials.rows || [];
              originalResponse.record.params.course_enrollments = enrollments.rows || [];
            } catch (error) {
              console.error("Error fetching course relations:", error);
              originalResponse.record.params.course_materials = [];
              originalResponse.record.params.course_enrollments = [];
            }
            
            return originalResponse;
          }
        },
        new: {
          after: async (originalResponse, request, context) => {
            if (request.method !== "get") {
              await logAdminAction(
                context.currentAdmin,
                request.method,
                "courses",
                request.payload?.record || { id: "new" }
              );
            }
            return originalResponse;
          }
        },
        edit: {
          after: async (originalResponse, request, context) => {
            if (request.method !== "get") {
              await logAdminAction(
                context.currentAdmin,
                request.method,
                "courses",
                request.payload?.record || { id: request.params?.recordId }
              );
            }
            return originalResponse;
          }
        },
        delete: {
          after: async (originalResponse, request, context) => {
            await logAdminAction(
              context.currentAdmin,
              "delete",
              "courses", 
              { id: request.params?.recordId }
            );
            return originalResponse;
          }
        }
      }
    }
  });

  // Course Materials Resource
  resources.push({
    resource: db.table("course_materials"),
    options: {
      navigation: {
        name: "Course Materials",
        icon: "FileText",
        section: {
          name: "Course Management",
          icon: "GraduationCap"
        }
      },
      properties: {
        course_id: {
          type: "reference",
          reference: "courses",
          validation: { required: true }
        },
        file_url: {
          validation: { required: true }
        }
      },
      actions: {
        new: {
          after: async (originalResponse, request, context) => {
            if (request.method !== "get") {
              await logAdminAction(
                context.currentAdmin,
                request.method,
                "course_materials",
                request.payload?.record || { id: "new" }
              );
            }
            return originalResponse;
          }
        },
        edit: {
          after: async (originalResponse, request, context) => {
            if (request.method !== "get") {
              await logAdminAction(
                context.currentAdmin,
                request.method,
                "course_materials",
                request.payload?.record || { id: request.params?.recordId }
              );
            }
            return originalResponse;
          }
        },
        delete: {
          after: async (originalResponse, request, context) => {
            await logAdminAction(
              context.currentAdmin,
              "delete",
              "course_materials",
              { id: request.params?.recordId }
            );
            return originalResponse;
          }
        }
      }
    }
  });

  // Course Enrollments Resource
  resources.push({
    resource: db.table("course_enrollments"),
    options: {
      navigation: {
        name: "Course Enrollments", 
        icon: "Users",
        section: {
          name: "Course Management",
          icon: "GraduationCap"
        }
      },
      properties: {
        course_id: {
          type: "reference",
          reference: "courses",
          validation: { required: true }
        },
        freelancer_id: {
          type: "reference",
          reference: "users",
          validation: { required: true }
        },
        enrolled_at: {
          type: "datetime",
          validation: { required: true }
        },
        progress: {
          type: "number",
          validation: { min: 0, max: 100 },
          props: { step: 0.01 }
        }
      },
      actions: {
        new: {
          after: async (originalResponse, request, context) => {
            if (request.method !== "get") {
              await logAdminAction(
                context.currentAdmin,
                request.method,
                "course_enrollments",
                request.payload?.record || { id: "new" }
              );
            }
            return originalResponse;
          }
        },
        edit: {
          after: async (originalResponse, request, context) => {
            if (request.method !== "get") {
              await logAdminAction(
                context.currentAdmin,
                request.method,
                "course_enrollments",
                request.payload?.record || { id: request.params?.recordId }
              );
            }
            return originalResponse;
          }
        },
        delete: {
          after: async (originalResponse, request, context) => {
            await logAdminAction(
              context.currentAdmin,
              "delete",
              "course_enrollments",
              { id: request.params?.recordId }
            );
            return originalResponse;
          }
        }
      }
    }
  });

  console.log("Course resources created:", resources.length);
  return resources;
};

export const createCourseResources = async (db, tableExists, logAdminAction) => {
  return await createCoursesResource(db, logAdminAction);
};