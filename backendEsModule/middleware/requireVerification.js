import { pool } from "../models/db.js";

// Ensures the authenticated user has an approved verification record
const requireVerified = async (req, res, next) => {
  try {
    const userId = req.token?.userId;
    const roleId = req.token?.role;
    if (!userId || !roleId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // role 2 = employee/customer, role 3 = freelancer (per project spec)
    let tableName = roleId === 3 ? "freelancer_verifications" : "customer_verifications";

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

    return next();
  } catch (err) {
    console.error("requireVerified error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
 
export default requireVerified; 


