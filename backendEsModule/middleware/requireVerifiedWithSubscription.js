import pool from "../models/db.js";

/**
 * Middleware to require verified freelancers with active subscription
 */
export const requireVerifiedWithSubscription = async (req, res, next) => {
  try {
    const user_id = req.token?.userId;
    const role_id = req.token?.role;

    if (!user_id || !role_id) {
      return res.status(401).json({ success: false, message: "غير مصرح" });
    }

    // Allow some exceptions, e.g., deleting portfolio for freelancers
    if (
      req.method === "DELETE" &&
      req.path === "/users/freelancers/portfolio/delete" &&
      role_id === 3
    ) {
      return next();
    }

    // ✅ Check if user is verified
    const userQuery = await pool.query(
      `SELECT is_verified FROM users WHERE id = $1 AND is_deleted = false`,
      [user_id]
    );

    if (!userQuery.rows.length || !userQuery.rows[0].is_verified) {
      return res.status(403).json({
        success: false,
        message: "يجب تفعيل الحساب للتحكم في المشاريع.",
      });
    }

    // ✅ Check if freelancer has active subscription
    const subscriptionQuery = await pool.query(
      `SELECT id FROM subscriptions 
       WHERE freelancer_id = $1 
         AND status = 'active'
         AND end_date >= NOW()
       LIMIT 1`,
      [user_id]
    );

    if (!subscriptionQuery.rows.length) {
      return res.status(403).json({
        success: false,
        message: "يجب تفعيل الاشتراك لتتمكن من التقديم على المشاريع.",
      });
    }

    // All checks passed
    next();
  } catch (error) {
    console.error("requireVerifiedWithSubscription error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

export default requireVerifiedWithSubscription;
