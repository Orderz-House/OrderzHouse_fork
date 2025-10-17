// components/Projects/ProjectDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";

const THEME = "#028090";
const THEME_DARK = "#05668D";

// ====== بيانات موك للمعاينة ======
const MOCK_PROJECT = {
  id: 123,
  title: "Premium Brand Identity & Website for Startups",
  description:
    "We craft a full-stack brand identity (logo system, color, type, brand book) + a modern responsive website with CMS.\n\nDeliverables:\n• Logo system + usage guide\n• Landing page + 4 subpages\n• CMS + basic SEO setup\n• 2 rounds of revisions",
  price: 1299,
  rating: 4.92,
  ratingCount: 84,
  offersVideo: true,
  tags: ["Branding", "UI/UX", "Next.js", "Figma", "SEO"],
  cover:
    "https://images.unsplash.com/photo-1520975922071-a0e6a19d2f2b?q=80&w=1920&auto=format&fit=crop",
  images: [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1508830524289-0adcbe822b40?q=80&w=1600&auto=format&fit=crop",
  ],
  seller: {
    name: "Orderz Studio",
    vetted: true,
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=256&auto=format&fit=crop",
  },
};

// ====== API الحقيقي (لو شغال) ======
async function fetchProjectById(id) {
  const res = await fetch(`http://localhost:5000/projects/${id}`);
  if (!res.ok) throw new Error("Failed to load project");
  const data = await res.json();
  if (!data?.project) throw new Error("Project not found");
  return data.project;
}

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { search, state } = location;

  const [project, setProject] = useState(null);
  const [activeImg, setActiveImg] = useState(null);
  const [loading, setLoading] = useState(true);

  const forceMock = new URLSearchParams(search).get("mock") === "1";

  // 🟢 1) لو وصلنا project من الكارد عبر state – اعرضه فورًا
  useEffect(() => {
    const fromState = state?.project;
    if (fromState && String(fromState.id) === String(id)) {
      const imgs = [fromState.cover, ...(Array.isArray(fromState.images) ? fromState.images : [])].filter(Boolean);
      setProject(fromState);
      setActiveImg(imgs[0] || null);
      setLoading(false); // عرض فوري
    }
  }, [state, id]);

  // 🟢 2) جلب من الداتابيس (أو موك) — يعمل دائمًا لضمان التحديث عند الدخول المباشر أو تحديث البيانات
  useEffect(() => {
    let alive = true;

    const setWithImages = (p) => {
      if (!alive) return;
      setProject(p);
      const imgs = [p.cover, ...(Array.isArray(p.images) ? p.images : [])].filter(Boolean);
      setActiveImg(imgs[0] || null);
    };

    (async () => {
      try {
        // لو طلبت فرض الموك: استخدمه
        if (forceMock) {
          setWithImages(MOCK_PROJECT);
        } else {
          // Fetch من السيرفر
          const p = await fetchProjectById(id);
          setWithImages(p);
        }
      } catch {
        // fallback موك فقط لو ما عندي بيانات من state
        if (!state?.project) {
          setWithImages(MOCK_PROJECT);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, forceMock, state?.project]);

  const gallery = useMemo(() => {
    if (!project) return [];
    const arr = [project.cover, ...(Array.isArray(project.images) ? project.images : [])].filter(Boolean);
    return Array.from(new Set(arr));
  }, [project]);

  if (loading || !project) {
    // سكِلِتون خفيف
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-6 w-32 rounded bg-slate-200 animate-pulse mb-6" />
        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          <div>
            <div className="aspect-[16/9] w-full rounded-2xl bg-slate-200 animate-pulse mb-4" />
            <div className="grid grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-video rounded-xl bg-slate-200 animate-pulse" />
              ))}
            </div>
            <div className="mt-8 space-y-3">
              <div className="h-5 w-1/2 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
          <aside className="h-[420px] rounded-2xl border border-slate-200 bg-white p-6">
            <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-4" />
            <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
          </aside>
        </div>
      </section>
    );
  }

  const {
    title,
    description,
    price,
    rating = 4.9,
    ratingCount = 32,
    tags = [],
    offersVideo,
    seller = {},
  } = project;

  return (
    <section className="relative bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm">
          <nav className="flex items-center gap-2 text-slate-500">
            <Link to="/" className="hover:text-slate-700 transition">Home</Link>
            <span>/</span>
            <Link to="/projectsPage" className="hover:text-slate-700 transition">Projects</Link>
            <span>/</span>
            <span className="text-slate-700 truncate max-w-[40ch]">{title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* العنوان */}
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: THEME_DARK }}>
            {title}
          </h1>
        </header>

        <div className="grid lg:grid-cols-[1fr,380px] gap-10">
          {/* اليسار: معرض + تفاصيل */}
          <div>
            {/* المعرض */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
              <div className="aspect-[16/9] bg-slate-50">
                {activeImg ? (
                  <img src={activeImg} alt={title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">No image</div>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="p-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {gallery.map((img, i) => {
                      const isActive = img === activeImg;
                      return (
                        <button
                          type="button"
                          key={`${img}-${i}`}
                          onClick={() => setActiveImg(img)}
                          className={`relative aspect-video rounded-xl overflow-hidden ring-2 transition ${
                            isActive ? "ring-[3px]" : "ring-transparent hover:ring-slate-200"
                          }`}
                          style={{
                            boxShadow: isActive ? `0 0 0 2px ${THEME}` : undefined,
                            borderColor: THEME,
                          }}
                          aria-label={`Image ${i + 1}`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                <Star className="w-4 h-4" />
                <span>{Number(rating).toFixed(1)}</span>
                <span className="text-slate-400">({ratingCount})</span>
              </div>
              {offersVideo && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  <PlayCircle className="w-4 h-4" /> Video walk-through
                </span>
              )}
              {seller?.vetted && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700">
                  <ShieldCheck className="w-4 h-4" /> Vetted Seller
                </span>
              )}
            </div>

            {/* الوصف */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-800 mb-3">About this project</h2>
              <p className="leading-7 text-slate-700 whitespace-pre-line">
                {description || "No description provided."}
              </p>

              {Array.isArray(tags) && tags.length > 0 && (
                <>
                  <h3 className="mt-6 mb-2 text-sm font-semibold text-slate-700">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-sm border border-slate-200 bg-slate-50"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* اليمين: بطاقة ثابتة */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#028090] to-[#026e7a] flex items-center justify-center">
                    {seller?.avatar ? (
                      <img src={seller.avatar} alt={seller.name || "Seller"} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-sm font-semibold">
                        {(seller?.name || "S")[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Seller</p>
                    <p className="font-semibold text-slate-800">{seller?.name || "Unknown"}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Starting from</span>
                  <span className="text-2xl font-black" style={{ color: THEME_DARK }}>
                    {project.price ? `$${project.price}` : "—"}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <button
                  className="w-full h-11 rounded-xl text-white font-semibold transition hover:shadow-lg"
                  style={{ backgroundColor: THEME }}
                >
                  Get this project
                </button>
                <button
                  className="w-full h-11 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition"
                >
                  Contact seller
                </button>

                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Secure checkout
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Money-back guarantee
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 24/7 support
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="mt-4 inline-flex items-center gap-2 text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}
