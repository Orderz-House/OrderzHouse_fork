import express from "express";
import pool from "../models/db.js";

const router = express.Router();

//
// === TASK CRUD ===
//

// Create task
router.post("/", async (req, res) => {
  const { freelancerId, title, description, price } = req.body;

  if (!freelancerId || !title || !description || !price) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (freelancer_id, title, description, price) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [freelancerId, title, description, price]
    );
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all tasks for a freelancer
router.get("/freelancer/:freelancerId", async (req, res) => {
  const { freelancerId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE freelancer_id = $1 ORDER BY id DESC",
      [freelancerId]
    );
    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get task pool
router.get("/pool/:freelancerId", async (req, res) => {
  const { freelancerId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE freelancer_id != $1 ORDER BY id DESC",
      [freelancerId]
    );
    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("Error fetching task pool:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update a task
router.put("/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { freelancerId, title, description, price } = req.body;

  try {
    const check = await pool.query(
      "SELECT * FROM tasks WHERE id = $1 AND freelancer_id = $2",
      [taskId, freelancerId]
    );
    if (check.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Not authorized or task not found" });
    }

    const result = await pool.query(
      `UPDATE tasks 
       SET title = $1, description = $2, price = $3 
       WHERE id = $4 RETURNING *`,
      [title, description, price, taskId]
    );
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete a task
router.delete("/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { freelancerId } = req.body;

  try {
    const check = await pool.query(
      "SELECT * FROM tasks WHERE id = $1 AND freelancer_id = $2",
      [taskId, freelancerId]
    );
    if (check.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Not authorized or task not found" });
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [taskId]);
    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//
// === TASK REQUESTS ===
//

// Client requests a task
router.post("/request/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { clientId } = req.body;

  if (!clientId) {
    return res.status(400).json({ success: false, message: "Client ID required" });
  }

  try {
    // Find freelancer who owns this task
    const task = await pool.query("SELECT freelancer_id FROM tasks WHERE id = $1", [taskId]);
    if (task.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    const freelancerId = task.rows[0].freelancer_id;

    const result = await pool.query(
      "INSERT INTO tasks_req (task_id, client_id, freelancer_id) VALUES ($1, $2, $3) RETURNING *",
      [taskId, clientId, freelancerId]
    );

    res.json({ success: true, request: result.rows[0] });
  } catch (err) {
    console.error("Error requesting task:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all requests for a freelancer's tasks
router.get("/requests/freelancer/:freelancerId", async (req, res) => {
  const { freelancerId } = req.params;

  try {
    const result = await pool.query(
      `SELECT tr.*, t.title AS task_title, u.username AS client_username
       FROM tasks_req tr
       JOIN tasks t ON tr.task_id = t.id
       JOIN users u ON tr.client_id = u.id
       WHERE tr.freelancer_id = $1
       ORDER BY tr.requested_at DESC`,
      [freelancerId]
    );

    res.json({ success: true, requests: result.rows });
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
