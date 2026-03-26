
/**
 * Tender Vault Fake Seeder
 * --------------------------------------------
 * Generates or inserts up to 1000 highly varied tender_vault_projects records
 * with coherent titles, budgets, durations, descriptions, metadata.skills,
 * and default category image attachments.
 *
 * Modes:
 *   node tender_vault_fake_seeder.js --mode=preview --count=20
 *   node tender_vault_fake_seeder.js --mode=sql --count=1000
 *   node tender_vault_fake_seeder.js --mode=insert --count=1000 --batch=100
 *
 * Environment:
 *   DATABASE_URL=postgres://...   (or DB_URL — same as models/db.js)
 *   Loads backendEsModule/.env automatically via dotenv.
 *   ASSET_BASE_URL=/seed-assets
 *   CREATED_BY_IDS=12,15,18
 *
 * Notes:
 * - Top categories are resolved by name: Design / Content Writing / Development
 * - It will TRY to resolve sub-categories and sub-sub-categories by name if
 *   tables exist (sub_categories / sub_sub_categories). If not found, it keeps
 *   nullable IDs as null and still stores readable names in metadata.
 * - Attachments use ONE default image per top category:
 *     /seed-assets/design-default.png
 *     /seed-assets/programming-default.png
 *     /seed-assets/writing-default.png
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
let Client = null;

/** Same as models/db.js — backend may use DB_URL or DATABASE_URL */
const DB_CONNECTION_STRING = process.env.DATABASE_URL || process.env.DB_URL || "";

const args = Object.fromEntries(
  process.argv.slice(2).map((part) => {
    const clean = part.replace(/^--/, "");
    const [key, value = true] = clean.split("=");
    return [key, value];
  })
);

const MODE = String(args.mode || "preview").toLowerCase(); // preview | sql | insert
const COUNT = Math.max(1, Number(args.count || process.env.SEED_COUNT || 1000));
const BATCH_SIZE = Math.max(1, Number(args.batch || process.env.BATCH_SIZE || 100));
const OUTPUT_DIR = path.resolve(process.cwd(), args.out || "./seed-output");
const ASSET_BASE_URL = String(process.env.ASSET_BASE_URL || "/seed-assets");
const DEFAULT_STATUS = String(args.status || "stored");
const DEFAULT_COUNTRY = String(args.country || "Jordan");
const DEBUG = args.debug === "true" || args.debug === true;

const CREATED_BY_IDS = String(process.env.CREATED_BY_IDS || "")
  .split(",")
  .map((v) => Number(v.trim()))
  .filter(Boolean);

const TAXONOMY = {
  design: {
    topLabel: "Design",
    image: `${ASSET_BASE_URL}/design-default.png`,
    subgroups: {
      "Business Design": [
        "Digital & Print Advertising",
        "Packaging & Product Design",
        "Business Stationery",
        "Signage & Banners",
        "Infographics & Data Visualization",
        "Motion Graphics & Video",
        "Environmental Design",
        "Illustration & Typography",
        "Corporate Presentations",
        "Visual Content Creation",
        "Photography & Videography Prep",
        "UX Research & Wireframing",
        "Interactive Content Design",
      ],
      "Academic Design": [
        "Print-Ready Files",
        "Poster Infographics",
        "Conference Standards Review",
        "Academic Presentations",
        "Tables & Charts Design",
        "Multimedia Integration",
        "Educational Infographics",
        "Editable Templates",
        "Thesis Formatting",
        "Academic Templates",
        "Mind Maps & Illustrations",
        "Scientific Communication",
        "Graphical Abstracts",
        "Fast & Collaborative Design",
      ],
      "Personal Design": [
        "Personal Branding",
        "Personal Logo Design",
        "Brand Style Guide",
        "Social Media Templates",
        "Personal Website/Portfolio",
        "Invitations & Greeting Cards",
        "Photo Editing & Retouching",
        "Mockups Design",
        "Personal Illustrations",
        "Personal Magazines & Print",
        "Personal Presentations",
        "Digital Templates",
        "Design Coaching",
        "On-Demand Rapid Design",
      ],
    },
  },
  writing: {
    topLabel: "Content Writing",
    image: `${ASSET_BASE_URL}/writing-default.png`,
    subgroups: {
      "Business Writing": [
        "Company Profiles",
        "Job Descriptions",
        "Policies & Procedures",
        "Employee Handbooks",
        "Official Correspondence",
        "Ad Copywriting",
        "Blogs & Articles",
        "Social Media Content",
        "Newsletters",
        "Business Reports",
        "Business Plans",
        "Feasibility Studies",
        "Market Analysis",
        "Presentations",
        "Project Proposals",
        "RFPs (Requests for Proposals)",
        "User Manuals",
        "Training Materials",
        "FAQs",
      ],
      "Academic Writing": [
        "Research Papers",
        "Academic Articles",
        "University Essays",
        "Thesis & Dissertation Assistance",
        "Lab Reports",
        "Business/Technical Reports",
        "Literature Reviews",
        "Book/Film Reviews",
        "Academic Editing",
        "Proofreading",
        "Citation Management",
        "Publication Support",
        "Figure Preparation",
        "Research Proposals",
        "Scientific Abstracts",
        "Personal Reflection Essays",
        "Technical Writing",
        "Medical Writing",
        "Ghostwriting",
      ],
      "Personal Writing": [
        "CV/Resume Writing",
        "Cover Letters",
        "Recommendation Letters",
        "Acceptance & Apology Letters",
        "Love, Apology & Thank You Letters",
        "Congratulations & Condolence Letters",
        "Invitations",
        "Short Stories",
        "Personal Essays & Thoughts",
        "Memoirs & Diaries",
        "Personal Blog Content",
        "Social Media Content",
        "Card & Gift Texts",
        "Event Speeches",
        "SMS & Short Messages",
      ],
    },
  },
  development: {
    topLabel: "Development",
    image: `${ASSET_BASE_URL}/programming-default.png`,
    subgroups: {
      "Business Programming": [
        "Frontend Development",
        "Backend Development",
        "Full Stack Development",
        "CMS Development",
        "Custom Mobile Apps (iOS/Android)",
        "Cross-Platform Apps",
        "Game Development (2D/3D)",
        "Custom Software",
        "Enterprise Software (ERP/CRM)",
        "API Development",
        "System Integration",
        "Cloud-Native Applications",
        "Serverless/BaaS",
        "DevOps Services",
        "Artificial Intelligence (AI)",
        "Machine Learning (ML)",
        "Natural Language Processing (NLP)",
        "Computer Vision",
        "Cybersecurity Solutions",
      ],
      "Academic Programming": [
        "Programming Assignment Help",
        "Academic Project Development",
        "Bug Fixing",
        "Code Optimization",
        "Algorithm Design",
        "Data Structures",
        "Database Programming",
        "Frontend Development",
        "Backend Development",
        "Desktop Application Development",
        "GUI Programming",
        "Technical Documentation",
        "Research Paper Programming Support",
        "Case Study Development",
        "Code Review Sessions",
        "Code Tutoring",
        "University-Specific Support",
        "Academic Code Maintenance",
      ],
      "Personal Programming": [
        "Browser Automation Scripts",
        "Data Collection Scripts",
        "Chat Bots",
        "Custom API Integration",
        "Data Scraping & Parsing",
        "Price Tracking Tools",
        "Office Task Automation",
        "Excel/Google Sheets Macros",
        "Custom GUI Tools",
        "Desktop Utility Applications",
        "Browser Extensions",
        "Personal Websites",
        "Personal Assistant Tools",
        "Resume & Portfolio Generators",
        "Educational Projects",
        "Mini Games",
        "Discord/Telegram Bots",
        "AI Integration Tools",
        "Custom Code Requests",
      ],
    },
  },
};

const INDUSTRIES = [
  "healthcare", "education", "retail", "logistics", "real estate", "travel",
  "food & beverage", "construction", "fintech", "legal services", "beauty",
  "e-commerce", "manufacturing", "events", "hospitality", "sports", "media",
  "agriculture", "NGO operations", "professional services"
];

const AUDIENCES = [
  "young professionals", "students", "B2B buyers", "local customers", "internal teams",
  "executive stakeholders", "job applicants", "conference attendees", "research supervisors",
  "investors", "online shoppers", "premium clients", "community members", "technical users"
];

const TONES = [
  "modern", "clean", "premium", "minimal", "data-driven", "fast-turnaround", "polished",
  "academic", "confident", "practical", "conversion-focused", "professional", "clear", "engaging"
];

const GOALS = [
  "improve clarity", "increase credibility", "support launch readiness", "raise conversion",
  "speed up delivery", "simplify onboarding", "upgrade presentation quality",
  "document workflows", "win stakeholder approval", "prepare for publication",
  "strengthen brand consistency", "reduce manual work", "support automation"
];

/** Appended when a generated title collides — reads as natural scope, not fake numbering */
const NATURAL_TITLE_SUFFIXES = [
  "for regional rollout",
  "for internal operations",
  "for launch phase",
  "for client handoff",
  "for growth campaign",
];

const DELIVERABLES = [
  "editable source files", "handoff-ready assets", "structured documentation",
  "polished final copy", "responsive UI flow", "deployment-ready module",
  "review notes", "research-backed structure", "brand-consistent assets",
  "presentation-ready output", "clean database integration", "quality assurance pass"
];

const COUNTRIES = [
  "Jordan", "Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait",
  "Oman", "Bahrain", "Egypt"
];

function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let s = t;
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(1847123);

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN(arr, n) {
  const copy = [...arr];
  const out = [];
  while (copy.length && out.length < n) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return out;
}

function titleCase(value) {
  return String(value)
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function slugify(input) {
  return String(input)
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function keywordMatch(text, keywords) {
  const base = String(text || "").toLowerCase();
  return keywords.some((k) => base.includes(k.toLowerCase()));
}

function estimateBudget(topKey, subgroup, leaf) {
  const text = `${topKey} ${subgroup} ${leaf}`.toLowerCase();

  if (topKey === "design") {
    if (keywordMatch(text, ["logo", "greeting cards", "invitations", "photo editing", "retouching"])) return [60, 240];
    if (keywordMatch(text, ["social media", "templates", "business stationery", "print-ready"])) return [90, 320];
    if (keywordMatch(text, ["poster", "infographics", "mind maps", "illustrations", "tables & charts"])) return [140, 480];
    if (keywordMatch(text, ["packaging", "product design", "brand style guide", "personal branding"])) return [280, 950];
    if (keywordMatch(text, ["motion graphics", "video", "website/portfolio", "interactive", "ux research", "wireframing"])) return [350, 1400];
    if (keywordMatch(text, ["environmental", "signage", "corporate presentations", "scientific communication", "graphical abstracts"])) return [220, 780];
    return [120, 550];
  }

  if (topKey === "writing") {
    if (keywordMatch(text, ["sms", "short messages", "card & gift", "cover letters", "recommendation"])) return [25, 90];
    if (keywordMatch(text, ["blog", "social media", "newsletters", "job descriptions", "official correspondence", "faqs"])) return [60, 220];
    if (keywordMatch(text, ["company profiles", "business reports", "project proposals", "presentations", "user manuals", "training materials"])) return [150, 580];
    if (keywordMatch(text, ["business plans", "market analysis", "feasibility", "rfps"])) return [300, 1200];
    if (keywordMatch(text, ["research papers", "academic articles", "literature reviews", "technical writing", "medical writing"])) return [220, 980];
    if (keywordMatch(text, ["thesis", "dissertation", "publication support", "ghostwriting"])) return [420, 1600];
    return [80, 340];
  }

  if (topKey === "development") {
    if (keywordMatch(text, ["bug fixing", "code review", "code tutoring", "code optimization"])) return [40, 180];
    if (keywordMatch(text, ["browser automation", "data collection", "macros", "price tracking", "custom code requests"])) return [120, 420];
    if (keywordMatch(text, ["personal websites", "browser extensions", "desktop utility", "chat bots", "discord/telegram bots"])) return [180, 700];
    if (keywordMatch(text, ["frontend", "backend", "database programming", "gui programming", "desktop application"])) return [250, 1100];
    if (keywordMatch(text, ["api", "system integration", "cloud-native", "serverless", "cybersecurity"])) return [450, 2200];
    if (keywordMatch(text, ["full stack", "enterprise", "erp", "crm", "custom software", "cross-platform", "mobile apps"])) return [700, 4200];
    if (keywordMatch(text, ["artificial intelligence", "machine learning", "nlp", "computer vision", "ai integration"])) return [900, 4800];
    if (keywordMatch(text, ["game development"])) return [800, 5000];
    return [180, 850];
  }

  return [100, 500];
}

function estimateDuration(topKey, subgroup, leaf) {
  const text = `${topKey} ${subgroup} ${leaf}`.toLowerCase();

  if (topKey === "design") {
    if (keywordMatch(text, ["logo", "photo editing", "retouching", "business stationery"])) return [2, 6, "days"];
    if (keywordMatch(text, ["social media", "templates", "print-ready", "mind maps", "mockups"])) return [3, 8, "days"];
    if (keywordMatch(text, ["packaging", "brand style guide", "website/portfolio", "ux research", "motion graphics"])) return [1, 4, "weeks"];
    return [4, 12, "days"];
  }

  if (topKey === "writing") {
    if (keywordMatch(text, ["sms", "card & gift", "cover letters", "recommendation"])) return [1, 3, "days"];
    if (keywordMatch(text, ["social media", "blogs", "job descriptions", "official correspondence"])) return [2, 7, "days"];
    if (keywordMatch(text, ["research papers", "literature reviews", "market analysis", "business plans"])) return [1, 4, "weeks"];
    if (keywordMatch(text, ["thesis", "dissertation", "ghostwriting"])) return [3, 8, "weeks"];
    return [3, 10, "days"];
  }

  if (topKey === "development") {
    if (keywordMatch(text, ["bug fixing", "code review", "tutoring"])) return [1, 5, "days"];
    if (keywordMatch(text, ["automation", "macros", "data collection", "extensions"])) return [3, 10, "days"];
    if (keywordMatch(text, ["frontend", "backend", "database programming", "gui"])) return [1, 4, "weeks"];
    if (keywordMatch(text, ["full stack", "mobile apps", "custom software", "enterprise", "api"])) return [2, 8, "weeks"];
    if (keywordMatch(text, ["ai", "machine learning", "nlp", "computer vision", "cybersecurity", "game"])) return [3, 10, "weeks"];
    return [5, 14, "days"];
  }

  return [5, 10, "days"];
}

function inferSkills(topKey, subgroup, leaf) {
  const t = `${topKey} ${subgroup} ${leaf}`.toLowerCase();
  const skills = new Set();

  if (topKey === "design") {
    ["Adobe Illustrator", "Adobe Photoshop", "Layout Design"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["ux", "wireframing", "interactive", "website/portfolio"])) ["Figma", "User Flow", "Prototype Mapping"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["motion graphics", "video", "multimedia"])) ["After Effects", "Storyboarding", "Visual Timing"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["infographics", "tables & charts", "data visualization", "graphical abstracts", "scientific"])) ["Data Visualization", "Information Hierarchy", "Presentation Design"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["packaging", "product"])) ["Packaging Systems", "Print Specs", "Mockup Presentation"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["branding", "logo", "style guide"])) ["Brand Strategy", "Visual Identity", "Typography"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["photo editing", "retouching", "photography"])) ["Retouching", "Color Correction", "Image Curation"].forEach((v) => skills.add(v));
  }

  if (topKey === "writing") {
    ["Research", "Structured Writing", "Editing"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["social media", "blogs", "copywriting", "content"])) ["SEO Writing", "Hook Writing", "Tone Adaptation"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["business plans", "market analysis", "feasibility", "reports", "proposals", "rfps"])) ["Business Analysis", "Executive Summary Writing", "Persuasive Structuring"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["research papers", "academic", "literature", "citation", "thesis", "dissertation"])) ["APA/MLA Formatting", "Citation Management", "Academic Synthesis"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["medical"])) ["Medical Terminology", "Evidence Review", "Compliance Writing"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["manuals", "training", "technical"])) ["Technical Documentation", "Instructional Design", "Process Clarity"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["resume", "cv", "cover letters"])) ["Resume Structuring", "Career Positioning", "ATS Optimization"].forEach((v) => skills.add(v));
  }

  if (topKey === "development") {
    ["Problem Solving", "Testing", "Documentation"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["frontend", "websites", "extensions", "gui"])) ["JavaScript", "React", "UI Integration"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["backend", "api", "database", "system integration"])) ["Node.js", "PostgreSQL", "REST API"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["mobile", "cross-platform"])) ["Flutter", "State Management", "API Consumption"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["cloud-native", "serverless", "devops"])) ["Docker", "CI/CD", "Deployment"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["ai", "machine learning", "nlp", "computer vision"])) ["Python", "Model Integration", "Data Pipelines"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["scraping", "automation", "price tracking", "data collection", "bots"])) ["Automation", "Parsing", "Scheduling"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["cybersecurity"])) ["Security Review", "Access Control", "Threat Assessment"].forEach((v) => skills.add(v));
    if (keywordMatch(t, ["game"])) ["Game Loop Design", "Physics Basics", "Asset Integration"].forEach((v) => skills.add(v));
  }

  return Array.from(skills).slice(0, 6);
}

function buildTitle(topKey, subgroup, leaf) {
  const industry = pick(INDUSTRIES);
  const audience = pick(AUDIENCES);
  const tone = pick(TONES);
  const goal = pick(GOALS);

  if (topKey === "design") {
    const variants = [
      `${titleCase(leaf)} package for ${industry} brand rollout`,
      `${titleCase(leaf)} concept set for ${industry} audience engagement`,
      `${titleCase(industry)} ${titleCase(leaf)} with ${tone} visual direction`,
      `${titleCase(leaf)} project for ${audience} in ${industry}`,
      `${tone} ${titleCase(leaf)} deliverables focused on ${goal}`,
    ];
    return pick(variants);
  }

  if (topKey === "writing") {
    const variants = [
      `${titleCase(leaf)} for ${titleCase(industry)} operational needs`,
      `${tone} ${titleCase(leaf)} crafted for ${audience}`,
      `${titleCase(leaf)} focused on ${goal} in ${industry}`,
      `${titleCase(industry)} ${titleCase(leaf)} with clear professional tone`,
      `${titleCase(leaf)} package for ${audience} communication`,
    ];
    return pick(variants);
  }

  const variants = [
    `${tone} ${titleCase(leaf)} solution for ${industry} workflow`,
    `${titleCase(leaf)} build for ${audience} in ${industry}`,
    `${titleCase(industry)} ${titleCase(leaf)} with scalable delivery`,
    `${titleCase(leaf)} project focused on ${goal}`,
    `${tone} ${titleCase(leaf)} implementation for ${industry}`,
  ];

  return pick(variants);
}

function buildDescription(topKey, subgroup, leaf) {
  const industry = pick(INDUSTRIES);
  const audience = pick(AUDIENCES);
  const tone = pick(TONES);
  const goal = pick(GOALS);
  const deliverables = pickN(DELIVERABLES, 2);

  if (topKey === "design") {
    return [
      `Need a ${tone} ${leaf.toLowerCase()} project for a ${industry} use case targeting ${audience}.`,
      `The work should keep the visuals clean, consistent, and ready for real client handoff with strong hierarchy and polished presentation quality.`,
      `Expected output includes ${deliverables[0]} and ${deliverables[1]}, with attention to brand consistency, spacing, and practical usability.`,
      `Priority is to ${goal} while keeping the design production-friendly and easy to revise if future changes are requested.`
    ].join("\n");
  }

  if (topKey === "writing") {
    return [
      `Looking for ${leaf.toLowerCase()} tailored to ${industry} requirements and intended for ${audience}.`,
      `The writing should be ${tone}, accurate, easy to follow, and structured in a way that supports decision-making and readability.`,
      `The final delivery should include ${deliverables[0]} and ${deliverables[1]}, with careful editing, logical flow, and consistent tone.`,
      `Main goal is to ${goal} without sounding generic or repetitive, and with wording that feels human and purposeful.`
    ].join("\n");
  }

  return [
    `Need ${leaf.toLowerCase()} for a ${industry} scenario serving ${audience}.`,
    `The implementation should be ${tone}, maintainable, and organized with clear logic, reliable behavior, and practical edge-case handling.`,
    `Expected outcome includes ${deliverables[0]} and ${deliverables[1]}, with testing, readable structure, and deployment awareness where relevant.`,
    `Primary objective is to ${goal} while keeping the solution scalable enough for future enhancement.`
  ].join("\n");
}

function randomInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function clampMoneyInt(value) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function generateBudget(minBase, maxBase) {
  const minB = clampMoneyInt(minBase);
  const maxB = clampMoneyInt(maxBase);
  const spread = Math.max(1, maxB - minB);
  let min = clampMoneyInt(minB + spread * (0.05 + rand() * 0.35));
  let max = clampMoneyInt(minB + spread * (0.60 + rand() * 0.35));
  max = Math.max(min + 10, max);
  return [min, max];
}

function generateDuration(min, max, unit) {
  return [randomInt(min, max), unit];
}

function flattenTaxonomy() {
  const items = [];
  for (const [topKey, topData] of Object.entries(TAXONOMY)) {
    for (const [subgroup, leaves] of Object.entries(topData.subgroups)) {
      for (const leaf of leaves) {
        items.push({ topKey, topLabel: topData.topLabel, subgroup, leaf, image: topData.image });
      }
    }
  }
  return items;
}

function makeAttachment(topKey) {
  const image = TAXONOMY[topKey].image;
  return [{
    name: `${TAXONOMY[topKey].topLabel} default cover`,
    filename: path.basename(image),
    type: "image",
    url: image
  }];
}

async function tableExists(client, tableName) {
  const sql = `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    ) AS ok
  `;
  const { rows } = await client.query(sql, [tableName]);
  return Boolean(rows[0]?.ok);
}

async function getTableColumns(client, tableName) {
  const sql = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
  `;
  const { rows } = await client.query(sql, [tableName]);
  return rows.map((r) => r.column_name);
}

async function resolveCreatedByIds(client) {
  if (CREATED_BY_IDS.length) return CREATED_BY_IDS;

  const candidates = [];
  const hasUsers = await tableExists(client, "users");
  if (!hasUsers) throw new Error("Table public.users was not found; cannot resolve created_by.");

  const columns = await getTableColumns(client, "users");
  const hasRoleId = columns.includes("role_id");
  const hasDeleted = columns.includes("is_deleted");
  let sql = `SELECT id FROM public.users`;
  const where = [];
  if (hasRoleId) where.push(`role_id = 2`);
  if (hasDeleted) where.push(`COALESCE(is_deleted, false) = false`);
  if (where.length) sql += ` WHERE ` + where.join(" AND ");
  sql += ` ORDER BY id ASC LIMIT 20`;

  const { rows } = await client.query(sql);
  for (const row of rows) candidates.push(Number(row.id));
  if (!candidates.length) {
    throw new Error("No suitable users found for created_by. Set CREATED_BY_IDS manually.");
  }
  return candidates;
}

async function resolveLookups(client) {
  const lookup = {
    topCategoryByName: new Map(),
    subCategoryByName: new Map(),
    subSubCategoryByName: new Map(),
  };

  const categoryNames = Object.values(TAXONOMY).map((v) => v.topLabel);
  const categorySql = `
    SELECT id, name
    FROM public.categories
    WHERE lower(name) = ANY($1::text[])
  `;
  const { rows: catRows } = await client.query(categorySql, [categoryNames.map((v) => v.toLowerCase())]);
  for (const row of catRows) {
    lookup.topCategoryByName.set(String(row.name).toLowerCase(), Number(row.id));
  }

  if (await tableExists(client, "sub_categories")) {
    const columns = await getTableColumns(client, "sub_categories");
    const hasName = columns.includes("name");
    if (hasName) {
      const subgroupNames = Object.values(TAXONOMY).flatMap((v) => Object.keys(v.subgroups));
      const sql = `SELECT id, name FROM public.sub_categories WHERE lower(name) = ANY($1::text[])`;
      const { rows } = await client.query(sql, [subgroupNames.map((v) => v.toLowerCase())]);
      for (const row of rows) {
        lookup.subCategoryByName.set(String(row.name).toLowerCase(), Number(row.id));
      }
    }
  }

  if (await tableExists(client, "sub_sub_categories")) {
    const columns = await getTableColumns(client, "sub_sub_categories");
    const hasName = columns.includes("name");
    if (hasName) {
      const leafNames = flattenTaxonomy().map((item) => item.leaf);
      const sql = `SELECT id, name FROM public.sub_sub_categories WHERE lower(name) = ANY($1::text[])`;
      const { rows } = await client.query(sql, [leafNames.map((v) => v.toLowerCase())]);
      for (const row of rows) {
        if (!lookup.subSubCategoryByName.has(String(row.name).toLowerCase())) {
          lookup.subSubCategoryByName.set(String(row.name).toLowerCase(), Number(row.id));
        }
      }
    }
  }

  return lookup;
}

function generateRecords(count, createdByIds, lookup) {
  const flat = flattenTaxonomy();
  const records = [];
  const usedTitles = new Set();

  for (let i = 0; i < count; i += 1) {
    const item = flat[i % flat.length];
    const [budgetBaseMin, budgetBaseMax] = estimateBudget(item.topKey, item.subgroup, item.leaf);
    const [durationMin, durationMax, durationUnit] = estimateDuration(item.topKey, item.subgroup, item.leaf);
    const [budgetMin, budgetMax] = generateBudget(budgetBaseMin, budgetBaseMax);
    const [durationValue, durationUnitFinal] = generateDuration(durationMin, durationMax, durationUnit);

    let title = buildTitle(item.topKey, item.subgroup, item.leaf);
    let dedupe = 0;
    while (usedTitles.has(title.toLowerCase())) {
      title = `${buildTitle(item.topKey, item.subgroup, item.leaf)} ${NATURAL_TITLE_SUFFIXES[dedupe % NATURAL_TITLE_SUFFIXES.length]}`;
      dedupe += 1;
    }
    usedTitles.add(title.toLowerCase());

    const createdBy = createdByIds[i % createdByIds.length];
    const createdAt = new Date(Date.now() - randomInt(0, 180) * 86400000 - randomInt(0, 3600) * 1000);
    const updatedAt = new Date(createdAt.getTime() + randomInt(0, 10) * 86400000);

    const skills = inferSkills(item.topKey, item.subgroup, item.leaf);
    const topCategoryId = lookup.topCategoryByName.get(item.topLabel.toLowerCase()) || null;
    const subCategoryId = lookup.subCategoryByName.get(item.subgroup.toLowerCase()) || null;
    const subSubCategoryId = lookup.subSubCategoryByName.get(item.leaf.toLowerCase()) || null;

    const metadata = {
      top_category: item.topLabel,
      sub_category_name: item.subgroup,
      sub_sub_category_name: item.leaf,
      sub_category_id: subCategoryId,
      skills,
      seed_group: item.topKey,
      seed_leaf_slug: slugify(item.leaf),
    };

    records.push({
      created_by: createdBy,
      status: DEFAULT_STATUS,
      title,
      description: buildDescription(item.topKey, item.subgroup, item.leaf),
      category_id: topCategoryId,
      budget_min: budgetMin,
      budget_max: budgetMax,
      currency: "JD",
      duration_value: durationValue,
      duration_unit: durationUnitFinal,
      country: pick(COUNTRIES) || DEFAULT_COUNTRY,
      attachments: makeAttachment(item.topKey),
      metadata,
      is_deleted: false,
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString(),
      usage_count: 0,
      max_usage: 4,
      sub_sub_category_id: subSubCategoryId,
      duration: durationValue,
      client_public_id: createdBy
    });
  }

  return records;
}

function escapeSqlString(value) {
  return String(value).replace(/'/g, "''");
}

function sqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (value instanceof Date) return `'${escapeSqlString(value.toISOString())}'`;
  if (typeof value === "object") return `'${escapeSqlString(JSON.stringify(value))}'::jsonb`;
  return `'${escapeSqlString(value)}'`;
}

function toInsertSql(records) {
  const columns = [
    "created_by", "status", "title", "description", "category_id",
    "budget_min", "budget_max", "currency", "duration_value", "duration_unit",
    "country", "attachments", "metadata", "is_deleted", "created_at", "updated_at",
    "usage_count", "max_usage", "sub_sub_category_id", "duration", "client_public_id"
  ];

  const values = records.map((r) => {
    const row = columns.map((key) => sqlValue(r[key])).join(", ");
    return `(${row})`;
  }).join(",\n");

  return `INSERT INTO public.tender_vault_projects (\n  ${columns.join(",\n  ")}\n)\nVALUES\n${values};\n`;
}

async function insertRecords(client, records, batchSize) {
  const columns = [
    "created_by", "status", "title", "description", "category_id",
    "budget_min", "budget_max", "currency", "duration_value", "duration_unit",
    "country", "attachments", "metadata", "is_deleted", "created_at", "updated_at",
    "usage_count", "max_usage", "sub_sub_category_id", "duration", "client_public_id"
  ];

  let inserted = 0;
  for (let start = 0; start < records.length; start += batchSize) {
    const chunk = records.slice(start, start + batchSize);
    const values = [];
    const placeholders = [];

    chunk.forEach((record, rowIndex) => {
      const rowPlaceholders = [];
      columns.forEach((column, colIndex) => {
        const paramIndex = rowIndex * columns.length + colIndex + 1;
        rowPlaceholders.push(`$${paramIndex}`);
        const value = record[column];
        if (column === "attachments" || column === "metadata") {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      });
      placeholders.push(`(${rowPlaceholders.join(", ")})`);
    });

    const sql = `
      INSERT INTO public.tender_vault_projects (
        ${columns.join(", ")}
      ) VALUES
        ${placeholders.join(",\n")}
    `;

    await client.query("BEGIN");
    try {
      await client.query(sql, values);
      await client.query("COMMIT");
      inserted += chunk.length;
      console.log(`Inserted ${inserted}/${records.length}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }

  return inserted;
}

async function main() {
  if ((MODE === "insert" || MODE === "sql" || DB_CONNECTION_STRING) && !Client) {
    ({ Client } = require("pg"));
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  if (MODE === "preview") {
    const client = DB_CONNECTION_STRING ? new Client({ connectionString: DB_CONNECTION_STRING }) : null;
    let createdByIds = [1];
    let lookup = { topCategoryByName: new Map(), subCategoryByName: new Map(), subSubCategoryByName: new Map() };

    if (client) {
      await client.connect();
      createdByIds = await resolveCreatedByIds(client);
      lookup = await resolveLookups(client);
      await client.end();
    }

    const records = generateRecords(Math.min(COUNT, 20), createdByIds, lookup);
    const previewPath = path.join(OUTPUT_DIR, "tender_vault_preview.json");
    fs.writeFileSync(previewPath, JSON.stringify(records, null, 2));
    console.log(`Preview saved to ${previewPath}`);
    console.log(JSON.stringify(records.slice(0, 3), null, 2));
    return;
  }

  if (!DB_CONNECTION_STRING && (MODE === "insert" || MODE === "sql")) {
    throw new Error(
      "DATABASE_URL or DB_URL is required for insert/sql. Add it to backendEsModule/.env or set the variable in your shell (same as the backend uses in models/db.js)."
    );
  }

  let client = null;
  if (MODE === "insert" || MODE === "sql") {
    client = new Client({ connectionString: DB_CONNECTION_STRING });
    await client.connect();
  }

  try {
    const createdByIds = client ? await resolveCreatedByIds(client) : [1];
    const lookup = client ? await resolveLookups(client) : { topCategoryByName: new Map(), subCategoryByName: new Map(), subSubCategoryByName: new Map() };
    const records = generateRecords(COUNT, createdByIds, lookup);

    const jsonPath = path.join(OUTPUT_DIR, "tender_vault_seed.json");
    fs.writeFileSync(jsonPath, JSON.stringify(records, null, 2));
    console.log(`JSON saved to ${jsonPath}`);

    if (MODE === "sql") {
      const sql = toInsertSql(records);
      const sqlPath = path.join(OUTPUT_DIR, "tender_vault_seed.sql");
      fs.writeFileSync(sqlPath, sql);
      console.log(`SQL saved to ${sqlPath}`);
      return;
    }

    if (MODE === "insert") {
      const inserted = await insertRecords(client, records, BATCH_SIZE);
      console.log(`Done. Inserted ${inserted} records.`);
      return;
    }

    throw new Error(`Unsupported mode: ${MODE}`);
  } finally {
    if (client) await client.end();
  }
}

main().catch((error) => {
  console.error("Seeder failed:", error);
  process.exit(1);
});
