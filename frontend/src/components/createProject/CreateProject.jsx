import { useEffect, useState } from "react";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  MapPin,
  FileText,
  CheckCircle,
  Users,
} from "lucide-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  setCreating,
  setError,
  addProject,
  setCurrentProject,
} from "../../slice/projectSlice";
import { useNavigate, Link } from "react-router-dom";

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

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const token = useSelector((s) => s.auth.token);
  const creating = useSelector((s) => s.project.creating);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const roleId = useSelector((s) => s.auth.roleId);
  console.log("roleId =>", roleId);
  
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
      console.error(err.message);
      dispatch(
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to create project"
        )
      );
      alert("Failed to create project");
    } finally {
      dispatch(setCreating(false));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-5xl mx-auto p-6">
        <Link
          onClick={()=> navigate(-1)}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3">Create a New Project</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Post your project to connect with talented freelancers ready to
              bring your ideas to life.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Build a responsive e-commerce website"
                  className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
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

              {/* Sub-category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-category (Optional)
                </label>
                <select
                  name="sub_category_id"
                  value={form.sub_category_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select sub-category</option>
                  {subCategories.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Minimum Budget ($)
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
                  <DollarSign className="w-4 h-4 mr-1" />
                  Maximum Budget ($)
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

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Project Duration
                </label>
                <select
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1 to 3 months">1 to 3 months</option>
                  <option value="Less than 1 month">Less than 1 month</option>
                  <option value="3 to 6 months">3 to 6 months</option>
                  <option value="More than 6 months">More than 6 months</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Work Location
                </label>
                <select
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Project Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your project in detail, including goals, requirements, and any specific skills needed..."
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                required
              />
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-2 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Tips for a successful project post
              </h3>
              <ul className="text-blue-700 text-sm list-disc pl-5 space-y-1">
                <li>Be specific about your requirements and expectations</li>
                <li>Include your desired timeline and budget range</li>
                <li>Mention any specific skills or experience needed</li>
                <li>Provide examples or references if possible</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center"
              disabled={creating}
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Project...
                </>
              ) : (
                "Create Project & Continue"
              )}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            Why post a project on OrderzHouse?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2">Access Top Talent</h3>
              <p className="text-gray-600 text-sm">
                Connect with skilled professionals from around the world.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold mb-2">Secure Payments</h3>
              <p className="text-gray-600 text-sm">
                Our escrow system ensures your funds are protected.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold mb-2">Quality Results</h3>
              <p className="text-gray-600 text-sm">
                Get your project done right with our satisfaction guarantee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
