import Stripe from "stripe";
import pool from "../../models/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export const createCheckoutSession = async (req, res) => {
  try {
    const { plan_id, user_id } = req.body;

    if (!plan_id || !user_id) {
      return res.status(400).json({ error: "Missing plan_id or user_id" });
    }

    const planRes = await pool.query(
      "SELECT id, name, description, price FROM plans WHERE id = $1",
      [plan_id]
    );

    if (planRes.rowCount === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const plan = planRes.rows[0];

    // Build product_data safely
    const productData = { name: plan.name };
    if (plan.description && plan.description.trim() !== "") {
      productData.description = plan.description;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "jod",
            product_data: productData,
            unit_amount: Math.round(Number(plan.price) * 100),
          },
          quantity: 1,
        },
      ],

      metadata: {
        user_id,
        plan_id,
      },

      success_url: `${process.env.CLIENT_URL}/payment/success`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("🔥 STRIPE ERROR:", error);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
};
