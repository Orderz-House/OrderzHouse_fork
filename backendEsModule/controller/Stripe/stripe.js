import Stripe from "stripe";
import pool from "../../models/db.js";

// Lazy Stripe initialization
let stripeInstance = null;
const getStripe = () => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY not set");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
};

/* ============================================================
   PLAN CHECKOUT SESSION
============================================================ */
export const createCheckoutSession = async (req, res) => {
  try {
    console.log("[Stripe] Request body:", req.body);
    // Accept both plan_id/planId and user_id/userId
    const plan_id = req.body.plan_id || req.body.planId;
    const user_id = req.body.user_id || req.body.userId;

    if (!plan_id || !user_id) {
      return res.status(400).json({ error: "Missing plan_id or user_id" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("[Stripe] STRIPE_SECRET_KEY is missing");
      return res.status(500).json({ error: "Stripe configuration error", message: "STRIPE_SECRET_KEY not set" });
    }

    const stripe = getStripe();

    if (!process.env.CLIENT_URL) {
      console.error("[Stripe] CLIENT_URL is missing");
      return res.status(500).json({ error: "Configuration error", message: "CLIENT_URL not set" });
    }

    console.log("[Stripe] Fetching plan:", plan_id);
    const planRes = await pool.query(
      "SELECT id, name, description, price FROM plans WHERE id = $1",
      [plan_id]
    );

    if (planRes.rowCount === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }

    console.log("[Stripe] Fetching user:", user_id);
    const userRes = await pool.query(
      "SELECT id, role_id FROM users WHERE id = $1",
      [user_id]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const plan = planRes.rows[0];
    const user = userRes.rows[0];

    // Check if user is freelancer (role_id = 3)
    if (Number(user.role_id) !== 3) {
      return res.status(403).json({ 
        error: "Forbidden", 
        message: "Only freelancers can subscribe to plans" 
      });
    }

    console.log("[Stripe] Plan data:", { id: plan.id, name: plan.name, price: plan.price });
    console.log("[Stripe] User data:", { id: user.id, role_id: user.role_id });

    const planPrice = Number(plan.price) || 0;
    const currentYear = new Date().getFullYear();
    
    // Yearly 25 JOD fee check - only charge if not paid in current calendar year
    // Check user_yearly_fees table (NOT is_verified)
    const feeCheckRes = await pool.query(
      `SELECT id FROM user_yearly_fees 
       WHERE user_id = $1 AND fee_year = $2 
       LIMIT 1`,
      [user_id, currentYear]
    );
    const needsYearlyFee = feeCheckRes.rowCount === 0;

    console.log("[Stripe] Computed:", { planPrice, needsYearlyFee });

    // CASE A: Free plan (price = 0) AND yearly fee required
    if (planPrice === 0 && needsYearlyFee) {
      const line_items = [
        {
          price_data: {
            currency: "jod",
            product_data: { name: "Annual Plan Activation Fee" },
            unit_amount: 25 * 1000,
          },
          quantity: 1,
        },
      ];

      const success_url = `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancel_url = `${process.env.CLIENT_URL}/payment/cancel`;

      console.log("[Stripe] Free plan with yearly fee - creating session with 25 JD only");

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items,
        metadata: {
          user_id: String(user_id),
          purpose: "plan",
          reference_id: String(plan_id),
          includes_yearly_fee: "yes",
        },
        success_url,
        cancel_url,
      });

      console.log("[Stripe] Session created:", session.id);
      return res.json({ url: session.url });
    }

    // CASE B: Free plan (price = 0) AND yearly fee NOT required
    if (planPrice === 0 && !needsYearlyFee) {
      console.log("[Stripe] Free plan without yearly fee - creating subscription directly");

      // Create subscription directly without Stripe
      const planRes = await pool.query(
        "SELECT duration, plan_type FROM plans WHERE id = $1",
        [plan_id]
      );

      if (planRes.rowCount === 0) {
        return res.status(404).json({ error: "Plan not found" });
      }

      const planData = planRes.rows[0];
      const placeholderStart = new Date();
      placeholderStart.setHours(0, 0, 0, 0, 0);
      const placeholderEnd = new Date(placeholderStart);

      // Insert subscription with pending_start status
      try {
        await pool.query(
          `
          INSERT INTO subscriptions (
            freelancer_id,
            plan_id,
            start_date,
            end_date,
            status,
            activated_at,
            stripe_session_id
          )
          VALUES ($1, $2, $3, $4, 'pending_start', NULL, $5)
          ON CONFLICT (stripe_session_id) DO NOTHING;
          `,
          [user_id, plan_id, placeholderStart, placeholderEnd, `free_${Date.now()}`]
        );
      } catch (err) {
        // Fallback if activated_at column doesn't exist yet
        if (err.message && err.message.includes('activated_at')) {
          await pool.query(
            `
            INSERT INTO subscriptions (
              freelancer_id,
              plan_id,
              start_date,
              end_date,
              status,
              stripe_session_id
            )
            VALUES ($1, $2, $3, $4, 'pending_start', $5)
            ON CONFLICT (stripe_session_id) DO NOTHING;
            `,
            [user_id, plan_id, placeholderStart, placeholderEnd, `free_${Date.now()}`]
          );
        } else {
          throw err;
        }
      }

      console.log("[Stripe] Free subscription created directly");
      return res.json({ free: true, url: null });
    }

    // CASE C: Paid plan (price > 0)
    if (planPrice <= 0 || isNaN(planPrice)) {
      console.error("[Stripe] Invalid plan price:", plan.price);
      return res.status(400).json({ error: "Invalid plan price" });
    }

    const unit_amount = Math.round(planPrice * 1000);
    if (unit_amount <= 0) {
      console.error("[Stripe] Invalid unit_amount:", unit_amount);
      return res.status(400).json({ error: "Invalid plan price amount" });
    }

    const line_items = [
      {
        price_data: {
          currency: "jod",
          product_data: {
            name: plan.name,
            description: plan.description || undefined,
          },
          unit_amount: unit_amount,
        },
        quantity: 1,
      },
    ];

    if (needsYearlyFee) {
      line_items.push({
        price_data: {
          currency: "jod",
          product_data: { name: "Annual Plan Activation Fee" },
          unit_amount: 25 * 1000,
        },
        quantity: 1,
      });
    }

    const success_url = `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${process.env.CLIENT_URL}/payment/cancel`;

    console.log("[Stripe] Creating session with:", {
      line_items_count: line_items.length,
      success_url,
      cancel_url,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      metadata: {
        user_id: String(user_id),
        purpose: "plan",
        reference_id: String(plan_id),
        includes_yearly_fee: needsYearlyFee ? "yes" : "no",
      },
      success_url,
      cancel_url,
    });

    console.log("[Stripe] Session created:", session.id);
    return res.json({ url: session.url });

  } catch (err) {
    console.error("[Stripe] Create session error:", {
      type: err.type,
      message: err.message,
      raw: err.raw?.message,
      code: err.code,
      statusCode: err.statusCode,
      stack: err.stack,
    });
    return res.status(500).json({ 
      error: "Stripe error",
      message: err.message || "Failed to create checkout session",
      details: err.type || "Unknown error"
    });
  }
};

/* ============================================================
   PROJECT CHECKOUT SESSION (CREATE PROJECT WITH pending_payment STATUS)
============================================================ */
export const createProjectCheckoutSession = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.token.userId;
    const projectData = req.body;

    // Check if user is client (role_id = 2) and payment permission
    const { rows: userRows } = await pool.query(
      `SELECT role_id, can_post_without_payment FROM users WHERE id = $1 AND is_deleted = false`,
      [userId]
    );
    
    if (!userRows.length || Number(userRows[0].role_id) !== 2) {
      return res.status(403).json({ error: "Only clients can create projects" });
    }

    const canPostWithoutPayment = userRows[0].can_post_without_payment === true;

    // Validate required fields
    const {
      category_id,
      sub_category_id,
      sub_sub_category_id,
      title,
      description,
      budget,
      duration_type,
      duration_days,
      duration_hours,
      project_type,
      budget_min,
      budget_max,
      hourly_rate,
      preferred_skills,
    } = projectData;

    if (!category_id || !sub_sub_category_id || !title || !description || !duration_type) {
      return res.status(400).json({ error: "Missing required project fields" });
    }

    if (!["fixed", "hourly"].includes(project_type)) {
      return res.status(400).json({ error: "Only fixed and hourly projects require payment" });
    }

    if (project_type === "fixed" && (!budget || budget <= 0)) {
      return res.status(400).json({ error: "Fixed projects require valid budget" });
    }

    if (project_type === "hourly" && (!hourly_rate || hourly_rate <= 0)) {
      return res.status(400).json({ error: "Hourly projects require valid hourly_rate" });
    }

    // Calculate amount
    let amount = 0;
    if (project_type === "fixed") {
      amount = Number(budget);
    } else if (project_type === "hourly") {
      amount = Number(hourly_rate) * 3; // minimum
    }

    // Create project - status depends on payment permission
    await client.query("BEGIN");

    const durationDaysValue = duration_type === "days" ? Number(duration_days) : null;
    const durationHoursValue = duration_type === "hours" ? Number(duration_hours) : null;
    const normalizedBudget = project_type === "fixed" ? Number(budget) : null;
    const normalizedHourlyRate = project_type === "hourly" ? Number(hourly_rate) : null;

    // Determine initial status: pending_admin if skipping payment, pending_payment otherwise
    const initialStatus = canPostWithoutPayment ? 'pending_admin' : 'pending_payment';

    const { rows: projectRows } = await client.query(
      `INSERT INTO projects (
        user_id, category_id, sub_category_id, sub_sub_category_id,
        title, description, budget, duration_days, duration_hours,
        project_type, hourly_rate,
        preferred_skills, status, completion_status, is_deleted
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'not_started', false
      ) RETURNING id`,
      [
        userId,
        category_id,
        sub_category_id || null,
        sub_sub_category_id,
        title.trim(),
        description.trim(),
        normalizedBudget,
        durationDaysValue,
        durationHoursValue,
        project_type,
        normalizedHourlyRate,
        preferred_skills || [],
        initialStatus,
      ]
    );

    const projectId = projectRows[0].id;

    // Upload cover pic if provided (from req.files if available)
    if (req.files?.cover_pic && req.files.cover_pic.length > 0) {
      // Note: This requires multer middleware - if not available, skip cover pic upload
      // Cover pic can be uploaded later after payment
    }

    await client.query("COMMIT");
    client.release();

    // If user can post without payment, skip Stripe and return success
    if (canPostWithoutPayment) {
      return res.json({ skipPayment: true, project_id: projectId });
    }

    // Create Stripe checkout session for normal users
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jod",
            product_data: {
              name: title,
            },
            unit_amount: Math.round(amount * 1000),
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: String(userId),
        purpose: "project",
        reference_id: String(projectId), // Project ID for confirm endpoint
      },
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    });

    return res.json({ url: session.url });

  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    client.release();
    console.error("createProjectCheckoutSession error:", err);
    return res.status(500).json({ error: "Stripe error", message: err.message });
  }
};

/* ============================================================
   CONFIRM CHECKOUT SESSION (CREATE PROJECT AFTER PAYMENT)
============================================================ */
export const confirmCheckoutSession = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ ok: false, error: "Missing session_id" });
    }

    // 1️⃣ Retrieve Stripe session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ ok: false, error: "Payment not completed" });
    }

    const user_id = Number(session.metadata.user_id);
    const purpose = session.metadata.purpose;
    const includesVerificationFee =
      session.metadata.includes_verification_fee === "yes";

    const amount = session.amount_total / 1000;

    if (!user_id || !purpose) {
      return res.status(400).json({ ok: false, error: "Invalid metadata" });
    }

    // 2️⃣ Insert payment (idempotent)
    const paymentRes = await pool.query(
      `
      INSERT INTO payments (
        user_id,
        amount,
        currency,
        purpose,
        reference_id,
        stripe_session_id,
        stripe_payment_intent,
        status
      )
      VALUES ($1, $2, 'JOD', $3, NULL, $4, $5, 'paid')
      ON CONFLICT (stripe_session_id)
      DO UPDATE SET status = 'paid'
      RETURNING id;
      `,
      [
        user_id,
        amount,
        purpose,
        session.id,
        session.payment_intent,
      ]
    );

    const paymentId = paymentRes.rows[0].id;

    // 3️⃣ Verification fee logic (plans only)
    if (includesVerificationFee) {
      await pool.query(
        `
        UPDATE users
        SET is_verified = true
        WHERE id = $1 AND is_verified = false
        `,
        [user_id]
      );
    }

    // 4️⃣ PLAN LOGIC
    if (purpose === "plan") {
      const planId = Number(session.metadata.reference_id);

      const planRes = await pool.query(
        "SELECT duration, plan_type FROM plans WHERE id = $1",
        [planId]
      );

      if (planRes.rowCount === 0) {
        return res.status(404).json({ ok: false, error: "Plan not found" });
      }

      const plan = planRes.rows[0];
      const start = new Date();
      const end = new Date(start);

      if (plan.plan_type === "monthly") {
        end.setMonth(end.getMonth() + plan.duration);
      } else {
        end.setFullYear(end.getFullYear() + plan.duration);
      }

      await pool.query(
        `
        INSERT INTO subscriptions (
          freelancer_id,
          plan_id,
          start_date,
          end_date,
          status,
          stripe_session_id
        )
        VALUES ($1, $2, $3, $4, 'active', $5)
        ON CONFLICT (stripe_session_id) DO NOTHING
        `,
        [user_id, planId, start, end, session.id]
      );
    }

    // 5️⃣ PROJECT LOGIC (CREATE PROJECT AFTER PAYMENT)
    if (purpose === "project") {
      const projectData = JSON.parse(session.metadata.project_data);

      const { rows } = await pool.query(
        `
        INSERT INTO projects (
          user_id,
          title,
          description,
          project_type,
          budget,
          hourly_rate,
          category_id,
          status
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,'pending_admin')
        RETURNING id
        `,
        [
          user_id,
          projectData.title,
          projectData.description,
          projectData.project_type,
          projectData.budget || null,
          projectData.hourly_rate || null,
          projectData.category_id,
        ]
      );

      const projectId = rows[0].id;

      // Link payment → project
      await pool.query(
        `
        UPDATE payments
        SET reference_id = $1
        WHERE id = $2
        `,
        [projectId, paymentId]
      );
    }

    return res.json({ ok: true });

  } catch (err) {
    console.error("confirmCheckoutSession error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
