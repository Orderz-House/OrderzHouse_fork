import { useEffect, useRef } from "react";

const THEME = "#028090";
const THEME2 = "#02C39A";
const DARK = "#05668D";

export default function HeroSection({ onSearch }) {
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

    let i = 0;
    let j = 0;
    let deleting = false;

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
      <div className="relative z-10 max-w-screen-xl mx-auto px-6 w-full grid lg:grid-cols-[1.1fr_.9fr] gap-30 items-center">
        {/* Left */}
        <div className="relative z-20">
          {/* Badge */}
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

          {/* Title */}
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

          {/* Subtitle */}
          <p className="mt-5 text-xl md:text-2xl text-slate-600 font-semibold">
            Where work finds its perfect home.
          </p>

          {/* Roles */}
          <p className="mt-3 text-lg text-slate-600">
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
            <button
              className="rounded-2xl px-5 py-3 text-white font-medium shadow-lg hover:shadow-xl transition"
              style={{
                background: `linear-gradient(90deg, ${DARK}, ${THEME})`,
              }}
              onClick={() => onSearch?.("")}
            >
              Explore talents
            </button>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 max-w-xl gap-6">
            <Stat num="10K+" label="Creative Professionals" color={DARK} />
            <Stat num="50K+" label="Projects Delivered" color={THEME} />
            <Stat num="4.9★" label="Client Satisfaction" color={THEME2} />
          </div>
        </div>

        {/* Right */}
        <div className="relative z-0 h-[240px] md:h-[560px] overflow-hidden pointer-events-none">
          {/* Glow */}
          <div
            className="absolute inset-0 -z-10 blur-3xl opacity-50"
            style={{
              background: `radial-gradient(60% 60% at 50% 40%, ${THEME}22, transparent)`,
            }}
          />

          {/* Mobile */}
          <div className="block md:hidden h-full">
            <MarqueeRow
              items={CARDS_MID}
              speed={25}
              direction="left"
              position="middle"
            />
          </div>

          {/* Desktop */}
          <div className="hidden md:block h-full">
            <MarqueeRow
              items={CARDS_TOP}
              speed={22}
              direction="left"
              position="top"
            />
            <MarqueeRow
              items={CARDS_MID}
              speed={24}
              direction="right"
              position="middle"
            />
            <MarqueeRow
              items={CARDS_BOT}
              speed={28}
              direction="left"
              position="bottom"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#05668D] via-[#028090] via-[#00A896] via-[#02C39A] to-[#F0F3BD] opacity-40" />

      {/* Styles */}
      <style>{`
        @keyframes marqueeTrack {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track { animation: marqueeTrack var(--dur) linear infinite; }

        @keyframes blob {
          0%,100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.03); }
        }
        .animate-blob { animation: blob 9s ease-in-out infinite; }
        .animate-blob-slower { animation: blob 12s ease-in-out infinite; }

        @keyframes shine {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
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
        <div
          className="absolute inset-y-0 left-0 w-10 -skew-x-12 bg-white/30 translate-x-[-120%] will-change-transform"
          style={{ animation: "shine 3.5s ease-in-out infinite" }}
        />
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
  const posStyle =
    position === "top"
      ? { top: "1.5rem" }
      : position === "middle"
      ? { top: "50%", transform: "translateY(-50%)" }
      : { bottom: "1.5rem" };

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
          className="marquee-track inline-flex gap-6 will-change-transform"
          style={{
            ["--dur"]: `${speed}s`,
            animationDirection: direction === "right" ? "reverse" : "normal",
          }}
        >
          {items.map((p, i) => (
            <TalentCard key={`a-${i}`} {...p} />
          ))}
          {items.map((p, i) => (
            <TalentCard key={`b-${i}`} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}

// DataTop
const CARDS_TOP = [
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
];

// DataMid
const CARDS_MID = [
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
];

// DataBot
const CARDS_BOT = [
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
