// src/components/coursesManagement/CourseDetail.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Play, 
  Download, 
  Clock, 
  Users, 
  DollarSign, 
  BookOpen, 
  AlertCircle,
  Lock
} from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const { token } = useSelector(state => state.auth);
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [id, token]);

  const checkAccess = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/courses/check-access/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasAccess(response.data.hasAccess);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check access');
    } finally {
      setCheckingAccess(false);
    }
  };

  useEffect(() => {
    if (hasAccess && !checkingAccess) {
      fetchData();
    }
  }, [hasAccess, checkingAccess]);

  const fetchData = async () => {
    try {
      const [courseRes, matRes] = await Promise.all([
        axios.get(`http://localhost:5000/courses/view/${id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        axios.get(`http://localhost:5000/courses/${id}/materials`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ]);
      setCourse(courseRes.data.course);
      setMaterials(matRes.data.materials);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-teal-600 rounded-full"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-teal-200 max-w-md mx-4">
          <Lock className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this course.</p>
          <Link 
            to="/my-courses" 
            className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!course) return <Error message="Course not found" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link to="/my-courses" className="flex items-center text-teal-600 mb-6 hover:text-teal-700 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-1" /> Back to My Courses
          </Link>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-gray-600 text-lg mb-6">{course.description}</p>
              <div className="flex flex-wrap gap-6 text-gray-600 mb-6">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-teal-600" />
                  <span className="font-semibold">${course.price}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-teal-600" />
                  <span>10 hours</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-teal-600" />
                  <span>{materials.length} lessons</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-3 text-teal-600" />
                Course Content
              </h2>
              <div className="space-y-4">
                {materials.map((m, i) => (
                  <div key={m.id} className="p-6 bg-white border border-teal-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center mr-4">
                          <Play className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">Lesson {i + 1}: {m.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">Duration: 15 min</p>
                        </div>
                      </div>
                      <a 
                        href={m.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin h-12 w-12 border-4 border-teal-600 rounded-full"></div>
  </div>
);

const Error = ({ message }) => (
  <div className="flex items-center justify-center min-h-screen text-red-600 text-lg">{message}</div>
);

export default CourseDetail;