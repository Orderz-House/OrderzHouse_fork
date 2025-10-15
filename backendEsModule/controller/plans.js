/**
 * -------------------------------
 * PLANS & SUBSCRIPTIONS BACKEND
 * -------------------------------
 * Story:
 * - Freelancers can subscribe to plans.
 * - Subscription starts when freelancer is assigned their first project.
 * - Plans have: name, price, duration (days), description, features.
 * - Subscription status: active, cancelled, pending_start.
 */

import pool from "../models/db.js";

/**
 * Get all plans
 */
const getPlans = (req, res) => {
  pool
    .query("SELECT * FROM plans ORDER BY id ASC")
    .then((result) => {
      res.status(200).json({ success: true, plans: result.rows });
    })
    .catch((err) => res.status(500).json({ success: false, error: err.message }));
};

/**
 * Create a new plan
 */
const createPlan = (req, res) => {
  const { name, price, duration, description, features } = req.body;
  const query = `
    INSERT INTO plans (name, price, duration, description, features)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  pool
    .query(query, [name, price, duration, description, features])
    .then((result) => res.status(201).json({
      success: true,
      message: "Plan created successfully",
      plan: result.rows[0],
    }))
    .catch((err) => res.status(500).json({
      success: false,
      message: "Failed to create plan",
      error: err.message,
    }));
};

/**
 * Edit a plan
 */
const editPlan = (req, res) => {
  const { id } = req.params;
  const { name, price, duration, description, features } = req.body;
  const query = `
    UPDATE plans
    SET name = $1, price = $2, duration = $3, description = $4, features = $5
    WHERE id = $6
    RETURNING *;
  `;
  pool
    .query(query, [name, price, duration, description, features, id])
    .then((result) => res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      plan: result.rows[0],
    }))
    .catch((err) => res.status(500).json({
      success: false,
      message: "Failed to update plan",
      error: err.message,
    }));
};

/**
 * Delete a plan
 */
const deletePlan = (req, res) => {
  const { id } = req.params;
  pool
    .query("DELETE FROM plans WHERE id = $1", [id])
    .then(() => res.status(200).json({ success: true, message: "Plan deleted successfully" }))
    .catch((err) => res.status(500).json({ success: false, message: "Failed to delete plan", error: err.message }));
};

/**
 * Get plan subscriptions count
 */
const getPlanSubscriptions = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT plans.id, plans.name, plans.price, plans.duration, plans.description,
      COUNT(subscriptions.id) AS subscription_count
    FROM plans
    LEFT JOIN subscriptions ON plans.id = subscriptions.plan_id
    WHERE plans.id = $1
    GROUP BY plans.id
    ORDER BY plans.id;
  `;
  pool
    .query(query, [id])
    .then((result) => res.status(200).json({ success: true, plans: result.rows }))
    .catch((err) => res.status(500).json({ success: false, error: err.message }));
};

/**
 * Get freelancer active subscription
 * - Status: active or pending_start (if start_date is null)
 */
const getFreelancerSubscription = (req, res) => {
  const freelancerId = req.token?.userId;
  const query = `
    SELECT s.*, p.name, p.price, p.duration, p.description,
      CASE WHEN s.start_date IS NULL THEN 'pending_start' ELSE s.status END AS current_status
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.freelancer_id = $1 AND s.status = 'active';
  `;
  pool
    .query(query, [freelancerId])
    .then((result) => {
      if (!result.rows.length) return res.status(200).json({ success: true, subscribed: false });
      res.status(200).json({
        success: true,
        subscribed: true,
        subscription: result.rows[0],
      });
    })
    .catch((err) => res.status(500).json({ success: false, error: err.message }));
};

/**
 * Subscribe to a plan
 * - Subscription starts on first project assignment
 */
const subscribeToPlan = async (req, res) => {
  const freelancerId = req.token?.userId;
  const { plan_id } = req.body;

  try {
    const existing = await pool.query(
      `SELECT * FROM subscriptions WHERE freelancer_id = $1 AND status = 'active'`,
      [freelancerId]
    );
    if (existing.rows.length > 0) return res.status(400).json({ success: false, message: "You already have an active subscription." });

    const planRes = await pool.query("SELECT duration FROM plans WHERE id = $1", [plan_id]);
    if (planRes.rows.length === 0) return res.status(404).json({ success: false, message: "Plan not found" });

    // Create subscription with pending start
    const insertQuery = `
      INSERT INTO subscriptions (freelancer_id, plan_id, start_date, end_date, status)
      VALUES ($1, $2, NULL, NULL, 'active')
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [freelancerId, plan_id]);

    res.status(201).json({
      success: true,
      message: "Subscription created successfully. Start date will be set on first project assignment.",
      subscription: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Cancel active subscription
 */
const cancelSubscription = (req, res) => {
  const freelancerId = req.token?.userId;
  const query = `
    UPDATE subscriptions
    SET status = 'cancelled'
    WHERE freelancer_id = $1 AND status = 'active'
    RETURNING *;
  `;
  pool
    .query(query, [freelancerId])
    .then((result) => {
      if (!result.rows.length) return res.status(400).json({ success: false, message: "No active subscription found" });
      res.status(200).json({ success: true, message: "Subscription cancelled successfully" });
    })
    .catch((err) => res.status(500).json({ success: false, error: err.message }));
};

export {
  getPlans,
  createPlan,
  editPlan,
  deletePlan,
  getPlanSubscriptions,
  getFreelancerSubscription,
  subscribeToPlan,
  cancelSubscription,
};
