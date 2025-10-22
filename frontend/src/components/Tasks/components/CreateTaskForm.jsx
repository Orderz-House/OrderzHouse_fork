import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCategories, fetchSubSubCategoriesByCategoryId } from "../../Catigories/api/category";
import { createTaskApi } from "../api/tasks";
import { Loader2 } from "lucide-react";

const THEME = "#028090";

export default function CreateTaskForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '', price: '', category_id: '', sub_sub_category_id: '', duration_days: '1' });
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (formData.category_id) {
      fetchSubSubCategoriesByCategoryId(formData.category_id).then(setSubSubCategories).catch(console.error);
    } else {
      setSubSubCategories([]);
    }
  }, [formData.category_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: '', type: '' });
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    files.forEach(file => data.append('files', file));
    try {
      const response = await createTaskApi(data);
      if (response.success) {
        setStatus({ message: 'Task created successfully! Awaiting admin approval.', type: 'success' });
        setTimeout(() => navigate('/admin/Tasks'), 2000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setStatus({ message: error.message || 'Failed to create task.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-6" style={{ color: THEME }}>Create a New Task</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-lg border">
        <div><label className="block text-sm font-medium text-slate-700">Task Title</label><input type="text" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full p-3 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-slate-700">Description</label><textarea name="description" value={formData.description} onChange={handleChange} required rows="4" className="mt-1 block w-full p-3 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500"></textarea></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium text-slate-700">Price ($)</label><input type="number" name="price" value={formData.price} onChange={handleChange} required min="1" className="mt-1 block w-full p-3 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-slate-700">Delivery Days</label><input type="number" name="duration_days" value={formData.duration_days} onChange={handleChange} required min="1" className="mt-1 block w-full p-3 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium text-slate-700">Category</label><select name="category_id" value={formData.category_id} onChange={handleChange} required className="mt-1 block w-full p-3 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 bg-white"><option value="">Select Category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-slate-700">Sub-Category</label><select name="sub_sub_category_id" value={formData.sub_sub_category_id} onChange={handleChange} required disabled={!formData.category_id} className="mt-1 block w-full p-3 border border-slate-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100"><option value="">Select Sub-Category</option>{subSubCategories.map(ssc => <option key={ssc.id} value={ssc.id}>{ssc.name}</option>)}</select></div>
        </div>
        <div><label className="block text-sm font-medium text-slate-700">Attachments (Optional)</label><input type="file" multiple onChange={handleFileChange} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" /></div>
        <div><button type="submit" disabled={isSubmitting} className="w-full h-12 flex items-center justify-center rounded-xl text-white font-semibold transition shadow-md hover:shadow-lg disabled:opacity-50" style={{ backgroundColor: THEME }}>{isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Task'}</button></div>
        {status.message && (<p className={`text-sm text-center ${status.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{status.message}</p>)}
      </form>
    </div>
  );
}
