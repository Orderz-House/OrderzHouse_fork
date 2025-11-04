import { useEffect, useMemo, useRef, useState, useDeferredValue } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import services from "./services.json";
import {
  PenTool,
  Code2,
  Megaphone,
  Rocket,
  Brush,
  Camera,
  ChartBar,
  Layers,
  ChevronRight,
  Search as SearchIcon,
  X as XIcon,
  Sun,
  Moon,
  Globe,
} from "lucide-react";

// ======= THEME =======
const THEME_PRIMARY = "#028090";
const THEME_DARK = "#024b69";
const THEME_ACCENT = "#02C39A";

// ======= i18n (static UI strings) =======
const I18N = {
  en: {
    explore: "Explore",
    categories: "Categories",
    design_title: "Design",
    design_desc: "UI, UX, branding and creative assets.",
    development_title: "Development",
    development_desc: "Front-end, back-end, APIs, DevOps.",
    content_title: "Content Writing",
    content_desc: "Performance, content, SEO, campaigns.",
    search_label: "Search services",
    search_placeholder: "Search (press / to focus)…",
    showing: "Showing",
    result_one: "result",
    result_many: "results",
    prev: "Prev",
    next: "Next",
    no_results: "No results for",
  },
  ar: {
    explore: "استكشف",
    categories: "الأقسام",
    design_title: "التصميم",
    design_desc: "واجهات وتجربة المستخدم والبراندينج والأصول الإبداعية.",
    development_title: "البرمجة",
    development_desc: "فرونت إند، باك إند، واجهات برمجية، ديف أوبس.",
    content_title: "كتابة المحتوى",
    content_desc: "الأداء والمحتوى وتحسين محركات البحث والحملات.",
    search_label: "ابحث عن الخدمات",
    search_placeholder: "ابحث (اختصار / للتركيز)…",
    showing: "عرض",
    result_one: "نتيجة",
    result_many: "نتائج",
    prev: "السابق",
    next: "التالي",
    no_results: "لا توجد نتائج لـ",
  },
};
const t = (lang, key) => I18N[lang]?.[key] ?? I18N.en[key] ?? key;
const catTitle = (lang, id) =>
  id === "design"
    ? t(lang, "design_title")
    : id === "development"
    ? t(lang, "development_title")
    : t(lang, "content_title");
const catDesc = (lang, id) =>
  id === "design"
    ? t(lang, "design_desc")
    : id === "development"
    ? t(lang, "development_desc")
    : t(lang, "content_desc");
const pluralWord = (lang, count) =>
  count === 1 ? t(lang, "result_one") : t(lang, "result_many");

// ======= HELPERS =======
function paginate(arr, page = 1, perPage = 16) {
  const start = (page - 1) * perPage;
  return arr.slice(start, start + perPage);
}
function polarToCartesian(cx, cy, radius, angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}
function getHiDpiProps(src, src2x) {
  if (!src || typeof src !== "string") return { src };

  if (src2x && typeof src2x === "string") {
    return {
      src,
      srcSet: `${src} 1x, ${src2x} 2x`,
      sizes:
        "(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw",
    };
  }

  if (src.includes("picsum.photos")) {
    const m = src.match(/\/(\d+)\/(\d+)(\?.*)?$/);
    if (m) {
      const w = Number(m[1]),
        h = Number(m[2]);
      const hi = src.replace(/\/\d+\/\d+/, `/${w * 2}/${h * 2}`);
      return {
        src,
        srcSet: `${src} 1x, ${hi} 2x`,
        sizes:
          "(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw",
      };
    }
  }
  return { src };
}

// ---- Search helpers ----
const norm = (s) => (s || "").toLowerCase().trim();
const tokenize = (q) => norm(q).split(/\s+/).filter(Boolean);

function scoreItem(item, tokens) {
  if (tokens.length === 0) return 1;
  const hayTitle = norm(`${item.title} ${item.title_ar || ""}`);
  const hayGroup = norm(item.group);
  const hayDesc = norm(`${item.desc || ""} ${item.desc_ar || ""}`);

  let score = 0;
  for (const tkn of tokens) {
    if (hayTitle.startsWith(tkn)) score += 8;
    else if (hayTitle.includes(tkn)) score += 5;

    if (hayGroup.startsWith(tkn)) score += 4;
    else if (hayGroup.includes(tkn)) score += 3;

    if (hayDesc.includes(tkn)) score += 1;
  }
  score += Math.max(0, 3 - Math.floor((item.title || "").length / 20));
  return score;
}
function smartFilter(items, query) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return items;
  const filtered = [];
  for (const it of items) {
    const allOk = tokens.every(
      (tkn) =>
        norm(`${it.title} ${it.title_ar || ""}`).includes(tkn) ||
        norm(it.group).includes(tkn) ||
        norm(`${it.desc || ""} ${it.desc_ar || ""}`).includes(tkn)
    );
    if (!allOk) continue;
    filtered.push({ it, s: scoreItem(it, tokens) });
  }
  filtered.sort((a, b) => b.s - a.s);
  return filtered.map((x) => x.it);
}

// ======= IMAGE / DESC (defensive) =======
const toText = (v) => (typeof v === "string" ? v : v?.title || "");
const makeDesc = (name, group, fallback) => {
  const tname = toText(name);
  if (fallback && typeof fallback === "string") return fallback;
  const g = typeof group === "string" ? group : String(group || "");
  return `Professional ${tname.toLowerCase()} under "${g}". Clear scope, polished tone, and ready to use.`;
};
const makeImg = (name, group) =>
  `https://picsum.photos/seed/${encodeURIComponent(
    `${(typeof group === "string"
      ? group
      : String(group || "")
    ).trim()}-${(typeof name === "string" ? name : name?.title || "").trim()}`
  )}/1200/900`;

function buildItems(obj) {
  const out = [];
  Object.entries(obj || {}).forEach(([group, items]) => {
    (items || []).forEach((entry, i) => {
      const isObj = entry && typeof entry === "object";
      const title = isObj ? entry.title : entry;
      const desc = isObj ? entry.desc : undefined;

      out.push({
        id: `${group}-${i + 1}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title,
        group,
        desc: makeDesc(title, group, desc),
        title_ar: isObj ? entry.title_ar : undefined,
        desc_ar: isObj ? entry.desc_ar : undefined,
        image: isObj && entry.image ? entry.image : makeImg(title, group),
      });
    });
  });
  return out;
}

// ======= i18n helpers for items =======
const getTitleByLang = (it, lang) =>
  lang === "ar" ? it.title_ar || it.title : it.title;
const getDescByLang = (it, lang) =>
  lang === "ar" ? it.desc_ar || it.desc : it.desc;

// ======= DATA FROM services.json =======
const CATEGORIES_FROM_DOC = [
  {
    id: "design",
    title: "Design",
    color: THEME_PRIMARY,
    icon: PenTool,
    description: "UI, UX, branding and creative assets.",
    subcategories: buildItems(services.design),
  },
  {
    id: "development",
    title: "Development",
    color: THEME_DARK,
    icon: Code2,
    description: "Front-end, back-end, APIs, DevOps.",
    subcategories: buildItems(services.development),
  },
  {
    id: "Content Writing",
    title: "Content Writing",
    color: THEME_ACCENT,
    icon: Megaphone,
    description: "Performance, content, SEO, campaigns.",
    subcategories: buildItems(services.contentWriting),
  },
];

// ======= WHEEL SEGMENTS =======
const RING_SEGMENTS = [
  { id: "seg-1", color: "#4FC3F7", icon: Rocket },
  { id: "seg-2", color: "#29B6F6", icon: Brush },
  { id: "seg-3", color: "#26C6DA", icon: Camera },
  { id: "seg-4", color: "#26A69A", icon: ChartBar },
  { id: "seg-5", color: "#FFB300", icon: Layers },
  { id: "seg-6", color: "#FF7043", icon: Rocket },
  { id: "seg-7", color: "#EC407A", icon: Brush },
  { id: "seg-8", color: "#7E57C2", icon: Camera },
];

export default function CategoryWheelPage({
  categories = CATEGORIES_FROM_DOC,
}) {
  const [activeId, setActiveId] = useState(categories[0]?.id);
  const [page, setPage] = useState(1);
  const perPage = 16;

  // --- Theme state (persisted) ---
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    const prefers = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    )?.matches;
    return !!prefers;
  });
  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // --- Language state (persisted) ---
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("lang") === "ar" ? "ar" : "en";
  });
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("lang", lang);
  }, [lang]);

  // --- Search state ---
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const deferred = useDeferredValue(debounced);
  const inputRef = useRef(null);

  // Debounce 180ms
  useEffect(() => {
    const tmr = setTimeout(() => setDebounced(query), 180);
    return () => clearTimeout(tmr);
  }, [query]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setQuery("");
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeId) || categories[0],
    [activeId, categories]
  );

  const allItems = activeCategory?.subcategories || [];
  const filteredItems = useMemo(
    () => smartFilter(allItems, deferred),
    [allItems, deferred]
  );

  useEffect(() => setPage(1), [debounced, activeId]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / perPage));
  const pageItems = useMemo(
    () => paginate(filteredItems, page, perPage),
    [filteredItems, page]
  );

  // ✅ عدّاد النتائج لكل كاتيجوري وفق البحث الحالي
  const countsByCat = useMemo(() => {
    const out = {};
    for (const c of categories) {
      out[c.id] = smartFilter(c.subcategories, deferred).length;
    }
    return out;
  }, [categories, deferred]);

  const onSelectCategory = (id) => setActiveId(id);
  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <LayoutGroup>
      <div
        className={`min-h-[100dvh] w-full isolate ${
          isDark ? "bg-[#0b1220] text-slate-100" : "bg-white text-slate-800"
        }`}
      >
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 opacity-70"
          style={{
            background: `radial-gradient(40% 40% at 50% 30%, ${activeCategory?.color}22, transparent 100%),
                         radial-gradient(35% 35% at 80% 70%, ${activeCategory?.color}18, transparent 100%),
                         radial-gradient(30% 30% at 20% 80%, #00000010, transparent 100%)`,
            filter: "saturate(110%) blur(0.2px)",
          }}
        />

        {/* HEADER */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:pb-0">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {t(lang, "explore")}{" "}
              <span style={{ color: THEME_PRIMARY }}>
                {t(lang, "categories")}
              </span>
            </h1>

            {/* Mobile language toggle */}
            <div className="md:hidden">
              <LanguageCompactToggle
                lang={lang}
                setLang={setLang}
                isDark={isDark}
                color={activeCategory?.color}
              />
            </div>
          </div>

          <p className="mt-2 text-slate-500 max-w-3xl"></p>
        </div>

        {/* MAIN LAYOUT */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 grid grid-cols-12 gap-6 items-start overflow-x-clip">
          {/* LEFT TITLES — ✅ الآن تفاعلية + عدّاد */}
          <div className="hidden lg:flex lg:col-span-1 flex-col gap-4 pt-10 relative will-change-transform lg:-translate-x-[-90px] lg:translate-y-30">
            {categories.map((cat) => (
              <SideTitle
                key={cat.id}
                title={catTitle(lang, cat.id)}
                subtitle={catDesc(lang, cat.id)}
                align="center"
                color={cat.color}
                active={cat.id === activeId}
                onClick={() => onSelectCategory(cat.id)}
                count={countsByCat[cat.id]}
                lang={lang}
              />
            ))}
          </div>

          {/* WHEEL CENTER */}
          <div className="col-span-12 lg:col-span-10">
            <div className="relative w-full aspect-square max-w-[560px] mx-auto">
              {/* Outer glow */}
              {isDark ? (
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(closest-side, rgba(255,255,255,0) calc(100% - 14px), rgba(255,255,255,0.10) calc(100% - 10px), rgba(255,255,255,0) 100%)",
                    border: "1px solid rgba(148,163,184,0.18)",
                    boxShadow: `
                      0 0 0 1px rgba(148,163,184,.12),
                      0 0 80px ${activeCategory?.color ?? "#028090"}33,
                      0 24px 70px rgba(0,0,0,.55),
                      inset 0 0 26px rgba(255,255,255,.04)
                     `,
                  }}
                  aria-hidden="true"
                />
              ) : (
                <div
                  className="absolute inset-0 rounded-full shadow-[0_20px_80px_rgba(0,0,0,0.12)]"
                  aria-hidden="true"
                />
              )}

              {/* Decorative segments */}
              <RadialRing segments={RING_SEGMENTS} isDark={isDark} />

              {/* Center white hub + spinner */}
              <div
                className={`absolute inset-[18%] rounded-full shadow-inner border ${
                  isDark
                    ? "bg-slate-900/70 border-slate-800"
                    : "bg-white border-slate-100"
                }`}
              />
              <CenterSpinner isDark={isDark} />

              {/* Language Ring Toggle */}
              <div className="hidden md:block">
                <LanguageRingToggle
                  lang={lang}
                  setLang={setLang}
                  isDark={isDark}
                  color={activeCategory?.color}
                  ringInsetPct={38}
                />
              </div>

              {/* Theme Toggle */}
              <ThemeToggle
                isDark={isDark}
                setIsDark={setIsDark}
                color={activeCategory?.color}
                radiusPct={0}
                angleDeg={0}
              />

              {/* Chips */}
              <ActiveCategoriesOnWheel
                categories={categories}
                activeId={activeId}
                onSelectCategory={onSelectCategory}
                isDark={isDark}
                lang={lang}
              />
            </div>

            {/* connector curve */}
            <svg
              className="mx-auto block"
              width="100%"
              height="80"
              viewBox="0 0 800 80"
              aria-hidden
            >
              <defs>
                <filter
                  id="softGlow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur
                    in="SourceGraphic"
                    stdDeviation="2"
                    result="blur"
                  />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M 100 70 Q 400 10 700 70"
                fill="none"
                stroke={activeCategory?.color || "#028090"}
                strokeWidth="2.5"
                opacity="0.35"
                filter="url(#softGlow)"
              />
            </svg>

            {/* SUBCATEGORY PANEL */}
            <AnimatePresence initial={false} mode="wait">
              {activeCategory && (
                <motion.div
                  key={activeCategory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                  className="mt-2"
                  role="region"
                  aria-label="Subcategories panel"
                >
                  {/* BREAKOUT */}
                  <div className="relative left-1/2 -translate-x-1/2 w-[100dvw] overflow-x-hidden">
                    <div className="mx-auto w-full max-w-[1300px] px-2 sm:px-4">
                      <div
                        className={`rounded-2xl border backdrop-blur-sm shadow-sm p-6 md:p-7 ${
                          isDark
                            ? "border-slate-800 bg-slate-900/70"
                            : "border-slate-100 bg-white/80"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3">
                            <CategoryBadge color={activeCategory.color} />
                            <h2 className="text-xl md:text-2xl font-semibold">
                              {catTitle(lang, activeCategory.id)}
                            </h2>
                          </div>
                          <p
                            className={`max-w-2xl text-sm ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {catDesc(lang, activeCategory.id)}
                          </p>
                        </div>

                        {/* SEARCH BAR */}
                        <div className="mt-5">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div
                              className="group relative w-full max-w-xl"
                              role="search"
                              aria-label="Search subcategories"
                            >
                              <label className="pointer-events-none absolute left-10 -top-2 text-xs text-slate-400 transition-all group-focus-within:-top-4 group-focus-within:text-[11px]">
                                {t(lang, "search_label")}
                              </label>
                              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400 pointer-events-none" />
                              <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t(lang, "search_placeholder")}
                                className={`w-full rounded-full border px-10 pr-10 py-3 outline-none ring-0 transition-shadow ${
                                  isDark
                                    ? "border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-400 focus:ring-2"
                                    : "border-slate-200 bg-white focus:border-transparent focus:ring-2"
                                }`}
                                style={{ boxShadow: `0 0 0 0 rgba(0,0,0,0)` }}
                                onFocus={(e) => {
                                  e.currentTarget.style.boxShadow = `0 0 0 4px ${activeCategory.color}22`;
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.boxShadow = `none`;
                                }}
                                aria-controls="subcategory-grid"
                                aria-describedby="search-help"
                              />
                              {query && (
                                <button
                                  type="button"
                                  onClick={clearSearch}
                                  className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 hover:bg-slate-100 ${
                                    isDark
                                      ? "text-slate-300 hover:bg-slate-800"
                                      : "text-slate-500"
                                  }`}
                                  aria-label="Clear search"
                                >
                                  <XIcon className="size-4" />
                                </button>
                              )}
                            </div>

                            <div
                              className={`text-xs md:text-sm ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              <span id="search-help">
                                {t(lang, "showing")}{" "}
                                <strong
                                  className={
                                    isDark ? "text-slate-200" : "text-slate-700"
                                  }
                                >
                                  {filteredItems.length}
                                </strong>{" "}
                                {pluralWord(lang, filteredItems.length)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Grid of subcategories */}
                        {pageItems && pageItems.length > 0 ? (
                          <div
                            id="subcategory-grid"
                            className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                          >
                            {pageItems.map((item) => (
                              <button
                                type="button"
                                key={item.id}
                                className={`group relative rounded-xl overflow-hidden border text-left shadow hover:shadow-md transition-all focus:outline-none focus-visible:ring-2
                                  [content-visibility:auto] [contain:content] [contain-intrinsic-size:256px_210px]
                                  ${
                                    isDark
                                      ? "border-slate-700 bg-slate-900 text-slate-100 focus-visible:ring-slate-700"
                                      : "border-slate-100 bg-white text-slate-800 focus-visible:ring-slate-200"
                                  }`}
                                aria-label={getTitleByLang(item, lang)}
                              >
                                <div
                                  className={`aspect-[4/3] w-full ${
                                    isDark ? "bg-slate-800" : "bg-slate-50"
                                  }`}
                                >
                                  {(() => {
                                    const img = getHiDpiProps(
                                      item.image,
                                      item.image_2x || item.image2x
                                    );
                                    return (
                                      <img
                                        src={img.src}
                                        srcSet={img.srcSet}
                                        sizes={img.sizes}
                                        alt={getTitleByLang(item, lang)}
                                        className="w-full h-full object-cover [image-rendering:auto]"
                                        loading="lazy"
                                        decoding="async"
                                        draggable="false"
                                        style={{
                                          transform: "translateZ(0)",
                                          backfaceVisibility: "hidden",
                                        }}
                                      />
                                    );
                                  })()}
                                </div>
                                <div className="p-3">
                                  <div
                                    className="font-medium line-clamp-1"
                                    aria-label={getTitleByLang(item, lang)}
                                  >
                                    {getTitleByLang(item, lang)}
                                  </div>
                                  <div
                                    className={`text-sm line-clamp-2 ${
                                      isDark
                                        ? "text-slate-400"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    {getDescByLang(item, lang)}
                                  </div>
                                </div>
                                <div
                                  className="absolute inset-x-0 bottom-0 h-1"
                                  style={{
                                    background:
                                      activeCategory?.color || "#028090",
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div
                            className={`mt-10 text-center text-sm ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {t(lang, "no_results")}{" "}
                            <span
                              className={`font-semibold ${
                                isDark ? "text-slate-200" : "text-slate-700"
                              }`}
                            >
                              “{debounced}”
                            </span>
                            .
                          </div>
                        )}

                        {/* Pagination (كما هو عندك) */}
                        <div className="mt-6 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className={`px-3 py-2 rounded-lg border disabled:opacity-40 ${
                              isDark
                                ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                            disabled={page === 1}
                            aria-label="Previous page"
                          >
                            {t(lang, "prev")}
                          </button>

                          {Array.from({ length: totalPages }).map((_, i) => {
                            const isActive = page === i + 1;
                            return (
                              <button
                                type="button"
                                key={`page-${i}`}
                                onClick={() => setPage(i + 1)}
                                className={`px-3 py-2 rounded-lg border text-sm ${
                                  isActive
                                    ? "border-transparent text-white"
                                    : isDark
                                    ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                                }`}
                                style={
                                  isActive
                                    ? {
                                        background:
                                          activeCategory?.color || "#028090",
                                      }
                                    : {}
                                }
                                aria-current={isActive ? "page" : undefined}
                                aria-label={`Page ${i + 1}`}
                              >
                                {i + 1}
                              </button>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() =>
                              setPage((p) => Math.min(totalPages, p + 1))
                            }
                            className={`px-3 py-2 rounded-lg border disabled:opacity-40 ${
                              isDark
                                ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                            disabled={page === totalPages || totalPages === 0}
                            aria-label="Next page"
                          >
                            {t(lang, "next")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT TITLES — ✅ تفاعلية + عدّاد */}
          <div className="hidden lg:flex lg:col-span-1 flex-col gap-4 pt-10 relative will-change-transform lg:translate-x-[-90px] lg:translate-y-30">
            {categories.map((cat) => (
              <SideTitle
                key={cat.id}
                title={catTitle(lang, cat.id)}
                subtitle={catDesc(lang, cat.id)}
                align="center"
                color={cat.color}
                active={cat.id === activeId}
                onClick={() => onSelectCategory(cat.id)}
                count={countsByCat[cat.id]}
                lang={lang}
              />
            ))}
          </div>
        </div>
      </div>
    </LayoutGroup>
  );
}

// ======= Subcomponents =======
function CategoryBadge({ color }) {
  return (
    <span
      className="inline-block h-3 w-3 rounded-full"
      style={{ background: color }}
    />
  );
}
function SideTitle({
  title,
  subtitle,
  color,
  align = "left",
  active = false,
  onClick,
  count,   // ✅ جديد
  lang,    // ✅ جديد
}) {
  const countLabel =
    typeof count === "number"
      ? lang === "ar"
        ? `${count} نتيجة`
        : `${count} results`
      : null;

  return (
    <button
      onClick={onClick}
      className={`group text-center ${
        align === "right" ? "items-center" : "items-center"
      } flex flex-col gap-1`}
      aria-pressed={active}
    >
      <div
        className={`text-sm font-semibold tracking-wide flex items-center gap-2 ${
          active ? "text-slate-900" : "text-slate-500"
        }`}
      >
        {align === "left" ? (
          <ChevronRight className="size-4 opacity-30 group-hover:opacity-60" />
        ) : null}
        <span
          className="hover:underline decoration-slate-300 decoration-2 underline-offset-4"
          style={{
            color,
            textShadow: `0 0 .6px ${color}66, 0 0 12px ${color}22`,
          }}
        >
          {title}
        </span>

        {/* ✅ بادج عدد النتائج (خفيفة جدًا، لا تغيّر الستايل) */}
        {typeof count === "number" && (
          <span
            className="ml-1 inline-flex items-center justify-center rounded-full px-2 py-[2px] text-[10px]"
            style={{
              color: active ? "#fff" : "#64748B",
              background: active ? color : "rgba(148,163,184,.15)",
              boxShadow: active ? `0 0 12px ${color}33` : "none",
            }}
            aria-label={countLabel || undefined}
            title={countLabel || undefined}
          >
            {count}
          </span>
        )}

        {align === "right" ? (
          <ChevronRight className="size-4 opacity-30 group-hover:opacity-60" />
        ) : null}
      </div>
      <div className="text-xs text-slate-400 line-clamp-2 max-w-[15ch]">
        {subtitle}
      </div>
    </button>
  );
}
function RadialRing({ segments, isDark }) {
  const cx = 50,
    cy = 50,
    radius = 44;
  return (
    <div className="absolute inset-0">
      {segments.map((seg, idx) => {
        const angle = (idx / segments.length) * 360;
        const { x, y } = polarToCartesian(cx, cy, radius, angle);
        const Icon = seg.icon;
        return (
          <motion.div
            key={seg.id}
            initial={{ scale: 0, opacity: 0, left: `${x}%`, top: `${y}%` }}
            animate={{ scale: 1, opacity: 1, left: `${x}%`, top: `${y}%` }}
            transition={{
              delay: 0.04 * idx,
              type: "spring",
              stiffness: 110,
              damping: 12,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 will-change-transform"
          >
            <div
              className={`size-16 md:size-20 rounded-2xl shadow-lg grid place-items-center border ${
                isDark ? "border-slate-700" : "border-white/40"
              }`}
              style={{ background: seg.color }}
            >
              <Icon className="size-7 text-white" />
            </div>
          </motion.div>
        );
      })}
      {/* inner rings */}
      <div
        className={`absolute inset-[10%] rounded-full backdrop-blur border ${
          isDark
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white/80 border-slate-100"
        }`}
      />
      <div
        className={`absolute inset-[28%] rounded-full shadow-lg border ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
        }`}
      />
    </div>
  );
}
function ActiveCategoriesOnWheel({
  categories,
  activeId,
  onSelectCategory,
  isDark,
  lang,
}) {
  const baseAngles = [350, 110, 230];
  const cx = 50,
    cy = 50,
    radius = 33;
  const targetAngle = 90;
  const activeIndex = Math.max(
    0,
    categories.findIndex((c) => c.id === activeId)
  );
  const offset = targetAngle - baseAngles[activeIndex];

  return (
    <div className="absolute inset-0 z-10">
      {categories.map((c, i) => {
        const angle = baseAngles[i] + offset;
        const { x, y } = polarToCartesian(cx, cy, radius, angle);
        const Icon = c.icon || PenTool;
        const active = activeId === c.id;

        return (
          <motion.button
            key={c.id}
            onClick={() => onSelectCategory(c.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`absolute -translate-x-1/2 -translate-y-1/2
              rounded-xl px-3 py-2.5 text-[13px] border shadow whitespace-nowrap font-semibold  /* موبايل */
              md:rounded-2xl md:px-4 md:py-3 md:text-[15px]                                      /* من md وفوق */
              ${
                active
                  ? "text-white"
                  : isDark
                  ? "bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
              }`}
            initial={{ left: `${x}%`, top: `${y}%` }}
            animate={{ left: `${x}%`, top: `${y}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
            style={
              active
                ? { background: c.color, borderColor: "transparent" }
                : undefined
            }
            aria-pressed={active}
          >
            <span className="inline-flex items-center gap-1.5 md:gap-2">
              <Icon
                className={`w-4 h-4 md:w-5 md:h-5 shrink-0 ${
                  active ? "text-white" : "text-slate-600"
                }`}
              />
              <span className="whitespace-nowrap">{catTitle(lang, c.id)}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
function CenterSpinner({ isDark }) {
  return (
    <>
      <motion.div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-dashed z-10 ${
          isDark ? "border-slate-600/60" : "border-slate-300/70"
        }`}
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full z-10 ${
          isDark ? "bg-slate-600/60" : "bg-slate-300/60"
        }`}
      />
    </>
  );
}

/** =======================
 *  Language Ring Toggle
 *  ======================= */
function LanguageRingToggle({
  lang,
  setLang,
  isDark,
  color,
  ringInsetPct = 16,
}) {
  const radiusPct = 50 - ringInsetPct;
  const ANGLES = { en: 320, ar: 140 };
  const knobPos = polarToCartesian(50, 50, radiusPct, ANGLES[lang]);
  const arLabel = polarToCartesian(50, 50, radiusPct, 180);
  const enLabel = polarToCartesian(50, 50, radiusPct, 0);

  const ringBorder = isDark ? "border-slate-600/60" : "border-slate-300/70";
  const txtOff = isDark ? "text-slate-400" : "text-slate-500";
  const txtOn = isDark ? "text-slate-100" : "text-slate-900";

  return (
    <>
      <div
        className={`absolute z-10 rounded-full border-2 border-dashed pointer-events-none ${ringBorder}`}
        style={{
          left: `${ringInsetPct}%`,
          top: `${ringInsetPct}%`,
          right: `${ringInsetPct}%`,
          bottom: `${ringInsetPct}%`,
          boxShadow: `0 12px 30px ${color ?? "#028090"}22`,
        }}
        aria-hidden="true"
      />
      <div
        className={`absolute -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold ${txtOff}`}
        style={{ left: `${arLabel.x}%`, top: `${arLabel.y}%` }}
        aria-hidden="true"
      >
        AR
      </div>
      <div
        className={`absolute -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold ${txtOff}`}
        style={{ left: `${enLabel.x}%`, top: `${enLabel.y}%` }}
        aria-hidden="true"
      >
        EN
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setLang((l) => (l === "en" ? "ar" : "en"))}
        className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full px-2.5 py-1.5 shadow-lg border grid place-items-center`}
        style={{
          left: `${knobPos.x}%`,
          top: `${knobPos.y}%`,
          background: isDark
            ? "linear-gradient(180deg, rgba(15,23,42,.95), rgba(2,6,23,.95))"
            : "linear-gradient(180deg, rgba(255,255,255,.98), rgba(248,250,252,.98))",
          borderColor: isDark ? "#334155" : "#E2E8F0",
          boxShadow: `0 8px 24px ${color ?? "#028090"}33`,
        }}
        aria-label="Toggle language"
        aria-pressed={lang === "ar"}
      >
        <span className={`inline-flex items-center gap-1.5 text-xs ${txtOn}`}>
          <Globe className="size-3.5" />
          {lang.toUpperCase()}
        </span>
      </motion.button>
    </>
  );
}

function ThemeToggle({
  isDark,
  setIsDark,
  color,
  radiusPct = 27,
  angleDeg = 90,
}) {
  const { x, y } = polarToCartesian(50, 50, radiusPct, angleDeg);
  return (
    <motion.button
      type="button"
      onClick={() => setIsDark((v) => !v)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      aria-label="Toggle theme"
      className={`z-20 absolute -translate-x-1/2 -translate-y-1/2 size-12 grid place-items-center rounded-full border shadow-lg backdrop-blur-md ${
        isDark ? "border-slate-700" : "border-slate-200"
      }`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        background: isDark
          ? "linear-gradient(180deg, rgba(15,23,42,.88), rgba(2,6,23,.88))"
          : "linear-gradient(180deg, rgba(255,255,255,.95), rgba(248,250,252,.95))",
        boxShadow: `0 6px 20px ${color ?? "#028090"}33`,
      }}
    >
      <motion.div
        key={isDark ? "moon" : "sun"}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        {isDark ? (
          <Sun className="size-5 text-amber-300" />
        ) : (
          <Moon className="size-5 text-slate-700" />
        )}
      </motion.div>
      <span className="sr-only">Toggle Theme</span>
    </motion.button>
  );
}

function LanguageCompactToggle({ lang, setLang, isDark, color }) {
  return (
    <button
      type="button"
      onClick={() => setLang((l) => (l === "en" ? "ar" : "en"))}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border shadow-sm transition-colors
        ${
          isDark
            ? "bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800"
            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
      style={{ boxShadow: `0 6px 18px ${color ?? "#028090"}22` }}
      aria-label="Toggle language"
      aria-pressed={lang === "ar"}
    >
      <Globe className="size-4" />
      <span className="font-semibold">{lang.toUpperCase()}</span>
    </button>
  );
}
