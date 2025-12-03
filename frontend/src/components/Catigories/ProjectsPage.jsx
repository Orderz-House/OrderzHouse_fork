import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import TopbarCategories from "./TopbarCategories.jsx"; // التوب بار الـ sticky
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

  // نحدد هل الصفحة Tasks أو Projects من الـ URL
  const inferredMode = location.pathname.startsWith("/tasks")
    ? "tasks"
    : "projects";
  const mode = propMode || inferredMode;

  // ====== URL Params ======
  const q = (sp.get("q") || "").trim();
  const category = sp.get("cat") || "";
  const sub = sp.get("sub") || ""; // sub‑sub category
  const subcat = sp.get("subcat") || ""; // sub category

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

  // ---------- search index (category + sub-category) ----------
  useEffect(() => {
    const buildIndex = async () => {
      try {
        const cats = Object.entries(catalog);
        if (cats.length === 0) return;

        const _nameToCatId = {};
        const _nameToSubCat = {};

        // Map: اسم الكاتيجوري → id
        cats.forEach(([id, v]) => {
          const key = (v.title || "").toLowerCase();
          if (key) _nameToCatId[key] = id;
        });

        // Map: اسم الساب كاتيجوري → {id, parentId}
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

  // ---------- default category ----------
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
  }, [catalog, category, sp, setSp]);

  // ---------- search by text ----------
  useEffect(() => {
    if (!q || !indexReady) return;
    if (category || subcat || sub) return;

    const term = q.toLowerCase().trim();

    // 1) مطابق لاسم sub‑category بالضبط
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

    // 2) مطابق لاسم الـ category بالضبط
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

    // 3) يحتوي على الاسم داخل sub‑category
    const subHit = Object.entries(nameToSubCat).find(([k]) =>
      k.includes(term)
    );
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

    // 4) يحتوي على الاسم داخل category
    const catHit = Object.entries(nameToCatId).find(([k]) =>
      k.includes(term)
    );
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

    // لو ما في نتيجة من البحث بالاسم نمسح q من الـ URL
    const next = new URLSearchParams(sp);
    next.delete("q");
    setSp(next, { replace: true });
  }, [
    q,
    indexReady,
    nameToCatId,
    nameToSubCat,
    category,
    subcat,
    sub,
    sp,
    setSp,
  ]);

  // ---------- اختيار كاتيجوري من الشريط ----------
  const chooseCat = (id) => {
    const next = new URLSearchParams(sp);
    next.set("cat", id.toString());
    next.delete("sub");
    next.delete("subcat");
    next.delete("q");
    next.set("page", "1");
    setSp(next, { replace: false });
  };

  // ---------- اختيار sub‑sub من SubSidebar ===========
  const chooseSub = (subId) => {
    const next = new URLSearchParams(sp);
    if (subId) next.set("sub", subId.toString());
    else next.delete("sub");
    next.delete("subcat");
    next.delete("q");
    next.set("page", "1");
    setSp(next, { replace: false });
  };

  // ✅ تُستدعى من الميجا منيو في التوب بار (كاتيجوري + ساب + ساب ساب)
  const handleSelectFromTopbar = (catId, subCatId, subSubId) => {
    const next = new URLSearchParams(sp);

    next.set("cat", catId.toString());

    if (subCatId) next.set("subcat", subCatId.toString());
    else next.delete("subcat");

    if (subSubId) next.set("sub", subSubId.toString());
    else next.delete("sub");

    next.delete("q");
    next.set("page", "1");
    setSp(next, { replace: false });
  };

  const meta = useMemo(
    () =>
      catalog[category] || {
        title: mode === "tasks" ? "Tasks" : "Projects",
        subtitle: "",
      },
    [catalog, category, mode]
  );

  return (
    <section className="relative min-h-[70vh] pb-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 🔝 التوب بار الـ sticky مع الميجا منيو */}
        <TopbarCategories
          active={category}
          onSelect={chooseCat}
          onSelectSubCategory={handleSelectFromTopbar}
          theme={THEME}
          themeDark={THEME_DARK}
        />

        {/* عنوان الصفحة */}
        <header className="mt-4 mb-6">
  <div className="flex items-center gap-2 text-sm">
    {/* Home icon */}
    <a
      href="/"
      className="inline-flex items-center text-slate-600 hover:text-slate-800"
      aria-label="Home"
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1h-4.5v-4.5h-3V18H4a1 1 0 01-1-1V9.5z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>

    {/* Slash */}
    <span className="text-slate-300">/</span>

    {/* Category title */}
    <h1
      className="text-sm font-semibold tracking-tight text-slate-800"
      style={{ color: THEME_DARK }}
    >
      {meta.title}
    </h1>
  </div>
</header>

        {/* المحتوى الرئيسي */}
        <SubSidebar
          mode={mode}
          categoryId={category}
          activeSubSub={sub}
          onSelectSubSub={chooseSub}
          theme={THEME}
          subCategoryId={subcat}
        />
      </div>
    </section>
  );
}
