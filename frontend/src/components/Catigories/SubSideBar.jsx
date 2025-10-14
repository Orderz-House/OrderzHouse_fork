import React, { useEffect, useState } from "react";
import { fetchSubSubCategoriesByCategoryId } from "./api/category";
import { fetchProjectsByCategory, fetchProjectsBySubSubCategory } from "./api/projects";
import ProjectCard from "./ProjectCard";

export default function SubSidebar({ categoryId, activeSubSub, onSelectSubSub, theme = "#028090" }) {
  const [subSubs, setSubSubs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Fetch sub-sub-categories whenever categoryId changes
  useEffect(() => {
    if (!categoryId) {
      setSubSubs([]);
      return;
    }

    const loadSubSubs = async () => {
      setLoading(true);
      try {
        console.log("Fetching sub-sub-categories for categoryId:", categoryId);
        const data = await fetchSubSubCategoriesByCategoryId(Number(categoryId));
        console.log("Fetched sub-sub-categories:", data);
        setSubSubs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load sub-sub-categories", err);
        setSubSubs([]);
      } finally {
        setLoading(false);
      }
    };

    loadSubSubs();
  }, [categoryId]);

  // Fetch projects whenever activeSubSub or categoryId changes
  useEffect(() => {
    if (!categoryId) {
      setProjects([]);
      return;
    }

    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        let data;
        if (activeSubSub) {
          console.log("Fetching projects for sub-sub-category:", activeSubSub);
          data = await fetchProjectsBySubSubCategory(Number(activeSubSub));
        } else {
          console.log("Fetching all projects for category:", categoryId);
          data = await fetchProjectsByCategory(Number(categoryId));
        }
        console.log("Fetched projects:", data);
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load projects", err);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, [categoryId, activeSubSub]);

  if (!categoryId) return null;

  if (loading) {
    return (
      <div className="flex gap-6">
        <aside className="w-72 flex-shrink-0 p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-slate-100 rounded"></div>
            <div className="h-10 bg-slate-100 rounded"></div>
            <div className="h-10 bg-slate-100 rounded"></div>
          </div>
        </aside>
      </div>
    );
  }

  if (!subSubs || subSubs.length === 0) return null;

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0">
        <nav className="p-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => onSelectSubSub("")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all group ${
                  !activeSubSub ? "bg-gradient-to-r from-emerald-50 to-transparent border-l-4" : "hover:bg-slate-50"
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
                      isActive ? "bg-gradient-to-r from-emerald-50 to-transparent border-l-4" : "hover:bg-slate-50"
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
      </aside>

      {/* Projects Grid */}
      <div className="flex-1 min-w-0">
        {loadingProjects ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/9] bg-slate-200 rounded-xl mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No projects found</h3>
            <p className="text-sm text-slate-500">Try selecting a different category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                title={project.title}
                cover={project.cover || project.image}
                seller={{
                  name: project.seller?.name || project.sellerName,
                  isAd: project.isAd,
                  vetted: project.seller?.vetted || project.vetted,
                }}
                rating={{
                  score: project.rating || project.ratingScore,
                  count: project.ratingCount || project.reviews,
                }}
                from={project.price || project.from}
                offersVideo={project.offersVideo}
                tags={project.tags}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}