// Topbar.jsx
import React, { useRef, useState, useEffect, useMemo } from "react";

/* ============== CategoriesRail (chips only) ============== */
export function CategoriesRail({ active, onSelect, catalog = {}, theme = "#028090", themeDark = "#05668D" }) {
  const list = useMemo(() => Object.entries(catalog || {}).map(([id, v]) => ({ id, name: v.title })), [catalog]);

  const Icon = ({ id }) => {
    const cls = "w-5 h-5";
    switch (id) {
      case "web":
        return (<svg viewBox="0 0 24 24" className={cls} fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M3 12h18M12 3c3 3 3 18 0 18M12 3c-3 3-3 18 0 18" stroke="currentColor" strokeWidth="2"/></svg>);
      case "design":
        return (<svg viewBox="0 0 24 24" className={cls} fill="none"><path d="M4 16l6-10 6 10H4z" stroke="currentColor" strokeWidth="2"/><circle cx="16" cy="17" r="2" fill="currentColor"/></svg>);
      case "video":
        return (<svg viewBox="0 0 24 24" className={cls} fill="none"><rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M17 10l4-2v8l-4-2v-4z" fill="currentColor"/></svg>);
      case "seo":
        return (<svg viewBox="0 0 24 24" className={cls} fill="none"><path d="M4 13l4 4 8-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
      case "content":
        return (<svg viewBox="0 0 24 24" className={cls} fill="none"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M8 9h8M8 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
      default:
        return (<svg viewBox="0 0 24 24" className={cls} fill="none"><rect x="4" y="10" width="4" height="8" rx="1" fill="currentColor"/><rect x="10" y="6" width="4" height="12" rx="1" fill="currentColor"/><rect x="16" y="12" width="4" height="6" rx="1" fill="currentColor"/></svg>);
    }
  };

  const railRef = useRef(null);
  const doScroll = (dx) => railRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-5">
      <div className="relative rounded-2xl bg-white/70 backdrop-blur shadow-[0_10px_36px_rgba(2,128,144,.12)] ring-1 ring-black/5">
        <div className="relative pl-3 pr-3 sm:px-10">
          <div
            ref={railRef}
            className="flex gap-2 sm:gap-3 overflow-x-auto py-2 sm:py-3 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <style>{`div::-webkit-scrollbar{display:none}`}</style>
            {list.map((c) => {
              const isActive = c.id === active;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelect?.(c.id)}
                  aria-current={isActive ? "true" : "false"}
                  className="snap-start shrink-0 rounded-xl px-3.5 sm:px-4 py-2.5 flex items-center gap-2 whitespace-nowrap transition active:scale-[.98] touch-manipulation min-h-[40px]"
                  style={{
                    background: "#fff",
                    boxShadow: isActive ? `inset 0 0 0 2px ${theme}` : "0 1px 0 rgba(15,23,42,.06)",
                    color: isActive ? themeDark : "#0f172a",
                  }}
                >
                  <span className="w-8 h-8 rounded-full grid place-items-center" style={{ background: "rgba(2,128,144,.10)", color: theme }}>
                    <Icon id={c.id} />
                  </span>
                  <span className="text-sm font-semibold">{c.name}</span>
                </button>
              );
            })}
          </div>

          <button aria-label="Prev" onClick={() => doScroll(-380)} className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow ring-1 ring-black/5 items-center justify-center hover:shadow-md">
            <svg viewBox="0 0 20 20" className="w-5 h-5"><path d="M12.5 4.5l-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <button aria-label="Next" onClick={() => doScroll(380)} className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow ring-1 ring-black/5 items-center justify-center hover:shadow-md">
            <svg viewBox="0 0 20 20" className="w-5 h-5"><path d="M7.5 4.5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 sm:w-10 rounded-l-2xl bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 sm:w-10 rounded-r-2xl bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>
    </div>
  );
}

/* ============== TOPBAR (default export) ============== */
export default function Topbar({
  active, onSelect, catalog = {}, theme = "#028090", themeDark = "#05668D", themeLight = "#9AE6B4",
  cat, sub, total = 0, onSelectSub, sort, setSort, pro, setPro, instant, setInstant,
  filters, onChangeFilters,
}) {
  const currentCat = cat ?? active;
  const handleTopSelect = (id) => {
    onSelect?.(id);
    onSelectSub?.("");
  };

  return (
    <div className="mb-8">
      <TopbarCategories
        active={active}
        onSelect={handleTopSelect}
        catalog={catalog}
        theme={theme}
        themeDark={themeDark}
      />
      <CategoryBar
        key={currentCat}
        cat={currentCat}
        sub={sub}
        total={total}
        onSelectSub={onSelectSub}
        sort={sort}
        setSort={setSort}
        pro={pro}
        setPro={setPro}
        instant={instant}
        setInstant={setInstant}
        catalog={catalog}
        theme={theme}
        themeLight={themeLight}
        themeDark={themeDark}
        filters={filters}
        onChangeFilters={onChangeFilters}
      />
    </div>
  );
}

/* --- Internal TopbarCategories used by default Topbar --- */
function TopbarCategories({ active, onSelect, catalog = {}, theme = "#028090", themeDark = "#05668D" }) {
  // reuse same structure as CategoriesRail (but internal)
  const list = useMemo(() => Object.entries(catalog || {}).map(([id, v]) => ({ id, name: v.title })), [catalog]);

  const Icon = ({ id }) => {
    const cls = "w-5 h-5";
    switch (id) {
      case "web":
        return (<svg viewBox="0 0 24 24" className={cls} fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M3 12h18M12 3c3 3 3 18 0 18M12 3c-3 3-3 18 0 18" stroke="currentColor" strokeWidth="2"/></svg>);
      case "design":
        return (<svg viewBox="0 0 24 24" className={cls} fill="none"><path d="M4 16l6-10 6 10H4z" stroke="currentColor" strokeWidth="2"/><circle cx="16" cy="17" r="2" fill="currentColor"/></svg>);
      case "video":
        return (<svg viewBox="0 0 24 24" className={cls} fill="none"><rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M17 10l4-2v8l-4-2v-4z" fill="currentColor"/></svg>);
      case "seo":
        return (<svg viewBox="0 0 24 24" className={cls} fill="none"><path d="M4 13l4 4 8-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
      case "content":
        return (<svg viewBox="0 0 24 24" className={cls} fill="none"><rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M8 9h8M8 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
      default:
        return (<svg viewBox="0 0 24 24" className={cls} fill="none"><rect x="4" y="10" width="4" height="8" rx="1" fill="currentColor"/><rect x="10" y="6" width="4" height="12" rx="1" fill="currentColor"/><rect x="16" y="12" width="4" height="6" rx="1" fill="currentColor"/></svg>);
    }
  };

  const railRef = useRef(null);
  const doScroll = (dx) => railRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-5">
      <div className="relative rounded-2xl bg-white/70 backdrop-blur shadow-[0_10px_36px_rgba(2,128,144,.12)] ring-1 ring-black/5">
        <div className="relative pl-3 pr-3 sm:px-10">
          <div
            ref={railRef}
            className="flex gap-2 sm:gap-3 overflow-x-auto py-2 sm:py-3 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <style>{`div::-webkit-scrollbar{display:none}`}</style>
            {list.map((c) => {
              const isActive = c.id === active;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelect?.(c.id)}
                  aria-current={isActive ? "true" : "false"}
                  className="snap-start shrink-0 rounded-xl px-3.5 sm:px-4 py-2.5 flex items-center gap-2 whitespace-nowrap transition active:scale-[.98] touch-manipulation min-h-[40px]"
                  style={{
                    background: "#fff",
                    boxShadow: isActive ? `inset 0 0 0 2px ${theme}` : "0 1px 0 rgba(15,23,42,.06)",
                    color: isActive ? themeDark : "#0f172a",
                  }}
                >
                  <span className="w-8 h-8 rounded-full grid place-items-center" style={{ background: "rgba(2,128,144,.10)", color: theme }}>
                    <Icon id={c.id} />
                  </span>
                  <span className="text-sm font-semibold">{c.name}</span>
                </button>
              );
            })}
          </div>

          <button aria-label="Prev" onClick={() => doScroll(-380)} className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow ring-1 ring-black/5 items-center justify-center hover:shadow-md">
            <svg viewBox="0 0 20 20" className="w-5 h-5"><path d="M12.5 4.5l-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <button aria-label="Next" onClick={() => doScroll(380)} className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow ring-1 ring-black/5 items-center justify-center hover:shadow-md">
            <svg viewBox="0 0 20 20" className="w-5 h-5"><path d="M7.5 4.5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 sm:w-10 rounded-l-2xl bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 sm:w-10 rounded-r-2xl bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>
    </div>
  );
}

/* -------- CategoryBar (unchanged logic, cleaned) ---------- */
function CategoryBar({
  cat, sub, total, onSelectSub, sort, setSort, pro, setPro, instant, setInstant,
  catalog = {}, theme = "#028090", themeLight = "#9AE6B4", themeDark = "#05668D", filters, onChangeFilters,
}) {
  const meta = catalog[cat] || { title: "Projects", subtitle: "Browse projects by category and filters", subcats: [] };
  const wrapRef = useRef(null);
  const scrollBy = (dx) => wrapRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  const [open, setOpen] = useState(null);

  const Badge = ({ children }) => (<span className="ml-2 text-[11px] rounded-full bg-slate-100 px-2 py-[2px] text-slate-600">{children}</span>);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <div className="relative rounded-2xl p-5 sm:p-6 bg-white/70 backdrop-blur shadow-[0_12px_42px_rgba(2,128,144,0.10)] ring-1 ring-black/5 overflow-x-hidden overflow-y-visible">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30" style={{ background: `radial-gradient(closest-side, ${theme}33, transparent 70%)` }} />
        <div className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30" style={{ background: `radial-gradient(closest-side, ${themeLight}33, transparent 70%)` }} />
      </div>

      <div className="relative z-10 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight" style={{ color: themeDark }}>{meta.title}</h1>
          <p className="mt-1 text-slate-600 text-sm sm:text-base">{meta.subtitle}</p>
        </div>
        <div className="text-sm text-slate-500">{total.toLocaleString()} results</div>
      </div>

      {meta.subcats && meta.subcats.length > 0 && (
        <div className="relative mt-5">
          <button aria-label="Prev" onClick={() => scrollBy(-320)} className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow ring-1 ring-black/5 items-center justify-center hover:shadow-md">
            <svg viewBox="0 0 20 20" className="w-5 h-5"><path d="M12.5 4.5l-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <button aria-label="Next" onClick={() => scrollBy(320)} className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow ring-1 ring-black/5 items-center justify-center hover:shadow-md">
            <svg viewBox="0 0 20 20" className="w-5 h-5"><path d="M7.5 4.5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>

          <div
            ref={wrapRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 px-10 sm:px-12"
            style={{
              WebkitMaskImage: "linear-gradient(90deg, transparent 0, black 40px, black calc(100% - 40px), transparent 100%)",
              maskImage: "linear-gradient(90deg, transparent 0, black 40px, black calc(100% - 40px), transparent 100%)",
              scrollBehavior: "smooth",
            }}
          >
            {meta.subcats.map((s) => {
              const isActive = sub === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onSelectSub(isActive ? "" : s.id)}
                  className={`rounded-2xl pr-4 pl-2 py-2.5 whitespace-nowrap flex items-center gap-3 transition shadow-sm ${isActive ? "scale-[1.02]" : ""}`}
                  style={{
                    background: isActive ? `linear-gradient(180deg, ${theme}0f, #fff)` : "#fff",
                    boxShadow: isActive ? `inset 0 0 0 2px ${theme}` : "0 1px 0 rgba(15,23,42,.06)",
                  }}
                >
                  <span className="w-8 h-8 rounded-full grid place-items-center text-[12px]" style={{ background: "rgba(2,128,144,.10)", color: theme }}>●</span>
                  <span className="text-slate-900 font-medium text-sm">{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="relative z-10 mt-4 flex items-center gap-4 flex-wrap">
        <Toggle label="Pro services" checked={pro} onChange={setPro} theme={theme} />
        <Toggle label="Instant response" checked={instant} onChange={setInstant} theme={theme} />
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
  );
}

/* Helpers used by CategoryBar */
function Toggle({ label, checked, onChange, theme = "#028090" }) {

  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-700 select-none cursor-pointer" style={{ ['--t']: theme }}>
      <span className="relative inline-flex items-center">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="w-10 h-6 rounded-full bg-slate-300 peer-checked:bg-[color:var(--t)] transition" />
        <span className="absolute left-0 top-0 w-6 h-6 rounded-full bg-white shadow translate-x-0 peer-checked:translate-x-4 transition" />
      </span>
      {label}
    </label>
  );
}
