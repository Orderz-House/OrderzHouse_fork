import { useEffect, useRef, useState } from "react";
import { Calendar, User, Clock, ChevronRight, Tag } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import BlogTopBar from "./components/BlogTopBar.jsx";

export default function BlogPost() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();

  // If we navigated from the list with state, use it as a warm cache
  const [post, setPost] = useState(() => (state && state.id === id ? state : null));
  const [loading, setLoading] = useState(!post);
  const [err, setErr] = useState(null);

  // Fetch post from API (no mock)
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setErr(null);
        const { data } = await axios.get(`/api/blogs/${encodeURIComponent(id)}`, {
          // If you need auth:
          // headers: { authorization: `Bearer ${token}` },
        });
        if (!mounted) return;

        // Accept either a single object or { item: {...} }
        const item = data?.item ?? data ?? null;
        setPost(item);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.response?.data?.message || e?.message || "Failed to load");
        setPost(null);
      } finally {
        mounted && setLoading(false);
      }
    }

    // Load when:
    // - there's no post, or
    // - the post doesn't match the current id (direct link), or
    // - the post is missing sections (want full details)
    if (!post || (post?.id ?? post?._id) !== id || !post?.sections) {
      load();
    }

    return () => {
      mounted = false;
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // reading progress
  const contentRef = useRef(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight - window.innerHeight + rect.top;
      const scrolled = Math.min(
        Math.max(window.scrollY - (el.offsetTop - 80), 0),
        total
      );
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      setProgress(pct);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // active section (for future TOC)
  const [activeId, setActiveId] = useState(null);
  useEffect(() => {
    if (!post?.sections) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    const root = contentRef.current;
    if (!root) return;
    root
      .querySelectorAll("[data-article-section]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [post]);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-white">
      {/* Reading progress */}
      <div
        className="fixed top-0 left-0 h-1 bg-[#028090] z-40 transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />

      {/* Top bar (no mock) */}
      <BlogTopBar
        showBack
        onBack={() => navigate(-1)}
        enableNew
        createUrl="/api/blogs"
        onCreated={(created) => {
          const newId = created?.id ?? created?._id;
          if (newId) navigate(`/blogs/${newId}`);
        }}
        currentId={post?.id ?? post?._id}
        currentTitle={post?.title}
        currentExcerpt={post?.excerpt}
      />

      {/* Header */}
      <header className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 pt-8 pb-4">
        {loading && !post ? (
          <div className="text-slate-500">Loading…</div>
        ) : err ? (
          <div className="text-rose-600">Error: {err}</div>
        ) : !post ? (
          <div className="text-slate-500">Not found.</div>
        ) : (
          <>
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(post.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.read}
              </span>
              {post.category && (
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />
                  <span className="px-2 py-0.5 rounded-full border border-[#028090] text-[#028090] text-xs">
                    {post.category}
                  </span>
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-semibold leading-tight text-slate-900">
              {post.title}
            </h1>
          </>
        )}
      </header>

      {/* Cover */}
      {!post ? null : (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-0">
          <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white">
            <img
              src={post.cover}
              alt={post.title}
              className="w-full h-[320px] sm:h-[420px] object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 py-10">
        {!post ? null : (
          <div className="grid lg:grid-cols-[1fr,280px] gap-10">
            <article ref={contentRef} className="space-y-8">
              {(post.sections || []).map((s) => (
                <section key={s.id ?? s._id} id={s.id ?? s._id} data-article-section>
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                    {s.h}
                  </h2>
                  <div className="mt-3 space-y-3 text-slate-700 leading-relaxed">
                    {(s.p || []).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </section>
              ))}

              {Array.isArray(post.tags) && post.tags.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>
        )}

        {/* Prev/Next (placeholder) */}
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          <button
            disabled
            className="group text-left rounded-2xl border border-slate-200 bg-white p-4 disabled:opacity-50"
          >
            <div className="text-xs text-slate-500">Previous</div>
            <div className="flex items-center gap-2 text-slate-800">
              <ChevronRight className="w-4 h-4 -scale-x-100 text-slate-400" />
              <span className="line-clamp-1">—</span>
            </div>
          </button>
          <button
            disabled
            className="group text-right rounded-2xl border border-slate-200 bg-white p-4 disabled:opacity-50"
          >
            <div className="text-xs text-slate-500">Next</div>
            <div className="flex items-center justify-end gap-2 text-slate-800">
              <span className="line-clamp-1">—</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
