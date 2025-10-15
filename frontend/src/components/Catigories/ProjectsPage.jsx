import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CategoriesRail } from "./TopbarCategories.jsx";
import SubSidebar from "./SubSideBar.jsx";

const THEME = "#028090";
const THEME_DARK = "#05668D";

export default function ProjectsPage() {
  const [sp, setSp] = useSearchParams();
  const category = sp.get("cat") || "";
  const sub = sp.get("sub") || "";

  const [catalog, setCatalog] = useState({});

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/category/");
        const data = await response.json();
        if (data.success) {
          const catalogObj = Object.fromEntries(
            data.categories.map((c) => [c.id.toString(), { title: c.name }])
          );
          setCatalog(catalogObj);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    loadCategories();
  }, []);

  const chooseCat = (id) => {
    const next = new URLSearchParams(sp);
    next.set("cat", id.toString());
    next.delete("sub");
    next.set("page", "1");
    setSp(next, { replace: false });
  };

  const chooseSub = (subId) => {
    const next = new URLSearchParams(sp);
    if (subId) next.set("sub", subId.toString());
    else next.delete("sub");
    next.set("page", "1");
    setSp(next, { replace: false });
  };

  const meta = catalog[category] || { title: "Projects", subtitle: "" };

  return (
    <section className="relative min-h-[70vh] py-8">
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

        <div className="flex gap-6">
          {/* Sidebar */}
          <SubSidebar
            categoryId={category}
            activeSubSub={sub}
            onSelectSubSub={chooseSub}
            theme={THEME}
          />

          {/* Main content */}
          <div className="flex-1">
            <header className="mb-5">
              <h1
                className="text-2xl sm:text-3xl font-black tracking-tight"
                style={{ color: THEME_DARK }}
              >
                {meta.title}
              </h1>
            </header>

            <div className="text-slate-600 mt-10">
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}