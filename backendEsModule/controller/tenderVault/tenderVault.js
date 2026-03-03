import pool from "../../models/db.js";
import { countPublishedTenders } from "../../services/tenderPoolRotation.js";

/**
 * Get all tender vault projects with filters
 * GET /tender-vault?status=stored&q=...&page=1&limit=20
 */
export const getTenderVaultProjects = async (req, res) => {
  try {
    const userId = req.token.userId;
    const { status, q, page = 1, limit = 20 } = req.query;

    let query = `
      SELECT 
        tv.id,
        tv.title,
        tv.description,
        tv.category_id,
        tv.budget_min,
        tv.budget_max,
        tv.currency,
        tv.duration,
        tv.attachments,
        tv.metadata,
        tv.status,
        tv.created_at,
        tv.updated_at,
        c.name AS category_name
      FROM tender_vault_projects tv
      LEFT JOIN categories c ON c.id = tv.category_id
      WHERE tv.created_by = $1 AND tv.is_deleted = false
    `;
    const params = [userId];
    let paramIndex = 2;

    if (status && ['stored', 'published', 'archived'].includes(status)) {
      query += ` AND tv.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (q && q.trim()) {
      query += ` AND (tv.title ILIKE $${paramIndex} OR tv.description ILIKE $${paramIndex})`;
      params.push(`%${q.trim()}%`);
      paramIndex++;
    }

    query += ` ORDER BY tv.created_at DESC`;

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), offset);

    const { rows } = await pool.query(query, params);

    // Parse JSONB fields (PostgreSQL may return metadata/attachments as strings)
    const parsedRows = rows.map((row) => {
      const r = { ...row };
      if (typeof r.attachments === 'string') {
        try {
          r.attachments = JSON.parse(r.attachments);
        } catch (e) {
          r.attachments = [];
        }
      }
      if (typeof r.metadata === 'string') {
        try {
          r.metadata = JSON.parse(r.metadata);
        } catch (e) {
          r.metadata = {};
        }
      }
      if (!Array.isArray(r.attachments)) {
        r.attachments = [];
      }
      if (!r.metadata || typeof r.metadata !== 'object') {
        r.metadata = {};
      }
      return r;
    });

    // Temporary debug (remove after testing)
    console.log("TenderVault LIST sample metadata type:", typeof parsedRows[0]?.metadata);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM tender_vault_projects tv
      WHERE tv.created_by = $1 AND tv.is_deleted = false
    `;
    const countParams = [userId];
    let countParamIndex = 2;

    if (status && ['stored', 'published', 'archived'].includes(status)) {
      countQuery += ` AND tv.status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    if (q && q.trim()) {
      countQuery += ` AND (tv.title ILIKE $${countParamIndex} OR tv.description ILIKE $${countParamIndex})`;
      countParams.push(`%${q.trim()}%`);
    }

    const { rows: countRows } = await pool.query(countQuery, countParams);
    const total = Number(countRows[0]?.total || 0);

    return res.json({
      success: true,
      tenders: parsedRows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    // Handle missing table or column gracefully (PostgreSQL error codes 42P01, 42703)
    if (err.code === '42P01' || err.code === '42703' || 
        (err.message?.includes('does not exist') && err.message?.includes('tender_vault_projects')) ||
        (err.message?.includes('column') && err.message?.includes('does not exist'))) {
      console.warn("⚠️  tender_vault_projects table or column missing. Returning empty list. Please run migrations.");
      // Return success with empty list (no error toast in UI)
      return res.json({
        success: true,
        tenders: [],
        warning: "tender_vault_projects table missing, run migrations",
        pagination: {
          page: Number(req.query.page || 1),
          limit: Number(req.query.limit || 20),
          total: 0,
          totalPages: 0,
        },
      });
    }

    console.error("getTenderVaultProjects error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tender vault projects",
    });
  }
};

/**
 * Get single tender vault project
 * GET /tender-vault/:id
 */
export const getTenderVaultProject = async (req, res) => {
  try {
    const userId = req.token.userId;
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT 
        tv.id,
        tv.created_by,
        tv.status,
        tv.title,
        tv.description,
        tv.category_id,
        tv.budget_min,
        tv.budget_max,
        tv.currency,
        tv.duration,
        tv.attachments,
        tv.metadata,
        tv.created_at,
        tv.updated_at,
        tv.usage_count,
        tv.max_usage,
        tv.temporary_archived_until,
        tv.last_displayed_at,
        c.name AS category_name,
        u.first_name AS creator_first_name,
        u.last_name AS creator_last_name,
        u.email AS creator_email,
        u.username AS creator_username,
        COALESCE(
          NULLIF(TRIM(u.first_name || ' ' || u.last_name), ''),
          u.username,
          'Unknown'
        ) AS creator_name,
        tcy.cycle_number,
        tcy.client_public_id,
        tcy.status AS cycle_status,
        tcy.display_start_time,
        tcy.display_end_time
      FROM tender_vault_projects tv
      LEFT JOIN categories c ON c.id = tv.category_id
      LEFT JOIN users u ON u.id = tv.created_by
      LEFT JOIN LATERAL (
        SELECT cycle_number, client_public_id, display_start_time, display_end_time, status
        FROM tender_vault_cycles
        WHERE tender_id = tv.id AND status = 'active'
        ORDER BY cycle_number DESC
        LIMIT 1
      ) tcy ON true
      WHERE tv.id = $1 AND tv.created_by = $2 AND tv.is_deleted = false`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tender vault project not found",
      });
    }

    // Parse JSONB fields if they're strings
    const tender = rows[0];
    if (typeof tender.attachments === 'string') {
      try {
        tender.attachments = JSON.parse(tender.attachments);
      } catch (e) {
        tender.attachments = [];
      }
    }
    if (typeof tender.metadata === 'string') {
      try {
        tender.metadata = JSON.parse(tender.metadata);
      } catch (e) {
        tender.metadata = {};
      }
    }
    if (!Array.isArray(tender.attachments)) {
      tender.attachments = [];
    }
    if (!tender.metadata || typeof tender.metadata !== 'object') {
      tender.metadata = {};
    }

    return res.json({
      success: true,
      tender,
    });
  } catch (err) {
    console.error("getTenderVaultProject error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tender vault project",
    });
  }
};

/**
 * Create tender vault project
 * POST /tender-vault
 */
export const createTenderVaultProject = async (req, res) => {
  try {
    const userId = req.token.userId;
    
    const {
      title,
      description,
      categoryId,
      category_id,
      budgetMin,
      budget_min,
      budgetMax,
      budget_max,
      currency = 'JD',
      duration,
      duration_days,
      attachments,
      metadata,
    } = req.body;

    const category_id_final = category_id || categoryId;
    const budget_min_final = budget_min || budgetMin;
    const budget_max_final = budget_max || budgetMax;
    // Tender Vault: duration is integer days only (prefer duration, else duration_days)
    const durationDays = duration != null ? Number(duration) : (duration_days != null ? Number(duration_days) : null);
    const durationFinal = durationDays != null && Number.isInteger(durationDays) ? durationDays : null;

    // Validation (same as normal bidding projects)
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (title.trim().length < 10 || title.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Title must be between 10 and 100 characters",
      });
    }

    if (!description || description.trim().length < 100 || description.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Description must be between 100 and 2000 characters",
      });
    }

    if (!category_id_final) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    // Validate bidding project fields
    if (!budget_min_final || budget_min_final <= 0) {
      return res.status(400).json({
        success: false,
        message: "Min budget must be greater than 0",
      });
    }
    if (!budget_max_final || budget_max_final <= 0) {
      return res.status(400).json({
        success: false,
        message: "Max budget must be greater than 0",
      });
    }
    if (Number(budget_max_final) < Number(budget_min_final)) {
      return res.status(400).json({
        success: false,
        message: "Max budget must be greater than min budget",
      });
    }

    if (durationFinal == null || durationFinal < 1 || !Number.isInteger(durationFinal)) {
      return res.status(400).json({
        success: false,
        message: "Duration is required and must be a positive integer (days)",
      });
    }

    // Prepare JSONB fields
    const attachmentsJson = Array.isArray(attachments)
      ? attachments
      : (typeof attachments === 'string' ? JSON.parse(attachments) : []);
    const metadataJson = typeof metadata === 'object' && metadata !== null
      ? metadata
      : (typeof metadata === 'string' ? JSON.parse(metadata || '{}') : {});

    // Generate unique client_public_id (TV- + 12 base36 chars), retry on unique violation
    const base36 = () => {
      const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
      let s = '';
      for (let i = 0; i < 12; i++) s += chars[Math.floor(Math.random() * chars.length)];
      return s;
    };
    let rows;
    for (let attempt = 0; attempt < 5; attempt++) {
      const clientPublicId = 'TV-' + base36();
      try {
        const result = await pool.query(
          `INSERT INTO tender_vault_projects (
            created_by, status, title, description, category_id, budget_min, budget_max, 
            currency, duration, attachments, metadata, client_public_id
          ) VALUES ($1, 'stored', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *`,
          [
            userId,
            title.trim(),
            description.trim(),
            category_id_final,
            Number(budget_min_final),
            Number(budget_max_final),
            currency,
            durationFinal,
            JSON.stringify(attachmentsJson),
            JSON.stringify(metadataJson),
            clientPublicId,
          ]
        );
        rows = result.rows;
        break;
      } catch (insertErr) {
        if (insertErr.code === '23505' && attempt < 4) continue; // unique violation, retry
        throw insertErr;
      }
    }
    if (!rows || rows.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create tender. Please try again.',
      });
    }

    const tender = rows[0];
    return res.status(201).json({
      success: true,
      tender,
      client_public_id: tender.client_public_id,
      message: "Tender vault project created successfully",
    });
  } catch (err) {
    console.error("createTenderVaultProject error:", err);
    
    // Check for missing table or column errors
    if (err.code === '42P01' || err.code === '42703') {
      return res.status(500).json({
        success: false,
        message: "Tender Vault DB schema mismatch. Run migrations.",
        error: err.code === '42P01' ? 'Table does not exist' : 'Column does not exist',
        code: err.code,
      });
    }
    
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create tender vault project",
    });
  }
};

/**
 * Update tender vault project
 * PUT /tender-vault/:id
 */
export const updateTenderVaultProject = async (req, res) => {
  try {
    const userId = req.token.userId;
    const { id } = req.params;
    const {
      title,
      description,
      category_id,
      budget_min,
      budget_max,
      deadline,
      attachments,
    } = req.body;

    // Check if project exists and belongs to user
    const { rows: existing } = await pool.query(
      `SELECT id FROM tender_vault_projects WHERE id = $1 AND created_by = $2 AND is_deleted = false`,
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tender vault project not found",
      });
    }

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      params.push(title.trim());
      paramIndex++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(description?.trim() || null);
      paramIndex++;
    }
    if (req.body.category_id !== undefined) {
      updates.push(`category_id = $${paramIndex}`);
      params.push(req.body.category_id || null);
      paramIndex++;
    }
    // Note: sub_category_id, sub_sub_category_id, project_type not in schema - skip
    if (budget_min !== undefined) {
      updates.push(`budget_min = $${paramIndex}`);
      params.push(budget_min || null);
      paramIndex++;
    }
    if (budget_max !== undefined) {
      updates.push(`budget_max = $${paramIndex}`);
      params.push(budget_max || null);
      paramIndex++;
    }
    if (req.body.currency !== undefined) {
      updates.push(`currency = $${paramIndex}`);
      params.push(req.body.currency);
      paramIndex++;
    }
    if (req.body.duration !== undefined || req.body.duration_days !== undefined) {
      const d = req.body.duration != null ? Number(req.body.duration) : Number(req.body.duration_days);
      if (Number.isInteger(d) && d >= 1) {
        updates.push(`duration = $${paramIndex}`);
        params.push(d);
        paramIndex++;
      }
    }
    if (req.body.attachments !== undefined) {
      updates.push(`attachments = $${paramIndex}`);
      const attachmentsJson = Array.isArray(req.body.attachments) 
        ? req.body.attachments 
        : (typeof req.body.attachments === 'string' ? JSON.parse(req.body.attachments) : []);
      params.push(JSON.stringify(attachmentsJson));
      paramIndex++;
    }
    if (req.body.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex}`);
      const metadataJson = typeof req.body.metadata === 'object' && req.body.metadata !== null
        ? req.body.metadata
        : (typeof req.body.metadata === 'string' ? JSON.parse(req.body.metadata) : {});
      params.push(JSON.stringify(metadataJson));
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    // updated_at is handled by trigger
    params.push(id, userId);

    const { rows } = await pool.query(
      `UPDATE tender_vault_projects 
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND created_by = $${paramIndex + 1} AND is_deleted = false
       RETURNING *`,
      params
    );

    return res.json({
      success: true,
      tender: rows[0],
      message: "Tender vault project updated successfully",
    });
  } catch (err) {
    console.error("updateTenderVaultProject error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update tender vault project",
    });
  }
};

/**
 * Update tender vault project status
 * PATCH /tender-vault/:id/status
 */
export const updateTenderVaultProjectStatus = async (req, res) => {
  try {
    const userId = req.token.userId;
    const { id } = req.params;
    const { status } = req.body;

    if (!['stored', 'published', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'stored', 'published', or 'archived'",
      });
    }

    // Check if project exists and belongs to user
    const { rows: existing } = await pool.query(
      `SELECT id FROM tender_vault_projects WHERE id = $1 AND created_by = $2 AND is_deleted = false`,
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tender vault project not found",
      });
    }

    // Update status (metadata can store published_at/archived_at if needed)
    let updateQuery = `UPDATE tender_vault_projects 
       SET status = $1`;
    const updateParams = [status];
    
    // updated_at is handled by trigger
    updateQuery += ` WHERE id = $2 AND created_by = $3 AND is_deleted = false RETURNING *`;
    updateParams.push(id, userId);

    const { rows } = await pool.query(updateQuery, updateParams);

    return res.json({
      success: true,
      tender: rows[0],
      message: `Tender vault project status updated to ${status}`,
    });
  } catch (err) {
    console.error("updateTenderVaultProjectStatus error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update tender vault project status",
    });
  }
};

/**
 * Delete tender vault project
 * DELETE /tender-vault/:id
 */
export const deleteTenderVaultProject = async (req, res) => {
  try {
    const userId = req.token.userId;
    const { id } = req.params;

    // Soft delete
    const { rows } = await pool.query(
      `UPDATE tender_vault_projects 
       SET is_deleted = true
       WHERE id = $1 AND created_by = $2 AND is_deleted = false
       RETURNING id`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tender vault project not found",
      });
    }

    return res.json({
      success: true,
      message: "Tender vault project deleted successfully",
    });
  } catch (err) {
    console.error("deleteTenderVaultProject error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete tender vault project",
    });
  }
};

/**
 * GET /tender-vault/rotation-status
 * Returns pool rotation status: total published tenders, minimum required, whether rotation is active.
 */
export const getRotationStatus = async (req, res) => {
  try {
    const totalPublishedTenders = await countPublishedTenders();
    const minimumRequired = 300;
    const rotationActive = totalPublishedTenders >= minimumRequired;
    return res.json({
      success: true,
      totalPublishedTenders,
      minimumRequired,
      rotationActive,
    });
  } catch (err) {
    console.error("getRotationStatus error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to get rotation status",
    });
  }
};
