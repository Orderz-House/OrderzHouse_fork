import React, { useState, useEffect, useCallback } from 'react';
import Loader from "../admin-components/loader/loader.jsx";

const CoursesDashboard = ({ onBack }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseEnrollments, setCourseEnrollments] = useState([]);
  const [courseMaterials, setCourseMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('categories'); 
  const [activeTab, setActiveTab] = useState('enrollments'); 
  const [tabLoading, setTabLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch courses by category
  const fetchCoursesByCategory = async (categoryId) => {
    try {
      setLoading(true);
      const response = await fetch(`/courses/category/${categoryId}`);
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
      const response = await fetch(`/courses/${courseId}/enrollments`);
      const data = await response.json();
      if (data.success) {
        setCourseEnrollments(data.enrollments || []);
      } else {
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
      const response = await fetch(`/courses/${courseId}/materials`);
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

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setActiveTab('enrollments');
    fetchCourseEnrollments(course.id);
    setShowModal(true);
  };

  const getFilteredCourses = () => {
    if (!searchTerm) return courses;
    
    return courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      course.id.toString().includes(searchTerm)
    );
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (loading && (categories.length === 0 || courses.length === 0)) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        minHeight: '100vh',
        padding: '32px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Loader />
      </div>
    );
  }

  // Categories View
  if (activeView === 'categories') {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        minHeight: '100vh',
        padding: '24px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#374151'
      }}>
        <style>
          {`
            .category-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              transition: all 0.2s ease;
            }
          `}
        </style>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  background: '#374151',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  marginRight: '12px',
                  color: 'white',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#111827'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#374151'}
              >
                ←
              </button>
            )}
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              margin: '0',
              color: '#111827'
            }}>
              Course Categories
            </h1>
          </div>
          <p style={{
            color: '#6b7280',
            margin: '0',
            fontSize: '16px'
          }}>
            Select a category to manage courses
          </p>
        </div>

        {/* Categories Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          maxWidth: '1200px'
        }}>
          {categories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => {
                setSelectedCategory(category);
                fetchCoursesByCategory(category.id);
              }}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f3f4f6',
                color: '#374151',
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '16px'
              }}>
                {category.name.charAt(0)}
              </div>

              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 8px 0'
              }}>
                {category.name}
              </h3>

              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 16px 0',
                lineHeight: '1.5'
              }}>
                {category.description || 'Manage courses in this category'}
              </p>

              <div style={{
                fontSize: '12px',
                color: '#374151',
                fontWeight: '500',
                background: '#f9fafb',
                padding: '6px 12px',
                borderRadius: '6px',
                display: 'inline-block'
              }}>
                View Courses →
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Courses View
  const filteredCourses = getFilteredCourses();

  return (
    <div style={{
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      padding: '24px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: '#374151'
    }}>
      <style>
        {`
          .course-row:hover {
            background-color: #f9fafb;
            transition: all 0.2s ease;
          }
        `}
      </style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <button
            onClick={() => setActiveView('categories')}
            style={{
              background: '#374151',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              marginRight: '12px',
              color: 'white',
              padding: '10px 12px',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#111827'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#374151'}
          >
            ←
          </button>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              margin: '0',
              color: '#111827'
            }}>
              {selectedCategory?.name} Courses
            </h1>
            <p style={{
              color: '#6b7280',
              margin: '4px 0 0 0',
              fontSize: '14px'
            }}>
              {courses.length} courses available
            </p>
          </div>
        </div>
      </div>

      {/* Main Courses Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        {/* Search */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '10px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          />
        </div>

        {/* Courses Table */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 2fr 1fr 120px 120px 100px',
            gap: '16px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase'
          }}>
            <div>ID</div>
            <div>Course Title</div>
            <div>Description</div>
            <div>Price</div>
            <div>Created</div>
            <div>Actions</div>
          </div>

          {filteredCourses.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#6b7280'
            }}>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                {searchTerm ? 'No courses found matching your search' : 'No courses available in this category'}
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first course to get started'}
              </p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className="course-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 2fr 1fr 120px 120px 100px',
                  gap: '16px',
                  padding: '16px',
                  borderBottom: '1px solid #f3f4f6',
                  alignItems: 'center',
                  fontSize: '14px'
                }}
              >
                <div style={{ 
                  fontWeight: '600', 
                  color: '#111827',
                  background: '#f3f4f6',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '12px'
                }}>
                  #{course.id}
                </div>
                
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px', color: '#111827' }}>
                    {course.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {course.category_name || selectedCategory?.name}
                  </div>
                </div>
                
                <div style={{ 
                  fontSize: '13px', 
                  color: '#374151',
                  lineHeight: '1.4'
                }}>
                  {course.description ? 
                    (course.description.length > 80 ? 
                      course.description.substring(0, 80) + '...' : 
                      course.description
                    ) : 
                    'No description'
                  }
                </div>

                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#059669'
                }}>
                  ${course.price}
                </div>

                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280'
                }}>
                  {course.created_at ? new Date(course.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'N/A'}
                </div>
                
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  <button
                    onClick={() => handleViewCourse(course)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '11px',
                      border: '1px solid #374151',
                      backgroundColor: 'transparent',
                      color: '#374151',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Course Detail Modal */}
      {showModal && selectedCourse && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827'
              }}>
                {selectedCourse.title}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedCourse(null);
                }}
                style={{
                  background: '#374151',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* Course Info */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '24px',
              padding: '20px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}>
                  PRICE
                </div>
                <div style={{ fontSize: '18px', color: '#059669', fontWeight: '700' }}>
                  ${selectedCourse.price}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}>
                  COURSE ID
                </div>
                <div style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>
                  #{selectedCourse.id}
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
                Description
              </div>
              <div style={{
                fontSize: '14px',
                color: '#374151',
                lineHeight: '1.6',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                minHeight: '60px'
              }}>
                {selectedCourse.description || 'No description available'}
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <button
                onClick={() => handleTabChange('enrollments')}
                style={{
                  background: activeTab === 'enrollments' ? '#374151' : 'white',
                  color: activeTab === 'enrollments' ? 'white' : '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Enrollments ({courseEnrollments.length})
              </button>
              <button
                onClick={() => handleTabChange('materials')}
                style={{
                  background: activeTab === 'materials' ? '#374151' : 'white',
                  color: activeTab === 'materials' ? 'white' : '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Materials ({courseMaterials.length})
              </button>
            </div>

            {/* Tab Content */}
            <div style={{
              minHeight: '200px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px'
            }}>
              {tabLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                  <Loader />
                </div>
              ) : (
                <>
                  {activeTab === 'enrollments' ? (
                    <div>
                      <h4 style={{ 
                        margin: '0 0 16px 0', 
                        color: '#111827', 
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>
                        Course Enrollments
                      </h4>
                      {courseEnrollments.length === 0 ? (
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '40px', 
                          color: '#6b7280' 
                        }}>
                          <p style={{ margin: 0, fontSize: '14px' }}>
                            No enrollments yet
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {courseEnrollments.map((enrollment, index) => (
                            <div key={index} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px',
                              background: 'white',
                              borderRadius: '6px',
                              border: '1px solid #e5e7eb'
                            }}>
                              <div>
                                <div style={{ 
                                  fontWeight: '600', 
                                  color: '#111827',
                                  fontSize: '14px'
                                }}>
                                  {enrollment.freelancer_name || `User #${enrollment.freelancer_id}`}
                                </div>
                                <div style={{ 
                                  fontSize: '12px', 
                                  color: '#6b7280' 
                                }}>
                                  {enrollment.freelancer_email}
                                </div>
                                <div style={{ 
                                  fontSize: '12px', 
                                  color: '#6b7280' 
                                }}>
                                  Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                </div>
                              </div>
                              <div style={{
                                background: '#374151',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}>
                                {enrollment.progress || 0}% Complete
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h4 style={{ 
                        margin: '0 0 16px 0', 
                        color: '#111827', 
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>
                        Course Materials
                      </h4>
                      {courseMaterials.length === 0 ? (
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '40px', 
                          color: '#6b7280' 
                        }}>
                          <p style={{ margin: 0, fontSize: '14px' }}>
                            No materials uploaded yet
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {courseMaterials.map((material, index) => (
                            <div key={index} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px',
                              background: 'white',
                              borderRadius: '6px',
                              border: '1px solid #e5e7eb'
                            }}>
                              <div>
                                <div style={{ 
                                  fontWeight: '600', 
                                  color: '#111827',
                                  fontSize: '14px'
                                }}>
                                  {material.title}
                                </div>
                                <div style={{ 
                                  fontSize: '12px', 
                                  color: '#6b7280' 
                                }}>
                                  {material.file_type} • {new Date(material.created_at).toLocaleDateString()}
                                </div>
                              </div>
                              <button style={{
                                background: '#374151',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}>
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
        </div>
      )}
    </div>
  );
};

export default CoursesDashboard;