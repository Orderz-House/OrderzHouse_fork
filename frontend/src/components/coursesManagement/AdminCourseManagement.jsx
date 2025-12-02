import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { BookOpen, Plus, Edit, Trash2, Search, DollarSign, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminCourseManagement = () => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category_id: '', title_ar: '', description_ar: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);

  const API_BASE = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const [coursesRes, categoriesRes] = await Promise.all([
          axios.get(`${API_BASE}/courses/view`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/category`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setCourses(coursesRes.data.courses || []);
        setCategories(categoriesRes.data.categories || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load courses or categories.');
        toast.error('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, API_BASE]);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || formData.price === '' || !formData.category_id) {
        toast.error('Please fill all required fields.');
        return;
    }

    try {
      let res;
      if (isEditing) {
        res = await axios.put(`${API_BASE}/courses/update/${editingCourseId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(prev => prev.map(c => c.id === editingCourseId ? res.data.course : c));
        toast.success('Course updated successfully!');
      } else {
        res = await axios.post(`${API_BASE}/courses/create`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(prev => [res.data.course, ...prev]);
        toast.success('Course created successfully!');
      }
      resetForm();
      setShowCreateModal(false);
    } catch (err) {
      console.error(`${isEditing ? 'Update' : 'Create'} course error:`, err);
      const msg = err.response?.data?.message || err.response?.data?.error || `Failed to ${isEditing ? 'update' : 'create'} course.`;
      toast.error(msg);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await axios.delete(`${API_BASE}/courses/delete/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(prev => prev.filter(c => c.id !== courseId));
      toast.success('Course deleted successfully!');
    } catch (err) {
      console.error('Delete course error:', err);
      const msg = err.response?.data?.message || 'Failed to delete course.';
      toast.error(msg);
    }
  };

  const openEditModal = (course) => {
    setFormData({
      title: course.title,
      description: course.description,
      price: course.price.toString(),
      category_id: course.category_id?.toString() || '',
      title_ar: course.title_ar || '',
      description_ar: course.description_ar || '',
    });
    setIsEditing(true);
    setEditingCourseId(course.id);
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', price: '', category_id: '', title_ar: '', description_ar: '' });
    setIsEditing(false);
    setEditingCourseId(null);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
                <p className="text-gray-600 mt-2">Create, edit, and delete courses</p>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setShowCreateModal(true); }}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">New Course</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 flex items-center shadow-lg">
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  ${course.price}
                </span>
                <span className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {course.lessons_count || 0} lessons
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {course.enrollments_count || 0} students
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(course)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate(`/admin/course-access`)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  title="Manage Access"
                >
                  <Users className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Found</h3>
            <p className="text-gray-600 mb-6">There are no courses matching your search.</p>
            <button
              onClick={() => { resetForm(); setShowCreateModal(true); }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              Create Your First Course
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {isEditing ? 'Edit Course' : 'Create New Course'}
              </h2>
              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <input
                  required
                  type="text"
                  placeholder="Title (EN) *"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Title (AR)"
                  value={formData.title_ar}
                  onChange={(e) => setFormData({...formData, title_ar: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <textarea
                  required
                  placeholder="Description (EN) *"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <textarea
                  placeholder="Description (AR)"
                  value={formData.description_ar}
                  onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="Price ($) *"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category *</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
                  >
                    {isEditing ? 'Update Course' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseManagement;
