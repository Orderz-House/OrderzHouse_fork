/**
 * -------------------------------
 * PLANS & SUBSCRIPTIONS BACKEND
 * -------------------------------
 */

import pool from "../models/db.js";

/**
 * Utility: consistent error handler
 */
const handleError = (res, err, message = "Server error") => {
  console.error(message, err);
  return res.status(500).json({ success: false, message, error: err.message });
};

/**
 * Get all plans
 */
export const getPlans = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM plans ORDER BY id ASC");
    res.status(200).json({ success: true, plans: rows });
  } catch (err) {
    handleError(res, err, "Failed to fetch plans");
  }
};

/**
 * Create a new plan
 */
export const createPlan = async (req, res) => {
  const { name, price, duration, description, features, plan_type } = req.body;

  if (!name || !price || !duration) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: name, price, duration",
    });
  }

  try {
    const query = `
      INSERT INTO plans (name, price, duration, description, features, plan_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [
      name,
      price,
      duration,
      description || "",
      features || [],
      plan_type || "monthly",
    ]);
    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      plan: rows[0],
    });
  } catch (err) {
    handleError(res, err, "Failed to create plan");
  }
};

/**
 * Edit a plan
 */
export const editPlan = async (req, res) => {
  const { id } = req.params;
  const { name, price, duration, description, features, plan_type } = req.body;

  try {
    const query = `
      UPDATE plans
      SET name = $1, price = $2, duration = $3, description = $4, features = $5, plan_type = $6
      WHERE id = $7
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [
      name,
      price,
      duration,
      description,
      features,
      plan_type || "monthly",
      id,
    ]);

    if (!rows.length)
      return res.status(404).json({ success: false, message: "Plan not found" });

    res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      plan: rows[0],
    });
  } catch (err) {
    handleError(res, err, "Failed to update plan");
  }
};

/**
 * Delete a plan
 */
export const deletePlan = async (req, res) => {
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query("DELETE FROM plans WHERE id = $1", [id]);
    if (rowCount === 0)
      return res.status(404).json({ success: false, message: "Plan not found" });

    res.status(200).json({ success: true, message: "Plan deleted successfully" });
  } catch (err) {
    handleError(res, err, "Failed to delete plan");
  }
};

/**
 * Get plan with subscription count
 */
export const getPlanSubscriptions = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT p.*, COUNT(s.id) AS subscription_count
      FROM plans p
      LEFT JOIN subscriptions s ON p.id = s.plan_id
      WHERE p.id = $1
      GROUP BY p.id;
    `;
    const { rows } = await pool.query(query, [id]);
    if (!rows.length)
      return res.status(404).json({ success: false, message: "Plan not found" });

    res.status(200).json({ success: true, plan: rows[0] });
  } catch (err) {
    handleError(res, err, "Failed to fetch plan subscriptions");
  }
};

/**
 * Get freelancer's active subscription
 */
export const getFreelancerSubscription = async (req, res) => {
  const freelancerId = req.token?.userId;
  try {
    const query = `
      SELECT s.*, p.name, p.price, p.duration, p.description, p.plan_type,
        CASE WHEN s.start_date IS NULL THEN 'pending_start' ELSE s.status END AS current_status
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE s.freelancer_id = $1 AND s.status = 'active';
    `;
    const { rows } = await pool.query(query, [freelancerId]);
    if (!rows.length)
      return res.status(200).json({ success: true, subscribed: false });

    res.status(200).json({
      success: true,
      subscribed: true,
      subscription: rows[0],
    });
  } catch (err) {
    handleError(res, err, "Failed to fetch freelancer subscription");
  }
};

/**
 * Subscribe to a plan
 */
export const subscribeToPlan = async (req, res) => {
  const freelancerId = req.token?.userId;
  const { plan_id } = req.body;

  try {
    const existing = await pool.query(
      `SELECT * FROM subscriptions WHERE freelancer_id = $1 AND status = 'active'`,
      [freelancerId]
    );
    if (existing.rows.length > 0)
      return res
        .status(400)
        .json({ success: false, message: "Already subscribed to an active plan." });

    const planRes = await pool.query(
      "SELECT duration FROM plans WHERE id = $1",
      [plan_id]
    );
    if (!planRes.rows.length)
      return res.status(404).json({ success: false, message: "Plan not found" });

    const insertQuery = `
      INSERT INTO subscriptions (freelancer_id, plan_id, start_date, end_date, status)
      VALUES ($1, $2, NULL, NULL, 'active')
      RETURNING *;
    `;
    const { rows } = await pool.query(insertQuery, [freelancerId, plan_id]);

    res.status(201).json({
      success: true,
      message:
        "Subscription created successfully. It will start when your first project is assigned.",
      subscription: rows[0],
    });
  } catch (err) {
    handleError(res, err, "Failed to subscribe to plan");
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (req, res) => {
  const freelancerId = req.token?.userId;

  try {
    const { rows } = await pool.query(
      `UPDATE subscriptions
       SET status = 'cancelled'
       WHERE freelancer_id = $1 AND status = 'active'
       RETURNING *;`,
      [freelancerId]
    );

    if (!rows.length)
      return res.status(400).json({
        success: false,
        message: "No active subscription found.",
      });

    res
      .status(200)
      .json({ success: true, message: "Subscription cancelled successfully." });
  } catch (err) {
    handleError(res, err, "Failed to cancel subscription");
  }
};
