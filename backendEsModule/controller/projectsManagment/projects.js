import pool from "../../models/db.js";
import {
  LogCreators,
  ACTION_TYPES,
  ENTITY_TYPES,
} from "../../services/loggingService.js";
import { NotificationCreators } from "../../services/notificationService.js";

// Creates a new project with validation for fixed, bidding, or hourly types
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
      duration_type, // "days" or "hours"
      duration_days,
      duration_hours,
      project_type, // 'fixed' | 'bidding' | 'hourly'
      budget_min,
      budget_max,
      hourly_rate,
      preferred_skills // array of skills
    } = req.body;

    if (!category_id || !title || !description || !duration_type) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields (category_id, title, description, duration_type)",
      });
    }

    if (!["days", "hours"].includes(duration_type)) {
      return res.status(400).json({
        success: false,
        message: "duration_type must be either 'days' or 'hours'",
      });
    }

    if (!project_type) {
      return res.status(400).json({
        success: false,
        message: "project_type is required",
      });
    }

    if (project_type === "fixed") {
      if (
        budget === undefined ||
        (duration_type === "days"
          ? duration_days === undefined
          : duration_hours === undefined)
      ) {
        return res.status(400).json({
          success: false,
          message: "budget and duration are required for fixed projects",
        });
      }
    }

    if (project_type === "bidding") {
      if (
        budget_min === undefined ||
        budget_max === undefined ||
        (duration_type === "days"
          ? duration_days === undefined
          : duration_hours === undefined)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "budget_min, budget_max and duration are required for bidding projects",
        });
      }
    }

    if (project_type === "hourly" && hourly_rate === undefined) {
      return res.status(400).json({
        success: false,
        message: "hourly_rate is required for hourly projects",
      });
    }

    let projectStatus = "pending";
    if (project_type === "bidding") {
      projectStatus = "bidding";
    } else if (project_type === "fixed" || project_type === "hourly") {
      projectStatus = "pending_payment";
    }

    const insertQuery = `
      INSERT INTO projects (
        user_id, category_id, sub_category_id, sub_sub_category_id,
        title, description, budget, duration_days, duration_hours,
        project_type, budget_min, budget_max, hourly_rate,
        preferred_skills, status, is_deleted, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, false, null
      )
      RETURNING *;
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
    if (project.project_type === "fixed") {
      amountToPay = project.budget;
    } else if (project.project_type === "hourly") {
      amountToPay = (project.hourly_rate || 0) * 3;
    }

    if (amountToPay !== null) {
      const update = await pool.query(
        `UPDATE projects SET amount_to_pay = $1 WHERE id = $2 RETURNING *`,
        [amountToPay, project.id]
      );
      Object.assign(project, update.rows[0]);
    }

    return res.status(201).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("createProject error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Completes hourly projects and handles refunds/extra payments based on actual hours
export const completeHourlyProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { total_hours } = req.body;

    const { rows: projectRows } = await pool.query(
      `SELECT * FROM projects WHERE id = $1`,
      [projectId]
    );

    if (!projectRows.length) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const project = projectRows[0];
    if (project.project_type !== "hourly") {
      return res.status(400).json({ success: false, message: "Not an hourly project" });
    }

    const prepaidHours = project.prepaid_hours || 3;
    const hourlyRate = project.hourly_rate;

    let refundAmount = 0;
    let extraPayment = 0;

    if (total_hours < prepaidHours) {
      // Refund unused prepaid hours
      refundAmount = (prepaidHours - total_hours) * hourlyRate;
    } else if (total_hours > prepaidHours) {
      // Charge extra for overtime
      extraPayment = (total_hours - prepaidHours) * hourlyRate;
    }

    const finalAmount = total_hours * hourlyRate;

    // Update project
    const { rows: updated } = await pool.query(
      `UPDATE projects 
       SET total_hours = $1, amount_to_pay = $2, status = 'completed'
       WHERE id = $3 RETURNING *`,
      [total_hours, finalAmount, projectId]
    );

    // Refund logic
    if (refundAmount > 0) {
      await pool.query(
        `UPDATE wallets SET balance = balance + $1 WHERE user_id = $2`,
        [refundAmount, project.user_id]
      );
    }

    // Extra payment logic
    if (extraPayment > 0) {
      await pool.query(
        `UPDATE wallets SET balance = balance - $1 WHERE user_id = $2`,
        [extraPayment, project.user_id]
      );
    }

    return res.status(200).json({
      success: true,
      project: updated[0],
      refund: refundAmount > 0 ? refundAmount : null,
      extra_payment: extraPayment > 0 ? extraPayment : null,
    });
  } catch (error) {
    console.error("completeHourlyProject error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Assigns a freelancer to a project with validation and notifications
import pool from "../../models/db.js";
import { LogCreators, ACTION_TYPES } from "../../services/loggingService.js";

export const assignProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { freelancer_id, assignment_type = "solo" } = req.body;

    if (!freelancer_id) {
      return res.status(400).json({ success: false, message: "freelancer_id is required" });
    }

    const { rows: projectRows } = await pool.query(
      `SELECT id, duration_days, duration_hours, start_date, status 
       FROM projects 
       WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );
    if (!projectRows.length) return res.status(404).json({ success: false, message: "Project not found" });

    const project = projectRows[0];

    const { rows: userRows } = await pool.query(
      `SELECT role_id, is_verified FROM users WHERE id = $1 AND is_deleted = false`,
      [freelancer_id]
    );
    if (!userRows.length || userRows[0].role_id !== 3) {
      return res.status(403).json({ success: false, message: "Only verified freelancers can be assigned" });
    }

    if (!userRows[0].is_verified) {
      return res.status(403).json({ success: false, message: "Freelancer must be verified" });
    }

    const { rows: existing } = await pool.query(
      `SELECT id FROM project_assignments WHERE project_id = $1 AND freelancer_id = $2`,
      [projectId, freelancer_id]
    );
    if (existing.length) {
      return res.status(400).json({ success: false, message: "Freelancer already assigned" });
    }

    if (assignment_type === "solo") {
      const { rows: soloCheck } = await pool.query(
        `SELECT id FROM project_assignments WHERE project_id = $1 AND assignment_type = 'solo'`,
        [projectId]
      );
      if (soloCheck.length) {
        return res.status(400).json({ success: false, message: "This project already has a solo assignment" });
      }
    }

    const assignedAt = new Date();
    let deadline = null;
    if (project.duration_days) {
      deadline = new Date(assignedAt.getTime() + project.duration_days * 24 * 60 * 60 * 1000);
    } else if (project.duration_hours) {
      deadline = new Date(assignedAt.getTime() + project.duration_hours * 60 * 60 * 1000);
    }

    const { rows: inserted } = await pool.query(
      `INSERT INTO project_assignments 
       (project_id, freelancer_id, assigned_at, status, assignment_type, deadline)
       VALUES ($1, $2, $3, 'active', $4, $5)
       RETURNING *`,
      [projectId, freelancer_id, assignedAt, assignment_type, deadline]
    );

    if (assignment_type === "solo") {
      await pool.query(
        `UPDATE projects
         SET status = 'active',
             completion_status = 'not_started'
         WHERE id = $1`,
        [projectId]
      );
    }

    await LogCreators.projectOperation(
      req.token?.userId || 0,
      ACTION_TYPES.ASSIGNMENT_CREATE,
      projectId,
      true,
      { freelancer_id, assignment_id: inserted[0].id, assignment_type }
    );

    return res.status(201).json({ success: true, assignment: inserted[0] });
  } catch (error) {
    console.error("assignProject error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// Updates freelancer assignment status (active, kicked, quit, banned, completed)
export const updateAssignmentStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { freelancer_id, status } = req.body;

    if (!freelancer_id || !status) {
      return res.status(400).json({
        success: false,
        message: "freelancer_id and status are required",
      });
    }

    // ✅ السماح فقط بالقيم المحددة
    const validStatuses = ["active", "kicked", "quit", "banned", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
      });
    }

    // تحقق أن المشروع موجود
    const projectResult = await pool.query(
      `SELECT id FROM projects WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );
    if (!projectResult.rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // تحديث الحالة
    const updateQuery = `
      UPDATE project_assignments
      SET status = $3
      WHERE project_id = $1 AND freelancer_id = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(updateQuery, [
      projectId,
      freelancer_id,
      status,
    ]);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found for this freelancer in the project",
      });
    }

    await LogCreators.projectOperation(
      req.token?.userId || 0,
      ACTION_TYPES.ASSIGNMENT_STATUS_CHANGE,
      projectId,
      true,
      { freelancer_id, status, assignment_id: rows[0].id }
    );

    if (status === "kicked" || status === "banned") {
      try {
        await NotificationCreators.freelancerAssignmentChanged(
          projectId,
          freelancer_id,
          req.token?.userId || 0,
          false
        );
      } catch (notificationError) {
        console.error(
          "Error creating assignment status notification:",
          notificationError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: `Assignment status updated to '${status}'`,
      assignment: rows[0],
    });
  } catch (error) {
    console.error("updateAssignmentStatus error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Retrieves freelancers who work in a specific category
export const getRelatedFreelancers = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const { rows: freelancers } = await pool.query(
      `SELECT u.*
       FROM users u
       JOIN freelancer_categories fc 
         ON u.id = fc.freelancer_id
       WHERE fc.category_id = $1
         AND u.role_id = 3
         AND u.is_deleted = false`,
      [categoryId]
    );

    res.status(200).json({ success: true, freelancers });
  } catch (error) {
    console.error("Error fetching related freelancers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Lists all available projects for freelancers to submit offers
export const getAllProjectForOffer = (req, res) => {
  pool
    .query(
      `SELECT 
       p.*, 
       u.id AS user_id, 
       u.first_name, 
       u.last_name, 
       u.email, 
       u.username FROM projects p JOIN users u ON u.id = p.user_id WHERE p.status = 'available'`
    )
    .then((result) => {
      res.status(200).json({
        success: true,
        message: `All Project available`,
        projects: result.rows,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: `Server Error`,
        error: err,
      });
    });
};

