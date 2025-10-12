// components/coursesManagement/CoursesManagement.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Plus, Edit, Trash2, BookOpen, Users, DollarSign, Search, Eye, User, X
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from '@reduxjs/toolkit';
import {
  setCourses, setFilteredCourses, setSearchTerm, setLoading, setError,
  addCourse, updateCourse, deleteCourse
} from "../../slice/courseSlice";
import { toastSuccess } from "../../services/toastService";
import { useNavigate } from "react-router-dom";

// ✅ Memoized selector to fix Redux warning
const selectCoursesState = createSelector(
  [(state) => state.courses],
  (coursesState) => ({
    courses: coursesState.courses,
    filteredCourses: coursesState.filteredCourses,
    loading: coursesState.loading,
    error: coursesState.error,
    searchTerm: coursesState.searchTerm
  })
);

const CoursesManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, filteredCourses, loading, error, searchTerm } = useSelector(selectCoursesState);
  const { token, roleId } = useSelector(state => state.auth);

  const canManage = roleId === 1;

  // ✅ Use useMemo to optimize filtered courses
  const memoizedFilteredCourses = useMemo(() => {
    if (!searchTerm) return courses;
    return courses.filter(c =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  useEffect(() => {
    fetchCourses();
  }, [token]);

  useEffect(() => {
    if (searchTerm) {
      dispatch(setFilteredCourses(memoizedFilteredCourses));
    }
  }, [memoizedFilteredCourses, dispatch, searchTerm]);

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

  // Access Control States
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedCourseForAccess, setSelectedCourseForAccess] = useState(null);
  const [freelancersForAccess, setFreelancersForAccess] = useState([]);
  const [selectedFreelancerForAccess, setSelectedFreelancerForAccess] = useState('');
  const [loadingFreelancers, setLoadingFreelancers] = useState(false);
  const [accessList, setAccessList] = useState({});
  const [loadingAccess, setLoadingAccess] = useState(false);

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

  // دالة لفتح modal منح الصلاحية
  const openAccessModal = async (course) => {
    setSelectedCourseForAccess(course);
    setSelectedFreelancerForAccess('');
    setLoadingFreelancers(true);
    
    try {
      const res = await axios.get('http://localhost:5000/users/allfreelance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFreelancersForAccess(res.data.freelancers || []);
      setShowAccessModal(true);
    } catch (err) {
      console.error('Failed to fetch freelancers:', err);
      dispatch(setError("Failed to load freelancers"));
    } finally {
      setLoadingFreelancers(false);
    }
  };

  // دالة لمنح الصلاحية
  const handleGrantAccess = async () => {
    if (!selectedFreelancerForAccess || !selectedCourseForAccess) return;
    
    try {
      await axios.post('http://localhost:5000/api/access-control/grant-access', {
        freelancer_id: selectedFreelancerForAccess,
        course_id: selectedCourseForAccess.id,
        can_access: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toastSuccess("Access granted successfully!");
      setShowAccessModal(false);
      // Refresh access list
      fetchAccessList(selectedCourseForAccess.id);
    } catch (err) {
      console.error('Grant access error:', err);
      dispatch(setError("Failed to grant access"));
    }
  };

  // دالة لسحب قائمة من لديه صلاحية
  const fetchAccessList = async (courseId) => {
    setLoadingAccess(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/access-control/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const accessMap = {};
      res.data.freelancers.forEach(f => {
        accessMap[f.freelancer_id] = f.can_access;
      });
      setAccessList(prev => ({ ...prev, [courseId]: res.data.freelancers }));
    } catch (err) {
      console.error('Fetch access list error:', err);
    } finally {
      setLoadingAccess(false);
    }
  };

  // دالة لإلغاء الصلاحية
  const handleRevokeAccess = async (courseId, freelancerId) => {
    if (!window.confirm("Revoke access for this freelancer?")) return;
    
    try {
      await axios.post('http://localhost:5000/api/access-control/grant-access', {
        freelancer_id: freelancerId,
        course_id: courseId,
        can_access: false
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toastSuccess("Access revoked successfully!");
      // Refresh access list
      fetchAccessList(courseId);
    } catch (err) {
      console.error('Revoke access error:', err);
      dispatch(setError("Failed to revoke access"));
    }
  };

  if (loading) return <div className="flex justify-center mt-10"><div className="animate-spin h-8 w-8 border-4 border-teal-600 rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Courses Management</h1>
            <p className="text-gray-600">Manage your courses</p>
          </div>
          {canManage && (
            <button onClick={() => setShowCreate(true)} className="bg-teal-600 text-white px-4 py-2 rounded flex items-center">
              <Plus className="w-5 h-5 mr-1" /> Create
            </button>
          )}
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-6">{error}</div>}

        <div className="bg-white p-4 rounded-lg mb-6 border border-teal-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search courses..."
              className="pl-10 w-full p-3 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(searchTerm ? memoizedFilteredCourses : filteredCourses).map(c => (
            <div key={c.id} className="bg-white rounded-lg shadow hover:shadow-md p-6 border border-teal-200">
              <h3 className="text-xl font-semibold text-gray-900">{c.title}</h3>
              <p className="text-gray-600 mt-1">{c.description}</p>
              <div className="mt-4 flex justify-between text-sm text-gray-500">
                <span><BookOpen className="inline w-4 h-4 mr-1 text-teal-600" /> {c.lessons_count || 0}</span>
                <span><Users className="inline w-4 h-4 mr-1 text-teal-600" /> {c.enrollments_count || 0}</span>
                <span><DollarSign className="inline w-4 h-4 mr-1 text-teal-600" />${c.price}</span>
              </div>
              
              {/* Access List */}
              {canManage && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Access Granted:</span>
                    <button 
                      onClick={() => fetchAccessList(c.id)}
                      className="text-xs text-teal-600 hover:text-teal-800"
                    >
                      {loadingAccess ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                    {accessList[c.id] ? (
                      accessList[c.id].filter(f => f.can_access).length > 0 ? (
                        accessList[c.id]
                          .filter(f => f.can_access)
                          .map(f => (
                            <div key={f.freelancer_id} className="flex items-center justify-between py-1">
                              <span>{f.first_name} {f.last_name}</span>
                              <button 
                                onClick={() => handleRevokeAccess(c.id, f.freelancer_id)}
                                className="text-red-500 hover:text-red-700"
                                title="Revoke Access"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                      ) : (
                        <span className="text-gray-400">No access granted</span>
                      )
                    ) : (
                      <button 
                        onClick={() => fetchAccessList(c.id)}
                        className="text-teal-600 hover:text-teal-800"
                      >
                        Load access list
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2 mt-4">
                {canManage && (
                  <>
                    <button onClick={() => openEdit(c)} className="flex-1 bg-gray-100 py-2 rounded text-sm flex items-center justify-center">
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="bg-red-100 text-red-600 px-2 py-2 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => openAccessModal(c)}
                      className="bg-teal-100 text-teal-600 px-2 py-2 rounded"
                      title="Grant Access"
                    >
                      <User className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button 
                  onClick={() => navigate(`/courses/${c.id}`)}
                  className="flex-1 bg-teal-600 text-white py-2 rounded flex items-center justify-center"
                >
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
        
        {/* Access Modal */}
        {showAccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Grant Access to Course</h2>
              <p className="text-gray-600 mb-4">
                Grant access to: <span className="font-semibold">{selectedCourseForAccess?.title}</span>
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Freelancer
                </label>
                {loadingFreelancers ? (
                  <div className="text-center py-2">Loading freelancers...</div>
                ) : (
                  <select
                    value={selectedFreelancerForAccess}
                    onChange={(e) => setSelectedFreelancerForAccess(e.target.value)}
                    className="w-full p-2 border border-teal-300 rounded focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Choose a freelancer</option>
                    {freelancersForAccess.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.first_name} {f.last_name} ({f.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowAccessModal(false)}
                  className="flex-1 bg-gray-300 py-2 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleGrantAccess}
                  disabled={!selectedFreelancerForAccess}
                  className="flex-1 bg-teal-600 text-white py-2 rounded disabled:opacity-50"
                >
                  Grant Access
                </button>
              </div>
            </div>
          </div>
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
          <input required placeholder="Title (EN)" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border border-teal-300 rounded focus:ring-2 focus:ring-teal-500" />
          <input placeholder="Title (AR)" value={formData.title_ar} onChange={e => setFormData({ ...formData, title_ar: e.target.value })} className="w-full p-2 border border-teal-300 rounded focus:ring-2 focus:ring-teal-500" />
          <textarea required placeholder="Description (EN)" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3" className="w-full p-2 border border-teal-300 rounded focus:ring-2 focus:ring-teal-500" />
          <textarea placeholder="Description (AR)" value={formData.description_ar} onChange={e => setFormData({ ...formData, description_ar: e.target.value })} rows="3" className="w-full p-2 border border-teal-300 rounded focus:ring-2 focus:ring-teal-500" />
          <input required type="number" step="0.01" placeholder="Price" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full p-2 border border-teal-300 rounded focus:ring-2 focus:ring-teal-500" />
          <div className="flex space-x-3 mt-6">
            <button type="submit" className="flex-1 bg-teal-600 text-white py-2 rounded">Save</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoursesManagement;