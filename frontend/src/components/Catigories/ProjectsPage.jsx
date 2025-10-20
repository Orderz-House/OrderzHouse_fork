import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CategoriesRail } from "./TopbarCategories.jsx";
import SubSidebar from "./SubSideBar.jsx";
import {
  fetchCategories,
  fetchSubCategoriesByCategoryId,
} from "./api/category";

const THEME = "#028090";
const THEME_DARK = "#05668D";

export default function ProjectsPage() {
  const [sp, setSp] = useSearchParams();

  // ====== URL Params we support ======
  const q = (sp.get("q") || "").trim();            // NEW: free-text search (name of cat/subcat)
  const category = sp.get("cat") || "";            // category id
  const sub = sp.get("sub") || "";                 // sub-sub id
  const subcat = sp.get("subcat") || "";           // sub-category id

  // ====== Local catalog state ======
  const [catalog, setCatalog] = useState({});      // { [catId]: { title } }
  const [indexReady, setIndexReady] = useState(false);

  // Local search index
  const [nameToCatId, setNameToCatId] = useState({});     // { "design": "3" }
  const [nameToSubCat, setNameToSubCat] = useState({});   // { "academic posters": { id: "9", parentId: "3" } }

  // ---------- Load all categories (for top rail titles) ----------
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        const catalogObj = Object.fromEntries(
          cats.map((c) => [String(c.id), { title: c.name }])
        );
        setCatalog(catalogObj);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    loadCategories();
  }, []);

  // ---------- Build search index for q (category + sub-category) ----------
  useEffect(() => {
    const buildIndex = async () => {
      try {
        const cats = Object.entries(catalog); // [ [id, {title}], ... ]
        if (cats.length === 0) return;

        const _nameToCatId = {};
        const _nameToSubCat = {};

        // Index categories
        cats.forEach(([id, v]) => {
          const key = (v.title || "").toLowerCase();
          if (key) _nameToCatId[key] = id;
        });

        // Index sub-categories when q exists (or in general if you prefer)
        if (q) {
          await Promise.all(
            cats.map(async ([id]) => {
              try {
                const subs = await fetchSubCategoriesByCategoryId(Number(id));
                (subs || []).forEach((s) => {
                  const key = (s.name || "").toLowerCase();
                  if (!key) return;
                  _nameToSubCat[key] = { id: String(s.id), parentId: id };
                });
              } catch (e) {
                console.warn("Failed to load sub-categories for", id, e);
              }
            })
          );
        }

        setNameToCatId(_nameToCatId);
        setNameToSubCat(_nameToSubCat);
        setIndexReady(true);
      } catch (e) {
        console.error("buildIndex error", e);
        setIndexReady(true); // avoid blocking
      }
    };
    buildIndex();
  }, [catalog, q]);

  // ---------- If no cat in URL, pick the first category automatically ----------
  useEffect(() => {
    if (!category && Object.keys(catalog).length > 0) {
      const firstId = Object.keys(catalog)[0];
      const next = new URLSearchParams(sp);
      next.set("cat", firstId);
      next.delete("sub");
      next.delete("subcat");
      next.delete("q"); // clear q if any
      next.set("page", "1");
      setSp(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, category]);

  // ---------- Resolve free-text q to (cat/subcat) once index is ready ----------
  useEffect(() => {
    if (!q || !indexReady) return;
    // If URL already has explicit ids, do nothing
    if (category || subcat || sub) return;

    const term = q.toLowerCase().trim();

    // Priority 1: exact match sub-category, then category
    const exactSub = nameToSubCat[term];
    if (exactSub) {
      const next = new URLSearchParams(sp);
      next.set("cat", exactSub.parentId);
      next.set("subcat", exactSub.id);
      next.delete("sub");       // clear sub-sub
      next.delete("q");         // resolved
      next.set("page", "1");
      setSp(next, { replace: true });
      return;
    }

    const exactCatId = nameToCatId[term];
    if (exactCatId) {
      const next = new URLSearchParams(sp);
      next.set("cat", exactCatId);
      next.delete("sub");
      next.delete("subcat");
      next.delete("q");
      next.set("page", "1");
      setSp(next, { replace: true });
      return;
    }

    // Priority 2: partial includes sub-category, then category
    const subHit = Object.entries(nameToSubCat).find(([k]) => k.includes(term));
    if (subHit) {
      const [, val] = subHit;
      const next = new URLSearchParams(sp);
      next.set("cat", val.parentId);
      next.set("subcat", val.id);
      next.delete("sub");
      next.delete("q");
      next.set("page", "1");
      setSp(next, { replace: true });
      return;
    }

    const catHit = Object.entries(nameToCatId).find(([k]) => k.includes(term));
    if (catHit) {
      const [, catId] = catHit;
      const next = new URLSearchParams(sp);
      next.set("cat", catId);
      next.delete("sub");
      next.delete("subcat");
      next.delete("q");
      next.set("page", "1");
      setSp(next, { replace: true });
      return;
    }

    // If no match → clear q silently
    const next = new URLSearchParams(sp);
    next.delete("q");
    setSp(next, { replace: true });
  }, [q, indexReady, nameToCatId, nameToSubCat, category, subcat, sub, sp, setSp]);

  // ---------- Handlers for category / sub-sub selection ----------
  const chooseCat = (id) => {
    const next = new URLSearchParams(sp);
    next.set("cat", id.toString());
    next.delete("sub");      // clear sub-sub
    next.delete("subcat");   // clear sub-category
    next.delete("q");        // clear query term if any
    next.set("page", "1");
    setSp(next, { replace: false });
  };

  const chooseSub = (subId) => {
    const next = new URLSearchParams(sp);
    if (subId) next.set("sub", subId.toString());
    else next.delete("sub");
    next.delete("subcat"); // if user picked a sub-sub, drop subcat filter
    next.delete("q");
    next.set("page", "1");
    setSp(next, { replace: false });
  };

  const meta = useMemo(
    () => catalog[category] || { title: "Projects", subtitle: "" },
    [catalog, category]
  );

  return (
    <section className="relative min-h-[70vh] py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Topbar Categories */}
        <div className="mb-6">
          <CategoriesRail
            active={category}
            onSelect={chooseCat}
            catalog={catalog}
            theme={THEME}
            themeDark={THEME_DARK}
          />
        </div>

        {/* Header */}
        <header className="mb-6">
          <h1
            className="text-3xl font-black tracking-tight"
            style={{ color: THEME_DARK }}
          >
            {meta.title || "Projects"}
          </h1>
        </header>

        {/* Main Content */}
        <div className="flex gap-8">
          <SubSidebar
            categoryId={category}
            activeSubSub={sub}
            onSelectSubSub={chooseSub}
            theme={THEME}
            subCategoryId={subcat}
          />
        </div>
      </div>
    </section>
  );
}
