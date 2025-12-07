// ==================================================
// 📌 TestTimer.js — Ultra Clean SaaS Version
// Hook احترافي لإدارة مؤقت الاختبار
// ==================================================

import { useEffect, useState } from "react";

export const useTestTimer = (initialSeconds = 3600) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  return {
    timeLeft,
    isExpired,
    formatTime: () => format(timeLeft),
  };
};

// ==================================================
// 🟦 Helper — Format hh:mm:ss
// ==================================================
const format = (seconds) => {
  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};
