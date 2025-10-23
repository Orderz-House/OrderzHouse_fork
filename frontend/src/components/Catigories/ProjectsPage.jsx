import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { CategoriesRail } from "./TopbarCategories.jsx";
import SubSidebar from "./SubSideBar.jsx";
import {
  fetchCategories,
  fetchSubCategoriesByCategoryId,
} from "./api/category";

const THEME = "#028090";
const THEME_DARK = "#05668D";

export default function ProjectsPage({ mode: propMode }) {
  const [sp, setSp] = useSearchParams();
  const location = useLocation();

  const inferredMode = location.pathname.startsWith("/tasks") ? "tasks" : "projects";
  const mode = propMode || inferredMode; 

  // ====== URL Params ======
  const q = (sp.get("q") || "").trim();
  const category = sp.get("cat") || "";
  const sub = sp.get("sub") || "";
  const subcat = sp.get("subcat") || "";

  // ====== Local catalog state ======
  const [catalog, setCatalog] = useState({});
  const [indexReady, setIndexReady] = useState(false);
  const [nameToCatId, setNameToCatId] = useState({});
  const [nameToSubCat, setNameToSubCat] = useState({});

  // ---------- Load all categories ----------
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

  // ----------  search (category + sub-category) ----------
  useEffect(() => {
    const buildIndex = async () => {
      try {
        const cats = Object.entries(catalog);
        if (cats.length === 0) return;

        const _nameToCatId = {};
        const _nameToSubCat = {};

        cats.forEach(([id, v]) => {
          const key = (v.title || "").toLowerCase();
          if (key) _nameToCatId[key] = id;
        });

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
        setIndexReady(true);
      }
    };
    buildIndex();
  }, [catalog, q]);

  useEffect(() => {
    if (!category && Object.keys(catalog).length > 0) {
      const firstId = Object.keys(catalog)[0];
      const next = new URLSearchParams(sp);
      next.set("cat", firstId);
      next.delete("sub");
      next.delete("subcat");
      next.delete("q");
      next.set("page", "1");
      setSp(next, { replace: true });
    }
  }, [catalog, category]);

  useEffect(() => {
    if (!q || !indexReady) return;
    if (category || subcat || sub) return;

    const term = q.toLowerCase().trim();

    const exactSub = nameToSubCat[term];
    if (exactSub) {
      const next = new URLSearchParams(sp);
      next.set("cat", exactSub.parentId);
      next.set("subcat", exactSub.id);
      next.delete("sub");
      next.delete("q");
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

    const next = new URLSearchParams(sp);
    next.delete("q");
    setSp(next, { replace: true });
  }, [q, indexReady, nameToCatId, nameToSubCat, category, subcat, sub, sp, setSp]);

  const chooseCat = (id) => {
    const next = new URLSearchParams(sp);
    next.set("cat", id.toString());
    next.delete("sub");
    next.delete("subcat");
    next.delete("q");
    next.set("page", "1");
    setSp(next, { replace: false });
  };

  const chooseSub = (subId) => {
    const next = new URLSearchParams(sp);
    if (subId) next.set("sub", subId.toString());
    else next.delete("sub");
    next.delete("subcat");
    next.delete("q");
    next.set("page", "1");
    setSp(next, { replace: false });
  };

  const meta = useMemo(
    () => catalog[category] || { title: mode === "tasks" ? "Tasks" : "Projects", subtitle: "" },
    [catalog, category, mode]
  );

  return (
    <section className="relative min-h-[70vh] py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Categories rail */}
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
          <h1 className="text-3xl font-black tracking-tight" style={{ color: THEME_DARK }}>
            {meta.title}
          </h1>
        </header>

        {/* Main Content */}
        <div className="flex gap-8">
          <SubSidebar
            mode={mode}            
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
