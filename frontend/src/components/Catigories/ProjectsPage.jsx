import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import { CategoriesRail } from "./TopbarCategories.jsx"; // rail فقط
import ProjectCard from "./ProjectCard.jsx";
import Pagination from "./Pagination.jsx";

const THEME = "#028090";
const THEME_DARK = "#05668D";
const PAGE_SIZE = 12;

/** Catalog with subcats for the sidebar accordion */
const CATALOG = {
  web: {
    title: "Software Development",
    subtitle: "Add features to your website with custom web applications and extensions",
    subcats: [
      { id: "fullstack", name: "Full Stack Web Applications" },
      { id: "automations", name: "Automations & Workflows" },
      { id: "desktop", name: "Desktop Applications" },
      { id: "api", name: "API & Integrations" },
      { id: "scripting", name: "Scripting" },
    ],
  },
  design: {
    title: "Design",
    subtitle: "UI/UX, design systems, and brand visuals",
    subcats: [
      { id: "uiux", name: "UI/UX" },
      { id: "designsystem", name: "Design Systems" },
      { id: "branding", name: "Branding" },
      { id: "illustration", name: "Illustrations" },
    ],
  },
  video: {
    title: "Video Editing",
    subtitle: "Shorts, ads, and cinematic edits",
    subcats: [
      { id: "ads", name: "Ads" },
      { id: "youtube", name: "YouTube" },
      { id: "color", name: "Color Grading" },
      { id: "motion", name: "Motion" },
    ],
  },
  seo: {
    title: "SEO",
    subtitle: "On-page, technical SEO, and content",
    subcats: [
      { id: "onpage", name: "On-page" },
      { id: "technical", name: "Technical" },
      { id: "content", name: "Content" },
    ],
  },
  content: {
    title: "Content Writing",
    subtitle: "Blogs, landing copy, and product descriptions",
    subcats: [
      { id: "blog", name: "Blogs" },
      { id: "landing", name: "Landing Copy" },
      { id: "product", name: "Product Descriptions" },
    ],
  },
  data: {
    title: "Data",
    subtitle: "Dashboards, KPIs and analytics",
    subcats: [
      { id: "dashboard", name: "Dashboards" },
      { id: "bi", name: "BI & Reports" },
      { id: "sql", name: "SQL" },
    ],
  },
};

const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? "true") === "true";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "" });
const API_ENDPOINT = "/api/projects";

/** مختصر موك؛ أضفت sub على بعضها لتبيان الفلترة */
const MOCK = [
  { id:"p1", category:"web", sub:"fullstack", title:"Full-stack app with React, Next.js & Node.js", cover:"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=70&auto=format&fit=crop", seller:{name:"DevSprint", vetted:false}, rating:{score:5, count:33}, from:300, deliveryDays:21 },
  { id:"p2", category:"design", sub:"designsystem", title:"Design system for your product", cover:"https://images.unsplash.com/photo-1604145559206-e3bce0040e0a?w=1200&q=70&auto=format&fit=crop", seller:{name:"Pixel Forge"}, rating:{score:4.9, count:120}, from:150, deliveryDays:14 },
  { id:"p3", category:"video", sub:"ads", title:"Pro video editing for ads & YouTube", cover:"https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=70&auto=format&fit=crop", seller:{name:"FrameCut", vetted:true}, rating:{score:5, count:64}, from:180, deliveryDays:3 },
  { id:"p4", category:"web", sub:"api", title:"API & integrations for your product", cover:"https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=70&auto=format&fit=crop", seller:{name:"API Lab"}, rating:{score:5, count:12}, from:220, deliveryDays:10 },
];

function useProjects({ category, sub, page }) {
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: "" }));
        if (USE_MOCK) {
          let all = MOCK.filter(p => !category || p.category === category);
          if (sub) all = all.filter(p => p.sub === sub);
          const total = all.length;
          const start = (page - 1) * PAGE_SIZE;
          const items = all.slice(start, start + PAGE_SIZE);
          if (!alive) return;
          setState({ items, total, loading: false, error: "" });
        } else {
          const res = await api.get(API_ENDPOINT, {
            params: { cat: category, sub, page, limit: PAGE_SIZE }
          });
          if (!alive) return;
          setState({
            items: res.data?.items ?? [],
            total: res.data?.total ?? 0,
            loading: false,
            error: ""
          });
        }
      } catch (e) {
        if (!alive) return;
        setState((s) => ({ ...s, loading: false, error: e?.message || "Failed to load" }));
      }
    })();
    return () => { alive = false; };
  }, [category, sub, page]);

  return state;
}

export default function ProjectsPage() {
  const [sp, setSp] = useSearchParams();
  const category = sp.get("cat") || "web";
  const sub = sp.get("sub") || "";
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);

  const { items, total, loading, error } = useProjects({ category, sub, page });
  const meta = CATALOG[category] || { title: "Projects", subtitle: "", subcats: [] };

  const setPage = (p) => {
    const next = new URLSearchParams(sp);
    next.set("page", String(p));
    setSp(next, { replace: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // لائحة الأقسام للسايدبار
  const catList = useMemo(
    () => Object.entries(CATALOG).map(([id, v]) => ({ id, name: v.title })),
    []
  );

  // عدادات بسيطة من الموك (اختياري)
  const counts = useMemo(() => {
    const c = {};
    for (const p of MOCK) c[p.category] = (c[p.category] || 0) + 1;
    return c;
  }, []);

  // تبديل القسم من السايدبار (يمسح sub)
  const chooseCat = (id) => {
    const next = new URLSearchParams(sp);
    next.set("cat", id);
    next.delete("sub");
    next.set("page", "1");
    setSp(next, { replace: false });
  };

  // تبديل sub
  const chooseSub = (subId) => {
    const next = new URLSearchParams(sp);
    if (subId) next.set("sub", subId); else next.delete("sub");
    next.set("page", "1");
    setSp(next, { replace: false });
  };

  return (
    <section className="relative min-h-[70vh] py-8 sm:py-10 md:py-12">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Rail العلوي الصغير */}
        <CategoriesRail
          active={category}
          onSelect={chooseCat}
          catalog={CATALOG}
          theme={THEME}
          themeDark={THEME_DARK}
        />

        {/* تخطيط: يسار شبكة — يمين سايدبار */}
        <div className="grid grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="col-span-12 lg:col-span-9">
            <header className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: THEME_DARK }}>
                {meta.title}
              </h1>
              <p className="text-slate-600 mt-1">{meta.subtitle}</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading && Array.from({ length: PAGE_SIZE }).map((_, i) => <CardSkeleton key={i} />)}
              {!loading && !error && items.map((p) => <ProjectCard key={p.id} {...p} theme={THEME} />)}
            </div>

            {!loading && items.length === 0 && !error && (
              <div className="mt-10 text-slate-600">No projects found.</div>
            )}
            {!loading && error && (
              <div className="mt-10 text-red-600">{error}</div>
            )}

            {!loading && total > PAGE_SIZE && (
              <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
            )}
          </div>

          {/* RIGHT: Sticky sidebar with accordion */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Search */}
              <div className="rounded-2xl bg-white shadow ring-1 ring-black/5 p-4">
                <label className="text-sm text-slate-600 block mb-2">Search</label>
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2.5" placeholder="Search projects…" />
              </div>

              {/* Categories + Subcategories (Accordion) */}
              <div className="rounded-2xl bg-white shadow ring-1 ring-black/5 p-4">
                <h3 className="text-slate-800 font-semibold">Categories</h3>
                <ul className="mt-3 space-y-1.5">
                  {catList.map((c) => {
                    const isActive = c.id === category;
                    const subs = CATALOG[c.id]?.subcats || [];
                    return (
                      <li key={c.id} className="group">
                        {/* Category row */}
                        <button
                          onClick={() => chooseCat(c.id)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition"
                          style={{
                            background: isActive ? "#F8FAFC" : "transparent",
                            color: isActive ? THEME_DARK : "#0f172a",
                            boxShadow: isActive ? `inset 0 0 0 1px ${THEME}33` : "none",
                          }}
                        >
                          <span className="truncate">{c.name}</span>
                          <span className="ml-3 text-[11px] rounded-full px-2 py-[2px]" style={{ background:"rgba(2,128,144,.10)", color:THEME_DARK }}>
                            {(counts[c.id] ?? 0)}
                          </span>
                        </button>

                        {/* Subcats panel (expand when active) */}
                        {isActive && subs.length > 0 && (
                          <div className="mt-2 pl-2">
                            <div className="max-h-64 overflow-auto pr-1">
                              <div className="flex flex-wrap gap-2">
                                {subs.map((s) => {
                                  const isSub = sub === s.id;
                                  return (
                                    <button
                                      key={s.id}
                                      onClick={() => chooseSub(isSub ? "" : s.id)}
                                      className="px-3 py-1.5 rounded-full text-xs transition"
                                      style={{
                                        background: isSub ? `${THEME}15` : "#F1F5F9",
                                        color: isSub ? THEME_DARK : "#0f172a",
                                        boxShadow: isSub ? `inset 0 0 0 1px ${THEME}` : "none",
                                      }}
                                      title={s.name}
                                    >
                                      {s.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Sort */}
              <div className="rounded-2xl bg-white shadow ring-1 ring-black/5 p-4">
                <label className="text-sm text-slate-600 block mb-2">Sort by</label>
                <select className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white">
                  <option>Best selling</option>
                  <option>Top rated</option>
                  <option>Price: Low → High</option>
                  <option>Price: High → Low</option>
                </select>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function CardSkeleton() {
  return (
    <div>
      <div className="relative rounded-xl overflow-hidden">
        <div className="aspect-[16/9] w-full bg-slate-200 animate-pulse" />
      </div>
      <div className="p-3 px-1 space-y-2">
        <div className="h-3 w-2/3 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-1/3 bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
