import { pool } from "../models/db.js";

// Create or update customer verification request
export const submitCustomerVerification = async (req, res) => {
  try {
    const user_id = req.token?.userId;
    const { full_name, country, phone_number, document_type, document_number } = req.body;
    
    // Validate required fields
    if (!full_name || !country || !phone_number || !document_type || !document_number) {
      return res.status(400).json({ 
        success: false, 
        message: "جميع الحقول مطلوبة: الاسم الكامل، البلد، رقم الهاتف، نوع المستند، رقم المستند" 
      });
    }

    // Upsert query for customer verification
    const upsertQuery = `
      INSERT INTO customer_verifications
        (user_id, full_name, country, phone_number, document_type, document_number, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      ON CONFLICT (user_id)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        country = EXCLUDED.country,
        phone_number = EXCLUDED.phone_number,
        document_type = EXCLUDED.document_type,
        document_number = EXCLUDED.document_number,
        status = 'pending',
        reviewed_at = NULL
      RETURNING *;
    `;
    
    // Execute query
    const { rows } = await pool.query(upsertQuery, [
      user_id, full_name, country, phone_number, document_type, document_number
    ]);
    
    return res.status(201).json({ 
      success: true, 
      message: "تم تقديم طلب التحقق بنجاح",
      verification: rows[0] 
    });
  } catch (err) {
    console.error("Error in submitCustomerVerification:", err);
    return res.status(500).json({ 
      success: false, 
      message: "خطأ في الخادم" 
    });
  }
};

// Create or update freelancer verification request
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

    // Validate required fields
    if (!full_name || !country || !phone_number) {
      return res.status(400).json({ 
        success: false, 
        message: "الحقول المطلوبة: الاسم الكامل، البلد، رقم الهاتف" 
      });
    }

    // Upsert query for freelancer verification
    const upsertQuery = `
      INSERT INTO freelancer_verifications
        (user_id, full_name, country, phone_number, bio, skills, portfolio_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      ON CONFLICT (user_id)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        country = EXCLUDED.country,
        phone_number = EXCLUDED.phone_number,
        bio = EXCLUDED.bio,
        skills = EXCLUDED.skills,
        portfolio_url = EXCLUDED.portfolio_url,
        status = 'pending',
        reviewed_at = NULL
      RETURNING *;
    `;
    
    // Execute query
    const { rows } = await pool.query(upsertQuery, [
      user_id, 
      full_name, 
      country, 
      phone_number, 
      bio || null, 
      skills || null, 
      portfolio_url || null
    ]);

    return res.status(201).json({ 
      success: true, 
      message: "تم تقديم طلب التحقق بنجاح",
      verification: rows[0] 
    });
  } catch (err) {
    console.error("Error in submitFreelancerVerification:", err);
    return res.status(500).json({ 
      success: false, 
      message: "خطأ في الخادم" 
    });
  }
};

// Admin: Approve or reject verification requests
export const reviewVerification = async (req, res) => {
  try {
    const { user_id, status } = req.body; // status: approved or rejected
    
    // Validate required fields
    if (!user_id || !status) {
      return res.status(400).json({ 
        success: false, 
        message: "معرف المستخدم والحالة مطلوبان" 
      });
    }

    // Get user role to determine which table to use
    const userQuery = await pool.query('SELECT role_id FROM users WHERE id = $1', [user_id]);
    
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "المستخدم غير موجود" 
      });
    }

    const roleId = userQuery.rows[0].role_id;
    const table = roleId === 3 ? 'freelancer_verifications' : 'customer_verifications';

    // Update verification status
    const { rows } = await pool.query(
      `UPDATE ${table} SET status = $1, reviewed_at = NOW() WHERE user_id = $2 RETURNING *`, 
      [status, user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "طلب التحقق غير موجود" 
      });
    }

    // Update is_verified in users table
    if (status === 'approved') {
      await pool.query(
        `UPDATE users SET is_verified = TRUE WHERE id = $1`,
        [user_id]
      );
    } else if (status === 'rejected') {
      await pool.query(
        `UPDATE users SET is_verified = FALSE WHERE id = $1`,
        [user_id]
      );
    }

    return res.json({ 
      success: true, 
      message: status === 'approved' ? 'تم الموافقة على طلب التحقق' : 'تم رفض طلب التحقق',
      verification: rows[0] 
    });
  } catch (err) {
    console.error("Error in reviewVerification:", err);
    return res.status(500).json({ 
      success: false, 
      message: "خطأ في الخادم" 
    });
  }
};

// Get current user's verification status
export const getMyVerificationStatus = async (req, res) => {
  try {
    const user_id = req.token?.userId;
    const role_id = req.token?.role;
    
    if (!user_id || !role_id) {
      return res.status(401).json({ 
        success: false, 
        message: "غير مصرح" 
      });
    }

    // Determine which table to query based on user role
    const table = Number(role_id) === 3 ? 'freelancer_verifications' : 'customer_verifications';
    const { rows } = await pool.query(
      `SELECT status, reviewed_at, created_at FROM ${table} WHERE user_id = $1 ORDER BY id DESC LIMIT 1`, 
      [user_id]
    );

    const status = rows.length > 0 ? rows[0].status : 'none'; // none|pending|approved|rejected
    
    return res.json({ 
      success: true, 
      status,
      reviewed_at: rows[0]?.reviewed_at || null,
      created_at: rows[0]?.created_at || null
    });
  } catch (err) {
    console.error('Error in getMyVerificationStatus:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم' 
    });
  }
};

// Get detailed verification information for current user
export const getMyVerificationDetails = async (req, res) => {
  try {
    const user_id = req.token?.userId;
    const role_id = req.token?.role;
    
    if (!user_id || !role_id) {
      return res.status(401).json({ 
        success: false, 
        message: "غير مصرح" 
      });
    }

    // Determine which table to query based on user role
    const table = Number(role_id) === 3 ? 'freelancer_verifications' : 'customer_verifications';
    const { rows } = await pool.query(`SELECT * FROM ${table} WHERE user_id = $1`, [user_id]);

    return res.json({ 
      success: true, 
      verification: rows[0] || null
    });
  } catch (err) {
    console.error('Error in getMyVerificationDetails:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'خطأ في الخادم' 
    });
  }
};

export default { 
  submitCustomerVerification, 
  submitFreelancerVerification, 
  reviewVerification,
  getMyVerificationStatus,
  getMyVerificationDetails
};