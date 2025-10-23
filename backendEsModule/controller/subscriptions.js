import pool from "../models/db.js";
import { NotificationCreators } from "../services/notificationService.js";

const subscriptionToPlan = async (req, res) => {
  const { freelancer_id, plan_id, status } = req.body;
  if (!freelancer_id || !plan_id || !status) {
    return res.status(400).json({
      success: false,
      message: "freelancer_id, plan_id, and status are required",
    });
  }

  try {
    const planResult = await pool.query("SELECT name, duration FROM plans WHERE id = $1", [plan_id]);
    if (!planResult.rows.length) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }
    const { name: planName, duration } = planResult.rows[0];

    const startDate = new Date().toISOString().split("T")[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + Number(duration));
    const endDateStr = endDate.toISOString().split("T")[0];

    const insertResult = await pool.query(
      "INSERT INTO subscriptions (freelancer_id, plan_id, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [freelancer_id, plan_id, startDate, endDateStr, status]
    );
    const newSubscription = insertResult.rows[0];

    try {
      await NotificationCreators.subscriptionStatusChanged(newSubscription.id, freelancer_id, planName, status);
    } catch (notificationError) {
      console.error(`Failed to create subscription notification for freelancer ${freelancer_id}:`, notificationError);
    }

    return res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      subscription: newSubscription,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to create subscription",
      error: err.message,
    });
  }
};

const getSubscriptionByPlanId = async (req, res) => {
  const { planId } = req.params;
  if (!planId) {
    return res.status(400).json({ success: false, message: "planId is required" });
  }

  try {
    const result = await pool.query(
      `SELECT s.id, s.freelancer_id, s.status, s.start_date, s.end_date,
              u.first_name, u.last_name, u.email
       FROM subscriptions s
       JOIN users u ON s.freelancer_id = u.id
       WHERE s.plan_id = $1`,
      [planId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "No subscribers found for this plan" });
    }

    return res.status(200).json({ success: true, subscribers: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching subscribers", error: err.message });
  }
};

const updateSubscription = async (req, res) => {
  const { subscriptionId } = req.params;
  const { plan_id, status, start_date, end_date } = req.body;

  if (!subscriptionId) {
    return res.status(400).json({ success: false, message: "subscriptionId is required" });
  }

  if (!plan_id && !status && !start_date && !end_date) {
    return res.status(400).json({ success: false, message: "At least one field must be provided to update" });
  }

  try {
    const subResult = await pool.query("SELECT * FROM subscriptions WHERE id = $1", [subscriptionId]);
    if (!subResult.rows.length) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }
    const originalSubscription = subResult.rows[0];

    const fields = [];
    const values = [];
    let counter = 1;

    if (plan_id) {
      fields.push(`plan_id = $${counter}`);
      values.push(plan_id);
      counter++;
    }
    if (status) {
      fields.push(`status = $${counter}`);
      values.push(status);
      counter++;
    }
    if (start_date) {
      fields.push(`start_date = $${counter}`);
      values.push(start_date);
      counter++;
    }
    if (end_date) {
      fields.push(`end_date = $${counter}`);
      values.push(end_date);
      counter++;
    }

    values.push(subscriptionId);
    const query = `UPDATE subscriptions SET ${fields.join(", ")} WHERE id = $${counter} RETURNING *`;
    const updateResult = await pool.query(query, values);
    const updatedSubscription = updateResult.rows[0];

    if (status && status !== originalSubscription.status) {
        try {
            const planResult = await pool.query("SELECT name FROM plans WHERE id = $1", [updatedSubscription.plan_id]);
            const planName = planResult.rows.length ? planResult.rows[0].name : "your plan";
            await NotificationCreators.subscriptionStatusChanged(updatedSubscription.id, updatedSubscription.freelancer_id, planName, status);
        } catch (notificationError) {
            console.error(`Failed to create subscription update notification for freelancer ${updatedSubscription.freelancer_id}:`, notificationError);
        }
    }

    return res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      subscription: updatedSubscription,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update subscription", error: err.message });
  }
};


export { subscriptionToPlan, getSubscriptionByPlanId, updateSubscription };
