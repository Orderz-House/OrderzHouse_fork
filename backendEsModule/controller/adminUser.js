import pool from "../models/db.js";


/**
 * Get users by role (admin only)
 */
export const getUsersByRole = async (req, res) => {
  try {
    // Check admin access
    if (Number(req.token.role) !== 1) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    const { roleId } = req.params;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "Missing roleId parameter.",
      });
    }

    // Build the base query for shared columns
    let query = `
      SELECT 
        id, 
        role_id, 
        first_name, 
        last_name, 
        email, 
        password,
        is_deleted,
        phone_number, 
        country, 
        profile_pic_url,
        username, 
        created_at, 
        is_online, 
        updated_at, 
        bio,
        is_two_factor_enabled, 
        is_locked
    `;

    // Add freelancer-specific fields
    if (Number(roleId) === 3) {
      query += `,
        is_verified,
        rating_sum,
        rating_count,
        CASE 
          WHEN rating_count > 0 
          THEN ROUND(CAST(rating_sum AS NUMERIC) / rating_count, 2)
          ELSE 0 
        END as rating
      `;
    }

    query += `
      FROM users
      WHERE role_id = $1
        AND is_deleted = false
      ORDER BY id ASC
    `;

    const { rows } = await pool.query(query, [roleId]);

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
  const requesterRole = req.token?.roleId;

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
 * Create a new user
 * - For admin creation or registration
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
      role_id || 3, // default freelancer
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
      res
        .status(400)
        .json({ success: false, message: "Email, username, or phone already exists" });
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
  const requesterRole = req.token?.roleId;

  if (parseInt(id) !== requesterId && requesterRole !== 1)
    return res.status(403).json({ success: false, message: "Unauthorized" });

  const {
    first_name,
    last_name,
    phone_number,
    country,
    bio,
    profile_pic_url,
    username,
  } = req.body;

  try {
    const query = `
      UPDATE users
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          phone_number = COALESCE($3, phone_number),
          country = COALESCE($4, country),
          bio = COALESCE($5, bio),
          profile_pic_url = COALESCE($6, profile_pic_url),
          username = COALESCE($7, username),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 AND is_deleted = false
      RETURNING id, first_name, last_name, email, phone_number, country, bio, profile_pic_url, username, updated_at;
    `;

    const result = await pool.query(query, [
      first_name,
      last_name,
      phone_number,
      country,
      bio,
      profile_pic_url,
      username,
      id,
    ]);

    if (!result.rows.length)
      return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User updated successfully", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Soft delete user (admin or self)
 */
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const requesterId = req.token?.userId;
  const requesterRole = req.token?.roleId;

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
    if (req.token.roleId !== 1)
      return res.status(403).json({ success: false, message: "Access denied" });

    const result = await pool.query(
      `UPDATE users
       SET is_verified = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND role_id = 3
       RETURNING id, email, is_verified`,
      [id]
    );

    if (!result.rows.length)
      return res.status(404).json({ success: false, message: "Freelancer not found or not eligible" });

    res.status(200).json({
      success: true,
      message: "Freelancer verified successfully",
      user: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
