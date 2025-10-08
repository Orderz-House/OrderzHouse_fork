import { useMemo, useRef } from "react";

export default function TopbarCategories({
  active,
  onSelect,
  catalog, // { web:{title,...}, design:{...}, ... }
  theme, // THEME
  themeDark, // THEME_DARK
}) {
  const list = useMemo(
    () => Object.entries(catalog).map(([id, v]) => ({ id, name: v.title })),
    [catalog]
  );

  const Icon = ({ id }) => {
    const cls = "w-5 h-5";
    switch (id) {
      case "web":
        return (
          <svg viewBox="0 0 24 24" className={cls} fill="none">
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M3 12h18M12 3c3 3 3 18 0 18M12 3c-3 3-3 18 0 18"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        );
      case "design":
        return (
          <svg viewBox="0 0 24 24" className={cls} fill="none">
            <path
              d="M4 16l6-10 6 10H4z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="16" cy="17" r="2" fill="currentColor" />
          </svg>
        );
      case "video":
        return (
          <svg viewBox="0 0 24 24" className={cls} fill="none">
            <rect
              x="3"
              y="6"
              width="14"
              height="12"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M17 10l4-2v8l-4-2v-4z" fill="currentColor" />
          </svg>
        );
      case "seo":
        return (
          <svg viewBox="0 0 24 24" className={cls} fill="none">
            <path
              d="M4 13l4 4 8-10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );
      case "content":
        return (
          <svg viewBox="0 0 24 24" className={cls} fill="none">
            <rect
              x="4"
              y="5"
              width="16"
              height="14"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M8 9h8M8 13h6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );
      case "data":
      default:
        return (
          <svg viewBox="0 0 24 24" className={cls} fill="none">
            <rect
              x="4"
              y="10"
              width="4"
              height="8"
              rx="1"
              fill="currentColor"
            />
            <rect
              x="10"
              y="6"
              width="4"
              height="12"
              rx="1"
              fill="currentColor"
            />
            <rect
              x="16"
              y="12"
              width="4"
              height="6"
              rx="1"
              fill="currentColor"
            />
          </svg>
        );
    }
  };

  const railRef = useRef(null);
  const doScroll = (dx) =>
    railRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-5">
      <div className="relative rounded-2xl bg-white/70 backdrop-blur shadow-[0_10px_36px_rgba(2,128,144,.12)] ring-1 ring-black/5">
        <div className="relative pl-3 pr-3 sm:px-10">
          {/* الحاوية القابلة للتمرير */}
          <div
            ref={railRef}
            className="
              flex gap-2 sm:gap-3 overflow-x-auto py-2 sm:py-3
              snap-x snap-mandatory
              [-ms-overflow-style:none] [scrollbar-width:none]
            "
            style={{
              WebkitOverflowScrolling: "touch", // سلاسة iOS
            }}
          >
            <style>{`div::-webkit-scrollbar{display:none}`}</style>

            {list.map((c) => {
              const isActive = c.id === active;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  aria-current={isActive ? "true" : "false"}
                  className="
                    snap-start shrink-0 rounded-xl
                    px-3.5 sm:px-4 py-2.5
                    flex items-center gap-2
                    whitespace-nowrap transition
                    active:scale-[.98] touch-manipulation
                    min-h-[40px]
                  "
                  style={{
                    background: "#fff",
                    boxShadow: isActive
                      ? `inset 0 0 0 2px ${theme}`
                      : "0 1px 0 rgba(15,23,42,.06)",
                    color: isActive ? themeDark : "#0f172a",
                  }}
                >
                  <span
                    className="w-8 h-8 rounded-full grid place-items-center"
                    style={{ background: "rgba(2,128,144,.10)", color: theme }}
                  >
                    <Icon id={c.id} />
                  </span>
                  <span className="text-sm font-semibold">{c.name}</span>
                </button>
              );
            })}
          </div>

          {/* أسهم التنقل: لسطح المكتب فقط */}
          <button
            aria-label="Prev"
            onClick={() => doScroll(-380)}
            className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow ring-1 ring-black/5 items-center justify-center hover:shadow-md"
          >
            <svg viewBox="0 0 20 20" className="w-5 h-5">
              <path
                d="M12.5 4.5l-5 5 5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            aria-label="Next"
            onClick={() => doScroll(380)}
            className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow ring-1 ring-black/5 items-center justify-center hover:shadow-md"
          >
            <svg viewBox="0 0 20 20" className="w-5 h-5">
              <path
                d="M7.5 4.5l5 5-5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Edge fades بدلاً من الـ mask (لا تُبهّت الأزرار) */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 sm:w-10 rounded-l-2xl bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 sm:w-10 rounded-r-2xl bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>
    </div>
  );
}
