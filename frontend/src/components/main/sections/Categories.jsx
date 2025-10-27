import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const primary = "rgb(2, 128, 144)";
const primaryDark = "rgb(0, 90, 100)";
const primaryLight = "rgb(0, 170, 180)";

function calcCols() {
  if (typeof window === "undefined") return 5;
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
  pageSize = 5,
  loop = false,
}) {
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("http://localhost:5000/category");

        if (data.success && data.data) {
          const mappedCategories = data.data.map((cat) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            image:
              cat.image_url ||
              "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=70&auto=format&fit=crop",
            tags: cat.related_words || [],
            count: null,
          }));
          setFetchedCategories(mappedCategories);
        } else {
          throw new Error("Invalid response format from API");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const allCategories = fetchedCategories.length ? fetchedCategories : categories;
  const cats = useMemo(() => allCategories.slice(0, 10), [allCategories]);

  const [cols, setCols] = useState(calcCols());
  const effPageSize = Math.min(pageSize, cols);

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

  const totalPages = Math.max(1, Math.ceil(cats.length / effPageSize));
  const [page, setPage] = useState(0);
  useEffect(() => setPage((p) => Math.min(p, totalPages - 1)), [totalPages]);

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

  const grid = `grid gap-4 sm:gap-5 justify-items-center
    ${cols === 1 ? "grid-cols-1" : ""}
    ${cols === 2 ? "sm:grid-cols-2" : ""}
    ${cols === 3 ? "md:grid-cols-3" : ""}
    ${cols === 4 ? "lg:grid-cols-4" : ""}
    ${cols >= 5 ? "xl:grid-cols-5" : ""}
  `;

  const D = 180;
  const anim = { opacity: 1, transform: "translateY(0)" };

  return (
    <section className="relative py-10 sm:py-14 md:py-16 px-6 sm:px-5 lg:px-8 bg-white">
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
            <div className="inline-block w-8 h-8 border-4 border-[rgb(2,128,144)] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600">Loading categories.</p>
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
            <div className="md:hidden">
              <div
                className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none]"
                style={{ scrollBehavior: "smooth" }}
              >
                <style>{`.snap-x::-webkit-scrollbar { display: none; }`}</style>
                {cats.map((cat) => (
                  <div key={cat.id} className="snap-start shrink-0 w-[85%] xs:w-[80%] sm:w-[70%]">
                    <Card cat={cat} onClick={() => handleSelect(cat)} />
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden md:block">
              <div className="flex justify-center">
                <div
                  className={`${
                    visible.length < cols
                      ? "flex flex-wrap justify-center gap-4 sm:gap-5 items-stretch"
                      : grid + " items-stretch"
                  }`}
                  style={{ transition: `opacity ${D}ms ease, transform ${D}ms ease`, ...anim }}
                >
                  {visible.map((cat) => (
                    <div key={cat.id} className="w-[300px]">
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
                  <div className="mt-6 flex items-center justify-center gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          i === page ? "w-6 bg-[rgb(2,128,144)]" : "w-2 bg-slate-300"
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
      className="group relative rounded-2xl p-[1.5px] cursor-pointer transition-all duration-200 h-full"
      style={{ background: `linear-gradient(160deg, ${primaryLight}, ${primary})` }}
      onClick={onClick}
    >
      <div className="relative rounded-[calc(1rem-2px)] bg-white h-full flex flex-col shadow-sm hover:shadow-md transition">
        <div
          className="rounded-t-[calc(1rem-2px)] px-3 pt-3 pb-12 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(160deg, ${primaryDark} 0%, ${primary} 70%, ${primaryDark} 100%)` }}
        >
          <div
            className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-15 blur-2xl"
            style={{ background: primaryLight }}
          />
          <div className="relative z-10 grid grid-cols-[1fr_auto] items-start gap-3 h-[40px]">
            <h3 className="font-bold text-base leading-tight line-clamp-2 pr-1" title={cat.name}>
              {cat.name}
            </h3>
            {typeof cat.count === "number" && cat.count > 0 && (
              <span className="ml-0 inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[10px] tracking-wide whitespace-nowrap shrink-0">
                {cat.count.toLocaleString()} jobs
              </span>
            )}
          </div>
        </div>

        <div className="relative -mt-10 px-3">
          <div className="aspect-[16/10] w-full rounded-xl overflow-hidden ring-1 ring-black/5 bg-slate-100">
            <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>

        <div className="p-3 flex flex-col min-h-[140px]">
          <p className="text-sm text-slate-600 line-clamp-2">{cat.description}</p>

          {cat.tags?.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5 min-h-[24px]">
              {cat.tags.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <div className="min-h-[24px]" />
          )}

          <div className="flex-1" />

          <div className="mt-2">
            <button
              className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-white text-sm"
              style={{ backgroundColor: primary }}
              onClick={onClick}
            >
              Explore
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M12.293 4.293a1 1 0 011.414 0L18 8.586a2 2 0 010 2.828l-4.293 4.293a1 1 0 01-1.414-1.414L14.586 11H4a1 1 0 110-2h10.586l-2.293-2.293a1 1 0 010-1.414z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
