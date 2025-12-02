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

  // ====== FILTER STATE (Fiverr‑style bar) ======
  const [projectTypeFilter, setProjectTypeFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("default");
  const [budgetFilter, setBudgetFilter] = useState("any");
  const [durationFilter, setDurationFilter] = useState("any");
  const [withFilesOnly, setWithFilesOnly] = useState(false);
  const [withFreelancerOnly, setWithFreelancerOnly] = useState(false);

  const isTasks = mode === "tasks";

  // ====== Fetch sub‑sub categories ======
  useEffect(() => {
    if (!categoryId) {
      setSubSubs([]);
      return;
    }

    setLoadingSubSubs(true);
    fetchSubSubCategoriesByCategoryId(Number(categoryId))
      .then((data) => setSubSubs(Array.isArray(data) ? data : []))
      .catch(() => setSubSubs([]))
      .finally(() => setLoadingSubSubs(false));
  }, [categoryId]);

  // ====== Fetch projects / tasks ======
  useEffect(() => {
    if (!categoryId) {
      setItems([]);
      return;
    }

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
  // ProjectCard expects "price" for projects and "budget" for tasks in your code
  const priceField = isTasks ? "budget" : "price";

  // ====== Helpers based on your create‑project structure ======
  // project_type, budget, hourly_rate, budget_min, budget_max, duration_type, duration_days, duration_hours 
  const getProjectType = (item) => item?.project_type || null;

  const getBudgetRange = (item) => {
    const type = item?.project_type;

    if (type === "fixed") {
      const value = Number(item?.budget || 0);
      return [value, value];
    }

    if (type === "hourly") {
      const rate = Number(item?.hourly_rate || 0);
      // same assumption you use in PaymentStep: 3 hours as estimate :contentReference[oaicite:2]{index=2}
      const total = rate * 3;
      return [total, total];
    }

    if (type === "bidding") {
      const min = Number(item?.budget_min || 0);
      const max = Number(item?.budget_max || min);
      return [min, max];
    }

    // Fallback if project_type is missing
    const value = Number(item?.[priceField] || 0);
    return [value, value];
  };

  const getDurationInDays = (item) => {
    const durationType = item?.duration_type;
    if (!durationType) return null;

    if (durationType === "days") {
      const d = Number(item?.duration_days || 0);
      return Number.isFinite(d) ? d : null;
    }

    if (durationType === "hours") {
      const h = Number(item?.duration_hours || 0);
      if (!Number.isFinite(h)) return null;
      return h / 24;
    }

    return null;
  };

  const hasFilesInfo = (item) =>
    item &&
    ("files_count" in item ||
      "filesCount" in item ||
      Array.isArray(item.files));

  const itemHasFiles = (item) => {
    if (!item) return false;
    if ("files_count" in item) return Number(item.files_count) > 0;
    if ("filesCount" in item) return Number(item.filesCount) > 0;
    if (Array.isArray(item.files)) return item.files.length > 0;
    return false;
  };

  const hasFreelancerInfo = (item) =>
    item &&
    ("freelancer_id" in item ||
      "assigned_freelancer_id" in item ||
      "freelancer" in item ||
      "assigned_freelancer" in item);

  const itemHasFreelancer = (item) => {
    if (!item) return false;
    if ("freelancer_id" in item && item.freelancer_id) return true;
    if ("assigned_freelancer_id" in item && item.assigned_freelancer_id)
      return true;
    if (item.freelancer) return true;
    if (item.assigned_freelancer) return true;
    return false;
  };

  // ====== Skeleton grid ======
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

  // ====== Small UI components ======
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
        background: active ? theme + "14" : undefined,
        borderColor: active ? theme : "rgb(226 232 240)",
      }}
    >
      {children}
    </button>
  );

  const FilterDropdown = ({ label, value, onChange, options }) => (
    <div className="inline-flex items-center">
      <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5">
        <span className="text-sm text-slate-700 mr-2 whitespace-nowrap">
          {label}
        </span>
        <select
          className="bg-transparent text-sm text-slate-600 focus:outline-none focus:ring-0 pr-4"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const Toggle = ({ checked, onChange, label }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-sm text-slate-700"
    >
      <span
        className={
          "relative inline-flex h-5 w-9 items-center rounded-full border transition-colors " +
          (checked
            ? "bg-emerald-500 border-emerald-500"
            : "bg-slate-200 border-slate-300")
        }
      >
        <span
          className={
            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform " +
            (checked ? "translate-x-4" : "translate-x-1")
          }
        />
      </span>
      <span>{label}</span>
    </button>
  );

  // ====== Apply filters (projects only; tasks stay as-is) ======
  let visibleItems = items;

  if (!isTasks && items.length) {
    visibleItems = items.filter((item) => {
      // Project type
      if (projectTypeFilter !== "all") {
        const type = getProjectType(item);
        if (type && type !== projectTypeFilter) return false;
      }

      // Budget ranges
      if (budgetFilter !== "any") {
        const [minBudget, maxBudget] = getBudgetRange(item);

        if (budgetFilter === "0-100" && !(maxBudget <= 100)) return false;
        if (
          budgetFilter === "100-500" &&
          !(minBudget <= 500 && maxBudget >= 100)
        )
          return false;
        if (
          budgetFilter === "500-1000" &&
          !(minBudget <= 1000 && maxBudget >= 500)
        )
          return false;
        if (budgetFilter === "1000+" && !(minBudget >= 1000)) return false;
      }

      // Delivery time
      if (durationFilter !== "any") {
        const days = getDurationInDays(item);
        if (days != null) {
          if (durationFilter === "1" && !(days <= 1)) return false;
          if (durationFilter === "3" && !(days <= 3)) return false;
          if (durationFilter === "7" && !(days <= 7)) return false;
          if (durationFilter === "7+" && !(days > 7)) return false;
        }
      }

      // With files – only filters if the API actually sends file info
      if (withFilesOnly && hasFilesInfo(item) && !itemHasFiles(item)) {
        return false;
      }

      // With freelancer – only filters if freelancer info exists
      if (
        withFreelancerOnly &&
        hasFreelancerInfo(item) &&
        !itemHasFreelancer(item)
      ) {
        return false;
      }

      return true;
    });

    // Sorting
    if (sortFilter === "price_low_high") {
      visibleItems = [...visibleItems].sort((a, b) => {
        const [, maxA] = getBudgetRange(a);
        const [, maxB] = getBudgetRange(b);
        return maxA - maxB;
      });
    } else if (sortFilter === "price_high_low") {
      visibleItems = [...visibleItems].sort((a, b) => {
        const [, maxA] = getBudgetRange(a);
        const [, maxB] = getBudgetRange(b);
        return maxB - maxA;
      });
    } else if (sortFilter === "newest") {
      visibleItems = [...visibleItems].sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
        const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    }
  }

  return (
    <div className="w-full">
      {/* ===== Top filter bar – like the top row in Fiverr ===== */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown
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

          <FilterDropdown
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

          <FilterDropdown
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

        <div className="flex items-center gap-4">
          <Toggle
            checked={withFilesOnly}
            onChange={setWithFilesOnly}
            label="With files"
          />
          <Toggle
            checked={withFreelancerOnly}
            onChange={setWithFreelancerOnly}
            label="With freelancer"
          />
        </div>
      </div>

      {/* ===== Results count + sort bar (like “220,000+ results | Sort by: Best selling”) ===== */}
      <div className="mb-4 flex items-center justify-between text-sm px-3">
        <span className="text-slate-600">
          {visibleItems.length.toLocaleString()} results
        </span>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Sort by:</span>
          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
            className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="default">Best selling</option>
            <option value="newest">Newest</option>
            <option value="price_low_high">Price: Low to High</option>
            <option value="price_high_low">Price: High to Low</option>
          </select>
        </div>
      </div>

   
      {/* Grid */}
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
    </div>
  );
}
