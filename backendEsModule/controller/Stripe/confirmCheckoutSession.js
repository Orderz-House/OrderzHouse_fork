import Stripe from "stripe";
import pool from "../../models/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const confirmCheckoutSession = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ ok: false, error: "Missing session_id" });

    // 1) Get the session from Stripe (trusted)
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // 2) Confirm it was paid
    if (session.payment_status !== "paid") {
      return res.status(400).json({ ok: false, error: "Payment not completed" });
    }

    // 3) Extract metadata you already set in createCheckoutSession
    const freelancer_id = session.metadata?.user_id;
    const plan_id = session.metadata?.plan_id;
    const includesVerificationFee = session.metadata?.includes_verification_fee;

    if (!freelancer_id || !plan_id) {
      return res.status(400).json({ ok: false, error: "Missing metadata on session" });
    }

    const stripe_session_id = session.id;
    const stripe_payment_intent = session.payment_intent;
    const amount_total = session.amount_total / 1000;

    // 4) Insert payment (idempotent)
    await pool.query(
      `INSERT INTO payments (user_id, plan_id, amount, stripe_session_id, stripe_payment_intent)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (stripe_session_id) DO NOTHING;`,
      [freelancer_id, plan_id, amount_total, stripe_session_id, stripe_payment_intent]
    );

    // 5) Update verification if needed
    if (includesVerificationFee === "yes") {
      await pool.query(
        "UPDATE users SET is_verified = true WHERE id = $1",
        [freelancer_id]
      );
    }

    // 6) Create subscription dates based on plan
    const planRes = await pool.query(
      `SELECT duration, plan_type FROM plans WHERE id = $1`,
      [plan_id]
    );

    if (planRes.rowCount === 0) {
      return res.status(404).json({ ok: false, error: "Plan not found" });
    }

    const plan = planRes.rows[0];

    let start_date = new Date();
    let end_date = new Date(start_date);

    if (plan.plan_type === "monthly") {
      end_date.setMonth(end_date.getMonth() + plan.duration);
    } else if (plan.plan_type === "yearly") {
      end_date.setFullYear(end_date.getFullYear() + plan.duration);
    } else {
      end_date.setMonth(end_date.getMonth() + 1);
    }

    const start_date_sql = start_date.toISOString().split("T")[0];
    const end_date_sql = end_date.toISOString().split("T")[0];

    // 7) Insert subscription (IMPORTANT: prevent duplicates)
    // Best: add stripe_session_id column to subscriptions and make it UNIQUE.
    const subCheck = await pool.query(
      `SELECT id FROM subscriptions WHERE freelancer_id = $1 AND plan_id = $2 AND start_date = $3 LIMIT 1`,
      [freelancer_id, plan_id, start_date_sql]
    );

    if (subCheck.rowCount === 0) {
      await pool.query(
        `INSERT INTO subscriptions (freelancer_id, plan_id, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, 'active')`,
        [freelancer_id, plan_id, start_date_sql, end_date_sql]
      );
    }

    const payRes = await pool.query(
      `SELECT id, user_id, plan_id, amount FROM payments WHERE stripe_session_id = $1 LIMIT 1`,
      [stripe_session_id]
    );

    return res.json({ ok: true, payment: payRes.rows[0] });

  } catch (e) {
    console.error("confirmCheckoutSession error:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
