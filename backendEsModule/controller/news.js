import pool from "../models/db.js";

// Get all approved news (for public)
export const getNews = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM news WHERE is_approved = true ORDER BY created_at DESC"
    );
    res.status(200).json({ success: true, news: result.rows });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// Get single approved news by ID
export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM news WHERE id = $1 AND is_approved = true",
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "News not found or not approved" });
    }
    res.status(200).json({ success: true, news: result.rows[0] });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// Create news (default is_approved = false)
export const createNews = async (req, res) => {
  try {
    const { title, content, image_url, title_ar, content_ar } = req.body;
    const created_by = req.user?.id; // middleware authentication يجب أن يضيف req.user
    if (!created_by) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await pool.query(
      `INSERT INTO news (title, content, image_url, title_ar, content_ar, created_by, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *`,
      [title, content, image_url, title_ar, content_ar, created_by]
    );

    res.status(201).json({ success: true, news: result.rows[0] });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// Update news
export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, image_url, title_ar, content_ar, is_approved } =
      req.body;

    const result = await pool.query(
      `UPDATE news 
       SET title = $1, content = $2, image_url = $3, title_ar = $4, content_ar = $5, 
           is_approved = COALESCE($6, is_approved), updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [title, content, image_url, title_ar, content_ar, is_approved, id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "News not found" });
    }

    res.status(200).json({ success: true, news: result.rows[0] });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// Delete news
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM news WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "News not found" });
    }
    res.status(200).json({ success: true, message: "News deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// Approve news (admin only)
export const approveNews = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE news SET is_approved = true, updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "News not found" });
    }

    res.status(200).json({ success: true, news: result.rows[0] });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
export const SelectNewsisNotApprove = async (req, res) => {
  try {
    const result = await pool.query(
      "select * from news where is_approved=false"
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "News not found" });
    }

    res.status(200).json({ success: true, news: result.rows });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
