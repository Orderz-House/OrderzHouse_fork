import pool from "../models/db.js";

/**
 * Add funds to a user's wallet
 * @param {number} userId - The user ID
 * @param {number} amount - Amount to credit
 * @param {string} note - Description of the transaction
 */
export const creditWallet = async (userId, amount, note) => {
  if (!userId || !amount || amount <= 0) {
    throw new Error("Invalid parameters for creditWallet");
  }

  await pool.query(
    `UPDATE users SET wallet = COALESCE(wallet, 0) + $1 WHERE id = $2`,
    [amount, userId]
  );

  await pool.query(
    `INSERT INTO wallet_transactions (user_id, amount, type, note, created_at)
     VALUES ($1, $2, 'credit', $3, NOW())`,
    [userId, amount, note]
  );
};

/**
 * Deduct funds from a user's wallet
 * @param {number} userId - The user ID
 * @param {number} amount - Amount to debit
 * @param {string} note - Description of the transaction
 */
export const debitWallet = async (userId, amount, note) => {
  if (!userId || !amount || amount <= 0) {
    throw new Error("Invalid parameters for debitWallet");
  }

  const { rows } = await pool.query(
    `SELECT COALESCE(wallet, 0) AS wallet FROM users WHERE id = $1`,
    [userId]
  );

  if (!rows.length) {
    throw new Error("User not found");
  }

  if (parseFloat(rows[0].wallet) < parseFloat(amount)) {
    throw new Error("Insufficient wallet balance");
  }

  await pool.query(
    `UPDATE users SET wallet = wallet - $1 WHERE id = $2`,
    [amount, userId]
  );

  await pool.query(
    `INSERT INTO wallet_transactions (user_id, amount, type, note, created_at)
     VALUES ($1, $2, 'debit', $3, NOW())`,
    [userId, amount, note]
  );
};

/**
 * Get wallet balance for a user
 * @param {number} userId - The user ID
 * @returns {number} Wallet balance
 */
export const getWalletBalance = async (userId) => {
  const { rows } = await pool.query(
    `SELECT COALESCE(wallet, 0) AS wallet FROM users WHERE id = $1`,
    [userId]
  );
  return rows.length ? parseFloat(rows[0].wallet) : 0;
};

/**
 * Get wallet transaction history for a user
 * @param {number} userId - The user ID
 * @returns {Array} Transaction list
 */
export const getWalletTransactions = async (userId) => {
  const { rows } = await pool.query(
    `SELECT id, amount, type, note, created_at
     FROM wallet_transactions
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};
