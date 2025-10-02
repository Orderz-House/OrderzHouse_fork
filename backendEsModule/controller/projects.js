import pool  from "../models/db.js";
import {
  LogCreators,
  ACTION_TYPES,
  ENTITY_TYPES,
} from "../services/loggingService.js";
import { debitWallet, creditWallet } from "../services/walletService.js";
import { NotificationCreators } from "../services/notificationService.js";

export const createProject = async (req, res) => {
  try {
    const userId = req.token?.userId;

    const {
      category_id,
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
      preferred_skills, // array of skills
    } = req.body;

    // Validate required fields for all projects
    if (!category_id || !title || !description || !duration_type) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields (category_id, title, description, duration_type)",
      });
    }

    if (duration_type !== "days" && duration_type !== "hours") {
      return res.status(400).json({
        success: false,
        message: "duration_type must be either 'days' or 'hours'",
      });
    }

    // Validate type-specific fields
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

    if (project_type === "hourly") {
      if (hourly_rate === undefined) {
        return res.status(400).json({
          success: false,
          message: "hourly_rate is required for hourly projects",
        });
      }
    }

    // Determine project status based on project type
    let projectStatus = "pending"; // default
    if (project_type === "bidding") {
      projectStatus = "bidding"; // immediately available for offers
    } else if (project_type === "fixed" || project_type === "hourly") {
      projectStatus = "pending_payment"; // waiting for payment before becoming active
    }

    // Insert project
    const insertQuery = `
      INSERT INTO projects (
        user_id, category_id, title, description,
        budget, duration_days, duration_hours, project_type,
        budget_min, budget_max, hourly_rate,
        preferred_skills,
        status, is_deleted, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12, $13, false, null
      ) RETURNING *;
    `;

    const durationDaysValue = duration_type === "days" ? duration_days : null;
    const durationHoursValue =
      duration_type === "hours" ? duration_hours : null;

    const { rows } = await pool.query(insertQuery, [
      userId,
      category_id,
      title,
      description,
      budget || null,
      durationDaysValue,
      durationHoursValue,
      project_type,
      budget_min || null,
      budget_max || null,
      hourly_rate || null,
      preferred_skills || null,
      projectStatus,
    ]);

    const project = rows[0];

    // Calculate amount_to_pay
    let amountToPay = null;
    if (project.project_type === "fixed") {
      amountToPay = project.budget; // exactly as budget
    } else if (project.project_type === "hourly") {
      amountToPay = (project.budget || 0) * 3; // budget * 3
    } else if (project.project_type === "bidding") {
      amountToPay = null; // will be based on offers later
    }

    if (amountToPay !== null) {
      const update = await pool.query(
        `UPDATE projects SET amount_to_pay = $1 WHERE id = $2 RETURNING *`,
        [amountToPay, project.id]
      );
      Object.assign(project, update.rows[0]); // merge updated field into project object
    }

    // Log creation
    await LogCreators.projectOperation(
      userId,
      ACTION_TYPES.PROJECT_CREATE,
      project.id,
      true,
      { title: project.title, category_id: project.category_id }
    );

    // Notification (non-blocking)
    try {
      await NotificationCreators.projectCreated(
        project.id,
        project.title,
        userId,
        project.category_id
      );
    } catch (notificationError) {
      console.error("Error creating project notifications:", notificationError);
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

// Get projects created by the authenticated user
import { pool } from "../models/db.js";

export const getMyProjects = async (req, res) => {
  try {
    const userId = req.token?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { rows } = await pool.query(
      `
      SELECT 
        p.*
      FROM projects p
      WHERE p.user_id = $1
        AND p.is_deleted = false
      ORDER BY p.created_at DESC;
      `,
      [userId]
    );

    return res.json({ success: true, projects: rows });
  } catch (error) {
    console.error("getMyProjects error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// Assign a freelancer to a project
export const assignProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { freelancer_id, assignment_type = "solo" } = req.body;

    // Validate freelancer_id
    if (!freelancer_id) {
      return res
        .status(400)
        .json({ success: false, message: "freelancer_id is required" });
    }

    // Check if project exists
    const projectResult = await pool.query(
      `SELECT id FROM projects WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );
    if (!projectResult.rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Check if freelancer exists and is role 3
    const userResult = await pool.query(
      `SELECT role_id FROM users WHERE id = $1 AND is_deleted = false`,
      [freelancer_id]
    );
    if (!userResult.rows.length || userResult.rows[0].role_id !== 3) {
      return res
        .status(403)
        .json({ success: false, message: "Only freelancers can be assigned" });
    }

    // If solo assignment, ensure no one is already assigned
    if (assignment_type === "solo") {
      const soloCheck = await pool.query(
        `SELECT id FROM project_assignments WHERE project_id = $1 AND assignment_type = 'solo'`,
        [projectId]
      );
      if (soloCheck.rows.length) {
        return res.status(400).json({
          success: false,
          message: "This project already has a solo assignment",
        });
      }
    }

    // Check if freelancer already assigned
    const existsResult = await pool.query(
      `SELECT id FROM project_assignments WHERE project_id = $1 AND freelancer_id = $2`,
      [projectId, freelancer_id]
    );
    if (existsResult.rows.length) {
      return res
        .status(400)
        .json({ success: false, message: "Freelancer already assigned" });
    }

    // Insert assignment
    const insertAssign = `
      INSERT INTO project_assignments (project_id, freelancer_id, status, assignment_type)
      VALUES ($1, $2, 'active', $3)
      RETURNING *;
    `;
    const { rows } = await pool.query(insertAssign, [
      projectId,
      freelancer_id,
      assignment_type,
    ]);

    if (rows.length > 0) {
      // Update project (optional — depends on your logic)
      if (assignment_type === "solo") {
        await pool.query(
          `UPDATE projects
           SET completion_status = 'not_started',
               status = 'active'
           WHERE id = $1`,
          [projectId]
        );
      }

      // Log assignment
      await LogCreators.projectOperation(
        req.token?.userId || 0,
        ACTION_TYPES.ASSIGNMENT_CREATE,
        projectId,
        true,
        { freelancer_id, assignment_id: rows[0].id, assignment_type }
      );

      // Notification
      try {
        await NotificationCreators.freelancerAssignmentChanged(
          projectId,
          freelancer_id,
          req.token?.userId || 0,
          true
        );
      } catch (notificationError) {
        console.error(
          "Error creating assignment notification:",
          notificationError
        );
      }
    }

    return res.status(201).json({ success: true, assignment: rows[0] });
  } catch (error) {
    console.error("assignProject error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update freelancer assignment status
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

// List users by role id (helper for frontend selection)
export const listUsersByRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, email, username, role_id
       FROM users WHERE role_id = $1 AND is_deleted = false`,
      [Number(roleId)]
    );
    return res.json({ success: true, users: rows });
  } catch (error) {
    console.error("listUsersByRole error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Public: list categories
export const getCategories = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, description FROM categories ORDER BY id ASC`
    );
    return res.json({ success: true, categories: rows });
  } catch (error) {
    console.error("getCategories error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Public: list sub categories by category id (if table exists)
export const getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { rows } = await pool.query(
      `SELECT id, name FROM sub_categories WHERE category_id = $1 ORDER BY id ASC`,
      [categoryId]
    );
    return res.json({ success: true, subCategories: rows });
  } catch (error) {
    console.error("getSubCategories error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

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

export const getProjectById = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await pool.query(
      `
      SELECT
        p.*,
        (
          SELECT COALESCE(SUM(e.amount), 0)
          FROM escrow e
          WHERE e.project_id = p.id
            AND e.status = 'held'
        ) AS in_escrow,
        (
          SELECT COALESCE(SUM(e.amount), 0)
          FROM escrow e
          JOIN completion_history ch
            ON ch.project_id = e.project_id
          WHERE e.project_id = p.id
            AND e.status = 'held'
            AND ch.event = 'completion_requested'
        ) AS to_be_released,
        (
          SELECT COALESCE(json_agg(json_build_object(
            'assigned_at', pa.assigned_at,
            'status', pa.status,
            'completion_history', (
              SELECT COALESCE(json_agg(json_build_object(
                'event', ch.event,
                'timestamp', ch.timestamp,
                'notes', ch.notes,
                'actor', ch.actor
              )), '[]')
              FROM completion_history ch
              WHERE ch.project_id = pa.project_id
            ),
            'freelancer', json_build_object(
              'id', u.id,
              'first_name', u.first_name,
              'last_name', u.last_name,
              'email', u.email,
              'username', u.username,
              'amount_in_escrow', (
                SELECT COALESCE(SUM(e.amount), 0)
                FROM escrow e
                WHERE e.project_id = pa.project_id
                  AND e.freelancer_id = pa.freelancer_id
              )
            )
          )), '[]')
          FROM project_assignments pa
          JOIN users u ON pa.freelancer_id = u.id
          WHERE pa.project_id = p.id
        ) AS assignments,
        (
          SELECT COALESCE(json_agg(json_build_object(
            'id', o.id,
            'bid_amount', o.bid_amount,
            'delivery_time', o.delivery_time,
            'proposal', o.proposal,
            'status_offer', o.offer_status,
            'submitted_at', o.submitted_at,
            'freelancer', json_build_object(
              'id', uf.id,
              'first_name', uf.first_name,
              'last_name', uf.last_name,
              'email', uf.email,
              'username', uf.username,
              'image', uf.profile_pic_url
            )
          )), '[]')
          FROM offers o
          JOIN users uf ON o.freelancer_id = uf.id
          WHERE o.project_id = p.id
        ) AS offers
      FROM projects p
      WHERE p.id = $1 AND p.is_deleted = false;
      `,
      [projectId]
    );

    if (!project.rows.length) {
      return res.status(404).json({
        success: false,
        message: "No Project Found",
      });
    }

    res.status(200).json({
      success: true,
      project: project.rows[0],
    });
  } catch (error) {
    console.error("getProjectById error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

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

export const sendOffer = async (req, res) => {
  try {
    const freelancerId = req.token.userId;
    const { projectId } = req.params;
    const { bid_amount, delivery_time, proposal } = req.body;

    // Prevent multiple offers from same freelancer
    const existing = await pool.query(
      `SELECT id FROM offers WHERE project_id = $1 AND freelancer_id = $2 AND offer_status = 'pending'`,
      [projectId, freelancerId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending offer for this project",
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO offers (freelancer_id, project_id, bid_amount, delivery_time, proposal, offer_status) 
       VALUES ($1,$2,$3,$4,$5,'pending') RETURNING *`,
      [freelancerId, projectId, bid_amount, delivery_time, proposal]
    );

    const offer = rows[0];

    res.status(201).json({
      success: true,
      message: "Offer sent successfully",
      offer,
    });
  } catch (err) {
    console.error("sendOffer error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get project completion status and history for each freelancer
export const getProjectCompletion = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.token?.userId;

    // 1. تأكد أن المستخدم له حق الوصول (مالك المشروع أو مستقل مشارك)
    const projectCheck = await pool.query(
      `SELECT p.user_id, pa.freelancer_id 
       FROM projects p 
       LEFT JOIN project_assignments pa ON p.id = pa.project_id 
       WHERE p.id = $1 AND p.is_deleted = false 
       AND (p.user_id = $2 OR pa.freelancer_id = $2)`,
      [projectId, userId]
    );

    if (!projectCheck.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied",
      });
    }

    // 2. جلب بيانات كل فريلانسر مع حالة الاستلام والمبلغ في escrow
    const freelancersResult = await pool.query(
      `SELECT 
          pa.freelancer_id,
          u.first_name,
          u.last_name,
          u.email,
          u.profile_pic_url,
          e.amount AS amount_in_escrow,
          COALESCE(fc.status, 'not_started') AS completion_status,
          fc.completion_requested_at,
          fc.payment_released_at
       FROM project_assignments pa
       JOIN users u ON pa.freelancer_id = u.id
       LEFT JOIN freelancer_completion fc 
          ON fc.project_id = pa.project_id AND fc.freelancer_id = pa.freelancer_id
       LEFT JOIN escrow e 
          ON e.project_id = pa.project_id AND e.freelancer_id = pa.freelancer_id
       WHERE pa.project_id = $1`,
      [projectId]
    );

    const freelancers = freelancersResult.rows.map((f) => ({
      id: f.freelancer_id,
      first_name: f.first_name,
      last_name: f.last_name,
      email: f.email,
      profile_pic_url: f.profile_pic_url,
      amount_in_escrow: f.amount_in_escrow || 0,
      completion_status: f.completion_status,
      completion_requested_at: f.completion_requested_at,
      payment_released_at: f.payment_released_at,
    }));

    // 3. جلب تاريخ الأحداث
    const historyResult = await pool.query(
      `SELECT ch.event, ch.timestamp, ch.actor, 
              u.first_name, u.last_name 
       FROM completion_history ch
       JOIN users u ON ch.actor = u.id
       WHERE ch.project_id = $1 
       ORDER BY ch.timestamp ASC`,
      [projectId]
    );

    const history = historyResult.rows.map((record) => ({
      event: record.event,
      timestamp: record.timestamp,
      actor: record.actor,
      actor_name: `${record.first_name} ${record.last_name}`,
    }));

    res.json({
      success: true,
      freelancers,
      history,
    });
  } catch (error) {
    console.error("getProjectCompletion error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Submit work completion request
export const submitWorkCompletion = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.token?.userId;

    // Check if user is assigned to this project as freelancer
    const assignmentCheck = await pool.query(
      `SELECT pa.id 
       FROM project_assignments pa 
       WHERE pa.project_id = $1 AND pa.freelancer_id = $2 
       AND pa.status = 'active'`,
      [projectId, userId]
    );

    if (!assignmentCheck.rows.length) {
      return res.status(403).json({
        success: false,
        message: "Only assigned freelancers can submit completion requests",
      });
    }

    const existingCompletion = await pool.query(
      `SELECT status FROM freelancer_completion 
       WHERE project_id = $1 AND freelancer_id = $2`,
      [projectId, userId]
    );

    if (existingCompletion.rows.length > 0) {
      const currentStatus = existingCompletion.rows[0].status;
      if (currentStatus !== "not_started") {
        return res.status(400).json({
          success: false,
          message: `Completion request already exists with status: ${currentStatus}`,
        });
      }
    }

    await pool.query("BEGIN");

    // Insert or update completion record
    if (existingCompletion.rows.length === 0) {
      await pool.query(
        `INSERT INTO freelancer_completion 
         (project_id, freelancer_id, status, completion_requested_at) 
         VALUES ($1, $2, 'pending_review', NOW())`,
        [projectId, userId]
      );
    } else {
      await pool.query(
        `UPDATE freelancer_completion 
         SET status = 'pending_review', completion_requested_at = NOW(), updated_at = NOW()
         WHERE project_id = $1 AND freelancer_id = $2`,
        [projectId, userId]
      );
    }

    // Add to history
    await pool.query(
      `INSERT INTO completion_history 
       (project_id, event, timestamp, actor, notes) 
       VALUES ($1, 'completion_requested', NOW(), $2, 'Freelancer requested completion')`,
      [projectId, userId]
    );

    await pool.query("COMMIT");

    // Get project details for notification
    const { rows: projectRows } = await pool.query(
      `SELECT user_id FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectRows.length > 0) {
      const clientId = projectRows[0].user_id;

      // Log the work completion request
      await LogCreators.projectOperation(
        userId,
        ACTION_TYPES.PROJECT_STATUS_CHANGE,
        projectId,
        true,
        { action: "work_completion_requested" }
      );

      // Create notification for client
      try {
        await NotificationCreators.workCompletionRequested(
          projectId,
          userId,
          clientId
        );
      } catch (notificationError) {
        console.error(
          "Error creating work completion notification:",
          notificationError
        );
      }
    }

    res.json({
      success: true,
      message: "Work completion request submitted successfully",
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("submitWorkCompletion error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllProjectForFreelancerById = async (req, res) => {
  const freelancerId = req.params.freelancerId || req.token?.userId;

  try {
    const { rows: projects } = await pool.query(
      `SELECT 
        p.*,
        pa.assigned_at,
        pa.status AS assignment_status,
        u.id AS client_id,
        u.first_name AS client_first_name,
        u.last_name AS client_last_name,
        u.email AS client_email,
        u.username AS client_username,
        (u.first_name || ' ' || u.last_name) AS client_name
      FROM projects p
      JOIN project_assignments pa ON pa.project_id = p.id
      JOIN users u ON u.id = p.user_id
      WHERE pa.freelancer_id = $1
      ORDER BY p.created_at DESC;`,
      [freelancerId]
    );

    if (!projects.length) {
      return res.status(404).json({
        success: false,
        message: "No projects found for this freelancer",
      });
    }

    const today = new Date();

    const projectsWithRemainingDays = projects.map((p) => {
      // Assigned date
      const assignedDate = p.assigned_at ? new Date(p.assigned_at) : null;

      // Deadline
      let deadlineDate = null;
      if (assignedDate && p.duration_days != null) {
        deadlineDate = new Date(assignedDate);
        deadlineDate.setDate(assignedDate.getDate() + p.duration_days);
      }

      // Calculate remaining days
      let remainingDays = null;
      let status_note = "Not yet started";
      if (deadlineDate) {
        const diffTime = deadlineDate - today;
        remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (remainingDays > 0) {
          status_note = `${remainingDays} day(s) remaining`;
        } else if (remainingDays === 0) {
          status_note = "Due today";
        } else {
          status_note = `Overdue by ${Math.abs(remainingDays)} day(s)`;
        }
      }

      return {
        ...p,
        assigned_at: assignedDate,
        deadline_date: deadlineDate,
        remaining_days: remainingDays,
        status_note,
        // Important fields
        completion_status: p.completion_status,
        completion_requested_at: p.completion_requested_at,
        payment_released_at: p.payment_released_at,
        budget: p.budget,
        duration_days: p.duration_days,
        completed_by_freelancer: p.completed_by_freelancer,
      };
    });

    res.status(200).json({
      success: true,
      projects: projectsWithRemainingDays,
    });
  } catch (err) {
    console.error("Error fetching projects for freelancer:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const uploadProjectFile = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { projectId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    // تحقق أن المشروع موجود
    const projectCheck = await pool.query(
      `SELECT id FROM projects WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );
    if (!projectCheck.rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // بيانات الملف من Cloudinary
    const file_name = req.file.originalname;
    const file_url = req.file.path;

    // إدخال في قاعدة البيانات
    const insertQuery = `
      INSERT INTO project_files (project_id, sender_id, file_name, file_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await pool.query(insertQuery, [
      projectId,
      userId,
      file_name,
      file_url,
    ]);

    return res.status(201).json({
      success: true,
      file: rows[0],
    });
  } catch (error) {
    console.error("uploadProjectFile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ جلب جميع الملفات
export const getProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params;

    const { rows } = await pool.query(
      `SELECT 
         pf.*,
         json_build_object(
           'id', u.id,
           'first_name', u.first_name,
           'last_name', u.last_name,
           'username', u.username,
           'email', u.email,
           'profile_pic_url', u.profile_pic_url
         ) AS sender
       FROM project_files pf
       JOIN users u ON u.id = pf.sender_id
       WHERE pf.project_id = $1
       ORDER BY pf.sent_at ASC`,
      [projectId]
    );

    res.status(200).json({
      success: true,
      files: rows,
    });
  } catch (error) {
    console.error("getProjectFiles error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCountProjectFreelancer = async (req, res) => {
  try {
    const { freelancer_id } = req.params;

    // Query the database to get counts by status
    const counts = await pool.query(
      `
      SELECT 
        status,
        COUNT(*) as count
      FROM project_assignments 
      WHERE freelancer_id = $1 
      GROUP BY status
    `,
      [freelancer_id]
    );

    // Format the response
    const result = {};
    counts.rows.forEach((row) => {
      result[row.status] = parseInt(row.count);
    });

    res.json({
      success: true,
      counts: result,
    });
  } catch (error) {
    console.error("Error fetching project counts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project counts",
    });
  }
};

export const quitProject = async (req, res) => {
  const freelancerId = req.token.userId;
  const { projectId } = req.params;

  try {
    const result = await pool.query(
      `UPDATE project_assignments
       SET status = 'quit'
       WHERE project_id = $1 AND freelancer_id = $2
       RETURNING *`,
      [projectId, freelancerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You are not assigned to this project or project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "You have successfully left the project",
      assignment: result.rows[0],
    });
  } catch (error) {
    console.error("Error quitting project:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getProjectsByStatus = async (req, res) => {
  const { freelancerId } = req.params;
  const { status } = req.query; // Get status from query parameter

  try {
    let query = `
      SELECT DISTINCT ON (p.id) 
      p.*, 
      pa.status AS assignment_status 
      FROM projects p 
      JOIN project_assignments pa 
      ON pa.project_id = p.id 
      WHERE pa.freelancer_id = $1
    `;

    const params = [freelancerId];

    // Add status filter if provided
    if (status && status !== "all") {
      query += ` AND pa.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY p.id, p.created_at DESC`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      projects: result.rows,
    });
  } catch (err) {
    console.error("Error fetching projects by status:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
export const getMyProjectsAsFreelancer = async (req, res) => {
  const freelancerId = req.token?.userId; // Get from token instead of params

  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (p.id) 
      p.*, 
      pa.status AS assignment_status 
      FROM projects p 
      JOIN project_assignments pa 
      ON pa.project_id = p.id 
      WHERE pa.freelancer_id = $1 
      ORDER BY p.id, p.created_at DESC;`,
      [freelancerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No projects found for this freelancer",
      });
    }

    res.status(200).json({
      success: true,
      projects: result.rows,
    });
  } catch (err) {
    console.error("Error fetching projects for freelancer:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
export const approveOrRejectOffer = async (req, res) => {
  try {
    const clientId = req.token.userId;
    const { offerId, action } = req.body;

    const { rows: offerRows } = await pool.query(
      `SELECT o.*, p.user_id AS client_id 
       FROM offers o 
       JOIN projects p ON o.project_id = p.id 
       WHERE o.id = $1`,
      [offerId]
    );
    if (!offerRows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }

    const offer = offerRows[0];
    if (offer.client_id !== clientId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (action === "reject") {
      await pool.query(
        `UPDATE offers SET offer_status = 'rejected' WHERE id = $1`,
        [offerId]
      );
      return res.json({ success: true, message: "Offer rejected" });
    }

    if (action === "accept") {
      await pool.query("BEGIN");

      // Mark offer accepted
      await pool.query(
        `UPDATE offers SET offer_status = 'accepted' WHERE id = $1`,
        [offerId]
      );

      // Assign freelancer
      const { rows: assignmentRows } = await pool.query(
        `INSERT INTO project_assignments (project_id, freelancer_id, status)
         VALUES ($1, $2, 'active')
         ON CONFLICT DO NOTHING RETURNING *`,
        [offer.project_id, offer.freelancer_id]
      );

      // Update project table to reflect assigned freelancer
      await pool.query(
        `UPDATE projects
         SET assigned_freelancer_id = $1, completion_status = 'not_started'
         WHERE id = $2`,
        [offer.freelancer_id, offer.project_id]
      );

      // Move budget into escrow
      await pool.query(
        `INSERT INTO escrow (project_id, freelancer_id, amount, status)
         VALUES ($1, $2, $3, 'held')`,
        [offer.project_id, offer.freelancer_id, offer.bid_amount]
      );

      await pool.query("COMMIT");

      return res.json({
        success: true,
        message: "Offer accepted, freelancer assigned, escrow funded",
        assignment: assignmentRows[0],
      });
    }

    return res.status(400).json({ success: false, message: "Invalid action" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("approveOrRejectOffer error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export default {
  createProject,
  getMyProjects,
  assignProject,
  listUsersByRole,
  getCategories,
  getSubCategories,
  getRelatedFreelancers,
  getProjectById,
  updateAssignmentStatus,
  getAllProjectForOffer,
  sendOffer,
  getProjectCompletion,
  submitWorkCompletion,
  getAllProjectForFreelancerById,
  uploadProjectFile,
  getProjectFiles,
  quitProject,
};
