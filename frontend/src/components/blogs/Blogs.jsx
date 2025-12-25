import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Search,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import BlogCard from "./components/BlogCard.jsx";
import BlogTopBar from "./components/BlogTopBar.jsx";

export default function Blogs() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const API_BASE = import.meta.env.VITE_APP_API_URL;

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const { data } = await axios.get(`${API_BASE}/blogs`);
      setPosts(Array.isArray(data) ? data : data?.items ?? []);
    } catch (e) {
      setErr(e?.message || "Failed to load blogs");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [posts]);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();
    const byCat = posts.filter((p) =>
      cat === "All" ? true : p.category === cat
    );
    if (!t) return byCat;
    return byCat.filter(
      (p) =>
        String(p.title).toLowerCase().includes(t) ||
        String(p.excerpt).toLowerCase().includes(t) ||
        (Array.isArray(p.tags) &&
          p.tags.some((x) => String(x).toLowerCase().includes(t)))
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

  const featured = useMemo(
    () =>
      posts.length
        ? [...posts].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        : null,
    [posts]
  );

  return (
    <div className="min-h-screen bg-white">
      <BlogTopBar createUrl={`${API_BASE}/blogs`} mock={false} onCreated={fetchPosts} />

      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0 py-10">
          <div className="grid gap-8 items-start">
            {/* Featured card */}
            <article className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              {!featured ? (
                <div className="p-8 text-slate-500">
                  {loading ? "Loading…" : err ? "No articles" : "No articles"}
                </div>
              ) : (
                <>
                  <div className="relative">
                    <img
                      src={featured.cover}
                      alt={featured.title}
                      className="h-56 w-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 text-[12px] rounded-full bg-[#C2410C] text-white shadow">
                      Featured
                    </span>
                  </div>

                  <div className="p-5">
                    {/* ⛔ Author REMOVED */}
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(featured.date)}
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

                    <Link
                      to={`/blogs/${featured.id ?? featured._id}`}
                      state={featured}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-[#C2410C] hover:bg-slate-50 transition"
                    >
                      Read article <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </>
              )}
            </article>

            {/* Tools */}
            <div className="space-y-5 lg:self-center w-full">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  placeholder="Search articles, tags…"
                  value={q}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20"
                />
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Tag className="w-4 h-4" />
                <span className="text-sm">Categories</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const active = c === cat;
                  return (
                    <button
                      key={c}
                      onClick={() => onCat(c)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${
                        active
                          ? "bg-[#C2410C]/5 text-[#C2410C] border-[#C2410C]"
                          : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>

              {err && <div className="text-sm text-rose-600">Error: {err}</div>}

              <div className="text-slate-600 text-sm">
                {loading
                  ? "Loading…"
                  : `${filtered.length} article${
                      filtered.length !== 1 ? "s" : ""
                    } found`}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* GRID */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0 py-10">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            No results. Try a different search or category.
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pageData.map((p) => (
                <BlogCard key={p.id ?? p._id} post={p} />
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
