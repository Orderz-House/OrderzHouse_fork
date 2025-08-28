import { pool } from "../models/db.js";

// Create a new project by the authenticated user (Role 1 or 2)
export const createProject = async (req, res) => {
  try {
    const userId = req.token?.userId; // Use userId from the token

    // Fetch role of current user
    const { rows: userRows } = await pool.query(
      `SELECT role_id FROM users WHERE id = $1 AND is_deleted = false`,
      [userId]
    );

    // Allow creation if user is Role 1 or Role 2
    if (
      !userRows.length ||
      (userRows[0].role_id !== 1 && userRows[0].role_id !== 2)
    ) {
      return res.status(403).json({
        success: false,
        message: "Only users with role 1 or role 2 can create projects",
      });
    }

    const {
      category_id,
      sub_category_id,
      title,
      description,
      budget_min,
      budget_max,
      duration,
      location,
    } = req.body;

    // Validate required fields
    if (
      !category_id ||
      !title ||
      !description ||
      budget_min === undefined ||
      budget_max === undefined
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Insert new project
    const insertQuery = `
      INSERT INTO projects (
        user_id, category_id, sub_category_id, title, description,
        budget_min, budget_max, duration, location, status, is_deleted
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,'', false
      ) RETURNING *;
    `;
    const { rows } = await pool.query(insertQuery, [
      userId,
      category_id,
      sub_category_id || null,
      title,
      description,
      budget_min,
      budget_max,
      duration || null,
      location || "",
    ]);

    const project = rows[0];

    // Fetch freelancers (role 3) who match the project's category
    // Assuming there is a table `freelancer_categories` with columns freelancer_id, category_id
    const { rows: eligibleUsers } = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.username
       FROM users u
       JOIN freelancer_categories fc ON fc.freelancer_id = u.id
       WHERE u.role_id = 3
       AND fc.category_id = $1
       AND u.is_deleted = false`,
      [category_id]
    );

    // Return project and eligible freelancers
    return res.status(201).json({
      success: true,
      project,
      eligibleUsers,
    });
  } catch (error) {
    console.error("createProject error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get projects created by the authenticated user
export const getMyProjects = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { rows } = await pool.query(
      `SELECT p.*, pa.freelancer_id AS assigned_freelancer_id
       FROM projects p
       LEFT JOIN project_assignments pa ON pa.project_id = p.id
       WHERE p.user_id = $1 AND p.is_deleted = false
       ORDER BY p.created_at DESC`,
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

    // Check if the project exists and is not deleted
    const projectResult = await pool.query(
      `SELECT id FROM projects WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );
    if (!projectResult.rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Check if the freelancer exists and has role 3
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

    // Insert assignment into the database; ignore if already exists
    const insertAssign = `
      INSERT INTO project_assignments (project_id, freelancer_id, status)
      VALUES ($1, $2, 'active')
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;
    const { rows } = await pool.query(insertAssign, [projectId, freelancer_id]);

    // Return the assignment details
    return res.status(201).json({ success: true, assignment: rows[0] || null });
  } catch (error) {
    console.error("assignProject error:", error);
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

export default { createProject, getMyProjects, assignProject, listUsersByRole };
