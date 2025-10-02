import pool from "../models/db.js";

// Get freelancer earnings summary
export const getFreelancerEarningsSummary = async (req, res) => {
  try {
    const { freelancerId } = req.params;

    // Check user exists and is freelancer
    const userCheck = await pool.query(
      `SELECT id, role_id, wallet 
       FROM users 
       WHERE id = $1 AND is_deleted = false`,
      [freelancerId]
    );

    if (!userCheck.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Freelancer not found"
      });
    }

    if (userCheck.rows[0].role_id !== 3) {
      return res.status(403).json({
        success: false,
        message: "User is not a freelancer"
      });
    }

    const availableInAccount = userCheck.rows[0].wallet || 0;

    // Total income (all payments received)
    const totalIncomeResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_income
       FROM payments 
       WHERE freelancer_id = $1`,
      [freelancerId]
    );

    // Pending income (escrow still held)
    const pendingIncomeResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS pending_income
       FROM escrow 
       WHERE freelancer_id = $1 AND status = 'held'`,
      [freelancerId]
    );

    // Withdraw requested (optional — if no table, keep 0)
    const withdrawRequested = 0;

    const summary = {
      totalIncome: parseFloat(totalIncomeResult.rows[0].total_income) || 0,
      pendingIncome: parseFloat(pendingIncomeResult.rows[0].pending_income) || 0,
      availableInAccount: parseFloat(availableInAccount) || 0,
      withdrawRequested
    };

    res.json({ success: true, summary });

  } catch (error) {
    console.error("getFreelancerEarningsSummary error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 📜 Get freelancer earnings history
export const getFreelancerEarningsHistory = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const historyResult = await pool.query(
      `SELECT 
         p.id,
         p.amount,
         p.payment_date AS date,
         proj.title AS project_title,
         proj.id AS project_id
       FROM payments p
       LEFT JOIN projects proj ON p.project_id = proj.id
       WHERE p.freelancer_id = $1
       ORDER BY p.payment_date DESC
       LIMIT $2 OFFSET $3`,
      [freelancerId, limit, offset]
    );

    const earningsHistory = historyResult.rows.map(row => ({
      id: row.id,
      date: row.date,
      amount: parseFloat(row.amount),
      project: {
        id: row.project_id,
        title: row.project_title
      }
    }));

    res.json({ success: true, earningsHistory });

  } catch (error) {
    console.error("getFreelancerEarningsHistory error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
