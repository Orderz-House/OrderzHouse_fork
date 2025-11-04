import { useEffect, useRef, useState } from "react";
import { ChevronRight, ChevronLeft, Play } from "lucide-react";
import AuroraHeader, { useThemeLang } from "../AuroraHeader";

const THEME_PRIMARY = "#028090";

// Fallback videos
const MOCK_VIDEOS = [
  { id: "v1", type: "youtube", title: "Intro", desc: "Overview & goals" },
  { id: "v2", type: "mp4", title: "Setup", desc: "Install & run locally" },
  {
    id: "v3",
    type: "youtube",
    title: "Walkthrough",
    desc: "Core features tour",
  },
];

const I18N = {
  en: {
    title: "Project Tutorials",
    subtitle: "Short walkthroughs to get you up to speed.",
    next: "Next",
    prev: "Previous",
    toCategories: "Go to Categories",
  },
  ar: {
    title: "فيديوهات شروحية",
    subtitle: "شروحات قصيرة لتبدأ بسرعة.",
    next: "التالي",
    prev: "السابق",
    toCategories: "اذهب إلى الأقسام",
  },
};
const t = (lang, k) => I18N[lang]?.[k] ?? I18N.en[k];

export default function Tutorials() {
  const { isDark, setIsDark, lang, setLang } = useThemeLang();
  const [videos, setVideos] = useState([]);
  const [i, setI] = useState(0);
  const cur = videos[i] || {};
  const frameRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/tutorials");
        const data = await res.json();
        setVideos(Array.isArray(data) && data.length ? data : MOCK_VIDEOS);
      } catch {
        setVideos(MOCK_VIDEOS);
      }
    })();
  }, []);

  useEffect(
    () =>
      frameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
    [i]
  );

  const goNext = () =>
    setI((x) => Math.min(x + 1, Math.max(0, videos.length - 1)));
  const goPrev = () => setI((x) => Math.max(0, x - 1));

  return (
    <div
      className={`min-h-[100dvh] ${
        isDark ? "bg-[#0b1220] text-slate-100" : "bg-white text-slate-800"
      }`}
    >
      <AuroraHeader
        title={t(lang, "title")}
        subtitle={t(lang, "subtitle")}
        lang={lang}
        setLang={setLang}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-12 gap-6">
        {/* Player */}
        <div ref={frameRef} className="lg:col-span-8">
          <div
            className={`rounded-2xl border overflow-hidden shadow-sm ${
              isDark
                ? "border-slate-800 bg-slate-900/70"
                : "border-slate-100 bg-white/80"
            }`}
          >
            <div className="aspect-video w-full bg-black/80">
              {cur.type === "mp4" ? (
                <video src={cur.src} controls className="w-full h-full" />
              ) : cur.type === "youtube" ? (
                <iframe
                  title={cur.title ?? "Tutorial"}
                  src={`https://www.youtube.com/embed/${cur.youtubeId}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-sm opacity-60">
                  —
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="font-semibold">{cur.title ?? "—"}</div>
              <div
                className={`text-sm mt-1 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {cur.desc ?? ""}
              </div>
            </div>
          </div>

          {/* Prev / Next */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={i === 0}
              className={`px-4 py-2 rounded-xl border ${
                i === 0 ? "opacity-40 pointer-events-none" : ""
              } ${isDark ? "border-slate-700" : "border-slate-200"}`}
            >
              <ChevronLeft className="inline mr-2" size={18} />{" "}
              {t(lang, "prev")}
            </button>
            <button
              onClick={goNext}
              disabled={i === videos.length - 1}
              className="px-4 py-2 rounded-xl text-white"
              style={{
                background: THEME_PRIMARY,
                opacity: i === videos.length - 1 ? 0.6 : 1,
              }}
            >
              {t(lang, "next")}{" "}
              <ChevronRight className="inline ml-2" size={18} />
            </button>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/categories"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white"
              style={{ background: THEME_PRIMARY }}
            >
              {t(lang, "toCategories")} <ChevronRight size={18} />
            </a>
          </div>
        </div>

        {/* Playlist */}
        <aside className="lg:col-span-4 sticky top-6 self-start">
          <div
            className={`rounded-2xl border p-3 ${
              isDark
                ? "border-slate-800 bg-slate-900/70"
                : "border-slate-100 bg-white/80"
            }`}
          >
            <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
              {videos.map((v, idx) => {
                const active = idx === i;
                return (
                  <button
                    key={v.id ?? idx}
                    onClick={() => setI(idx)}
                    className={[
                      "w-full text-left rounded-xl border p-3 transition flex items-start gap-3 focus:outline-none",
                      active
                        ? isDark
                          ? "border-slate-700 bg-slate-800/40"
                          : "border-slate-700 bg-emerald-50" 
                        : isDark
                        ? "border-slate-700 hover:bg-slate-800"
                        : "border-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span
                      className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-semibold text-white"
                      style={{ background: THEME_PRIMARY }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-2">
                        {v.title ?? `Video ${idx + 1}`}{" "}
                        {active && <Play size={14} />}
                      </div>
                      <div
                        className={`text-xs mt-0.5 ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {v.desc ?? ""}
                      </div>
                    </div>
                  </button>
                );
              })}
              {videos.length === 0 && (
                <div className="text-sm opacity-60">—</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
