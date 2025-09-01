// controller/courses.js
import { pool } from "../models/db.js";

// Get all active courses
export const getCourses = async (req, res) => {
  try {
    const query = `
      SELECT id, title, description, price, created_at
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

// Get course by ID
export const getCourseById = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);

    if (isNaN(courseId)) {
      return res.status(400).json({ success: false, error: "Invalid course ID" });
    }

    const query = `
      SELECT id, title, description, price
      FROM courses
      WHERE id = $1 AND is_deleted = FALSE
    `;
    const { rows } = await pool.query(query, [courseId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    return res.status(200).json({ success: true, course: rows[0] });
  } catch (error) {
    console.error("Error fetching course:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Create new course (admin only)
export const createCourse = async (req, res) => {
  try {
    const { title, description, price, title_ar = null, description_ar = null } = req.body;

    if (!title || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        error: "Title, description, and price are required",
      });
    }

    const insertQuery = `
      INSERT INTO courses (title, description, price, title_ar, description_ar, is_deleted)
      VALUES ($1, $2, $3, $4, $5, FALSE)
      RETURNING *;
    `;

    const { rows } = await pool.query(insertQuery, [title, description, price, title_ar, description_ar]);
    return res.status(201).json({ success: true, course: rows[0] });
  } catch (error) {
    console.error("Error creating course:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Update course (admin only)
export const updateCourse = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const { title, description, price, title_ar, description_ar } = req.body;

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
    if (title_ar !== undefined) {
      updates.push(`title_ar = $${paramCount++}`);
      values.push(title_ar);
    }
    if (description_ar !== undefined) {
      updates.push(`description_ar = $${paramCount++}`);
      values.push(description_ar);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
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

// Delete course (soft delete, admin only)
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

// Enroll in course (all logged-in users)
export const enrollInCourse = async (req, res) => {
  try {
    const freelancer_id = req.token.userId;
    const { course_id } = req.body;

    if (!freelancer_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!course_id) {
      return res.status(400).json({ success: false, message: "course_id is required" });
    }

    const courseCheck = await pool.query(
      "SELECT * FROM courses WHERE id = $1 AND is_deleted = FALSE",
      [course_id]
    );
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const enrollmentCheck = await pool.query(
      "SELECT * FROM course_enrollments WHERE freelancer_id = $1 AND course_id = $2",
      [freelancer_id, course_id]
    );
    if (enrollmentCheck.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Already enrolled" });
    }

    const result = await pool.query(
      "INSERT INTO course_enrollments (freelancer_id, course_id) VALUES ($1, $2) RETURNING *",
      [freelancer_id, course_id]
    );

    return res.status(201).json({
      success: true,
      message: "Enrolled successfully",
      enrollment: result.rows[0],
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get course materials
export const getCourseMaterials = async (req, res) => {
  try {
    const { id: course_id } = req.params;

    const query = `
      SELECT id, title, file_type, file_url, created_at
      FROM course_materials
      WHERE course_id = $1 AND is_deleted = FALSE
      ORDER BY created_at
    `;
    const { rows } = await pool.query(query, [course_id]);

    return res.status(200).json({ success: true, materials: rows });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return res.status(500).json({ success: false, message: "Error fetching materials" });
  }
};

// Check if user is enrolled
export const checkEnrollment = async (req, res) => {
  try {
    const { id: course_id } = req.params;
    const freelancer_id = req.token.userId;

    if (!freelancer_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { rows } = await pool.query(
      "SELECT * FROM course_enrollments WHERE freelancer_id = $1 AND course_id = $2",
      [freelancer_id, course_id]
    );

    return res.status(200).json({ success: true, enrolled: rows.length > 0 });
  } catch (error) {
    console.error("Check enrollment error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};