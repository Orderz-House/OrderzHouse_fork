/**
 * Seeds 1000 tender vault projects with varied titles, unique-feel descriptions,
 * and one default cover image per category (Design / Programming / Content Writing).
 *
 * Usage (from backendEsModule):
 *   npm run seed:tender-vault
 *   TENDER_VAULT_OWNER_USER_ID=42 npm run seed:tender-vault
 */

import "dotenv/config";
import pool from "../models/db.js";

const TOTAL = 1000;

/** Stable cover images (Unsplash) — one visual identity per logical category */
const CATEGORY_COVER = {
  design:
    "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80",
  programming:
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
  content:
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
  other:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
};

function categoryKeyFromName(name) {
  const n = (name || "").toLowerCase().trim();
  if (/design|ديزاين|تصميم|graphic|ui|ux/.test(n)) return "design";
  if (/program|برمج|تطوير|dev|code|software|web/.test(n)) return "programming";
  if (/content|محتوى|كتابة|copy|writing|blog|seo/.test(n)) return "content";
  return "other";
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr, seed) {
  if (seed === undefined) return arr[randInt(0, arr.length - 1)];
  return arr[Math.abs(seed) % arr.length];
}

/** Deterministic pick for variety without sequential fake-looking IDs in titles */
function pickIndex(arrLen, globalIdx, salt) {
  return (globalIdx * 1103515245 + 12345 + salt * 17) % arrLen;
}

// ——— Title pools: no "scope #123", no em dash spam ———
const TITLES_DESIGN = [
  "Brand refresh for regional retail chain",
  "Mobile app UI kit and design system",
  "Packaging redesign for beverage launch",
  "Landing page visuals for SaaS onboarding",
  "Social media templates for Q2 campaign",
  "Pitch deck design for investor meetings",
  "Icon set and illustration library",
  "E‑commerce storefront visual hierarchy audit",
  "Newsletter layout and email graphics",
  "Wayfinding signage for office relocation",
  "Logo refinement and secondary marks",
  "Dashboard charts and data visualization style",
  "Trade show booth graphics and handouts",
  "Character mascot for kids education app",
  "Print catalog layout for wholesale buyers",
  "Photography art direction for lookbook",
  "Motion graphics intro for product video",
  "Accessibility review of existing UI",
  "Dark mode palette for productivity tool",
  "Restaurant menu and in‑store posters",
  "Annual report layout and infographics",
  "NFT collection visual identity exploration",
  "Real estate brochure for new development",
  "Fitness app onboarding screens",
  "Banking app card and payment flows",
  "Magazine cover and feature spreads",
  "Sticker pack for community messaging app",
  "Conference badge and lanyard design",
  "Wine label concepts for limited edition",
  "Kids learning app playful UI refresh",
];

const TITLES_PROGRAMMING = [
  "REST API integration with payment gateway",
  "Migrate legacy admin panel to React",
  "PostgreSQL performance tuning for reports",
  "CI/CD pipeline for mobile app releases",
  "Webhook service for CRM synchronization",
  "OAuth2 login for multi‑tenant dashboard",
  "Background job queue for PDF generation",
  "Real‑time chat using WebSockets",
  "Dockerize microservices for staging",
  "Flutter module for barcode scanning",
  "Node.js service for file virus scanning",
  "GraphQL schema for marketplace search",
  "Elasticsearch indexing for Arabic content",
  "Rate limiting and abuse detection layer",
  "Stripe subscription lifecycle handling",
  "Automated database backup verification",
  "Kubernetes health checks and rollouts",
  "Legacy PHP module extraction to service",
  "Python ETL for analytics warehouse",
  "Mobile deep linking and attribution",
  "SSO integration with corporate IdP",
  "Feature flags service with Redis",
  "Image resize and CDN upload pipeline",
  "Audit log middleware for compliance",
  "End‑to‑end tests for checkout flow",
  "Serverless function for SMS OTP",
  "Map clustering API for store locator",
  "CSV import wizard with validation",
  "Caching layer for product catalog API",
  "Security review fixes for XSS and CSRF",
];

const TITLES_CONTENT = [
  "Website copy for fintech landing pages",
  "Blog series on remote work culture",
  "Product descriptions for electronics store",
  "Email nurture sequence for trial users",
  "White paper on data privacy in MENA",
  "Video script for product explainer",
  "FAQ and help center articles refresh",
  "Press release for Series A announcement",
  "LinkedIn thought leadership articles",
  "Case study for enterprise client win",
  "Onboarding microcopy for mobile app",
  "SEO cluster for local services pages",
  "Newsletter copy for monthly digest",
  "Script for customer testimonial videos",
  "Technical documentation for API partners",
  "Social captions for Ramadan campaign",
  "Employer brand posts for hiring push",
  "Course outline and lesson intros",
  "Comparison page vs main competitor",
  "Arabic translation review for marketing site",
  "Podcast show notes and timestamps",
  "Investor one‑pager and executive summary",
  "User research summary for UX team",
  "Terms of service plain language rewrite",
  "Recipe and lifestyle blog for food brand",
  "Sales one‑pagers for channel partners",
  "Event agenda and speaker bios",
  "Customer success story interview draft",
  "App store listing and screenshots text",
  "Annual sustainability report narrative",
];

const TITLES_GENERIC = [
  "Fixed‑scope delivery with weekly demos",
  "Discovery workshop and phased rollout",
  "Part‑time specialist for six‑week sprint",
  "Remote collaboration with shared workspace",
  "NDA‑covered work with staged milestones",
  "Competitive benchmark before build",
  "Handover pack and training session",
  "Quality checklist and acceptance criteria",
  "Stakeholder alignment calls biweekly",
  "Post‑launch support window included",
  "RFP response with effort estimate",
  "Pilot rollout before full deployment",
  "Documentation and knowledge transfer",
  "Bugfix retainer after go‑live",
  "Integration smoke tests with vendor API",
  "Workshop to align requirements with sales",
  "Cost reduction review of current stack",
  "Accessibility pass on public pages",
  "Load testing before marketing push",
  "Backup and disaster recovery checklist",
  "Vendor evaluation and scoring matrix",
  "Process mapping for operations team",
  "Data export and migration planning",
  "SLA definition for support tier",
  "On‑call rotation setup for releases",
  "Cost tracking dashboard for finance",
  "Customer survey analysis and report",
  "Competitive pricing research snapshot",
  "Partner onboarding playbook draft",
  "Risk register update for Q roadmap",
  "Executive summary for steering committee",
];

function buildTitle(catKey, catName, globalIdx) {
  let pool;
  if (catKey === "design") pool = TITLES_DESIGN;
  else if (catKey === "programming") pool = TITLES_PROGRAMMING;
  else if (catKey === "content") pool = TITLES_CONTENT;
  else pool = TITLES_GENERIC;

  const base = pool[pickIndex(pool.length, globalIdx, catName.length)];
  const suffixes = ["", " (remote)", ", phased delivery", ", fast track", " — bilingual"];
  const pref = catKey === "other" ? `${catName.trim()}: ` : "";
  let t = pref + base + pick(suffixes, globalIdx + (catName?.charCodeAt(0) || 0));
  if (t.length > 100) t = t.slice(0, 97) + "...";
  while (t.length < 10) t += " — phase";
  return t;
}

function buildDescription({ catKey, durVal, durUnit, budgetMin, budgetMax, currency, globalIdx }) {
  const openings = {
    design: [
      "We need a polished visual direction that matches our brand guidelines and regional audience.",
      "The project focuses on clarity, hierarchy, and consistent components across touchpoints.",
      "Deliverables should be production‑ready files with a short style guide for internal teams.",
    ],
    programming: [
      "We expect clean commits, tests where appropriate, and documentation for deployment.",
      "The solution must integrate with our existing stack and follow our security checklist.",
      "Performance and error handling are priorities; please propose a sensible rollout plan.",
    ],
    content: [
      "Tone should be professional yet approachable; we can share a voice guide on kickoff.",
      "Arabic and English may be required for some assets—please confirm capacity.",
      "SEO and readability matter; we will share target keywords and competitor notes.",
    ],
    other: [
      "Scope will be refined after a short discovery call with our product owner.",
      "We value clear communication and milestone‑based delivery.",
      "Please align estimates with the budget band and timeline below.",
    ],
  };
  const mids = [
    `Timeline: approximately ${durVal} ${durUnit}.`,
    `Budget guidance: ${budgetMin}–${budgetMax} ${currency} (flexible within reason).`,
    "We prefer weekly async updates and one live sync if needed.",
    "Confidentiality applies; please sign our standard NDA before accessing materials.",
  ];
  const closings = [
    "References from similar work are welcome.",
    "Start date is flexible within the next two weeks.",
    "Questions can be raised before accepting—we respond within one business day.",
  ];

  const o = pick(openings[catKey] || openings.other, globalIdx);
  const m1 = mids[pickIndex(mids.length, globalIdx, 1)];
  const m2 = mids[pickIndex(mids.length, globalIdx + 3, 2)];
  const c = pick(closings, globalIdx + 7);

  let text = `${o} ${m1} ${m2} ${c}`;
  // Uniqueness: sprinkle index‑based phrase (not visible as fake pattern in UI if varied)
  const salt = ["First phase emphasizes discovery.", "We may extend scope after MVP.", "Internal stakeholders will review drafts."][globalIdx % 3];
  text = `${text} ${salt}`;

  while (text.length < 100) text += " Additional context will be shared after selection.";
  if (text.length > 2000) return text.slice(0, 1990) + " …";
  return text;
}

function coverAttachment(catKey) {
  const url = CATEGORY_COVER[catKey] || CATEGORY_COVER.other;
  return [
    {
      url,
      name: "Cover image",
      type: "image",
    },
  ];
}

async function loadCategoryTree(client) {
  const { rows: cats } = await client.query(`SELECT id, name FROM categories ORDER BY id`);
  if (cats.length === 0) throw new Error("No categories in DB.");

  const subsByCat = new Map();
  const subSubsBySub = new Map();

  const { rows: subs } = await client.query(`SELECT id, category_id, name FROM sub_categories`);
  for (const s of subs) {
    if (!subsByCat.has(s.category_id)) subsByCat.set(s.category_id, []);
    subsByCat.get(s.category_id).push(s);
  }

  const { rows: subsubs } = await client.query(
    `SELECT id, sub_category_id, name FROM sub_sub_categories`
  );
  for (const ss of subsubs) {
    if (!subSubsBySub.has(ss.sub_category_id)) subSubsBySub.set(ss.sub_category_id, []);
    subSubsBySub.get(ss.sub_category_id).push(ss);
  }

  return { cats, subsByCat, subSubsBySub };
}

async function resolveOwnerUserId(client) {
  const envId = process.env.TENDER_VAULT_OWNER_USER_ID;
  if (envId) {
    const id = parseInt(envId, 10);
    const { rows } = await client.query(
      `SELECT id FROM users WHERE id = $1 AND role_id = 2 AND COALESCE(can_manage_tender_vault, false) = true AND COALESCE(is_deleted, false) = false`,
      [id]
    );
    if (rows.length) return rows[0].id;
    console.warn(`TENDER_VAULT_OWNER_USER_ID=${id} invalid; picking first eligible client.`);
  }
  const { rows } = await client.query(
    `SELECT id FROM users WHERE role_id = 2 AND COALESCE(can_manage_tender_vault, false) = true AND COALESCE(is_deleted, false) = false ORDER BY id LIMIT 1`
  );
  if (!rows.length) {
    throw new Error(
      "No client with can_manage_tender_vault=true. Grant permission or set TENDER_VAULT_OWNER_USER_ID."
    );
  }
  return rows[0].id;
}

async function main() {
  const client = await pool.connect();
  try {
    const createdBy = await resolveOwnerUserId(client);
    console.log(`Using created_by user id: ${createdBy}`);

    const { cats, subsByCat, subSubsBySub } = await loadCategoryTree(client);
    console.log(`Categories: ${cats.length}`);

    const countries = [
      "Jordan",
      "United Arab Emirates",
      "Saudi Arabia",
      "Kuwait",
      "Qatar",
      "Bahrain",
      "Egypt",
    ];
    const units = ["days", "weeks", "months"];

    let inserted = 0;
    const batchSize = 50;

    for (let batch = 0; batch < TOTAL / batchSize; batch++) {
      const values = [];
      const params = [];
      let p = 1;

      for (let i = 0; i < batchSize; i++) {
        const globalIdx = batch * batchSize + i;
        if (globalIdx >= TOTAL) break;

        const cat = pick(cats);
        const catKey = categoryKeyFromName(cat.name);
        const subList = subsByCat.get(cat.id) || [];
        const sub = subList.length ? pick(subList) : null;
        const ssList = sub ? subSubsBySub.get(sub.id) || [] : [];
        const subsub = ssList.length ? pick(ssList) : null;

        const metadata = {};
        if (sub) metadata.sub_category_id = sub.id;
        if (subsub) metadata.sub_sub_category_id = subsub.id;

        const durUnit = pick(units);
        let durVal;
        if (durUnit === "days") durVal = randInt(7, 45);
        else if (durUnit === "weeks") durVal = randInt(2, 10);
        else durVal = randInt(1, 4);

        const complexity = durUnit === "months" ? 1.4 : durUnit === "weeks" ? 1.15 : 1;
        const baseMin = randInt(80, 900) * complexity;
        const spread = 1 + randInt(8, 35) / 100;
        let budgetMin = Math.round(baseMin * 100) / 100;
        let budgetMax = Math.round(budgetMin * spread * 100) / 100;
        if (budgetMax <= budgetMin) budgetMax = Math.round((budgetMin + 50) * 100) / 100;

        const currency = "JOD";
        const title = buildTitle(catKey, cat.name, globalIdx);
        const description = buildDescription({
          catKey,
          durVal,
          durUnit,
          budgetMin,
          budgetMax,
          currency,
          globalIdx,
        });

        const status = globalIdx % 7 === 0 ? "published" : "stored";
        const attachmentsJson = JSON.stringify(coverAttachment(catKey));

        values.push(
          `($${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}::jsonb, $${p++}::jsonb)`
        );
        params.push(
          createdBy,
          status,
          title,
          description,
          cat.id,
          budgetMin,
          budgetMax,
          currency,
          durVal,
          durUnit,
          pick(countries),
          attachmentsJson,
          JSON.stringify(metadata)
        );
      }

      const q = `
        INSERT INTO tender_vault_projects (
          created_by, status, title, description, category_id,
          budget_min, budget_max, currency, duration_value, duration_unit,
          country, attachments, metadata
        ) VALUES ${values.join(", ")}
      `;
      await client.query(q, params);
      inserted += values.length;
      process.stdout.write(`\rInserted ${inserted} / ${TOTAL}`);
    }

    console.log(`\nDone. Inserted ${inserted} rows. Cover images: Design / Programming / Content / Other (see CATEGORY_COVER in script).`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
