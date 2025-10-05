// Imports
import { useMemo, useState, useEffect, useCallback } from "react";

// Colors
const primary = "rgb(2, 128, 144)";
const primaryDark = "rgb(0, 90, 100)";
const primaryLight = "rgb(0, 170, 180)";

// Breakpoints
function calcCols() {
  if (typeof window === "undefined") return 5;
  if (window.matchMedia("(min-width: 1280px)").matches) return 5; // xl
  if (window.matchMedia("(min-width: 1024px)").matches) return 4; // lg
  if (window.matchMedia("(min-width: 768px)").matches) return 3; // md
  if (window.matchMedia("(min-width: 640px)").matches) return 2; // sm
  return 1; // < sm
}

// Component
export default function Categories({
  title = "Popular services",
  categories = SAMPLE,
  onSelect,
  pageSize = 5,
  loop = false,
}) {
  // Slice
  const cats = useMemo(() => categories.slice(0, 10), [categories]);

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
  const grid =
    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5";

  return (
    // Section
    <section className="relative py-10 sm:py-14 md:py-16 px-3 sm:px-5 lg:px-8 bg-white">
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
                  <Card cat={cat} onClick={() => onSelect && onSelect(cat)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block">
          <div
            className={grid}
            style={{
              transition: `opacity ${D}ms ease, transform ${D}ms ease`,
              ...anim,
            }}
          >
            {visible.map((cat) => (
              <Card
                key={cat.id}
                cat={cat}
                onClick={() => onSelect && onSelect(cat)}
              />
            ))}
          </div>

          {/* Controls */}
          <NavButtons
            onPrev={goPrev}
            onNext={goNext}
            hasPrev={loop || page > 0}
            hasNext={loop || page < totalPages - 1}
          />

          {/* Dots */}
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
        </div>
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
      <div className="relative rounded-[calc(1rem-2px)] bg-white/90 backdrop-blur-sm h-full card-spotlight">
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
          <div className="relative z-10 grid grid-cols-[1fr_auto] items-start gap-3 h-[78px]">
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
            {typeof cat.count === "number" && (
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
        <div className="p-3">
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

          {!!(cat.tags && cat.tags.length) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {cat.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3">
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

// Dataset
const SAMPLE = [
  {
    id: "web",
    name: "Website Development",
    description:
      "Landing pages, e-commerce, and bespoke websites built with React, Next.js and modern stacks.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=70&auto=format&fit=crop",
    tags: ["React", "Next.js", "E-commerce"],
    count: 324,
  },
  {
    id: "design",
    name: "UI/UX & Product Design",
    description:
      "Wireframes, design systems, and pixel-perfect prototypes to ship faster.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=70&auto=format&fit=crop",
    tags: ["Figma", "Design System", "Prototype"],
    count: 210,
  },
  {
    id: "video",
    name: "Video Editing",
    description:
      "Shorts, ads, and cinematic edits for YouTube, TikTok, and campaigns.",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=70&auto=format&fit=crop",
    tags: ["Premiere", "After Effects", "Color"],
    count: 156,
  },
  {
    id: "seo",
    name: "SEO",
    description:
      "On-page, technical SEO, and content strategies that actually convert.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=70&auto=format&fit=crop",
    tags: ["On-page", "Technical", "Content"],
    count: 298,
  },
  {
    id: "ads",
    name: "Digital Advertising",
    description:
      "Google Ads, Meta campaigns, and smart targeting to grow your business.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=70&auto=format&fit=crop",
    tags: ["Google", "Meta", "Campaigns"],
    count: 187,
  },
  {
    id: "content",
    name: "Content Writing",
    description:
      "Blogs, landing copy, and product descriptions optimized for readability and SEO.",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&q=70&auto=format&fit=crop",
    tags: ["Copy", "Blog", "SEO"],
    count: 132,
  },
  {
    id: "mobile",
    name: "Mobile App Development",
    description:
      "iOS and Android apps built with Flutter, React Native, or native stacks.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=70&auto=format&fit=crop",
    tags: ["iOS", "Android", "Flutter"],
    count: 178,
  },
  {
    id: "photo",
    name: "Photography",
    description:
      "Product, lifestyle and event photography with studio-grade lighting.",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=70&auto=format&fit=crop",
    tags: ["Product", "Lifestyle", "Events"],
    count: 96,
  },
  {
    id: "data",
    name: "Data Analysis",
    description:
      "Dashboards, KPI tracking and insights using Python, SQL and BI tools.",
    image:
      "https://images.unsplash.com/photo-1556155092-8707de31f9c4?w=1200&q=70&auto=format&fit=crop",
    tags: ["Python", "SQL", "BI"],
    count: 141,
  },
  {
    id: "support",
    name: "Customer Support",
    description:
      "Multi-channel support, helpdesk setup and response automation.",
    image:
      "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?w=1200&q=70&auto=format&fit=crop",
    tags: ["Helpdesk", "Zendesk", "Automation"],
    count: 204,
  },
];
