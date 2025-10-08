export default function Pagination({
  page,
  total,
  pageSize = 12,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const makeRange = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

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

  const Btn = ({ children, disabled, onClick, className = "" }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        "h-10 min-w-10 px-3 rounded-full grid place-items-center select-none transition " +
        (disabled
          ? "text-slate-300 bg-white ring-1 ring-slate-200 cursor-not-allowed "
          : "text-slate-700 bg-white ring-1 ring-slate-200 hover:shadow ") +
        className
      }
      aria-disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-3"
      aria-label="Pagination"
    >
      <Btn disabled={!canPrev} onClick={() => onPageChange(page - 1)}>
        ←
      </Btn>

      <ul className="flex items-center gap-5">
        {pages.map((p, i) =>
          p === "…" ? (
            <li key={`e${i}`} className="text-slate-400 select-none">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                aria-current={p === page ? "page" : undefined}
                onClick={() => onPageChange(p)}
                className={
                  "text-base transition " +
                  (p === page
                    ? "text-slate-900 font-semibold relative after:block after:h-[2px] after:bg-slate-900 after:mt-1"
                    : "text-slate-500 hover:text-slate-700")
                }
              >
                {p}
              </button>
            </li>
          )
        )}
      </ul>

      <Btn disabled={!canNext} onClick={() => onPageChange(page + 1)}>
        →
      </Btn>
    </nav>
  );
}
