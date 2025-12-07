// ======================================================
// 📌 TestCooldown.js — Ultra Clean SaaS Version
// نظام محاولة واحدة كل 24 ساعة مع عرض عدّ تنازلي
// ======================================================

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// 🟦 تحقق هل المستخدم داخل فترة الانتظار
export const checkCooldown = () => {
  const lastTestTimestamp = localStorage.getItem("lastTestTimestamp");

  if (!lastTestTimestamp) {
    return { onCooldown: false, remaining: 0 };
  }

  const lastTime = parseInt(lastTestTimestamp);
  const now = Date.now();
  const diff = now - lastTime;

  // إذا مر 24 ساعة
  if (diff >= COOLDOWN_MS) {
    return { onCooldown: false, remaining: 0 };
  }

  // لسا داخل فترة الانتظار
  return { onCooldown: true, remaining: COOLDOWN_MS - diff };
};

// 🟩 بداية فترة الانتظار (بعد ظهور النتائج)
export const activateCooldown = () => {
  const now = Date.now();
  localStorage.setItem("lastTestTimestamp", now.toString());
};

// 🟨 تنسيق الوقت المتبقي
export const formatCooldown = (ms) => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

// 🟫 Helper
const pad = (n) => n.toString().padStart(2, "0");
