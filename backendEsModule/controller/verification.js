import pool from "../models/db.js";

// Freelancer submits verification data
export const submitFreelancerVerification = async (req, res) => {
  try {
    const user_id = req.token?.userId;
    const {
      full_name,
      country,
      phone_number,
      bio,
      skills,
      portfolio_url,
    } = req.body;

    if (!full_name || !country || !phone_number) {
      return res.status(400).json({
        success: false,
        message: "Full name, country, and phone number are required",
      });
    }

    const { rows } = await pool.query(
      `
      UPDATE users 
      SET 
        first_name = $2,
        country = $3,
        phone_number = $4,
        bio = $5,
        skills = $6,
        portfolio_url = $7,
        is_verified = FALSE,
        verification_status = 'pending',
        verification_submitted_at = NOW(),
        verification_reviewed_at = NULL
      WHERE id = $1
      RETURNING *;
      `,
      [
        user_id,
        full_name,
        country,
        phone_number,
        bio || null,
        skills || null,
        portfolio_url || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Verification request submitted successfully",
      user: rows[0],
    });
  } catch (err) {
    console.error("Error in submitFreelancerVerification:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Admin approves or rejects verification
export const reviewVerification = async (req, res) => {
  try {
    const { user_id, status } = req.body; // status = approved | rejected

    if (!user_id || !status) {
      return res.status(400).json({
        success: false,
        message: "User ID and status are required",
      });
    }

    const userRes = await pool.query(
      `SELECT id, role_id FROM users WHERE id = $1`,
      [user_id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const roleId = userRes.rows[0].role_id;
    if (roleId !== 3) {
      return res.status(400).json({
        success: false,
        message: "Only freelancers require verification",
      });
    }

    const isApproved = status === "approved";
    const { rows } = await pool.query(
      `
      UPDATE users 
      SET 
        is_verified = $2,
        verification_status = $3,
        verification_reviewed_at = NOW()
      WHERE id = $1
      RETURNING *;
      `,
      [user_id, isApproved, status]
    );

    return res.json({
      success: true,
      message:
        status === "approved"
          ? "Verification approved"
          : "Verification rejected",
      user: rows[0],
    });
  } catch (err) {
    console.error("Error in reviewVerification:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// User checks their own verification status
export const getMyVerificationStatus = async (req, res) => {
  try {
    const user_id = req.token?.userId;
    const role_id = req.token?.role;

    if (!user_id || !role_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (Number(role_id) !== 3) {
      return res.json({
        success: true,
        status: "not_required",
      });
    }

    const { rows } = await pool.query(
      `
      SELECT 
        is_verified,
        verification_status,
        verification_submitted_at,
        verification_reviewed_at
      FROM users
      WHERE id = $1;
      `,
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      status: rows[0].verification_status || "none",
      is_verified: rows[0].is_verified,
      submitted_at: rows[0].verification_submitted_at,
      reviewed_at: rows[0].verification_reviewed_at,
    });
  } catch (err) {
    console.error("Error in getMyVerificationStatus:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
