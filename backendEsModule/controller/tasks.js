import pool from "../models/db.js";
import { createNotification } from "./notifications.js"; // Correctly import from the notifications controller

/**
 * Get all tasks created by a specific freelancer.
 */
export const getFreelancerTasks = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const result = await pool.query(
      `SELECT t.*, 
              u.first_name || ' ' || u.last_name AS freelancer_name, 
              u.profile_pic_url AS freelancer_avatar
       FROM tasks t
       JOIN users u ON t.freelancer_id = u.id
       WHERE t.freelancer_id = $1
       ORDER BY t.id DESC`,
      [freelancerId]
    );
    res.status(200).json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("❌ getFreelancerTasks error:", err);
    res.status(500).json({ success: false, message: "Server error while fetching freelancer tasks." });
  }
};

/**
 * Get a pool of tasks from all other freelancers.
 */
export const getTaskPool = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const result = await pool.query(
      `SELECT t.*, 
              u.first_name || ' ' || u.last_name AS freelancer_name, 
              u.profile_pic_url AS freelancer_avatar
       FROM tasks t
       JOIN users u ON t.freelancer_id = u.id
       WHERE t.freelancer_id != $1
       ORDER BY t.id DESC`,
      [freelancerId]
    );
    res.status(200).json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("❌ getTaskPool error:", err);
    res.status(500).json({ success: false, message: "Server error while fetching task pool." });
  }
};

/**
 * Create a new task for the authenticated freelancer.
 */
export const createTask = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const freelancerId = req.token.userId;

    if (!title || !description || !price) {
      return res.status(400).json({ success: false, message: "Title, description, and price are required." });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, price, freelancer_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description, price, freelancerId]
    );

    const userRes = await pool.query("SELECT first_name, last_name, profile_pic_url FROM users WHERE id = $1", [freelancerId]);
    const user = userRes.rows[0];

    const newTask = {
      ...result.rows[0],
      freelancer_name: `${user.first_name} ${user.last_name}`,
      freelancer_avatar: user.profile_pic_url,
    };

    res.status(201).json({ success: true, task: newTask });
  } catch (err) {
    console.error("❌ createTask error:", err);
    res.status(500).json({ success: false, message: "Server error while creating task." });
  }
};

/**
 * Update an existing task owned by the authenticated freelancer.
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price } = req.body;
    const freelancerId = req.token.userId;

    if (!title || !description || !price) {
      return res.status(400).json({ success: false, message: "Title, description, and price are required." });
    }

    const result = await pool.query(
      `UPDATE tasks SET title = $1, description = $2, price = $3 WHERE id = $4 AND freelancer_id = $5 RETURNING *`,
      [title, description, price, id, freelancerId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Task not found or you are not authorized to update it." });
    }
    
    const userRes = await pool.query("SELECT first_name, last_name, profile_pic_url FROM users WHERE id = $1", [freelancerId]);
    const user = userRes.rows[0];

    const updatedTask = {
      ...result.rows[0],
      freelancer_name: `${user.first_name} ${user.last_name}`,
      freelancer_avatar: user.profile_pic_url,
    };

    res.status(200).json({ success: true, task: updatedTask });
  } catch (err) {
    console.error("❌ updateTask error:", err);
    res.status(500).json({ success: false, message: "Server error while updating task." });
  }
};

/**
 * Delete a task owned by the authenticated freelancer.
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const freelancerId = req.token.userId;

    if (!freelancerId) {
      return res.status(401).json({ success: false, message: "Authentication error: User ID not found in token." });
    }

    const result = await pool.query(
      `DELETE FROM tasks WHERE id = $1 AND freelancer_id = $2 RETURNING id`,
      [id, freelancerId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Task not found or you are not authorized to delete it." });
    }

    res.status(200).json({ success: true, message: "Task deleted successfully." });
  } catch (err) {
    console.error("❌ deleteTask error:", err);
    res.status(500).json({ success: false, message: "Server error while deleting task." });
  }
};

/**
 * Allows a client to request a task.
 * This creates a new entry in tasks_req and notifies the freelancer.
 */
export const requestTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { message } = req.body;
    const clientId = req.token.userId;

    const taskOwnerResult = await pool.query(
      `SELECT freelancer_id, title FROM tasks WHERE id = $1`,
      [taskId]
    );

    if (taskOwnerResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }
    const freelancerId = taskOwnerResult.rows[0].freelancer_id;
    const taskTitle = taskOwnerResult.rows[0].title;

    if (freelancerId === clientId) {
      return res.status(403).json({ success: false, message: "You cannot request your own task." });
    }

    const requestResult = await pool.query(
      `INSERT INTO tasks_req (task_id, client_id, status, message) VALUES ($1, $2, 'pending', $3) RETURNING *`,
      [taskId, clientId, message]
    );

    const newRequest = requestResult.rows[0];

    // ✅ This is the critical step that creates the notification
    const notificationMessage = `You have a new request for your task: "${taskTitle}".`;
    await createNotification(
      freelancerId,
      'task_request',
      notificationMessage,
      newRequest.id,
      'task_request'
    );

    res.status(201).json({ success: true, message: "Task requested successfully.", request: newRequest });

  } catch (err) {
    if (err.code === '23505') { // Handles unique constraint violation if user requests the same task twice
        return res.status(409).json({ success: false, message: "You have already requested this task." });
    }
    console.error("❌ requestTask error:", err);
    res.status(500).json({ success: false, message: "Server error while requesting task." });
  }
};

/**
 * Get all pending requests for tasks owned by the authenticated freelancer.
 */
export const getTaskRequests = async (req, res) => {
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

/**
 * Accept a task request.
 */
export const acceptTaskRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const freelancerId = req.token.userId;

    const verificationQuery = `
      SELECT t.freelancer_id FROM tasks_req tr
      JOIN tasks t ON tr.task_id = t.id
      WHERE tr.id = $1;
    `;
    const verificationResult = await pool.query(verificationQuery, [requestId]);

    if (verificationResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }
    if (verificationResult.rows[0].freelancer_id !== freelancerId) {
      return res.status(403).json({ success: false, message: "You are not authorized to accept this request." });
    }

    const result = await pool.query(
      `UPDATE tasks_req SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *;`,
      [requestId]
    );

    res.status(200).json({ success: true, message: "Request accepted.", request: result.rows[0] });
  } catch (err) {
    console.error("❌ acceptTaskRequest error:", err);
    res.status(500).json({ success: false, message: "Server error while accepting request." });
  }
};

/**
 * Decline a task request.
 */
export const declineTaskRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const freelancerId = req.token.userId;

    const verificationQuery = `
      SELECT t.freelancer_id FROM tasks_req tr
      JOIN tasks t ON tr.task_id = t.id
      WHERE tr.id = $1;
    `;
    const verificationResult = await pool.query(verificationQuery, [requestId]);

    if (verificationResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }
    if (verificationResult.rows[0].freelancer_id !== freelancerId) {
      return res.status(403).json({ success: false, message: "You are not authorized to decline this request." });
    }

    const result = await pool.query(
      `UPDATE tasks_req SET status = 'declined' WHERE id = $1 RETURNING *;`,
      [requestId]
    );

    res.status(200).json({ success: true, message: "Request declined.", request: result.rows[0] });
  } catch (err) {
    console.error("❌ declineTaskRequest error:", err);
    res.status(500).json({ success: false, message: "Server error while declining request." });
  }
};
