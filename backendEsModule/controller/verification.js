import { pool } from "../models/db.js";

// Create or update customer verification request
export const submitCustomerVerification = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { full_name, country, phone_number, document_type, document_number } = req.body;
    
    // Validate required fields
    if (!full_name || !country || !phone_number || !document_type || !document_number) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required: full name, country, phone number, document type, document number" 
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
      userId, full_name, country, phone_number, document_type, document_number
    ]);
    
    return res.status(201).json({ 
      success: true, 
      message: "Verification request submitted successfully",
      verification: rows[0] 
    });
  } catch (err) {
    console.error("Error in submitCustomerVerification:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Create or update freelancer verification request
export const submitFreelancerVerification = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const {
      full_name,
      country,
      phone_number,
      categories, // array of category IDs
      bio,
      skills, // text or array
      portfolio_url,
    } = req.body;

    // Validate required fields
    if (!full_name || !country || !phone_number || !categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Required fields: full name, country, phone number, and categories (array)" 
      });
    }

    // Convert skills to text if array
    const skillsText = Array.isArray(skills) ? skills.join(',') : skills;

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
      userId, full_name, country, phone_number, bio || null, skillsText || null, portfolio_url || null
    ]);

    // Update categories mapping: delete old and insert new
    await pool.query(`DELETE FROM freelancer_verification_categories WHERE user_id = $1`, [userId]);
    
    // Insert new categories if any
    if (categories.length > 0) {
      const values = categories.map(categoryId => `(${userId}, ${categoryId})`).join(',');
      await pool.query(`INSERT INTO freelancer_verification_categories (user_id, category_id) VALUES ${values}`);
    }

    return res.status(201).json({ 
      success: true, 
      message: "Verification request submitted successfully",
      verification: rows[0] 
    });
  } catch (err) {
    console.error("Error in submitFreelancerVerification:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
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
        message: "User ID and status are required" 
      });
    }

    // Get user role to determine which table to use
    const userQuery = await pool.query('SELECT role_id FROM users WHERE id = $1', [user_id]);
    
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
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
        message: "Verification request not found" 
      });
    }

    return res.json({ 
      success: true, 
      message: `Verification request ${status === 'approved' ? 'approved' : 'rejected'}`,
      verification: rows[0] 
    });
  } catch (err) {
    console.error("Error in reviewVerification:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Get current user's verification status
export const getMyVerificationStatus = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const roleId = req.token?.role;
    
    if (!userId || !roleId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    // Determine which table to query based on user role
    const table = Number(roleId) === 3 ? 'freelancer_verifications' : 'customer_verifications';
    const { rows } = await pool.query(
      `SELECT status, reviewed_at, created_at FROM ${table} WHERE user_id = $1 ORDER BY id DESC LIMIT 1`, 
      [userId]
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
      message: 'Server error' 
    });
  }
};

// Get detailed verification information for current user
export const getMyVerificationDetails = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const roleId = req.token?.role;
    
    if (!userId || !roleId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    // Determine which table to query based on user role
    const table = Number(roleId) === 3 ? 'freelancer_verifications' : 'customer_verifications';
    const { rows } = await pool.query(`SELECT * FROM ${table} WHERE user_id = $1`, [userId]);

    // For freelancers: get associated categories
    let categories = [];
    if (Number(roleId) === 3 && rows.length > 0) {
      const categoriesQuery = await pool.query(
        `SELECT c.id, c.name FROM freelancer_verification_categories fvc
         JOIN categories c ON fvc.category_id = c.id
         WHERE fvc.user_id = $1`,
        [userId]
      );
      categories = categoriesQuery.rows;
    }

    return res.json({ 
      success: true, 
      verification: rows[0] || null,
      categories 
    });
  } catch (err) {
    console.error('Error in getMyVerificationDetails:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
export const updateVerificationStatus = async (req, res) => {
  const { userId, status } = req.body;
  const adminRoleId = req.token.role;

  if (adminRoleId !== 1) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  try {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Update verification table (freelancer or customer)
      let query = "";
      if (status === "approved") {
        // Example: assuming this is for freelancer verification
        query = `
          UPDATE freelancer_verifications 
          SET status = $1, reviewed_at = NOW() 
          WHERE user_id = $2 
          RETURNING user_id`;
      } else {
        query = `
          UPDATE freelancer_verifications 
          SET status = $1, reviewed_at = NOW() 
          WHERE user_id = $2`;
      }

      const result = await client.query(query, [status, userId]);

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ success: false, message: "Verification record not found" });
      }

      // ✅ Update is_verified in users table
      if (status === "approved") {
        await client.query(
          `UPDATE users SET is_verified = TRUE WHERE id = $1`,
          [userId]
        );
      } else if (status === "rejected") {
        await client.query(
          `UPDATE users SET is_verified = FALSE WHERE id = $1`,
          [userId]
        );
      }

      await client.query("COMMIT");

      res.status(200).json({
        success: true,
        message: `Verification ${status} successfully.`,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error updating verification status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export default { 
  submitCustomerVerification, 
  submitFreelancerVerification, 
  reviewVerification,
  getMyVerificationStatus,
  getMyVerificationDetails
};