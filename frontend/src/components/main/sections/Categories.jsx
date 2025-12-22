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
    description:
      "Write landing pages, product copy, and SEO-friendly articles.",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80",
    tilt: "sm:rotate-6",
    offset: "sm:translate-y-8",
  },
];
function useInViewOnce(options = { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }) {
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
    <div ref={sectionRef} className="relative isolate overflow-hidden bg-white h-screen">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-16 bg-gradient-to-b from-white to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[90] h-14 bg-gradient-to-b from-transparent via-white/80 to-white" />

       {/* ✅ Background soft glows (yellow + orange) */}
          {/* <div className="pointer-events-none absolute -top-28 left-[-80px] h-[320px] w-[320px] rounded-full bg-yellow-300/10 blur-3xl" />
          <div className="pointer-events-none absolute -top-28 right-[-90px] h-[340px] w-[340px] rounded-full bg-orange-400/10 blur-3xl" /> */}
          {/* Glow خفيف تحت عشان الامتداد السفلي */}
          {/* <div className="pointer-events-none absolute bottom-[-120px] left-[10%] h-[360px] w-[360px] rounded-full bg-yellow-300/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-140px] right-[8%] h-[380px] w-[380px] rounded-full bg-orange-400/20 blur-3xl" /> */}

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-14">
        
        
        <h1
  className={[
    "text-center text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl",
    "transition-all duration-700 ease-out motion-safe:will-change-[transform,opacity,filter]",
    inView ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-6 blur-sm",
  ].join(" ")}
>
  Discover categories that fit your workflow in seconds
</h1>

<p
  className={[
    "mt-3 max-w-2xl text-center text-slate-600",
    "transition-all duration-700 ease-out delay-150 motion-safe:will-change-[transform,opacity,filter]",
    inView ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-6 blur-sm",
  ].join(" ")}
>
  Choose what you need and start building faster — from code to visuals to words.
</p>

        <div className="mt-10 grid w-full grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-7">
          {categories.map((c) => (
  <div
    key={c.title}
    className={[
      "group relative transform transition duration-300 hover:rotate-0 hover:scale-[1.02]",
      c.tilt,
      c.offset,
    ].join(" ")}
  >
    {/* soft glow behind (hero-like) */}
    <div className="pointer-events-none absolute -inset-4 rounded-[36px] bg-gradient-to-br from-amber-200/35 via-violet-200/25 to-rose-200/35 blur-2xl opacity-70 transition group-hover:opacity-100" />

    {/* gradient border */}
    <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-white/80 via-slate-200/60 to-white/80 shadow-[0_35px_80px_-55px_rgba(0,0,0,0.45)]">
      {/* glass body */}
      <div className="rounded-[23px] border border-white/60 bg-white/70 p-6 backdrop-blur-xl">
        {/* image fills top/left/right */}
        <div className="relative mb-5 -mx-6 -mt-6 h-44 overflow-hidden rounded-t-[23px]">
          <img
            src={c.image}
            alt={c.title}
            className="h-full w-full object-cover"
            loading="lazy"
            draggable={false}
          />
          {/* subtle overlay like hero */}
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
          Explore <span className="inline-block transition group-hover:translate-x-0.5">→</span>
        </div>
      </div>
    </div>
  </div>
))}

        </div>
      </div>
    </div>
  );
}
