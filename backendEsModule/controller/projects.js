import { pool } from "../models/db.js";

// Create a new project by the authenticated user (Role 1 or 2)
export const createProject = async (req, res) => {
  try {
    const userId = req.token?.userId;

    const { rows: userRows } = await pool.query(
      `SELECT role_id FROM users WHERE id = $1 AND is_deleted = false`,
      [userId]
    );

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

export const getProjectById = async (req, res) => {
  const { projectId } = req.params;

  const project = await pool.query(
    `SELECT
  p.*,
  (
    SELECT COALESCE(json_agg(json_build_object(
      'assigned_at', pa.assigned_at,
      'status', pa.status,
      'freelancer', json_build_object(
        'id', u.id,
        'first_name', u.first_name,
        'last_name', u.last_name,
        'email', u.email,
        'username', u.username
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
    project,
  });
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
  const freelancerId = req.token.userId;
  const { projectId } = req.params;
  const { bid_amount, delivery_time, proposal } = req.body;
  const values = [freelancerId, projectId, bid_amount, delivery_time, proposal];
  await pool
    .query(
      `INSERT INTO offers (freelancer_id, project_id, bid_amount, delivery_time, proposal) VALUES ($1,$2,$3,$4,$5)`,
      values
    )
    .then((result) => {
      res.status(200).json({
        success: true,
        message: `send offer successflly`,
        result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: `server error`,
        err,
      });
    });
};

export const approveOrRejectOffer = async (req, res) => {
  const { action, offer_id } = req.body;
  const client = await pool.connect();

  try {
    if (action === "approve") {
      await client.query("BEGIN");

      // 1. Get offer details (freelancer + project + amount)
      const offerResult = await client.query(
        `SELECT o.id, o.bid_amount, o.project_id, o.freelancer_id, p.user_id AS client_id
         FROM offers o
         JOIN projects p ON o.project_id = p.id
         WHERE o.id = $1 AND o.offer_status IS NULL`,
        [offer_id]
      );

      if (offerResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ success: false, message: "Offer not found" });
      }

      const { bid_amount, project_id, freelancer_id, client_id } = offerResult.rows[0];

      // 2. Check client balance
      const walletCheck = await client.query(
        `SELECT wallet FROM users WHERE id = $1 FOR UPDATE`,
        [client_id]
      );

      if (walletCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ success: false, message: "Client not found" });
      }

      if (walletCheck.rows[0].wallet < bid_amount) {
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, message: "Insufficient balance" });
      }

      // 3. Deduct from client wallet
      await client.query(
        `UPDATE users SET wallet = wallet - $1 WHERE id = $2`,
        [bid_amount, client_id]
      );

      // 4. Update offer status
      await client.query(
        `UPDATE offers 
         SET offer_status = 'approved' 
         WHERE id = $1`,
        [offer_id]
      );

      // 5. Assign project
      await client.query(
        `INSERT INTO project_assignments (project_id, freelancer_id, assigned_at, status)
         VALUES ($1, $2, NOW(), 'active')`,
        [project_id, freelancer_id]
      );

      // 6. Insert escrow record
      await client.query(
        `INSERT INTO escrow (project_id, freelancer_id, client_id, amount, status)
         VALUES ($1, $2, $3, $4, 'held')`,
        [project_id, freelancer_id, client_id, bid_amount]
      );

      await client.query("COMMIT");

      return res.json({
        success: true,
        message: "Offer approved, freelancer assigned, funds held in escrow"
      });

    } else if (action === "reject") {
      await client.query(
        `UPDATE offers 
         SET offer_status = 'rejected' 
         WHERE id = $1`,
        [offer_id]
      );

      return res.json({ success: true, message: "Offer rejected" });
    }

    res.status(400).json({ success: false, message: "Invalid action" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
};


// Get project completion status and history
export const getProjectCompletion = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.token?.userId;

    // Check if user has access to this project
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
        message: "Project not found or access denied"
      });
    }

    // Get completion status
    const completionResult = await pool.query(
      `SELECT status, completion_requested_at, payment_released_at 
       FROM project_completion 
       WHERE project_id = $1`,
      [projectId]
    );

    // Get completion history
    const historyResult = await pool.query(
      `SELECT ch.event, ch.timestamp, ch.actor, 
              u.first_name, u.last_name 
       FROM completion_history ch
       JOIN users u ON ch.actor = u.id
       WHERE ch.project_id = $1 
       ORDER BY ch.timestamp ASC`,
      [projectId]
    );

    const status = completionResult.rows.length > 0 
      ? completionResult.rows[0].status 
      : 'not_started';

    res.json({
      success: true,
      status,
      history: historyResult.rows.map(record => ({
        event: record.event,
        timestamp: record.timestamp,
        actor: record.actor,
        actor_name: `${record.first_name} ${record.last_name}`
      }))
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
        message: "Only assigned freelancers can submit completion requests"
      });
    }

    // Check if completion already exists
    const existingCompletion = await pool.query(
      `SELECT status FROM project_completion WHERE project_id = $1`,
      [projectId]
    );

    if (existingCompletion.rows.length > 0) {
      const currentStatus = existingCompletion.rows[0].status;
      if (currentStatus !== 'not_started') {
        return res.status(400).json({
          success: false,
          message: `Completion request already exists with status: ${currentStatus}`
        });
      }
    }

    await pool.query('BEGIN');

    // Insert or update completion record
    if (existingCompletion.rows.length === 0) {
      await pool.query(
        `INSERT INTO project_completion (project_id, status, completion_requested_at) 
         VALUES ($1, 'pending_review', NOW())`,
        [projectId]
      );
    } else {
      await pool.query(
        `UPDATE project_completion 
         SET status = 'pending_review', completion_requested_at = NOW() 
         WHERE project_id = $1`,
        [projectId]
      );
    }

    // Add to history
    await pool.query(
      `INSERT INTO completion_history (project_id, event, timestamp, actor) 
       VALUES ($1, 'completion_requested', NOW(), $2)`,
      [projectId, userId]
    );

    await pool.query('COMMIT');

    res.json({
      success: true,
      message: "Work completion request submitted successfully"
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error("submitWorkCompletion error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Release payment for completed work
export const releasePayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { projectId } = req.params;
    const userId = req.token?.userId;

    // Check if user is the project owner
    const projectCheck = await client.query(
      `SELECT user_id FROM projects WHERE id = $1 AND is_deleted = false`,
      [projectId]
    );

    if (!projectCheck.rows.length) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (projectCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: "Only project owner can release payment" });
    }

    // Check if completion is in pending_review status
    const completionCheck = await client.query(
      `SELECT status FROM project_completion WHERE project_id = $1`,
      [projectId]
    );

    if (!completionCheck.rows.length || completionCheck.rows[0].status !== "pending_review") {
      return res.status(400).json({
        success: false,
        message: "Project completion is not in pending review status",
      });
    }

    // Get freelancer and offer amount
    const offerCheck = await client.query(
      `SELECT pa.freelancer_id, o.bid_amount
       FROM project_assignments pa
       JOIN offers o 
         ON pa.project_id = o.project_id 
        AND pa.freelancer_id = o.freelancer_id
       WHERE pa.project_id = $1
       LIMIT 1;`,
      [projectId]
    );

    if (!offerCheck.rows.length) {
      return res.status(404).json({ success: false, message: "No freelancer offer found" });
    }

    // 👇 استخدام الاسم الصحيح
    const { freelancer_id, bid_amount } = offerCheck.rows[0];

    await client.query("BEGIN");

    // Check client balance
    const balanceCheck = await client.query(
      `SELECT wallet FROM users WHERE id = $1 FOR UPDATE`,
      [userId]
    );

    if (balanceCheck.rows[0].wallet < bid_amount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ success: false, message: "Insufficient balance in client wallet" });
    }

    // Deduct from client wallet
    await client.query(
      `UPDATE users SET wallet = wallet - $1 WHERE id = $2`,
      [bid_amount, userId]
    );

    // Add to freelancer wallet
    await client.query(
      `UPDATE users SET wallet = wallet + $1 WHERE id = $2`,
      [bid_amount, freelancer_id]
    );

    // Update completion status
    await client.query(
      `UPDATE project_completion 
         SET status = 'completed', payment_released_at = NOW() 
       WHERE project_id = $1`,
      [projectId]
    );

    // Add to history
    await client.query(
      `INSERT INTO completion_history (project_id, event, timestamp, actor) 
       VALUES ($1, 'payment_released', NOW(), $2)`,
      [projectId, userId]
    );

    await client.query("COMMIT");

    res.json({ success: true, message: "Payment released successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("releasePayment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
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
  approveOrRejectOffer,
  getProjectCompletion,        
  submitWorkCompletion,        
  releasePayment             
};
