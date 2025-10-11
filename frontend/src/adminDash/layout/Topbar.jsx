import { FaBars } from "react-icons/fa";

export default function Topbar({ onMenu, title = "" }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/90 backdrop-blur">
      <div className="h-12 md:h-14 flex items-center gap-3 px-3 text-slate-100">
        <button
          onClick={onMenu}
          className="md:hidden h-9 w-9 grid place-items-center rounded-xl bg-white/10 hover:bg-white/20"
          aria-label="فتح القائمة"
          title="فتح القائمة"
        >
          <FaBars size={16} />
        </button>

        <h1 className="text-sm md:text-base font-semibold">{title}</h1>
      </div>
    </header>
  );
}
