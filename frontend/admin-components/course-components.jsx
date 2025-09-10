import React, { useState, useEffect } from 'react';
import Loader from "../admin-components/loader/loader.jsx";

const CoursesDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseEnrollments, setCourseEnrollments] = useState([]);
  const [courseMaterials, setCourseMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard'); 
  const [activeTab, setActiveTab] = useState('enrollments'); 
  const [tabLoading, setTabLoading] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses by category
  const fetchCoursesByCategory = async (categoryId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/courses/category/${categoryId}`);
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
        setActiveView('courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch course enrollments
  const fetchCourseEnrollments = async (courseId) => {
    try {
      setTabLoading(true);
      const response = await fetch(`http://localhost:5000/courses/${courseId}/enrollments`);
      const data = await response.json();
      console.log('Enrollments response:', data);
      if (data.success) {
        setCourseEnrollments(data.enrollments || []);
      } else {
        console.error('Enrollments API error:', data.error);
        setCourseEnrollments([]);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setCourseEnrollments([]);
    } finally {
      setTabLoading(false);
    }
  };

  // Fetch course materials
  const fetchCourseMaterials = async (courseId) => {
    try {
      setTabLoading(true);
      const response = await fetch(`http://localhost:5000/courses/${courseId}/materials`);
      const data = await response.json();
      if (data.success) {
        setCourseMaterials(data.materials || []);
      } else {
        setCourseMaterials([]);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      setCourseMaterials([]);
    } finally {
      setTabLoading(false);
    }
  };

  // Handle tab change with data fetching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (selectedCourse) {
      if (tab === 'enrollments') {
        fetchCourseEnrollments(selectedCourse.id);
      } else if (tab === 'materials') {
        fetchCourseMaterials(selectedCourse.id);
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getCategoryColor = (index) => {
    const colors = ['#a78bfa', '#86efac', '#7dd3fc', '#fdba74', '#fca5a5', '#c4b5fd'];
    return colors[index % colors.length];
  };

  if (loading) {
    return <Loader />;
  }

  // Dashboard view - categories
  const DashboardView = () => (
    <div style={{
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      padding: '32px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      color: '#334155'
    }}>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      <div style={{
        marginBottom: '40px',
        animation: 'fadeInUp 0.6s ease-out'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          margin: '0 0 8px 0',
          color: '#0f172a',
          letterSpacing: '-0.025em'
        }}>
          Course Categories
        </h1>
        <p style={{
          margin: '0',
          color: '#64748b',
          fontSize: '16px',
          fontWeight: '400'
        }}>
          Manage courses across different categories
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {categories.map((category, index) => (
          <div
            key={category.id}
            onClick={() => {
              setSelectedCategory(category);
              fetchCoursesByCategory(category.id);
            }}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden',
              animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
              '--card-color': getCategoryColor(index),
              '--card-color-rgb': getCategoryColor(index).replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16)).join(', ')
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: getCategoryColor(index),
              transform: 'scaleX(0)',
              transition: 'transform 0.2s ease'
            }}></div>

            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: getCategoryColor(index),
              color: 'white',
              flexShrink: 0,
              marginBottom: '16px',
              transition: 'transform 0.2s ease'
            }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {category.name.charAt(0)}
              </div>
            </div>

            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#0f172a',
              margin: '0 0 4px 0',
              lineHeight: '1.3'
            }}>
              {category.name}
            </h3>

            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: '0 0 16px 0',
              lineHeight: '1.4'
            }}>
              {category.description || 'Manage courses in this category'}
            </p>

            <div style={{
              fontSize: '12px',
              color: getCategoryColor(index),
              fontWeight: '600',
              background: `${getCategoryColor(index)}15`,
              padding: '6px 12px',
              borderRadius: '20px',
              display: 'inline-block'
            }}>
              Manage Courses →
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Courses list view
  const CoursesView = () => (
    <div style={{
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      padding: '32px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      color: '#334155'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '32px',
        gap: '16px'
      }}>
        <button
          onClick={() => setActiveView('dashboard')}
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 12px -2px rgba(79, 70, 229, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(79, 70, 229, 0.4)';
          }}
        >
          ← Back to Categories
        </button>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#0f172a',
            margin: '0 0 4px 0'
          }}>
            {selectedCategory?.name} Courses
          </h1>
          <p style={{
            color: '#64748b',
            margin: 0,
            fontSize: '14px'
          }}>
            {courses.length} courses in this category
          </p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: '#f1f5f9',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '32px'
          }}>
            📚
          </div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#0f172a',
            margin: '0 0 8px 0'
          }}>
            No courses yet
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: '14px',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Create your first course in this category
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {courses.map((course, index) => (
            <div
              key={course.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s ease',
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#0f172a',
                margin: '0 0 8px 0',
                lineHeight: '1.3'
              }}>
                {course.title}
              </h3>

              <p style={{
                color: '#64748b',
                fontSize: '14px',
                margin: '0 0 20px 0',
                lineHeight: '1.4'
              }}>
                {course.description ? 
                  (course.description.length > 120 ? 
                    course.description.substring(0, 120) + '...' : 
                    course.description
                  ) : 
                  'No description available'
                }
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#10b981'
                }}>
                  ${course.price}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#64748b',
                  background: '#f1f5f9',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontWeight: '500'
                }}>
                  ID: {course.id}
                </div>
              </div>

              <button 
                onClick={() => {
                  setSelectedCourse(course);
                  setActiveView('course-detail');
                  setActiveTab('enrollments');
                  fetchCourseEnrollments(course.id);
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Manage Course
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Course detail view with enrollments and materials
  const CourseDetailView = () => (
    <div style={{
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      padding: '32px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      color: '#334155'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setActiveView('courses')}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)'
            }}
          >
            ← Back to Courses
          </button>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 4px 0'
            }}>
              {selectedCourse?.title}
            </h1>
            <p style={{
              color: '#64748b',
              margin: 0,
              fontSize: '14px'
            }}>
              Course Management
            </p>
          </div>
        </div>
        
        <button style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}>
          Edit Course
        </button>
      </div>

      {/* Course Info Card */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{
              margin: '0 0 8px 0',
              color: '#0f172a',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              Course Overview
            </h2>
            <p style={{
              color: '#64748b',
              margin: 0,
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {selectedCourse?.description || 'No description available'}
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          padding: '24px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              Course Price
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#10b981'
            }}>
              ${selectedCourse?.price}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              Course ID
            </div>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#0f172a',
              fontFamily: 'monospace',
              background: 'white',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0'
            }}>
              #{selectedCourse?.id}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              Created Date
            </div>
            <div style={{
              fontSize: '1rem',
              fontWeight: '500',
              color: '#0f172a'
            }}>
              {selectedCourse?.created_at 
                ? new Date(selectedCourse.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : 'N/A'
              }
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              Status
            </div>
            <div style={{
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#10b981',
              background: '#10b98115',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid #10b98130'
            }}>
              Active
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => handleTabChange('enrollments')}
          style={{
            background: activeTab === 'enrollments' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'white',
            color: activeTab === 'enrollments' ? 'white' : '#64748b',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
        >
          Enrollments ({courseEnrollments.length})
        </button>
        <button
          onClick={() => handleTabChange('materials')}
          style={{
            background: activeTab === 'materials' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'white',
            color: activeTab === 'materials' ? 'white' : '#64748b',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
        >
          Materials ({courseMaterials.length})
        </button>
      </div>

      {/* Tab Content */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        minHeight: '400px'
      }}>
        {tabLoading ? (
          <Loader />
        ) : (
          <>
            {activeTab === 'enrollments' ? (
              <div>
                <h3 style={{ 
                  margin: '0 0 20px 0', 
                  color: '#0f172a', 
                  fontSize: '1.125rem',
                  fontWeight: '600'
                }}>
                  Course Enrollments
                </h3>
                {courseEnrollments.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#64748b' 
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '20px',
                      background: '#f1f5f9',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      fontSize: '32px'
                    }}>
                      👥
                    </div>
                    <h4 style={{ 
                      color: '#0f172a', 
                      margin: '0 0 8px 0',
                      fontSize: '1.125rem',
                      fontWeight: '600'
                    }}>
                      No enrollments yet
                    </h4>
                    <p style={{ 
                      margin: 0,
                      color: '#64748b',
                      fontSize: '14px'
                    }}>
                      Students will appear here once they enroll in this course
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {courseEnrollments.map((enrollment, index) => (
                      <div key={enrollment.id || index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontWeight: '600', 
                            color: '#0f172a',
                            fontSize: '14px'
                          }}>
                            {enrollment.freelancer_name || `User #${enrollment.freelancer_id}`}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#64748b' 
                          }}>
                            {enrollment.freelancer_email}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#64748b', 
                            marginTop: '4px' 
                          }}>
                            Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px' 
                        }}>
                          <div style={{
                            background: '#3b82f6',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {enrollment.progress || 0}% Complete
                          </div>
                          <div style={{
                            background: enrollment.status === 'active' ? '#10b981' : 
                                       enrollment.status === 'completed' ? '#8b5cf6' :
                                       enrollment.status === 'suspended' ? '#ef4444' : '#64748b',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'capitalize'
                          }}>
                            {enrollment.status || 'Active'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 style={{ 
                  margin: '0 0 20px 0', 
                  color: '#0f172a', 
                  fontSize: '1.125rem',
                  fontWeight: '600'
                }}>
                  Course Materials
                </h3>
                {courseMaterials.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#64748b' 
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '20px',
                      background: '#f1f5f9',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      fontSize: '32px'
                    }}>
                      📁
                    </div>
                    <h4 style={{ 
                      color: '#0f172a', 
                      margin: '0 0 8px 0',
                      fontSize: '1.125rem',
                      fontWeight: '600'
                    }}>
                      No materials uploaded yet
                    </h4>
                    <p style={{ 
                      margin: 0,
                      color: '#64748b',
                      fontSize: '14px'
                    }}>
                      Upload course materials like videos, documents, and resources
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {courseMaterials.map((material, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div>
                          <div style={{ 
                            fontWeight: '600', 
                            color: '#0f172a',
                            fontSize: '14px'
                          }}>
                            {material.title}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#64748b' 
                          }}>
                            {material.file_type} • {new Date(material.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <button style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .category-card:hover::before {
            transform: scaleX(1) !important;
          }
          
          .category-card:hover .category-icon {
            transform: scale(1.05) !important;
          }
        `}
      </style>
      
      {activeView === 'dashboard' && <DashboardView />}
      {activeView === 'courses' && <CoursesView />}
      {activeView === 'course-detail' && <CourseDetailView />}
    </div>
  );
};

export default CoursesDashboard;