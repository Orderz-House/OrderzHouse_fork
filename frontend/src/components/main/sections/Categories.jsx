import React from "react";

const categories = [
  {
    title: "Programming",
    description: "Build web apps, APIs, and automations with modern tools.",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=80",
    tilt: "lg:-rotate-6",
    offset: "lg:translate-y-8",
  },
  {
    title: "Design",
    description: "Create clean UI, brand visuals, and delightful experiences.",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80",
    tilt: "lg:rotate-0",
    offset: "lg:translate-y-0",
  },
  {
    title: "Content Writing",
    description: "Write landing pages, product copy, and SEO-friendly articles.",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80",
    tilt: "lg:rotate-6",
    offset: "lg:translate-y-8",
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
      className="relative isolate overflow-hidden bg-slate-50 sm:bg-white min-h-screen sm:h-screen"
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
        

@media (max-width: 640px) {
  .card-reveal {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    animation: none !important;
  }
}
}

/* ✅ Mobile carousel helpers */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

      `}</style>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-12 sm:h-16 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[90] h-10 sm:h-14 bg-gradient-to-b from-transparent via-white/80 to-white" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-5 sm:px-6 py-10 sm:py-14">
        <h1
          className={[
            "text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl",
            "sm:transition-all sm:duration-700 sm:ease-out sm:motion-safe:will-change-[transform,opacity,filter]",
            inView
              ? "opacity-100 translate-y-0 blur-0 sm:opacity-100 sm:translate-y-0 sm:blur-0"
              : "opacity-100 translate-y-0 blur-0 sm:opacity-0 sm:translate-y-6 sm:blur-sm",
          ].join(" ")}
        >
          Discover categories in seconds
        </h1>

        <p
          className={[
            "mt-2 max-w-2xl text-center text-sm leading-6 text-slate-600 sm:mt-3 sm:text-base sm:leading-7",
            "sm:transition-all sm:duration-700 sm:ease-out sm:delay-150 sm:motion-safe:will-change-[transform,opacity,filter]",
            inView
              ? "opacity-100 translate-y-0 blur-0 sm:opacity-100 sm:translate-y-0 sm:blur-0"
              : "opacity-100 translate-y-0 blur-0 sm:opacity-0 sm:translate-y-6 sm:blur-sm",
          ].join(" ")}
        >
          Pick what you need — code, visuals, or words.
        </p>

        <div className="mt-10 w-full">
          <div className="no-scrollbar flex w-full gap-5 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scroll-px-6 md:mx-0 md:px-0 md:pb-0 md:grid md:overflow-visible md:snap-none md:grid-cols-3 md:gap-7">
          {categories.map((c, i) => (
            <div
              key={c.title}
              className={[
                "group relative w-[84%] shrink-0 snap-center md:w-full md:shrink md:snap-align-none",
                c.tilt,
                c.offset,
                "transition-transform duration-300 sm:hover:rotate-0 sm:hover:scale-[1.02]",
              ].join(" ")}
            >
              <div
                className={inView ? "card-reveal" : "opacity-0"}
                style={{ "--d": `${220 + i * 140}ms` }}
              >
                {/* soft glow behind */}
                <div className="pointer-events-none absolute -inset-4 rounded-[40px] sm:rounded-[36px] bg-gradient-to-br from-amber-200/30 via-violet-200/20 to-rose-200/30 blur-xl sm:blur-2xl opacity-55 sm:opacity-70 transition sm:group-hover:opacity-100" />

                {/* ✅ shadow أوضح (بدون ما نغيّر شكل الكارد) */}
                <div className="relative rounded-[30px] sm:rounded-3xl p-[1px] bg-gradient-to-br from-white/80 via-slate-200/60 to-white/80 shadow-none lg:shadow-[0_18px_55px_rgba(17,24,39,0.16)]">
                  <div className="rounded-[26px] border border-white/60 bg-white/70 p-4 sm:p-6 backdrop-blur-xl">
                    <div className="relative mb-4 sm:mb-5 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 h-36 sm:h-44 overflow-hidden rounded-t-[26px]">
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

                    <h3 className="mt-3 text-sm sm:text-lg font-semibold tracking-tight text-slate-900">
                      {c.title}
                    </h3>

                    <p className="mt-2 hidden text-sm leading-6 text-slate-600 sm:block">
                      {c.description}
                    </p>

                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-slate-200/70 to-transparent" />

                    <div className="mt-4 text-xs sm:text-sm font-medium text-slate-900/80">
                      Explore{" "}
                      <span className="inline-block transition sm:group-hover:translate-x-0.5">
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
    </div>
  );
}
