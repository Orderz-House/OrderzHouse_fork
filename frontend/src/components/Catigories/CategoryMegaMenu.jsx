import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchCategories,
  fetchSubCategoriesByCategoryId,
  fetchSubSubCategoriesBySubId,
} from "./api/category";

/**
 * تعديل مهم:
 * - إضافة نمط "مُتحكَّم" عبر props: open, anchorRef, onRequestClose, hideTrigger, hoverClosable.
 * - إن مرّرت anchorRef + open => لن يُعرض زر CATEGORIES وسيظهر الميجا منيو تحت العنصر الممرّر.
 * - إن لم تمرّرها، يعمل الكومبوننت كما كان (زر مستقل).
 */
const CategoryMegaMenu = ({
  activeLink,
  onSetActiveLink,
  open,                 // تحكم خارجي اختياري
  anchorRef: extAnchor, // مرجع زر خارجي (مثلاً زر TASKS/PROJECTS)
  onRequestClose,       // يُستدعى عند إغلاق خارجي مطلوب
  hideTrigger = false,  // إخفاء زر CATEGORIES الداخلي
  hoverClosable = false // يغلق عند مغادرة الماوس للمنيو
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // إن وُجد open => تحكّم خارجي
  const controlled = typeof open === "boolean";
  const openState = controlled ? open : isOpen;

  // anchor: داخلي أو خارجي
  const internalAnchorRef = useRef(null);
  const anchorRef = extAnchor || internalAnchorRef;

  // البيانات
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); 

  // refs
  const menuRef = useRef(null);
  const [menuTop, setMenuTop] = useState(0);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        // إن كان لدينا anchor خارجي، تحقق أيضًا أنه ليس داخل الـ anchor
        if (anchorRef?.current && anchorRef.current.contains(e.target)) return;
        closeMenu();
      }
    };
    if (openState) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openState]);

  // تحميل البيانات + حساب الموضع عند الفتح
  useEffect(() => {
    if (!openState) return;

    updateMenuTop();
    if (categories.length === 0) {
      (async () => {
        setLoading(true);
        try {
          const cats = await fetchCategories();

          const categoriesWithSubs = await Promise.all(
            cats.map(async (category) => {
              const subCats = await fetchSubCategoriesByCategoryId(category.id);
              const subCategoriesWithSubs = await Promise.all(
                (subCats || []).map(async (sub) => {
                  const subSubs = await fetchSubSubCategoriesBySubId(sub.id);
                  return { ...sub, subSubCategories: subSubs || [] };
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
      })();
    }

    window.addEventListener("scroll", updateMenuTop, { passive: true });
    window.addEventListener("resize", updateMenuTop);
    return () => {
      window.removeEventListener("scroll", updateMenuTop);
      window.removeEventListener("resize", updateMenuTop);
    };
  }, [openState]);

  // UI handlers
  const handleToggle = () => {
    if (controlled) return; // في النمط المتحكّم لا نغيّر من هنا
    setIsOpen((prev) => !prev);
    onSetActiveLink && onSetActiveLink("CATEGORIES");
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubCategory(cat.subCategories?.[0] || null);
  };

  const handleSelectSubCategory = (sub) => setSelectedSubCategory(sub);

  const goToProjects = (subSub) => {
    if (!selectedCategory || !subSub) return;
    navigate(
      `/projectsPage?cat=${encodeURIComponent(selectedCategory.id)}&sub=${encodeURIComponent(
        subSub.id
      )}`
    );
    closeMenu();
  };

  return (
    <div className="relative">
      {/* زر CATEGORIES الداخلي — يُخفى عند الدمج */}
      {!hideTrigger && (
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
              className={`h-4 w-4 transition-transform duration-200 ${openState ? "rotate-180" : ""}`}
            />
          </span>
          <span
            className={`absolute bottom-0 left-1/2 h-0.5 bg-[#028090] transition-all duration-300 ease-out transform -translate-x-1/2 ${
              activeLink === "CATEGORIES" ? "w-full" : "w-0 group-hover:w-full"
            }`}
          />
        </button>
      )}

      {openState && (
        <div
          ref={menuRef}
          style={{ top: menuTop }}
          className="fixed left-1/2 -translate-x-1/2 z-50 mt-0 bg-white rounded-xl shadow-2xl border border-gray-200 w-[95vw] max-w-[1300px] max-h-[80vh] overflow-auto"
          onMouseLeave={() => {
            if (hoverClosable) {
              // مهلة صغيرة لتجنّب الوميض عند التحرك السريع
              setTimeout(() => closeMenu(), 120);
            }
          }}
        >
          {loading ? (
            <div className="p-8 text-center text-gray-500 font-inter">Loading...</div>
          ) : (
            <div className="p-6 space-y-6">
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

                  <div className="flex-1">
                    {selectedSubCategory ? (
                      <>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          {selectedSubCategory.name} Sub-categories
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {selectedSubCategory.subSubCategories?.map((s) => (
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
