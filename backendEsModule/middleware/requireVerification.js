import pool from "../models/db.js";

export const requireVerified = async (req, res, next) => {
  try {
    const user_id = req.token?.userId;
    const role_id = req.token?.role;

    if (!user_id || !role_id) {
      return res.status(401).json({ success: false, message: "غير مصرح" });
    }

    // جلب بيانات المستخدم
    const userResult = await pool.query(
      `SELECT is_verified, role_id, profile_pic_url 
       FROM users 
       WHERE id = $1 AND is_deleted = FALSE`,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "المستخدم غير موجود أو محذوف" });
    }

    const { is_verified, role_id: userRoleId, profile_pic_url } = userResult.rows[0];

    // إذا موثق مسبقًا، نسمح بالدخول مباشرة
    if (is_verified) return next();

    let missingFields = [];

    if (!profile_pic_url) missingFields.push("profile_image");

    if (userRoleId === 3) {
      // Freelancer: التحقق مطلوب
      const verificationRes = await pool.query(
        `SELECT bio, skills, portfolio_url 
         FROM freelancer_verifications
         WHERE user_id = $1 
         ORDER BY id DESC 
         LIMIT 1`,
        [user_id]
      );

      if (verificationRes.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "يجب تقديم طلب التحقق أولاً",
          missingFields: ["bio", "skills", "portfolio_url", "profile_image", "portfolio_item"],
          redirectTo: "/verify-profile",
        });
      }

      const v = verificationRes.rows[0];
      if (!v.bio) missingFields.push("bio");
      if (!v.skills) missingFields.push("skills");
      if (!v.portfolio_url) missingFields.push("portfolio_url");

      // التحقق من وجود عنصر واحد على الأقل في البورتفوليو
      const portfolioRes = await pool.query(
        "SELECT COUNT(*)::int AS count FROM portfolios WHERE freelancer_id = $1",
        [user_id]
      );
      if (portfolioRes.rows[0].count === 0) missingFields.push("portfolio_item");
    } else if (userRoleId === 2) {
      // العملاء لا يحتاجون للتحقق → السماح بالدخول
      return next();
    }

    // إذا هناك حقول ناقصة
    return res.status(403).json({
      success: false,
      message: "حسابك غير موثق بعد. يرجى إكمال ملفك الشخصي.",
      missingFields,
      redirectTo: "/verify-profile",
    });
  } catch (err) {
    console.error("requireVerified error:", err);
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

export default requireVerified;
