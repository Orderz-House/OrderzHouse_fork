import pool from "../models/db.js";

// Ensures the authenticated user has an approved verification record and complete profile
export const requireVerified = async (req, res, next) => {
  try {
    const userId = req.token?.userId;
    const roleId = req.token?.role;
    if (!userId || !roleId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // For freelancers (role 3), check verification status and profile completeness
    if (roleId === 3) {
      // Check if user is verified
      const userResult = await pool.query(
        "SELECT is_verified, first_name, last_name, bio, skills, location, profile_pic_url FROM users WHERE id = $1 AND is_deleted = FALSE",
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const user = userResult.rows[0];

      // Check if user is verified
      if (!user.is_verified) {
        // Check profile completeness
        const missingFields = [];
        if (!user.first_name) missingFields.push("first_name");
        if (!user.last_name) missingFields.push("last_name");
        if (!user.bio) missingFields.push("bio");
        if (!user.skills) missingFields.push("skills");
        if (!user.location) missingFields.push("location");
        if (!user.profile_pic_url) missingFields.push("profile_image");

        // Check if user has at least one portfolio item
        const portfolioResult = await pool.query(
          "SELECT COUNT(*) as count FROM portfolios WHERE freelancer_id = $1",
          [userId]
        );

        const hasPortfolio = portfolioResult.rows[0].count > 0;

        if (!hasPortfolio) {
          missingFields.push("portfolio_item");
        }

        return res.status(403).json({
          success: false,
          message: "You must verify your account and complete your profile before using this feature.",
          missingFields: missingFields,
          redirectTo: "/verify-profile"
        });
      }
    } else {
      // For other roles, check verification status from verification tables
      let tableName = roleId === 2 ? "customer_verifications" : "freelancer_verifications";

      const { rows } = await pool.query(
        `SELECT status FROM ${tableName} WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
        [userId]
      );

      if (!rows.length || rows[0].status !== "approved") {
        return res.status(403).json({
          success: false,
          message: "Account not verified. Please submit verification and wait for approval.",
        });
      }
    }

    return next();
  } catch (err) {
    console.error("requireVerified error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
 
export default requireVerified; 


