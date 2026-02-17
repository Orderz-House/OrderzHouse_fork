import React, { useState, useEffect, useCallback, useRef } from "react";

const DEFAULT_TESTIMONIALS = [
  {
    quote: "OrderzHouse made it easy to find skilled freelancers and get projects done on time.",
    name: "Ahmed",
    role: "Freelancer",
  },
  {
    quote: "As a client, I manage multiple projects in one place. The platform is simple and reliable.",
    name: "Sara",
    role: "Customer",
  },
  {
    quote: "Partnering with OrderzHouse expanded our reach. Great support and clear processes.",
    name: "Omar",
    role: "Partner",
  },
  {
    quote: "Fast delivery, quality work, and fair pricing. I recommend it to everyone.",
    name: "Layla",
    role: "Freelancer",
  },
];

function getPrefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Auto-rotating testimonial carousel. Pause on hover, clickable dots.
 * Respects prefers-reduced-motion (no auto-rotate, instant switch).
 */
export default function TestimonialCarousel({ testimonials = DEFAULT_TESTIMONIALS }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const intervalRef = useRef(null);

  const count = testimonials.length;
  const duration = 5200;

  useEffect(() => {
    setReducedMotion(getPrefersReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const goTo = useCallback(
    (index) => {
      setActiveIndex((count + index) % count);
    },
    [count]
  );

  useEffect(() => {
    if (reducedMotion || isPaused || count <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, duration);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reducedMotion, isPaused, count, duration]);

  const cardClass =
    "rounded-2xl bg-white/10 border border-white/10 px-6 pt-6 pb-10 backdrop-blur-md";
  const transitionClass = reducedMotion
    ? ""
    : "transition-all duration-500 ease-out";

  return (
    <div
      className="mt-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="relative overflow-hidden min-h-[210px]">
        {testimonials.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={index}
              role="tabpanel"
              id={`testimonial-${index}`}
              aria-hidden={!isActive}
              aria-label={`Testimonial ${index + 1} of ${count}`}
              className={`absolute inset-0 ${cardClass} ${transitionClass} ${
                isActive
                  ? "opacity-100 translate-y-0 pointer-events-auto z-10"
                  : "opacity-0 translate-y-1 pointer-events-none z-0"
              }`}
            >
              <p className="text-neutral-200 text-sm leading-relaxed">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-10 h-10 rounded-full bg-[#C2410C]/30 flex items-center justify-center text-white font-medium shrink-0">
                  {(item.name || "?").charAt(0)}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{item.name}</p>
                  <p className="text-neutral-400 text-xs">{item.role}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="flex gap-2 mt-6"
        role="tablist"
        aria-label="Testimonial slides"
      >
        {testimonials.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-controls={`testimonial-${i}`}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
              i === activeIndex ? "bg-[#C2410C]" : "bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
