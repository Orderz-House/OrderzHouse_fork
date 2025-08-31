import { pool } from "../models/db.js";

// Create a new project by the authenticated user (Role 1 or 2)
export const createProject = async (req, res) => {
  try {
    const userId = req.token?.userId;

    const { rows: userRows } = await pool.query(
      `SELECT role_id FROM users WHERE id = $1 AND is_deleted = false`,
      [userId]
    );

    if (!userRows.length || (userRows[0].role_id !== 1 && userRows[0].role_id !== 2)) {
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

    if (!category_id || !title || !description || budget_min === undefined || budget_max === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const insertQuery = `
      INSERT INTO projects (
        user_id, category_id, sub_category_id, title, description,
        budget_min, budget_max, duration, location, status, is_deleted
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,'available', false
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

    // رجّع المشروع فقط
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
    const validStatuses = ["active", "kicked", "quit", "banned"];
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

// Get related freelancers for a project by category and optional subcategory
export const getRelatedFreelancers = async (req, res) => {
  const { projectId } = req.params;

  const { rows: projectRows } = await pool.query(
    `SELECT id, category_id FROM projects WHERE id = $1 AND is_deleted = false`,
    [projectId]
  );

  if (!projectRows.length) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  const { category_id } = projectRows[0];

  const { rows: freelancers } = await pool.query(
    `SELECT * FROM users WHERE role_id = 3 AND category_id = $1 AND is_deleted = false`,
    [category_id]
  );

  res.status(200).json({ success: true, freelancers });
};

export const getProjectById = async (req,res)=>{
  const {projectId} = req.params;

  
  const project = await pool.query(
    `
    SELECT 
      p.*,
      COALESCE(
        json_agg(
          json_build_object(
            'freelancer_id', pa.freelancer_id,
            'assigned_at', pa.assigned_at,
            'status', pa.status,
            'user', json_build_object(
              'id', u.id,
              'first_name', u.first_name,
              'last_name', u.last_name,
              'email', u.email,
              'username', u.username
            )
          )
        ) FILTER (WHERE pa.freelancer_id IS NOT NULL), '[]'
      ) AS assignments
    FROM projects p
    LEFT JOIN project_assignments pa 
      ON p.id = pa.project_id
    LEFT JOIN users u 
      ON pa.freelancer_id = u.id
    WHERE p.id = $1 
      AND p.is_deleted = FALSE
    GROUP BY p.id
    `,
    [projectId]
  );

  if(!project.rows.length){
    return res.status(404).json({
      success : false,
      message : "No Project Found", 
    })
  }

  res.status(200).json({
    success : true,
    project
  })

}
export const getAllProjectForOffer = (req,res)=>{
  pool.query(`SELECT 
       p.*, 
       u.id AS user_id, 
       u.first_name, 
       u.last_name, 
       u.email, 
       u.username FROM projects p JOIN users u ON u.id = p.user_id WHERE p.status = 'available'`).then((result) => {
    res.status(200).json({
      success : true,
      message : `All Project available`,
      projects : result.rows
    })
  }).catch((err) => {
    res.status(500).json({
      success : false,
      message : `Server Error`,
      error : err
    })
  });
}





export default { createProject, getMyProjects, assignProject, listUsersByRole, getCategories, getSubCategories,getRelatedFreelancers ,getProjectById, updateAssignmentStatus, getAllProjectForOffer};