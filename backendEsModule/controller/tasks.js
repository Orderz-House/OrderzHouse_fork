// src/controllers/tasksController.js
import pool from "../models/db.js";

// Get tasks of authenticated freelancer
export const getFreelancerTasks = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Freelancers only" });
    }
    const freelancerId = req.token.userId;
    const result = await pool.query(
      `SELECT t.id, t.title, t.description, t.price, t.freelancer_id,
              u.first_name || ' ' || u.last_name AS freelancer_name,
              u.profile_pic_url AS freelancer_avatar,
              c.name AS category_name
       FROM tasks t
       JOIN users u ON t.freelancer_id = u.id
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.freelancer_id = $1 AND t.is_deleted = FALSE
       ORDER BY t.id DESC`,
      [freelancerId]
    );
    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("❌ getFreelancerTasks:", err);
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
    console.error("❌ getTaskPool:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Freelancers only" });
    }

    const freelancerId = req.token.userId;
    const { title, description, price, category_id, duration_days, duration_hours } = req.body;

    // Insert with status = pending_approval
    const result = await pool.query(
      `INSERT INTO tasks (title, description, price, freelancer_id, category_id, duration_days, duration_hours)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, price, freelancerId, category_id, duration_days, duration_hours, attachments || null]
    );

    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error("❌ createTask:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update task (only if owned by freelancer and status is pending_approval)
export const updateTask = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Freelancers only" });
    }
    const { id } = req.params;
    const { title, description, price, category_id, duration_days, duration_hours, attachments } = req.body;
    const freelancerId = req.token.userId;

    // Only allow updating if status is still pending approval
    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, description = $2, price = $3, category_id = $4, duration_days = $5, duration_hours = $6
       WHERE id = $7 AND freelancer_id = $8 AND is_deleted = FALSE
       RETURNING *`,
      [title, description, price, category_id, duration_days, duration_hours, attachments || null, id, freelancerId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Task not found, not owned by you, or already approved/rejected." });
    }
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error("❌ updateTask:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Soft delete task
export const deleteTask = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Freelancers only" });
    }
    const { id } = req.params;
    const freelancerId = req.token.userId;

    // Only allow deleting if status is still pending approval
    const result = await pool.query(
      `UPDATE tasks SET is_deleted = TRUE WHERE id = $1 AND freelancer_id = $2 AND status = 'pending_approval' RETURNING id`,
      [id, freelancerId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Task not found, not owned by you, or already approved/rejected." });
    }
    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    console.error("❌ deleteTask:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Request a task (client only)
export const requestTask = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const userRole = req.token?.role;
    const { id: taskId } = req.params;
    const { message, attachments } = req.body;

    if (!userId || userRole === 3) {
      return res.status(403).json({ success: false, message: "Clients only" });
    }

    // Check if user already has a pending request for this task
    const existingRequest = await pool.query(
      `SELECT * FROM tasks_req 
       WHERE task_id = $1 AND client_id = $2 AND status = 'pending'`,
      [id, userId]
    );
    if (existing.rows.length) {
      return res.status(400).json({
        success: false,
        message: existing.rows[0].status === 'accepted'
          ? "You already have an accepted request. Please wait for completion."
          : "You already have a pending request for this task."
      });
    }

    // Create request
    const reqResult = await pool.query(
      `INSERT INTO tasks_req (task_id, client_id, message, attachments)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [taskId, userId, message || null, attachments || null]
    );

    // Increment total_requests for this task
    await pool.query(
      `UPDATE tasks
       SET total_requests = total_requests + 1
       WHERE id = $1`,
      [id]
    );

    res.status(201).json({ success: true, requestId: reqResult.rows[0].id });
  } catch (err) {
    console.error("❌ requestTask:", err);
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
      return res.status(403).json({ success: false, message: "Freelancers only" });
    }
    const freelancerId = req.token.userId;

    const result = await pool.query(
      `SELECT tr.id, tr.client_id, tr.message, tr.attachments, tr.requested_at,
              u.first_name || ' ' || u.last_name AS client_name,
              u.profile_pic_url AS client_avatar,
              t.title AS task_title, t.price AS task_price
       FROM tasks_req tr
       JOIN users u ON tr.client_id = u.id
       WHERE tr.task_id = $1
       ORDER BY tr.requested_at DESC`,
      [freelancerId]
    );
    res.json({ success: true, requests: result.rows });
  } catch (err) {
    console.error("❌ getTaskRequests:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Handle accept or reject of a task request (freelancer only)
export const updateTaskRequestStatus = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Freelancers only" });
    }
    const { requestId } = req.params;
    const { status } = req.body;
    const freelancerId = req.token.userId;

    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const requestCheck = await pool.query(
      `SELECT tr.id, tr.task_id 
       FROM tasks_req tr
       JOIN tasks t ON tr.task_id = t.id
       WHERE tr.id = $1 AND t.freelancer_id = $2`,
      [requestId, freelancerId]
    );

    if (!requestCheck.rows.length) {
      return res.status(404).json({ success: false, message: "Request not found or unauthorized" });
    }

    const fields = [`status = $1`];
    const values = [status, requestId];
    if (status === 'accepted') fields.push(`approved_at = NOW()`);
    if (status === 'completed') fields.push(`completed_at = NOW()`);

    const updateSQL = `UPDATE tasks_req SET status = $1${updates.length ? ", " + updates.join(", ") : ""} WHERE id = $2`;

    await pool.query(updateSQL, values);

    res.json({ success: true, message: `Task request ${status}` });
  } catch (err) {
    console.error("❌ updateTaskRequestStatus error:", err.stack || err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get all pending requests for tasks owned by the authenticated freelancer.
 */
export const getTaskRequest = async (req, res) => {
  try {
    const freelancerId = req.token.userId;

    if (!freelancerId) {
      return res.status(401).json({ success: false, message: "Authentication error." });
    }

    const query = `
      SELECT 
        tr.id, 
        tr.task_id,
        tr.message,
        tr.requested_at,
        t.title AS task_title,
        t.price AS task_price,
        client.id AS client_id,
        client.first_name || ' ' || client.last_name AS client_name,
        client.profile_pic_url AS client_avatar
      FROM tasks_req tr
      JOIN tasks t ON tr.task_id = t.id
      JOIN users client ON tr.client_id = client.id
      WHERE t.freelancer_id = $1 AND tr.status = 'pending'
      ORDER BY tr.requested_at DESC;
    `;

    const result = await pool.query(query, [freelancerId]);
    res.status(200).json({ success: true, requests: result.rows });
  } catch (err) {
    console.error("❌ getTaskRequests error:", err);
    res.status(500).json({ success: false, message: "Server error while fetching task requests." });
  }
};