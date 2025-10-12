import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const CategoryMegaMenu = ({ activeLink, onSetActiveLink }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categoriesRes = await fetch("http://localhost:5000/category");
      const categoriesData = await categoriesRes.json();

      if (categoriesData.success) {
        const categoriesWithSubs = await Promise.all(
          categoriesData.categories.map(async (category) => {
            const subSubRes = await fetch(
              `http://localhost:5000/category/${category.id}/sub-sub-categories`
            );
            const subSubData = await subSubRes.json();

            const subCategoriesMap = {};
            if (subSubData.success) {
              subSubData.data.forEach((item) => {
                if (!subCategoriesMap[item.sub_category_id]) {
                  subCategoriesMap[item.sub_category_id] = {
                    id: item.sub_category_id,
                    name: item.sub_category_name,
                    subSubCategories: [],
                  };
                }
                subCategoriesMap[item.sub_category_id].subSubCategories.push({
                  id: item.sub_sub_category_id,
                  name: item.sub_sub_category_name,
                  description: item.sub_sub_category_description,
                });
              });
            }

            return {
              ...category,
              subCategories: Object.values(subCategoriesMap),
            };
          })
        );
        setCategories(categoriesWithSubs);
        setSelectedCategory(categoriesWithSubs[0]); // default first
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
    setLoading(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (onSetActiveLink) onSetActiveLink("CATEGORIES");
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubCategory(null);
  };

  const handleSelectSubCategory = (sub) => {
    setSelectedSubCategory(sub);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu button */}
      <button
        onClick={handleToggle}
        className={`relative px-5 py-3 text-base font-medium transition-all duration-300 font-inter group ${
          activeLink === "CATEGORIES" ? "text-[#028090]" : "text-gray-700"
        }`}
      >
        <span className="flex items-center gap-1">
          CATEGORIES
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
        <span
          className={`absolute bottom-0 left-1/2 h-0.5 bg-[#028090] transition-all duration-300 ease-out transform -translate-x-1/2 ${
            activeLink === "CATEGORIES" ? "w-full" : "w-0 group-hover:w-full"
          }`}
        ></span>
      </button>

      {/* Mega menu */}
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-[95vw] max-w-[1300px]">
          {loading ? (
            <div className="p-8 text-center text-gray-500 font-inter">
              Loading...
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* 1️⃣ Top row: Main categories */}
              <div className="flex gap-6 overflow-x-auto pb-3 border-b border-gray-200">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
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

              {/* 2️⃣ Middle + right: Subcategories & sub-sub-categories */}
              {selectedCategory && (
                <div className="flex gap-6">
                  {/* Left side: subcategories */}
                  <div className="w-1/4 border-r border-gray-200 pr-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      {selectedCategory.name} Types
                    </h3>
                    <div className="flex flex-col gap-2">
                      {selectedCategory.subCategories?.map((sub) => (
                        <button
                          key={sub.id}
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

                  {/* Right side: sub-sub-categories */}
                  <div className="flex-1">
                    {selectedSubCategory ? (
                      <>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          {selectedSubCategory.name} Sub-categories
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {selectedSubCategory.subSubCategories?.map((s) => (
                            <a
                              key={s.id}
                              href={`/category/${selectedCategory.id}/sub/${selectedSubCategory.id}/sub-sub/${s.id}`}
                              className="text-xs text-gray-700 bg-gray-100 hover:bg-[#028090] hover:text-white transition-all px-3 py-2 rounded-md font-inter"
                              onClick={() => setIsOpen(false)}
                            >
                              {s.name}
                            </a>
                          ))}
                        </div>
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
