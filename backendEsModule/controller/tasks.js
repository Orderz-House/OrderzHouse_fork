// controller/tasks.js
import pool from "../models/db.js";
import { NotificationCreators } from "../services/notificationService.js";
import cloudinary from "../cloudinary/setupfile.js";
import { Readable } from "stream";

// =================================================================
// HELPER FUNCTIONS
// =================================================================

// Helper function to upload files to Cloudinary
const uploadFilesToCloudinary = async (files, folder) => {
  const uploadedFiles = [];
  for (const file of files) {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
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

// Helper function to insert file records into the database
const insertFileRecords = async (files, taskId, senderId) => {
  for (const fileData of files) {
    await pool.query(
      `INSERT INTO task_files (task_id, sender_id, file_name, file_url, file_size, public_id) VALUES ($1, $2, $3, $4, $5, $6)`,
      [taskId, senderId, fileData.name, fileData.url, fileData.size, fileData.public_id]
    );
  }
};


/* =================================================================
   ADMIN CONTROLLERS
   ================================================================= */

// Get all tasks for the admin dashboard
export const getAllTasksForAdmin = async (req, res) => {
  try {
    if (req.token?.role !== 1) return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    
    const result = await pool.query(`
      SELECT t.*, 
             u1.first_name || ' ' || u1.last_name AS freelancer_name,
             u2.first_name || ' ' || u2.last_name AS client_name,
             c.name as category_name
      FROM tasks t
      LEFT JOIN users u1 ON t.freelancer_id = u1.id
      LEFT JOIN users u2 ON t.assigned_client_id = u2.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.is_deleted = FALSE ORDER BY t.id DESC
    `);
    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("❌ getAllTasksForAdmin error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Approve or reject a task submitted by a freelancer
export const approveTaskByAdmin = async (req, res) => {
  try {
    if (req.token?.role !== 1) return res.status(403).json({ success: false, message: "Access denied. Admins only." });

    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status. Use 'approved' or 'rejected'." });
    }

    const result = await pool.query(
      `UPDATE tasks SET status = $1 WHERE id = $2 AND status = 'pending_approval' RETURNING *`,
      [status, id]
    );

    if (!result.rows.length) return res.status(404).json({ success: false, message: "Task not found or not pending approval." });
    
    res.json({ success: true, message: `Task has been ${status}.`, task: result.rows[0] });
  } catch (err) {
    console.error("❌ approveTaskByAdmin error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Confirm that a client's payment has been received
export const confirmPaymentByAdmin = async (req, res) => {
  try {
    if (req.token?.role !== 1) return res.status(403).json({ success: false, message: "Access denied. Admins only." });

    const { id } = req.params;
    const result = await pool.query(
      `UPDATE tasks SET status = 'active' WHERE id = $1 AND status = 'pending_payment' AND payment_proof_url IS NOT NULL RETURNING *`,
      [id]
    );

    if (!result.rows.length) return res.status(404).json({ success: false, message: "Task not found, not pending payment, or no payment proof was submitted." });

    res.json({ success: true, message: "Payment confirmed. Task is now active.", task: result.rows[0] });
  } catch (err) {
    console.error("❌ confirmPaymentByAdmin error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};


/* =================================================================
   FREELANCER CONTROLLERS
   ================================================================= */

// Create a new task with optional file attachments
export const createTask = async (req, res) => {
  try {
    if (req.token?.role !== 3) return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    
    const { title, description, price, category_id, duration_days = 0, duration_hours = 0 } = req.body;
    const freelancerId = req.token.userId;
    const files = req.files || [];

    let attachmentUrls = [];
    if (files.length > 0) {
        const uploadedFiles = await uploadFilesToCloudinary(files, `tasks/initial/${freelancerId}`);
        attachmentUrls = uploadedFiles.map(file => file.url);
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, price, freelancer_id, category_id, duration_days, duration_hours, attachments, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_approval') RETURNING *`,
      [title, description, price, freelancerId, category_id, duration_days, duration_hours, attachmentUrls]
    );
    
    res.status(201).json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error("❌ createTask error:", err);
    res.status(500).json({ success: false, message: "Server error creating task." });
  }
};

// Update a task that is still pending approval
export const updateTask = async (req, res) => {
  try {
    if (req.token?.role !== 3) return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });

    const { id } = req.params;
    const { title, description, price, category_id, duration_days, duration_hours } = req.body;
    const freelancerId = req.token.userId;

    const result = await pool.query(
      `UPDATE tasks SET title = $1, description = $2, price = $3, category_id = $4,
           duration_days = $5, duration_hours = $6
       WHERE id = $7 AND freelancer_id = $8 AND is_deleted = FALSE AND status = 'pending_approval'
       RETURNING *`,
      [title, description, price, category_id, duration_days, duration_hours, id, freelancerId]
    );

    if (!result.rows.length) return res.status(404).json({ success: false, message: "Task not found, not owned by you, or cannot be edited." });
    
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error("❌ updateTask error:", err);
    res.status(500).json({ success: false, message: "Server error updating task." });
  }
};

// Soft delete a task that is still pending approval
export const deleteTask = async (req, res) => {
  try {
    if (req.token?.role !== 3) return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });

    const { id } = req.params;
    const freelancerId = req.token.userId;

    const result = await pool.query(
      `UPDATE tasks SET is_deleted = TRUE WHERE id = $1 AND freelancer_id = $2 AND status = 'pending_approval' RETURNING id`,
      [id, freelancerId]
    );

    if (!result.rows.length) return res.status(404).json({ success: false, message: "Task not found, not owned by you, or cannot be deleted." });
    
    res.json({ success: true, message: "Task deleted successfully." });
  } catch (err) {
    console.error("❌ deleteTask error:", err);
    res.status(500).json({ success: false, message: "Server error deleting task." });
  }
};

// Accept or reject a client's request for a task
export const updateTaskRequestStatus = async (req, res) => {
  try {
    if (req.token?.role !== 3) return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });

    const { requestId } = req.params;
    const { status } = req.body;
    const freelancerId = req.token.userId;

    if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ success: false, message: "Invalid status. Use 'accepted' or 'rejected'." });
    
    const reqResult = await pool.query(`UPDATE tasks_req SET status = $1 WHERE id = $2 AND status = 'pending' RETURNING *`, [status, requestId]);
    if (!reqResult.rows.length) return res.status(404).json({ success: false, message: "Request not found or already handled." });

    const { task_id, client_id } = reqResult.rows[0];

    if (status === 'accepted') {
      const taskUpdateResult = await pool.query(
        `UPDATE tasks SET status = 'pending_payment', assigned_client_id = $1 WHERE id = $2 AND freelancer_id = $3 AND status = 'approved'`,
        [client_id, task_id, freelancerId]
      );
      if (taskUpdateResult.rowCount === 0) return res.status(400).json({ success: false, message: "Task is not available to be assigned." });
    }
    
    res.json({ success: true, message: `Request has been ${status}.` });
  } catch (err) {
    console.error("❌ updateTaskRequestStatus error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Submit work for client review
export const submitWorkCompletion = async (req, res) => {
  try {
    if (req.token?.role !== 3) return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });

    const { id: taskId } = req.params;
    const freelancerId = req.token.userId;
    const files = req.files || [];

    if (files.length === 0) {
        return res.status(400).json({ success: false, message: "Work submission requires at least one file." });
    }

    const taskResult = await pool.query(
      `UPDATE tasks SET status = 'in_review' WHERE id = $1 AND freelancer_id = $2 AND status = 'active' RETURNING *`,
      [taskId, freelancerId]
    );

    if (!taskResult.rows.length) return res.status(404).json({ success: false, message: "Task not found, not yours, or not active." });

    const uploadedFiles = await uploadFilesToCloudinary(files, `tasks/${taskId}/delivery`);
    await insertFileRecords(uploadedFiles, taskId, freelancerId);

    res.json({ success: true, message: "Work submitted for review." });
  } catch (err) {
    console.error("❌ submitWorkCompletion error:", err);
    res.status(500).json({ success: false, message: "Server error submitting work." });
  }
};

// Resubmit work after a client requested revisions
export const resubmitWorkCompletion = async (req, res) => {
  try {
    if (req.token?.role !== 3) return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });

    const { id: taskId } = req.params;
    const freelancerId = req.token.userId;
    const files = req.files || [];

    if (files.length === 0) {
        return res.status(400).json({ success: false, message: "Work resubmission requires at least one file." });
    }

    const taskResult = await pool.query(
      `UPDATE tasks SET status = 'in_review' WHERE id = $1 AND freelancer_id = $2 AND status = 'revision_requested' RETURNING *`,
      [taskId, freelancerId]
    );

    if (!taskResult.rows.length) return res.status(404).json({ success: false, message: "Task not found, not yours, or not in revision status." });

    const uploadedFiles = await uploadFilesToCloudinary(files, `tasks/${taskId}/resubmission`);
    await insertFileRecords(uploadedFiles, taskId, freelancerId);
    
    res.json({ success: true, message: "Work has been resubmitted for review." });
  } catch (err) {
    console.error("❌ resubmitWorkCompletion error:", err);
    res.status(500).json({ success: false, message: "Server error resubmitting work." });
  }
};

// Update the internal Kanban status of a task
export const updateTaskKanbanStatus = async (req, res) => {
  try {
    if (req.token?.role !== 3) return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });

    const { id } = req.params;
    const { status } = req.body;
    const freelancerId = req.token.userId;

    const validStatuses = ['todo', 'in_progress', 'review', 'done'];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: "Invalid Kanban status." });

    const result = await pool.query(
      `UPDATE tasks SET kanban_status = $1 WHERE id = $2 AND freelancer_id = $3 RETURNING *`,
      [status, id, freelancerId]
    );

    if (!result.rows.length) return res.status(404).json({ success: false, message: "Task not found or not owned by you." });

    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error("❌ updateTaskKanbanStatus error:", err);
    res.status(500).json({ success: false, message: "Server error updating Kanban status." });
  }
};


/* =================================================================
   CLIENT CONTROLLERS
   ================================================================= */

// Client requests a task with optional attachments
export const requestTask = async (req, res) => {
  try {
    if (req.token?.role !== 2) return res.status(403).json({ success: false, message: "Access denied. Clients only." });

    const { id: taskId } = req.params;
    const clientId = req.token.userId;
    const { message } = req.body;
    const files = req.files || [];

    const taskRes = await pool.query(`SELECT freelancer_id FROM tasks WHERE id = $1 AND is_deleted = FALSE AND status = 'approved'`, [taskId]);
    if (!taskRes.rows.length) return res.status(400).json({ success: false, message: "This task is not available for request." });

    const existing = await pool.query(`SELECT id FROM tasks_req WHERE task_id = $1 AND client_id = $2`, [taskId, clientId]);
    if (existing.rows.length) return res.status(409).json({ success: false, message: "You have already requested this task." });

    let attachmentUrls = [];
    if (files.length > 0) {
        const uploadedFiles = await uploadFilesToCloudinary(files, `tasks/${taskId}/request`);
        attachmentUrls = uploadedFiles.map(file => file.url);
    }

    const reqResult = await pool.query(
      `INSERT INTO tasks_req (task_id, client_id, message, attachments) VALUES ($1, $2, $3, $4) RETURNING id`, 
      [taskId, clientId, message, attachmentUrls]
    );
    
    res.status(201).json({ success: true, message: "Task requested successfully.", requestId: reqResult.rows[0].id });
  } catch (err) {
    console.error("❌ requestTask error:", err);
    res.status(500).json({ success: false, message: "Server error requesting task." });
  }
};

// Client submits payment proof
export const submitPaymentProof = async (req, res) => {
  try {
    if (req.token?.role !== 2) return res.status(403).json({ success: false, message: "Access denied. Clients only." });

    const { id: taskId } = req.params;
    const clientId = req.token.userId;

    if (!req.file) return res.status(400).json({ success: false, message: "Payment proof file is required." });

    const taskResult = await pool.query(`SELECT id FROM tasks WHERE id = $1 AND assigned_client_id = $2 AND status = 'pending_payment'`, [taskId, clientId]);
    if (!taskResult.rows.length) return res.status(404).json({ success: false, message: "Task not found or not awaiting payment from you." });

    const uploadedFiles = await uploadFilesToCloudinary([req.file], `payment_proofs`);
    const paymentProofUrl = uploadedFiles[0].url;

    await pool.query(`UPDATE tasks SET payment_proof_url = $1 WHERE id = $2`, [paymentProofUrl, taskId]);

    res.json({ success: true, message: "Payment proof submitted successfully. Waiting for admin confirmation." });
  } catch (err) {
    console.error("❌ submitPaymentProof error:", err);
    res.status(500).json({ success: false, message: "Server error submitting payment proof." });
  }
};

// Client approves the final work or requests revisions
export const approveWorkCompletion = async (req, res) => {
  try {
    if (req.token?.role !== 2) return res.status(403).json({ success: false, message: "Access denied. Clients only." });

    const { id: taskId } = req.params;
    const { action } = req.body;
    const clientId = req.token.userId;
    const files = req.files || [];

    if (!['approve', 'revision_requested'].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action." });
    }

    const newStatus = action === 'approve' ? 'completed' : 'revision_requested';
    const finalUpdate = action === 'approve' ? ', completed_at = NOW()' : '';

    const result = await pool.query(
      `UPDATE tasks SET status = $1 ${finalUpdate} WHERE id = $2 AND assigned_client_id = $3 AND status = 'in_review' RETURNING *`,
      [newStatus, taskId, clientId]
    );

    if (!result.rows.length) return res.status(404).json({ success: false, message: "Task not found, not assigned to you, or not in review." });

    if (action === 'revision_requested' && files.length > 0) {
      const uploadedFiles = await uploadFilesToCloudinary(files, `tasks/${taskId}/revisions`);
      await insertFileRecords(uploadedFiles, taskId, clientId);
    }

    res.json({ success: true, message: `Work has been ${action}.` });
  } catch (err) {
    console.error("❌ approveWorkCompletion error:", err);
    res.status(500).json({ success: false, message: "Server error approving work." });
  }
};

// Client submits a rating and review for a completed task
export const createReview = async (req, res) => {
  try {
    if (req.token?.role !== 2) return res.status(403).json({ success: false, message: "Access denied. Clients only." });

    const { id: taskId } = req.params;
    const clientId = req.token.userId;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be a number between 1 and 5." });
    }

    const taskResult = await pool.query(
      `SELECT freelancer_id FROM tasks WHERE id = $1 AND assigned_client_id = $2 AND status = 'completed'`,
      [taskId, clientId]
    );
    if (!taskResult.rows.length) {
      return res.status(403).json({ success: false, message: "You can only review your own completed tasks." });
    }
    
    const { freelancer_id } = taskResult.rows[0];

    const reviewResult = await pool.query(
      `INSERT INTO ratings (task_id, client_id, freelancer_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [taskId, clientId, freelancer_id, rating, comment]
    );

    await pool.query(
      `UPDATE users SET rating_sum = rating_sum + $1, rating_count = rating_count + 1 WHERE id = $2`,
      [rating, freelancer_id]
    );

    res.status(201).json({ success: true, message: "Review submitted successfully.", review: reviewResult.rows[0] });

  } catch (err) {
    if (err.code === '23503') { // Foreign key violation
        return res.status(404).json({ success: false, message: "Associated task or user not found." });
    }
    if (err.code === '23505') { // Unique constraint violation
      return res.status(409).json({ success: false, message: "You have already reviewed this task." });
    }
    console.error("❌ createReview error:", err);
    res.status(500).json({ success: false, message: "Server error submitting review." });
  }
};


/* =================================================================
   PUBLIC & SHARED CONTROLLERS
   ================================================================= */

// Get all approved tasks available in the marketplace
export const getTaskPool = async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT t.id, t.title, t.description, t.price, t.duration_days, t.duration_hours,
             u.first_name || ' ' || u.last_name AS freelancer_name,
             u.profile_pic_url AS freelancer_avatar, c.name AS category_name
      FROM tasks t
      JOIN users u ON t.freelancer_id = u.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.is_deleted = FALSE AND t.status = 'approved' AND t.assigned_client_id IS NULL`;
    const params = [];

    if (category) {
      query += ` AND t.category_id = $${params.length + 1}`;
      params.push(parseInt(category));
    }
    query += ` ORDER BY t.id DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("❌ getTaskPool error:", err);
    res.status(500).json({ success: false, message: "Server error fetching task pool." });
  }
};
// Get details of a single task
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT t.*, 
              u.first_name || ' ' || u.last_name AS freelancer_name, 
              c.name AS category_name 
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
    console.error("❌ getTaskById error:", err);
    res.status(500).json({ success: false, message: "Server error fetching task." });
  }
};

// Get all task categories
export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, parent_id, level FROM categories WHERE is_deleted = FALSE ORDER BY level, name`
    );
    res.json({ success: true, categories: result.rows });
  } catch (err) {
    console.error("❌ getCategories error:", err);
    res.status(500).json({ success: false, message: "Server error fetching categories." });
  }
};

// Add files to a task during its lifecycle
export const addTaskFiles = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { id: taskId } = req.params;
    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded." });
    }

    const taskResult = await pool.query(
      `SELECT freelancer_id, assigned_client_id FROM tasks WHERE id = $1 AND status IN ('active', 'revision_requested')`, 
      [taskId]
    );
    if (!taskResult.rows.length) {
      return res.status(404).json({ success: false, message: "Task not found or not in a state to add files." });
    }

    const { freelancer_id, assigned_client_id } = taskResult.rows[0];
    if (userId !== freelancer_id && userId !== assigned_client_id) {
      return res.status(403).json({ success: false, message: "You are not part of this task." });
    }

    const uploadedFiles = await uploadFilesToCloudinary(files, `tasks/${taskId}/shared`);
    await insertFileRecords(uploadedFiles, taskId, userId);

    res.json({ success: true, message: "Files added successfully.", files: uploadedFiles });
  } catch (err) {
    console.error("❌ addTaskFiles error:", err);
    res.status(500).json({ success: false, message: "File upload failed." });
  }
};

// Get tasks created by the logged-in freelancer
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
    console.error("❌ getFreelancerCreatedTasks error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Get tasks assigned to the logged-in freelancer
export const getAssignedTasks = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    }
    const freelancerId = req.token.userId;
    const result = await pool.query(
      `SELECT t.*, u.first_name || ' ' || u.last_name AS client_name 
       FROM tasks t
       JOIN users u ON t.assigned_client_id = u.id
       WHERE t.freelancer_id = $1 AND t.assigned_client_id IS NOT NULL AND t.is_deleted = FALSE 
       ORDER BY t.id DESC`, 
      [freelancerId]
    );
    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("❌ getAssignedTasks error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Get pending task requests for the logged-in freelancer
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
       FROM tasks_req tr
       JOIN users u ON tr.client_id = u.id
       JOIN tasks t ON tr.task_id = t.id
       WHERE t.freelancer_id = $1 AND tr.status = 'pending'
       ORDER BY tr.requested_at DESC`, 
      [freelancerId]
    );
    res.json({ success: true, requests: result.rows });
  } catch (err) {
    console.error("❌ getTaskRequests error:", err);
    res.status(500).json({ success: false, message: "Server error fetching task requests." });
  }
};