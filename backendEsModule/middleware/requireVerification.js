import pool from "../models/db.js";

export const requireVerified = async (req, res, next) => {
  try {
    const freelancerId = req.token?.userId;
    const roleId = req.token?.role;

    if (!freelancerId || !roleId) {
      return res.status(401).json({ success: false, message: "غير مصرح" });
    }

    // السماح بحذف البورتفوليو للفريلانسر مباشرة
    if (
      req.method === "DELETE" &&
      req.path === "/users/freelancers/portfolio/delete" &&
      roleId === 3
    ) {
      return next();
    }

    // ✅ التحقق من وجود اشتراك نشط ومفعل (start_date موجود و end_date بعد اليوم)
    const subscriptionQuery = await pool.query(
      `SELECT id, start_date, end_date FROM subscriptions 
       WHERE freelancer_id = $1
         AND status = 'active'
         AND start_date IS NOT NULL
         AND end_date >= NOW()
       LIMIT 1`,
      [freelancerId]
    );

    if (subscriptionQuery.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "يجب تفعيل الاشتراك لتتمكن من استخدام هذه الميزة.",
      });
    }

    next();
  } catch (error) {
    console.error("requireVerified error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

export default requireVerified;
