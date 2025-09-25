import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus, Edit, Trash2, BookOpen, Users, DollarSign, Search, Eye
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCourses, setFilteredCourses, setSearchTerm, setLoading, setError,
  addCourse, updateCourse, deleteCourse
} from "../../slice/courseSlice";

const CoursesManagement = () => {
  const dispatch = useDispatch();
  const { courses, filteredCourses, loading, error, searchTerm } = useSelector(state => state.courses);
  const { token, roleId } = useSelector(state => state.auth);

  const canManage = roleId === 1;

  useEffect(() => {
    fetchCourses();
  }, [token]);

  useEffect(() => {
    const filtered = courses.filter(c =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    dispatch(setFilteredCourses(filtered));
  }, [searchTerm, courses]);

  const fetchCourses = async () => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get("http://localhost:5000/courses/view", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) dispatch(setCourses(res.data.courses));
      else dispatch(setError("Failed to load courses"));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed to fetch"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const [formData, setFormData] = useState({
    title: "", description: "", price: "", title_ar: "", description_ar: ""
  });
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/courses/create", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        dispatch(addCourse(res.data.course));
        setShowCreate(false);
        setFormData({ title: "", description: "", price: "", title_ar: "", description_ar: "" });
      }
    } catch (e) {
      dispatch(setError("Create failed"));
    }
  };

  const openEdit = (course) => {
    setSelected(course);
    setFormData({
      title: course.title,
      description: course.description,
      price: course.price,
      title_ar: course.title_ar || "",
      description_ar: course.description_ar || ""
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/courses/update/${selected.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        dispatch(updateCourse(res.data.course));
        setShowEdit(false);
        setSelected(null);
      }
    } catch (e) {
      dispatch(setError("Update failed"));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this course?")) {
      try {
        await axios.delete(`http://localhost:5000/courses/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(deleteCourse(id));
      } catch (e) {
        dispatch(setError("Delete failed"));
      }
    }
  };

  const handleSearch = (e) => dispatch(setSearchTerm(e.target.value));

  if (loading) return <div className="flex justify-center mt-10"><div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Courses Management</h1>
            <p className="text-gray-600">Manage your courses</p>
          </div>
          {canManage && (
            <button onClick={() => setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center">
              <Plus className="w-5 h-5 mr-1" /> Create
            </button>
          )}
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-6">{error}</div>}

        <div className="bg-white p-4 rounded-lg mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search courses..."
              className="pl-10 w-full p-3 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(c => (
            <div key={c.id} className="bg-white rounded-lg shadow hover:shadow-md p-6">
              <h3 className="text-xl font-semibold">{c.title}</h3>
              <p className="text-gray-600 mt-1">{c.description}</p>
              <div className="mt-4 flex justify-between text-sm text-gray-500">
                <span><BookOpen className="inline w-4 h-4 mr-1" /> {c.lessons_count || 0}</span>
                <span><Users className="inline w-4 h-4 mr-1" /> {c.enrollments_count || 0}</span>
                <span><DollarSign className="inline w-4 h-4 mr-1" />${c.price}</span>
              </div>
              <div className="flex space-x-2 mt-4">
                {canManage && (
                  <>
                    <button onClick={() => openEdit(c)} className="flex-1 bg-gray-100 py-2 rounded text-sm flex items-center justify-center">
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="bg-red-100 text-red-600 px-2 py-2 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button className="flex-1 bg-blue-600 text-white py-2 rounded flex items-center justify-center">
                  <Eye className="w-4 h-4 mr-1" /> View
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modals */}
        {showCreate && (
          <Modal title="Create Course" onClose={() => setShowCreate(false)} onSubmit={handleCreate} formData={formData} setFormData={setFormData} />
        )}
        {showEdit && (
          <Modal title="Edit Course" onClose={() => setShowEdit(false)} onSubmit={handleUpdate} formData={formData} setFormData={setFormData} />
        )}
      </div>
    </div>
  );
};

// Reusable Modal Component
const Modal = ({ title, onClose, onSubmit, formData, setFormData }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input required placeholder="Title (EN)" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border rounded" />
          <input placeholder="Title (AR)" value={formData.title_ar} onChange={e => setFormData({ ...formData, title_ar: e.target.value })} className="w-full p-2 border rounded" />
          <textarea required placeholder="Description (EN)" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3" className="w-full p-2 border rounded" />
          <textarea placeholder="Description (AR)" value={formData.description_ar} onChange={e => setFormData({ ...formData, description_ar: e.target.value })} rows="3" className="w-full p-2 border rounded" />
          <input required type="number" step="0.01" placeholder="Price" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full p-2 border rounded" />
          <div className="flex space-x-3 mt-6">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded">Save</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoursesManagement;