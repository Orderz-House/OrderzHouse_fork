import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import TopbarCategories from "./TopbarCategories.jsx";
import CategoryBar from "./CategoryBar.jsx";
import ProjectCard from "./ProjectCard.jsx";
import Pagination from "./Pagination.jsx"; // ← جديد

// ===== Theme & Catalog =====
const THEME = "#028090";
const THEME_DARK = "#05668D";
const THEME_LIGHT = "#02C39A";
const PAGE_SIZE = 12; // ← حجم الصفحة

const CATALOG = {
  web: {
    title: "Software Development",
    subtitle:
      "Add features to your website with custom web applications and extensions",
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
    subtitle: "UI/UX, design systems, and brand visuals to ship faster",
    subcats: [
      { id: "uiux", name: "UI/UX" },
      { id: "designsystem", name: "Design Systems" },
      { id: "branding", name: "Branding" },
      { id: "illustration", name: "Illustrations" },
    ],
  },
  video: {
    title: "Video Editing",
    subtitle: "Shorts, ads, and cinematic edits for your channels",
    subcats: [
      { id: "ads", name: "Ads" },
      { id: "youtube", name: "YouTube" },
      { id: "color", name: "Color Grading" },
      { id: "motion", name: "Motion" },
    ],
  },
  seo: {
    title: "SEO",
    subtitle: "On-page, technical SEO, and content strategies",
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

// ===== Mock + API =====
const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? "true") === "true";
const API_BASE = import.meta.env.VITE_API_URL || "";
const API_ENDPOINT = "/api/projects";
const api = axios.create({ baseURL: API_BASE });

const MOCK_PROJECTS = [
  {
    id: "p1",
    category: "design",
    sub: "uiux",
    title: "Our agency will design modern web application UI/UX",
    cover:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=70&auto=format&fit=crop",
    seller: { name: "Zenkoders", vetted: true, isAd: true },
    rating: { score: 5.0, count: 72 },
    from: 200,
    offersVideo: true,
    deliveryDays: 7,
    tags: ["React Js", "Next Js", "Node Js", "AWS", "Firebase"],
  },
  {
    id: "p2",
    category: "design",
    sub: "designsystem",
    title: "I will build a polished design system for your product",
    cover:
      "https://images.unsplash.com/photo-1604145559206-e3bce0040e0a?w=1200&q=70&auto=format&fit=crop",
    seller: { name: "Pixel Forge", vetted: false, isAd: false },
    rating: { score: 4.9, count: 120 },
    from: 150,
    offersVideo: false,
    deliveryDays: 14,
    tags: ["Figma", "Design System", "Components"],
  },
  {
    id: "p3",
    category: "video",
    sub: "ads",
    title: "Pro video editing for ads, YouTube, and campaigns",
    cover:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=70&auto=format&fit=crop",
    seller: { name: "FrameCut", vetted: true, isAd: false },
    rating: { score: 5.0, count: 64 },
    from: 180,
    offersVideo: true,
    deliveryDays: 3,
    tags: ["Premiere", "After Effects", "Color"],
  },
  {
    id: "p4",
    category: "seo",
    sub: "technical",
    title: "Advanced SEO strategy that actually converts",
    cover:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=70&auto=format&fit=crop",
    seller: { name: "RankLab", vetted: true, isAd: false },
    rating: { score: 4.8, count: 90 },
    from: 120,
    offersVideo: false,
    deliveryDays: 10,
    tags: ["On-page", "Technical", "Content"],
  },
  {
    id: "p5",
    category: "web",
    sub: "fullstack",
    title: "Full-stack app with React, Next.js & Node.js",
    cover:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=70&auto=format&fit=crop",
    seller: { name: "DevSprint", vetted: false, isAd: false },
    rating: { score: 5.0, count: 33 },
    from: 300,
    offersVideo: true,
    deliveryDays: 21,
    tags: ["React", "Next.js", "Node.js"],
  },
  // (إن أردت الاختبار بسرعة، انسخ هذه العناصر وبدّل الـid لزيادة العدد > 24)
];

// ===== hook: جلب + تصفية + فرز + تقطيع صفحات =====
function useProjects({
  category,
  sub,
  page = 1,
  pageSize = PAGE_SIZE,
  filters,
  sort,
  pro,
  instant,
}) {
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 200));

          // فلترة
          let all = MOCK_PROJECTS.filter((p) => {
            if (category && p.category !== category) return false;
            if (sub && p.sub !== sub) return false;
            if (filters?.video != null && p.offersVideo !== filters.video)
              return false;
            if (filters?.vetted != null && p.seller?.vetted !== filters.vetted)
              return false;
            if (filters?.ad != null && p.seller?.isAd !== filters.ad)
              return false;
            if (filters?.budget) {
              const min = filters.budget.min ?? -Infinity;
              const max = filters.budget.max ?? Infinity;
              if (!(p.from >= min && p.from <= max)) return false;
            }
            if (filters?.delivery != null) {
              if (p.deliveryDays == null || p.deliveryDays > filters.delivery)
                return false;
            }
            if (pro && !p.seller?.vetted) return false;
            if (instant && !(p.deliveryDays <= 7)) return false;
            return true;
          });

          // فرز
          if (sort === "price_low")
            all = [...all].sort((a, b) => a.from - b.from);
          else if (sort === "price_high")
            all = [...all].sort((a, b) => b.from - a.from);
          else if (sort === "top")
            all = [...all].sort((a, b) => b.rating.score - a.rating.score);

          const total = all.length;
          // تقطيع حسب الصفحة
          const start = (page - 1) * pageSize;
          const end = start + pageSize;
          const items = all.slice(start, end);

          if (!alive) return;
          setData({ items, total });
        } else {
          // API: مرّر باراميترات التقطيع
          const res = await api.get(API_ENDPOINT, {
            params: {
              cat: category,
              sub,
              page,
              limit: pageSize,
              sort,
              pro: pro ? 1 : 0,
              instant: instant ? 1 : 0,
              video: filters?.video ?? undefined,
              vetted: filters?.vetted ?? undefined,
              ad: filters?.ad ?? undefined,
              budget_min: filters?.budget?.min ?? undefined,
              budget_max: filters?.budget?.max ?? undefined,
              delivery: filters?.delivery ?? undefined,
            },
          });
          const payload = res.data ?? { items: [], total: 0 };
          if (!alive) return;
          setData(payload);
        }
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load projects");
      } finally {
        // eslint-disable-next-line no-unsafe-finally
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [category, sub, page, pageSize, filters, sort, pro, instant]);

  return { ...data, loading, error };
}

// ===== الصفحة =====
export default function ProjectsPage() {
  const [search, setSearch] = useSearchParams();
  const category = search.get("cat") || "web";
  const sub = search.get("sub") || "";
  const page = Math.max(1, parseInt(search.get("page") || "1", 10) || 1);

  const [sort, setSort] = useState("best");
  const [pro, setPro] = useState(false);
  const [instant, setInstant] = useState(false);

  // فلاتر الأزرار الأربع
  const [filters, setFilters] = useState({
    video: null,
    vetted: null,
    ad: null,
    budget: { min: null, max: null },
    delivery: null,
  });

  const { items, total, loading, error } = useProjects({
    category,
    sub,
    page,
    pageSize: PAGE_SIZE,
    filters,
    sort,
    pro,
    instant,
  });

  // تأكيد بقاء الصفحة ضمن المدى عند تغيّر النتائج
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > totalPages) {
      const next = new URLSearchParams(search);
      next.set("page", String(totalPages));
      setSearch(next, { replace: true });
    }
  }, [total]); // eslint-disable-line react-hooks/exhaustive-deps

  const setPage = (p) => {
    const next = new URLSearchParams(search);
    next.set("page", String(p));
    setSearch(next, { replace: false });
    // optional: scroll لأعلى الشبكة
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectCategory = (catId) => {
    const next = new URLSearchParams(search);
    next.set("cat", catId);
    next.delete("sub");
    next.set("page", "1"); // بداية من الصفحة الأولى
    setSearch(next, { replace: false });
  };
  const handleSelectSub = (v) => {
    const next = new URLSearchParams(search);
    if (v) next.set("sub", v);
    else next.delete("sub");
    next.set("page", "1"); // بداية من الصفحة الأولى
    setSearch(next, { replace: false });
  };

  return (
    <section className="relative min-h-[70vh] py-8 sm:py-10 md:py-12">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TopbarCategories
          active={category}
          onSelect={handleSelectCategory}
          catalog={CATALOG}
          theme={THEME}
          themeDark={THEME_DARK}
        />

        <CategoryBar
          cat={category}
          sub={sub}
          total={total}
          onSelectSub={handleSelectSub}
          sort={sort}
          setSort={setSort}
          pro={pro}
          setPro={setPro}
          instant={instant}
          setInstant={setInstant}
          catalog={CATALOG}
          theme={THEME}
          themeLight={THEME_LIGHT}
          themeDark={THEME_DARK}
          filters={filters}
          onChangeFilters={(name, value) =>
            setFilters((f) => ({ ...f, [name]: value }))
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading &&
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          {!loading &&
            !error &&
            items.map((p) => <ProjectCard key={p.id} {...p} theme={THEME} />)}
        </div>

        {!loading && items.length === 0 && !error && (
          <div className="mt-12 text-center text-slate-600">
            No projects found.
          </div>
        )}
        {!loading && error && (
          <div className="mt-12 text-center text-red-600">{error}</div>
        )}

        {/* الترقيم */}
        {!loading && total > PAGE_SIZE && (
          <Pagination
            page={page}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>
    </section>
  );
}

// Skeleton للكارد
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
