import pool from "../models/db.js";

/**
 * Get all tasks created by the logged-in freelancer
 */
export const getFreelancerTasks = async (req, res) => {
  try {
    const userId = req.token?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { rows } = await pool.query(
      `
      SELECT 
        t.id, t.title, t.description, t.price, t.status,
        t.duration_days, t.duration_hours, t.created_at,
        u.first_name || ' ' || u.last_name AS freelancer_name,
        u.profile_pic_url AS freelancer_avatar
      FROM tasks t
      JOIN users u ON t.freelancer_id = u.id
      WHERE t.freelancer_id = $1
      ORDER BY t.id DESC
      `,
      [userId]
    );

    res.json({ success: true, tasks: rows });
  } catch (err) {
    console.error("❌ getFreelancerTasks error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get the public task pool (tasks from other freelancers)
 */
export const getTaskPool = async (req, res) => {
  try {
    const userId = req.token?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { rows } = await pool.query(
      `
      SELECT 
        t.id, t.title, t.description, t.price, t.status,
        t.duration_days, t.duration_hours, t.created_at,
        u.first_name || ' ' || u.last_name AS freelancer_name,
        u.profile_pic_url AS freelancer_avatar
      FROM tasks t
      JOIN users u ON t.freelancer_id = u.id
      WHERE t.freelancer_id <> $1
      AND t.status = 'active'
      ORDER BY t.id DESC
      `,
      [userId]
    );

    res.json({ success: true, tasks: rows });
  } catch (err) {
    console.error("❌ getTaskPool error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Create a new task by the logged-in freelancer
 */
export const createTask = async (req, res) => {
  try {
    const userId = req.token?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      title,
      description,
      price,
      duration_days = 0,
      duration_hours = 0,
    } = req.body;

    const { rows } = await pool.query(
      `
      INSERT INTO tasks (title, description, price, freelancer_id, duration_days, duration_hours)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, title, description, price, duration_days, duration_hours, status, created_at
      `,
      [title, description, price, userId, duration_days, duration_hours]
    );

    res.json({ success: true, task: rows[0] });
  } catch (err) {
    console.error("❌ createTask error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Update a freelancer's task
 */
export const updateTask = async (req, res) => {
  try {
    const userId = req.token?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const {
      title,
      description,
      price,
      duration_days,
      duration_hours,
      status,
    } = req.body;

    const { rows } = await pool.query(
      `
      UPDATE tasks
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        duration_days = COALESCE($4, duration_days),
        duration_hours = COALESCE($5, duration_hours),
        status = COALESCE($6, status)
      WHERE id = $7 AND freelancer_id = $8
      RETURNING *
      `,
      [
        title,
        description,
        price,
        duration_days,
        duration_hours,
        status,
        id,
        userId,
      ]
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found or unauthorized" });
    }

    res.json({ success: true, task: rows[0] });
  } catch (err) {
    console.error("❌ updateTask error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Delete a freelancer's task
 */
export const deleteTask = async (req, res) => {
  try {
    const userId = req.token?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;

    const { rows } = await pool.query(
      `DELETE FROM tasks WHERE id = $1 AND freelancer_id = $2 RETURNING id`,
      [id, userId]
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found or unauthorized" });
    }

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    console.error("❌ deleteTask error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
