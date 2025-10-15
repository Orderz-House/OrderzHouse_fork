import pool from "../../models/db.js";
import { LogCreators, ACTION_TYPES } from "../../services/loggingService.js";
import { NotificationCreators } from "../../services/notificationService.js";
import cloudinary from "../../cloudinary/setupfile.js"
import multer from "multer";

// Multer memory storage
const storage = multer.memoryStorage();
export const upload = multer({ storage });

/**
 * -------------------------------
 * CREATE PROJECT
 * Statuses:
 *   pending         - newly created project
 *   pending_payment - fixed/hourly projects waiting for payment
 *   bidding         - project open for bids
 * -------------------------------
 */
export const createProject = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const {
      category_id,
      sub_category_id,
      sub_sub_category_id,
      title,
      description,
      budget,
      duration_type,
      duration_days,
      duration_hours,
      project_type,
      budget_min,
      budget_max,
      hourly_rate,
      preferred_skills
    } = req.body;

    if (!category_id || !title || !description || !duration_type) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let projectStatus = "pending";
    if (project_type === "bidding") projectStatus = "bidding";
    else if (["fixed", "hourly"].includes(project_type)) projectStatus = "pending_payment";

    const insertQuery = `
      INSERT INTO projects (
        user_id, category_id, sub_category_id, sub_sub_category_id,
        title, description, budget, duration_days, duration_hours,
        project_type, budget_min, budget_max, hourly_rate,
        preferred_skills, status, completion_status, is_deleted
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, 'not_started', false
      ) RETURNING *;
    `;

    const durationDaysValue = duration_type === "days" ? duration_days : null;
    const durationHoursValue = duration_type === "hours" ? duration_hours : null;

    const { rows } = await pool.query(insertQuery, [
      userId,
      category_id,
      sub_category_id || null,
      sub_sub_category_id || null,
      title,
      description,
      budget || null,
      durationDaysValue,
      durationHoursValue,
      project_type,
      budget_min || null,
      budget_max || null,
      hourly_rate || null,
      preferred_skills || [],
      projectStatus
    ]);

    const project = rows[0];

    let amountToPay = null;
    if (project.project_type === "fixed") amountToPay = project.budget;
    else if (project.project_type === "hourly") amountToPay = (project.hourly_rate || 0) * 3;

    if (amountToPay !== null) {
      const update = await pool.query(
        `UPDATE projects SET amount_to_pay = $1 WHERE id = $2 RETURNING *`,
        [amountToPay, project.id]
      );
      Object.assign(project, update.rows[0]);
    }

    // Log project creation
    await LogCreators.projectOperation(userId, ACTION_TYPES.PROJECT_CREATE, project.id, true, { project });

    return res.status(201).json({ success: true, project });
  } catch (error) {
    console.error("createProject error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * -------------------------------
 * ASSIGN PROJECT
 * Statuses:
 *   active          - project currently being worked on
 *   not_started     - assigned but freelancer hasn't started
 * -------------------------------
 */
export const assignProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { freelancer_id, assignment_type = "solo" } = req.body;

    if (!freelancer_id) return res.status(400).json({ success: false, message: "freelancer_id required" });

    const { rows: projectRows } = await pool.query(
      `SELECT id, duration_days, duration_hours, status, title FROM projects WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );
    if (!projectRows.length) return res.status(404).json({ success: false, message: "Project not found" });

    const project = projectRows[0];

    const { rows: userRows } = await pool.query(
      `SELECT role_id, is_verified FROM users WHERE id = $1 AND is_deleted = false`,
      [freelancer_id]
    );
    if (!userRows.length || userRows[0].role_id !== 3) return res.status(403).json({ success: false, message: "Only verified freelancers can be assigned" });
    if (!userRows[0].is_verified) return res.status(403).json({ success: false, message: "Freelancer must be verified" });

    const { rows: existing } = await pool.query(
      `SELECT id FROM project_assignments WHERE project_id = $1 AND freelancer_id = $2`,
      [projectId, freelancer_id]
    );
    if (existing.length) return res.status(400).json({ success: false, message: "Freelancer already assigned" });

    if (assignment_type === "solo") {
      const { rows: soloCheck } = await pool.query(
        `SELECT id FROM project_assignments WHERE project_id = $1 AND assignment_type = 'solo'`,
        [projectId]
      );
      if (soloCheck.length) return res.status(400).json({ success: false, message: "Solo assignment exists" });
    }

    const assignedAt = new Date();
    let deadline = null;
    if (project.duration_days) deadline = new Date(assignedAt.getTime() + project.duration_days * 24 * 60 * 60 * 1000);
    else if (project.duration_hours) deadline = new Date(assignedAt.getTime() + project.duration_hours * 60 * 60 * 1000);

    const { rows: inserted } = await pool.query(
      `INSERT INTO project_assignments (project_id, freelancer_id, assigned_at, status, assignment_type, deadline)
       VALUES ($1, $2, $3, 'active', $4, $5) RETURNING *`,
      [projectId, freelancer_id, assignedAt, assignment_type, deadline]
    );

    if (assignment_type === "solo") {
      await pool.query(
        `UPDATE projects SET status = 'active', completion_status = 'not_started' WHERE id = $1`,
        [projectId]
      );
    }

    // Log assignment creation
    await LogCreators.projectOperation(req.token?.userId || 0, ACTION_TYPES.ASSIGNMENT_CREATE, projectId, true, { freelancer_id, assignment_id: inserted[0].id, assignment_type });

    // Send notifications
    try {
      await NotificationCreators.freelancerAssigned(freelancer_id, projectId, project.title);
      await NotificationCreators.projectAssignedToClient(req.token?.userId || 0, projectId, project.title);
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    return res.status(201).json({ success: true, assignment: inserted[0] });
  } catch (error) {
    console.error("assignProject error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * -------------------------------
 * SUBMIT WORK COMPLETION (with optional files)
 * Statuses:
 *   pending_review     - freelancer submitted, waiting client approval
 * -------------------------------
 */
export const submitWorkCompletion = async (req, res) => {
  try {
    const freelancerId = req.token.userId;
    const { projectId } = req.params;
    const files = req.files || [];

    const { rows: check } = await pool.query(
      `SELECT assigned_freelancer_id, title FROM projects WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );
    if (!check.length || check[0].assigned_freelancer_id !== freelancerId) {
      return res.status(403).json({ success: false, message: "Only assigned freelancer can submit completion" });
    }

    let uploadedFiles = [];
    for (let file of files) {
      const result = await cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: `projects/${projectId}` },
        (error, result) => {
          if (error) throw error;
          uploadedFiles.push({ url: result.secure_url, public_id: result.public_id });
        }
      );
      result.end(file.buffer);
    }

    await pool.query(
      `UPDATE projects SET completion_status = 'pending_review', completion_requested_at = NOW() WHERE id = $1`,
      [projectId]
    );

    for (let fileData of uploadedFiles) {
      await pool.query(
        `INSERT INTO project_files (project_id, file_url, public_id, uploaded_by) VALUES ($1, $2, $3, $4)`,
        [projectId, fileData.url, fileData.public_id, freelancerId]
      );
    }

    await pool.query(
      `INSERT INTO completion_history (project_id, event, timestamp, actor, notes)
       VALUES ($1, 'completion_requested', NOW(), $2, $3)`,
      [projectId, freelancerId, "Freelancer requested completion"]
    );

    await LogCreators.projectOperation(freelancerId, ACTION_TYPES.PROJECT_STATUS_CHANGE, projectId, true, { action: "work_completion_requested" });

    try {
      await NotificationCreators.workCompletionRequested(projectId, check[0].title, freelancerId);
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    return res.json({ success: true, message: "Completion requested", files: uploadedFiles });
  } catch (err) {
    console.error("submitWorkCompletion error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * -------------------------------
 * APPROVE/REQUEST REVISION WORK
 * Statuses:
 *   completed           - client approved
 *   revision_requested  - client requested revision
 * -------------------------------
 */
export const approveWorkCompletion = async (req, res) => {
  try {
    const clientId = req.token.userId;
    const { projectId } = req.params;
    const { action } = req.body; // 'approve' or 'revision_requested'

    if (!["approve", "revision_requested"].includes(action)) return res.status(400).json({ success: false, message: "Invalid action" });

    const { rows: projectRows } = await pool.query(
      `SELECT user_id, assigned_freelancer_id, title FROM projects WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );
    if (!projectRows.length) return res.status(404).json({ success: false, message: "Project not found" });

    const project = projectRows[0];
    if (project.user_id !== clientId) return res.status(403).json({ success: false, message: "Only client can approve work" });

    const newStatus = action === "approve" ? "completed" : "revision_requested";

    await pool.query(
      `UPDATE projects SET completion_status = $1, completed_at = NOW() WHERE id = $2`,
      [newStatus, projectId]
    );

    await pool.query(
      `INSERT INTO completion_history (project_id, event, timestamp, actor, notes)
       VALUES ($1, $2, NOW(), $3, $4)`,
      [projectId, newStatus, clientId, `Client ${action}`]
    );

    await LogCreators.projectOperation(clientId, ACTION_TYPES.PROJECT_STATUS_CHANGE, projectId, true, { action: newStatus });

    try {
      await NotificationCreators.workCompletionReviewed(project.assigned_freelancer_id, projectId, project.title, newStatus);
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    return res.json({ success: true, message: `Work ${action}` });
  } catch (err) {
    console.error("approveWorkCompletion error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * -------------------------------
 * COMPLETE HOURLY PROJECT
 * Statuses:
 *   completed
 * -------------------------------
 */
export const completeHourlyProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { total_hours } = req.body;

    const { rows: projectRows } = await pool.query(
      `SELECT * FROM projects WHERE id = $1`,
      [projectId]
    );
    if (!projectRows.length) return res.status(404).json({ success: false, message: "Project not found" });

    const project = projectRows[0];
    if (project.project_type !== "hourly") return res.status(400).json({ success: false, message: "Not an hourly project" });

    const prepaidHours = project.prepaid_hours || 3;
    const hourlyRate = project.hourly_rate;

    let refundAmount = 0, extraPayment = 0;
    if (total_hours < prepaidHours) refundAmount = (prepaidHours - total_hours) * hourlyRate;
    else if (total_hours > prepaidHours) extraPayment = (total_hours - prepaidHours) * hourlyRate;

    const finalAmount = total_hours * hourlyRate;

    const { rows: updated } = await pool.query(
      `UPDATE projects SET total_hours = $1, amount_to_pay = $2, status = 'completed' WHERE id = $3 RETURNING *`,
      [total_hours, finalAmount, projectId]
    );

    if (refundAmount > 0) await pool.query(`UPDATE wallets SET balance = balance + $1 WHERE user_id = $2`, [refundAmount, project.user_id]);
    if (extraPayment > 0) await pool.query(`UPDATE wallets SET balance = balance - $1 WHERE user_id = $2`, [extraPayment, project.user_id]);

    return res.status(200).json({ success: true, project: updated[0], refund: refundAmount || null, extra_payment: extraPayment || null });
  } catch (error) {
    console.error("completeHourlyProject error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * -------------------------------
 * GET RELATED FREELANCERS
 * -------------------------------
 */
export const getRelatedFreelancers = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const { rows: freelancers } = await pool.query(
      `SELECT u.* FROM users u
       JOIN freelancer_categories fc ON u.id = fc.freelancer_id
       WHERE fc.category_id = $1 AND u.role_id = 3 AND u.is_deleted = false`,
      [categoryId]
    );

    res.status(200).json({ success: true, freelancers });
  } catch (error) {
    console.error("Error fetching related freelancers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * -------------------------------
 * RESUBMIT WORK AFTER REVISION
 * Statuses:
 *   pending_review - freelancer resubmitted, waiting client approval
 * -------------------------------
 */
export const resubmitWorkCompletion = async (req, res) => {
  try {
    const freelancerId = req.token.userId;
    const { projectId } = req.params;
    const files = req.files || [];

    const { rows: projectRows } = await pool.query(
      `SELECT assigned_freelancer_id, title, completion_status
       FROM projects WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );

    if (!projectRows.length) return res.status(404).json({ success: false, message: "Project not found" });
    const project = projectRows[0];

    if (project.assigned_freelancer_id !== freelancerId) {
      return res.status(403).json({ success: false, message: "Only assigned freelancer can resubmit" });
    }

    if (project.completion_status !== "revision_requested") {
      return res.status(400).json({ success: false, message: "Project is not requesting revision" });
    }

    let uploadedFiles = [];
    for (let file of files) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: `projects/${projectId}` },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      uploadedFiles.push({ url: result.secure_url, public_id: result.public_id });
    }

    // Update project status
    await pool.query(
      `UPDATE projects SET completion_status = 'pending_review', completion_requested_at = NOW() WHERE id = $1`,
      [projectId]
    );

    // Save uploaded files
    for (let fileData of uploadedFiles) {
      await pool.query(
        `INSERT INTO project_files (project_id, file_url, public_id, uploaded_by) VALUES ($1, $2, $3, $4)`,
        [projectId, fileData.url, fileData.public_id, freelancerId]
      );
    }

    // Log event
    await pool.query(
      `INSERT INTO completion_history (project_id, event, timestamp, actor, notes)
       VALUES ($1, 'revision_resubmitted', NOW(), $2, $3)`,
      [projectId, freelancerId, "Freelancer resubmitted after revision request"]
    );

    await LogCreators.projectOperation(freelancerId, ACTION_TYPES.PROJECT_STATUS_CHANGE, projectId, true, { action: "revision_resubmitted" });

    try {
      await NotificationCreators.workResubmittedForReview(projectId, project.title, freelancerId);
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    return res.json({ success: true, message: "Revision resubmitted", files: uploadedFiles });
  } catch (err) {
    console.error("resubmitWorkCompletion error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
