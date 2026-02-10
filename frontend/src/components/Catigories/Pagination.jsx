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

  const btnBase =
    "inline-flex items-center justify-center gap-2 select-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200/70 ";
  const btnInactive =
    "bg-white border border-slate-200/70 text-slate-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200/70 ";
  const btnDisabled =
    "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-70 ";

  // Button (Prev/Next)
  const EdgeBtn = ({ disabled, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        "h-10 px-4 rounded-full " +
        btnBase +
        (disabled ? btnDisabled : btnInactive)
      }
    >
      {children}
    </button>
  );

  // Icon (‹ › « »)
  const IconBtn = ({ label, disabled, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={
        "h-8 w-8 rounded-full grid place-items-center " +
        btnBase +
        (disabled ? btnDisabled : btnInactive)
      }
    >
      {label}
    </button>
  );

  // Pill (page numbers)
  const PagePill = ({ p }) => {
    const active = p === page;
    if (p === "…") {
      return (
        <li className="text-slate-400 select-none px-1" aria-hidden="true">…</li>
      );
    }
    return (
      <li>
        <button
          type="button"
          aria-current={active ? "page" : undefined}
          onClick={() => onPageChange(p)}
          className={
            "h-8 min-w-8 px-3 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200/70 " +
            (active
              ? "bg-gradient-to-b from-orange-500 to-red-500 text-white font-medium border border-white/20 shadow-sm hover:from-orange-600 hover:to-red-600"
              : "bg-white border border-slate-200/70 text-slate-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200/70")
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
