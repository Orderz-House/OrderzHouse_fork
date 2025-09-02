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
    SELECT COALESCE(SUM(e.amount), 0)
    FROM escrow e
    WHERE e.project_id = p.id
      AND e.status = 'held'
  ) AS in_escrow,
(
  SELECT COALESCE(SUM(e.amount), 0)
  FROM escrow e
  JOIN freelancer_completion fc
    ON fc.project_id = e.project_id
   AND fc.freelancer_id = e.freelancer_id
  WHERE e.project_id = p.id
    AND e.status = 'held'
    AND fc.status = 'pending_review'
) AS to_be_released,
(
  SELECT COALESCE(json_agg(json_build_object(
    'assigned_at', pa.assigned_at,
    'status', pa.status,
    'completion_status', fc.status,
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
  LEFT JOIN freelancer_completion fc
    ON fc.project_id = pa.project_id
   AND fc.freelancer_id = pa.freelancer_id
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
  console.log("Offer Id =>", offer_id);
  
  const client = await pool.connect();

  try {
    if (action === "approve") {
      await client.query("BEGIN");

      // 1. Get offer details (freelancer + project + amount)
      const offerResult = await client.query(
        `SELECT o.id, o.bid_amount, o.project_id, o.freelancer_id, p.user_id AS client_id
         FROM offers o
         JOIN projects p ON o.project_id = p.id
         WHERE o.id = $1`,
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
        message: "Project not found or access denied"
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

    const freelancers = freelancersResult.rows.map(f => ({
      id: f.freelancer_id,
      first_name: f.first_name,
      last_name: f.last_name,
      email: f.email,
      profile_pic_url: f.profile_pic_url,
      amount_in_escrow: f.amount_in_escrow || 0,
      completion_status: f.completion_status,
      completion_requested_at: f.completion_requested_at,
      payment_released_at: f.payment_released_at
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

    const history = historyResult.rows.map(record => ({
      event: record.event,
      timestamp: record.timestamp,
      actor: record.actor,
      actor_name: `${record.first_name} ${record.last_name}`
    }));

    res.json({
      success: true,
      freelancers,
      history
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

    const existingCompletion = await pool.query(
      `SELECT status FROM freelancer_completion 
       WHERE project_id = $1 AND freelancer_id = $2`,
      [projectId, userId]
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
    const { projectId, freelancerId } = req.params; // استقبلنا freelancerId من البارامز
    const userId = req.token?.userId;

    // 1. تأكد أن المستخدم هو صاحب المشروع
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

    // 2. تأكد أن الفريلانسر عنده طلب استلام بحالة pending_review
    const completionCheck = await client.query(
      `SELECT status FROM freelancer_completion 
       WHERE project_id = $1 AND freelancer_id = $2`,
      [projectId, freelancerId]
    );

    if (!completionCheck.rows.length || completionCheck.rows[0].status !== "pending_review") {
      return res.status(400).json({
        success: false,
        message: "Freelancer completion is not in pending review status",
      });
    }

    // 3. جلب معلومات escrow
    const escrowCheck = await client.query(
      `SELECT id, freelancer_id, amount, status 
       FROM escrow 
       WHERE project_id = $1 
         AND freelancer_id = $2
         AND status = 'held'`,
      [projectId, freelancerId]
    );

    if (!escrowCheck.rows.length) {
      return res.status(404).json({ success: false, message: "No held escrow found for this freelancer" });
    }

    const { id: escrow_id, amount } = escrowCheck.rows[0];

    await client.query("BEGIN");

    // 4. إضافة المبلغ إلى حساب المستقل
    await client.query(
      `UPDATE users SET wallet = wallet + $1 WHERE id = $2`,
      [amount, freelancerId]
    );

    // 5. تحديث حالة الـ escrow إلى released
    await client.query(
      `UPDATE escrow SET status = 'released', released_at = NOW() WHERE id = $1`,
      [escrow_id]
    );

    // 6. تحديث حالة استلام المستقل في freelancer_completion
    await client.query(
      `UPDATE freelancer_completion 
       SET status = 'approved', payment_released_at = NOW(), updated_at = NOW()
       WHERE project_id = $1 AND freelancer_id = $2`,
      [projectId, freelancerId]
    );

    await client.query(
      `UPDATE project_assignments
       SET status = 'quit'
       WHERE project_id = $1 AND freelancer_id = $2`,
      [projectId, freelancerId]
    );

    // 7. إضافة سجل في التاريخ
    await client.query(
      `INSERT INTO completion_history (project_id, event, timestamp, actor, notes) 
       VALUES ($1, 'payment_released', NOW(), $2, CONCAT('Payment released to freelancer ', $3::text))`,
      [projectId, userId, freelancerId]
    );

    await client.query("COMMIT");

    res.json({ success: true, message: "Payment released from escrow successfully" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("releasePayment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
};


export const getAllProjectForFreelancerById = async (req, res) => {
  const { freelancerId } = req.params;

  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (p.id) 
  p.*
FROM projects p
JOIN project_assignments pa ON pa.project_id = p.id
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
      error: "Server error",
    });
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
  releasePayment,
  getAllProjectForFreelancerById   
};
