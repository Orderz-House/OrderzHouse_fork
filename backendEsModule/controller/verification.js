import pool from "../models/db.js";

/* =========================================
   GET PENDING VERIFICATIONS
========================================= */
export const getPendingVerifications = async (req, res) => {
  try {
    const search = req.query.q ? `%${req.query.q.toLowerCase()}%` : null;
    const fromDate = req.query.from || null;
    const toDate = req.query.to || null;

    let query = `
      SELECT 
        id,
        username,
        email,
        created_at AS "AcountCreatedAt",
      FROM users
      WHERE role_id = 3
        AND is_verified = false
    `;

    const params = [];

    if (search) {
      query += ` AND (LOWER(username) LIKE $${params.length + 1} OR LOWER(email) LIKE $${params.length + 1})`;
      params.push(search);
    }

    if (fromDate && toDate) {
      query += ` AND created_at::date BETWEEN $${params.length + 1} AND $${params.length + 2}`;
      params.push(fromDate, toDate);
    } else if (fromDate) {
      query += ` AND created_at::date >= $${params.length + 1}`;
      params.push(fromDate);
    } else if (toDate) {
      query += ` AND created_at::date <= $${params.length + 1}`;
      params.push(toDate);
    }

    query += " ORDER BY created_at DESC";

    const { rows } = await pool.query(query, params);
    res.json({ data: rows });
  } catch (err) {
    console.error("Error fetching verifications:", err);
    res.status(500).json({ message: "Failed to fetch verifications" });
  }
};


/* =========================================
   APPROVE VERIFICATION
========================================= */
export const approveVerification = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE users 
       SET is_verified = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    res.json({ success: true, message: "Freelancer approved" });
  } catch (err) {
    console.error("Error approving verification:", err);
    res.status(500).json({ message: "Failed to approve verification" });
  }
};

/* =========================================
   REJECT VERIFICATION
========================================= */
export const rejectVerification = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE users 
       SET is_verified = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    res.json({ success: true, message: "Freelancer rejected" });
  } catch (err) {
    console.error("Error rejecting verification:", err);
    res.status(500).json({ message: "Failed to reject verification" });
  }
};
