// src/pages/Survey.jsx
import { useEffect, useMemo, useState } from "react";
import AuroraHeader, { useThemeLang } from "../AuroraHeader";

const THEME_PRIMARY = "#028090";

/** نصوص الواجهة (عربي/إنجليزي) */
const I18N = {
  en: {
    title: "Quick Survey",
    subtitle: "Tell us a bit about your needs to match you with the right service.",
    next: "Next",
    prev: "Back",
    skip: "Skip",
    submit: "Finish",
    saving: "Saving...",
    required: "This field is required",
    thanks: "Thanks! Redirecting to appointment…",
  },
  ar: {
    title: "استبيان سريع",
    subtitle: "أخبرنا قليلًا عن احتياجاتك لنطابقك مع الخدمة المناسبة.",
    next: "التالي",
    prev: "السابق",
    skip: "تخطي",
    submit: "إنهاء",
    saving: "جارٍ الحفظ...",
    required: "هذا الحقل مطلوب",
    thanks: "شكرًا لك! سيتم تحويلك لصفحة المواعيد…",
  },
};
const t = (lang, k) => I18N[lang]?.[k] ?? I18N.en[k];

/** fallback محلي للأسئلة إن لم يتوفّر API */
const FALLBACK_QUESTIONS = [
  {
    id: "q1",
    type: "select",
    label: { en: "What do you need help with?", ar: "بماذا تحتاج المساعدة؟" },
    required: true,
    options: [
      { value: "design", label: { en: "Design", ar: "تصميم" } },
      { value: "development", label: { en: "Web Development", ar: "تطوير ويب" } },
      { value: "marketing", label: { en: "Marketing", ar: "تسويق" } },
    ],
  },
  {
    id: "q2",
    type: "text",
    label: { en: "Project title (optional)", ar: "عنوان المشروع (اختياري)" },
    required: false,
    placeholder: { en: "e.g., Landing page for a startup", ar: "مثال: صفحة هبوط لشركة ناشئة" },
  },
  {
    id: "q3",
    type: "textarea",
    label: { en: "Describe your project", ar: "صف مشروعك" },
    required: true,
    placeholder: { en: "Scope, features, deadlines…", ar: "النطاق، الميزات، المواعيد…" },
  },
  {
    id: "q4",
    type: "select",
    label: { en: "Budget range", ar: "نطاق الميزانية" },
    required: true,
    options: [
      { value: "500", label: { en: "Up to $500", ar: "حتى 500$" } },
      { value: "2000", label: { en: "$500 – $2,000", ar: "500–2000$" } },
      { value: "5000", label: { en: "$2,000 – $5,000", ar: "2000–5000$" } },
      { value: "more", label: { en: "More than $5,000", ar: "أكثر من 5000$" } },
    ],
  },
];

/** عنصر إدخال عام */
function Field({ isDark, lang, q, value, onChange, error }) {
  const label = q.label?.[lang] ?? q.label?.en ?? "";
  const placeholder =
    typeof q.placeholder === "object" ? (q.placeholder?.[lang] ?? q.placeholder?.en ?? "") : (q.placeholder ?? "");

  const base =
    "w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ring-offset-2 transition";

  const border = isDark ? "border-slate-700 bg-slate-900/70 text-slate-100 ring-offset-slate-900" : "border-slate-200 bg-white ring-offset-white";

  if (q.type === "textarea") {
    return (
      <div className="space-y-2">
        <label className="font-medium">{label}{q.required ? " *" : ""}</label>
        <textarea
          rows={5}
          className={`${base} ${border}`}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
        {error ? <div className="text-red-500 text-xs">{error}</div> : null}
      </div>
    );
  }

  if (q.type === "select") {
    return (
      <div className="space-y-2">
        <label className="font-medium">{label}{q.required ? " *" : ""}</label>
        <select
          className={`${base} ${border}`}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{lang === "ar" ? "اختر..." : "Choose..."}</option>
          {(q.options ?? []).map((op) => (
            <option key={op.value} value={op.value}>
              {op.label?.[lang] ?? op.label?.en ?? op.value}
            </option>
          ))}
        </select>
        {error ? <div className="text-red-500 text-xs">{error}</div> : null}
      </div>
    );
  }

  // default: text/number/date...
  return (
    <div className="space-y-2">
      <label className="font-medium">{label}{q.required ? " *" : ""}</label>
      <input
        type={q.type || "text"}
        className={`${base} ${border}`}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? <div className="text-red-500 text-xs">{error}</div> : null}
    </div>
  );
}

export default function Survey() {
  const { isDark, setIsDark, lang, setLang } = useThemeLang();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [questions, setQuestions] = useState(FALLBACK_QUESTIONS);
  const [answers, setAnswers] = useState({}); // { [qid]: value }
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  /** جلب أسئلة السيرفاي من API إن وجد */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/survey/questions");
        if (res.ok) {
          const data = await res.json();
          if (mounted && Array.isArray(data) && data.length) {
            setQuestions(data);
          }
        }
      } catch {
        // fallback
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const current = questions[step];

  const validate = (q, val) => {
    if (!q?.required) return null;
    if (val == null || val === "") return t(lang, "required");
    return null;
  };

  const saveAnswer = async (qid, value) => {
    setSaving(true);
    try {
      // backend: احفظ الإجابة تدريجياً
      // body: { questionId, value }
      await fetch("/api/survey/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: qid, value }),
      });
    } catch {
      // ممكن تضيف Toast خطأ
    } finally {
      setSaving(false);
    }
  };

  const onChange = async (qid, value) => {
    setAnswers((p) => ({ ...p, [qid]: value }));
    setErrors((p) => ({ ...p, [qid]: null }));
    // حفظ فوري لكل تغيير
    await saveAnswer(qid, value);
  };

  const onNext = async () => {
    // تحقق من السؤال الحالي فقط
    const err = validate(current, answers[current.id]);
    if (err) {
      setErrors((p) => ({ ...p, [current.id]: err }));
      return;
    }
    setStep((s) => Math.min(s + 1, questions.length - 1));
  };

  const onPrev = () => setStep((s) => Math.max(s - 1, 0));

  const onSkip = () => setStep((s) => Math.min(s + 1, questions.length - 1));

  const onSubmit = async () => {
    // تحقق كامل سريع
    const newErrs = {};
    for (const q of questions) {
      const e = validate(q, answers[q.id]);
      if (e) newErrs[q.id] = e;
    }
    if (Object.keys(newErrs).length) {
      setErrors(newErrs);
      // اقفز لأول سؤال خاطئ
      const idx = questions.findIndex((q) => newErrs[q.id]);
      if (idx >= 0) setStep(idx);
      return;
    }

    setSaving(true);
    try {
      await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      setDone(true);
      // التحويل للموعد
      setTimeout(() => {
        window.location.assign("/appointment");
      }, 900);
    } catch {
      // Toast خطأ إن رغبت
    } finally {
      setSaving(false);
    }
  };

  const progress = Math.round(((step + 1) / Math.max(questions.length, 1)) * 100);

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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* شريط تقدم */}
        <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
          <div
            className="h-full"
            style={{ width: `${progress}%`, background: THEME_PRIMARY, transition: "width .25s ease" }}
          />
        </div>

        {/* بطاقة السؤال */}
        <div className={`mt-6 rounded-2xl border p-6 ${isDark ? "border-slate-800 bg-slate-900/70" : "border-slate-100 bg-white/80"}`}>
          {loading ? (
            <div className="h-40 rounded-xl border animate-pulse" />
          ) : (
            <>
              {/* سؤال واحد بالخطوة */}
              <Field
                isDark={isDark}
                lang={lang}
                q={current}
                value={answers[current?.id]}
                onChange={(v) => onChange(current.id, v)}
                error={errors[current?.id]}
              />

              {/* أزرار التنقّل */}
              <div className="mt-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onPrev}
                    disabled={step === 0}
                    className={`px-4 py-2 rounded-xl border text-sm ${step === 0 ? "opacity-40 pointer-events-none" : ""} ${isDark ? "border-slate-700" : "border-slate-200"}`}
                  >
                    {t(lang, "prev")}
                  </button>
                  <button
                    onClick={onSkip}
                    className={`px-4 py-2 rounded-xl border text-sm ${isDark ? "border-slate-700" : "border-slate-200"}`}
                  >
                    {t(lang, "skip")}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {step < questions.length - 1 ? (
                    <button
                      onClick={onNext}
                      className="px-5 py-2 rounded-xl text-white text-sm font-semibold"
                      style={{ background: THEME_PRIMARY }}
                    >
                      {saving ? t(lang, "saving") : t(lang, "next")}
                    </button>
                  ) : (
                    <button
                      onClick={onSubmit}
                      className="px-5 py-2 rounded-xl text-white text-sm font-semibold"
                      style={{ background: THEME_PRIMARY }}
                    >
                      {saving ? t(lang, "saving") : t(lang, "submit")}
                    </button>
                  )}
                </div>
              </div>

              {done && (
                <div className={`mt-4 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{t(lang, "thanks")}</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
