// middleware/requireVerified.js
import pool from "../models/db.js";

export const requireVerified = async (req, res, next) => {
  try {
    const userId = req.token?.userId;
    const roleId = req.token?.role;

    if (!userId || !roleId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Quick lookup: use is_verified from users table
    const userResult = await pool.query(
      `SELECT is_verified, role_id, profile_pic_url FROM users WHERE id = $1 AND is_deleted = FALSE`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found or deleted" });
    }

    const { is_verified, role_id, profile_pic_url } = userResult.rows[0];

    // ✅ If already verified, allow access immediately
    if (is_verified) {
      return next();
    }

    // ❌ Not verified → check why
    let missingFields = [];

    if (!profile_pic_url) missingFields.push("profile_image");

    // Role-specific checks
    if (role_id === 3) {
      // Freelancer: check verification record
      const verificationRes = await pool.query(
        `SELECT bio, skills, portfolio_url 
         FROM freelancer_verifications 
         WHERE user_id = $1 
         ORDER BY id DESC 
         LIMIT 1`,
        [userId]
      );

      if (verificationRes.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "You must submit your verification first.",
          missingFields: ["bio", "skills", "portfolio_url", "profile_image", "portfolio_item"],
          redirectTo: "/verify-profile",
        });
      }

      const v = verificationRes.rows[0];
      if (!v.bio) missingFields.push("bio");
      if (!v.skills) missingFields.push("skills");
      if (!v.portfolio_url) missingFields.push("portfolio_url");

      // Check at least one portfolio item
      const portfolioRes = await pool.query(
        "SELECT COUNT(*)::int AS count FROM portfolios WHERE user_id = $1 AND is_deleted = FALSE",
        [userId]
      );
      if (portfolioRes.rows[0].count === 0) {
        missingFields.push("portfolio_item");
      }
    } else if (role_id === 2) {
      // Customer: check customer verification
      const verificationRes = await pool.query(
        `SELECT id FROM customer_verifications WHERE user_id = $1 AND status = 'approved' LIMIT 1`,
        [userId]
      );

      if (verificationRes.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Customer account not verified. Please submit your documents.",
          missingFields: ["documents"],
          redirectTo: "/verify-profile",
        });
      }
    }

    // Return 403 with details
    return res.status(403).json({
      success: false,
      message: "Your account is not verified yet. Please complete your profile.",
      missingFields,
      redirectTo: "/verify-profile",
    });
  } catch (err) {
    console.error("requireVerified error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export default requireVerified;