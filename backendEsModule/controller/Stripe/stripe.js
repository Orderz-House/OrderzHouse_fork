import Stripe from "stripe";
import pool from "../../models/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export const createCheckoutSession = async (req, res) => {
  try {
    const { plan_id, user_id } = req.body;

    if (!plan_id || !user_id) {
      return res.status(400).json({ error: "Missing plan_id or user_id" });
    }

    // Fetch plan
    const planRes = await pool.query(
      "SELECT id, name, description, price FROM plans WHERE id = $1",
      [plan_id]
    );

    if (planRes.rowCount === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const plan = planRes.rows[0];

    // Fetch user
    const userRes = await pool.query(
      "SELECT id, is_verified FROM users WHERE id = $1",
      [user_id]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userRes.rows[0];

    // ------------------------------
    // BUILD STRIPE LINE ITEMS
    // ------------------------------

    const line_items = [];

    // Main plan item
    line_items.push({
      price_data: {
        currency: "jod",
        product_data: {
          name: plan.name,
          description: plan.description || undefined,
        },
        unit_amount: Math.round(parseFloat(plan.price) * 1000),
      },
      quantity: 1,
    });

    // Add 25 JD verification fee ONLY if user has not paid it before
    if (!user.is_verified) {
      line_items.push({
        price_data: {
          currency: "jod",
          product_data: {
            name: "Account Verification Fee",
          },
          unit_amount: 25 * 1000, 
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,

      metadata: {
  user_id,
  plan_id,
  includes_verification_fee: !user.is_verified ? "yes" : "no",
},


      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,

    });

    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("🔥 STRIPE ERROR:", error);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
};


export const verifyPaymentBySession = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ ok: false, error: "Missing session_id" });

    const payRes = await pool.query(
      "SELECT id, user_id, plan_id, amount FROM payments WHERE stripe_session_id = $1 LIMIT 1",
      [session_id]
    );

    if (payRes.rowCount === 0) return res.status(404).json({ ok: false });

    return res.json({ ok: true, payment: payRes.rows[0] });
  } catch (e) {
    console.error("verifyPaymentBySession error:", e);
    return res.status(500).json({ ok: false });
  }
};