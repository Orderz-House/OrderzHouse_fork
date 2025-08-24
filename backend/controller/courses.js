const pool = require("../models/db");

const createCourse = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const insertQuery = `
      INSERT INTO courses (title, description ,price)
      VALUES ($1, $2 ,$3)
      RETURNING *;
    `;
    const { rows } = await pool.query(insertQuery, [title, description, price]);
    return res.status(201).json({ success: true, course: rows[0] });
  } catch (error) {
    console.error("Error creating course:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
const getCourses = async (req, res) => {
  try {
    const query = `
      SELECT id, title, description ,price
      FROM courses
      WHERE is_deleted = FALSE
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query);
    return res.status(200).json({ success: true, courses: rows });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const deleteQuery = `
      UPDATE courses
      SET is_deleted = TRUE
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(deleteQuery, [courseId]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }
    return res.status(200).json({ success: true, message: "Course deleted" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, description, price } = req.body;
    const updateQuery = `
      UPDATE courses
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price)
      WHERE id = $4
      RETURNING *;
    `;
    const { rows } = await pool.query(updateQuery, [
      title,
      description,
      price,
      courseId,
    ]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }
    return res.status(200).json({ success: true, course: rows[0] });
  } catch (error) {
    console.error("Error updating course:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
const getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    const query = `
      SELECT id, title, description ,price
      FROM courses
      WHERE id = $1 AND is_deleted = FALSE
    `;
    const { rows } = await pool.query(query, [courseId]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }
    return res.status(200).json({ success: true, course: rows[0] });
  } catch (error) {
    console.error("Error fetching course:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

const enrollFreelancer = async (req, res) => {
  try {
    const freelancer_id = req.token.userId;
    const course_id = req.params.course_id;

    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required to enroll",
      });
    }

    const insertQuery = `
      INSERT INTO enrollments (course_id, freelancer_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const { rows } = await pool.query(insertQuery, [course_id, freelancer_id]);

    res.status(201).json({
      success: true,
      message: "Enrolled successfully",
      enrollment: rows[0],
    });
  } catch (error) {
    console.error("Error enrolling freelancer:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  deleteCourse,
  updateCourse,
  getCourseById,
  enrollFreelancer,
};
