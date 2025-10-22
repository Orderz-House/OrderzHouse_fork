import pool from "../models/db.js";

/**
 * Get users by role (admin only)
 */
export const getUsersByRole = async (req, res) => {
  try {
    if (Number(req.token.role) !== 1) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    const { roleId } = req.params;
    const { q } = req.query;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "Missing roleId parameter.",
      });
    }

    let query = `
      SELECT 
        u.id, 
        u.role_id, 
        u.first_name, 
        u.last_name, 
        u.email, 
        u.password,
        u.is_deleted,
        u.phone_number, 
        u.country, 
        u.profile_pic_url,
        u.username, 
        u.created_at, 
        u.is_online, 
        u.updated_at, 
        u.bio,
        u.is_two_factor_enabled, 
        u.is_locked
    `;

    if (Number(roleId) === 3) {
      query += `,
        u.is_verified,
        u.rating_sum,
        u.rating_count,
        CASE 
          WHEN u.rating_count > 0 
          THEN ROUND(CAST(u.rating_sum AS NUMERIC) / u.rating_count, 2)
          ELSE 0 
        END AS rating,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', c.id,
              'name', c.name
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS categories,
        (
          SELECT jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'price', p.price,
            'duration', p.duration,
            'start_date', s.start_date,
            'end_date', s.end_date,
            'status', s.status
          )
          FROM subscriptions s
          JOIN plans p ON p.id = s.plan_id
          WHERE s.freelancer_id = u.id
          ORDER BY s.end_date DESC
          LIMIT 1
        ) AS subscription
      `;
    }

    query += `
      FROM users u
    `;

    if (Number(roleId) === 3) {
      query += `
        LEFT JOIN freelancer_categories fc ON fc.freelancer_id = u.id
        LEFT JOIN categories c ON c.id = fc.category_id
      `;
    }

    query += `
      WHERE u.role_id = $1
        AND u.is_deleted = false
    `;

    const queryParams = [roleId];

    if (q && q.trim()) {
      query += `
        AND (
          u.username ILIKE $2 
          OR u.first_name ILIKE $2 
          OR u.last_name ILIKE $2 
          OR u.email ILIKE $2
        )
      `;
      queryParams.push(`%${q.trim()}%`);
    }

    query += `
      GROUP BY u.id
      ORDER BY u.id ASC
    `;

    const { rows } = await pool.query(query, queryParams);

    res.status(200).json({
      success: true,
      users: rows,
    });
  } catch (err) {
    console.error("getUsersByRole error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: err.message,
    });
  }
};

/**
 * Get user by ID (admin or self)
 */
export const getUserById = async (req, res) => {
  const { id } = req.params;
  const requesterId = req.token?.userId;
  const requesterRole = req.token?.role;

  try {
    if (parseInt(id) !== requesterId && requesterRole !== 1)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const result = await pool.query(
      `SELECT id, role_id, first_name, last_name, email, phone_number, country,
              username, bio, profile_pic_url, is_verified, is_online, created_at, updated_at
       FROM users
       WHERE id = $1 AND is_deleted = false`,
      [id]
    );

    if (!result.rows.length)
      return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Create a new user (admin or registration)
 */
export const createUser = async (req, res) => {
  const {
    role_id,
    first_name,
    last_name,
    email,
    password,
    phone_number,
    country,
    username,
  } = req.body;

  try {
    const query = `
      INSERT INTO users (role_id, first_name, last_name, email, password, phone_number, country, username)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, role_id, first_name, last_name, email, phone_number, country, username, created_at;
    `;

    const result = await pool.query(query, [
      role_id || 3, 
      first_name,
      last_name,
      email,
      password,
      phone_number,
      country,
      username,
    ]);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json({
        success: false,
        message: "Email, username, or phone already exists",
      });
    } else {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};


/**
 * Update user info (self or admin)
 */
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const requesterId = req.token?.userId;
  const requesterRole = req.token?.role;

  // Only admin or the user themselves can update
  if (parseInt(id) !== requesterId && requesterRole !== 1) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  // Allow updating all relevant fields
  const {
    role_id,
    first_name,
    last_name,
    email,
    password,
    phone_number,
    country,
    profile_pic_url,
    username,
    bio,
    is_verified,
    rating_sum,
    rating_count,
    is_online,
    updated_at,
    two_factor_secret,
    is_two_factor_enabled,
    failed_login_attempts,
    last_failed_login,
    otp_code,
    otp_expires,
    is_locked,
  } = req.body;

  try {
    const query = `
      UPDATE users
      SET
        role_id = COALESCE($1, role_id),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        email = COALESCE($4, email),
        password = COALESCE($5, password),
        phone_number = COALESCE($6, phone_number),
        country = COALESCE($7, country),
        profile_pic_url = COALESCE($8, profile_pic_url),
        username = COALESCE($9, username),
        bio = COALESCE($10, bio),
        is_verified = COALESCE($11, is_verified),
        rating_sum = COALESCE($12, rating_sum),
        rating_count = COALESCE($13, rating_count),
        is_online = COALESCE($14, is_online),
        updated_at = CURRENT_TIMESTAMP,
        two_factor_secret = COALESCE($15, two_factor_secret),
        is_two_factor_enabled = COALESCE($16, is_two_factor_enabled),
        failed_login_attempts = COALESCE($17, failed_login_attempts),
        last_failed_login = COALESCE($18, last_failed_login),
        otp_code = COALESCE($19, otp_code),
        otp_expires = COALESCE($20, otp_expires),
        is_locked = COALESCE($21, is_locked)
      WHERE id = $22 AND is_deleted = false
      RETURNING *;
    `;

    const result = await pool.query(query, [
      role_id,
      first_name,
      last_name,
      email,
      password,
      phone_number,
      country,
      profile_pic_url,
      username,
      bio,
      is_verified,
      rating_sum,
      rating_count,
      is_online,
      two_factor_secret,
      is_two_factor_enabled,
      failed_login_attempts,
      last_failed_login,
      otp_code,
      otp_expires,
      is_locked,
      id,
    ]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Soft delete user (admin or self)
 */
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const requesterId = req.token?.userId;
  const requesterRole = req.token?.role;

  if (parseInt(id) !== requesterId && requesterRole !== 1)
    return res.status(403).json({ success: false, message: "Unauthorized" });

  try {
    const query = `
      UPDATE users
      SET is_deleted = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email;
    `;
    const result = await pool.query(query, [id]);

    if (!result.rows.length)
      return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      message: "User deleted (soft delete) successfully",
      user: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Verify a freelancer (admin only)
 */
export const verifyFreelancer = async (req, res) => {
  const { id } = req.params;

  try {
    if (Number(req.token.role) !== 1)
      return res.status(403).json({ success: false, message: "Access denied" });

    const result = await pool.query(
      `UPDATE users
       SET is_verified = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND role_id = 3
       RETURNING id, email, is_verified`,
      [id]
    );

    if (!result.rows.length)
      return res.status(404).json({
        success: false,
        message: "Freelancer not found or not eligible",
      });

    res.status(200).json({
      success: true,
      message: "Freelancer verified successfully",
      user: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
