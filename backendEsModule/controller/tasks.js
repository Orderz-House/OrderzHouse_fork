import pool from "../models/db.js";
import { NotificationCreators } from "../services/notificationService.js";
import cloudinary from "../cloudinary/setupfile.js";
import { Readable } from "stream";


export const getAllTasksForAdmin = async (req, res) => {
  try {
    if (req.token?.role !== 1) { // Admin
      return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }

    // Query to fetch all tasks with related user info
    const result = await pool.query(`
      SELECT t.id, t.title, t.description, t.price, t.assigned_client_id, t.freelancer_id,
             t.attachments, t.duration_days, t.duration_hours,
             u1.first_name || ' ' || u1.last_name AS client_name, -- Client who requested
             u1.profile_pic_url AS client_avatar,
             u2.first_name || ' ' || u2.last_name AS freelancer_name, -- Freelancer who created/assigned
             u2.profile_pic_url AS freelancer_avatar,
             c.name AS category_name,
             t.status, t.kanban_status, t.created_at, t.updated_at -- Include more status fields if needed
       FROM tasks t
       LEFT JOIN users u1 ON t.assigned_client_id = u1.id -- Join with client who requested
       LEFT JOIN users u2 ON t.freelancer_id = u2.id -- Join with freelancer who created
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.is_deleted = FALSE -- Exclude soft-deleted tasks
       ORDER BY t.id DESC
    `);

    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("❌ getAllTasksForAdmin error:", err);
    res.status(500).json({ success: false, message: "Server error while fetching all tasks." });
  }
};
export const getFreelancerTasks = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    }
    const freelancerId = req.token.userId;
    const result = await pool.query(
      `SELECT t.id, t.title, t.description, t.price, t.freelancer_id,
              t.attachments, t.duration_days, t.duration_hours,
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
    console.error("❌ getFreelancerTasks error:", err);
    res.status(500).json({ success: false, message: "Server error while fetching tasks." });
  }
};

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
      WHERE t.is_deleted = FALSE AND t.status = 'approved' AND t.assigned_client_id IS NULL`;
    const params = [];

    if (freelancerId) {
      query += ` AND t.freelancer_id <> $1`;
      params.push(freelancerId);
    }
    if (req.query.category) {
      query += ` AND t.category_id = $${params.length + 1}`;
      params.push(parseInt(req.query.category));
    }
    query += ` ORDER BY t.id DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("❌ getTaskPool error:", err);
    res.status(500).json({ success: false, message: "Server error while fetching task pool." });
  }
};

export const createTask = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    }
    const { title, description, price, category_id, duration_days = 0, duration_hours = 0, attachments } = req.body;
    const freelancerId = req.token.userId;

    const result = await pool.query(
      `INSERT INTO tasks (title, description, price, freelancer_id, category_id, duration_days, duration_hours, attachments, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_approval') RETURNING *`,
      [title, description, price, freelancerId, category_id, duration_days, duration_hours, attachments || null]
    );
    const newTask = result.rows[0];

    try {
        await NotificationCreators.taskNeedsApproval(newTask.id, newTask.title, req.token.username);
    } catch (notificationError) {
        console.error(`Failed to create task approval notification for task ${newTask.id}:`, notificationError);
    }

    res.status(201).json({ success: true, task: newTask });
  } catch (err) {
    console.error("❌ createTask error:", err);
    res.status(500).json({ success: false, message: "Server error while creating task." });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    }
    const { id } = req.params;
    const { status } = req.body;
    const freelancerId = req.token.userId;

    const validStatuses = ['todo', 'in_progress', 'review', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status provided. Use 'todo', 'in_progress', 'review', or 'done'." });
    }

    const result = await pool.query(
      `UPDATE tasks SET kanban_status = $1 WHERE id = $2 AND freelancer_id = $3 AND is_deleted = FALSE RETURNING *`,
      [status, id, freelancerId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Task not found or not owned by you." });
    }

    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error("❌ updateTaskStatus error:", err);
    res.status(500).json({ success: false, message: "Server error while updating task status." });
  }
};

export const updateTask = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    }
    const { id } = req.params;
    const { title, description, price, category_id, duration_days, duration_hours, attachments } = req.body;
    const freelancerId = req.token.userId;

    const result = await pool.query(
      `UPDATE tasks SET title = $1, description = $2, price = $3, category_id = $4,
           duration_days = $5, duration_hours = $6, attachments = $7
       WHERE id = $8 AND freelancer_id = $9 AND is_deleted = FALSE AND status = 'pending_approval'
       RETURNING *`,
      [title, description, price, category_id, duration_days, duration_hours, attachments || null, id, freelancerId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Task not found, not owned by you, or cannot be edited." });
    }
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    console.error("❌ updateTask error:", err);
    res.status(500).json({ success: false, message: "Server error while updating task." });
  }
};

export const deleteTask = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    }
    const { id } = req.params;
    const freelancerId = req.token.userId;

    const result = await pool.query(
      `UPDATE tasks SET is_deleted = TRUE WHERE id = $1 AND freelancer_id = $2 AND status = 'pending_approval' RETURNING id`,
      [id, freelancerId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Task not found, not owned by you, or cannot be deleted." });
    }
    res.json({ success: true, message: "Task deleted successfully." });
  } catch (err) {
    console.error("❌ deleteTask error:", err);
    res.status(500).json({ success: false, message: "Server error while deleting task." });
  }
};

export const requestTask = async (req, res) => {
  try {
    const userId = req.token?.userId;
    if (req.token?.role !== 2) {
      return res.status(403).json({ success: false, message: "Access denied. Clients only." });
    }
    const { id: taskId } = req.params;
    const { message, attachments } = req.body;

    const taskRes = await pool.query(`SELECT freelancer_id, title FROM tasks WHERE id = $1 AND is_deleted = FALSE AND status = 'approved'`, [taskId]);
    if (!taskRes.rows.length || taskRes.rows[0].freelancer_id === userId) {
      return res.status(400).json({ success: false, message: "This task is not available for request." });
    }
    const { freelancer_id: freelancerId, title: taskTitle } = taskRes.rows[0];

    const existing = await pool.query(`SELECT status FROM tasks_req WHERE task_id = $1 AND client_id = $2 AND status IN ('pending', 'accepted')`, [taskId, userId]);
    if (existing.rows.length) {
      return res.status(409).json({ success: false, message: "You already have an active request for this task." });
    }

    const reqResult = await pool.query(`INSERT INTO tasks_req (task_id, client_id, message, attachments) VALUES ($1, $2, $3, $4) RETURNING id`, [taskId, userId, message || null, attachments || null]);
    await pool.query(`UPDATE tasks SET total_requests = total_requests + 1 WHERE id = $1`, [taskId]);

    try {
        await NotificationCreators.taskRequested(taskId, taskTitle, freelancerId);
    } catch (notificationError) {
        console.error(`Failed to create task request notification for task ${taskId}:`, notificationError);
    }

    res.status(201).json({ success: true, message: "Task requested successfully.", requestId: reqResult.rows[0].id });
  } catch (err) {
    console.error("❌ requestTask error:", err);
    res.status(500).json({ success: false, message: "Server error while requesting task." });
  }
};

export const getTaskRequests = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    }
    const freelancerId = req.token.userId;
    const result = await pool.query(
      `SELECT tr.id, tr.client_id, tr.message, tr.attachments, tr.requested_at,
              u.first_name || ' ' || u.last_name AS client_name, u.profile_pic_url AS client_avatar,
              t.title AS task_title, t.price AS task_price
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
    res.status(500).json({ success: false, message: "Server error while fetching task requests." });
  }
};

export const updateTaskRequestStatus = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    }
    const { requestId } = req.params;
    const { status } = req.body;
    const freelancerId = req.token.userId;

    const validRequestStatuses = ['accepted', 'rejected', 'completed'];
    if (!validRequestStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status provided for request." });
    }

    const checkResult = await pool.query(
      `SELECT tr.id, tr.client_id, t.id as task_id, t.title as task_title, t.status as task_status
       FROM tasks_req tr JOIN tasks t ON tr.task_id = t.id
       WHERE tr.id = $1 AND t.freelancer_id = $2 AND t.is_deleted = FALSE`,
      [requestId, freelancerId]
    );
    if (!checkResult.rows.length) {
      return res.status(404).json({ success: false, message: "Request not found or you do not own this task." });
    }
    const { client_id: clientId, task_id: taskId, task_title: taskTitle, task_status: currentTaskStatus } = checkResult.rows[0];

    const fields = [`status = $1`];
    const values = [status, requestId];
    if (status === 'accepted') fields.push(`approved_at = NOW()`);
    if (status === 'completed') fields.push(`completed_at = NOW()`);

    await pool.query(`UPDATE tasks_req SET ${fields.join(', ')} WHERE id = $${values.length}`, values);

    if (status === 'accepted') {
        if (currentTaskStatus !== 'approved') {
            return res.status(400).json({ success: false, message: "Cannot accept request for a task that is not approved." });
        }
        await pool.query(
            `UPDATE tasks SET status = 'in_progress', assigned_client_id = $1 WHERE id = $2`,
            [clientId, taskId]
        );
    }

    try {
        if (status === 'accepted') {
            await NotificationCreators.taskRequestStatusChanged(requestId, taskTitle, clientId, true);
            await NotificationCreators.taskAssignedToClient(clientId, taskId, taskTitle);
        } else if (status === 'rejected') {
            await NotificationCreators.taskRequestStatusChanged(requestId, taskTitle, clientId, false);
        } else if (status === 'completed') {
             await NotificationCreators.taskRequestStatusChanged(requestId, taskTitle, clientId, null, status);
        }
    } catch (notificationError) {
        console.error(`Failed to create task status notification for request ${requestId}:`, notificationError);
    }

    res.json({ success: true, message: `Request has been successfully ${status}.` });
  } catch (err) {
    console.error("❌ updateTaskRequestStatus error:", err);
    res.status(500).json({ success: false, message: "Server error while updating task request." });
  }
};

export const getAssignedTasks = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    }
    const freelancerId = req.token.userId;

    const result = await pool.query(
      `SELECT t.id, t.title, t.description, t.price, t.assigned_client_id,
              t.attachments, t.duration_days, t.duration_hours,
              u.first_name || ' ' || u.last_name AS client_name,
              u.profile_pic_url AS client_avatar,
              c.name AS category_name,
              t.status
       FROM tasks t
       LEFT JOIN users u ON t.assigned_client_id = u.id
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.freelancer_id = $1 AND t.is_deleted = FALSE AND t.assigned_client_id IS NOT NULL
       ORDER BY t.id DESC`,
      [freelancerId]
    );
    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error("❌ getAssignedTasks error:", err);
    res.status(500).json({ success: false, message: "Server error while fetching assigned tasks." });
  }
};

export const submitWorkCompletion = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    }
    const { id } = req.params;
    const freelancerId = req.token.userId;
    const files = req.files || [];

    const taskResult = await pool.query(
      `SELECT id, title, assigned_client_id, status FROM tasks WHERE id = $1 AND freelancer_id = $2 AND is_deleted = FALSE AND status = 'in_progress'`,
      [id, freelancerId]
    );
    if (!taskResult.rows.length) {
      return res.status(404).json({ success: false, message: "Task not found, not assigned to you, or not in progress." });
    }
    const task = taskResult.rows[0];

    if (!task.assigned_client_id) {
      return res.status(400).json({ success: false, message: "Task is not assigned to a client." });
    }

    let uploadedFiles = [];
    for (let file of files) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: `tasks/${id}` },
          (error, result) => {
            if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
            } else {
                resolve(result);
            }
          }
        );
        const stream = Readable.from(file.buffer);
        stream.pipe(uploadStream);
      });
      uploadedFiles.push({ url: result.secure_url, public_id: result.public_id });
    }

    await pool.query(
      `UPDATE tasks SET status = 'pending_review', completion_requested_at = NOW() WHERE id = $1`,
      [id]
    );

    for (let fileData of uploadedFiles) {
      await pool.query(
        `INSERT INTO project_files (project_id, sender_id, file_name, file_url, file_size, public_id) VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, freelancerId, file.originalname, fileData.url, file.size, fileData.public_id]
      );
    }

    try {
      await NotificationCreators.workCompletionRequested(id, task.title, freelancerId);
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    res.json({ success: true, message: "Completion requested", files: uploadedFiles });
  } catch (err) {
    console.error("❌ submitWorkCompletion error:", err);
    res.status(500).json({ success: false, message: "Server error while submitting completion." });
  }
};

export const approveWorkCompletion = async (req, res) => {
  try {
    if (req.token?.role !== 2) {
      return res.status(403).json({ success: false, message: "Access denied. Clients only." });
    }
    const { id } = req.params;
    const clientId = req.token.userId;
    const { action } = req.body;
    const files = req.files || [];

    if (!["approve", "revision_requested"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action. Use 'approve' or 'revision_requested'." });
    }

    const taskResult = await pool.query(
      `SELECT id, title, freelancer_id, status FROM tasks WHERE id = $1 AND assigned_client_id = $2 AND is_deleted = FALSE AND status = 'pending_review'`,
      [id, clientId]
    );
    if (!taskResult.rows.length) {
      return res.status(404).json({ success: false, message: "Task not found, not assigned to you, or not pending review." });
    }
    const task = taskResult.rows[0];

    const newStatus = action === "approve" ? "completed" : "revision_requested";

    await pool.query(
      `UPDATE tasks SET status = $1, completed_at = NOW() WHERE id = $2`,
      [newStatus, id]
    );

    if (action === "revision_requested" && files.length > 0) {
        let revisionFiles = [];
        for (let file of files) {
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { resource_type: "auto", folder: `tasks/${id}/revisions` },
              (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    reject(error);
                } else {
                    resolve(result);
                }
              }
            );
            const stream = Readable.from(file.buffer);
            stream.pipe(uploadStream);
          });
          revisionFiles.push({ url: result.secure_url, public_id: result.public_id });
        }

        for (let fileData of revisionFiles) {
          await pool.query(
            `INSERT INTO project_files (project_id, sender_id, file_name, file_url, file_size, public_id) VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, clientId, file.originalname, fileData.url, file.size, fileData.public_id]
          );
        }
    }

    try {
      await NotificationCreators.workCompletionReviewed(task.freelancer_id, id, task.title, newStatus);
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    res.json({ success: true, message: `Work ${action}` });
  } catch (err) {
    console.error("❌ approveWorkCompletion error:", err);
    res.status(500).json({ success: false, message: "Server error while approving completion." });
  }
};

export const resubmitWorkCompletion = async (req, res) => {
  try {
    if (req.token?.role !== 3) {
      return res.status(403).json({ success: false, message: "Access denied. Freelancers only." });
    }
    const { id } = req.params;
    const freelancerId = req.token.userId;
    const files = req.files || [];

    const taskResult = await pool.query(
      `SELECT id, title, assigned_client_id, status FROM tasks WHERE id = $1 AND freelancer_id = $2 AND is_deleted = FALSE AND status = 'revision_requested'`,
      [id, freelancerId]
    );
    if (!taskResult.rows.length) {
      return res.status(404).json({ success: false, message: "Task not found, not assigned to you, or not requesting revision." });
    }
    const task = taskResult.rows[0];

    if (!task.assigned_client_id) {
      return res.status(400).json({ success: false, message: "Task is not assigned to a client." });
    }

    let uploadedFiles = [];
    for (let file of files) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: `tasks/${id}` },
          (error, result) => {
            if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
            } else {
                resolve(result);
            }
          }
        );
        const stream = Readable.from(file.buffer);
        stream.pipe(uploadStream);
      });
      uploadedFiles.push({ url: result.secure_url, public_id: result.public_id });
    }

    await pool.query(
      `UPDATE tasks SET status = 'pending_review', completion_requested_at = NOW() WHERE id = $1`,
      [id]
    );

    for (let fileData of uploadedFiles) {
      await pool.query(
        `INSERT INTO project_files (project_id, sender_id, file_name, file_url, file_size, public_id) VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, freelancerId, file.originalname, fileData.url, file.size, fileData.public_id]
      );
    }

    try {
      await NotificationCreators.workResubmittedForReview(id, task.title, freelancerId);
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    res.json({ success: true, message: "Revision resubmitted", files: uploadedFiles });
  } catch (err) {
    console.error("❌ resubmitWorkCompletion error:", err);
    res.status(500).json({ success: false, message: "Server error while resubmitting completion." });
  }
};

export const addTaskFiles = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { id: taskId } = req.params;
    const files = req.files || [];

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!files || files.length === 0)
      return res.status(400).json({ success: false, message: "No files uploaded" });

    const taskResult = await pool.query(
      `SELECT id, freelancer_id, assigned_client_id FROM tasks WHERE id = $1 AND is_deleted = FALSE`,
      [taskId]
    );
    if (!taskResult.rows.length) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }
    const task = taskResult.rows[0];

    if (userId !== task.freelancer_id && userId !== task.assigned_client_id) {
      return res.status(403).json({ success: false, message: "Access denied. You are not involved in this task." });
    }

    const uploadedFiles = [];
    for (const file of files) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: `tasks/${taskId}` },
          (error, result) => {
            if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
            } else {
                resolve(result);
            }
          }
        );
        const stream = Readable.from(file.buffer);
        stream.pipe(uploadStream);
      });

      const fileResult = await pool.query(
        `INSERT INTO project_files (project_id, sender_id, file_name, file_url, file_size, public_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [taskId, userId, file.originalname, result.secure_url, file.size, result.public_id]
      );

      uploadedFiles.push(fileResult.rows[0]);
    }

    res.json({ success: true, files: uploadedFiles });
  } catch (err) {
    console.error("❌ addTaskFiles error:", err);
    res.status(500).json({ success: false, message: "File upload failed", error: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, parent_id, level FROM categories WHERE is_deleted = FALSE ORDER BY level, name`
    );
    res.json({ success: true, categories: result.rows });
  } catch (err) {
    console.error("❌ getCategories error:", err);
    res.status(500).json({ success: false, message: "Server error while fetching categories." });
  }
};