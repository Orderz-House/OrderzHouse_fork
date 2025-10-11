// src/components/coursesManagement/AdminAccessControl.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Users, BookOpen, Check, X, Eye, Search } from 'lucide-react';

const AdminAccessControl = () => {
  const { token } = useSelector(state => state.auth);
  const [freelancers, setFreelancers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [accessData, setAccessData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFreelancer, setSelectedFreelancer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingAccess, setLoadingAccess] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [freelancersRes, coursesRes, accessRes] = await Promise.all([
        axios.get('http://localhost:5000/users/allfreelance', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/courses/view', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/access-control/all', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setFreelancers(freelancersRes.data.freelancers || []);
      setCourses(coursesRes.data.courses || []);
      setAccessData(accessRes.data.accessControl || {});
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccess = async (freelancerId, courseId, currentAccess) => {
    try {
      setLoadingAccess(prev => ({ ...prev, [`${freelancerId}-${courseId}`]: true }));
      
      await axios.post('http://localhost:5000/api/access-control/grant-access', {
        freelancer_id: freelancerId,
        course_id: courseId,
        can_access: !currentAccess
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setAccessData(prev => ({
        ...prev,
        [freelancerId]: {
          ...prev[freelancerId],
          [courseId]: !currentAccess
        }
      }));
    } catch (error) {
      console.error('Error updating access:', error);
    } finally {
      setLoadingAccess(prev => ({ ...prev, [`${freelancerId}-${courseId}`]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-teal-600 rounded-full"></div>
      </div>
    );
  }

  const filteredFreelancers = freelancers.filter(freelancer =>
    freelancer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freelancer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freelancer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h1 className="text-3xl font-bold text-gray-900">Course Access Control</h1>
                <p className="text-gray-600 mt-2">Manage freelancer course access permissions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-teal-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search freelancers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pl-10"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Freelancers List */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-teal-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-teal-600" />
              Freelancers ({filteredFreelancers.length})
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredFreelancers.map(freelancer => (
                <button
                  key={freelancer.id}
                  onClick={() => setSelectedFreelancer(freelancer.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedFreelancer === freelancer.id
                      ? 'bg-teal-100 border-teal-300 text-teal-700'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{freelancer.first_name} {freelancer.last_name}</div>
                  <div className="text-sm text-gray-500">{freelancer.email}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Courses with Access Controls */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-teal-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-teal-600" />
                Course Access ({selectedFreelancer ? 'For Selected Freelancer' : 'Select a Freelancer'})
              </h2>
              
              {selectedFreelancer && (
                <div className="space-y-4">
                  {courses.map(course => {
                    const freelancerAccess = accessData[selectedFreelancer] || {};
                    const hasAccess = freelancerAccess[course.id] || false;
                    const isLoading = loadingAccess[`${selectedFreelancer}-${course.id}`];
                    
                    return (
                      <div key={course.id} className="flex items-center justify-between p-4 border border-teal-200 rounded-lg hover:bg-teal-50">
                        <div>
                          <h3 className="font-semibold text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-600">{course.description}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            hasAccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {hasAccess ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                          </span>
                          <button
                            onClick={() => toggleAccess(selectedFreelancer, course.id, hasAccess)}
                            disabled={isLoading}
                            className={`p-2 rounded-lg ${
                              hasAccess 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                            } disabled:opacity-50`}
                          >
                            {isLoading ? (
                              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                            ) : (
                              hasAccess ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {!selectedFreelancer && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Select a freelancer to manage their course access</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccessControl;