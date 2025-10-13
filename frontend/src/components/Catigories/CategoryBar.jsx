import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { fetchSubSubCategoriesByCategoryId } from "./api/category";

export default function CategoryBar({
  cat,
  sub,
  total,
  onSelectSub,
  sort,
  setSort,
  pro,
  setPro,
  instant,
  setInstant,
  theme,
  themeLight,
  themeDark,
  filters,
  onChangeFilters,
}) {
  const [meta, setMeta] = useState({
    title: "Projects",
    subtitle: "Browse projects by category and filters",
    subcats: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch sub-sub-categories when category changes
  useEffect(() => {
    if (!cat) {
      setMeta({
        title: "Projects",
        subtitle: "Browse projects by category and filters",
        subcats: [],
      });
      setLoading(false);
      return;
    }
    
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        console.log("Fetching sub-sub-categories for category:", cat);
        const subSubCategoriesGrouped = await fetchSubSubCategoriesByCategoryId(cat);
        
        console.log("Raw API response:", subSubCategoriesGrouped);
        
        if (!alive) return;
        
        // Handle different possible response formats
        let flattenedSubSubCats = [];
        
        // Case 1: Already an array
        if (Array.isArray(subSubCategoriesGrouped)) {
          console.log("Response is already an array");
          flattenedSubSubCats = subSubCategoriesGrouped.map((ssc) => ({
            id: ssc._id || ssc.id,
            name: ssc.name
          }));
        }
        // Case 2: Grouped object { subCatId: [items], subCatId2: [items] }
        else if (subSubCategoriesGrouped && typeof subSubCategoriesGrouped === 'object') {
          console.log("Response is a grouped object");
          Object.entries(subSubCategoriesGrouped).forEach(([key, value]) => {
            console.log(`Processing group "${key}":`, value);
            if (Array.isArray(value)) {
              value.forEach((ssc) => {
                flattenedSubSubCats.push({
                  id: ssc._id || ssc.id,
                  name: ssc.name
                });
              });
            }
          });
        }

        console.log("Flattened sub-sub-categories:", flattenedSubSubCats);

        setMeta({
          title: "Projects",
          subtitle: "Browse projects by category and filters",
          subcats: flattenedSubSubCats,
        });
      } catch (err) {
        console.error("Failed to load sub-sub-categories:", err);
        console.error("Error details:", err.response?.data || err.message);
        if (!alive) return;
        setMeta({
          title: "Projects",
          subtitle: "Browse projects by category and filters",
          subcats: [],
        });
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [cat]);

  const wrapRef = useRef(null);
  const scrollBy = (dx) =>
    wrapRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  const [open, setOpen] = useState(null);
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const Badge = ({ children }) => (
    <span className="ml-2 text-[11px] rounded-full bg-slate-100 px-2 py-[2px] text-slate-600">
      {children}
    </span>
  );

  return (
    <div className="mb-8">
      <div className="relative rounded-2xl p-5 sm:p-6 bg-white/70 backdrop-blur shadow-[0_12px_42px_rgba(2,128,144,0.10)] ring-1 ring-black/5 overflow-x-hidden overflow-y-visible">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30"
            style={{
              background: `radial-gradient(closest-side, ${theme}33, transparent 70%)`,
            }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30"
            style={{
              background: `radial-gradient(closest-side, ${themeLight}33, transparent 70%)`,
            }}
          />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
              style={{ color: themeDark }}
            >
              {meta.title}
            </h1>
            <p className="mt-1 text-slate-600 text-sm sm:text-base">
              {meta.subtitle}
            </p>
          </div>
          <div className="text-sm text-slate-500">
            {total.toLocaleString()} results
          </div>
        </div>

        {/* Sub-sub-categories rail */}
        {!loading && meta.subcats.length > 0 && (
          <div className="relative mt-5">
            <button
              aria-label="Prev"
              onClick={() => scrollBy(-320)}
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow ring-1 ring-black/5 items-center justify-center hover:shadow-md transition"
            >
              <svg viewBox="0 0 20 20" className="w-5 h-5">
                <path
                  d="M12.5 4.5l-5 5 5 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              aria-label="Next"
              onClick={() => scrollBy(320)}
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow ring-1 ring-black/5 items-center justify-center hover:shadow-md transition"
            >
              <svg viewBox="0 0 20 20" className="w-5 h-5">
                <path
                  d="M7.5 4.5l5 5-5 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <div
              ref={wrapRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 px-10 sm:px-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{
                WebkitMaskImage:
                  "linear-gradient(90deg, transparent 0, black 40px, black calc(100% - 40px), transparent 100%)",
                maskImage:
                  "linear-gradient(90deg, transparent 0, black 40px, black calc(100% - 40px), transparent 100%)",
                scrollBehavior: "smooth",
              }}
            >
              {meta.subcats.map((s) => {
                const active = sub === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelectSub(active ? "" : s.id)}
                    className={`rounded-2xl pr-4 pl-2 py-2.5 whitespace-nowrap flex items-center gap-3 transition shadow-sm ${
                      active ? "scale-[1.02]" : ""
                    }`}
                    style={{
                      background: active
                        ? `linear-gradient(180deg, ${theme}0f, #fff)`
                        : "#fff",
                      boxShadow: active
                        ? `inset 0 0 0 2px ${theme}`
                        : "0 1px 0 rgba(15,23,42,.06)",
                    }}
                  >
                    <span
                      className="w-8 h-8 rounded-full grid place-items-center text-[12px]"
                      style={{
                        background: "rgba(2,128,144,.10)",
                        color: theme,
                      }}
                    >
                      ●
                    </span>
                    <span className="text-slate-900 font-medium text-sm">
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {loading && (
          <div className="relative mt-5 flex items-center justify-center py-4">
            <div className="text-sm text-slate-500">Loading categories...</div>
          </div>
        )}

        {!loading && meta.subcats.length === 0 && cat && (
          <div className="relative mt-5 flex items-center justify-center py-4">
            <div className="text-sm text-slate-400">
              No sub-categories available
              <div className="text-xs mt-1 text-slate-400">
                (Check browser console for debug info)
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="relative z-10 mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <FilterButton
            open={open === "service"}
            setOpen={(v) => setOpen(v ? "service" : null)}
            label={
              <span>
                Service options{filters?.video ? <Badge>Video</Badge> : null}
              </span>
            }
          >
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="rounded"
                checked={!!filters?.video}
                onChange={(e) =>
                  onChangeFilters("video", e.target.checked ? true : null)
                }
              />
              Offers video consultations
            </label>
            <div className="mt-3 flex justify-end">
              <button
                className="text-xs text-slate-500 hover:underline"
                onClick={() => onChangeFilters("video", null)}
              >
                Reset
              </button>
            </div>
          </FilterButton>

          <FilterButton
            open={open === "seller"}
            setOpen={(v) => setOpen(v ? "seller" : null)}
            label={
              <span>
                Seller details{filters?.vetted ? <Badge>Vetted</Badge> : null}
                {filters?.ad ? <Badge>Ad</Badge> : null}
              </span>
            }
          >
            <div className="space-y-2 text-sm text-slate-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={!!filters?.vetted}
                  onChange={(e) =>
                    onChangeFilters("vetted", e.target.checked ? true : null)
                  }
                />
                Vetted Pro
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={!!filters?.ad}
                  onChange={(e) =>
                    onChangeFilters("ad", e.target.checked ? true : null)
                  }
                />
                Sponsored (Ad)
              </label>
              <div className="pt-2 flex justify-end">
                <button
                  className="text-xs text-slate-500 hover:underline"
                  onClick={() => {
                    onChangeFilters("vetted", null);
                    onChangeFilters("ad", null);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </FilterButton>

          <FilterButton
            open={open === "budget"}
            setOpen={(v) => setOpen(v ? "budget" : null)}
            label={
              <span>
                Budget
                {filters?.budget?.min != null ||
                filters?.budget?.max != null ? (
                  <Badge>
                    {filters?.budget?.min ?? 0}–{filters?.budget?.max ?? "∞"}$
                  </Badge>
                ) : null}
              </span>
            }
          >
            <div className="grid grid-cols-2 gap-3 items-end">
              <Field label="Min ($)">
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={filters?.budget?.min ?? ""}
                  onChange={(e) =>
                    onChangeFilters("budget", {
                      min:
                        e.target.value === "" ? null : Number(e.target.value),
                      max: filters?.budget?.max ?? null,
                    })
                  }
                />
              </Field>
              <Field label="Max ($)">
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={filters?.budget?.max ?? ""}
                  onChange={(e) =>
                    onChangeFilters("budget", {
                      min: filters?.budget?.min ?? null,
                      max:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </Field>
            </div>
            <div className="mt-3 flex justify-end gap-3">
              <button
                className="text-xs text-slate-500 hover:underline"
                onClick={() =>
                  onChangeFilters("budget", { min: null, max: null })
                }
              >
                Reset
              </button>
            </div>
          </FilterButton>

          <FilterButton
            open={open === "delivery"}
            setOpen={(v) => setOpen(v ? "delivery" : null)}
            label={
              <span>
                Delivery time
                {filters?.delivery ? (
                  <Badge>≤ {filters.delivery}d</Badge>
                ) : null}
              </span>
            }
          >
            <div className="space-y-2 text-sm text-slate-700">
              {[
                { v: null, t: "Any" },
                { v: 3, t: "Up to 3 days" },
                { v: 7, t: "Up to 7 days" },
                { v: 14, t: "Up to 14 days" },
              ].map((o) => (
                <label key={o.v ?? 'any'} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="dlv"
                    checked={filters?.delivery === o.v}
                    onChange={() => onChangeFilters("delivery", o.v)}
                  />
                  {o.t}
                </label>
              ))}
            </div>
          </FilterButton>
        </div>

        {/* Toggles + sort */}
        <div className="relative z-10 mt-4 flex items-center gap-4 flex-wrap">
          <Toggle label="Pro services" checked={pro} onChange={setPro} />
          <Toggle
            label="Instant response"
            checked={instant}
            onChange={setInstant}
          />
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-slate-600">Sort by</span>
            <select
              className="rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
              style={{ border: "1px solid rgba(15,23,42,0.08)" }}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="best">Best selling</option>
              <option value="top">Top rated</option>
              <option value="price_low">Price: Low → High</option>
              <option value="price_high">Price: High → Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="block mb-1 text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function FilterButton({ label, open, setOpen, children }) {
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 260,
    dropUp: false,
  });

  const clamp = (val, min, max) => Math.max(min, Math.min(val, max));

  const syncPosition = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const estMenuH = 260;
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;
    const dropUp = spaceBelow < estMenuH + 16 && spaceAbove > estMenuH + 16;

    const width = clamp(Math.max(r.width, 220), 220, 320);
    let left = clamp(Math.round(r.left), 8, window.innerWidth - width - 8);

    setCoords({
      top: dropUp ? Math.round(r.top - 8) : Math.round(r.bottom + 8),
      left,
      width,
      dropUp,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    syncPosition();
    const onScroll = () => syncPosition();
    const onResize = () => syncPosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  useEffect(() => {
    function onDoc(e) {
      if (!open) return;
      if (
        !btnRef.current?.contains(e.target) &&
        !menuRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, setOpen]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="w-full rounded-xl px-4 py-2.5 text-sm bg-white shadow-sm hover:shadow transition text-slate-800 text-left focus:outline-none"
        style={{ border: "1px solid rgba(15,23,42,0.08)" }}
        aria-expanded={open ? "true" : "false"}
      >
        {label} ▾
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              transform: coords.dropUp ? "translateY(-100%)" : "none",
              zIndex: 9999,
            }}
            className="max-h-[60vh] overflow-auto rounded-xl bg-white shadow-xl ring-1 ring-black/10 p-3"
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-700 select-none cursor-pointer">
      <span className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          className="w-10 h-6 rounded-full bg-slate-300 peer-checked:bg-[color:var(--t)] transition"
          style={{ ["--t"]: "#028090" }}
        />
        <span className="absolute left-0 top-0 w-6 h-6 rounded-full bg-white shadow translate-x-0 peer-checked:translate-x-4 transition" />
      </span>
      {label}
    </label>
  );
}