// controller/earnings.js
import pool from "../models/db.js";

// Get earnings summary for freelancer
export const getFreelancerEarningsSummary = async (req, res) => {
  try {
    const { freelancerId } = req.params; // ✅ make sure we extract it

    // Verify user exists and is freelancer
    const userCheck = await pool.query(
      `SELECT id, role_id, wallet 
       FROM users 
       WHERE id = $1 AND is_deleted = false`,
      [freelancerId]
    );

    if (!userCheck.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Freelancer not found",
      });
    }

    if (userCheck.rows[0].role_id !== 3) {
      return res.status(403).json({
        success: false,
        message: "User is not a freelancer",
      });
    }

    const availableInAccount = userCheck.rows[0].wallet || 0;

    // Total income = all payments this freelancer RECEIVED
    const totalIncomeResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_income
       FROM payments 
       WHERE project_id IN (
         SELECT id FROM projects WHERE freelancer_id = $1
       )`,
      [freelancerId]
    );

    // Pending income from escrow
    const pendingIncomeResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS pending_income
       FROM escrow 
       WHERE freelancer_id = $1 AND status = 'held'`,
      [freelancerId]
    );

    const summary = {
      totalIncome: parseFloat(totalIncomeResult.rows[0].total_income) || 0,
      pendingIncome: parseFloat(pendingIncomeResult.rows[0].pending_income) || 0,
      availableInAccount: parseFloat(availableInAccount) || 0,
      withdrawRequested: 0, // placeholder
    };

    return res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("getFreelancerEarningsSummary error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get earnings history for freelancer
export const getFreelancerEarningsHistory = async (req, res) => {
  try {
    const { freelancerId } = req.params; // ✅ extract properly
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
       WHERE proj.freelancer_id = $1
       ORDER BY p.payment_date DESC
       LIMIT $2 OFFSET $3`,
      [freelancerId, limit, offset]
    );

    const earningsHistory = historyResult.rows.map((row) => ({
      id: row.id,
      date: row.date,
      project: row.project_title || `Project #${row.project_id}`,
      amount: parseFloat(row.amount),
    }));

    return res.json({
      success: true,
      earningsHistory,
    });
  } catch (error) {
    console.error("getFreelancerEarningsHistory error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
