import { pool } from "../models/db.js";

const createCourse = async (req, res) => {
  try {
    const { title, description, price } = req.body;

    // Validation
    if (!title || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        error: "Title, description, and price are required",
      });
    }

    const insertQuery = `
      INSERT INTO courses (title, description, price, is_deleted)
      VALUES ($1, $2, $3, FALSE)
      RETURNING *;
    `;

    const { rows } = await pool.query(insertQuery, [title, description, price]);
    return res.status(201).json({ success: true, course: rows[0] });
  } catch (error) {
    console.error("Error creating course:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const query = `
      SELECT id, title, description, price
      FROM courses
      WHERE is_deleted = FALSE
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query);
    return res.status(200).json({ success: true, courses: rows });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Validate courseId is a number
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID",
      });
    }

    const deleteQuery = `
      UPDATE courses
      SET is_deleted = TRUE
      WHERE id = $1 AND is_deleted = FALSE
      RETURNING *;
    `;

    const { rows } = await pool.query(deleteQuery, [courseId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Course not found or already deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, description, price } = req.body;

    // Validate at least one field is provided
    if (!title && !description && price === undefined) {
      return res.status(400).json({
        success: false,
        error:
          "At least one field (title, description, or price) must be provided",
      });
    }

    // Build dynamic query based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (price !== undefined) {
      updates.push(`price = $${paramCount}`);
      values.push(price);
      paramCount++;
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
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      course: rows[0],
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;

    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID",
      });
    }

    const query = `
      SELECT id, title, description, price
      FROM courses
      WHERE id = $1 AND is_deleted = FALSE
    `;

    const { rows } = await pool.query(query, [courseId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      course: rows[0],
    });
  } catch (error) {
    console.error("Error fetching course:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const enrollInCourse = async (req, res) => {
  try {
    const freelancer_id = req.token?.userId;

    if (!freelancer_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Freelancer ID missing in token",
      });
    }

    const { course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: "course_id is required",
      });
    }

    // Check if course exists
    const courseCheck = await pool.query(
      "SELECT * FROM courses WHERE id = $1 AND is_deleted = FALSE",
      [course_id]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found or unavailable",
      });
    }

    // Check if already enrolled
    const enrollmentCheck = await pool.query(
      "SELECT * FROM course_enrollments WHERE freelancer_id = $1 AND course_id = $2",
      [freelancer_id, course_id]
    );

    if (enrollmentCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    // Enroll the user
    const enrollmentResult = await pool.query(
      `INSERT INTO course_enrollments (freelancer_id, course_id)
       VALUES ($1, $2)
       RETURNING *`,
      [freelancer_id, course_id]
    );

    return res.status(201).json({
      success: true,
      message: "Enrolled successfully",
      enrollment: enrollmentResult.rows[0],
    });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during enrollment",
      error: error.message,
    });
  }
};
export {
  createCourse,
  getCourses,
  deleteCourse,
  updateCourse,
  getCourseById,
  enrollInCourse,
};
