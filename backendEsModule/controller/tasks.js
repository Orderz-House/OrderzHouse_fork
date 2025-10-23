// controller/tasks.js
import pool from "../models/db.js";
import { NotificationCreators } from "../services/notificationService.js";
import cloudinary from "../cloudinary/setupfile.js";
import { Readable } from "stream";


const uploadFilesToCloudinary = async (files, folder) => {
  const uploadedFiles = [];
  for (const file of files) {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
    uploadedFiles.push({
      url: result.secure_url,
      public_id: result.public_id,
      name: file.originalname,
      size: file.size,
    });
  }
  return uploadedFiles;
};

const insertFileRecords = async (files, taskIdOrReqId, senderId) => {
  for (const fileData of files) {
    await pool.query(
      `INSERT INTO task_files (task_id, sender_id, file_name, file_url, file_size, public_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [taskIdOrReqId, senderId, fileData.name, fileData.url, fileData.size, fileData.public_id]
    );
  }
};

/* =================================================================
   ADMIN CONTROLLERS
================================================================= */

export const getAllTasksForAdmin = async (req, res) => {
  try {
    if (req.token?.role !== 1)
      return res.status(403).json({ success: false, message: "Access denied. Admins only." });

    const result = await pool.query(
      `SELECT t.*,
              u1.first_name || ' ' || u1.last_name AS freelancer_name,
              u2.first_name || ' ' || u2.last_name AS client_name,
              c.name AS category_name
         FROM tasks t
    LEFT JOIN users u1 ON t.freelancer_id = u1.id
    LEFT JOIN users u2 ON t.assigned_client_id = u2.id
    LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.is_deleted = FALSE
     ORDER BY t.id DESC`
    );

    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("getAllTasksForAdmin error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Admin: approve or reject freelancer task 
export const approveTaskByAdmin = async (req, res) => {
  try {
    if (req.token?.role !== 1)
      return res.status(403).json({ success: false, message: "Access denied. Admins only." });

    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status. Use 'active' or 'rejected'." });
    }

    const result = await pool.query(
      `UPDATE tasks
          SET status = $1
        WHERE id = $2 AND status = 'pending_approval'
     RETURNING *`,
      [status, id]
    );

    if (!result.rows.length)
      return res.status(404).json({ success: false, message: "Task not found or not pending approval." });

    res.json({ success: true, message: `Task has been ${status}.`, task: result.rows[0] });
  } catch (err) {
    console.error("approveTaskByAdmin error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const confirmPaymentByAdmin = async (req, res) => {
  try {
    if (req.token?.role !== 1)
      return res.status(403).json({ success: false, message: "Access denied. Admins only." });

    const { id } = req.params; 

    const result = await pool.query(
      `UPDATE task_req
          SET status = 'in_progress'
        WHERE id = $1
          AND status = 'pending_payment'
          AND payment_proof_url IS NOT NULL
     RETURNING *`,
      [id]
    );

    if (!result.rows.length)
      return res.status(404).json({
        success: false,
        message: "Request not found, not pending payment, or missing payment proof.",
      });

    res.json({ success: true, message: "Payment confirmed. Work is now in progress.", request: result.rows[0] });
  } catch (err) {
    console.error("confirmPaymentByAdmin error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* =================================================================
   FREELANCER CONTROLLERS
================================================================= */


export const createTask = async (req, res) => {
  try {
    if (req.token?.role !== 3)
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });

    const { title, description, price, category_id, duration_days = 0, duration_hours = 0 } = req.body;
    const freelancerId = req.token.userId;
    const files = req.files || [];
    let attachmentUrls = [];

    if (files.length > 0) {
      const uploadedFiles = await uploadFilesToCloudinary(files, `tasks/initial/${freelancerId}`);
      attachmentUrls = uploadedFiles.map((f) => f.url);
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, price, freelancer_id, category_id, duration_days, duration_hours, attachments, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_approval')
       RETURNING *`,
      [title, description, price, freelancerId, category_id, duration_days, duration_hours, attachmentUrls]
    );

    res.status(201).json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error("createTask error:", err);
    res.status(500).json({ success: false, message: "Server error creating task." });
  }
};

// Freelancer: update task if still pending_approval
export const updateTask = async (req, res) => {
  try {
    if (req.token?.role !== 3)
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });

    const { id } = req.params;
    const { title, description, price, category_id, duration_days, duration_hours } = req.body;
    const freelancerId = req.token.userId;

    const result = await pool.query(
      `UPDATE tasks
          SET title = $1, description = $2, price = $3, category_id = $4, duration_days = $5, duration_hours = $6
        WHERE id = $7 AND freelancer_id = $8 AND is_deleted = FALSE AND status = 'pending_approval'
     RETURNING *`,
      [title, description, price, category_id, duration_days, duration_hours, id, freelancerId]
    );

    if (!result.rows.length)
      return res.status(404).json({ success: false, message: "Task not found, not owned by you, or cannot be edited." });

    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error("updateTask error:", err);
    res.status(500).json({ success: false, message: "Server error updating task." });
  }
};

// Freelancer: delete task if still pending_approval
export const deleteTask = async (req, res) => {
  try {
    if (req.token?.role !== 3)
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });

    const { id } = req.params;
    const freelancerId = req.token.userId;

    const result = await pool.query(
      `UPDATE tasks
          SET is_deleted = TRUE
        WHERE id = $1 AND freelancer_id = $2 AND status = 'pending_approval'
     RETURNING id`,
      [id, freelancerId]
    );

    if (!result.rows.length)
      return res.status(404).json({ success: false, message: "Task not found, not owned by you, or cannot be deleted." });

    res.json({ success: true, message: "Task deleted successfully." });
  } catch (err) {
    console.error("deleteTask error:", err);
    res.status(500).json({ success: false, message: "Server error deleting task." });
  }
};

// Freelancer: accept or reject a client's request
export const updateTaskRequestStatus = async (req, res) => {
  try {
    if (req.token?.role !== 3)
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });

    const { requestId } = req.params;
    const { status } = req.body;
    const freelancerId = req.token.userId;

    if (!["pending_payment", "rejected"].includes(status))
      return res.status(400).json({ success: false, message: "Invalid status. Use 'pending_payment' or 'rejected'." });

    // ensure the request belongs to a task owned by this freelancer and still pending_approval
    const reqCheck = await pool.query(
      `SELECT tr.id, tr.task_id, tr.client_id, t.freelancer_id
         FROM task_req tr
         JOIN tasks t ON tr.task_id = t.id
        WHERE tr.id = $1 AND t.freelancer_id = $2 AND tr.status = 'pending_approval'`,
      [requestId, freelancerId]
    );
    if (!reqCheck.rows.length)
      return res.status(404).json({ success: false, message: "Request not found or not pending approval." });

    const { task_id, client_id } = reqCheck.rows[0];

    const reqResult = await pool.query(
      `UPDATE task_req
          SET status = $1
        WHERE id = $2 AND status = 'pending_approval'
     RETURNING *`,
      [status, requestId]
    );

    if (status === "pending_payment") {
      await pool.query(
        `UPDATE tasks SET assigned_client_id = $1 WHERE id = $2 AND assigned_client_id IS NULL`,
        [client_id, task_id]
      );
    }

    res.json({ success: true, message: `Request has been ${status}.` });
  } catch (err) {
    console.error("updateTaskRequestStatus error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Freelancer: submit delivery 
export const submitWorkCompletion = async (req, res) => {
  try {
    if (req.token?.role !== 3)
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });

    const { id: requestId } = req.params; 
    const freelancerId = req.token.userId;
    const files = req.files || [];

    if (files.length === 0)
      return res.status(400).json({ success: false, message: "Work submission requires at least one file." });

    // ensure this request belongs to this freelancer and is in_progress
    const check = await pool.query(
      `SELECT tr.id
         FROM task_req tr
         JOIN tasks t ON tr.task_id = t.id
        WHERE tr.id = $1 AND t.freelancer_id = $2 AND tr.status = 'in_progress'`,
      [requestId, freelancerId]
    );
    if (!check.rows.length)
      return res.status(404).json({ success: false, message: "Request not found, not yours, or not in progress." });

    const uploadedFiles = await uploadFilesToCloudinary(files, `tasks/${requestId}/delivery`);
    await insertFileRecords(uploadedFiles, requestId, freelancerId);

    const upd = await pool.query(
      `UPDATE task_req SET status = 'pending_review' WHERE id = $1 RETURNING *`,
      [requestId]
    );

    res.json({ success: true, message: "Work submitted for review.", request: upd.rows[0] });
  } catch (err) {
    console.error("submitWorkCompletion error:", err);
    res.status(500).json({ success: false, message: "Server error submitting work." });
  }
};

// Freelancer: resubmit after client requested revisions
export const resubmitWorkCompletion = async (req, res) => {
  try {
    if (req.token?.role !== 3)
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });

    const { id: requestId } = req.params; 
    const freelancerId = req.token.userId;
    const files = req.files || [];

    if (files.length === 0)
      return res.status(400).json({ success: false, message: "Work resubmission requires at least one file." });

    const check = await pool.query(
      `SELECT tr.id
         FROM task_req tr
         JOIN tasks t ON tr.task_id = t.id
        WHERE tr.id = $1 AND t.freelancer_id = $2 AND tr.status = 'reviewing'`,
      [requestId, freelancerId]
    );
    if (!check.rows.length)
      return res.status(404).json({ success: false, message: "Request not found, not yours, or not in reviewing." });

    const uploadedFiles = await uploadFilesToCloudinary(files, `tasks/${requestId}/resubmission`);
    await insertFileRecords(uploadedFiles, requestId, freelancerId);

    const upd = await pool.query(
      `UPDATE task_req SET status = 'pending_review' WHERE id = $1 RETURNING *`,
      [requestId]
    );

    res.json({ success: true, message: "Work has been resubmitted for review.", request: upd.rows[0] });
  } catch (err) {
    console.error("resubmitWorkCompletion error:", err);
    res.status(500).json({ success: false, message: "Server error resubmitting work." });
  }
};

export const updateTaskKanbanStatus = async (req, res) => {
  try {
    if (req.token?.role !== 3)
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });

    const { id } = req.params;
    const { status } = req.body;
    const freelancerId = req.token.userId;

    const validStatuses = ["todo", "in_progress", "review", "done"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: "Invalid Kanban status." });

    const result = await pool.query(
      `UPDATE tasks
          SET kanban_status = $1
        WHERE id = $2 AND freelancer_id = $3
     RETURNING *`,
      [status, id, freelancerId]
    );

    if (!result.rows.length)
      return res.status(404).json({ success: false, message: "Task not found or not owned by you." });

    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error("updateTaskKanbanStatus error:", err);
    res.status(500).json({ success: false, message: "Server error updating Kanban status." });
  }
};

/* =================================================================
   CLIENT CONTROLLERS
================================================================= */

// Client: request a task 
export const requestTask = async (req, res) => {
  try {
    if (req.token?.role !== 2)
      return res.status(403).json({ success: false, message: "Access denied. Clients only." });

    const { id: taskId } = req.params; 
    const clientId = req.token.userId;
    const { message } = req.body;
    const files = req.files || [];

    const taskRes = await pool.query(
      `SELECT freelancer_id FROM tasks WHERE id = $1 AND is_deleted = FALSE AND status = 'active'`,
      [taskId]
    );
    if (!taskRes.rows.length)
      return res.status(400).json({ success: false, message: "This task is not available for request." });

    const existing = await pool.query(
      `SELECT id FROM task_req WHERE task_id = $1 AND client_id = $2 AND status IN ('pending_approval','pending_payment','in_progress','pending_review','reviewing')`,
      [taskId, clientId]
    );
    if (existing.rows.length)
      return res.status(409).json({ success: false, message: "You already have an active request for this task." });

    let attachmentUrls = [];
    if (files.length > 0) {
      const uploadedFiles = await uploadFilesToCloudinary(files, `tasks/${taskId}/request`);
      attachmentUrls = uploadedFiles.map((f) => f.url);
    }

    const reqResult = await pool.query(
      `INSERT INTO task_req (task_id, client_id, message, attachments, status)
       VALUES ($1, $2, $3, $4, 'pending_approval')
       RETURNING id`,
      [taskId, clientId, message, attachmentUrls]
    );

    res.status(201).json({ success: true, message: "Task requested successfully.", requestId: reqResult.rows[0].id });
  } catch (err) {
    console.error("requestTask error:", err);
    res.status(500).json({ success: false, message: "Server error requesting task." });
  }
};

// Client: submit payment proof 
export const submitPaymentProof = async (req, res) => {
  try {
    if (req.token?.role !== 2)
      return res.status(403).json({ success: false, message: "Access denied. Clients only." });

    const { id: taskId } = req.params; 
    const clientId = req.token.userId;

    if (!req.file)
      return res.status(400).json({ success: false, message: "Payment proof file is required." });

    const request = await pool.query(
      `SELECT id FROM task_req
        WHERE task_id = $1 AND client_id = $2 AND status = 'pending_payment'
        ORDER BY id DESC
        LIMIT 1`,
      [taskId, clientId]
    );
    if (!request.rows.length)
      return res.status(404).json({ success: false, message: "No pending payment request found for this task." });

    const reqId = request.rows[0].id;

    const uploaded = await uploadFilesToCloudinary([req.file], `payment_proofs/${reqId}`);
    const paymentProofUrl = uploaded[0].url;

    await pool.query(
      `UPDATE task_req SET payment_proof_url = $1 WHERE id = $2`,
      [paymentProofUrl, reqId]
    );

    res.json({ success: true, message: "Payment proof submitted successfully. Waiting for admin confirmation." });
  } catch (err) {
    console.error("submitPaymentProof error:", err);
    res.status(500).json({ success: false, message: "Server error submitting payment proof." });
  }
};

// Client: approve or request revisions 
export const approveWorkCompletion = async (req, res) => {
  try {
    if (req.token?.role !== 2)
      return res.status(403).json({ success: false, message: "Access denied. Clients only." });

    const { id: requestId } = req.params; 
    const { action } = req.body;
    const clientId = req.token.userId;
    const files = req.files || [];

    if (!["completed", "reviewing"].includes(action))
      return res.status(400).json({ success: false, message: "Invalid action." });

    const check = await pool.query(
      `SELECT id FROM task_req
        WHERE id = $1 AND client_id = $2 AND status = 'pending_review'`,
      [requestId, clientId]
    );
    if (!check.rows.length)
      return res.status(404).json({ success: false, message: "Request not found, not assigned to you, or not in review." });

    if (action === "reviewing" && files.length > 0) {
      const uploadedFiles = await uploadFilesToCloudinary(files, `tasks/${requestId}/revisions`);
      await insertFileRecords(uploadedFiles, requestId, clientId);
    }

    const finalUpdate =
      action === "completed" ? ", completed_at = NOW()" : "";

    const upd = await pool.query(
      `UPDATE task_req
          SET status = $1 ${finalUpdate}
        WHERE id = $2
     RETURNING *`,
      [action, requestId]
    );

    res.json({ success: true, message: `Work has been ${action}.`, request: upd.rows[0] });
  } catch (err) {
    console.error("approveWorkCompletion error:", err);
    res.status(500).json({ success: false, message: "Server error approving work." });
  }
};

// Client: create review on completed request 
export const createReview = async (req, res) => {
  try {
    if (req.token?.role !== 2)
      return res.status(403).json({ success: false, message: "Access denied. Clients only." });

    const { id: taskId } = req.params;
    const clientId = req.token.userId;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be a number between 1 and 5." });
    }

    const check = await pool.query(
      `SELECT tr.id, t.freelancer_id
         FROM task_req tr
         JOIN tasks t ON tr.task_id = t.id
        WHERE tr.task_id = $1 AND tr.client_id = $2 AND tr.status = 'completed'
        ORDER BY tr.id DESC
        LIMIT 1`,
      [taskId, clientId]
    );
    if (!check.rows.length)
      return res.status(403).json({ success: false, message: "You can only review your own completed tasks." });

    const { id: reqId, freelancer_id } = check.rows[0];

    const reviewResult = await pool.query(
      `INSERT INTO ratings (task_id, client_id, freelancer_id, rating, comment, request_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [taskId, clientId, freelancer_id, rating, comment, reqId]
    );

    await pool.query(
      `UPDATE users SET rating_sum = rating_sum + $1, rating_count = rating_count + 1 WHERE id = $2`,
      [rating, freelancer_id]
    );

    res.status(201).json({ success: true, message: "Review submitted successfully.", review: reviewResult.rows[0] });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(404).json({ success: false, message: "Associated task or user not found." });
    }
    if (err.code === "23505") {
      return res.status(409).json({ success: false, message: "You have already reviewed this task." });
    }
    console.error("createReview error:", err);
    res.status(500).json({ success: false, message: "Server error submitting review." });
  }
};

/* =================================================================
   PUBLIC & SHARED CONTROLLERS
================================================================= */

// Public: task pool
export const getTaskPool = async (req, res) => {
  try {
    const { category } = req.query;

    let query = `
      SELECT t.id, t.title, t.description, t.price, t.duration_days, t.duration_hours,
             u.first_name || ' ' || u.last_name AS freelancer_name,
             u.profile_pic_url AS freelancer_avatar,
             c.name AS category_name
        FROM tasks t
        JOIN users u ON t.freelancer_id = u.id
   LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.is_deleted = FALSE
         AND t.status = 'active'
         AND t.assigned_client_id IS NULL
    `;
    const params = [];

    if (category) {
      query += ` AND t.category_id = $${params.length + 1}`;
      params.push(parseInt(category));
    }

    query += ` ORDER BY t.id DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("getTaskPool error:", err);
    res.status(500).json({ success: false, message: "Server error fetching task pool." });
  }
};

// Public: single task details
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT t.*, u.first_name || ' ' || u.last_name AS freelancer_name, c.name AS category_name
         FROM tasks t
         JOIN users u ON t.freelancer_id = u.id
    LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.id = $1 AND t.is_deleted = FALSE`,
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error("getTaskById error:", err);
    res.status(500).json({ success: false, message: "Server error fetching task." });
  }
};

// Public: categories
export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, parent_id, level
         FROM categories
        WHERE is_deleted = FALSE
     ORDER BY level, name`
    );
    res.json({ success: true, categories: result.rows });
  } catch (err) {
    console.error("getCategories error:", err);
    res.status(500).json({ success: false, message: "Server error fetching categories." });
  }
};

// Shared: add files during lifecycle 
export const addTaskFiles = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { id: requestId } = req.params; // task_req id
    const files = req.files || [];

    if (!files.length) {
      return res.status(400).json({ success: false, message: "No files uploaded." });
    }

    const tr = await pool.query(
      `SELECT tr.id, t.freelancer_id, tr.client_id, tr.status
         FROM task_req tr
         JOIN tasks t ON tr.task_id = t.id
        WHERE tr.id = $1`,
      [requestId]
    );
    if (!tr.rows.length) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    const { freelancer_id, client_id, status } = tr.rows[0];
    if (userId !== freelancer_id && userId !== client_id) {
      return res.status(403).json({ success: false, message: "You are not part of this request." });
    }

    if (!["in_progress", "reviewing"].includes(status)) {
      return res.status(400).json({ success: false, message: "Request is not in a state to add files." });
    }

    const uploadedFiles = await uploadFilesToCloudinary(files, `tasks/${requestId}/shared`);
    await insertFileRecords(uploadedFiles, requestId, userId);

    res.json({ success: true, message: "Files added successfully.", files: uploadedFiles });
  } catch (err) {
    console.error("addTaskFiles error:", err);
    res.status(500).json({ success: false, message: "File upload failed." });
  }
};

/* =================================================================
   LISTS FOR USERS
================================================================= */

// Freelancer: tasks created by me 
export const getFreelancerCreatedTasks = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    }
    const freelancerId = req.token.userId;
    const result = await pool.query(
      `SELECT * FROM tasks WHERE freelancer_id = $1 AND is_deleted = FALSE ORDER BY id DESC`,
      [freelancerId]
    );
    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("getFreelancerCreatedTasks error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Freelancer: requests sent to my tasks and still pending_approval
export const getTaskRequests = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    }
    const freelancerId = req.token.userId;
    const result = await pool.query(
      `SELECT tr.*, 
              u.first_name || ' ' || u.last_name AS client_name,
              u.profile_pic_url AS client_avatar,
              t.title AS task_title,
              t.price AS task_price
         FROM task_req tr
         JOIN users u ON tr.client_id = u.id
         JOIN tasks t ON tr.task_id = t.id
        WHERE t.freelancer_id = $1
          AND tr.status = 'pending_approval'
     ORDER BY tr.requested_at DESC`,
      [freelancerId]
    );
    res.json({ success: true, requests: result.rows });
  } catch (err) {
    console.error("getTaskRequests error:", err);
    res.status(500).json({ success: false, message: "Server error fetching task requests." });
  }
};

// Freelancer: assigned tasks to me 
export const getAssignedTasks = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    }
    const freelancerId = req.token.userId;
    const result = await pool.query(
      `SELECT tr.*, 
              t.title AS task_title,
              t.description AS task_description,
              u.first_name || ' ' || u.last_name AS client_name
         FROM task_req tr
         JOIN tasks t ON tr.task_id = t.id
         JOIN users u ON tr.client_id = u.id
        WHERE t.freelancer_id = $1
          AND tr.status IN ('pending_payment','in_progress','pending_review','reviewing','completed')
     ORDER BY tr.id DESC`,
      [freelancerId]
    );
    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("getAssignedTasks error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};