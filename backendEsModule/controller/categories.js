import { pool } from '../models/db.js';

export const getCategories = async (req, res) => {
  try {
    const query = `SELECT id, name, description FROM categories ORDER BY name ASC`;
    const { rows } = await pool.query(query);
    return res.status(200).json({ success: true, categories: rows });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};
 