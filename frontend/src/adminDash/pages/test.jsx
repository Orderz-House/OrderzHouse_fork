import { useEffect, useState } from "react";
import API from "../../api/axios"; 
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
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  // =========================================================
  // FETCH FUNCTIONS
  // =========================================================
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setErr("");
      const { data } = await API.get("/category");
      setCategories(data.categories || []);
      setLevel("main");
    } catch (e) {
      console.error(e);
      setErr("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      setLoading(true);
      setErr("");
      const { data } = await API.get(`/category/${categoryId}/sub-categories`);
      setSubCategories(data.subCategories || []);
      setLevel("sub");
    } catch (e) {
      console.error(e);
      setErr("Failed to load sub-categories.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubSubCategories = async (subCategoryId) => {
    try {
      setLoading(true);
      setErr("");
      const { data } = await API.get(
        `/category/sub-category/${subCategoryId}/sub-sub-categories`
      );
      setSubSubCategories(data.subSubCategories || []);
      setLevel("subsub");
    } catch (e) {
      console.error(e);
      setErr("Failed to load sub-sub-categories.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // NAVIGATION
  // =========================================================
  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    fetchSubCategories(cat.id);
  };

  const handleSubClick = (sub) => {
    setSelectedSub(sub);
    fetchSubSubCategories(sub.id || sub.sub_category_id);
  };

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
  // CRUD OPERATIONS
  // =========================================================
  const openAdd = () => {
    setForm({ name: "", description: "" });
    setEditId(null);
    setOpen(true);
  };

  const openEdit = (item) => {
    setForm({
      name:
        item.name ||
        item.sub_category_name ||
        item.sub_sub_category_name ||
        "",
      description:
        item.description ||
        item.sub_category_description ||
        item.sub_sub_category_description ||
        "",
    });
    setEditId(item.id || item.sub_category_id || item.sub_sub_category_id);
    setOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    
    try {
      let endpoint = "";
      const body = { name: form.name, description: form.description };

      if (level === "main") {
        // Main category
        endpoint = editId ? `/category/${editId}` : "/category";
      } else if (level === "sub") {
        // Sub-category
        const catId = selectedCategory.id;
        if (editId) {
          endpoint = `/category/${catId}/sub-categories/${editId}`;
        } else {
          endpoint = `/category/${catId}/sub-categories`;
          body.category_id = catId;
        }
      } else {
        // Sub-sub-category
        const subId = selectedSub.id || selectedSub.sub_category_id;
        if (editId) {
          endpoint = `/category/sub-category/${subId}/sub-sub-categories/${editId}`;
        } else {
          endpoint = `/category/sub-category/${subId}/sub-sub-categories`;
          body.sub_category_id = subId;
        }
      }

      if (editId) {
        await API.put(endpoint, body);
      } else {
        await API.post(endpoint, body);
      }

      setOpen(false);
      reloadCurrentLevel();
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Failed to save item";
      setErr(errorMsg);
      alert(errorMsg);
    }
  };

  const onDelete = async (item) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const id = item.id || item.sub_category_id || item.sub_sub_category_id;
      let endpoint = "";

      if (level === "main") {
        endpoint = `/category/${id}`;
      } else if (level === "sub") {
        endpoint = `/category/${selectedCategory.id}/sub-categories/${id}`;
      } else {
        const subId = selectedSub.id || selectedSub.sub_category_id;
        endpoint = `/category/sub-category/${subId}/sub-sub-categories/${id}`;
      }

      await API.delete(endpoint);
      reloadCurrentLevel();
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Failed to delete item";
      alert(errorMsg);
    }
  };

  const reloadCurrentLevel = () => {
    if (level === "main") fetchCategories();
    else if (level === "sub") fetchSubCategories(selectedCategory.id);
    else if (level === "subsub")
      fetchSubSubCategories(selectedSub.id || selectedSub.sub_category_id);
  };

  // =========================================================
  // UI RENDERING
  // =========================================================
  const list =
    level === "main"
      ? categories
      : level === "sub"
      ? subCategories
      : subSubCategories;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {level !== "main" && (
            <button
              onClick={goBack}
              className="rounded-lg bg-slate-100 px-3 py-2 hover:bg-slate-200"
            >
              <FiArrowLeft className="inline-block mr-1" /> Back
            </button>
          )}
          <h1 className="text-xl font-semibold text-slate-800">
            {level === "main" && "Categories"}
            {level === "sub" &&
              `${selectedCategory?.name} → Sub-Categories`}
            {level === "subsub" &&
              `${selectedSub?.name || selectedSub?.sub_category_name} → Sub-Sub-Categories`}
          </h1>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white shadow-sm"
          style={{ backgroundColor: primary }}
        >
          <FiPlus /> Add New
        </button>
      </div>

      {/* Error & Loading */}
      {loading && <p className="text-slate-500">Loading...</p>}
      {err && <p className="text-red-500">{err}</p>}

      {/* Category Grid */}
      {!loading && !err && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between">
                  <h3
                    className="text-lg font-semibold text-slate-800"
                    style={{ color: primary }}
                  >
                    {name}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                {desc && (
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                    {desc}
                  </p>
                )}

                {level !== "subsub" && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() =>
                        level === "main"
                          ? handleCategoryClick(item)
                          : handleSubClick(item)
                      }
                      className="text-xs text-slate-600 hover:underline"
                    >
                      View {level === "main" ? "Sub-Categories" : "Sub-Sub-Categories"} →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {!loading && !err && list.length === 0 && (
        <div className="text-slate-500 text-sm">No items found.</div>
      )}

      {/* Add/Edit Modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-800">
                {editId ? "Edit" : "Add"}{" "}
                {level === "main"
                  ? "Category"
                  : level === "sub"
                  ? "Sub-Category"
                  : "Sub-Sub-Category"}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-slate-600">Name</label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-4 py-2 text-white shadow-sm"
                  style={{ backgroundColor: primary }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}