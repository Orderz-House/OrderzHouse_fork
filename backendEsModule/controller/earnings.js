import pool from "../db.js"; // Make sure you're importing your database connection pool

export const getFreelancerEarningsSummary = async (req, res) => {
  try {
    // The user ID from the request parameters (or from authentication token)
    const { freelancerId } = req.params; 

    // THE CORRECTED QUERY
    const query = `
      SELECT 
        w.balance AS "availableBalance",
        (
          SELECT COALESCE(SUM(amount), 0) 
          FROM escrow 
          WHERE freelancer_id = $1 AND status = 'funded'
        ) AS "pendingIncome"
      FROM 
        wallets AS w
      WHERE 
        w.user_id = $1;
    `;

    const result = await pool.query(query, [freelancerId]);

    // Check if a wallet was found for the user
    if (result.rows.length === 0) {
      // This case handles if a user somehow doesn't have a wallet entry.
      // We can return zero values to prevent frontend errors.
      return res.status(200).json({
        success: true,
        summary: {
          availableBalance: 0,
          pendingIncome: 0,
        },
      });
    }

    res.status(200).json({ success: true, summary: result.rows[0] });

  } catch (err) {
    console.error("Error in getFreelancerEarningsSummary:", err);
    res.status(500).json({ success: false, message: "Failed to fetch earnings summary" });
  }
};

// Add other earnings-related controller functions here if needed
