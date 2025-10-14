import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";


// Theme
const THEME = "#028090";
const THEME_DARK = "rgb(0, 90, 100)";
const THEME_LIGHT = "rgb(0, 170, 180)";

// Data
const DEFAULT_FAQS = [
  {
    question: "Do you offer a free trial?",
    answer:
      "No, a free trial is not necessary because we already provide a free plan.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "Yes, but only after your current subscription period ends.",
  },
  {
    question: "Can I freeze my plan subscription?",
    answer: "No, plans cannot be frozen.",
  },
  {
    question: "When does my plan period start?",
    answer:
      "The plan time counter starts after you receive your first project.",
  },
  {
    question: "Can I deactivate my account?",
    answer:
      "Yes, you can deactivate your account, but only if you do not have any in-progress projects.",
  },
  {
    question: "What happens if I miss a project deadline?",
    answer: "If project deadlines are not met, the contract may be terminated.",
  },
  {
    question: "Do I need to pay for additional services?",
    answer:
      "Any additional services outside your selected plan may require extra fees, which will be clearly communicated before purchase.",
  },
  {
    question: "Are refunds available?",
    answer: "No refunds or returns are offered once a subscription is active.",
  },
  {
    question: "Is the free plan truly free?",
    answer:
      "Yes, the free plan includes limited features to get started with no payment required.",
  },
  {
    question: "Can I switch between monthly and annual billing?",
    answer:
      "You can choose your billing cycle when subscribing, but changes can only occur at the end of the current subscription period.",
  },
  {
    question: "Are there any hidden fees?",
    answer:
      "No, all fees including the one-time verification fee are clearly stated during the subscription process.",
  },
  {
    question: "What if I want to cancel my subscription?",
    answer:
      "You may cancel at any time, but no refunds are provided and your current plan will remain active until the end of the subscription period.",
  },
  {
    question: "Can I have multiple projects under the same plan?",
    answer:
      "Yes, your plan supports multiple projects, but the plan time counter starts when your first project is assigned.",
  },
];

// Category
function deriveCategory(q) {
  const s = q.toLowerCase();
  if (
    s.includes("plan") ||
    s.includes("billing") ||
    s.includes("refund") ||
    s.includes("fees")
  )
    return "Billing";
  if (s.includes("project") || s.includes("deadline")) return "Projects";
  if (s.includes("account") || s.includes("deactivate")) return "Account";
  return "General";
}

// Icons
function CategoryIcon({ cat }) {
  const cls = "w-6 h-6";
  switch (cat) {
    case "Billing":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="3"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "Projects":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          <path
            d="M4 7h16M4 12h10M4 17h7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "Account":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M4 20c2-3.5 6-5 8-5s6 1.5 8 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          <path
            d="M9 9a3 3 0 016 1c0 2-3 2-3 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="18" r="1" fill="currentColor" />
        </svg>
      );
  }
}

// Topic
function TopicCard({ cat, count, onOpen }) {
  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rotateX = (py - 0.5) * -8;
    const rotateY = (px - 0.5) * 10;
    e.currentTarget.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
  };
  const handleLeave = (e) => {
    e.currentTarget.style.transform =
      "perspective(900px) rotateX(0) rotateY(0) translateZ(0)";
  };

  return (
    <button
      onClick={onOpen}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="
        group relative rounded-2xl overflow-hidden
        border border-slate-200 bg-white
        will-change-transform transform-gpu
        transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)]
        shadow-[0_10px_30px_rgba(2,128,144,0.10)]
        hover:shadow-[0_18px_44px_rgba(2,128,144,0.18)]
        text-left
      "
      style={{ transform: "perspective(900px)" }}
    >
      <div
        className="h-1.5"
        style={{
          background: `linear-gradient(90deg, ${THEME} 0%, ${THEME_LIGHT} 50%, #05668D 100%)`,
        }}
      />
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              color: THEME,
              background: "rgba(2,128,144,0.10)",
              boxShadow: "inset 0 0 0 1px rgba(2,128,144,0.18)",
            }}
          >
            <CategoryIcon cat={cat} />
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">{cat}</div>
            <div className="text-xs text-slate-500">{count} articles</div>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-600">
          Explore curated answers and best practices for{" "}
          <span className="text-slate-900 font-medium">{cat}</span>.
        </div>

        <div
          className="mt-4 inline-flex items-center gap-2 text-[13px] text-[color:var(--t)]"
          style={{ ["--t"]: THEME }}
        >
          Read answers
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 5l5 5-5 5" />
          </svg>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(40% 60% at 50% 0%, rgba(2,128,144,0.10), transparent 60%)",
        }}
      />
    </button>
  );
}

// Item
function QAItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 transition"
      >
        <span className="font-medium text-slate-900 text-sm sm:text-lg">{q}</span>
        <span
          className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-slate-500 transition-all ${
            open
              ? "rotate-180 border-[color:var(--t)] text-[color:var(--t)]"
              : ""
          }`}
          style={{ ["--t"]: THEME }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 9l-7 7-7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 text-slate-700 leading-relaxed text-xs sm:text-sm md:text-lg">{a}</div>
        </div>
      </div>
    </div>
  );
}

// Component
export default function FAQVisualGrid({ faqs = DEFAULT_FAQS }) {
  const [openCat, setOpenCat] = useState(null);

  const topics = useMemo(() => {
    const map = new Map();
    faqs.forEach((f) => {
      const cat = deriveCategory(f.question);
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(f);
    });
    const order = ["Billing", "Projects", "Account", "General"];
    return order
      .filter((c) => map.has(c))
      .map((cat) => ({ cat, items: map.get(cat) }));
  }, [faqs]);

  const current = topics.find((t) => t.cat === openCat) || null;

  return (
    <section className="relative bg-white overflow-hidden min-h-[80vh] flex items-center">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Dots */}
        <svg
          className="absolute top-10 left-10 w-32 h-32 opacity-20"
          viewBox="0 0 100 100"
        >
          <defs>
            <pattern
              id="faqDots1"
              patternUnits="userSpaceOnUse"
              width="10"
              height="10"
            >
              <circle cx="5" cy="5" r="1" fill={THEME} />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#faqDots1)" />
        </svg>

        {/* Dots */}
        <svg
          className="absolute bottom-20 right-16 w-40 h-40 opacity-15"
          viewBox="0 0 100 100"
        >
          <defs>
            <pattern
              id="faqDots2"
              patternUnits="userSpaceOnUse"
              width="8"
              height="8"
            >
              <circle cx="4" cy="4" r="1.5" fill={THEME} />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#faqDots2)" />
        </svg>

        {/* Diamond */}
        <div className="absolute top-16 right-20 w-6 h-6 border-2 border-[#028090] rotate-45 opacity-30" />

        {/* Circle */}
        <div className="absolute bottom-32 left-20 w-8 h-8 rounded-full border-2 border-[#028090] opacity-25" />

        {/* Bar */}
        <div className="absolute top-32 right-1/3 w-4 h-8 bg-[#028090] opacity-20 rotate-12" />
      </div>

      {/* Wrapper */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-6 sm:px-5 lg:px-8 py-14 flex-col items-center">
        {/* Badge */}
        <div className="text-center max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full"
            style={{ color: THEME, background: "rgba(2,128,144,0.10)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: THEME }}
            />
            Help Center
          </div>
        </div>

        {/* Heading */}
        <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 text-center">
          How can we help?
        </h2>
        <p className="mt-3 text-slate-600 text-center">
          Explore topics below. Each topic opens detailed answers in a sleek
          modal.
        </p>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {topics.map(({ cat, items }) => (
            <TopicCard
              key={cat}
              cat={cat}
              count={items.length}
              onOpen={() => setOpenCat(cat)}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {current && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40"
            onClick={() => setOpenCat(null)}
          />

          <div
            className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6"
            aria-modal="true"
            role="dialog"
          >
            <div
              className="
                w-full max-w-3xl
                bg-white rounded-2xl shadow-2xl border border-slate-200
                overflow-hidden
                transform-gpu will-change-[transform,opacity]
                transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)]
                animate-[modalIn_.5s_ease]
              "
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ color: THEME, background: "rgba(2,128,144,0.10)" }}
                  >
                    <CategoryIcon cat={current.cat} />
                  </div>
                  <div>
                    <div
                      className="text-xs font-medium"
                      style={{ color: THEME }}
                    >
                      Topic
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {current.cat}
                    </h3>
                  </div>
                </div>

                <button
                  className="p-2 rounded-full hover:bg-slate-100"
                  onClick={() => setOpenCat(null)}
                  aria-label="Close"
                >
                  <svg
                    className="w-5 h-5 text-slate-600"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[70vh] overflow-y-auto">
                <div className="p-5 space-y-3">
                  {current.items.map((f, i) => (
                    <QAItem key={i} q={f.question} a={f.answer} />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-slate-200 flex items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-slate-600">
                  Didn’t find what you need?
                </div>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm md:text-lg text-nowrap"
                  style={{
                    background: THEME,
                    boxShadow: "0 6px 16px rgba(2,128,144,0.25)",
                  }}
                >
                  Contact support
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M12.293 4.293a1 1 0 011.414 0L18 8.586a2 2 0 010 2.828l-4.293 4.293a1 1 0 01-1.414-1.414L14.586 11H4a1 1 0 110-2h10.586l-2.293-2.293a1 1 0 010-1.414z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Styles */}
          <style>{`
            @keyframes modalIn {
              0%   { transform: translateY(12px) scale(.98); opacity: .0; }
              100% { transform: translateY(0)    scale(1);   opacity: 1;  }
            }
          `}</style>
        </>
      )}
    </section>
  );
}
