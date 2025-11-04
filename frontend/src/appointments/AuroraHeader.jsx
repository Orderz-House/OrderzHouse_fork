import { useEffect, useState } from "react";
import { Sun, Moon, Globe } from "lucide-react";

const THEME_PRIMARY = "#028090";
const THEME_ACCENT = "#02C39A";

export default function AuroraHeader({
  title,
  subtitle,
  lang,
  setLang,
  isDark,
  setIsDark,
}) {
  return (
    <header className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(30% 50% at 20% 10%, ${THEME_PRIMARY}22, transparent 55%),
            radial-gradient(35% 60% at 80% 20%, ${THEME_ACCENT}26, transparent 60%),
            linear-gradient(180deg, transparent 0%, transparent 70%, ${isDark ? "#0b1220" : "#fff"} 100%)
          `,
          filter: "saturate(115%) blur(0.4px)",
        }}
      />
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        {/* أزرار الثيم واللغة */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setLang((l) => (l === "ar" ? "en" : "ar"))}
            className={`rounded-full border px-3 py-2 text-sm flex items-center gap-2 ${
              isDark ? "border-slate-700 bg-slate-900/70" : "border-slate-200 bg-white/80"
            }`}
            aria-label="Toggle language"
            title="Language"
          >
            <Globe size={16} />
            <span className="hidden sm:inline">{lang === "ar" ? "العربية" : "English"}</span>
          </button>

          <button
            onClick={() => setIsDark((v) => !v)}
            className={`rounded-full border p-2 ${
              isDark ? "border-slate-700 bg-slate-900/70" : "border-slate-200 bg-white/80"
            }`}
            aria-label="Toggle theme"
            title="Theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <div className="text-center mt-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{subtitle}</p>
          ) : null}
        </div>

        <div className="mx-auto mt-6 h-[1.5px] w-32 rounded-full"
             style={{ background: `linear-gradient(90deg, ${THEME_PRIMARY}, ${THEME_ACCENT})` }} />
      </div>
    </header>
  );
}

export function useThemeLang() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  });
  const [lang, setLang] = useState(() => (localStorage.getItem("lang") === "ar" ? "ar" : "en"));

  useEffect(() => localStorage.setItem("theme", isDark ? "dark" : "light"), [isDark]);
  useEffect(() => localStorage.setItem("lang", lang), [lang]);

  return { isDark, setIsDark, lang, setLang };
}
