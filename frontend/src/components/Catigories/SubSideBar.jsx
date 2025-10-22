import React, { useEffect, useState } from "react";
import { fetchSubSubCategoriesByCategoryId } from "./api/category";
import {
  fetchAuthProjectsByCategory,
  fetchAuthProjectsBySubSubCategory,
  fetchAuthProjectsBySubCategory,
} from "./api/projects";
import ProjectCard from "./ProjectCard";

export default function SubSidebar({
  categoryId,
  activeSubSub,
  onSelectSubSub,
  theme = "#028090",
  subCategoryId, // موجود مسبقاً
}) {
  const [subSubs, setSubSubs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingSubSubs, setLoadingSubSubs] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // اجلب sub-sub-categories للكـاتيجوري المختار
  useEffect(() => {
    if (!categoryId) return setSubSubs([]);
    setLoadingSubSubs(true);
    fetchSubSubCategoriesByCategoryId(Number(categoryId))
      .then((data) => setSubSubs(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setSubSubs([]);
      })
      .finally(() => setLoadingSubSubs(false));
  }, [categoryId]);

  // اجلب المشاريع (أولوية: subSub > subCategory > category)
  useEffect(() => {
    if (!categoryId) return setProjects([]);
    setLoadingProjects(true);

    const run = async () => {
      try {
        if (activeSubSub) {
          const data = await fetchAuthProjectsBySubSubCategory(Number(activeSubSub));
          setProjects(Array.isArray(data) ? data : []);
          return;
        }
        if (subCategoryId) {
          const data = await fetchAuthProjectsBySubCategory(Number(subCategoryId));
          setProjects(Array.isArray(data) ? data : []);
          return;
        }
        const data = await fetchAuthProjectsByCategory(Number(categoryId));
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    run();
  }, [categoryId, activeSubSub, subCategoryId]);

  if (!categoryId) return null;
  const hasSidebar = subSubs.length > 0;

  // سكيليتون للشبكة
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

  // زر/شيب (chip) – يُستخدم في الموبايل
  const Chip = ({ active, children, onClick }) => (
    <button
      onClick={onClick}
      type="button"
      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
        active
          ? "text-slate-900"
          : "text-slate-700 hover:text-slate-900 bg-white"
      }`}
      style={{
        background: active ? `${theme}14` : undefined,
        borderColor: active ? theme : "rgb(226 232 240)", // slate-200
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full">
      {/* ✅ موبايل/تابلت: شِيبس أفقية للفلاتر */}
      {hasSidebar && (
        <div className="lg:hidden -mx-1 mb-4">
          <div
            className="subchips flex items-center gap-2 overflow-x-auto pb-1 px-1 [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {/* إخفاء سكرول كروم/سفاري */}
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
        {/* ✅ دِسك توب: سايدبار ثابتة كما هي لكن ظاهرة فقط من lg+ */}
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
                      <span
                        className={`text-sm font-semibold ${
                          !activeSubSub ? "text-slate-900" : "text-slate-700"
                        }`}
                      >
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

        {/* الشبكة */}
        <div className="flex-1 min-w-0">
          {loadingProjects ? (
            <SkeletonGrid />
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h3 className="text-lg font-semibold text-slate-700 mb-1">No projects found</h3>
              <p className="text-sm text-slate-500">Try selecting a different category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} theme={theme} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
