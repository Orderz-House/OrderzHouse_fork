import { pool } from "../models/db.js";
import bcrypt from "bcryptjs";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, role_id, first_name, last_name, email, phone_number, country,
             username, profile_pic_url, is_verified, is_deleted, created_at, updated_at
      FROM users
      WHERE is_deleted = FALSE
      ORDER BY created_at DESC
    `);
    res.status(200).json({ success: true, users: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId))
    return res.status(400).json({ success: false, error: "Invalid user ID" });

  try {
    const { rows } = await pool.query(
      `
      SELECT id, role_id, first_name, last_name, email, phone_number, country,
             username, profile_pic_url, is_verified, is_deleted, created_at, updated_at
      FROM users
      WHERE id = $1 AND is_deleted = FALSE
    `,
      [userId]
    );

    if (!rows[0])
      return res.status(404).json({ success: false, error: "User not found" });

    res.status(200).json({ success: true, user: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get users by role_id
export const getUsersByRoleId = async (req, res) => {
  const roleId = parseInt(req.params.roleId);
  if (isNaN(roleId))
    return res.status(400).json({ success: false, error: "Invalid role ID" });

  try {
    const { rows } = await pool.query(
      `
      SELECT id, role_id, first_name, last_name, email, phone_number, country,
             username, profile_pic_url, is_verified, is_deleted, created_at, updated_at
      FROM users
      WHERE role_id = $1 AND is_deleted = FALSE
      ORDER BY created_at DESC
    `,
      [roleId]
    );

    res.status(200).json({ success: true, users: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Create user
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
    profile_pic_url,
    is_verified,
  } = req.body;

  if (!first_name || !last_name || !email || !password || !username) {
    return res
      .status(400)
      .json({ success: false, error: "Missing required fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `
      INSERT INTO users 
      (role_id, first_name, last_name, email, password, phone_number, country, username, profile_pic_url, is_verified)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id, role_id, first_name, last_name, email, phone_number, country,
                username, profile_pic_url, is_verified, is_deleted, created_at, updated_at
    `,
      [
        role_id || 2,
        first_name,
        last_name,
        email,
        hashedPassword,
        phone_number || "",
        country || "",
        username,
        profile_pic_url || "",
        is_verified || false,
      ]
    );

    res.status(201).json({ success: true, user: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Update user
export const updateUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId))
    return res.status(400).json({ success: false, error: "Invalid user ID" });

  const {
    role_id,
    first_name,
    last_name,
    email,
    password,
    phone_number,
    country,
    username,
    profile_pic_url,
    is_verified,
    is_deleted,
  } = req.body;

  try {
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const { rows } = await pool.query(
      `
      UPDATE users SET
        role_id = COALESCE($1, role_id),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        email = COALESCE($4, email),
        password = COALESCE($5, password),
        phone_number = COALESCE($6, phone_number),
        country = COALESCE($7, country),
        username = COALESCE($8, username),
        profile_pic_url = COALESCE($9, profile_pic_url),
        is_verified = COALESCE($10, is_verified),
        is_deleted = COALESCE($11, is_deleted),
        updated_at = NOW()
      WHERE id = $12
      RETURNING id, role_id, first_name, last_name, email, phone_number, country,
                username, profile_pic_url, is_verified, is_deleted, created_at, updated_at
    `,
      [
        role_id,
        first_name,
        last_name,
        email,
        hashedPassword,
        phone_number,
        country,
        username,
        profile_pic_url,
        is_verified,
        is_deleted,
        userId,
      ]
    );

    if (!rows[0])
      return res.status(404).json({ success: false, error: "User not found" });

    res.status(200).json({ success: true, user: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Delete user (soft delete)
export const deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId))
    return res.status(400).json({ success: false, error: "Invalid user ID" });

  try {
    const { rows } = await pool.query(
      `
      UPDATE users SET is_deleted = TRUE, updated_at = NOW()
      WHERE id = $1
      RETURNING id, role_id, first_name, last_name, email, phone_number, country,
                username, profile_pic_url, is_verified, is_deleted, created_at, updated_at
    `,
      [userId]
    );

    if (!rows[0])
      return res.status(404).json({ success: false, error: "User not found" });

    res.status(200).json({ success: true, user: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
