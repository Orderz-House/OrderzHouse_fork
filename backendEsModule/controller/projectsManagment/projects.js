import pool from "../../models/db.js";
import { LogCreators, ACTION_TYPES } from "../../services/loggingService.js";
import { NotificationCreators } from "../../services/notificationService.js";
import cloudinary from "../../cloudinary/setupfile.js";
import { Readable } from "stream";
import multer from "multer";

// Multer memory storage
const storage = multer.memoryStorage();
export const upload = multer({ storage });

/**
 * Upload fields for cover + project files (if sent as form-data)
 */
export const uploadProjectMedia = upload.fields([
  { name: "cover_pic", maxCount: 1 },
  { name: "project_files", maxCount: 10 },
]);

/**
 * Upload Buffer to Cloudinary
 */
export const uploadToCloudinary = (buffer, folder = "project_files") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

/* ======================================================================
   1) CREATE PROJECT
====================================================================== */

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
      preferred_skills,
    } = req.body;

    // ------------ Required validation ------------
    const missingFields = [];
    if (!category_id) missingFields.push("category_id");
    if (!sub_sub_category_id) missingFields.push("sub_sub_category_id");
    if (!title) missingFields.push("title");
    if (!description) missingFields.push("description");
    if (!duration_type) missingFields.push("duration_type");
    if (!["fixed", "hourly", "bidding"].includes(project_type))
      missingFields.push("project_type");

    if (duration_type === "days" && (!duration_days || duration_days <= 0))
      missingFields.push("duration_days");
    if (duration_type === "hours" && (!duration_hours || duration_hours <= 0))
      missingFields.push("duration_hours");

    if (project_type === "fixed" && (!budget || budget <= 0))
      missingFields.push("budget");
    if (project_type === "hourly" && (!hourly_rate || hourly_rate <= 0))
      missingFields.push("hourly_rate");
    if (project_type === "bidding") {
      if (!budget_min || budget_min <= 0) missingFields.push("budget_min");
      if (!budget_max || budget_max <= 0) missingFields.push("budget_max");
      if (budget_max < budget_min)
        missingFields.push("budget_max < budget_min");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing or invalid required fields: ${missingFields.join(", ")}`,
      });
    }

    // ------------ Length validation ------------
    const titleLength = title.trim().length;
    const descLength = description.trim().length;

    if (titleLength < 10 || titleLength > 100) {
      return res.status(400).json({
        success: false,
        message: "Title must be between 10 and 100 characters.",
      });
    }

    if (descLength < 100 || descLength > 2000) {
      return res.status(400).json({
        success: false,
        message: "Description must be between 100 and 2000 characters.",
      });
    }

    // ------------ Project status logic ------------
    let projectStatus = "pending";
    if (project_type === "bidding") projectStatus = "bidding";
    else if (["fixed", "hourly"].includes(project_type))
      projectStatus = "pending_payment";

    const durationDaysValue = duration_type === "days" ? duration_days : null;
    const durationHoursValue = duration_type === "hours" ? duration_hours : null;

    // ------------ Step 1: Insert project ------------
    const insertQuery = `
      INSERT INTO projects (
        user_id, category_id, sub_category_id, sub_sub_category_id,
        title, description, budget, duration_days, duration_hours,
        project_type, budget_min, budget_max, hourly_rate,
        preferred_skills, status, completion_status, is_deleted
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,
        $10,$11,$12,$13,$14,$15,'not_started',false
      ) RETURNING *;
    `;

    const { rows } = await pool.query(insertQuery, [
      userId,
      category_id,
      sub_category_id,
      sub_sub_category_id,
      title.trim(),
      description.trim(),
      budget || null,
      durationDaysValue,
      durationHoursValue,
      project_type,
      budget_min || null,
      budget_max || null,
      hourly_rate || null,
      preferred_skills || [],
      projectStatus,
    ]);

    let project = rows[0];

    // ------------ Step 2: Upload cover pic (optional) ------------
    if (req.files?.cover_pic && req.files.cover_pic.length > 0) {
      const coverPicFile = req.files.cover_pic[0];
      const coverPicResult = await uploadToCloudinary(
        coverPicFile.buffer,
        `projects/${project.id}/cover`
      );
      const coverPicUrl = coverPicResult.secure_url;

      const { rows: updatedProject } = await pool.query(
        `UPDATE projects SET cover_pic = $1 WHERE id = $2 RETURNING *`,
        [coverPicUrl, project.id]
      );
      project = updatedProject[0];
    }

    // ------------ Step 3: amount_to_pay ------------
    let amountToPay = null;
    if (project.project_type === "fixed") amountToPay = project.budget;
    else if (project.project_type === "hourly")
      amountToPay = (project.hourly_rate || 0) * 3;

    if (amountToPay !== null) {
      const { rows: updated } = await pool.query(
        `UPDATE projects SET amount_to_pay = $1 WHERE id = $2 RETURNING *`,
        [amountToPay, project.id]
      );
      project = updated[0];
    }

    // ------------ Step 4: logs & notifications ------------
    await LogCreators.projectOperation(
      userId,
      ACTION_TYPES.PROJECT_CREATE,
      project.id,
      true,
      { title: project.title, category_id: project.category_id }
    );

    try {
      await NotificationCreators.projectCreated(
        project.id,
        project.title,
        userId,
        project.category_id
      );
    } catch (err) {
      console.error("Error creating project notifications:", err);
    }

    return res.status(201).json({ success: true, project });
  } catch (error) {
    console.error("createProject error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ======================================================================
   2) ASSIGNMENT / INVITES (CLIENT & FREELANCER)
====================================================================== */

/**
 * Client → invite specific freelancer to project
 */
export const assignFreelancer = async (req, res) => {
  try {
    const clientId = req.token?.userId;
    const { projectId } = req.params;
    const { freelancer_id } = req.body;

    if (!freelancer_id) {
      return res
        .status(400)
        .json({ success: false, message: "freelancer_id is required" });
    }

    const { rows: projectRows } = await pool.query(
      `SELECT id, title, user_id, status 
       FROM projects 
       WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );

    if (!projectRows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const project = projectRows[0];
    if (project.user_id !== clientId) {
      return res.status(403).json({
        success: false,
        message: "You can only invite freelancers to your own projects",
      });
    }

    const { rows: freelancerRows } = await pool.query(
      `SELECT id, role_id, is_verified 
       FROM users 
       WHERE id = $1 AND is_deleted = false`,
      [freelancer_id]
    );

    if (!freelancerRows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Freelancer not found" });
    }

    const freelancer = freelancerRows[0];
    if (freelancer.role_id !== 3 || !freelancer.is_verified) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid freelancer" });
    }

    const { rows: existing } = await pool.query(
      `SELECT id FROM project_assignments 
       WHERE project_id = $1 AND freelancer_id = $2`,
      [projectId, freelancer_id]
    );

    if (existing.length) {
      return res.status(400).json({
        success: false,
        message: "Freelancer already invited or assigned",
      });
    }

    const assignedAt = new Date();
    const { rows: assignmentRows } = await pool.query(
      `INSERT INTO project_assignments 
        (project_id, freelancer_id, assigned_at, status, assignment_type, user_invited)
       VALUES ($1, $2, $3, 'pending_acceptance', 'by_client', true)
       RETURNING *`,
      [projectId, freelancer_id, assignedAt]
    );

    const assignment = assignmentRows[0];

    await pool.query(
      `UPDATE projects
       SET status = 'pending_acceptance',
           completion_status = 'invitation_sent'
       WHERE id = $1`,
      [projectId]
    );

    await LogCreators.projectOperation(
      clientId,
      ACTION_TYPES.ASSIGNMENT_CREATE,
      projectId,
      true,
      {
        freelancer_id,
        assignment_id: assignment.id,
        type: "by_client",
        action: "invitation_sent",
      }
    );

    try {
      if (NotificationCreators?.freelancerAssignmentChanged) {
        await NotificationCreators.freelancerAssignmentChanged(
          projectId,
          freelancer_id,
          true
        );
      }
    } catch (err) {
      console.error("Notification error:", err);
    }

    return res.status(201).json({
      success: true,
      message:
        "Invitation sent successfully. Waiting for freelancer response.",
      assignment,
    });
  } catch (error) {
    console.error("assignFreelancer error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};

/**
 * Freelancer → apply to active fixed/hourly project
 */
export const applyForProject = async (req, res) => {
  try {
    const freelancerId = req.token?.userId;
    const { projectId } = req.params;

    const { rows: freelancerRows } = await pool.query(
      `SELECT role_id, is_verified 
       FROM users 
       WHERE id = $1 AND is_deleted = false`,
      [freelancerId]
    );

    if (!freelancerRows.length || freelancerRows[0].role_id !== 3)
      return res.status(403).json({ success: false, message: "Only freelancers can apply" });

    if (!freelancerRows[0].is_verified)
      return res.status(403).json({ success: false, message: "Freelancer must be verified to apply" });

    const { rows: projectRows } = await pool.query(
      `SELECT id, user_id, title, project_type, status 
       FROM projects 
       WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );

    if (!projectRows.length)
      return res.status(404).json({ success: false, message: "Project not found" });

    const project = projectRows[0];

    if (!["fixed", "hourly"].includes(project.project_type)) {
      return res.status(400).json({
        success: false,
        message: "You can only apply for fixed or hourly projects",
      });
    }

    if (project.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "You can only apply to projects that are active",
      });
    }

    const { rows: existing } = await pool.query(
      `SELECT id 
       FROM project_assignments 
       WHERE project_id = $1 AND freelancer_id = $2`,
      [projectId, freelancerId]
    );

    if (existing.length) {
      return res.status(400).json({
        success: false,
        message: "You have already applied or are assigned to this project",
      });
    }

    const assignedAt = new Date();

    const { rows: inserted } = await pool.query(
      `INSERT INTO project_assignments 
        (project_id, freelancer_id, assigned_at, status, assignment_type)
       VALUES ($1, $2, $3, 'pending_client_approval', 'by_freelancer')
       RETURNING *`,
      [projectId, freelancerId, assignedAt]
    );

    const assignment = inserted[0];

    await LogCreators.projectOperation(
      freelancerId,
      ACTION_TYPES.ASSIGNMENT_CREATE,
      projectId,
      true,
      { freelancer_id: freelancerId, assignment_id: assignment.id, assignment_type: "by_freelancer" }
    );

    try {
      await NotificationCreators.freelancerAppliedForProject(
        project.user_id,
        freelancerId,
        projectId,
        project.title
      );
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    return res.status(201).json({
      success: true,
      message: "Application sent successfully. Waiting for client approval.",
      assignment,
    });

  } catch (error) {
    console.error("applyForProject error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Client → approve or reject freelancer's application (by_freelancer)
 */
export const approveOrRejectApplication = async (req, res) => {
  const client = await pool.connect();
  try {
    const clientId = req.token?.userId;
    const { assignmentId, action } = req.body;

    if (!clientId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!["accept", "reject"].includes(action))
      return res.status(400).json({ success: false, message: "Invalid action" });

    const { rows: assignmentRows } = await client.query(
      `SELECT pa.*, p.user_id AS client_id, p.title AS project_title 
       FROM project_assignments pa
       JOIN projects p ON pa.project_id = p.id
       WHERE pa.id = $1`,
      [assignmentId]
    );

    if (!assignmentRows.length)
      return res.status(404).json({ success: false, message: "Application not found" });

    const assignment = assignmentRows[0];
    if (assignment.client_id !== clientId)
      return res.status(403).json({ success: false, message: "Not authorized" });

    await client.query("BEGIN");

    // Reject case
    if (action === "reject") {
      await client.query(
        `UPDATE project_assignments SET status = 'rejected' WHERE id = $1`,
        [assignmentId]
      );
      await client.query("COMMIT");
      try {
        await NotificationCreators.freelancerApplicationStatusChanged(
          assignment.project_id,
          assignment.freelancer_id,
          assignment.project_title,
          false
        );
      } catch (e) {
        console.error(e);
      }
      return res.json({ success: true, message: "Application rejected" });
    }

    const existingAccepted = await client.query(
      `SELECT id FROM project_assignments WHERE project_id = $1 AND status = 'active'`,
      [assignment.project_id]
    );
    if (existingAccepted.rows.length > 0)
      return res.status(400).json({ success: false, message: "Only one freelancer can be accepted per project" });

    await client.query(
      `UPDATE project_assignments SET status = 'active' WHERE id = $1`,
      [assignmentId]
    );

    await client.query(
      `UPDATE project_assignments SET status = 'not_chosen' 
       WHERE project_id = $1 AND id <> $2 AND status = 'pending_client_approval'`,
      [assignment.project_id, assignmentId]
    );

    await client.query(
      `UPDATE projects 
       SET assigned_freelancer_id = $1, status = 'in_progress', completion_status = 'in_progress'
       WHERE id = $2`,
      [assignment.freelancer_id, assignment.project_id]
    );

    await client.query("COMMIT");

    try {
      await NotificationCreators.freelancerApplicationStatusChanged(
        assignment.project_id,
        assignment.freelancer_id,
        assignment.project_title,
        true
      );
      await NotificationCreators.freelancerAssigned(
        assignment.freelancer_id,
        assignment.project_id,
        assignment.project_title
      );
    } catch (e) {
      console.error(e);
    }

    return res.json({ success: true, message: "Freelancer accepted and project activated" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("approveOrRejectApplication error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
};

/**
 * Freelancer → accept client invitation (assignment created by client)
 */
export const acceptAssignment = async (req, res) => {
  try {
    const freelancerId = req.token?.userId;
    const { assignmentId } = req.params;

    const { rows } = await pool.query(
      `SELECT * FROM project_assignments 
       WHERE id = $1 AND freelancer_id = $2 AND status = 'pending_acceptance'`,
      [assignmentId, freelancerId]
    );

    if (!rows.length)
      return res.status(404).json({ success: false, message: "No pending invitation found" });

    const assignment = rows[0];

    await pool.query(
      `UPDATE project_assignments SET status = 'active' WHERE id = $1`,
      [assignmentId]
    );

    await pool.query(
      `UPDATE projects 
       SET status = 'in_progress', 
           completion_status = 'in_progress', 
           assigned_freelancer_id = $1 
       WHERE id = $2`,
      [freelancerId, assignment.project_id]
    );

    await LogCreators.projectOperation(
      freelancerId,
      ACTION_TYPES.ASSIGNMENT_ACCEPT,
      assignment.project_id,
      true
    );

    try {
      await NotificationCreators.freelancerAcceptedAssignment(
        assignment.project_id,
        freelancerId
      );
    } catch (err) {
      console.error("Notification error:", err);
    }

    res.json({ success: true, message: "Assignment accepted successfully, project now in progress" });
  } catch (error) {
    console.error("acceptAssignment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Freelancer → reject client invitation
 */
export const rejectAssignment = async (req, res) => {
  try {
    const freelancerId = req.token?.userId;
    const { assignmentId } = req.params;

    const { rows } = await pool.query(
      `SELECT * FROM project_assignments WHERE id = $1 AND freelancer_id = $2 AND status = 'pending_acceptance'`,
      [assignmentId, freelancerId]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: "No pending invitation found" });

    const assignment = rows[0];

    await pool.query(
      `UPDATE project_assignments SET status = 'rejected' WHERE id = $1`,
      [assignmentId]
    );

    await LogCreators.projectOperation(
      freelancerId,
      ACTION_TYPES.ASSIGNMENT_REJECT,
      assignment.project_id,
      true
    );
    try {
      await NotificationCreators.freelancerRejectedAssignment(
        assignment.project_id,
        freelancerId
      );
    } catch (err) {
      console.error("Notification error:", err);
    }

    res.json({ success: true, message: "Assignment rejected successfully" });
  } catch (error) {
    console.error("rejectAssignment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Client → get all applications on his projects
 */
export const getApplicationsForMyProjects = async (req, res) => {
  try {
    const ownerId = req.token?.userId;
    if (!ownerId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { rows } = await pool.query(
      `SELECT pa.id AS assignment_id, pa.freelancer_id, u.username AS freelancer_name,
              u.email AS freelancer_email, pa.status, pa.assigned_at,
              p.id AS project_id, p.title AS project_title
       FROM project_assignments pa
       JOIN projects p ON pa.project_id = p.id
       JOIN users u ON pa.freelancer_id = u.id
       WHERE p.user_id = $1
       ORDER BY pa.assigned_at DESC`,
      [ownerId]
    );

    res.json({ success: true, applications: rows });
  } catch (err) {
    console.error("getApplicationsForMyProjects error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ======================================================================
   3) WORK COMPLETION (CLIENT REVIEW + FREELANCER RESUBMIT)
====================================================================== */

/**
 * Client → approve work or request revision
 */
export const approveWorkCompletion = async (req, res) => {
  try {
    const clientId = req.token.userId;
    const { projectId } = req.params;
    const { action } = req.body; // 'approve' or 'revision_requested'

    if (!["approve", "revision_requested"].includes(action)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });
    }

    const { rows: projectRows } = await pool.query(
      `SELECT user_id, assigned_freelancer_id, title 
       FROM projects 
       WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );
    if (!projectRows.length)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    const project = projectRows[0];
    if (project.user_id !== clientId)
      return res
        .status(403)
        .json({ success: false, message: "Only client can approve work" });

    const newStatus =
      action === "approve" ? "completed" : "revision_requested";

    await pool.query(
      `UPDATE projects 
         SET completion_status = $1, completed_at = NOW() 
       WHERE id = $2`,
      [newStatus, projectId]
    );

    await pool.query(
      `INSERT INTO completion_history (project_id, event, timestamp, actor, notes)
       VALUES ($1, $2, NOW(), $3, $4)`,
      [projectId, newStatus, clientId, `Client ${action}`]
    );

    await LogCreators.projectOperation(
      clientId,
      ACTION_TYPES.PROJECT_STATUS_CHANGE,
      projectId,
      true,
      { action: newStatus }
    );

    try {
      await NotificationCreators.workCompletionReviewed(
        project.assigned_freelancer_id,
        projectId,
        project.title,
        newStatus
      );
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
 * Freelancer → resubmit work after revision requested
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

    if (!projectRows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    const project = projectRows[0];

    if (project.assigned_freelancer_id !== freelancerId) {
      return res.status(403).json({
        success: false,
        message: "Only assigned freelancer can resubmit",
      });
    }

    if (project.completion_status !== "revision_requested") {
      return res.status(400).json({
        success: false,
        message: "Project is not requesting revision",
      });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const result = await uploadToCloudinary(
        file.buffer,
        `projects/${projectId}`
      );

      uploadedFiles.push({
        file_name: file.originalname,
        file_size: file.size,
        file_url: result.secure_url,
        public_id: result.public_id,
      });
    }

    await pool.query(
      `UPDATE projects 
         SET completion_status = 'pending_review', 
             completion_requested_at = NOW() 
       WHERE id = $1`,
      [projectId]
    );

    for (const fileData of uploadedFiles) {
      await pool.query(
        `INSERT INTO project_files 
          (project_id, sender_id, file_name, file_url, file_size, public_id) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          projectId,
          freelancerId,
          fileData.file_name,
          fileData.file_url,
          fileData.file_size,
          fileData.public_id,
        ]
      );
    }

    await pool.query(
      `INSERT INTO completion_history (project_id, event, timestamp, actor, notes)
       VALUES ($1, 'revision_resubmitted', NOW(), $2, $3)`,
      [projectId, freelancerId, "Freelancer resubmitted after revision request"]
    );

    await LogCreators.projectOperation(
      freelancerId,
      ACTION_TYPES.PROJECT_STATUS_CHANGE,
      projectId,
      true,
      { action: "revision_resubmitted" }
    );

    try {
      await NotificationCreators.workResubmittedForReview(
        projectId,
        project.title,
        freelancerId
      );
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    return res.json({
      success: true,
      message: "Revision resubmitted",
      files: uploadedFiles,
    });
  } catch (err) {
    console.error("resubmitWorkCompletion error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ======================================================================
   4) HOURLY PROJECT COMPLETION
====================================================================== */

export const completeHourlyProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { total_hours } = req.body;
    const userId = req.token?.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    if (typeof total_hours !== "number" || total_hours < 0) {
      return res.status(400).json({
        success: false,
        message: "total_hours must be a non-negative number",
      });
    }

    const { rows: projectRows } = await pool.query(
      `SELECT * FROM projects WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );
    if (!projectRows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const project = projectRows[0];

    if (String(project.user_id) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can complete this hourly project",
      });
    }

    if (project.project_type !== "hourly") {
      return res
        .status(400)
        .json({ success: false, message: "Not an hourly project" });
    }

    const prepaidHours = project.prepaid_hours || 3;
    const hourlyRate = project.hourly_rate;

    let refundAmount = 0,
      extraPayment = 0;
    if (total_hours < prepaidHours)
      refundAmount = (prepaidHours - total_hours) * hourlyRate;
    else if (total_hours > prepaidHours)
      extraPayment = (total_hours - prepaidHours) * hourlyRate;

    const finalAmount = total_hours * hourlyRate;

    const { rows: updated } = await pool.query(
      `UPDATE projects 
         SET total_hours = $1, amount_to_pay = $2, status = 'completed' 
       WHERE id = $3 
       RETURNING *`,
      [total_hours, finalAmount, projectId]
    );

    if (refundAmount > 0) {
      await pool.query(
        `UPDATE wallets SET balance = balance + $1 WHERE user_id = $2`,
        [refundAmount, project.user_id]
      );
    }
    if (extraPayment > 0) {
      await pool.query(
        `UPDATE wallets SET balance = balance - $1 WHERE user_id = $2`,
        [extraPayment, project.user_id]
      );
    }

    return res.status(200).json({
      success: true,
      project: updated[0],
      refund: refundAmount || null,
      extra_payment: extraPayment || null,
    });
  } catch (error) {
    console.error("completeHourlyProject error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ======================================================================
   5) PROJECT FILES (CHAT / DELIVERY FILES)
====================================================================== */

export const addProjectFiles = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.token?.userId;

  if (!userId)
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized" });
  if (!req.files || req.files.length === 0)
    return res
      .status(400)
      .json({ success: false, message: "No files uploaded" });

  try {
    const uploadedFiles = [];

    for (const file of req.files) {
      const result = await uploadToCloudinary(
        file.buffer,
        `projects/${projectId}`
      );

      const { rows } = await pool.query(
        `INSERT INTO project_files 
          (project_id, sender_id, file_name, file_url, file_size, public_id) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [
          projectId,
          userId,
          file.originalname,
          result.secure_url,
          file.size,
          result.public_id,
        ]
      );

      uploadedFiles.push(rows[0]);
    }

    res.json({ success: true, files: uploadedFiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "File upload failed",
      error: err.message,
    });
  }
};

/* ======================================================================
   6) DELETE PROJECT + TIMELINE
====================================================================== */

/**
 * Client → soft delete own project
 */
export const deleteProjectByOwner = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { projectId } = req.params;

    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    if (!projectId)
      return res
        .status(400)
        .json({ success: false, message: "Missing projectId" });

    const { rows } = await pool.query(
      `SELECT id, user_id, title 
       FROM projects 
       WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );

    if (!rows.length)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    const project = rows[0];
    if (String(project.user_id) !== String(userId))
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to delete this project" });

    await pool.query(`UPDATE projects SET is_deleted = true WHERE id = $1`, [
      projectId,
    ]);

    try {
      await LogCreators.projectOperation(
        userId,
        ACTION_TYPES.PROJECT_DELETE,
        projectId,
        true,
        { title: project.title }
      );
    } catch (e) {
      console.error("project delete log error:", e);
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data: { id: projectId },
    });
  } catch (err) {
    console.error("deleteProjectByOwner error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Timeline of project status (for client/freelancer UI)
 */
export const getProjectTimeline = async (req, res) => {
  try {
    const { projectId } = req.params;

    const { rows: projectRows } = await pool.query(
      `SELECT 
         p.id, p.title, p.status, p.completion_status, 
         p.created_at, p.assigned_freelancer_id, 
         u.username AS client_name, 
         f.username AS freelancer_name
       FROM projects p
       LEFT JOIN users u ON u.id = p.user_id
       LEFT JOIN users f ON f.id = p.assigned_freelancer_id
       WHERE p.id = $1 AND p.is_deleted = false`,
      [projectId]
    );

    if (!projectRows.length)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    const project = projectRows[0];

    const { rows: history } = await pool.query(
      `SELECT event, timestamp 
       FROM completion_history 
       WHERE project_id = $1 
       ORDER BY timestamp ASC`,
      [projectId]
    );

    const getEventTime = (eventName) =>
      history.find((h) => h.event === eventName)?.timestamp || null;

    const timeline = [
      {
        step: "Project Created",
        status: "done",
        timestamp: project.created_at,
      },
      {
        step: "Freelancer Invited / Application Sent",
        status: ["pending_acceptance", "pending_client_approval"].includes(
          project.status
        )
          ? "active"
          : ["in_progress", "pending_review", "completed", "revision_requested"].includes(
              project.status
            )
          ? "done"
          : "pending",
        timestamp: getEventTime("invitation_sent"),
      },
      {
        step: "Freelancer Accepted",
        status:
          project.status === "in_progress" ||
          ["pending_review", "completed", "revision_requested"].includes(
            project.completion_status
          )
            ? "done"
            : "pending",
        timestamp: getEventTime("freelancer_accepted"),
      },
      {
        step: "Work in Progress",
        status:
          project.status === "in_progress" &&
          project.completion_status === "in_progress"
            ? "active"
            : ["pending_review", "revision_requested", "completed"].includes(
                project.completion_status
              )
            ? "done"
            : "pending",
        timestamp: getEventTime("work_started"),
      },
      {
        step: "Work Submitted for Review",
        status:
          project.completion_status === "pending_review"
            ? "active"
            : ["revision_requested", "completed"].includes(
                project.completion_status
              )
            ? "done"
            : "pending",
        timestamp: getEventTime("completion_requested"),
      },
      {
        step: "Client Review / Revision",
        status:
          project.completion_status === "revision_requested"
            ? "active"
            : project.completion_status === "completed"
            ? "done"
            : "pending",
        timestamp: getEventTime("revision_requested"),
      },
      {
        step: "Project Completed",
        status:
          project.completion_status === "completed" ? "done" : "pending",
        timestamp: getEventTime("completed"),
      },
    ];

    return res.json({
      success: true,
      project_id: project.id,
      title: project.title,
      client: project.client_name,
      freelancer: project.freelancer_name,
      status: project.status,
      completion_status: project.completion_status,
      timeline,
    });
  } catch (error) {
    console.error("getProjectTimeline error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ======================================================================
   7) DISCOVERY / HELPERS
====================================================================== */

/**
 * Find available freelancers related to a category
 */
export const getRelatedFreelancers = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const { rows: freelancers } = await pool.query(
      `
      SELECT DISTINCT u.*
      FROM users u
      JOIN freelancer_categories fc ON u.id = fc.freelancer_id
      WHERE 
        fc.category_id = $1
        AND u.role_id = 3
        AND u.is_deleted = false
        AND u.is_verified = true
        AND NOT EXISTS (
          SELECT 1 
          FROM project_assignments pa
          JOIN projects p ON pa.project_id = p.id
          WHERE 
            pa.freelancer_id = u.id
            AND pa.status IN ('active', 'in_progress')
            AND p.completion_status IN ('in_progress', 'pending_review')
            AND p.is_deleted = false
        )
      ORDER BY u.id DESC;
      `,
      [categoryId]
    );

    res.status(200).json({
      success: true,
      count: freelancers.length,
      freelancers,
    });
  } catch (error) {
    console.error("Error fetching available freelancers:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching available freelancers",
    });
  }
};

/**
 * Simple helper: get list of all verified freelancers (can be used by client/admin UI)
 */
export const getAllFreelancers = async (req, res) => {
  try {
    const { rows: freelancers } = await pool.query(
      `
      SELECT id, username, email, first_name, last_name, profile_pic
      FROM users
      WHERE role_id = 3
        AND is_deleted = false
        AND is_verified = true
      ORDER BY username ASC;
      `
    );

    res.status(200).json({
      success: true,
      count: freelancers.length,
      freelancers,
    });
  } catch (error) {
    console.error("Error fetching all freelancers:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching freelancers",
    });
  }
};
