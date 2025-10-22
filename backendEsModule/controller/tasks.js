import pool from "../models/db.js";
import { Readable } from "stream";
import cloudinary from "../cloudinary/setupfile.js";
import { NotificationCreators } from "../services/notificationService.js";

const uploadFilesToCloudinary = async (files, folder) => {
  const uploadPromises = files.map(file => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder },
        (error, result) => {
          if (error) return reject(error);
          resolve({ url: result.secure_url, public_id: result.public_id, name: file.originalname, size: file.size });
        }
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  });
  return Promise.all(uploadPromises);
};

const insertFileRecords = async (files, requestId, senderId) => {
  for (const fileData of files) {
    await pool.query(
      `INSERT INTO task_files (tasks_req_id, sender_id, file_name, file_url, file_size, public_id) VALUES ($1, $2, $3, $4, $5, $6)`,
      [requestId, senderId, fileData.name, fileData.url, fileData.size, fileData.public_id]
    );
  }
};

export const getAllTasksForAdmin = async (req, res) => {
  try {
    if (req.token?.role_id !== 1) return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    const result = await pool.query(`SELECT t.*, u1.first_name || ' ' || u1.last_name AS freelancer_name FROM tasks t LEFT JOIN users u1 ON t.freelancer_id = u1.id WHERE t.is_deleted = FALSE ORDER BY t.created_at DESC`);
    res.json({ success: true, tasks: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: "Server error." }); }
};

export const approveTaskByAdmin = async (req, res) => {
  try {
    if (req.token?.role_id !== 1) return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'rejected'].includes(status)) return res.status(400).json({ success: false, message: "Invalid status. Use 'active' or 'rejected'." });
    const result = await pool.query(`UPDATE tasks SET status = $1 WHERE id = $2 AND status = 'pending_approval' RETURNING *`, [status, id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Task not found or not pending approval." });
    const task = result.rows[0];
    await NotificationCreators.freelancerTaskApproved(task.freelancer_id, task.id, task.title, status);
    res.json({ success: true, message: `Task has been ${status}.`, task });
  } catch (err) { res.status(500).json({ success: false, message: "Server error." }); }
};

export const confirmPaymentByAdmin = async (req, res) => {
  try {
    if (req.token?.role_id !== 1) return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    const { requestId } = req.params;
    const result = await pool.query(`UPDATE tasks_req SET status = 'active' WHERE id = $1 AND status = 'pending_payment' AND payment_proof_url IS NOT NULL RETURNING *`, [requestId]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Request not found, not pending payment, or no payment proof was submitted." });
    const request = result.rows[0];
    const taskRes = await pool.query(`SELECT freelancer_id, title FROM tasks WHERE id = $1`, [request.task_id]);
    const { freelancer_id, title } = taskRes.rows[0];
    await NotificationCreators.paymentConfirmed(request.client_id, freelancer_id, request.task_id, title);
    res.json({ success: true, message: "Payment confirmed. Request is now active.", request });
  } catch (err) { res.status(500).json({ success: false, message: "Server error." }); }
};

export const createTask = async (req, res) => {
  try {
    if (req.token?.role_id !== 3) return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    const { title, description, price, category_id, sub_sub_category_id, duration_days = 0, duration_hours = 0 } = req.body;
    const freelancerId = req.token.userId;
    const files = req.files || [];
    let attachmentUrls = [];
    if (files.length > 0) {
        const uploadedFiles = await uploadFilesToCloudinary(files, `tasks/initial/${freelancerId}`);
        attachmentUrls = uploadedFiles.map(file => file.url);
    }
    const result = await pool.query(`INSERT INTO tasks (title, description, price, freelancer_id, category_id, sub_sub_category_id, duration_days, duration_hours, attachments, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending_approval') RETURNING *`, [title, description, price, freelancerId, category_id, sub_sub_category_id, duration_days, duration_hours, attachmentUrls]);
    const task = result.rows[0];
    await NotificationCreators.adminNewTaskForApproval(task.id, task.title);
    res.status(201).json({ success: true, task });
  } catch (err) { res.status(500).json({ success: false, message: "Server error creating task." }); }
};

export const updateTask = async (req, res) => {
  try {
    if (req.token?.role_id !== 3) return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    const { id } = req.params;
    const { title, description, price, category_id, sub_sub_category_id, duration_days, duration_hours } = req.body;
    const freelancerId = req.token.userId;
    const result = await pool.query(`UPDATE tasks SET title = $1, description = $2, price = $3, category_id = $4, sub_sub_category_id = $5, duration_days = $6, duration_hours = $7 WHERE id = $8 AND freelancer_id = $9 AND is_deleted = FALSE AND status = 'pending_approval' RETURNING *`, [title, description, price, category_id, sub_sub_category_id, duration_days, duration_hours, id, freelancerId]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Task not found, not owned by you, or cannot be edited." });
    res.json({ success: true, task: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: "Server error updating task." }); }
};

export const deleteTask = async (req, res) => {
  try {
    if (req.token?.role_id !== 3) return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    const { id } = req.params;
    const freelancerId = req.token.userId;
    const result = await pool.query(`UPDATE tasks SET is_deleted = TRUE WHERE id = $1 AND freelancer_id = $2`, [id, freelancerId]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: "Task not found or not owned by you." });
    res.json({ success: true, message: "Task deleted successfully." });
  } catch (err) { res.status(500).json({ success: false, message: "Server error deleting task." }); }
};

export const updateTaskRequestStatus = async (req, res) => {
  try {
    if (req.token?.role_id !== 3) return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    const { requestId } = req.params;
    const { status } = req.body;
    const freelancerId = req.token.userId;
    if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ success: false, message: "Invalid status. Use 'accepted' or 'rejected'." });
    const reqResult = await pool.query(`UPDATE tasks_req SET status = $1 WHERE id = $2 AND status = 'pending' AND task_id IN (SELECT id FROM tasks WHERE freelancer_id = $3) RETURNING *`, [status, requestId, freelancerId]);
    if (!reqResult.rows.length) return res.status(404).json({ success: false, message: "Request not found, already handled, or not yours." });
    const request = reqResult.rows[0];
    const taskRes = await pool.query(`SELECT title FROM tasks WHERE id = $1`, [request.task_id]);
    await NotificationCreators.clientRequestStatusChanged(request.client_id, request.id, request.task_id, taskRes.rows[0].title, status);
    if (status === 'accepted') {
      await pool.query(`UPDATE tasks_req SET status = 'pending_payment' WHERE id = $1`, [requestId]);
    }
    res.json({ success: true, message: `Request has been ${status}.` });
  } catch (err) { res.status(500).json({ success: false, message: "Server error." }); }
};

export const submitWorkCompletion = async (req, res) => {
  try {
    if (req.token?.role_id !== 3) return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    const { requestId } = req.params;
    const freelancerId = req.token.userId;
    const files = req.files || [];
    if (files.length === 0) return res.status(400).json({ success: false, message: "Work submission requires at least one file." });
    const reqResult = await pool.query(`UPDATE tasks_req SET status = 'in_review' WHERE id = $1 AND status = 'active' AND task_id IN (SELECT id FROM tasks WHERE freelancer_id = $2) RETURNING *`, [requestId, freelancerId]);
    if (!reqResult.rows.length) return res.status(404).json({ success: false, message: "Request not found, not yours, or not active." });
    const request = reqResult.rows[0];
    const uploadedFiles = await uploadFilesToCloudinary(files, `requests/${requestId}/delivery`);
    await insertFileRecords(uploadedFiles, request.id, freelancerId);
    await NotificationCreators.workSubmittedForReview(request.client_id, request.task_id, request.id);
    res.json({ success: true, message: "Work submitted for review." });
  } catch (err) { res.status(500).json({ success: false, message: "Server error submitting work." }); }
};

export const resubmitWorkCompletion = async (req, res) => {
  try {
    if (req.token?.role_id !== 3) return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    const { requestId } = req.params;
    const freelancerId = req.token.userId;
    const files = req.files || [];
    if (files.length === 0) return res.status(400).json({ success: false, message: "Work resubmission requires at least one file." });
    const reqResult = await pool.query(`UPDATE tasks_req SET status = 'in_review' WHERE id = $1 AND status = 'revision_requested' AND task_id IN (SELECT id FROM tasks WHERE freelancer_id = $2) RETURNING *`, [requestId, freelancerId]);
    if (!reqResult.rows.length) return res.status(404).json({ success: false, message: "Request not found, not yours, or not in revision status." });
    const request = reqResult.rows[0];
    const uploadedFiles = await uploadFilesToCloudinary(files, `requests/${requestId}/resubmission`);
    await insertFileRecords(uploadedFiles, request.id, freelancerId);
    await NotificationCreators.workSubmittedForReview(request.client_id, request.task_id, request.id);
    res.json({ success: true, message: "Work has been resubmitted for review." });
  } catch (err) { res.status(500).json({ success: false, message: "Server error resubmitting work." }); }
};

export const updateTaskKanbanStatus = async (req, res) => {
  try {
    if (req.token?.role_id !== 3) return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    const { requestId } = req.params;
    const { status } = req.body;
    const validStatuses = ['todo', 'in_progress', 'review', 'done'];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: "Invalid Kanban status." });
    const result = await pool.query(`UPDATE tasks_req SET kanban_status = $1 WHERE id = $2 RETURNING *`, [status, requestId]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Request not found." });
    res.json({ success: true, request: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: "Server error updating Kanban status." }); }
};

export const requestTask = async (req, res) => {
  try {
    if (req.token?.role_id !== 2) return res.status(403).json({ success: false, message: "Access denied. Clients only." });
    const { id: taskId } = req.params;
    const clientId = req.token.userId;
    const { message } = req.body;
    const files = req.files || [];
    const taskRes = await pool.query(`SELECT freelancer_id, title FROM tasks WHERE id = $1 AND is_deleted = FALSE AND status = 'active'`, [taskId]);
    if (!taskRes.rows.length) return res.status(404).json({ success: false, message: "This task is not available for request." });
    const existing = await pool.query(`SELECT id FROM tasks_req WHERE task_id = $1 AND client_id = $2 AND status NOT IN ('completed', 'rejected', 'cancelled')`, [taskId, clientId]);
    if (existing.rows.length > 0) return res.status(409).json({ success: false, message: "You already have an active request for this task." });
    let attachmentUrls = [];
    if (files.length > 0) {
        const uploadedFiles = await uploadFilesToCloudinary(files, `requests/${taskId}/${clientId}`);
        attachmentUrls = uploadedFiles.map(file => file.url);
    }
    const reqResult = await pool.query(`INSERT INTO tasks_req (task_id, client_id, message, attachments, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING id`, [taskId, clientId, message, attachmentUrls]);
    const { freelancer_id, title } = taskRes.rows[0];
    await NotificationCreators.freelancerNewTaskRequest(freelancer_id, reqResult.rows[0].id, title);
    res.status(201).json({ success: true, message: "Task requested successfully. Waiting for freelancer's response.", requestId: reqResult.rows[0].id });
  } catch (err) { res.status(500).json({ success: false, message: "Server error requesting task." }); }
};

export const submitPaymentProof = async (req, res) => {
  try {
    if (req.token?.role_id !== 2) return res.status(403).json({ success: false, message: "Access denied. Clients only." });
    const { requestId } = req.params;
    const clientId = req.token.userId;
    if (!req.file) return res.status(400).json({ success: false, message: "Payment proof file is required." });
    const reqResult = await pool.query(`SELECT id FROM tasks_req WHERE id = $1 AND client_id = $2 AND status = 'pending_payment'`, [requestId, clientId]);
    if (!reqResult.rows.length) return res.status(404).json({ success: false, message: "Request not found or not awaiting payment from you." });
    const uploadedFiles = await uploadFilesToCloudinary([req.file], `payment_proofs/${requestId}`);
    const paymentProofUrl = uploadedFiles[0].url;
    await pool.query(`UPDATE tasks_req SET payment_proof_url = $1 WHERE id = $2`, [paymentProofUrl, requestId]);
    await NotificationCreators.adminNewPaymentToConfirm(requestId);
    res.json({ success: true, message: "Payment proof submitted successfully. Waiting for admin confirmation." });
  } catch (err) { res.status(500).json({ success: false, message: "Server error submitting payment proof." }); }
};

export const approveWorkCompletion = async (req, res) => {
  try {
    if (req.token?.role_id !== 2) return res.status(403).json({ success: false, message: "Access denied. Clients only." });
    const { requestId } = req.params;
    const { action } = req.body;
    const clientId = req.token.userId;
    const files = req.files || [];
    if (!['approve', 'revision_requested'].includes(action)) return res.status(400).json({ success: false, message: "Invalid action." });
    const newStatus = action === 'approve' ? 'completed' : 'revision_requested';
    const finalUpdate = action === 'approve' ? ', completed_at = NOW()' : '';
    const result = await pool.query(`UPDATE tasks_req SET status = $1 ${finalUpdate} WHERE id = $2 AND client_id = $3 AND status = 'in_review' RETURNING *`, [newStatus, requestId, clientId]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Request not found, not assigned to you, or not in review." });
    const request = result.rows[0];
    const taskRes = await pool.query(`SELECT freelancer_id FROM tasks WHERE id = $1`, [request.task_id]);
    const { freelancer_id } = taskRes.rows[0];
    if (action === 'revision_requested' && files.length > 0) {
      const uploadedFiles = await uploadFilesToCloudinary(files, `requests/${requestId}/revisions`);
      await insertFileRecords(uploadedFiles, request.id, clientId);
    }
    await NotificationCreators.workReviewedByClient(freelancer_id, request.task_id, request.id, newStatus);
    res.json({ success: true, message: `Work has been ${action}.` });
  } catch (err) { res.status(500).json({ success: false, message: "Server error approving work." }); }
};

export const createReview = async (req, res) => {
  try {
    if (req.token?.role_id !== 2) return res.status(403).json({ success: false, message: "Access denied. Clients only." });
    const { requestId } = req.params;
    const clientId = req.token.userId;
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: "Rating must be a number between 1 and 5." });
    const reqResult = await pool.query(`SELECT t.freelancer_id, tr.task_id FROM tasks_req tr JOIN tasks t ON tr.task_id = t.id WHERE tr.id = $1 AND tr.client_id = $2 AND tr.status = 'completed'`, [requestId, clientId]);
    if (!reqResult.rows.length) return res.status(403).json({ success: false, message: "You can only review your own completed requests." });
    const { freelancer_id, task_id } = reqResult.rows[0];
    const reviewResult = await pool.query(`INSERT INTO ratings (task_id, client_id, freelancer_id, rating, comment, tasks_req_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [task_id, clientId, freelancer_id, rating, comment, requestId]);
    await pool.query(`UPDATE users SET rating_sum = rating_sum + $1, rating_count = rating_count + 1 WHERE id = $2`, [rating, freelancer_id]);
    res.status(201).json({ success: true, message: "Review submitted successfully.", review: reviewResult.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: "You have already reviewed this request." });
    res.status(500).json({ success: false, message: "Server error submitting review." });
  }
};

export const getTaskPool = async (req, res) => {
  try {
    const { category, subSubCategory } = req.query;
    let query = `SELECT t.id, t.title, t.description, t.price, t.duration_days, t.duration_hours, u.first_name || ' ' || u.last_name AS freelancer_name, u.profile_pic_url AS freelancer_avatar, c.name AS category_name FROM tasks t JOIN users u ON t.freelancer_id = u.id LEFT JOIN categories c ON t.category_id = c.id WHERE t.is_deleted = FALSE AND t.status = 'active'`;
    const params = [];
    if (category) { params.push(parseInt(category)); query += ` AND t.category_id = $${params.length}`; }
    if (subSubCategory) { params.push(parseInt(subSubCategory)); query += ` AND t.sub_sub_category_id = $${params.length}`; }
    query += ` ORDER BY t.created_at DESC`;
    const result = await pool.query(query, params);
    res.json({ success: true, tasks: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: "Server error fetching task pool." }); }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT t.*, u.first_name || ' ' || u.last_name AS freelancer_name, u.profile_pic_url AS freelancer_avatar, c.name AS category_name FROM tasks t JOIN users u ON t.freelancer_id = u.id LEFT JOIN categories c ON t.category_id = c.id WHERE t.id = $1 AND t.is_deleted = FALSE`, [id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Task not found." });
    res.json({ success: true, task: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: "Server error fetching task." }); }
};

export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, name, parent_id, level FROM categories WHERE is_deleted = FALSE ORDER BY level, name`);
    res.json({ success: true, categories: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: "Server error fetching categories." }); }
};

export const addTaskFiles = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { requestId } = req.params;
    const files = req.files || [];
    if (files.length === 0) return res.status(400).json({ success: false, message: "No files uploaded." });
    const reqResult = await pool.query(`SELECT tr.client_id, t.freelancer_id, tr.task_id FROM tasks_req tr JOIN tasks t ON tr.task_id = t.id WHERE tr.id = $1 AND tr.status IN ('active', 'revision_requested')`, [requestId]);
    if (!reqResult.rows.length) return res.status(404).json({ success: false, message: "Request not found or not in a state to add files." });
    const { client_id, freelancer_id } = reqResult.rows[0];
    if (userId !== client_id && userId !== freelancer_id) return res.status(403).json({ success: false, message: "You are not part of this request." });
    const uploadedFiles = await uploadFilesToCloudinary(files, `requests/${requestId}/shared`);
    await insertFileRecords(uploadedFiles, requestId, userId);
    res.json({ success: true, message: "Files added successfully.", files: uploadedFiles });
  } catch (err) { res.status(500).json({ success: false, message: "File upload failed." }); }
};

export const getFreelancerCreatedTasks = async (req, res) => {
  try {
    if (req.token?.role_id !== 3) return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    const freelancerId = req.token.userId;
    const result = await pool.query(`SELECT * FROM tasks WHERE freelancer_id = $1 AND is_deleted = FALSE ORDER BY id DESC`, [freelancerId]);
    res.json({ success: true, tasks: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: "Server error." }); }
};

export const getAssignedTasks = async (req, res) => {
  try {
    const result = await pool.query(`SELECT tr.*, t.title as task_title, u_client.first_name || ' ' || u_client.last_name AS client_name, u_freelancer.first_name || ' ' || u_freelancer.last_name AS freelancer_name FROM tasks_req tr JOIN tasks t ON tr.task_id = t.id JOIN users u_client ON tr.client_id = u_client.id JOIN users u_freelancer ON t.freelancer_id = u_freelancer.id WHERE tr.status NOT IN ('pending', 'rejected', 'cancelled') ORDER BY tr.id DESC`);
    res.json({ success: true, requests: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: "Server error." }); }
};

export const getTaskRequests = async (req, res) => {
  try {
    if (req.token?.role_id !== 3) return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    const freelancerId = req.token.userId;
    const result = await pool.query(`SELECT tr.*, u.first_name || ' ' || u.last_name AS client_name, u.profile_pic_url AS client_avatar, t.title AS task_title, t.price AS task_price FROM tasks_req tr JOIN users u ON tr.client_id = u.id JOIN tasks t ON tr.task_id = t.id WHERE t.freelancer_id = $1 AND tr.status = 'pending' ORDER BY tr.requested_at DESC`, [freelancerId]);
    res.json({ success: true, requests: result.rows });
  } catch (err) { res.status(500).json({ success: false, message: "Server error fetching task requests." }); }
};

export const getClientRequests = async (req, res) => {
    try {
        if (req.token?.role_id !== 2) return res.status(403).json({ success: false, message: "Access denied." });
        const result = await pool.query(`SELECT tr.*, t.title as task_title, u.first_name || ' ' || u.last_name AS freelancer_name FROM tasks_req tr JOIN tasks t ON tr.task_id = t.id JOIN users u ON t.freelancer_id = u.id WHERE tr.client_id = $1 ORDER BY tr.id DESC`, [req.token.userId]);
        res.json({ success: true, requests: result.rows });
    } catch (err) { res.status(500).json({ success: false, message: "Server error." }); }
};
