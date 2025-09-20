import { pool } from "../models/db.js";

export const getFreelancerEarningsSummary = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    
    const userCheck = await pool.query(
      `SELECT id, role_id, wallet FROM users WHERE id = $1 AND is_deleted = false`,
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
    
    // Calculate total income from payments table (all completed payments to this freelancer)
    const totalIncomeResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total_income 
       FROM payments 
       WHERE receiver_id = $1`,
      [freelancerId]
    );
    
    // Calculate pending income from escrow (held amounts)
    const pendingIncomeResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as pending_income 
       FROM escrow 
       WHERE freelancer_id = $1 AND status = 'held'`,
      [freelancerId]
    );
    
    // For withdraw requested, we'll set to 0 since no withdrawals table exists
    const withdrawRequested = 0;
    
    const summary = {
      totalIncome: parseFloat(totalIncomeResult.rows[0].total_income) || 0,
      pendingIncome: parseFloat(pendingIncomeResult.rows[0].pending_income) || 0,
      availableInAccount: parseFloat(availableInAccount) || 0,
      withdrawRequested: withdrawRequested
    };
    
    res.json({
      success: true,
      summary
    });
    
  } catch (error) {
    console.error("getFreelancerEarningsSummary error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Get earnings history for freelancer
export const getFreelancerEarningsHistory = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    // Get earnings history from payments table with project details
    const historyResult = await pool.query(
      `SELECT 
         p.id,
         p.amount,
         p.payment_date as date,
         proj.title as project_title,
         proj.id as project_id
       FROM payments p
       LEFT JOIN projects proj ON p.project_id = proj.id
       WHERE p.receiver_id = $1
       ORDER BY p.payment_date DESC
       LIMIT $2 OFFSET $3`,
      [freelancerId, limit, offset]
    );
    
    const earningsHistory = historyResult.rows.map(row => ({
      id: row.id,
      date: row.date,
      project: row.project_title || `Project #${row.project_id}` || 'Unknown Project',
      amount: parseFloat(row.amount)
    }));
    
    res.json({
      success: true,
      earningsHistory
    });
    
  } catch (error) {
    console.error("getFreelancerEarningsHistory error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

export default {
  getFreelancerEarningsSummary,
  getFreelancerEarningsHistory
};