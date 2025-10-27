import { useEffect, useState } from "react";
import {
  getCategories,
  getSubCategories,
  getSubSubCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  createSubSubCategory,
  updateSubSubCategory,
  deleteSubSubCategory,
} from "../../api/categories";
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";

const primary = "#05668D";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);

  const [level, setLevel] = useState("main"); // main | sub | subsub
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data } = await getCategories();
      setCategories(data.data || []);
      setLevel("main");
    } catch (err) {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const loadSubCategories = async (category) => {
    try {
      setLoading(true);
      setSelectedCategory(category);
      const { data } = await getSubCategories(category.id);
      setSubCategories(data.data || data.subCategories || []);
      setLevel("sub");
    } catch (err) {
      setError("Failed to load sub-categories.");
    } finally {
      setLoading(false);
    }
  };

  const loadSubSubCategories = async (sub) => {
    try {
      setLoading(true);
      setSelectedSub(sub);
      const subId = sub.id || sub.sub_category_id;
      const { data } = await getSubSubCategories(subId);
      setSubSubCategories(data.data || data.subSubCategories || []);
      setLevel("subsub");
    } catch (err) {
      setError("Failed to load sub-sub-categories.");
    } finally {
      setLoading(false);
    }
  };

  const reloadCurrentLevel = () => {
    if (level === "main") loadCategories();
    else if (level === "sub") loadSubCategories(selectedCategory);
    else if (level === "subsub") loadSubSubCategories(selectedSub);
  };

  // =========================================================
  // NAVIGATION
  // =========================================================
  const goBack = () => {
    if (level === "subsub") {
      setLevel("sub");
      setSubSubCategories([]);
      setSelectedSub(null);
    } else if (level === "sub") {
      setLevel("main");
      setSubCategories([]);
      setSelectedCategory(null);
    }
  };

  // =========================================================
  // CRUD
  // =========================================================
  const openAdd = () => {
    setForm({ name: "", description: "" });
    setEditId(null);
    setOpen(true);
  };

  const openEdit = (item) => {
    const id = item.id || item.sub_category_id || item.sub_sub_category_id;
    const name =
      item.name || item.sub_category_name || item.sub_sub_category_name || "";
    const description =
      item.description ||
      item.sub_category_description ||
      item.sub_sub_category_description ||
      "";
    setForm({ name, description });
    setEditId(id);
    setOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: form.name, description: form.description };

    try {
      console.log("Submitting:", { level, payload, selectedCategory, selectedSub });

      if (level === "main") {
        editId
          ? await updateCategory(editId, payload)
          : await createCategory(payload);
      } else if (level === "sub") {
        if (!selectedCategory?.id)
          return alert("Please select a parent category first.");
        const catId = selectedCategory.id;
        editId
          ? await updateSubCategory(catId, editId, payload)
          : await createSubCategory(catId, payload);
      } else if (level === "subsub") {
        if (!selectedSub?.id && !selectedSub?.sub_category_id)
          return alert("Please select a parent sub-category first.");
        const subId = selectedSub.id || selectedSub.sub_category_id;
        editId
          ? await updateSubSubCategory(subId, editId, payload)
          : await createSubSubCategory(subId, payload);
      }

      setOpen(false);
      reloadCurrentLevel();
    } catch (err) {
      console.error(err);
      alert("Failed to save item.");
    }
  };

  const onDelete = async (item) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    const id = item.id || item.sub_category_id || item.sub_sub_category_id;

    try {
      if (level === "main") {
        await deleteCategory(id);
      } else if (level === "sub") {
        await deleteSubCategory(selectedCategory.id, id);
      } else if (level === "subsub") {
        const subId = selectedSub.id || selectedSub.sub_category_id;
        await deleteSubSubCategory(subId, id);
      }
      reloadCurrentLevel();
    } catch (err) {
      console.error(err);
      alert("Delete failed.");
    }
  };

  // =========================================================
  // RENDER LOGIC
  // =========================================================
  const list =
    level === "main"
      ? categories
      : level === "sub"
      ? subCategories
      : subSubCategories;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {level !== "main" && (
                <button
                  onClick={goBack}
                  className="rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-2.5 hover:from-slate-200 hover:to-slate-300 shadow-sm hover:shadow-md"
                >
                  <FiArrowLeft className="inline-block mr-2" /> 
                  <span className="font-medium text-slate-700">Back</span>
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {level === "main" && "Categories"}
                  {level === "sub" && selectedCategory?.name}
                  {level === "subsub" &&
                    (selectedSub?.name || selectedSub?.sub_category_name)}
                </h1>
                {level !== "main" && (
                  <p className="text-sm text-slate-500 mt-1">
                    {level === "sub"
                      ? "Sub-Categories"
                      : "Sub-Sub-Categories"}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={openAdd}
              disabled={level === "sub" && !selectedCategory}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-white shadow-lg hover:shadow-xl ${
                level === "sub" && !selectedCategory
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              style={{
                background: `linear-gradient(135deg, ${primary} 0%, #0891b2 100%)`,
              }}
            >
              <FiPlus />
              <span className="font-semibold">Add New</span>
            </button>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
              <div
                className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin absolute top-0"
                style={{ borderTopColor: primary }}
              ></div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Cards */}
        {!loading && !error && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((item, i) => {
              const id =
                item.id ||
                item.sub_category_id ||
                item.sub_sub_category_id;
              const name =
                item.name ||
                item.sub_category_name ||
                item.sub_sub_category_name;
              const desc =
                item.description ||
                item.sub_category_description ||
                item.sub_sub_category_description;

              return (
                <div
                  key={`${level}-${id}-${i}`}
                  className="group relative rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-sm p-6 shadow-md hover:shadow-2xl hover:border-slate-300 overflow-hidden"
                >
                  {/* Decorative gradient */}
                  <div
                    className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(90deg, ${primary} 0%, #0891b2 100%)`,
                    }}
                  ></div>

                  <div className="flex items-start justify-between mb-3">
                    <h3
                      className="text-xl font-bold text-slate-800"
                      style={{ color: primary }}
                    >
                      {name}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-2.5 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-2.5 rounded-xl text-red-500 hover:bg-red-50"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {desc && (
                    <p className="mt-3 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {desc}
                    </p>
                  )}

                  {level !== "subsub" && (
                    <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() =>
                          level === "main"
                            ? loadSubCategories(item)
                            : loadSubSubCategories(item)
                        }
                        className="inline-flex items-center gap-2 text-sm font-medium"
                        style={{ color: primary }}
                      >
                        <span>
                          View{" "}
                          {level === "main"
                            ? "Sub-Categories"
                            : "Sub-Sub-Categories"}
                        </span>
                        <span>→</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && list.length === 0 && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <FiPlus className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-500 text-lg">No items found.</p>
            <p className="text-slate-400 text-sm mt-2">
              Click "Add New" to create your first item
            </p>
          </div>
        )}

        {/* Modal */}
        {open && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  {editId ? "Edit" : "Add New"}{" "}
                  {level === "main"
                    ? "Category"
                    : level === "sub"
                    ? "Sub-Category"
                    : "Sub-Sub-Category"}
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="h-10 w-10 grid place-items-center rounded-xl hover:bg-slate-100 text-slate-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    placeholder="Enter name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={4}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 resize-none"
                    placeholder="Enter description..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border-2 border-slate-300 px-6 py-3 text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl"
                    style={{
                      background: `linear-gradient(135deg, ${primary} 0%, #0891b2 100%)`,
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
