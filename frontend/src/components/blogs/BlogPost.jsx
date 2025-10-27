import { useEffect, useRef, useState } from "react";
import { Calendar, User, Clock, ChevronRight, Tag, Paperclip, FileText, Image, File } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import BlogTopBar from "./components/BlogTopBar.jsx";

export default function BlogPost() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();

  const [post, setPost] = useState(() => (state && state.id === id ? state : null));
  const [loading, setLoading] = useState(!post);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setErr(null);
        const { data } = await axios.get(`http://localhost:5000/blogs/${encodeURIComponent(id)}`, {
        });
        if (!mounted) return;

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

   
    if (!post || (post?.id ?? post?._id) !== id || !post?.sections) {
      load();
    }

    return () => {
      mounted = false;
    };
  }, [id]); 
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

  const getFileIcon = (url) => {
    if (!url) return <File className="w-5 h-5" />;
    
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/)) {
      return <Image className="w-5 h-5 text-emerald-600" />;
    } else if (lowerUrl.match(/\.(pdf)$/)) {
      return <FileText className="w-5 h-5 text-rose-600" />;
    } else if (lowerUrl.match(/\.(doc|docx|txt|rtf)$/)) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    return <File className="w-5 h-5 text-slate-600" />;
  };

  const getFileName = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.split('/').pop() || 'attachment';
    } catch {
      return url.split('/').pop() || 'attachment';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div
        className="fixed top-0 left-0 h-1 bg-[#028090] z-40 transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />

      <BlogTopBar
        showBack
        onBack={() => navigate(-1)}
        enableNew
        createUrl="http://localhost:5000/blogs"
        onCreated={(created) => {
          const newId = created?.id ?? created?._id;
          if (newId) navigate(`/blogs/${newId}`);
        }}
        currentId={post?.id ?? post?._id}
        currentTitle={post?.title}
        currentExcerpt={post?.excerpt}
      />
     
      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        {loading && !post ? (
          <div className="text-slate-500">Loading…</div>
        ) : err ? (
          <div className="text-rose-600">Error: {err}</div>
        ) : !post ? (
          <div className="text-slate-500">Not found.</div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 text-slate-600 text-sm mb-4">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {post.title}
            </h1>
          </>
        )}
      </header>

      {/* Cover */}
      {!post ? null : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            <img
              src={post.cover}
              alt={post.title}
              className="w-full h-64 sm:h-80 object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {!post ? null : (
          <article ref={contentRef} className="space-y-8">
            {(post.sections || []).map((s) => (
              <section key={s.id ?? s._id} id={s.id ?? s._id} data-article-section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">
                  {s.h}
                </h2>
                <div className="space-y-4 text-slate-700 leading-relaxed">
                  {(s.p || []).map((para, i) => (
                    <p key={i} className="text-base">
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-200">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {post.attachments && (
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Paperclip className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Attachments</h3>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {(() => {
                    let attachments = [];
                    if (Array.isArray(post.attachments)) {
                      attachments = post.attachments;
                    } else if (typeof post.attachments === 'string') {
                      try {
                        const parsed = JSON.parse(post.attachments);
                        if (Array.isArray(parsed)) {
                          attachments = parsed;
                        } else {
                          attachments = [post.attachments];
                        }
                      } catch {
                        attachments = [post.attachments];
                      }
                    }
                    
                    return attachments.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center w-20"
                        title={getFileName(url)}
                      >
                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mb-2 group-hover:bg-slate-200 transition-colors">
                          {getFileIcon(url)}
                        </div>
                        <span className="text-xs text-slate-600 text-center truncate w-full">
                          {getFileName(url).substring(0, 12)}
                          {getFileName(url).length > 12 ? '...' : ''}
                        </span>
                      </a>
                    ));
                  })()}
                </div>
              </div>
            )}
          </article>
        )}

        {/* Prev/Next */}
        <div className="mt-12 grid sm:grid-cols-2 gap-4">
          <button
            disabled
            className="group text-left rounded-xl border border-slate-200 bg-white p-4 disabled:opacity-50"
          >
            <div className="text-xs text-slate-500">Previous</div>
            <div className="flex items-center gap-2 text-slate-800 mt-1">
              <ChevronRight className="w-4 h-4 -scale-x-100 text-slate-400" />
              <span className="line-clamp-1 text-sm">—</span>
            </div>
          </button>
          <button
            disabled
            className="group text-right rounded-xl border border-slate-200 bg-white p-4 disabled:opacity-50"
          >
            <div className="text-xs text-slate-500">Next</div>
            <div className="flex items-center justify-end gap-2 text-slate-800 mt-1">
              <span className="line-clamp-1 text-sm">—</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}