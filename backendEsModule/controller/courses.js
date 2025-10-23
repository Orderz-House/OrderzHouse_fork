import pool from "../models/db.js";
import { NotificationCreators } from "../services/notificationService.js";


/* -------------------- Courses -------------------- */
export const getCourses = async (req, res) => {
  try {
    const query = `
      SELECT id, title, description, price, category_id, created_at
      FROM courses
      WHERE is_deleted = FALSE
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query);
    return res.status(200).json({ success: true, courses: rows });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get courses by category
export const getCoursesByCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, error: "Invalid category ID" });
    }

    const query = `
      SELECT 
        c.id, c.title, c.description, c.price, c.created_at, c.updated_at,
        cat.name as category_name
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.category_id = $1 AND c.is_deleted = FALSE
      ORDER BY c.created_at DESC
    `;
    const { rows } = await pool.query(query, [categoryId]);
    return res.status(200).json({ success: true, courses: rows });
  } catch (error) {
    console.error("Error fetching courses by category:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get single course by ID
export const getCourseById = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const freelancer_id = req.token.userId;
    const userRole = req.token.roleId;
    
    if (isNaN(courseId)) {
      return res.status(400).json({ success: false, error: "Invalid course ID" });
    }

    // Check if user is admin (bypass access check) //we should use middleware for that .. admOnly
    if (userRole === 1) {
      const query = `SELECT id, title, description, price FROM courses WHERE id = $1 AND is_deleted = FALSE`;
      const { rows } = await pool.query(query, [courseId]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: "Course not found" });
      }
      return res.status(200).json({ success: true, course: rows[0] });
    }

    // For freelancers: check access permission // we should use middleware for that .. requireVERandSubscription
    const query = `
      SELECT c.id, c.title, c.description, c.price
      FROM courses c
      INNER JOIN course_access ca ON c.id = ca.course_id
      WHERE c.id = $1 AND c.is_deleted = FALSE AND ca.freelancer_id = $2 AND ca.can_access = TRUE
    `;
    const { rows } = await pool.query(query, [courseId, freelancer_id]);
    
    if (rows.length === 0) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    return res.status(200).json({ success: true, course: rows[0] });
  } catch (error) {
    console.error("Error fetching course:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { title, description, price, category_id, title_ar, description_ar } = req.body;

    if (!title || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        error: "Title, description, and price are required",
      });
    }

    const insertQuery = `
      INSERT INTO courses (title, description, price, category_id, title_ar, description_ar, is_deleted)
      VALUES ($1, $2, $3, $4, $5, $6, FALSE)
      RETURNING *;
    `;
    const { rows } = await pool.query(insertQuery, [
      title,
      description,
      price,
      category_id,
      title_ar || null,
      description_ar || null,
    ]);
    return res.status(201).json({ success: true, course: rows[0] });
  } catch (error) {
    console.error("Error creating course:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Update course (Admin)
export const updateCourse = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const { title, description, price, category_id, title_ar, description_ar } = req.body;

    if (isNaN(courseId)) {
      return res.status(400).json({ success: false, error: "Invalid course ID" });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramCount++}`);
      values.push(price);
    }
    if (category_id !== undefined) {
      updates.push(`category_id = $${paramCount++}`);
      values.push(category_id);
    }
    if (title_ar !== undefined) {
      updates.push(`title_ar = $${paramCount++}`);
      values.push(title_ar);
    }
    if (description_ar !== undefined) {
      updates.push(`description_ar = $${paramCount++}`);
      values.push(description_ar);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: "No fields to update" });
    }

    values.push(courseId);

    const updateQuery = `
      UPDATE courses
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount} AND is_deleted = FALSE
      RETURNING *;
    `;
    const { rows } = await pool.query(updateQuery, values);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    return res.status(200).json({ success: true, course: rows[0] });
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Soft delete course (Admin)
export const deleteCourse = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ success: false, error: "Invalid course ID" });
    }

    const deleteQuery = `
      UPDATE courses
      SET is_deleted = TRUE
      WHERE id = $1 AND is_deleted = FALSE
      RETURNING *;
    `;
    const { rows } = await pool.query(deleteQuery, [courseId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Course not found or already deleted" });
    }

    return res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/* -------------------- Admin Enroll Freelancers -------------------- */
export const adminEnrollFreelancer = async (req, res) => {
  try {
    const { freelancer_id, course_id } = req.body;
    if (!freelancer_id || !course_id)
      return res.status(400).json({ success: false, message: "freelancer_id and course_id are required" });

    // Check if freelancer has ACCESS to this course
    const accessCheck = await pool.query(
      "SELECT can_access FROM course_access WHERE freelancer_id = $1 AND course_id = $2",
      [freelancer_id, course_id]
    );
    
    if (accessCheck.rows.length === 0 || !accessCheck.rows[0].can_access) {
      return res.status(403).json({ 
        success: false, 
        message: "Freelancer does not have access to this course" 
      });
    }

    // Check course exists
    const courseCheck = await pool.query("SELECT title FROM courses WHERE id = $1 AND is_deleted = FALSE", [course_id]);
    if (courseCheck.rows.length === 0)
      return res.status(404).json({ success: false, message: "Course not found" });
    const courseTitle = courseCheck.rows[0].title;

    // Check duplicate enrollment
    const exists = await pool.query(
      "SELECT * FROM course_enrollments WHERE freelancer_id = $1 AND course_id = $2",
      [freelancer_id, course_id]
    );
    if (exists.rows.length > 0)
      return res.status(409).json({ success: false, message: "Already enrolled" });

    // Enroll
    const result = await pool.query(
      "INSERT INTO course_enrollments (freelancer_id, course_id, progress) VALUES ($1, $2, 0) RETURNING *",
      [freelancer_id, course_id]
    );
    const newEnrollment = result.rows[0];

    try {
      await NotificationCreators.courseEnrolled(freelancer_id, course_id, courseTitle);
    } catch (notificationError) {
      console.error(`Failed to create course enrollment notification for freelancer ${freelancer_id}:`, notificationError);
    }

    return res.status(201).json({ 
      success: true, 
      message: "Freelancer enrolled successfully", 
      enrollment: newEnrollment
    });
  } catch (error) {
    console.error("Admin enrollment error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getFreelancerAccessibleCourses = async (req, res) => {
  try {
    const freelancer_id = req.token.userId;

    // Get courses that freelancer has access to (through access control)
    const query = `
      SELECT DISTINCT
        c.id, 
        c.title, 
        c.description, 
        c.price, 
        c.created_at,
        COALESCE(ca.can_access, FALSE) as has_access
      FROM courses c
      LEFT JOIN course_access ca ON c.id = ca.course_id AND ca.freelancer_id = $1
      WHERE 
        c.is_deleted = FALSE 
        AND COALESCE(ca.can_access, FALSE) = TRUE
      ORDER BY c.created_at DESC
    `;
    
    const { rows } = await pool.query(query, [freelancer_id]);
    return res.status(200).json({ success: true, courses: rows });
  } catch (error) {
    console.error("Error fetching accessible courses:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Check if freelancer has access to specific course
export const checkCourseAccess = async (req, res) => {
  try {
    const { id: course_id } = req.params;
    const freelancer_id = req.token.userId;

    const courseQuery = `
      SELECT id FROM courses WHERE id = $1 AND is_deleted = FALSE
    `;
    const courseResult = await pool.query(courseQuery, [course_id]);
    
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const accessQuery = `
      SELECT can_access 
      FROM course_access 
      WHERE freelancer_id = $1 AND course_id = $2
    `;
    const accessResult = await pool.query(accessQuery, [freelancer_id, course_id]);
    
    const hasAccess = accessResult.rows.length > 0 && accessResult.rows[0].can_access;

    return res.status(200).json({ 
      success: true, 
      hasAccess,
      course_id: parseInt(course_id)
    });
  } catch (error) {
    console.error("Error checking course access:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMyCourses = async (req, res) => {
  try {
    const freelancer_id = req.token.userId;

    const query = `
      SELECT 
        c.id, c.title, c.description, c.price, c.created_at,
        ce.progress,
        ce.status
      FROM course_enrollments ce
      INNER JOIN courses c ON ce.course_id = c.id
      INNER JOIN course_access ca ON c.id = ca.course_id AND ca.freelancer_id = $1
      WHERE 
        ce.freelancer_id = $1 
        AND c.is_deleted = FALSE
        AND ca.can_access = TRUE
      ORDER BY ce.enrolled_at DESC
    `;
    const { rows } = await pool.query(query, [freelancer_id]);
    return res.status(200).json({ success: true, courses: rows });
  } catch (error) {
    console.error("Error fetching my courses:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- Materials -------------------- */
export const getCourseMaterials = async (req, res) => {
  try {
    const { id: course_id } = req.params;
    const freelancer_id = req.token.userId;
    const userRole = req.token.roleId;

    if (userRole === 1) {
      const query = `SELECT id, title, file_url, file_type, created_at FROM course_materials WHERE course_id = $1 ORDER BY created_at DESC`;
      const { rows } = await pool.query(query, [course_id]);
      return res.status(200).json({ success: true, materials: rows });
    }

    // Check if freelancer has access to this course
    const accessQuery = `
      SELECT 1 FROM course_access 
      WHERE freelancer_id = $1 AND course_id = $2 AND can_access = TRUE
    `;
    const accessResult = await pool.query(accessQuery, [freelancer_id, course_id]);
    
    if (accessResult.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const query = `SELECT id, title, file_url, file_type, created_at FROM course_materials WHERE course_id = $1 ORDER BY created_at DESC`;
    const { rows } = await pool.query(query, [course_id]);
    return res.status(200).json({ success: true, materials: rows });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return res.status(500).json({ success: false, message: "Error fetching materials" });
  }
};