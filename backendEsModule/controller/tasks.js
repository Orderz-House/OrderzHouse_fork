import pool from "../models/db.js";

// Get tasks of a freelancer
export const getFreelancerTasks = async (req, res) => {
  try {
    const { freelancerId } = req.params;

    const result = await pool.query(
      `SELECT t.id, t.title, t.description, t.price, t.freelancer_id,
              u.first_name || ' ' || u.last_name AS freelancer_name,
              u.profile_pic_url AS freelancer_avatar
       FROM tasks t
       JOIN users u ON t.freelancer_id = u.id
       WHERE t.freelancer_id = $1
       ORDER BY t.id DESC`,
      [freelancerId]
    );

    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("❌ getFreelancerTasks error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get task pool (all other freelancers' tasks)
export const getTaskPool = async (req, res) => {
  try {
    const { freelancerId } = req.params;

    const result = await pool.query(
      `SELECT t.id, t.title, t.description, t.price, t.freelancer_id,
              u.first_name || ' ' || u.last_name AS freelancer_name,
              u.profile_pic_url AS freelancer_avatar
       FROM tasks t
       JOIN users u ON t.freelancer_id = u.id
       WHERE t.freelancer_id <> $1
       ORDER BY t.id DESC`,
      [freelancerId]
    );

    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("❌ getTaskPool error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description, price, freelancerId } = req.body;

    const result = await pool.query(
      `INSERT INTO tasks (title, description, price, freelancer_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, price, freelancer_id`,
      [title, description, price, freelancerId]
    );

    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error("❌ createTask error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, freelancerId } = req.body;

    const result = await pool.query(
      `UPDATE tasks 
       SET title = $1, description = $2, price = $3
       WHERE id = $4 AND freelancer_id = $5
       RETURNING *`,
      [title, description, price, id, freelancerId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Task not found or unauthorized" });
    }

    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error("❌ updateTask error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { freelancerId } = req.body;

    const result = await pool.query(
      `DELETE FROM tasks WHERE id = $1 AND freelancer_id = $2 RETURNING id`,
      [id, freelancerId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Task not found or unauthorized" });
    }

    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    console.error("❌ deleteTask error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
