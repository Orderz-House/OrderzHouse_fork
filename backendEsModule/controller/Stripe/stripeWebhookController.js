// controllers/stripeWebhookController.js

import Stripe from "stripe";
import pool from "../../models/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );


    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const user_id = session.metadata.user_id;
      const plan_id = session.metadata.plan_id;

      await pool.query(
        `INSERT INTO subscriptions (user_id, plan_id, status)
         VALUES ($1, $2, 'active')`,
        [user_id, plan_id]
      );

      console.log("🔥 Subscription activated for user:", user_id);
    }

    return res.json({ received: true });

  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
