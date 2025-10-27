import React, { useEffect, useState } from "react";
import { fetchSubSubCategoriesByCategoryId } from "./api/category";

// Projects API
import {
  fetchAuthProjectsByCategory,
  fetchAuthProjectsBySubSubCategory,
  fetchAuthProjectsBySubCategory,
} from "./api/projects";

import ProjectCard from "./ProjectCard";

export default function SubSidebar({
  mode = "projects",       
  categoryId,
  activeSubSub,
  onSelectSubSub,
  theme = "#028090",
  subCategoryId,
}) {
  const [subSubs, setSubSubs] = useState([]);
  const [items, setItems] = useState([]);
  const [loadingSubSubs, setLoadingSubSubs] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  const isTasks = mode === "tasks";

  useEffect(() => {
    if (!categoryId) return setSubSubs([]);
    setLoadingSubSubs(true);
    fetchSubSubCategoriesByCategoryId(Number(categoryId))
      .then((data) => setSubSubs(Array.isArray(data) ? data : []))
      .catch(() => setSubSubs([]))
      .finally(() => setLoadingSubSubs(false));
  }, [categoryId]);

  useEffect(() => {
    if (!categoryId) return setItems([]);
    setLoadingItems(true);

    const run = async () => {
      try {
        if (activeSubSub) {
          const data = isTasks
            ? await fetchAuthTasksBySubSubCategory(Number(activeSubSub))
            : await fetchAuthProjectsBySubSubCategory(Number(activeSubSub));
          setItems(Array.isArray(data) ? data : []);
          return;
        }
        if (subCategoryId) {
          const data = isTasks
            ? await fetchAuthTasksBySubCategory(Number(subCategoryId))
            : await fetchAuthProjectsBySubCategory(Number(subCategoryId));
          setItems(Array.isArray(data) ? data : []);
          return;
        }
        const data = isTasks
          ? await fetchAuthTasksByCategory(Number(categoryId))
          : await fetchAuthProjectsByCategory(Number(categoryId));
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoadingItems(false);
      }
    };

    run();
  }, [categoryId, activeSubSub, subCategoryId, isTasks]);

  if (!categoryId) return null;
  const hasSidebar = subSubs.length > 0;

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[16/9] bg-slate-200 rounded-xl mb-3"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  const Chip = ({ active, children, onClick }) => (
    <button
      onClick={onClick}
      type="button"
      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
        active ? "text-slate-900" : "text-slate-700 hover:text-slate-900 bg-white"
      }`}
      style={{
        background: active ? `${theme}14` : undefined,
        borderColor: active ? theme : "rgb(226 232 240)",
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full">
      {hasSidebar && (
        <div className="lg:hidden -mx-1 mb-4">
          <div
            className="subchips flex items-center gap-2 overflow-x-auto pb-1 px-1 [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <style>{`.subchips::-webkit-scrollbar{display:none}`}</style>

            <Chip active={!activeSubSub} onClick={() => onSelectSubSub("")}>
              All
            </Chip>

            {subSubs.map((sub) => (
              <Chip
                key={sub.id}
                active={sub.id.toString() === activeSubSub}
                onClick={() => onSelectSubSub(sub.id.toString())}
              >
                {sub.name}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div className="flex w-full gap-6 lg:gap-8">
        {hasSidebar && (
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 rounded-2xl border border-slate-200/70 bg-white shadow-sm">
              <div className="p-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700">Filter</h3>
              </div>

              <nav className="p-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 160px)" }}>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => onSelectSubSub("")}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all group ${
                        !activeSubSub
                          ? "bg-gradient-to-r from-emerald-50 to-transparent border-l-4"
                          : "hover:bg-slate-50"
                      }`}
                      style={{ borderLeftColor: !activeSubSub ? theme : "transparent" }}
                    >
                      <span className={`text-sm font-semibold ${!activeSubSub ? "text-slate-900" : "text-slate-700"}`}>
                        All
                      </span>
                    </button>
                  </li>

                  {subSubs.map((sub) => {
                    const isActive = sub.id.toString() === activeSubSub;
                    return (
                      <li key={sub.id}>
                        <button
                          onClick={() => onSelectSubSub(sub.id.toString())}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-all group ${
                            isActive
                              ? "bg-gradient-to-r from-emerald-50 to-transparent border-l-4"
                              : "hover:bg-slate-50"
                          }`}
                          style={{ borderLeftColor: isActive ? theme : "transparent" }}
                        >
                          <span
                            className={`text-sm font-semibold transition-colors ${
                              isActive ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
                            }`}
                          >
                            {sub.name}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </aside>
        )}

        <div className="flex-1 min-w-0">
          {loadingItems ? (
            <SkeletonGrid />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h3 className="text-lg font-semibold text-slate-700 mb-1">
                {isTasks ? "No tasks found" : "No projects found"}
              </h3>
              <p className="text-sm text-slate-500">Try selecting a different category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((it) => (
                <ProjectCard
                  key={it.id}
                  project={it}           
                  theme={theme}
                  linkBase={isTasks ? "tasks" : "projects"}
                  priceField={isTasks ? "budget" : "price"} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
