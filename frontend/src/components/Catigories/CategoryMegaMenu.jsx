import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchCategories,
  fetchSubCategoriesByCategoryId,
  fetchSubSubCategoriesBySubId,
} from "./api/category";

const CategoryMegaMenu = ({ activeLink, onSetActiveLink }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // refs
  const menuRef = useRef(null);
  const anchorRef = useRef(null);
  const [menuTop, setMenuTop] = useState(0);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateMenuTop = () => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setMenuTop(rect.bottom + window.scrollY + 8);
  };

  useEffect(() => {
    if (isOpen) {
      updateMenuTop();
      if (categories.length === 0) loadCategories();

      window.addEventListener("scroll", updateMenuTop, { passive: true });
      window.addEventListener("resize", updateMenuTop);
      return () => {
        window.removeEventListener("scroll", updateMenuTop);
        window.removeEventListener("resize", updateMenuTop);
      };
    }
  }, [isOpen]);

  // 👇 توحيد البيانات القادمة من الـAPI إلى {id, name}
  const normalizeItem = (obj) => ({
    id:
      obj?.id ??
      obj?.sub_sub_category_id ??
      obj?.subCategoryId ??
      obj?._id ??
      obj?.sub_id,
    name: obj?.name ?? obj?.sub_sub_category_name ?? obj?.title ?? "Unnamed",
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const cats = await fetchCategories(); // {id, name, ...}
      const categoriesWithSubs = await Promise.all(
        (cats || []).map(async (category) => {
          const subCats = await fetchSubCategoriesByCategoryId(category.id); // {id, name, ...} غالباً
          const subCategoriesWithSubs = await Promise.all(
            (subCats || []).map(async (sub) => {
              const subSubsRaw = await fetchSubSubCategoriesBySubId(sub.id);
              const subSubs = (subSubsRaw || []).map(normalizeItem); // ← هنا التطبيع
              return { ...sub, subSubCategories: subSubs };
            })
          );
          return { ...category, subCategories: subCategoriesWithSubs };
        })
      );

      setCategories(categoriesWithSubs);
      const firstCat = categoriesWithSubs[0] || null;
      setSelectedCategory(firstCat);
      setSelectedSubCategory(firstCat?.subCategories?.[0] || null);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  // UI handlers
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    onSetActiveLink?.("CATEGORIES");
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubCategory(cat.subCategories?.[0] || null);
  };

  const handleSelectSubCategory = (sub) => setSelectedSubCategory(sub);

  // ← استخدمنا s.id الموحّد بدل sub_sub_category_id
  const goToProjects = (subSub) => {
    if (!selectedCategory || !subSub) return;
    navigate(
      `/projectsPage?cat=${encodeURIComponent(selectedCategory.id)}&sub=${encodeURIComponent(
        subSub.id
      )}`
    );
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={anchorRef}
        onClick={handleToggle}
        className={`relative px-5 py-3 text-base font-medium transition-all duration-300 font-inter group ${
          activeLink === "CATEGORIES" ? "text-[#028090]" : "text-gray-700"
        }`}
      >
        <span className="flex items-center gap-1">
          CATEGORIES
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
        <span
          className={`absolute bottom-0 left-1/2 h-0.5 bg-[#028090] transition-all duration-300 ease-out transform -translate-x-1/2 ${
            activeLink === "CATEGORIES" ? "w-full" : "w-0 group-hover:w-full"
          }`}
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          style={{ top: menuTop }}
          className="fixed left-1/2 -translate-x-1/2 z-50 mt-0 bg-white rounded-xl shadow-2xl border border-gray-200 w-[95vw] max-w-[1300px] max-h-[80vh] overflow-auto"
        >
          {loading ? (
            <div className="p-8 text-center text-gray-500 font-inter">Loading...</div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Tabs (categories) */}
              <div className="flex gap-6 overflow-x-auto pb-3 border-b border-gray-200">
                {categories.map((cat) => (
                  <button
                    key={`cat-${cat.id}`}
                    onClick={() => handleSelectCategory(cat)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      selectedCategory?.id === cat.id
                        ? "bg-[#028090] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {selectedCategory && (
                <div className="flex gap-6">
                  {/* Left list (subcategories) */}
                  <div className="w-1/4 border-r border-gray-200 pr-4 min-w-[220px]">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      {selectedCategory.name} Types
                    </h3>
                    <div className="flex flex-col gap-2">
                      {selectedCategory.subCategories?.map((sub) => (
                        <button
                          key={`sub-${selectedCategory.id}-${sub.id}`}
                          onClick={() => handleSelectSubCategory(sub)}
                          className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedSubCategory?.id === sub.id
                              ? "bg-[#028090] text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right grid (sub-sub-categories) */}
                  <div className="flex-1">
                    {selectedSubCategory ? (
                      <>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          {selectedSubCategory.name} Sub-categories
                        </h4>

                        {selectedSubCategory.subSubCategories?.length ? (
                          <div className="flex flex-wrap gap-3">
                            {selectedSubCategory.subSubCategories.map((s) => (
                              <a
                                key={`subsub-${selectedCategory.id}-${selectedSubCategory.id}-${s.id}`}
                                href="#"
                                className="text-xs text-gray-700 bg-gray-100 hover:bg-[#028090] hover:text-white transition-all px-3 py-2 rounded-md font-inter"
                                onClick={(e) => {
                                  e.preventDefault();
                                  goToProjects(s);
                                }}
                              >
                                {s.name}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            {Array.from({ length: 12 }).map((_, i) => (
                              <span
                                key={i}
                                className="inline-block h-6 w-14 rounded-md bg-gray-100 animate-pulse"
                              />
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 text-sm mt-3">
                        Select a subcategory on the left to view details.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryMegaMenu;
