import pool from "../models/db.js";

// Get all news
export const getNews = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM news ORDER BY created_at DESC");
    res.status(200).json({ success: true, news: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Get single news by ID
export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM news WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "News not found" });
    }
    res.status(200).json({ success: true, news: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Create news
export const createNews = async (req, res) => {
  try {
    const { title, content, image_url, title_ar, content_ar } = req.body;
    const result = await pool.query(
      `INSERT INTO news (title, content, image_url, title_ar, content_ar) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, content, image_url, title_ar, content_ar]
    );
    res.status(201).json({ success: true, news: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Update news
export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, image_url, title_ar, content_ar } = req.body;
    const result = await pool.query(
      `UPDATE news 
       SET title = $1, content = $2, image_url = $3, title_ar = $4, content_ar = $5, updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [title, content, image_url, title_ar, content_ar, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "News not found" });
    }
    res.status(200).json({ success: true, news: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Delete news
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM news WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "News not found" });
    }
    res.status(200).json({ success: true, message: "News deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
