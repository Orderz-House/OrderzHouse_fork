import React from "react";
import { Menu } from "lucide-react";

export default function TopBar({ title, onToggleSidebar, rightContent }) {
  return (
    <div
      className="
        sticky top-0 z-40
        -mx-3 md:-mx-6 px-3 md:px-6
        h-[69px]
        flex items-center justify-between
        bg-white
        border-b border-slate-200
      "
    >
      {/* يسار: زر السايدبار + العنوان */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="
            inline-flex items-center justify-center
            w-10 h-10 rounded-xl
            border border-slate-200 bg-white
            hover:bg-slate-100 active:scale-95 transition
          "
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        <h1 className="text-xl font-semibold text-slate-800 truncate">
          {title}
        </h1>
      </div>

      {/* يمين: البحث أو الفلاتر أو زر إضافة */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {rightContent}
      </div>
    </div>
  );
}
