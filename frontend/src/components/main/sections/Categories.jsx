import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const primary = "rgb(2, 128, 144)";
const primaryDark = "rgb(0, 90, 100)";
const primaryLight = "rgb(0, 170, 180)";

function calcCols() {
  if (typeof window === "undefined") return 3;
  if (window.matchMedia("(min-width: 1280px)").matches) return 3;
  if (window.matchMedia("(min-width: 1024px)").matches) return 3;
  if (window.matchMedia("(min-width: 768px)").matches) return 3;
  if (window.matchMedia("(min-width: 640px)").matches) return 2;
  return 1;
}

export default function CategoriesShowcase({
  title = "Popular services",
  categories = [],
  onSelect,
  pageSize = 6,
  loop = false,
}) {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_APP_API_URL;

  const handleSelect = useCallback(
    (cat) => {
      try {
        onSelect?.(cat);
      } catch {}
      navigate(`/projectsPage?cat=${encodeURIComponent(cat.id)}`);
    },
    [onSelect, navigate]
  );

  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await axios.get(`${API_BASE}/category`);
        if (!data?.success || !data?.data) throw new Error("Invalid response format from API");

        const mappedCategories = data.data.map((cat) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          image: cat.name?.toLowerCase().includes("design")
            ? "/categories/design.png"
            : cat.name?.toLowerCase().includes("content")
            ? "/categories/content-writting.png"
            : cat.name?.toLowerCase().includes("develop")
            ? "/categories/development.png"
            : "/categories/design.png",
          tags: cat.related_words || [],
          count: null,
        }));

        setFetchedCategories(mappedCategories);
      } catch (err) {
        setError(err?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [API_BASE]);

  const allCategories = fetchedCategories.length ? fetchedCategories : categories;
  const cats = useMemo(() => allCategories.slice(0, 12), [allCategories]);

  // Responsive cols
  const [cols, setCols] = useState(calcCols());
  useEffect(() => {
    const mds = [
      window.matchMedia("(min-width: 1280px)"),
      window.matchMedia("(min-width: 1024px)"),
      window.matchMedia("(min-width: 768px)"),
      window.matchMedia("(min-width: 640px)"),
    ];
    const update = () => setCols(calcCols());
    mds.forEach((m) => m.addEventListener("change", update));
    update();
    return () => mds.forEach((m) => m.removeEventListener("change", update));
  }, []);

  const effPageSize = Math.max(1, Math.min(pageSize, cols * 2)); // show more on desktop
  const totalPages = Math.max(1, Math.ceil(cats.length / effPageSize));
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages - 1));
  }, [totalPages]);

  const goNext = useCallback(() => {
    if (page + 1 < totalPages) setPage(page + 1);
    else if (loop) setPage(0);
  }, [page, totalPages, loop]);

  const goPrev = useCallback(() => {
    if (page - 1 >= 0) setPage(page - 1);
    else if (loop) setPage(totalPages - 1);
  }, [page, totalPages, loop]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const visible = useMemo(() => {
    const start = page * effPageSize;
    return cats.slice(start, start + effPageSize);
  }, [cats, page, effPageSize]);

  const grid = `grid gap-5 justify-items-center
    ${cols === 1 ? "grid-cols-1" : ""}
    ${cols === 2 ? "sm:grid-cols-2" : ""}
    ${cols === 3 ? "md:grid-cols-3" : ""}
  `;
  
  return (
   <section className>
      <StyleTag />

      {/* soft background blobs */}
      {/* <div className="pointer-events-none absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full opacity-20 blur-3xl jtk-bg1" /> */}
      {/* <div className="pointer-events-none absolute -bottom-32 -right-32 w-[460px] h-[460px] rounded-full opacity-20 blur-3xl jtk-bg2" /> */}

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <h2 className="text-[rgb(2,128,144)] font-extrabold tracking-tight leading-tight text-2xl sm:text-3xl md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-3xl mx-auto text-sm sm:text-base text-slate-700/95">
            Hand-picked categories to get your project done right.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-9 h-9 border-4 border-[rgb(2,128,144)] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600">Loading categories...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load categories: {error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && cats.length > 0 && (
          <>
            {/* Mobile: savage carousel */}
            <div className="md:hidden relative">
            

              <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] px-1">
                <style>{`.snap-x::-webkit-scrollbar { display: none; }`}</style>
                {cats.map((cat) => (
                  <div key={cat.id} className="snap-start shrink-0 w-[88%] sm:w-[72%]">
                    <Card cat={cat} onClick={() => handleSelect(cat)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop: grid + pagination */}
            <div className="hidden md:block">
              <div className="flex justify-center">
                <div className={`${grid} items-stretch`} style={{ transition: "opacity 180ms ease" }}>
                  {visible.map((cat) => (
                    <div key={cat.id} className="w-[340px]">
                      <Card cat={cat} onClick={() => handleSelect(cat)} />
                    </div>
                  ))}
                </div>
              </div>

              {totalPages > 1 && (
                <>
                  <NavButtons
                    onPrev={goPrev}
                    onNext={goNext}
                    hasPrev={loop || page > 0}
                    hasNext={loop || page < totalPages - 1}
                  />
                  <div className="mt-7 flex items-center justify-center gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        aria-label={`Go to page ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all ${
                          i === page ? "w-7 bg-[rgb(2,128,144)]" : "w-2 bg-slate-300 hover:bg-slate-400"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {!loading && !error && cats.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">No categories available</p>
          </div>
        )}
      </div>
    </section>
  );
}

function NavButtons({ onPrev, onNext, hasPrev, hasNext }) {
  const baseBtn =
    "absolute top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white shadow ring-1 ring-black/5 transition disabled:opacity-40 disabled:cursor-not-allowed";
  return (
    <>
      <button
        aria-label="Previous"
        className={`${baseBtn} left-[-8px] sm:left-[-12px] hidden md:inline-flex`}
        onClick={onPrev}
        disabled={!hasPrev}
        title="Previous"
      >
        <ChevronLeft />
      </button>
      <button
        aria-label="Next"
        className={`${baseBtn} right-[-8px] sm:right-[-12px] hidden md:inline-flex`}
        onClick={onNext}
        disabled={!hasNext}
        title="Next"
        style={{ color: primary }}
      >
        <ChevronRight />
      </button>
    </>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5 text-slate-600">
      <path
        d="M7.5 4.5l5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ChevronLeft() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5 text-slate-600">
      <path
        d="M12.5 4.5l-5 5 5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Card({ cat, onClick }) {
  return (
    <div
      onClick={onClick}
      className="jtk-card group relative cursor-pointer select-none h-full"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      aria-label={`Open ${cat.name}`}
    >
      <div className="jtk-border absolute inset-0 rounded-3xl" />

      <div className="relative rounded-3xl bg-white/95 backdrop-blur-xl overflow-hidden shadow-[0_20px_60px_-30px_rgba(0,0,0,.35)] h-full flex flex-col">
        {/* Header */}
        <div className="relative px-4 pt-4 pb-12 text-white overflow-hidden">
          <div className="absolute inset-0 jtk-hero" />
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-40 jtk-blob" />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-extrabold tracking-tight text-base sm:text-lg leading-tight line-clamp-2" title={cat.name}>
                {cat.name}
              </h3>
              <p className="mt-1 text-[11px] text-white/80 line-clamp-1">
                Premium category • Tap to explore
              </p>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="relative -mt-9 px-4">
          <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden ring-1 ring-black/5 bg-slate-900">
            <img src={cat.image} alt={cat.name} className="h-full w-full object-cover jtk-img" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />
            <div className="jtk-shine absolute inset-0" />
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-sm text-slate-600 line-clamp-2">
            {cat.description || "High quality services with premium freelancers."}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 min-h-[28px]">
            {(cat.tags || []).slice(0, 4).map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="flex-1" />

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Explore now <span className="ml-1 inline-block jtk-dot">•</span> <span className="ml-1">Fast</span>
            </div>

            <button
              className="jtk-btn inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-white text-sm font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              Explore
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M12.293 4.293a1 1 0 011.414 0L18 8.586a2 2 0 010 2.828l-4.293 4.293a1 1 0 01-1.414-1.414L14.586 11H4a1 1 0 110-2h10.586l-2.293-2.293a1 1 0 010-1.414z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="h-1.5 w-full bg-gradient-to-r from-[rgb(0,170,180)] via-[rgb(2,128,144)] to-[rgb(0,90,100)]" />
      </div>
    </div>
  );
}

function StyleTag() {
  return (
    <style>{`
      .jtk-bg1{ background: radial-gradient(circle at 30% 30%, rgba(0,170,180,.9), transparent 60%); }
      .jtk-bg2{ background: radial-gradient(circle at 70% 70%, rgba(2,128,144,.9), transparent 60%); }

      .jtk-card { transform-style: preserve-3d; transition: transform 220ms ease, filter 220ms ease; will-change: transform; }
      .jtk-card:hover { transform: translateY(-6px) scale(1.01); filter: saturate(1.05); }

      .jtk-border { background: linear-gradient(140deg, rgba(0,170,180,.9), rgba(2,128,144,.9), rgba(0,90,100,.9)); opacity: .85; }
      .jtk-hero{
        background:
          radial-gradient(1200px 400px at 20% 20%, rgba(0,170,180,.55), transparent 55%),
          radial-gradient(900px 400px at 80% 10%, rgba(2,128,144,.55), transparent 55%),
          linear-gradient(160deg, rgba(0,90,100,1), rgba(2,128,144,1));
      }
      .jtk-blob{ background: rgba(0,170,180,.55); }

      .jtk-img{ transition: transform 420ms ease, filter 420ms ease; }
      .jtk-card:hover .jtk-img{ transform: scale(1.08); filter: contrast(1.05); }

      .jtk-shine{
        background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,.18) 18%, transparent 38%);
        transform: translateX(-120%);
        transition: transform 650ms ease;
        mix-blend-mode: overlay;
      }
      .jtk-card:hover .jtk-shine{ transform: translateX(120%); }

      .jtk-btn{
        background: linear-gradient(160deg, rgb(0,170,180), rgb(2,128,144), rgb(0,90,100));
        box-shadow: 0 14px 30px -18px rgba(0,0,0,.55);
        transition: transform 180ms ease, box-shadow 180ms ease;
      }
      .jtk-btn:hover{
        transform: translateY(-1px);
        box-shadow: 0 18px 36px -18px rgba(0,0,0,.65);
      }

      .jtk-dot{ color: rgb(2,128,144); }
    `}</style>
  );
}
