import { useEffect, useState } from "react";
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
  const [posts, setPosts] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters + pagination
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // Fetch data from backend
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/blogs?page=${page}&limit=${PAGE_SIZE}&search=${q}&status=approved`
        );
        const data = await response.json();
        
        if (data.success) {
          setPosts(data.data);
          
          // Set featured post (most recent)
          if (data.data.length > 0) {
            const sorted = [...data.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setFeatured(sorted[0]);
          }
        } else {
          setError(data.message || "Failed to fetch blogs");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [page, q, cat]);

  // Categories
  const categories = ["All", ...new Set(posts.map((p) => p.category))];

  // Filter posts based on category
  const filtered = q
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q.toLowerCase()) ||
          p.description.toLowerCase().includes(q.toLowerCase()) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q.toLowerCase()))
      )
    : cat === "All"
    ? posts
    : posts.filter((p) => p.category === cat);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#028090] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-slate-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[#028090] text-white rounded-lg hover:bg-[#026e7a]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header (clean, NO blue bg) */}
      <header className="border-b border-slate-200/60 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Featured card */}
            {featured && (
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
                      {formatDate(featured.created_at)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {featured.fullname_user}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featured.read_time}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-semibold mt-3 text-slate-900">
                    {featured.title}
                  </h1>
                  <p className="text-slate-600 mt-2">{featured.description.substring(0, 150)}...</p>
                  <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-[#028090] hover:bg-slate-50 transition">
                    Read article <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            )}

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
                      {p.description.substring(0, 100)}...
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-slate-500 text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(p.created_at)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        {p.fullname_user}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {p.read_time}
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