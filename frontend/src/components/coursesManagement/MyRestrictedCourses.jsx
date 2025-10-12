// src/components/coursesManagement/MyRestrictedCourses.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { BookOpen, Clock, DollarSign, AlertCircle, Eye, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyRestrictedCourses = () => {
  const { token } = useSelector(state => state.auth);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAccessibleCourses();
  }, []);

  const fetchAccessibleCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/courses/accessible', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data.courses || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-teal-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-teal-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
                <p className="text-gray-600 mt-2">Courses you have access to</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 flex items-center shadow-lg">
            <AlertCircle className="w-6 h-6 mr-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-teal-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pl-10"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <div key={course.id} className="bg-white rounded-2xl shadow-lg p-6 border border-teal-200 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{course.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    ${course.price}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    Access Granted
                  </span>
                  <Link 
                    to={`/course/${course.id}`} 
                    className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Start Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-teal-200">
            <BookOpen className="w-16 h-16 text-teal-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Accessible Courses</h3>
            <p className="text-gray-600">You don't have access to any courses yet. Contact admin for permissions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRestrictedCourses;