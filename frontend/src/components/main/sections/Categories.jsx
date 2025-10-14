import { useMemo, useState, useEffect, useCallback } from "react";

// Colors
const primary = "rgb(2, 128, 144)";
const primaryDark = "rgb(0, 90, 100)";
const primaryLight = "rgb(0, 170, 180)";

// Breakpoints
function calcCols() {
  if (typeof window === "undefined") return 5;
  if (window.matchMedia("(min-width: 1280px)").matches) return 3; // xl
  if (window.matchMedia("(min-width: 1024px)").matches) return 3; // lg
  if (window.matchMedia("(min-width: 768px)").matches) return 3; // md
  if (window.matchMedia("(min-width: 640px)").matches) return 2; // sm
  return 1; // < sm
}

// Component
export default function CategoriesShowcase({
  title = "Popular services",
  categories = [],
  onSelect,
  pageSize = 5,
  loop = false,
}) {
  // Fetch categories from API
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        // Fetch from backend on port 5000
        const response = await fetch("http://localhost:5000/category");

        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check content type
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(
            `Expected JSON, got ${contentType}. The endpoint might not exist or is returning HTML.`
          );
        }

        const data = await response.json();

        // Debug: Log the raw data from API
        console.log("Raw API Response:", data);
        console.log("First category:", data.categories?.[0]);

        if (data.success && data.categories) {
          // Map database fields to component format
          const mappedCategories = data.categories.map((cat) => {
            console.log(
              "Mapping category:",
              cat.name,
              "image_url:",
              cat.image_url
            );
            return {
              id: cat.id,
              name: cat.name,
              description: cat.description,
              image:
                cat.image_url ||
                "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=70&auto=format&fit=crop",
              tags: cat.related_words || [],
              count: null,
            };
          });
          console.log("Mapped categories:", mappedCategories);
          setFetchedCategories(mappedCategories);
        } else {
          throw new Error("Invalid response format from API");
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Use fetched categories if available, otherwise fall back to prop categories
  const allCategories =
    fetchedCategories.length > 0 ? fetchedCategories : categories;

  // Slice
  const cats = useMemo(() => allCategories.slice(0, 10), [allCategories]);

  // Columns
  const [cols, setCols] = useState(calcCols());
  const effPageSize = Math.min(pageSize, cols);

  // Watchers
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

  // Pagination
  const totalPages = Math.max(1, Math.ceil(cats.length / effPageSize));
  const [page, setPage] = useState(0);

  // Clamp
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages - 1));
  }, [totalPages]);

  // Animation
  const D = 250;
  const [anim, setAnim] = useState({
    opacity: 1,
    transform: "translateX(0px)",
  });

  // Transition
  const animateTo = (newPage, dir = "next") => {
    setAnim({
      opacity: 0,
      transform: `translateX(${dir === "next" ? -24 : 24}px)`,
    });
    setTimeout(() => {
      setPage(newPage);
      setAnim({
        opacity: 0,
        transform: `translateX(${dir === "next" ? 24 : -24}px)`,
      });
      requestAnimationFrame(() =>
        setAnim({ opacity: 1, transform: "translateX(0px)" })
      );
    }, D);
  };

  // Handlers
  const goNext = useCallback(() => {
    if (page + 1 < totalPages) animateTo(page + 1, "next");
    else if (loop) animateTo(0, "next");
  }, [page, totalPages, loop]);

  const goPrev = useCallback(() => {
    if (page - 1 >= 0) animateTo(page - 1, "prev");
    else if (loop) animateTo(totalPages - 1, "prev");
  }, [page, totalPages, loop]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  // Visible
  const visible = useMemo(() => {
    const start = page * effPageSize;
    return cats.slice(start, start + effPageSize);
  }, [cats, page, effPageSize]);

  // Grid
  const grid = `grid gap-4 sm:gap-5 justify-items-center
  ${cols === 1 ? "grid-cols-1" : ""}
  ${cols === 2 ? "sm:grid-cols-2" : ""}
  ${cols === 3 ? "md:grid-cols-3" : ""}
  ${cols === 4 ? "lg:grid-cols-4" : ""}
  ${cols >= 5 ? "xl:grid-cols-5" : ""}
`;

  return (
    // Section
    <section className="relative py-10 sm:py-14 md:py-16 px-6 sm:px-5 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto relative">
        {/* Header (centered) */}
        <div className="mb-8 sm:mb-10 text-center">
          <h2
            className="
              text-[rgb(2,128,144)]
              antialiased font-extrabold tracking-tight leading-tight
              text-2xl sm:text-3xl md:text-4xl 
              drop-shadow-[0_1px_0_rgba(255,255,255,0.85)]
              md:drop-shadow-[0_1px_0_rgba(255,255,255,0.85),0_8px_24px_rgba(2,128,144,0.28)]
            "
          >
            {title}
          </h2>

          <p
            className="
              antialiased mt-3 max-w-3xl mx-auto
              text-sm sm:text-base text-slate-700/95
              drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]
            "
          >
            Hand-picked categories to get your project done right.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[rgb(2,128,144)] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600">Loading categories...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load categories: {error}</p>
          </div>
        )}

        {/* Content - only show when not loading and no error */}
        {!loading && !error && cats.length > 0 && (
          <>
            {/* Mobile */}
            <div className="md:hidden">
              <div className="relative">
                <div
                  className="
                    flex gap-4 overflow-x-auto pb-2
                    snap-x snap-mandatory
                    [-ms-overflow-style:none] [scrollbar-width:none]
                  "
                  style={{ scrollBehavior: "smooth" }}
                >
                  <style>{`.snap-x::-webkit-scrollbar { display: none; }`}</style>
                  {cats.map((cat) => (
                    <div
                      key={cat.id}
                      className="snap-start shrink-0 w-[85%] xs:w-[80%] sm:w-[70%]"
                    >
                      <Card
                        cat={cat}
                        onClick={() => onSelect && onSelect(cat)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden md:block">
  <div className="flex justify-center">
    <div
      className={`${
        visible.length < cols
          ? "flex flex-wrap justify-center gap-4 sm:gap-5 items-stretch"
          : grid + " items-stretch"
      }`}
      style={{
        transition: `opacity ${D}ms ease, transform ${D}ms ease`,
        ...anim,
      }}
    >
      {visible.map((cat) => (
        <div key={cat.id} className="w-[300px]">
          <Card cat={cat} onClick={() => onSelect && onSelect(cat)} />
        </div>
      ))}
    </div>
  </div>

  {/* Controls */}  
  {totalPages > 1 && (
    <NavButtons
      onPrev={goPrev}
      onNext={goNext}
      hasPrev={loop || page > 0}
      hasNext={loop || page < totalPages - 1}
    />
  )}

  {/* Dots */}  
  {totalPages > 1 && (
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
  )}
</div>

          </>
        )}

        {/* Empty state */}
        {!loading && !error && cats.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">No categories available</p>
          </div>
        )}
      </div>

      {/* Styles */}
      <style>{`
        .card-spotlight::before {
          content: "";
          position: absolute; inset: 0; border-radius: 1.5rem;
          background: radial-gradient(250px circle at var(--x) var(--y), rgba(255,255,255,.22), transparent 40%);
          opacity: 0; pointer-events: none; transition: opacity .25s ease;
        }
        .card-spotlight:hover::before { opacity: 1; }
      `}</style>
    </section>
  );
}

// Buttons
function NavButtons({ onPrev, onNext, hasPrev, hasNext }) {
  const baseBtn =
    "absolute top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg ring-1 ring-black/5 hover:shadow-xl transition disabled:opacity-40 disabled:cursor-not-allowed";
  return (
    <>
      <button
        aria-label="Previous"
        className={`${baseBtn} left-[-8px] sm:left-[-12px] hidden md:inline-flex`}
        onClick={onPrev}
        disabled={!hasPrev}
      >
        <ChevronLeft />
      </button>
      <button
        aria-label="Next"
        className={`${baseBtn} right-[-8px] sm:right-[-12px] hidden md:inline-flex`}
        onClick={onNext}
        disabled={!hasNext}
      >
        <ChevronRight />
      </button>
    </>
  );
}

// Icons
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

// Card
function Card({ cat, onClick }) {
  return (
    <div
      className="
        group relative rounded-2xl p-[1.5px] cursor-pointer
        transform-gpu will-change-transform
        transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)]
        hover:-translate-y-1 hover:scale-[1.01]
        shadow-[0_4px_10px_rgba(2,128,144,0.15),0_2px_5px_rgba(0,0,0,0.08)]
        hover:shadow-[0_12px_24px_rgba(2,128,144,0.28),0_6px_12px_rgba(0,0,0,0.18)]
        h-full
      "
      style={{
        background: `conic-gradient(from 150deg at 50% 50%, ${primaryLight}, ${primary}, ${primaryDark}, ${primaryLight})`,
      }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      onClick={onClick}
    >
      <div className="relative rounded-[calc(1rem-2px)] bg-white/90 backdrop-blur-sm h-full card-spotlight flex flex-col">
        {/* Band */}
        <div
          className="rounded-t-[calc(1rem-2px)] px-3 pt-3 pb-12 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(160deg, rgb(0,70,80) 0%, rgb(2,128,144) 60%, rgb(0,100,110) 100%)`,
          }}
        >
          <div
            className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-20 blur-2xl"
            style={{ background: primaryLight }}
          />
          <div className="relative z-10 grid grid-cols-[1fr_auto] items-start gap-3 h-[40px]">
            <h3
              className="font-bold text-base leading-tight line-clamp-2 pr-1"
              title={cat.name}
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {cat.name}
            </h3>
            {typeof cat.count === "number" && cat.count > 0 && (
              <span className="ml-0 inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[10px] tracking-wide whitespace-nowrap shrink-0">
                {cat.count.toLocaleString()} jobs
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail */}
        <div className="relative -mt-10 px-3">
          <div className="aspect-[16/10] w-full rounded-xl overflow-hidden ring-1 ring-black/5 bg-slate-100">
            <img
              src={cat.image}
              alt={cat.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              loading="lazy"
            />
          </div>
        </div>

        {/* Details */}
        <div className="p-3 flex flex-col min-h-[140px]">
          <p
            className="text-sm text-slate-600"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {cat.description}
          </p>

          {cat.tags && cat.tags.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5 min-h-[24px]">
              {cat.tags.map((t, idx) => (
                <span
                  key={idx}
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
              className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-white opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 text-sm"
              style={{ backgroundColor: primary }}
              onClick={onClick}
            >
              Explore
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M12.293 4.293a1 1 0 011.414 0L18 8.586a2 2 0 010 2.828l-4.293 4.293a1 1 0 01-1.414-1.414L14.586 11H4a1 1 0 110-2h10.586l-2.293-2.293a1 1 0 010-1.414z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
