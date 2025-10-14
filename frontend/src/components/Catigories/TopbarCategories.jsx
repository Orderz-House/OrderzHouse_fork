import React, { useRef, useMemo, useEffect, useState } from "react";
import { fetchCategories } from "./api/category";

export function CategoriesRail({ active, onSelect, catalog = {}, theme, themeDark }) {
  const list = useMemo(() => Object.entries(catalog).map(([id, v]) => ({ id, name: v.title })), [catalog]);
  const railRef = useRef(null);

  // Icon components for different categories
  const CategoryIcons = {
    // Design icon - Pen
    design: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 3L21 7L8 20L3 21L4 16L17 3Z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 5L19 9" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    // Content icon - Document/File
    content: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2V8H20" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 13H8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 17H8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 9H8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    // Programming icon
    programming: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 18L22 12L16 6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 6L2 12L8 18" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    // Development icon
    development: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 21H16" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 17V21" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 8L10 11L7 14" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 12H17" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    // Default/fallback icon
    default: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 6V12L16 14" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  };

  // Map category names to icons
  const getIconForCategory = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('content') || nameLower.includes('محتوى')) return CategoryIcons.content;
    if (nameLower.includes('design') || nameLower.includes('تصميم')) return CategoryIcons.design;
    if (nameLower.includes('programming') || nameLower.includes('برمجة')) return CategoryIcons.programming;
    if (nameLower.includes('development') || nameLower.includes('تطوير')) return CategoryIcons.development;
    return CategoryIcons.default;
  };

  return (
    <div className="relative">
      <div
        ref={railRef}
        className="flex gap-2 sm:gap-3 overflow-x-auto py-2 sm:py-3 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <style>{`div::-webkit-scrollbar{display:none}`}</style>
        {list.map((c) => {
          const isActive = c.id.toString() === active;
          const IconComponent = getIconForCategory(c.name);
          
          return (
            <button
              key={c.id}
              onClick={() => onSelect?.(c.id.toString())}
              aria-current={isActive ? "true" : "false"}
              className="snap-start shrink-0 rounded-xl px-3.5 sm:px-4 py-2.5 flex items-center gap-2.5 whitespace-nowrap transition-all duration-200 active:scale-[.98] touch-manipulation min-h-[40px] group"
              style={{
                background: isActive ? `linear-gradient(135deg, ${theme}15 0%, ${theme}08 100%)` : "#fff",
                boxShadow: isActive 
                  ? `inset 0 0 0 2px ${theme}, 0 4px 12px ${theme}20` 
                  : "0 1px 3px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.06)",
                color: isActive ? themeDark : "#0f172a",
              }}
            >
              <span 
                className="w-9 h-9 rounded-lg grid place-items-center transition-all duration-200 group-hover:scale-110" 
                style={{ 
                  background: isActive 
                    ? `linear-gradient(135deg, ${theme} 0%, ${themeDark} 100%)`
                    : `${theme}12`,
                  color: isActive ? "#fff" : theme,
                  boxShadow: isActive ? `0 2px 8px ${theme}30` : "none"
                }}
              >
                <IconComponent />
              </span>
              <span className={`text-sm font-semibold transition-colors ${isActive ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
                {c.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Topbar({ active, onSelect, theme = "#028090", themeDark = "#05668D" }) {
  const [catalog, setCatalog] = useState({});

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await fetchCategories();
        const catalogObj = Object.fromEntries(categories.map((c) => [c.id.toString(), { title: c.name }]));
        setCatalog(catalogObj);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    loadCategories();
  }, []);

  return (
    <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-5">
      <div className="relative rounded-2xl bg-white/70 backdrop-blur shadow-[0_10px_36px_rgba(2,128,144,.12)] ring-1 ring-black/5">
        <div className="relative pl-3 pr-3 sm:px-10">
          <CategoriesRail active={active} onSelect={onSelect} catalog={catalog} theme={theme} themeDark={themeDark} />
        </div>
      </div>
    </div>
  );
}