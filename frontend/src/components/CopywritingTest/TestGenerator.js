// ===============================
// 📌 TestGenerator.js
// Ultra Clean SaaS Version
// ===============================

export const generateDailyTest = () => {
  const testTypes = [
    "Landing Page Copy",
    "Social Media Copy",
    "Ad Copy",
    "Email Marketing Copy",
    "Product Description",
    "Blog Introduction",
    "Branding/Tagline creation",
  ];

  const industries = [
    "SaaS", "food", "fashion", "AI", "health", "crypto",
    "finance", "education", "travel", "fitness", "gaming",
    "real estate", "automotive", "beauty", "entertainment",
  ];

  const type = random(testTypes);
  const industry = random(industries);

  return {
    type,
    industry,
    instruction: generateInstruction(type, industry),
    timestamp: new Date().toISOString(),
  };
};

// Helper: Random picker
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateInstruction = (type, industry) => {
  const products = {
    SaaS: "productivity tool",
    food: "meal delivery service",
    fashion: "clothing line",
    AI: "analytics platform",
    health: "wellness app",
    crypto: "trading platform",
    finance: "budgeting app",
    education: "online course platform",
    travel: "booking service",
    fitness: "workout app",
    gaming: "mobile game",
    "real estate": "property listing service",
    automotive: "car rental service",
    beauty: "skincare line",
    entertainment: "streaming service",
  };

  const audiences = {
    SaaS: "startups and small businesses",
    food: "busy professionals",
    fashion: "young adults aged 18-35",
    AI: "data-driven enterprises",
    health: "health-conscious individuals",
    crypto: "tech-savvy investors",
    finance: "millennials managing personal finances",
    education: "students and lifelong learners",
    travel: "adventure seekers",
    fitness: "people looking to get in shape",
    gaming: "teens and young adults",
    "real estate": "first-time homebuyers",
    automotive: "urban commuters",
    beauty: "women aged 25–45",
    entertainment: "families and binge-watchers",
  };

  const product = products[industry] || "service";
  const audience = audiences[industry] || "general consumers";

  switch (type) {
    case "Landing Page Copy":
      return `Write a landing page copy for a ${industry} ${product} targeting ${audience}.`;

    case "Social Media Copy":
      return `Create a social media post for a ${industry} brand promoting their ${product} to ${audience}.`;

    case "Ad Copy":
      return `Write an advertisement copy for a ${industry} ${product} aimed at ${audience}.`;

    case "Email Marketing Copy":
      return `Draft an email marketing email introducing a ${industry} ${product} to ${audience}.`;

    case "Product Description":
      return `Write a compelling product description for a ${industry} ${product} targeting ${audience}.`;

    case "Blog Introduction":
      return `Write a strong blog introduction about a trending topic in the ${industry} industry.`;

    case "Branding/Tagline creation":
      return `Create a memorable tagline for a ${industry} ${product}.`;

    default:
      return `Write content for a ${industry} business.`;
  }
};
