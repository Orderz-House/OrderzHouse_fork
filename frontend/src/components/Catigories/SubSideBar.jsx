// components/Projects/SubSideBar.jsx
import React, { useEffect, useState } from "react";
import { fetchSubSubCategoriesByCategoryId } from "./api/category";
import {
  fetchAuthProjectsByCategory,
  fetchAuthProjectsBySubCategory,
  fetchAuthProjectsBySubSubCategory,
} from "./api/projects";
import { fetchTasksByFilter } from "../CreateProjects/api/tasks";
import ProjectCard from "./ProjectCard";

export default function SubSidebar({
  mode = "projects",
  categoryId,
  activeSubSub,
  onSelectSubSub,
  theme = "#F97316",
  subCategoryId,
}) {
  const [subSubs, setSubSubs] = useState([]);
  const [items, setItems] = useState([]);
  const [loadingSubSubs, setLoadingSubSubs] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  // filters
  const [projectTypeFilter, setProjectTypeFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("default");
  const [budgetFilter, setBudgetFilter] = useState("any");
  const [durationFilter, setDurationFilter] = useState("any");
  const [withFilesOnly, setWithFilesOnly] = useState(false);
  const [withFreelancerOnly, setWithFreelancerOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const isTasks = mode === "tasks";

  const activeFiltersCount = [
    projectTypeFilter !== "all",
    budgetFilter !== "any",
    durationFilter !== "any",
    withFilesOnly,
    withFreelancerOnly,
  ].filter(Boolean).length;

  useEffect(() => {
    if (!categoryId) return;
    setLoadingSubSubs(true);
    fetchSubSubCategoriesByCategoryId(Number(categoryId))
      .then((data) => setSubSubs(Array.isArray(data) ? data : []))
      .finally(() => setLoadingSubSubs(false));
  }, [categoryId]);

  useEffect(() => {
    if (!categoryId) return;
    setLoadingItems(true);
    const run = async () => {
      try {
        if (isTasks) {
          const data = await fetchTasksByFilter({
            category: Number(categoryId),
            subcat: subCategoryId ? Number(subCategoryId) : undefined,
            sub: activeSubSub ? Number(activeSubSub) : undefined,
          });
          setItems(Array.isArray(data) ? data : []);
          return;
        }
        if (activeSubSub) {
          const data = await fetchAuthProjectsBySubSubCategory(Number(activeSubSub));
          setItems(Array.isArray(data) ? data : []);
          return;
        }
        if (subCategoryId) {
          const data = await fetchAuthProjectsBySubCategory(Number(subCategoryId));
          setItems(Array.isArray(data) ? data : []);
          return;
        }
        const data = await fetchAuthProjectsByCategory(Number(categoryId));
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("SubSidebar fetch error:", err);
        setItems([]);
      } finally {
        setLoadingItems(false);
      }
    };
    run();
  }, [categoryId, activeSubSub, subCategoryId, isTasks]);

  // reusable select (used desktop + bottom sheet)
  const FilterSelect = ({ label, value, onChange, options }) => (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <div className="relative mt-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200/80"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </label>
  );

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[16/9] bg-slate-200 rounded-xl mb-3" />
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );

  if (!categoryId) return null;
  const priceField = isTasks ? "price" : "budget";
  let visibleItems = items;

  return (
    <div className="w-full">
      {/* ===== Filters bar ===== */}
      {!isTasks && (
        <div className="mb-4">
          {/* Mobile: Filters + Sort */}
          <div className="sm:hidden flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex-1 h-11 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm ring-1 ring-black/5 flex items-center justify-between"
            >
              <span className="text-sm font-semibold text-slate-800">Filters</span>
              {activeFiltersCount > 0 ? (
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-orange-100 px-2 text-xs font-extrabold text-orange-700">
                  {activeFiltersCount}
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-400">All</span>
              )}
            </button>

            <div className="h-11 rounded-2xl border border-slate-200 bg-white px-3 shadow-sm ring-1 ring-black/5 flex items-center">
              <select
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none"
              >
                <option value="default">Best</option>
                <option value="newest">Newest</option>
                <option value="price_low_high">Low → High</option>
                <option value="price_high_low">High → Low</option>
              </select>
            </div>
          </div>

          {/* Desktop grid filters */}
          <div className="hidden sm:grid grid-cols-3 gap-3">
            <FilterSelect
              label="Project type"
              value={projectTypeFilter}
              onChange={setProjectTypeFilter}
              options={[
                { value: "all", label: "All types" },
                { value: "fixed", label: "Fixed price" },
                { value: "hourly", label: "Hourly" },
                { value: "bidding", label: "Bidding" },
              ]}
            />
            <FilterSelect
              label="Budget"
              value={budgetFilter}
              onChange={setBudgetFilter}
              options={[
                { value: "any", label: "Any budget" },
                { value: "0-100", label: "Up to $100" },
                { value: "100-500", label: "$100 – $500" },
                { value: "500-1000", label: "$500 – $1000" },
                { value: "1000+", label: "$1000+" },
              ]}
            />
            <FilterSelect
              label="Delivery time"
              value={durationFilter}
              onChange={setDurationFilter}
              options={[
                { value: "any", label: "Any time" },
                { value: "1", label: "Up to 1 day" },
                { value: "3", label: "Up to 3 days" },
                { value: "7", label: "Up to 7 days" },
                { value: "7+", label: "More than 7 days" },
              ]}
            />
          </div>
        </div>
      )}

      {/* ===== Items grid ===== */}
      <div className="flex w-full gap-6 lg:gap-8">
        <div className="flex-1 min-w-0">
          {loadingItems ? (
            <SkeletonGrid />
          ) : visibleItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h3 className="text-lg font-semibold text-slate-700 mb-1">
                {isTasks ? "No tasks found" : "No projects found"}
              </h3>
              <p className="text-sm text-slate-500">
                Try changing the filters or selecting a different category
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleItems.map((it) => (
                <ProjectCard
                  key={it.id}
                  project={it}
                  theme={theme}
                  linkBase={isTasks ? "tasks" : "projects"}
                  priceField={priceField}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== Bottom Sheet (Mobile Filters) ===== */}
      {filtersOpen && !isTasks && (
        <div className="fixed inset-0 z-[9999] sm:hidden">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            onClick={() => setFiltersOpen(false)}
          />

          {/* Sheet */}
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 shadow-2xl ring-1 ring-black/10 animate-[slideUp_.3s_ease-out]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-slate-900">Filters</h3>
              <button
                onClick={() => setFiltersOpen(false)}
                className="h-9 w-9 rounded-full border border-slate-200 grid place-items-center text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <FilterSelect
                label="Project type"
                value={projectTypeFilter}
                onChange={setProjectTypeFilter}
                options={[
                  { value: "all", label: "All types" },
                  { value: "fixed", label: "Fixed price" },
                  { value: "hourly", label: "Hourly" },
                  { value: "bidding", label: "Bidding" },
                ]}
              />
              <FilterSelect
                label="Budget"
                value={budgetFilter}
                onChange={setBudgetFilter}
                options={[
                  { value: "any", label: "Any budget" },
                  { value: "0-100", label: "Up to $100" },
                  { value: "100-500", label: "$100 – $500" },
                  { value: "500-1000", label: "$500 – $1000" },
                  { value: "1000+", label: "$1000+" },
                ]}
              />
              <FilterSelect
                label="Delivery time"
                value={durationFilter}
                onChange={setDurationFilter}
                options={[
                  { value: "any", label: "Any time" },
                  { value: "1", label: "Up to 1 day" },
                  { value: "3", label: "Up to 3 days" },
                  { value: "7", label: "Up to 7 days" },
                  { value: "7+", label: "More than 7 days" },
                ]}
              />
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  setProjectTypeFilter("all");
                  setBudgetFilter("any");
                  setDurationFilter("any");
                  setWithFilesOnly(false);
                  setWithFreelancerOnly(false);
                }}
                className="flex-1 h-11 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-800"
              >
                Clear
              </button>
              <button
                onClick={() => setFiltersOpen(false)}
                className="flex-1 h-11 rounded-2xl bg-gradient-to-b from-orange-400 to-red-500 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(249,115,22,0.25)]"
              >
                Apply
              </button>
            </div>
          </div>

          <style>{`
            @keyframes slideUp {
              0% { transform: translateY(100%); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
