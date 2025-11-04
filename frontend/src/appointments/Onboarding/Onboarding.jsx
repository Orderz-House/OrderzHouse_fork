import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import AuroraHeader, { useThemeLang } from "../AuroraHeader";

const THEME_PRIMARY = "#028090";
const THEME_DARK = "#024b69";

const I18N = {
  en: {
    title: "Quick Questions",
    subtitle: "Answer a few questions so we can tailor the experience.",
    next: "Next",
    prev: "Back",
    submit: "Finish",
    saving: "Saving...",
    saved: "Saved!",
    required: "This question is required.",
    yes: "Yes",
    no: "No",
    skipSurvey: "Skip to survey",
    noQuestions: "No questions available. Please try again later.",
    retry: "Retry",
  },
  ar: {
    title: "أسئلة سريعة",
    subtitle: "جاوب على أسئلة بسيطة لنخصّص لك التجربة.",
    next: "التالي",
    prev: "رجوع",
    submit: "إنهاء",
    saving: "يتم الحفظ...",
    saved: "تم الحفظ!",
    required: "هذا السؤال مطلوب.",
    yes: "نعم",
    no: "لا",
    skipSurvey: "تخطي إلى الاستبيان",
    noQuestions: "لا توجد أسئلة متاحة حالياً. الرجاء المحاولة لاحقاً.",
    retry: "إعادة المحاولة",
  },
};
const t = (lang, k) => I18N[lang]?.[k] ?? I18N.en[k];

export default function Onboarding() {
  const { isDark, setIsDark, lang, setLang } = useThemeLang();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState("idle");
  const current = questions[idx];
  const inputRef = useRef(null);

  const fetchQuestions = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch("/api/onboarding/questions");
      if (!res.ok) throw new Error("Failed to load questions");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data);
        setIdx(0);
      } else {
        setQuestions([]);
      }
    } catch (e) {
      setLoadError(true);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await fetchQuestions();
      if (!mounted) return;
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (inputRef.current && current && !["boolean", "select"].includes(current.type)) {
      inputRef.current.focus();
    }
  }, [idx, current]);

  const onChange = (val) =>
    current && setAnswers((prev) => ({ ...prev, [current.id]: val }));

  const canNext = useMemo(() => {
    if (!current) return false;
    if (!current.required) return true;
    const v = answers[current.id];
    if (current.type === "boolean") return typeof v === "boolean";
    return (v ?? "").toString().trim().length > 0;
  }, [current, answers]);

  const saveOne = async (q, val) => {
    try {
      await fetch("/api/onboarding/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current-user",
          questionId: q.id,
          answer: val,
        }),
      });
    } catch {
      // اختياري: Toast خطأ
    }
  };

  const handleNext = async () => {
    if (!current || !canNext) return;
    setStatus("saving");
    await saveOne(current, answers[current.id]);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 600);

    if (idx < questions.length - 1) setIdx((i) => i + 1);
    else window.location.assign("/tutorials"); // أبقيتها كما كانت لديك
  };

  const handlePrev = () => idx > 0 && setIdx((i) => i - 1);

  const progress = questions.length ? Math.round(((idx + 1) / questions.length) * 100) : 0;

  return (
    <div className={`min-h-[100dvh] ${isDark ? "bg-[#0b1220] text-slate-100" : "bg-white text-slate-800"}`}>
      <AuroraHeader
        title={t(lang, "title")}
        subtitle={t(lang, "subtitle")}
        lang={lang}
        setLang={setLang}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-8">
        <div className={`h-2 w-full rounded-full ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${THEME_PRIMARY}, ${THEME_DARK})`,
            }}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-8">
        {loading ? (
          <div className="h-56 rounded-2xl border animate-pulse" />
        ) : questions.length === 0 ? (
          <div
            className={`rounded-2xl border p-6 text-center ${
              isDark ? "bg-slate-900/70 border-slate-800" : "bg-white/80 border-slate-100"
            }`}
          >
            <p className={`mb-4 ${isDark ? "text-slate-200" : "text-slate-700"}`}>{t(lang, "noQuestions")}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={fetchQuestions}
                className={`px-4 py-2 rounded-xl border ${isDark ? "border-slate-700" : "border-slate-200"}`}
              >
                {t(lang, "retry")}
              </button>
              <a
                href="/survey"
                className="px-5 py-2.5 rounded-xl text-white"
                style={{ background: THEME_PRIMARY }}
              >
                {t(lang, "skipSurvey")}
              </a>
            </div>
          </div>
        ) : (
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current?.id ?? "empty"}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`rounded-2xl border p-6 md:p-8 shadow-sm ${
                  isDark ? "bg-slate-900/70 border-slate-800" : "bg-white/80 border-slate-100"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs opacity-60">
                      {idx + 1} / {questions.length}
                    </div>
                    <h2 className="text-xl md:text-2xl font-semibold">
                      {current?.label?.[lang] ?? current?.label?.en}
                    </h2>
                  </div>
                </div>

                <div className="mt-6">
                  {current?.type === "boolean" ? (
                    <div className="grid grid-cols-2 gap-3">
                      {[{ v: true, label: t(lang, "yes") }, { v: false, label: t(lang, "no") }].map((btn) => {
                        const active = answers[current.id] === btn.v;
                        return (
                          <button
                            key={btn.label}
                            onClick={() => onChange(btn.v)}
                            className={`rounded-xl border px-4 py-3 font-medium transition ${
                              active ? "text-white" : isDark ? "border-slate-700" : "border-slate-200"
                            }`}
                            style={{ background: active ? THEME_PRIMARY : undefined }}
                          >
                            {active && <Check size={16} className="inline mr-2" />}
                            {btn.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : current?.type === "select" ? (
                    <div className="relative group">
                      <select
                        ref={inputRef}
                        value={answers[current.id] ?? ""}
                        onChange={(e) => onChange(e.target.value)}
                        className={[
                          "w-full rounded-xl border px-4 py-3 pr-10 shadow-sm transition appearance-none",
                          "focus:outline-none focus:border-slate-700",
                          isDark
                            ? "bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700 text-slate-100"
                            : "bg-gradient-to-b from-white to-slate-50 border-slate-200 text-slate-800",
                        ].join(" ")}
                      >
                        <option value="" disabled>—</option>
                        {(current.options ?? []).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label?.[lang] ?? opt.label?.en ?? opt.value}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70 group-focus-within:opacity-100"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M5.25 7.5l4.5 4.5 4.5-4.5" />
                      </svg>
                    </div>
                  ) : current?.type === "textarea" ? (
                    <textarea
                      ref={inputRef}
                      rows={5}
                      value={answers[current.id] ?? ""}
                      onChange={(e) => onChange(e.target.value)}
                      className={`w-full rounded-xl border px-4 py-3 resize-y focus:outline-none focus:border-slate-700 ${
                        isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
                      }`}
                    />
                  ) : (
                    <input
                      ref={inputRef}
                      type="text"
                      value={answers[current.id] ?? ""}
                      onChange={(e) => onChange(e.target.value)}
                      className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:border-slate-700 ${
                        isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
                      }`}
                    />
                  )}

                  {/* رسالة الحقل المطلوب */}
                  {!canNext && current?.required ? (
                    <div className="mt-2 text-sm text-rose-500">{t(lang, "required")}</div>
                  ) : null}

                  {/* زر Skip أسفل الأزرار وبالمنتصف */}
                  <div className="mt-6 flex justify-center">
                    <a
                      href="/survey"
                      className={[
                        "inline-flex items-center gap-2 text-sm font-medium transition",
                        isDark ? "text-slate-100" : "text-gray-600",
                      ].join(" ")}
                    >
                      {t(lang, "skipSurvey")}
                      <ChevronRight size={16} />
                    </a>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    onClick={handlePrev}
                    disabled={idx === 0}
                    className={`px-4 py-2 rounded-xl border ${
                      idx === 0 ? "opacity-40 pointer-events-none" : ""
                    } ${isDark ? "border-slate-700" : "border-slate-200"}`}
                  >
                    <ChevronLeft className="inline mr-1" size={18} />
                    {t(lang, "prev")}
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={!canNext || status === "saving"}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                    style={{
                      background: THEME_PRIMARY,
                      opacity: !canNext || status === "saving" ? 0.6 : 1,
                    }}
                  >
                    <span>{idx === questions.length - 1 ? t(lang, "submit") : t(lang, "next")}</span>
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="mt-2 text-sm opacity-70">
                  {status === "saving" && t(lang, "saving")}
                  {status === "saved" && t(lang, "saved")}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
