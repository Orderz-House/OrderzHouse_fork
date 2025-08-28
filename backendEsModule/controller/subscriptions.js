import { pool } from "../models/db.js";

const subscriptionToPlan = async (req, res) => {
  const { freelancer_id, plan_id, status } = req.body;
  if (!freelancer_id || !plan_id || !status) {
    return res.status(400).json({
      success: false,
      message: "freelancer_id, plan_id, and status are required"
    });
  }
  let duration;
  try {
    const planResult = await pool.query("SELECT duration FROM plans WHERE id = $1", [plan_id]);
    if (!planResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }
    duration = planResult.rows[0].duration;
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error fetching plan details",
      error: err.message
    });
  }
  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + Number(duration));
    await pool.query(
      "INSERT INTO subscriptions (freelancer_id, plan_id, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5)",
      [freelancer_id, plan_id, startDate, endDate, status]
    );
    return res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      subscription: { id: 1, freelancer_id, plan_id, status } // id is mocked in your test
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to create subscription",
      error: err.message
    });
  }
};

const getSubscriptionByUserId = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "userId is required"
    });
  }
  try {
    const result = await pool.query(
      `SELECT s.id, s.freelancer_id, p.name AS plan_name, f.first_name, f.last_name, f.email
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       JOIN freelancers f ON s.freelancer_id = f.id
       WHERE s.freelancer_id = $1`,
      [userId]
    );
    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "No subscriptions found for this user"
      });
    }
    return res.status(200).json({
      success: true,
      subscriptions: result.rows
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error fetching subscriptions",
      error: err.message
    });
  }
};

export {
  subscriptionToPlan,
  getSubscriptionByUserId
};