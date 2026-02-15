import pool from "../models/db.js";

export const hasActiveSubscription = async (freelancerId) => {
  const { rows } = await pool.query(
    `SELECT id 
     FROM subscriptions 
     WHERE freelancer_id = $1
       AND status = 'active'
       AND start_date IS NOT NULL
       AND end_date >= NOW()
     LIMIT 1`,
    [freelancerId]
  );

  return rows.length > 0;
};

/**
 * Check if freelancer has subscription that allows applying (active or pending_start)
 * Used for apply restriction enforcement
 */
export const canApplyToProjects = async (freelancerId) => {
  const { rows } = await pool.query(
    `SELECT id, status
     FROM subscriptions 
     WHERE freelancer_id = $1
       AND status IN ('active', 'pending_start')
     ORDER BY created_at DESC
     LIMIT 1`,
    [freelancerId]
  );

  if (rows.length === 0) {
    return { canApply: false, reason: "No subscription found" };
  }

  const subscription = rows[0];
  
  // If active, check if not expired
  if (subscription.status === 'active') {
    const { rows: activeRows } = await pool.query(
      `SELECT id 
       FROM subscriptions 
       WHERE freelancer_id = $1
         AND status = 'active'
         AND start_date IS NOT NULL
         AND end_date >= NOW()
       LIMIT 1`,
      [freelancerId]
    );
    
    if (activeRows.length === 0) {
      return { canApply: false, reason: "Subscription expired" };
    }
  }

  return { canApply: true, subscription };
};