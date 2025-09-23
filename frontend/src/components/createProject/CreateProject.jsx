import { useEffect, useState } from "react";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  Users,
} from "lucide-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { toastError, toastSuccess } from "../../services/toastService";
import {
  setCreating,
  setError,
  addProject,
  setCurrentProject,
} from "../../slice/projectSlice";
import { useNavigate, Link } from "react-router-dom";

export default function CreateProject() {
  const API_BASE = "http://localhost:5000";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((s) => s.auth.token);
  const creating = useSelector((s) => s.project.creating);
  const roleId = useSelector((s) => s.auth.roleId);

  

  const [form, setForm] = useState({
    category_id: "",
    title: "",
    description: "",
    project_type: "fixed", // default
    budget: "",
    budget_min: "",
    budget_max: "",
    hourly_rate: "",
    duration_days: 30,
  });

  const [categories, setCategories] = useState([]);

  // Only admins and clients can create projects
  useEffect(() => {
    if (roleId && Number(roleId) !== 1 && Number(roleId) !== 2) {
      toastError("Only clients can create projects");
      navigate("/");
    }
  }, [roleId, navigate]);

  // Load categories
  useEffect(() => {
    axios
      .get(`${API_BASE}/projects/public/categories`)
      .then((res) => setCategories(res.data.categories || []))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setCreating(true));
    dispatch(setError(""));

    try {
      const payload = { ...form };

      if (form.project_type === "fixed") {
        payload.budget_min = null;
        payload.budget_max = null;
        payload.hourly_rate = null;
      } else if (form.project_type === "bidding") {
        payload.budget = null;
        payload.hourly_rate = null;
      } else if (form.project_type === "hourly") {
        payload.budget = null;
        payload.budget_min = null;
        payload.budget_max = null;
        payload.duration_days = null; // duration_days not needed for hourly
      }

      const res = await axios.post(`${API_BASE}/projects`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
console.log("Token being sent:", token);

      const project = res.data.project;
      dispatch(setCurrentProject(project));
      dispatch(addProject(project));
      toastSuccess("Project created successfully");
      navigate(`/projects/${project.id}`);

      setForm({
        category_id: "",
        title: "",
        description: "",
        project_type: "fixed",
        budget: "",
        budget_min: "",
        budget_max: "",
        hourly_rate: "",
        duration_days: 30,
      });
    } catch (err) {
      console.error(err);
      dispatch(
        setError(err.response?.data?.message || err.message || "Failed to create project")
      );
      toastError("Failed to create project");
    } finally {
      dispatch(setCreating(false));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto p-6">
        <Link
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Create a New Project</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Build a responsive e-commerce website"
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your project in detail..."
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
                required
              />
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
              <select
                name="project_type"
                value={form.project_type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="fixed">Fixed</option>
                <option value="bidding">Bidding</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>

            {/* Conditional Budget / Rate */}
            {form.project_type === "fixed" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" /> Budget
                </label>
                <input
                  name="budget"
                  type="number"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="e.g., 1000"
                  className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {form.project_type === "bidding" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" /> Min Budget
                  </label>
                  <input
                    name="budget_min"
                    type="number"
                    value={form.budget_min}
                    onChange={handleChange}
                    placeholder="e.g., 500"
                    className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" /> Max Budget
                  </label>
                  <input
                    name="budget_max"
                    type="number"
                    value={form.budget_max}
                    onChange={handleChange}
                    placeholder="e.g., 1500"
                    className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            {form.project_type === "hourly" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" /> Hourly Rate
                </label>
                <input
                  name="hourly_rate"
                  type="number"
                  value={form.hourly_rate}
                  onChange={handleChange}
                  placeholder="e.g., 30"
                  className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {/* Duration (hide for hourly) */}
            {form.project_type !== "hourly" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" /> Duration (days)
                </label>
                <input
                  name="duration_days"
                  type="number"
                  value={form.duration_days}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center justify-center"
              disabled={creating}
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Project...
                </>
              ) : (
                "Create Project"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
