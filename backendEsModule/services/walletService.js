import { pool } from "../models/db.js";
import { LogCreators, ACTION_TYPES, ENTITY_TYPES } from "./loggingService.js";

/**
 * Wallet Service - Handles all wallet operations safely
 * Includes validation, error handling, and logging
 */

/**
 * Get user's current wallet balance
 * @param {number} userId - User ID
 * @returns {Promise<number>} Current balance
 */
export const getWalletBalance = async (userId) => {
  try {
    const { rows } = await pool.query(
      `SELECT COALESCE(wallet, 0) as balance FROM users WHERE id = $1 AND is_deleted = false`,
      [userId]
    );
    
    if (rows.length === 0) {
      throw new Error('User not found');
    }
    
    return parseFloat(rows[0].balance) || 0;
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    throw error;
  }
};

/**
 * Validate wallet operation parameters
 * @param {number} userId - User ID
 * @param {number} amount - Amount to operate on
 * @param {string} operation - Operation type (credit/debit/transfer)
 * @returns {Promise<Object>} Validation result
 */
export const validateWalletOperation = async (userId, amount, operation) => {
  try {
    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return {
        valid: false,
        error: 'Invalid amount. Must be a positive number.'
      };
    }

    // Validate user exists
    const { rows: userRows } = await pool.query(
      `SELECT id, wallet FROM users WHERE id = $1 AND is_deleted = false`,
      [userId]
    );
    
    if (userRows.length === 0) {
      return {
        valid: false,
        error: 'User not found'
      };
    }

    const currentBalance = parseFloat(userRows[0].wallet) || 0;

    // For debit operations, check if user has sufficient balance
    if (operation === 'debit' && currentBalance < amount) {
      return {
        valid: false,
        error: `Insufficient balance. Current balance: $${currentBalance}, Required: $${amount}`
      };
    }

    return {
      valid: true,
      currentBalance,
      newBalance: operation === 'credit' ? currentBalance + amount : currentBalance - amount
    };
  } catch (error) {
    console.error('Error validating wallet operation:', error);
    return {
      valid: false,
      error: 'Validation error occurred'
    };
  }
};

/**
 * Credit money to user's wallet
 * @param {number} userId - User ID
 * @param {number} amount - Amount to credit
 * @param {string} reason - Reason for credit
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Operation result
 */
export const creditWallet = async (userId, amount, reason = 'Credit', metadata = null) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Validate operation
    const validation = await validateWalletOperation(userId, amount, 'credit');
    if (!validation.valid) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: validation.error
      };
    }

    // Update wallet
    const { rows } = await client.query(
      `UPDATE users SET wallet = COALESCE(wallet, 0) + $1 WHERE id = $2 RETURNING wallet`,
      [amount, userId]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'Failed to update wallet'
      };
    }

    const newBalance = parseFloat(rows[0].wallet);

    // Log the operation
    await LogCreators.walletOperation(
      userId,
      ACTION_TYPES.WALLET_CREDIT,
      amount,
      newBalance,
      true,
      { reason, ...metadata }
    );

    await client.query('COMMIT');

    return {
      success: true,
      previousBalance: validation.currentBalance,
      newBalance,
      amount,
      reason
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error crediting wallet:', error);
    
    // Log the error
    await LogCreators.walletOperation(
      userId,
      ACTION_TYPES.WALLET_CREDIT,
      amount,
      0,
      false,
      { reason, error: error.message, ...metadata }
    );

    return {
      success: false,
      error: 'Failed to credit wallet'
    };
  } finally {
    client.release();
  }
};

/**
 * Debit money from user's wallet
 * @param {number} userId - User ID
 * @param {number} amount - Amount to debit
 * @param {string} reason - Reason for debit
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Operation result
 */
export const debitWallet = async (userId, amount, reason = 'Debit', metadata = null) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Validate operation
    const validation = await validateWalletOperation(userId, amount, 'debit');
    if (!validation.valid) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: validation.error
      };
    }

    // Update wallet
    const { rows } = await client.query(
      `UPDATE users SET wallet = wallet - $1 WHERE id = $2 RETURNING wallet`,
      [amount, userId]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'Failed to update wallet'
      };
    }

    const newBalance = parseFloat(rows[0].wallet);

    // Log the operation
    await LogCreators.walletOperation(
      userId,
      ACTION_TYPES.WALLET_DEBIT,
      amount,
      newBalance,
      true,
      { reason, ...metadata }
    );

    await client.query('COMMIT');

    return {
      success: true,
      previousBalance: validation.currentBalance,
      newBalance,
      amount,
      reason
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error debiting wallet:', error);
    
    // Log the error
    await LogCreators.walletOperation(
      userId,
      ACTION_TYPES.WALLET_DEBIT,
      amount,
      0,
      false,
      { reason, error: error.message, ...metadata }
    );

    return {
      success: false,
      error: 'Failed to debit wallet'
    };
  } finally {
    client.release();
  }
};

/**
 * Transfer money between two users
 * @param {number} fromUserId - Source user ID
 * @param {number} toUserId - Destination user ID
 * @param {number} amount - Amount to transfer
 * @param {string} reason - Reason for transfer
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Operation result
 */
export const transferWallet = async (fromUserId, toUserId, amount, reason = 'Transfer', metadata = null) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Validate both users exist
    const { rows: users } = await client.query(
      `SELECT id, wallet FROM users WHERE id IN ($1, $2) AND is_deleted = false ORDER BY id`,
      [fromUserId, toUserId]
    );
    
    if (users.length !== 2) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'One or both users not found'
      };
    }

    const fromUser = users.find(u => u.id === fromUserId);
    const toUser = users.find(u => u.id === toUserId);
    
    if (!fromUser || !toUser) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'User lookup failed'
      };
    }

    const fromUserBalance = parseFloat(fromUser.wallet) || 0;
    
    // Check if source user has sufficient balance
    if (fromUserBalance < amount) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: `Insufficient balance. Current balance: $${fromUserBalance}, Required: $${amount}`
      };
    }

    // Perform the transfer
    await client.query(
      `UPDATE users SET wallet = wallet - $1 WHERE id = $2`,
      [amount, fromUserId]
    );

    await client.query(
      `UPDATE users SET wallet = COALESCE(wallet, 0) + $1 WHERE id = $2`,
      [amount, toUserId]
    );

    // Get updated balances
    const { rows: updatedBalances } = await client.query(
      `SELECT id, wallet FROM users WHERE id IN ($1, $2) ORDER BY id`,
      [fromUserId, toUserId]
    );

    const fromUserNewBalance = parseFloat(updatedBalances.find(u => u.id === fromUserId).wallet);
    const toUserNewBalance = parseFloat(updatedBalances.find(u => u.id === toUserId).wallet);

    // Log both operations
    await LogCreators.walletOperation(
      fromUserId,
      ACTION_TYPES.WALLET_TRANSFER,
      amount,
      fromUserNewBalance,
      true,
      { reason, toUserId, ...metadata }
    );

    await LogCreators.walletOperation(
      toUserId,
      ACTION_TYPES.WALLET_TRANSFER,
      amount,
      toUserNewBalance,
      true,
      { reason, fromUserId, ...metadata }
    );

    await client.query('COMMIT');

    return {
      success: true,
      fromUser: {
        id: fromUserId,
        previousBalance: fromUserBalance,
        newBalance: fromUserNewBalance
      },
      toUser: {
        id: toUserId,
        previousBalance: parseFloat(toUser.wallet) || 0,
        newBalance: toUserNewBalance
      },
      amount,
      reason
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error transferring wallet:', error);
    
    // Log the error for both users
    await LogCreators.walletOperation(
      fromUserId,
      ACTION_TYPES.WALLET_TRANSFER,
      amount,
      0,
      false,
      { reason, toUserId, error: error.message, ...metadata }
    );

    await LogCreators.walletOperation(
      toUserId,
      ACTION_TYPES.WALLET_TRANSFER,
      amount,
      0,
      false,
      { reason, fromUserId, error: error.message, ...metadata }
    );

    return {
      success: false,
      error: 'Failed to transfer wallet'
    };
  } finally {
    client.release();
  }
};

/**
 * Get wallet transaction history
 * @param {number} userId - User ID
 * @param {number} limit - Number of transactions to return
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of wallet transactions
 */
export const getWalletHistory = async (userId, limit = 50, offset = 0) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM logs 
       WHERE user_id = $1 
       AND action_type IN ($2, $3, $4)
       ORDER BY created_at DESC 
       LIMIT $5 OFFSET $6`,
      [
        userId,
        ACTION_TYPES.WALLET_CREDIT,
        ACTION_TYPES.WALLET_DEBIT,
        ACTION_TYPES.WALLET_TRANSFER,
        limit,
        offset
      ]
    );
    
    return rows;
  } catch (error) {
    console.error('Error getting wallet history:', error);
    throw error;
  }
};

/**
 * Validate escrow creation
 * @param {number} clientId - Client user ID
 * @param {number} amount - Escrow amount
 * @returns {Promise<Object>} Validation result
 */
export const validateEscrowCreation = async (clientId, amount) => {
  try {
    const balance = await getWalletBalance(clientId);
    
    if (balance < amount) {
      return {
        valid: false,
        error: `Insufficient balance for escrow. Current balance: $${balance}, Required: $${amount}`
      };
    }

    return {
      valid: true,
      currentBalance: balance,
      newBalance: balance - amount
    };
  } catch (error) {
    console.error('Error validating escrow creation:', error);
    return {
      valid: false,
      error: 'Validation error occurred'
    };
  }
};

export default {
  getWalletBalance,
  validateWalletOperation,
  creditWallet,
  debitWallet,
  transferWallet,
  getWalletHistory,
  validateEscrowCreation
};