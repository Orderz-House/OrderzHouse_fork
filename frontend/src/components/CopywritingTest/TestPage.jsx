// ======================================================
// 📌 TestPage.jsx — Ultra Clean SaaS Version (Final)
// ======================================================

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { generateDailyTest } from "./TestGenerator";
import { evaluateResponse } from "./TestEvaluator";
import { useTestTimer } from "./TestTimer";
import { checkCooldown, activateCooldown, formatCooldown } from "./TestCooldown";

import {
  SuccessResult,
  FailResult,
  CheatingResult,
  AnalysisCard,
  CooldownView,
} from "./TestUIComponents";

import { FiRefreshCw } from "react-icons/fi";

const TestPage = () => {
  const { userData } = useSelector((state) => state.auth);
  const isFreelancer = userData && userData.role_id === 3;

  const [test, setTest] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [userResponse, setUserResponse] = useState("");
  const [timeLeft, setTimeLeft] = useState(3600);

  // Load Cooldown
  const cooldown = checkCooldown();

  // Timer
  const { isExpired, formatTime } = useTestTimer(timeLeft);

  // ======================================================
  // 📌 Load test + Restore Timer
  // ======================================================
  useEffect(() => {
    if (cooldown.onCooldown) return;

    const storedTest = localStorage.getItem("copywritingTest");
    const lastTestDate = localStorage.getItem("lastTestDate");
    const storedStart = localStorage.getItem("testStartTime");
    const today = new Date().toDateString();

    // نفس اختبار اليوم
    if (storedTest && lastTestDate === today) {
      setTest(JSON.parse(storedTest));

      if (storedStart) {
        const now = Date.now();
        const passed = Math.floor((now - parseInt(storedStart)) / 1000);
        const remaining = 3600 - passed;
        setTimeLeft(remaining > 0 ? remaining : 0);
      } else {
        localStorage.setItem("testStartTime", Date.now().toString());
        setTimeLeft(3600);
      }

      return;
    }

    // يوم جديد → اختبار جديد
    const newTest = generateDailyTest();
    setTest(newTest);

    localStorage.setItem("copywritingTest", JSON.stringify(newTest));
    localStorage.setItem("lastTestDate", today);
    localStorage.setItem("testStartTime", Date.now().toString());

    setTimeLeft(3600);
  }, [cooldown.onCooldown]);

  // ======================================================
  // 📌 Submit handler
  // ======================================================
  const handleSubmit = () => {
    if (isExpired) {
      alert("⏳ انتهى الوقت! لا يمكنك تسليم الإجابة.");
      return;
    }

    if (!userResponse.trim()) {
      alert("⚠️ الرجاء كتابة إجابة قبل الإرسال.");
      return;
    }

    const result = evaluateResponse(userResponse, test, 3600, timeLeft);
    setEvaluation(result);
    setSubmitted(true);

    // Activate cooldown AFTER showing results
    setTimeout(() => {
      activateCooldown();
    }, 1500);
  };

  const resetTest = () => {
    window.location.reload();
  };

  // ======================================================
  // 📌 Access Permissions
  // ======================================================
  if (!isFreelancer) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600">
          ⚠️ هذا الاختبار متاح فقط للمستقلين
        </h2>
      </div>
    );
  }

  // ======================================================
  // 📌 Cooldown Screen
  // ======================================================
  if (cooldown.onCooldown && !submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <CooldownView remaining={formatCooldown(cooldown.remaining)} />
      </div>
    );
  }

  // ======================================================
  // 📌 Loading screen
  // ======================================================
  if (!test) {
    return (
      <div className="text-center p-10">
        <div className="animate-spin h-10 w-10 border-b-2 border-teal-600 rounded-full mx-auto"></div>
      </div>
    );
  }

  // ======================================================
  // 📌 MAIN PAGE UI
  // ======================================================
  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="bg-teal-500 text-white p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold">✍️ الاختبار اليومي لكتابة المحتوى</h1>
        <p className="text-teal-100 mt-1">لديك ساعة واحدة لإتمام هذا الاختبار</p>

        <div className="text-right text-3xl font-bold mt-2">
          {formatTime()}
        </div>
      </div>

      {/* Prompt */}
      <div className="mt-6 p-5 bg-white shadow-sm border border-teal-200 rounded-xl">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">📝 المطلوب:</h2>
        <p className="text-slate-700">{test.instruction}</p>
      </div>

      {/* Answer Box */}
      {!submitted && (
        <div className="mt-5">
          <textarea
            rows={10}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl shadow-sm focus:ring-teal-400"
            placeholder={
              isExpired
                ? "⏳ انتهى الوقت — لم يعد بإمكانك كتابة إجابة."
                : "ابدأ بكتابة إجابتك هنا..."
            }
            disabled={isExpired}
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
          ></textarea>

          {isExpired && (
            <p className="mt-2 text-red-600 font-semibold">
              ⚠️ انتهى الوقت — لا يمكنك إرسال الإجابة الآن.
            </p>
          )}

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isExpired}
              className="bg-teal-500 text-white px-6 py-3 rounded-xl hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إرسال الإجابة
            </button>

            <button
              onClick={resetTest}
              className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-100"
            >
              <FiRefreshCw className="inline-block mr-2" />
              اختبار جديد
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {submitted && evaluation && (
        <div className="mt-6 space-y-6">
          {evaluation.isCheating && <CheatingResult />}

          {!evaluation.isCheating && evaluation.isCorrectDelivery && (
            <SuccessResult evaluation={evaluation} />
          )}

          {!evaluation.isCheating && !evaluation.isCorrectDelivery && (
            <FailResult evaluation={evaluation} />
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <AnalysisCard title="نقاط القوة" items={evaluation.strengths} color="green" />
            <AnalysisCard title="نقاط الضعف" items={evaluation.weaknesses} color="red" />
          </div>

          <AnalysisCard
            title="التصحيحات المطلوبة"
            items={evaluation.improvements}
            color="teal"
          />

          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm text-center">
            <h3 className="text-lg font-semibold">📊 التقييم العام</h3>

            <p className="text-2xl font-bold mt-2">{evaluation.overall}/10</p>

            <p className="text-sm text-slate-600 mt-3">
              + زيادة في تقييمك: {evaluation.ratingIncrease}
            </p>
          </div>

          <button
            onClick={resetTest}
            className="mt-6 w-full py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600"
          >
            العودة لاحقًا — يمكنك المحاولة غدًا
          </button>
        </div>
      )}
    </div>
  );
};

export default TestPage;
