import pool from "../models/db.js";

// Get tasks of a freelancer
export const getFreelancerTasks = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Forbidden: freelancers only" });
    }

    const freelancerId = req.token.userId;

    const result = await pool.query(
      `SELECT t.id, t.title, t.description, t.price, t.freelancer_id,
              u.first_name || ' ' || u.last_name AS freelancer_name,
              u.profile_pic_url AS freelancer_avatar
       FROM tasks t
       JOIN users u ON t.freelancer_id = u.id
       WHERE t.freelancer_id = $1 AND t.is_deleted = FALSE
       ORDER BY t.id DESC`,
      [freelancerId]
    );

    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("❌ getFreelancerTasks error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get task pool (other freelancers' tasks)
export const getTaskPool = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Forbidden: freelancers only" });
    }

    const freelancerId = req.token.userId;

    const result = await pool.query(
      `SELECT t.id, t.title, t.description, t.price, t.freelancer_id,
              u.first_name || ' ' || u.last_name AS freelancer_name,
              u.profile_pic_url AS freelancer_avatar
       FROM tasks t
       JOIN users u ON t.freelancer_id = u.id
       WHERE t.freelancer_id <> $1 AND t.is_deleted = FALSE
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
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Forbidden: freelancers only" });
    }

    const freelancerId = req.token.userId;
    const { title, description, price, category_id, duration_days, duration_hours } = req.body;

    const result = await pool.query(
      `INSERT INTO tasks (title, description, price, freelancer_id, category_id, duration_days, duration_hours)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, price, freelancerId, category_id, duration_days, duration_hours]
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
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Forbidden: freelancers only" });
    }

    const freelancerId = req.token.userId;
    const { id } = req.params;
    const { title, description, price, category_id, duration_days, duration_hours } = req.body;

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, description = $2, price = $3, category_id = $4, duration_days = $5, duration_hours = $6
       WHERE id = $7 AND freelancer_id = $8 AND is_deleted = FALSE
       RETURNING *`,
      [title, description, price, category_id, duration_days, duration_hours, id, freelancerId]
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

// Soft delete task
export const deleteTask = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Forbidden: freelancers only" });
    }

    const freelancerId = req.token.userId;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE tasks SET is_deleted = TRUE WHERE id = $1 AND freelancer_id = $2 RETURNING id`,
      [id, freelancerId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Task not found or unauthorized" });
    }

    res.json({ success: true, message: "Task deleted (soft delete)" });
  } catch (err) {
    console.error("❌ deleteTask error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// Request a task (client only)
export const requestTask = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { id } = req.params; // Task ID
    const { message, attachments } = req.body; // Optional message & attachments

    if (!id) {
      return res.status(400).json({ success: false, message: "Task ID is required" });
    }

    // Check if user already has a pending request for this task
    const existingRequest = await pool.query(
      `SELECT * FROM tasks_req 
       WHERE task_id = $1 AND client_id = $2 AND status = 'pending'`,
      [id, userId]
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request for this task.",
      });
    }

    // Insert the request record (with message & attachments)
    const result = await pool.query(
      `INSERT INTO tasks_req (task_id, client_id, status, message, attachments)
       VALUES ($1, $2, 'pending', $3, $4)
       RETURNING id, task_id, client_id, status, message, attachments, requested_at`,
      [id, userId, message || null, attachments || null]
    );

    // Increment total_requests for this task
    await pool.query(
      `UPDATE tasks
       SET total_requests = total_requests + 1
       WHERE id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: "Task requested successfully.",
      request: result.rows[0],
    });
  } catch (err) {
    console.error("❌ requestTask error:", err.stack || err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user's requested tasks
export const getUserRequestedTasks = async (req, res) => {
  try {
    const userId = req.token?.userId;

    const result = await pool.query(
      `SELECT 
         tr.id, 
         tr.task_id, 
         t.title, 
         t.description, 
         t.price, 
         t.duration_days,
         t.duration_hours,
         tr.status AS request_status,
         tr.message,
         tr.attachments,
         c.name AS category_name,
         u.username AS freelancer_username,
         u.first_name || ' ' || u.last_name AS freelancer_name,
         u.profile_pic_url AS freelancer_avatar,
         tr.requested_at
       FROM tasks_req tr
       JOIN tasks t ON tr.task_id = t.id
       LEFT JOIN categories c ON t.category_id = c.id
       JOIN users u ON t.freelancer_id = u.id
       WHERE tr.client_id = $1 AND t.is_deleted = FALSE
       ORDER BY tr.requested_at DESC`,
      [userId]
    );

    res.json({ success: true, requests: result.rows });
  } catch (err) {
    console.error("❌ getUserRequestedTasks error:", err.stack || err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Get requests for a specific task (freelancer)
export const getTaskRequests = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Forbidden: freelancers only" });
    }

    const freelancerId = req.token.userId;
    const { id } = req.params; 

    const taskCheck = await pool.query(
      `SELECT id, duration_days, duration_hours FROM tasks WHERE id = $1 AND freelancer_id = $2 AND is_deleted = FALSE`,
      [id, freelancerId]
    );

    if (!taskCheck.rows.length) {
      return res.status(404).json({ success: false, message: "Task not found or unauthorized" });
    }

    const task = taskCheck.rows[0];

    const result = await pool.query(
      `SELECT 
         tr.id, 
         tr.client_id, 
         u.first_name || ' ' || u.last_name AS client_name, 
         u.profile_pic_url AS client_avatar, 
         tr.requested_at,
         tr.status AS request_status,
         tr.message,
         tr.attachments,
         tr.approved_at,
         tr.completed_at,
         CASE 
           WHEN tr.approved_at IS NOT NULL AND tr.completed_at IS NOT NULL 
           THEN ROUND(EXTRACT(EPOCH FROM (tr.completed_at - tr.approved_at)) / 3600, 2)
           ELSE NULL
         END AS duration_hours,
         CASE 
           WHEN tr.approved_at IS NOT NULL AND tr.status = 'accepted'
           THEN ROUND(EXTRACT(EPOCH FROM (tr.approved_at + INTERVAL '1 day' * $2) - NOW()) / 3600, 2)
           ELSE NULL
         END AS remaining_hours
       FROM tasks_req tr
       JOIN users u ON tr.client_id = u.id
       WHERE tr.task_id = $1
       ORDER BY tr.requested_at DESC`,
      [id, task.duration_days]
    );

    res.json({ success: true, requests: result.rows });
  } catch (err) {
    console.error("❌ getTaskRequests error:", err.stack || err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Handle accept or reject of a task request (freelancer only)
export const updateTaskRequestStatus = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Forbidden: freelancers only" });
    }

    const freelancerId = req.token.userId;
    const { requestId } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const requestCheck = await pool.query(
      `SELECT tr.id, tr.task_id 
       FROM tasks_req tr
       JOIN tasks t ON tr.task_id = t.id
       WHERE tr.id = $1 AND t.freelancer_id = $2 AND t.is_deleted = FALSE`,
      [requestId, freelancerId]
    );

    if (!requestCheck.rows.length) {
      return res.status(404).json({ success: false, message: "Request not found or unauthorized" });
    }

    const updates = [];
    const values = [status, requestId];

    if (status === "accepted") {
      updates.push(`approved_at = NOW()`);
    } else if (status === "completed") {
      updates.push(`completed_at = NOW()`);
    }

    const updateSQL = `UPDATE tasks_req SET status = $1${updates.length ? ", " + updates.join(", ") : ""} WHERE id = $2`;

    await pool.query(updateSQL, values);

    res.json({ success: true, message: `Task request ${status}` });
  } catch (err) {
    console.error("❌ updateTaskRequestStatus error:", err.stack || err);
    res.status(500).json({ success: false, message: err.message });
  }
};
