import { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import GradientButton from "../../buttons/GradientButton.jsx";

// Theme
const THEME = "#028090";
const THEME2 = "#02C39A";
const DARK = "#05668D";

// Config
const USE_MOCK = true;
const API_ENDPOINT = "/api/top-rated";

// Axios
const api = axios.create({
  baseURL: "",
});

// Mock
const MOCK_DATA = [
  {
    name: "Lina M.",
    role: "UI/UX Designer",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=60",
    rate: 45,
    badge: "Figma",
  },
  {
    name: "Omar K.",
    role: "Front-end Dev",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=60",
    rate: 55,
    badge: "React",
  },
  {
    name: "Sofia R.",
    role: "Brand Designer",
    avatar:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&q=60",
    rate: 40,
    badge: "Branding",
  },
  {
    name: "Hadi S.",
    role: "Motion Artist",
    avatar:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200&q=60",
    rate: 60,
    badge: "After Effects",
  },
  {
    name: "Sara A.",
    role: "SEO Strategist",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=60",
    rate: 50,
    badge: "SEO",
  },
  {
    name: "Yousef D.",
    role: "Full-stack Dev",
    avatar:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200&q=60",
    rate: 70,
    badge: "Node.js",
  },
  {
    name: "Maya P.",
    role: "Video Editor",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=60",
    rate: 48,
    badge: "Premiere",
  },
  {
    name: "Ali N.",
    role: "Product Designer",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=60",
    rate: 52,
    badge: "Design System",
  },
  {
    name: "Nour F.",
    role: "Copywriter",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=60",
    rate: 38,
    badge: "Content",
  },
  {
    name: "Rami H.",
    role: "Mobile Dev",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=60",
    rate: 65,
    badge: "Flutter",
  },
  {
    name: "Dana Q.",
    role: "Illustrator",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=60",
    rate: 42,
    badge: "Illustration",
  },
  {
    name: "Karim Z.",
    role: "Data Analyst",
    avatar:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200&q=60",
    rate: 58,
    badge: "Analytics",
  },
];

// Helper
const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

// Fetch
function useTopRated({ useMock }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        if (useMock) {
          await new Promise((r) => setTimeout(r, 400));
          if (mounted) setData(MOCK_DATA);
        } else {
          const res = await api.get(API_ENDPOINT);
          const arr = (res.data ?? []).map((it) => ({
            name: it.name,
            role: it.role,
            avatar: it.avatar,
            rate: it.rate,
            badge: it.badge ?? it.mainSkill,
          }));
          if (mounted) setData(arr);
        }
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      mounted = false;
    };
  }, [useMock]);

  return { data, loading, error };
}

// Hero
export default function HeroFreelancer({ onSearch }) {
  const typeRef = useRef(null);

  // Typing
  useEffect(() => {
    const el = typeRef.current;
    if (!el) return;
    const phrases = [
      "designers",
      "developers",
      "video editors",
      "marketers",
      "SEO experts",
    ];
    let i = 0,
      j = 0,
      deleting = false;
    const tick = () => {
      const word = phrases[i];
      j = deleting ? j - 1 : j + 1;
      el.textContent = word.slice(0, j);
      if (!deleting && j === word.length) {
        deleting = true;
        setTimeout(tick, 1300);
        return;
      }
      if (deleting && j === 0) {
        deleting = false;
        i = (i + 1) % phrases.length;
      }
      setTimeout(tick, deleting ? 40 : 60);
    };
    el.textContent = phrases[0];
    tick();
  }, []);

  // Data
  const { data: topRated, loading, error } = useTopRated({ useMock: USE_MOCK });

  // Rows
  const [row1, row2, row3] = useMemo(() => {
    const rows = chunk(topRated, 4);
    return [rows[0] || [], rows[1] || [], rows[2] || []];
  }, [topRated]);

  // Section
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-white">
      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.12) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Blobs */}
      <div
        className="absolute -top-24 -right-24 w-[38rem] h-[38rem] rounded-full blur-3xl opacity-30 animate-blob"
        style={{
          background: `radial-gradient(closest-side, ${THEME}55, transparent 70%)`,
        }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-[34rem] h-[34rem] rounded-full blur-3xl opacity-30 animate-blob-slower"
        style={{
          background: `radial-gradient(closest-side, ${THEME2}55, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-6 py-10 sm:py-14 md:py-16 w-full grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-center">
        {/* Left */}
        <div className="relative z-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white/70 backdrop-blur text-slate-700 mb-6 shadow-sm">
            <span className="flex -space-x-1">
              <span
                className="w-3.5 h-3.5 rounded-full border border-white"
                style={{ background: DARK }}
              />
              <span
                className="w-3.5 h-3.5 rounded-full border border-white"
                style={{ background: THEME }}
              />
              <span
                className="w-3.5 h-3.5 rounded-full border border-white"
                style={{ background: THEME2 }}
              />
            </span>
            <span className="text-[15px]">10,000+ Creative Professionals</span>
          </div>

          {/* Heading */}
          <h1 className="font-black tracking-tight leading-[0.95]">
            <span
              className="block text-[48px] sm:text-[64px] md:text-[84px] xl:text-[96px]"
              style={{ color: DARK }}
            >
              ORDERZ
            </span>
            <span
              className="block text-[40px] sm:text-[52px] md:text-[68px] xl:text-[78px]"
              style={{ color: THEME2 }}
            >
              HOUSE
            </span>
          </h1>

          {/* Lead */}
          <p className="mt-5 text-xl md:text-2xl text-slate-600 font-semibold">
            Where work finds its perfect home.
          </p>

          {/* Sublead */}
          <p className="mt-3 text-sm text-slate-600">
            Match instantly with{" "}
            <span className="font-semibold text-slate-800">vetted</span>{" "}
            <span
              ref={typeRef}
              className="font-semibold text-[color:var(--t)]"
              style={{ ["--t"]: THEME }}
            >
              designers
            </span>
            .
          </p>

          {/* Search */}
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search skills, e.g. React, Motion design, SEO…"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 outline-none ring-[3px] ring-transparent focus:border-[color:var(--t)] focus:ring-[color:var(--t)]/15 transition"
                style={{ ["--t"]: THEME }}
                onKeyDown={(e) =>
                  e.key === "Enter" && onSearch?.(e.currentTarget.value)
                }
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
      <GradientButton >
        Explore talents
      </GradientButton>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 max-w-xl gap-6">
            <Stat num="10K+" label="Creative Professionals" color={DARK} />
            <Stat num="50K+" label="Projects Delivered" color={THEME} />
            <Stat num="4.9★" label="Client Satisfaction" color={THEME2} />
          </div>

          {/* Error */}
          {!loading && error && (
            <div className="mt-6 text-sm text-red-600">
              Failed to load top rated: {error}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="relative z-0 h-[240px] md:h-[560px] overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 -z-10 blur-3xl opacity-50"
            style={{
              background: `radial-gradient(60% 60% at 50% 40%, ${THEME}22, transparent)`,
            }}
          />

          {/* Mobile */}
          <div className="block md:hidden h-full">
            <MarqueeRow
              items={topRated}
              speed={25}
              direction="left"
              position="middle"
            />
          </div>

          {/* Desktop */}
          <div className="hidden md:block h-full">
            <MarqueeRow
              items={row1}
              speed={16}
              direction="left"
              position="top"
            />
            <MarqueeRow
              items={row2}
              speed={9}
              direction="right"
              position="middle"
            />
            <MarqueeRow
              items={row3}
              speed={14}
              direction="left"
              position="bottom"
            />
          </div>

          {/* Shimmer */}
          {loading && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#05668D] via-[#028090] via-[#00A896] via-[#02C39A] to-[#F0F3BD] opacity-40" />

      {/* Styles */}
      <style>{`
        @keyframes blob { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-8px) scale(1.03)} }
        .animate-blob { animation: blob 9s ease-in-out infinite; }
        .animate-blob-slower { animation: blob 12s ease-in-out infinite; }

        .shine-bar{
          position:absolute; top:0; bottom:0;
          background: linear-gradient(115deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0) 35%,
            rgba(255,255,255,0.55) 50%,
            rgba(255,255,255,0) 65%,
            rgba(255,255,255,0) 100%);
          transform: translate3d(0,0,0);
          animation: cardShine 2.2s ease-in-out infinite;
        }
        @keyframes cardShine{
          0%   { transform: translate3d(-40%,0,0); }
          100% { transform: translate3d(170%,0,0); }
        }
      `}</style>
    </section>
  );
}

// Stat
function Stat({ num, label, color }) {
  return (
    <div className="text-center sm:text-left">
      <div className="text-2xl font-extrabold" style={{ color }}>
        {num}
      </div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

// Card
function TalentCard({ name, role, avatar, rate, badge }) {
  return (
    <div className="pointer-events-auto shrink-0 w-[220px] p-[1px] rounded-2xl bg-white/60 backdrop-blur border border-slate-200 shadow-[0_8px_24px_rgba(2,128,144,0.12)]">
      <div className="relative rounded-2xl overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="shine-bar" style={{ left: "-35%", width: "70%" }} />
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3">
            <img
              src={avatar}
              alt={name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-slate-900">{name}</div>
              <div className="text-xs text-slate-500">{role}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs px-2 py-1 rounded-full border border-slate-200 bg-white">
              {badge}
            </span>
            <span className="text-sm font-medium text-slate-800">
              ${rate}/h
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Marquee
function MarqueeRow({
  items = [],
  speed = 24,
  direction = "left",
  position = "top",
}) {
  const trackRef = useRef(null);
  const segRef = useRef(null);
  const reqRef = useRef(0);
  const lastTsRef = useRef(0);
  const offsetRef = useRef(0);
  const segWidthRef = useRef(0);

  // Measure
  useEffect(() => {
    const measure = () => {
      if (!segRef.current) return;
      segWidthRef.current = segRef.current.getBoundingClientRect().width;
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (segRef.current) ro.observe(segRef.current);
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }, [items]);

  // Loop
  useEffect(() => {
    const dir = direction === "right" ? 1 : -1;

    const step = (ts) => {
      const w = segWidthRef.current;
      if (!trackRef.current || !w) {
        lastTsRef.current = ts;
        reqRef.current = requestAnimationFrame(step);
        return;
      }

      const dt = (ts - (lastTsRef.current || ts)) / 1000;
      lastTsRef.current = ts;

      const v = w / Math.max(0.001, speed);
      let x = offsetRef.current + dir * v * dt;

      if (x <= -w) x += w;
      if (x >= 0) x -= w;

      offsetRef.current = x;
      trackRef.current.style.transform = `translate3d(${x}px,0,0)`;
      reqRef.current = requestAnimationFrame(step);
    };

    reqRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(reqRef.current);
  }, [speed, direction]);

  // Position
  const posStyle =
    position === "top"
      ? { top: "1.5rem" }
      : position === "middle"
      ? { top: "50%", transform: "translateY(-50%)" }
      : { bottom: "1.5rem" };

  // Render
  return (
    <div className="absolute left-0 right-0 flex items-center" style={posStyle}>
      <div
        className="relative w-full overflow-hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0, black 8%, black 92%, transparent 100%)",
          maskImage:
            "linear-gradient(90deg, transparent 0, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          <div ref={segRef} className="flex gap-6 pr-6">
            {items.map((p, i) => (
              <TalentCard key={`a-${i}`} {...p} />
            ))}
          </div>
          <div className="flex gap-6 pr-6" aria-hidden>
            {items.map((p, i) => (
              <TalentCard key={`b-${i}`} {...p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
