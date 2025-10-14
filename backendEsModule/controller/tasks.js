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
              t.attachments, t.duration_days, t.duration_hours, t.status,
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

// Get task pool (exclude own tasks, only active)
export const getTaskPool = async (req, res) => {
  try {
    const freelancerId = req.token?.role === 3 ? req.token.userId : null;
    let query = `
      SELECT t.id, t.title, t.description, t.price, t.freelancer_id,
             t.attachments, t.duration_days, t.duration_hours,
             u.first_name || ' ' || u.last_name AS freelancer_name,
             u.profile_pic_url AS freelancer_avatar,
             c.name AS category_name
      FROM tasks t
      JOIN users u ON t.freelancer_id = u.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.is_deleted = FALSE AND t.status = 'active'`; // Only active tasks
    const params = [];

    if (freelancerId) {
      query += ` AND t.freelancer_id <> $1`;
      params.push(freelancerId);
    }

    if (req.query.category) {
      query += params.length ? ` AND t.category_id = $${params.length + 1}` : ` AND t.category_id = $1`;
      params.push(parseInt(req.query.category));
    }

    query += ` ORDER BY t.id DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("❌ getTaskPool:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create task (status defaults to 'pending_approval')
export const createTask = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Freelancers only" });
    }
    const freelancerId = req.token.userId;
    const { title, description, price, category_id, sub_sub_category_id, duration_days, duration_hours, attachments } = req.body;

    // Insert with status = pending_approval
    const result = await pool.query(
      `INSERT INTO tasks (title, description, price, freelancer_id, category_id, duration_days, duration_hours, attachments, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_approval')
       RETURNING *`,
      [title, description, price, freelancerId, category_id, duration_days, duration_hours, attachments || null]
    );

    console.log(`New task ${result.rows[0].id} created by freelancer ${freelancerId}, pending approval.`);

    res.status(201).json({ success: true, task: result.rows[0] });
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
       SET title = $1, description = $2, price = $3, category_id = $4,
           duration_days = $5, duration_hours = $6, attachments = $7
       WHERE id = $8 AND freelancer_id = $9 AND is_deleted = FALSE AND status = 'pending_approval'
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

// Soft delete task (only if owned by freelancer and status is pending_approval)
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

    // Check if task exists and is active
    const taskRes = await pool.query(
      `SELECT freelancer_id, status FROM tasks WHERE id = $1 AND is_deleted = FALSE AND status = 'active'`, // ← Check status
      [taskId]
    );
    if (!taskRes.rows.length) {
      return res.status(400).json({ success: false, message: "Task not found or inactive" });
    }

    if (taskRes.rows[0].freelancer_id === userId) {
      return res.status(400).json({ success: false, message: "Cannot request your own task" });
    }

    // Block if active request exists (pending or accepted)
    const existing = await pool.query(
      `SELECT status FROM tasks_req 
       WHERE task_id = $1 AND client_id = $2 AND status IN ('pending', 'accepted')`,
      [taskId, userId]
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

    // Increment counter
    await pool.query(`UPDATE tasks SET total_requests = total_requests + 1 WHERE id = $1`, [taskId]);

    console.log(`Request ${reqResult.rows[0].id} created by client ${userId} for task ${taskId}.`);

    res.status(201).json({ success: true, requestId: reqResult.rows[0].id });
  } catch (err) {
    console.error("❌ requestTask:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all pending requests for tasks owned by the authenticated freelancer
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
       JOIN tasks t ON tr.task_id = t.id
       WHERE t.freelancer_id = $1 AND tr.status = 'pending' -- Only pending requests
       ORDER BY tr.requested_at DESC`,
      [freelancerId]
    );
    res.json({ success: true, requests: result.rows });
  } catch (err) {
    console.error("❌ getTaskRequests:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update request status (accept/reject/complete) - freelancer only
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

    // Verify ownership of the task associated with the request
    const check = await pool.query(
      `SELECT tr.id FROM tasks_req tr
       JOIN tasks t ON tr.task_id = t.id
       WHERE tr.id = $1 AND t.freelancer_id = $2`,
      [requestId, freelancerId]
    );
    if (!check.rows.length) {
      return res.status(404).json({ success: false, message: "Request not found or not owned by you" });
    }

    const fields = [`status = $1`];
    const values = [status, requestId];
    if (status === 'accepted') fields.push(`approved_at = NOW()`);
    if (status === 'completed') fields.push(`completed_at = NOW()`);

    await pool.query(
      `UPDATE tasks_req SET ${fields.join(', ')} WHERE id = $${values.length}`,
      values
    );
    res.json({ success: true, message: `Request ${status}` });
  } catch (err) {
    console.error("❌ updateTaskRequestStatus:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get categories (for filtering)
export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, parent_id, level FROM categories WHERE is_deleted = FALSE ORDER BY level, name`
    );
    res.json({ success: true, categories: result.rows });
  } catch (err) {
    console.error("❌ getCategories:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin Approval/Rejection
export const adminApproveTask = async (req, res) => {
  try {
    if (req.token?.role !== 1) { // Assuming 1 is admin
      return res.status(403).json({ success: false, message: "Admins only" });
    }

    const { taskId, action } = req.body; // action = 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be 'approve' or 'reject'" });
    }

    const newStatus = action === 'approve' ? 'active' : 'rejected';

    const result = await pool.query(
      `UPDATE tasks SET status = $1 WHERE id = $2 AND status = 'pending_approval' RETURNING *`,
      [newStatus, taskId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Task not found or not pending approval" });
    }

    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error("❌ adminApproveTask:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add Review (Client only, after task completion)
export const addReview = async (req, res) => {
  try {
    const userId = req.token?.userId; // Client ID
    const { taskRequestId, rating, review_text } = req.body;

    if (!userId || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Valid rating (1-5) and user ID required" });
    }

    // Verify the user is the client who requested this task and it's completed
    const reqCheck = await pool.query(
      `SELECT client_id, status, freelancer_id FROM tasks_req WHERE id = $1`,
      [taskRequestId]
    );
    if (!reqCheck.rows.length || reqCheck.rows[0].client_id !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized or request not found" });
    }
    if (reqCheck.rows[0].status !== 'completed') {
      return res.status(400).json({ success: false, message: "Cannot review until task is completed" });
    }

    // Insert review
    const reviewResult = await pool.query(
      `INSERT INTO reviews (task_request_id, client_id, freelancer_id, rating, review_text)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [taskRequestId, userId, reqCheck.rows[0].freelancer_id, rating, review_text]
    );

    res.status(201).json({ success: true, review: reviewResult.rows[0] });
  } catch (err) {
    console.error("❌ addReview:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};