import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TaskCard from "./TaskCard";
import { getTaskPoolApi } from "../api/tasks";
import { fetchCategories, fetchSubSubCategoriesByCategoryId } from "../../Catigories/api/category";
import { Loader2 } from "lucide-react";

const THEME = "#028090";

export default function TasksPage() {
  const [sp, setSp] = useSearchParams();
  const categoryId = sp.get("cat") || "";
  const subSubId = sp.get("sub") || "";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (categoryId) {
      fetchSubSubCategoriesByCategoryId(categoryId).then(setSubSubCategories).catch(console.error);
    } else {
      setSubSubCategories([]);
    }
  }, [categoryId]);

  useEffect(() => {
    setLoading(true);
    const filters = {};
    if (categoryId) filters.category = categoryId;
    if (subSubId) filters.subSubCategory = subSubId;

    getTaskPoolApi(filters)
      .then(data => {
        if (data.success) setTasks(data.tasks);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryId, subSubId]);

  const handleCategoryChange = (e) => {
    const newCatId = e.target.value;
    const nextSp = new URLSearchParams(sp);
    nextSp.set("cat", newCatId);
    nextSp.delete("sub");
    setSp(nextSp);
  };

  const handleSubSubChange = (e) => {
    const newSubId = e.target.value;
    const nextSp = new URLSearchParams(sp);
    if (newSubId) {
      nextSp.set("sub", newSubId);
    } else {
      nextSp.delete("sub");
    }
    setSp(nextSp);
  };

  return (
    <section className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-black tracking-tight" style={{ color: THEME }}>Discover Tasks</h1>
          <p className="mt-2 text-slate-600">Find pre-defined tasks offered by talented freelancers.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-white rounded-2xl shadow-sm border">
          <select onChange={handleCategoryChange} value={categoryId} className="w-full md:w-1/2 p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select onChange={handleSubSubChange} value={subSubId} disabled={!categoryId} className="w-full md:w-1/2 p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100">
            <option value="">All Sub-Categories</option>
            {subSubCategories.map(ssc => <option key={ssc.id} value={ssc.id}>{ssc.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-slate-400" /></div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border"><p className="text-slate-500">No tasks found for the selected criteria.</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tasks.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        )}
      </div>
    </section>
  );
}
