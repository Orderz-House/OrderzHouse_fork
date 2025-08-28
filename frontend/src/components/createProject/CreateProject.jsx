import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setCreating, setError, addProject, setCurrentProject } from "../../slice/projectSlice";
import { useNavigate } from "react-router-dom";

export default function CreateProject() {
  const API_BASE = "http://localhost:5000";
  const [form, setForm] = useState({
    category_id: "",
    sub_category_id: "",
    title: "",
    description: "",
    budget_min: "",
    budget_max: "",
    duration: "1 to 3 months",
    location: "Remote",
    freelancer_id: "",
  });
  // import.meta.env.VITE_API_BASE ||
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const token = useSelector((s) => s.auth.token);
  const creating = useSelector((s) => s.project.creating);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const roleId = useSelector((s) => s.auth.roleId);

  useEffect(() => {
    // guard: only role 1 or 2 can create projects
    if (roleId && Number(roleId) !== 1 && Number(roleId) !== 2) {
      alert("Only clients can create projects");
      navigate("/");
      return;
    }
  }, [roleId, navigate]);

  useEffect(() => {
    axios
      .get(`${API_BASE}/projects/public/categories`)
      .then((res) => setCategories(res.data.categories || []))
      .catch((e) => console.error(e.message));
  }, []);

  useEffect(() => {
    if (!form.category_id) {
      setSubCategories([]);
      return;
    }
    axios
      .get(`${API_BASE}/projects/public/categories/${form.category_id}/sub`)
      .then((res) => setSubCategories(res.data.subCategories || []))
      .catch(() => setSubCategories([]));
  }, [form.category_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setCreating(true));
    dispatch(setError(""));
    try {
      const { freelancer_id, ...projectPayload } = form; // freelancer ignored in step 1
      const createRes = await axios.post(
        `${API_BASE}/projects`,
        projectPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const project = createRes.data.project;
      dispatch(setCurrentProject(project));
      dispatch(addProject(project));
      alert("Project created successfully");
      navigate(`/projects/${project.id}`);
      setForm({
        category_id: "",
        sub_category_id: "",
        title: "",
        description: "",
        budget_min: "",
        budget_max: "",
        duration: "1 to 3 months",
        location: "Remote",
        freelancer_id: "",
      });
    } catch (err) {
      console.error(err);
      dispatch(setError(err.response?.data?.message || err.message || "Failed to create project"));
      alert("Failed to create project");
    } finally {
      dispatch(setCreating(false));
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="border p-2 rounded" required />

          <select name="category_id" value={form.category_id} onChange={handleChange} className="border p-2 rounded" required>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select name="sub_category_id" value={form.sub_category_id} onChange={handleChange} className="border p-2 rounded">
            <option value="">Select sub-category (optional)</option>
            {subCategories.map((sc) => (
              <option key={sc.id} value={sc.id}>{sc.name}</option>
            ))}
          </select>

          <input name="budget_min" type="number" value={form.budget_min} onChange={handleChange} placeholder="Budget Min" className="border p-2 rounded" required />
          <input name="budget_max" type="number" value={form.budget_max} onChange={handleChange} placeholder="Budget Max" className="border p-2 rounded" required />

          <select name="duration" value={form.duration} onChange={handleChange} className="border p-2 rounded">
            <option value="1 to 3 months">1 to 3 months</option>
            <option value="Less than 1 month">Less than 1 month</option>
            <option value="3 to 6 months">3 to 6 months</option>
            <option value="More than 6 months">More than 6 months</option>
          </select>

          <select name="location" value={form.location} onChange={handleChange} className="border p-2 rounded">
            <option value="Remote">Remote</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="border p-2 rounded w-full" rows={6} required />

        <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded" disabled={creating}>
          {creating ? "Saving..." : "Save & Continue"}
        </button>
      </form>
    </div>
  );
}


