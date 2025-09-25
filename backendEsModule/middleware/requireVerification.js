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

    const {
      is_verified,
      role_id: userRoleId,
      profile_pic_url,
    } = userResult.rows[0];

    // إذا موثق مسبقًا، نسمح بالدخول مباشرة
    if (is_verified) return next();

    let missingFields = [];
    if (!profile_pic_url) missingFields.push("profile_image");

    // تحقق خاص للفريلانسر
    if (userRoleId === 3) {
      const verificationRes = await pool.query(
        `SELECT bio, skills, portfolio_url
         FROM freelancer_verifications
         WHERE user_id = $1
         ORDER BY id DESC
         LIMIT 1`,
        [user_id]
      );

      if (verificationRes.rows.length === 0) {
        missingFields.push("freelancer_verification");
      } else {
        const { bio, skills, portfolio_url } = verificationRes.rows[0];
        if (!bio) missingFields.push("bio");
        if (!skills) missingFields.push("skills");
        if (!portfolio_url) missingFields.push("portfolio_url");
      }
    }

    if (missingFields.length > 0) {
      return res.status(403).json({
        success: false,
        message: "التحقق غير مكتمل",
        missingFields,
      });
    }

    // السماح بالدخول بعد التحقق
    next();
  } catch (error) {
    console.error("requireVerified error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

export default requireVerified;
