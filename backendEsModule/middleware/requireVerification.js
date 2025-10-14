import pool from "../models/db.js";

export const requireVerified = async (req, res, next) => {
  try {
    const user_id = req.token?.userId;
    const role_id = req.token?.role;

    if (!user_id || !role_id) {
      return res.status(401).json({ success: false, message: "غير مصرح" });
    }

    // السماح بحذف البورتفوليو للفريلانسر مباشرة
    if (
      req.method === "DELETE" &&
      req.path === "/users/freelancers/portfolio/delete" &&
      role_id === 3
    ) {
      return next();
    }

    // ✅ التحقق من وجود اشتراك نشط
    const subscriptionQuery = await pool.query(
      `SELECT id FROM subscriptions 
       WHERE user_id = $1 
         AND status = 'active'
         AND (expires_at IS NULL OR expires_at > NOW()) 
       LIMIT 1`,
      [user_id]
    );

    if (subscriptionQuery.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "يجب تفعيل الاشتراك لتتمكن من استخدام هذه الميزة.",
      });
    }

    // ✅ إذا عنده اشتراك نشط، نسمح له
    next();
  } catch (error) {
    console.error("requireVerified error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

export default requireVerified;
