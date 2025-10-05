import pool from "../models/db.js"; // Ensure this path is correct

/**
 * Fetches a summary of a freelancer's earnings, including pending and available balances.
 */
export const getFreelancerEarningsSummary = async (req, res) => {
  const { freelancerId } = req.params;

  // Validate freelancerId
  if (!freelancerId || isNaN(parseInt(freelancerId))) {
    return res.status(400).json({ success: false, message: "A valid freelancer ID is required." });
  }

  try {
    // Fetch pending income from the escrow table
    const pendingResult = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM escrow WHERE freelancer_id = $1 AND status = 'funded'",
      [freelancerId]
    );

    // Fetch available balance from the wallets table
    const availableResult = await pool.query(
      "SELECT balance FROM wallets WHERE user_id = $1",
      [freelancerId]
    );

    const summary = {
      pendingIncome: parseFloat(pendingResult.rows[0].total),
      availableInAccount: availableResult.rows.length > 0 ? parseFloat(availableResult.rows[0].balance) : 0,
    };

    res.status(200).json({ success: true, summary });

  } catch (err) {
    console.error(`Error fetching earnings summary for freelancer ${freelancerId}:`, err);
    res.status(500).json({ success: false, message: "Server Error while fetching earnings summary." });
  }
};

/**
 * Fetches the detailed transaction history for a freelancer's completed payments.
 */
export const getFreelancerEarningsHistory = async (req, res) => {
  const { freelancerId } = req.params;

  // Validate freelancerId
  if (!freelancerId || isNaN(parseInt(freelancerId))) {
    return res.status(400).json({ success: false, message: "A valid freelancer ID is required." });
  }

  try {
    // --- THIS IS THE CORRECTED QUERY ---
    // It joins 'payments' with 'projects' to get the project title.
    const query = `
      SELECT 
        pay.id, 
        pay.amount, 
        p.title AS project,  -- Select the project's title and rename it to "project"
        pay.created_at AS date 
      FROM 
        payments AS pay
      JOIN 
        projects AS p ON pay.project_id = p.id
      WHERE 
        pay.freelancer_id = $1 AND pay.status = 'completed'
      ORDER BY 
        pay.created_at DESC;
    `;

    const result = await pool.query(query, [freelancerId]);

    res.status(200).json({
      success: true,
      earningsHistory: result.rows,
    });

  } catch (err) {
    console.error(`Error fetching earnings history for freelancer ${freelancerId}:`, err);
    res.status(500).json({ success: false, message: "Server Error while fetching earnings history.", error: err.message });
  }
};
