// ===========================================
// 📌 TestAntiCheat.js — Ultra Clean SaaS Version
// ===========================================

// نظام كشف الغش — خفيف ودقيق وبدون false positives
export const detectCheating = (response, timeTaken, wordCount) => {
  
  // 1) سرعة غير منطقية
  if (wordCount < 40 && timeTaken < 30) return true;
  if (wordCount < 80 && timeTaken < 60) return true;

  // 2) أنماط نصوص جاهزة معروفة
  const forbiddenPatterns = [
    /lorem ipsum/gi,
    /dummy text/gi,
    /placeholder/gi,
    /sample text/gi,
    /AI generated/gi,
    /as an ai/gi,
    /i am an ai/gi,
    /this is a sample/gi,
    /this is a test/gi,
  ];

  for (let pattern of forbiddenPatterns) {
    if (pattern.test(response)) return true;
  }

  // 3) نص مكرر جدًا بطريقة غير بشرية
  const repeatedWords = checkRepetition(response);
  if (repeatedWords) return true;

  // 4) نمط JSON أو شكل ردود ChatGPT بدون تعديل
  if (/{|}/.test(response) || /\[/g.test(response) || /\]/g.test(response)) {
    return true;
  }

  // 5) إذا كان المستخدم كتب فقرات بدون معنى لغوي
  if (hasNonHumanPatterns(response)) return true;

  return false;
};

// ===============================
// 🔍 كشف تكرار الكلمات بشكل غير طبيعي
// ===============================
const checkRepetition = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const counts = {};
  for (let w of words) {
    counts[w] = (counts[w] || 0) + 1;
    if (counts[w] > 10) return true;
  }
  return false;
};

// ===============================
// 🔍 كشف النصوص الاصطناعية
// ===============================
const hasNonHumanPatterns = (text) => {
  const weirdPatterns = [
    /high-quality ai content/gi,
    /leveraging cutting-edge/gi,
    /as a language model/gi,
    /premise of generating text/gi,
  ];
  return weirdPatterns.some((p) => p.test(text));
};
