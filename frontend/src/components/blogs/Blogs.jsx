import { useMemo, useState } from "react";
import {
  Search,
  Calendar,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Tag,
  Bookmark,
} from "lucide-react";


export default function Blogs() {
  const posts = useMemo(
    () => [
      {
        id: "p-001",
        title: "How to Hire the Right Freelancer",
        excerpt:
          "Define scope, compare proposals fairly, and start collaboration on the right foot.",
        cover:
          "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1200&auto=format&fit=crop",
        author: "Noah Wilson",
        date: "2025-01-07",
        read: "6 min",
        category: "Guides",
        tags: ["Hiring", "Freelancers"],
      },
      {
        id: "p-002",
        title: "Design Systems that Ship Faster",
        excerpt:
          "Shared tokens and components align teams and shorten delivery cycles.",
        cover:
          "https://images.unsplash.com/photo-1551281044-8b89a5a3b33b?q=80&w=1200&auto=format&fit=crop",
        author: "Ava Martin",
        date: "2025-01-02",
        read: "5 min",
        category: "Design",
        tags: ["UI", "Components"],
      },
      {
        id: "p-003",
        title: "Write Clear Scopes: From Brief to Budget",
        excerpt:
          "Simple templates to estimate effort and avoid scope creep.",
        cover:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
        author: "Liam Carter",
        date: "2024-12-28",
        read: "7 min",
        category: "Business",
        tags: ["Scope", "Budget"],
      },
      {
        id: "p-004",
        title: "Remote Work: Common Mistakes & Fixes",
        excerpt:
          "Rituals and async habits that make distributed teams thrive.",
        cover:
          "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
        author: "Maya Perez",
        date: "2024-12-20",
        read: "4 min",
        category: "Remote",
        tags: ["Teamwork"],
      },
      {
        id: "p-005",
        title: "Freelance Pricing Models Explained",
        excerpt:
          "Fixed vs hourly vs milestone—when each model shines.",
        cover:
          "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200&auto=format&fit=crop",
        author: "Ethan Park",
        date: "2024-12-15",
        read: "6 min",
        category: "Business",
        tags: ["Pricing"],
      },
      {
        id: "p-006",
        title: "Portfolios that Win Clients",
        excerpt:
          "Pick the right cases, tell outcomes, and keep it simple.",
        cover:
          "https://images.unsplash.com/photo-1529336953121-4f3c7c0f8a3e?q=80&w=1200&auto=format&fit=crop",
        author: "Zara Lee",
        date: "2024-12-08",
        read: "5 min",
        category: "Guides",
        tags: ["Portfolio"],
      },
      {
        id: "p-007",
        title: "Accessibility Basics for Clients",
        excerpt:
          "Small checks with big impact on usability.",
        cover:
          "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
        author: "Oliver Adams",
        date: "2024-12-01",
        read: "5 min",
        category: "Design",
        tags: ["a11y"],
      },
      {
        id: "p-008",
        title: "Legal Essentials in Freelance Contracts",
        excerpt:
          "Scope, IP, payment terms, liability—friendly overview.",
        cover:
          "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop",
        author: "Sara Kim",
        date: "2024-11-22",
        read: "8 min",
        category: "Legal",
        tags: ["Contracts"],
      },
      {
        id: "p-009",
        title: "Lean Analytics: Signals, Not Noise",
        excerpt:
          "A simple metric set to track project health.",
        cover:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
        author: "Leo Green",
        date: "2024-11-10",
        read: "6 min",
        category: "Analytics",
        tags: ["KPI"],
      },
    ],
    []
  );

  // Categories
  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [posts]);

  // Filters + pagination
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();
    const byCat = posts.filter((p) => (cat === "All" ? true : p.category === cat));
    if (!t) return byCat;
    return byCat.filter(
      (p) =>
        p.title.toLowerCase().includes(t) ||
        p.excerpt.toLowerCase().includes(t) ||
        p.tags.some((x) => x.toLowerCase().includes(t))
    );
  }, [posts, q, cat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onSearch = (val) => {
    setQ(val);
    setPage(1);
  };
  const onCat = (val) => {
    setCat(val);
    setPage(1);
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // Featured
  const featured = useMemo(
    () =>
      [...posts].sort((a, b) => new Date(b.date) - new Date(a.date))[0],
    [posts]
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header (clean, NO blue bg) */}
      <header className="border-b border-slate-200/60 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Featured card */}
            <article className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              <div className="relative">
                <img
                  src={featured.cover}
                  alt={featured.title}
                  className="h-56 w-full object-cover"
                />
                <span className="absolute top-3 left-3 px-3 py-1 text-[12px] rounded-full bg-[#028090] text-white shadow">
                  Featured
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(featured.date)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {featured.author}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featured.read}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold mt-3 text-slate-900">
                  {featured.title}
                </h1>
                <p className="text-slate-600 mt-2">{featured.excerpt}</p>
                <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-[#028090] hover:bg-slate-50 transition">
                  Read article <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>

            {/* Actions */}
            <div className="space-y-5">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  placeholder="Search articles, tags…"
                  value={q}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#028090]/20"
                />
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Tag className="w-4 h-4" />
                <span className="text-sm">Categories</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
                {categories.map((c) => {
                  const active = c === cat;
                  return (
                    <button
                      key={c}
                      onClick={() => onCat(c)}
                      className={`snap-start px-3 py-1.5 rounded-full text-sm border transition ${
                        active
                          ? "bg-[#028090]/5 text-[#028090] border-[#028090]"
                          : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
              <div className="text-slate-600 text-sm">
                {filtered.length} article{filtered.length !== 1 ? "s" : ""} found
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* GRID */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            No results. Try a different search or category.
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pageData.map((p) => (
                <article
                  key={p.id}
                  className="group rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-sm transition"
                >
                  <div className="relative">
                    <img
                      src={p.cover}
                      alt={p.title}
                      className="h-44 w-full object-cover group-hover:scale-[1.02] transition"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] rounded-full bg-[#028090] text-white shadow">
                      {p.category}
                    </span>
                    <button
                      className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full bg-white/95 text-slate-700 hover:bg-white shadow"
                      title="Save"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-slate-600 text-sm mt-2 line-clamp-2">
                      {p.excerpt}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-slate-500 text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(p.date)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        {p.author}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {p.read}
                      </span>
                    </div>

                    <button className="mt-4 inline-flex items-center gap-1.5 text-[#028090] hover:underline">
                      Read more <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <div className="px-3 py-2 text-sm text-slate-600">
                  Page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
