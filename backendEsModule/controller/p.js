import { pool } from "../models/db.js";
import {
  LogCreators,
  ACTION_TYPES,
  ENTITY_TYPES,
} from "../services/loggingService.js";
import { NotificationCreators } from "../services/notificationService.js";
import { creditWallet, debitWallet } from "../services/walletService.js";

// Release escrow for a project
export const releaseEscrow = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Fetch project info
    const { rows: projectRows } = await pool.query(
      `SELECT * FROM projects WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );
    if (!projectRows.length) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const project = projectRows[0];
    if (project.completion_status !== "requested") {
      return res.status(400).json({ success: false, message: "Completion not requested yet" });
    }

    // Credit freelancer wallet
    if (project.assigned_freelancer_id) {
      await creditWallet(project.assigned_freelancer_id, project.budget, `Escrow released for project ${project.id}`);
    }

    // Update project status
    const { rows: updatedRows } = await pool.query(
      `UPDATE projects 
       SET completion_status = 'completed', payment_released_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [projectId]
    );

    await LogCreators.projectOperation(
      req.token?.userId || 0,
      ACTION_TYPES.ESCROW_RELEASE,
      projectId,
      true,
      { projectId }
    );

    return res.status(200).json({ success: true, project: updatedRows[0] });
  } catch (err) {
    console.error("releaseEscrow error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Freelancer requests project completion
export const requestCompletion = async (req, res) => {
  try {
    const freelancerId = req.token?.userId;
    const { projectId } = req.params;

    const { rows: assignmentRows } = await pool.query(
      `SELECT * FROM project_assignments 
       WHERE project_id = $1 AND freelancer_id = $2`,
      [projectId, freelancerId]
    );

    if (!assignmentRows.length) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    const { rows: updatedRows } = await pool.query(
      `UPDATE projects 
       SET completion_status = 'requested', completion_requested_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [projectId]
    );

    await LogCreators.projectOperation(
      freelancerId,
      ACTION_TYPES.COMPLETION_REQUEST,
      projectId,
      true,
      { projectId }
    );

    return res.status(200).json({ success: true, project: updatedRows[0] });
  } catch (err) {
    console.error("requestCompletion error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get project completion history
export const getCompletionHistory = async (req, res) => {
  try {
    const { projectId } = req.params;

    const { rows } = await pool.query(
      `SELECT * FROM completion_history 
       WHERE project_id = $1
       ORDER BY created_at DESC`,
      [projectId]
    );

    return res.status(200).json({ success: true, history: rows });
  } catch (err) {
    console.error("getCompletionHistory error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getMyProjects = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { rows } = await pool.query(
      `SELECT 
        p.*, 
        array_agg(pa.freelancer_id) AS assigned_freelancers
       FROM projects p
       LEFT JOIN project_assignments pa ON pa.project_id = p.id
       WHERE p.user_id = $1 AND p.is_deleted = false
       GROUP BY p.id
       ORDER BY p.created_at DESC;`,
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
    const { freelancer_id } = req.body;

    if (!freelancer_id) {
      return res
        .status(400)
        .json({ success: false, message: "freelancer_id is required" });
    }

    const projectResult = await pool.query(
      `SELECT id FROM projects WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );
    if (!projectResult.rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const userResult = await pool.query(
      `SELECT role_id FROM users WHERE id = $1 AND is_deleted = false`,
      [freelancer_id]
    );
    if (!userResult.rows.length || userResult.rows[0].role_id !== 3) {
      return res.status(403).json({
        success: false,
        message: "Only users with role 3 can be assigned to projects",
      });
    }

    const existsResult = await pool.query(
      `SELECT id FROM project_assignments WHERE project_id = $1 AND freelancer_id = $2`,
      [projectId, freelancer_id]
    );
    if (existsResult.rows.length) {
      return res.status(400).json({
        success: false,
        message: "This freelancer is already assigned to the project",
      });
    }

    const insertAssign = `
      INSERT INTO project_assignments (project_id, freelancer_id, status)
      VALUES ($1, $2, 'active')
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;
    const { rows } = await pool.query(insertAssign, [projectId, freelancer_id]);

    if (rows.length > 0) {
      await LogCreators.projectOperation(
        req.token?.userId || 0,
        ACTION_TYPES.ASSIGNMENT_CREATE,
        projectId,
        true,
        { freelancer_id, assignment_id: rows[0].id }
      );

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

    return res.status(201).json({ success: true, assignment: rows[0] || null });
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

    const validStatuses = ["active", "kicked", "quit", "banned", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
      });
    }

    const projectResult = await pool.query(
      `SELECT id FROM projects WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );
    if (!projectResult.rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

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

// List users by role id
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

// Public: list sub categories
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

// Get related freelancers for a project
export const getRelatedFreelancers = async (req, res) => {
  const { projectId } = req.params;

  const { rows: projectRows } = await pool.query(
    `SELECT id, category_id FROM projects WHERE id = $1 AND is_deleted = false`,
    [projectId]
  );

  if (!projectRows.length) {
    return res
      .status(404)
      .json({ success: false, message: "Project not found" });
  }

  const { category_id } = projectRows[0];

  const { rows: freelancers } = await pool.query(
    `SELECT * FROM users WHERE role_id = 3 AND category_id = $1 AND is_deleted = false`,
    [category_id]
  );

  res.status(200).json({ success: true, freelancers });
};

// Get all projects for a freelancer by ID
export const getAllProjectForFreelancerById = async (req, res) => {
  const { freelancerId } = req.params;

  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (p.id) 
          p.*, 
          pa.status AS assignment_status,
          u.first_name,
          u.last_name,
          (u.first_name || ' ' || u.last_name) AS client_name
      FROM projects p
      JOIN project_assignments pa 
          ON pa.project_id = p.id
      JOIN users u
          ON u.id = p.user_id
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
      error: err,
    });
  }
};

// Upload project file
export const uploadProjectFile = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { filename, file_url } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO project_files (project_id, filename, file_url) 
       VALUES ($1, $2, $3) RETURNING *`,
      [projectId, filename, file_url]
    );

    return res.status(201).json({ success: true, file: rows[0] });
  } catch (err) {
    console.error("uploadProjectFile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get project files
export const getProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { rows } = await pool.query(
      `SELECT * FROM project_files WHERE project_id = $1`,
      [projectId]
    );
    return res.json({ success: true, files: rows });
  } catch (err) {
    console.error("getProjectFiles error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Count projects for a freelancer by status
export const getCountProjectFreelancer = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const { rows } = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM project_assignments 
       WHERE freelancer_id = $1 
       GROUP BY status`,
      [freelancerId]
    );
    return res.json({ success: true, counts: rows });
  } catch (err) {
    console.error("getCountProjectFreelancer error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Freelancer quits a project
export const quitProject = async (req, res) => {
  try {
    const { freelancerId, projectId } = req.body;
    const { rows } = await pool.query(
      `UPDATE project_assignments
       SET status = 'quit'
       WHERE freelancer_id = $1 AND project_id = $2
       RETURNING *`,
      [freelancerId, projectId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    return res.json({ success: true, assignment: rows[0] });
  } catch (err) {
    console.error("quitProject error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get freelancer projects by status
export const getProjectsByStatus = async (req, res) => {
  try {
    const { freelancerId, status } = req.params;
    const { rows } = await pool.query(
      `SELECT p.*, pa.status AS assignment_status
       FROM projects p
       JOIN project_assignments pa 
         ON pa.project_id = p.id
       WHERE pa.freelancer_id = $1 AND pa.status = $2`,
      [freelancerId, status]
    );
    return res.json({ success: true, projects: rows });
  } catch (err) {
    console.error("getProjectsByStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all projects for logged-in freelancer
export const getMyProjectsAsFreelancer = async (req, res) => {
  try {
    const freelancerId = req.token?.userId;
    const { rows } = await pool.query(
      `SELECT p.*, pa.status AS assignment_status
       FROM projects p
       JOIN project_assignments pa 
         ON pa.project_id = p.id
       WHERE pa.freelancer_id = $1`,
      [freelancerId]
    );
    return res.json({ success: true, projects: rows });
  } catch (err) {
    console.error("getMyProjectsAsFreelancer error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
