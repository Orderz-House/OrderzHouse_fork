import pool from "../../models/db.js";

/**
 * Get a complete financial overview for a client
 * @param {number} userId - Client user ID
 * @returns {object} Combined payments, wallet transactions, escrow info, wallet balance
 */
export const getClientFinancialOverview = async (userId) => {
  if (!userId) throw new Error("Invalid userId");

  // 1️⃣ Get payments made by client
  const paymentsRes = await pool.query(
    `
    SELECT
      p.id AS payment_id,
      p.project_id,
      p.amount,
      p.proof_url,
      p.payment_date AS date,
      'payment' AS type,
      CASE
        WHEN p.order_id IS NULL THEN 'pending'
        WHEN p.order_id = -1 THEN 'rejected'
        ELSE 'approved'
      END AS status
    FROM payments p
    WHERE p.payer_id = $1
    ORDER BY p.payment_date DESC
    `,
    [userId]
  );

  // 2️⃣ Get wallet transactions
  const walletTransactionsRes = await pool.query(
    `
    SELECT
      wt.id AS transaction_id,
      wt.amount,
      wt.type,
      wt.note,
      wt.created_at AS date
    FROM wallet_transactions wt
    WHERE wt.user_id = $1
    ORDER BY wt.created_at DESC
    `,
    [userId]
  );

  // 3️⃣ Get escrow entries for client
  const escrowRes = await pool.query(
    `
    SELECT
      e.id AS escrow_id,
      e.project_id,
      e.amount,
      e.status,
      e.created_at,
      e.released_at
    FROM escrow e
    WHERE e.client_id = $1
    ORDER BY e.created_at DESC
    `,
    [userId]
  );

  // 4️⃣ Get current wallet balance
  const walletRes = await pool.query(
    `
    SELECT balance
    FROM wallets
    WHERE user_id = $1
    `,
    [userId]
  );
  const balance = walletRes.rows.length ? parseFloat(walletRes.rows[0].balance) : 0;

  // 5️⃣ Combine payments and wallet transactions into one timeline
  const combined = [
    ...paymentsRes.rows.map((p) => ({
      id: p.payment_id,
      category: "payment",
      status: p.status,
      project_id: p.project_id,
      amount: parseFloat(p.amount),
      proof_url: p.proof_url,
      date: p.date,
    })),
    ...walletTransactionsRes.rows.map((t) => ({
      id: t.transaction_id,
      category: "wallet_transaction",
      type: t.type,
      note: t.note,
      amount: parseFloat(t.amount),
      date: t.date,
    })),
    ...escrowRes.rows.map((e) => ({
      id: e.escrow_id,
      category: "escrow",
      project_id: e.project_id,
      amount: parseFloat(e.amount),
      status: e.status,
      created_at: e.created_at,
      released_at: e.released_at,
      date: e.created_at,
    })),
  ];

  // Sort by date descending
  combined.sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    balance,
    overview: combined,
  };
};
