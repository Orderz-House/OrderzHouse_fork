// ==========================================
// 📌 TestEvaluator.js — Ultra Clean SaaS Version
// ==========================================

import { detectCheating } from "./TestAntiCheat";

// 🎯 تقييم الكتابة
export const evaluateResponse = (response, testPrompt, timeLeftInitial, timeLeftFinal) => {
  const responseLength = response.trim().split(/\s+/).length;
  const timeTaken = timeLeftInitial - timeLeftFinal;

  // أساس التقييم
  let creativity = 5;
  let seo = 5;
  let grammar = 5;
  let structure = 5;
  let tone = 5;
  let instructionAccuracy = 5;

  // ================================
  // 🔥 Creativity
  // ================================
  if (responseLength > 120) creativity += 2;
  if (/unique|innovative|creative/i.test(response)) creativity += 2;
  creativity = limit(creativity);

  // ================================
  // 🔥 SEO
  // ================================
  const seoWords = ["learn", "course", "platform", "education", "students"];
  let seoHits = seoWords.filter((w) => response.toLowerCase().includes(w)).length;
  seo = limit(seo + seoHits);

  // ================================
  // 🔥 Grammar
  // ================================
  // Safe string matching to prevent undefined errors
  const grammarMatches = typeof response === 'string' && response 
    ? (response.match(/[.!?]\s+[a-z]/g) || [])
    : [];
  const mistakes = grammarMatches.length;
  grammar = limit(10 - mistakes);

  // ================================
  // 🔥 Structure
  // ================================
  const paragraphs = response.split(/\n\s*\n/).length;
  if (paragraphs >= 2) structure += 2;
  if (/[•\-]/.test(response)) structure += 1;
  structure = limit(structure);

  // ================================
  // 🔥 Tone
  // ================================
  if (
    testPrompt.industry === "education" &&
    response.toLowerCase().includes("future")
  ) {
    tone += 2;
  }
  tone = limit(tone);

  // ================================
  // 🔥 Instruction Accuracy
  // ================================
  let issues = 0;
  if (!response.toLowerCase().includes(testPrompt.type.split(" ")[0].toLowerCase()))
    issues++;
  if (!response.toLowerCase().includes(testPrompt.industry.toLowerCase()))
    issues++;

  instructionAccuracy = limit(10 - issues * 3);

  // ================================
  // 🔥 Final Score
  // ================================
  const overall = Math.round(
    (creativity + seo + grammar + structure + tone + instructionAccuracy) / 6
  );

  // ================================
  // 🔥 Anti-Cheating
  // ================================
  const isCheating = detectCheating(response, timeTaken, responseLength);

  // ================================
  // 🔥 Success Logic
  // ================================
  const isCorrectDelivery = overall > 5;

  // ================================
  // 🔥 Rating Increase Logic
  // ================================
  let ratingIncrease = 0;

  if (isCorrectDelivery && !isCheating) {
    // درجة normalized بين 0 → 1
    const normalized = (overall - 5) / 5;

    // سقف الزيادة 0.5
    ratingIncrease = Math.min(0.5, normalized * 0.5);
    ratingIncrease = Number(ratingIncrease.toFixed(2));
  }

  // ================================
  // 🔥 Build Response Object
  // ================================
  return {
    scores: {
      creativity,
      seo,
      grammar,
      structure,
      tone,
      instructionAccuracy,
    },
    strengths: generateStrengths(
      creativity, seo, grammar, structure, tone, instructionAccuracy
    ),
    weaknesses: generateWeaknesses(
      creativity, seo, grammar, structure, tone, instructionAccuracy
    ),
    improvements: generateImprovements(
      creativity, seo, grammar, structure, tone, instructionAccuracy
    ),
    overall,
    isCheating,
    isCorrectDelivery,
    ratingIncrease,
  };
};

// ================================
// 🔧 Helper — clamp to 0–10
// ================================
const limit = (val) => Math.max(0, Math.min(10, val));

// ================================
// 💡 Strengths Generator
// ================================
const generateStrengths = (creativity, seo, grammar, structure, tone, accuracy) => {
  const arr = [];
  if (creativity >= 8) arr.push("إبداع عالي وطرح جذاب للمحتوى");
  if (seo >= 8) arr.push("تحسين ممتاز لمحركات البحث SEO");
  if (grammar >= 8) arr.push("خلوّ المحتوى من الأخطاء اللغوية");
  if (structure >= 8) arr.push("تنظيم ممتاز وسهولة قراءة عالية");
  if (tone >= 8) arr.push("نبرة مناسبة ومقنعة للجمهور");
  if (accuracy >= 8) arr.push("التزام ممتاز بمتطلبات المهمة");
  return arr.length ? arr : ["جودة مقبولة ويمكن تحسينها أكثر"];
};

// ================================
// 💡 Weaknesses Generator
// ================================
const generateWeaknesses = (creativity, seo, grammar, structure, tone, accuracy) => {
  const arr = [];
  if (creativity < 7) arr.push("المحتوى يحتاج مزيدًا من الإبداع");
  if (seo < 6) arr.push("ضعف في استخدام كلمات SEO");
  if (grammar < 7) arr.push("وجود أخطاء نحوية ملحوظة");
  if (structure < 7) arr.push("التنظيم يحتاج تحسينًا أفضل");
  if (tone < 7) arr.push("النبرة غير متناسقة مع الجمهور");
  if (accuracy < 7) arr.push("المحتوى لا يغطي المطلوب بالكامل");
  return arr.length ? arr : ["تحسينات بسيطة مطلوبة للوصول لجودة أعلى"];
};

// ================================
// 💡 Improvements Generator
// ================================
const generateImprovements = (creativity, seo, grammar, structure, tone, accuracy) => {
  const arr = [];
  if (creativity < 8) arr.push("استخدم عبارات أقوى وأكثر ابتكارًا");
  if (seo < 7) arr.push("أضف كلمات مفتاحية ذات صلة بالمجال");
  if (grammar < 9) arr.push("قم بمراجعة النص لتصحيح الأخطاء اللغوية");
  if (structure < 8) arr.push("حسّن تسلسل الفقرات واستعمل فواصل أو نقاط");
  if (tone < 8) arr.push("اضبط النبرة لتناسب شخصية الجمهور");
  if (accuracy < 8) arr.push("تأكد من تنفيذ المطلوب حرفيًا");
  return arr.length ? arr : ["ممتاز — لا يحتاج الكثير من التعديلات"];
};
