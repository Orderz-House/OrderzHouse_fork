// Pagination
export default function Pagination({
  page,
  total,
  pageSize = 12,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Range
  const makeRange = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    const add = (p) => pages.push(p);

    add(1);
    const left = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);

    if (left > 2) add("…");
    for (let p = left; p <= right; p++) add(p);
    if (right < totalPages - 1) add("…");

    add(totalPages);
    return pages;
  };

  const pages = makeRange();
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Button
  const EdgeBtn = ({ disabled, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        "h-10 px-4 rounded-full ring-1 ring-slate-200 bg-white text-slate-700 " +
        "inline-flex items-center gap-2 select-none transition " +
        (disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow")
      }
    >
      {children}
    </button>
  );

  // Icon
  const IconBtn = ({ label, disabled, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={
        "h-8 w-8 rounded-full ring-1 ring-slate-200 bg-white text-slate-700 " +
        "grid place-items-center select-none transition " +
        (disabled ? "opacity-40 cursor-not-allowed" : "hover:shadow")
      }
    >
      {label}
    </button>
  );

  // Pill
  const PagePill = ({ p }) => {
    const active = p === page;
    if (p === "…") {
      return (
        <li className="text-slate-400 select-none px-1">…</li>
      );
    }
    return (
      <li>
        <button
          type="button"
          aria-current={active ? "page" : undefined}
          onClick={() => onPageChange(p)}
          className={
            "h-8 min-w-8 px-3 rounded-full ring-1 ring-slate-200 transition " +
            (active
              ? "bg-[#6d5ffd] text-white font-medium shadow-sm"
              : "bg-white text-slate-700 hover:shadow")
          }
        >
          {p}
        </button>
      </li>
    );
  };

  return (
    <nav className="mt-6 flex items-center justify-between gap-3" aria-label="Pagination">
      {/* Left */}
      <EdgeBtn disabled={!canPrev} onClick={() => canPrev && onPageChange(page - 1)}>
        <span>←</span>
        <span className="hidden sm:inline">Previous</span>
      </EdgeBtn>

      {/* Center */}
      <div className="flex items-center gap-2">
        <IconBtn label="«" disabled={!canPrev} onClick={() => onPageChange(1)} />
        <IconBtn label="‹" disabled={!canPrev} onClick={() => onPageChange(page - 1)} />

        <ul className="flex items-center gap-2">
          {pages.map((p, i) => (
            <PagePill key={`${p}-${i}`} p={p} />
          ))}
        </ul>

        <IconBtn label="›" disabled={!canNext} onClick={() => onPageChange(page + 1)} />
        <IconBtn label="»" disabled={!canNext} onClick={() => onPageChange(totalPages)} />
      </div>

      {/* Right */}
      <EdgeBtn disabled={!canNext} onClick={() => canNext && onPageChange(page + 1)}>
        <span className="hidden sm:inline">Next</span>
        <span>→</span>
      </EdgeBtn>
    </nav>
  );
}
