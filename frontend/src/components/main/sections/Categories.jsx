import React from "react";

const categories = [
  {
    title: "Programming",
    description: "Build web apps, APIs, and automations with modern tools.",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=80",
    tilt: "sm:-rotate-6",
    offset: "sm:translate-y-8",
  },
  {
    title: "Design",
    description: "Create clean UI, brand visuals, and delightful experiences.",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80",
    tilt: "sm:rotate-0",
    offset: "sm:translate-y-0",
  },
  {
    title: "Content Writing",
    description: "Write landing pages, product copy, and SEO-friendly articles.",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80",
    tilt: "sm:rotate-6",
    offset: "sm:translate-y-8",
  },
];

function useInViewOnce(
  options = { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
) {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current || inView) return;

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.disconnect(); // مرة واحدة فقط
      }
    }, options);

    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [inView, options]);

  return { ref, inView };
}

export default function CategoriesShowcase() {
  const { ref: sectionRef, inView } = useInViewOnce();

  return (
    <div
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-white h-screen"
    >
      {/* ✅ FIX: إزالة clip-path لأنه يقص الشادو */}
      <style>{`
        .card-reveal {
          opacity: 0;
          transform: translateY(26px) scale(.965);
          filter: blur(10px);
          animation: cardIn 900ms cubic-bezier(.16, 1, .3, 1) forwards;
          animation-delay: var(--d, 0ms);
          will-change: transform, opacity, filter;
        }

        @keyframes cardIn {
          0% {
            opacity: 0;
            transform: translateY(26px) scale(.965) rotate(-1.2deg);
            filter: blur(10px);
          }
          60% {
            opacity: 1;
            transform: translateY(2px) scale(1.01) rotate(.3deg);
            filter: blur(0px);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1) rotate(0deg);
            filter: blur(0px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .card-reveal {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-16 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[90] h-14 bg-gradient-to-b from-transparent via-white/80 to-white" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-14">
        <h1
          className={[
            "text-center text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl",
            "transition-all duration-700 ease-out motion-safe:will-change-[transform,opacity,filter]",
            inView
              ? "opacity-100 translate-y-0 blur-0"
              : "opacity-0 translate-y-6 blur-sm",
          ].join(" ")}
        >
          Discover categories that fit your workflow in seconds
        </h1>

        <p
          className={[
            "mt-3 max-w-2xl text-center text-slate-600",
            "transition-all duration-700 ease-out delay-150 motion-safe:will-change-[transform,opacity,filter]",
            inView
              ? "opacity-100 translate-y-0 blur-0"
              : "opacity-0 translate-y-6 blur-sm",
          ].join(" ")}
        >
          Choose what you need and start building faster — from code to visuals
          to words.
        </p>

        <div className="mt-10 grid w-full grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-7">
          {categories.map((c, i) => (
            <div
              key={c.title}
              className={[
                "group relative",
                c.tilt,
                c.offset,
                "transition-transform duration-300 hover:rotate-0 hover:scale-[1.02]",
              ].join(" ")}
            >
              <div
                className={inView ? "card-reveal" : "opacity-0"}
                style={{ "--d": `${220 + i * 140}ms` }}
              >
                {/* soft glow behind */}
                <div className="pointer-events-none absolute -inset-4 rounded-[36px] bg-gradient-to-br from-amber-200/35 via-violet-200/25 to-rose-200/35 blur-2xl opacity-70 transition group-hover:opacity-100" />

                {/* ✅ shadow أوضح (بدون ما نغيّر شكل الكارد) */}
                <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-white/80 via-slate-200/60 to-white/80 shadow-[0_18px_55px_rgba(17,24,39,0.16)]">
                  <div className="rounded-[23px] border border-white/60 bg-white/70 p-6 backdrop-blur-xl">
                    <div className="relative mb-5 -mx-6 -mt-6 h-44 overflow-hidden rounded-t-[23px]">
                      <img
                        src={c.image}
                        alt={c.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        draggable={false}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/70 via-white/0 to-white/0" />
                    </div>

                    <div className="inline-flex items-center rounded-full border border-slate-200/60 bg-white/70 px-3 py-1 text-xs text-slate-600">
                      Category
                    </div>

                    <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                      {c.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {c.description}
                    </p>

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-slate-200/70 to-transparent" />

                    <div className="mt-4 text-sm font-medium text-slate-900/80">
                      Explore{" "}
                      <span className="inline-block transition group-hover:translate-x-0.5">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* نهاية card-reveal */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
