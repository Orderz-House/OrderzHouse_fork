// Admin/components/CoursesManagement.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { ApiClient } from "adminjs";

const api = new ApiClient();

const CoursesManagement = ({ onBack }) => {
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const mountedRef = useRef(true);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch courses
      const coursesResponse = await api.resourceAction({
        resourceId: 'courses',
        actionName: 'list'
      });
      if (mountedRef.current) {
        setCourses(coursesResponse.data?.records || []);
      }

      // Fetch materials
      const materialsResponse = await api.resourceAction({
        resourceId: 'course_materials',
        actionName: 'list'
      });
      if (mountedRef.current) {
        setMaterials(materialsResponse.data?.records || []);
      }

      // Fetch enrollments
      const enrollmentsResponse = await api.resourceAction({
        resourceId: 'course_enrollments',
        actionName: 'list'
      });
      if (mountedRef.current) {
        setEnrollments(enrollmentsResponse.data?.records || []);
      }

    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchAllData();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchAllData]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (mountedRef.current) {
        fetchAllData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAllData]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          Loading courses data...
        </div>
      </div>
    );
  }

  // Filter courses based on search and status
  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchTerm || 
      (course.params?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.params?.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (course.params?.status || 'draft') === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Filter materials based on search
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = !searchTerm || 
      (material.params?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.params?.course_title || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Filter enrollments based on search
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = !searchTerm || 
      (enrollment.params?.freelancer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enrollment.params?.freelancer_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enrollment.params?.course_title || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleRefresh = () => {
    fetchAllData();
  };

  const handleDelete = async (resourceId, recordId, itemName) => {
    if (confirm(`Are you sure you want to delete this ${itemName}? This action cannot be undone.`)) {
      try {
        await api.resourceAction({
          resourceId,
          actionName: 'delete',
          recordId
        });
        // Refresh data after deletion
        fetchAllData();
      } catch (error) {
        console.error(`Failed to delete ${itemName}:`, error);
        alert(`Failed to delete ${itemName}. Please try again.`);
      }
    }
  };

  // Styles
  const containerStyle = {
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e5e7eb'
  };

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    background: isActive ? '#3b82f6' : '#f8f9fa',
    color: isActive ? 'white' : '#6b7280',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    marginRight: '8px'
  });

  const searchBarStyle = {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    alignItems: 'center'
  };

  const inputStyle = {
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    minWidth: '200px'
  };

  const selectStyle = {
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    background: 'white'
  };

  const buttonStyle = {
    background: '#10b981',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  };

  const refreshButtonStyle = {
    background: '#f8f9fa',
    color: '#374151',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    fontSize: '14px'
  };

  const sectionHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  };

  const cardStyle = {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  };

  const emptyStateStyle = {
    background: '#f8f9fa',
    padding: '60px',
    borderRadius: '8px',
    textAlign: 'center',
    color: '#6b7280'
  };

  // Courses Section Component
  const CoursesSection = () => (
    <div>
      <div style={sectionHeaderStyle}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#1e293b' }}>
          Courses ({filteredCourses.length})
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleRefresh} style={refreshButtonStyle}>
            🔄 Refresh
          </button>
          <a 
            href="/admin/resources/courses/actions/new"
            style={buttonStyle}
          >
            + Add Course
          </a>
        </div>
      </div>

      <div style={searchBarStyle}>
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={inputStyle}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        {(searchTerm || filterStatus !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}
            style={{
              ...refreshButtonStyle,
              background: '#ef4444',
              color: 'white',
              border: 'none'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {filteredCourses.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <h3 style={{ margin: '0 0 12px 0', color: '#374151' }}>
            {searchTerm || filterStatus !== 'all' ? 'No courses match your filters' : 'No courses created yet'}
          </h3>
          <p style={{ margin: '0 0 24px 0', fontSize: '16px' }}>
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search terms or filters'
              : 'Create your first course to get started with course management'
            }
          </p>
          {(!searchTerm && filterStatus === 'all') && (
            <a 
              href="/admin/resources/courses/actions/new"
              style={{...buttonStyle, textDecoration: 'none'}}
            >
              Create Your First Course
            </a>
          )}
        </div>
      ) : (
        <div style={gridStyle}>
          {filteredCourses.map((course) => (
            <div 
              key={course.id} 
              style={cardStyle}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  margin: '0 0 8px 0',
                  color: '#1e293b',
                  lineHeight: '1.3'
                }}>
                  {course.params?.title || `Course #${course.id}`}
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '14px', 
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  {course.params?.description ? 
                    (course.params.description.length > 120 ? 
                      course.params.description.substring(0, 120) + '...' : 
                      course.params.description
                    ) : 
                    'No description available'
                  }
                </p>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    background: course.params?.status === 'active' ? '#dcfce7' : 
                               course.params?.status === 'archived' ? '#fef3c7' : '#f3f4f6',
                    color: course.params?.status === 'active' ? '#166534' : 
                           course.params?.status === 'archived' ? '#92400e' : '#374151',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {course.params?.status || 'Draft'}
                  </span>
                  
                  {course.params?.price && (
                    <span style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      ${course.params.price}
                    </span>
                  )}
                  
                  {course.params?.duration && (
                    <span style={{
                      background: '#ecfdf5',
                      color: '#166534',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {course.params.duration}
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                justifyContent: 'flex-end',
                borderTop: '1px solid #f1f3f4',
                paddingTop: '16px'
              }}>
                <a
                  href={`/admin/resources/courses/records/${course.id}/show`}
                  style={{
                    background: '#f8f9fa',
                    color: '#374151',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '12px',
                    border: '1px solid #e5e7eb',
                    fontWeight: '500'
                  }}
                >
                  👁️ View
                </a>
                <a
                  href={`/admin/resources/courses/records/${course.id}/edit`}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  ✏️ Edit
                </a>
                <button
                  onClick={() => handleDelete('courses', course.id, 'course')}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Materials Section Component
  const MaterialsSection = () => (
    <div>
      <div style={sectionHeaderStyle}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#1e293b' }}>
          Course Materials ({filteredMaterials.length})
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleRefresh} style={refreshButtonStyle}>
            🔄 Refresh
          </button>
          <a 
            href="/admin/resources/course_materials/actions/new"
            style={buttonStyle}
          >
            + Add Material
          </a>
        </div>
      </div>

      <div style={searchBarStyle}>
        <input
          type="text"
          placeholder="Search materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={inputStyle}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              ...refreshButtonStyle,
              background: '#ef4444',
              color: 'white',
              border: 'none'
            }}
          >
            Clear Search
          </button>
        )}
      </div>

      {filteredMaterials.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <h3 style={{ margin: '0 0 12px 0', color: '#374151' }}>
            {searchTerm ? 'No materials match your search' : 'No course materials uploaded yet'}
          </h3>
          <p style={{ margin: '0 0 24px 0', fontSize: '16px' }}>
            {searchTerm 
              ? 'Try different search terms'
              : 'Upload materials like PDFs, videos, and documents for your courses'
            }
          </p>
          {!searchTerm && (
            <a 
              href="/admin/resources/course_materials/actions/new"
              style={{...buttonStyle, textDecoration: 'none'}}
            >
              Upload First Material
            </a>
          )}
        </div>
      ) : (
        <div style={gridStyle}>
          {filteredMaterials.map((material) => (
            <div key={material.id} style={cardStyle}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  margin: '0 0 8px 0',
                  color: '#1e293b'
                }}>
                  {material.params?.title || `Material #${material.id}`}
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '14px', 
                  margin: '0 0 8px 0'
                }}>
                  Course: {material.params?.course_title || 'Unknown Course'}
                </p>
                
                {material.params?.description && (
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '14px', 
                    margin: '0 0 12px 0',
                    lineHeight: '1.4'
                  }}>
                    {material.params.description}
                  </p>
                )}
                
                {material.params?.file_url && (
                  <div style={{
                    background: '#f8f9fa',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <a 
                      href={material.params.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#3b82f6',
                        fontSize: '14px',
                        textDecoration: 'none',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      📎 {material.params.file_url.split('/').pop() || 'Download File'}
                    </a>
                  </div>
                )}
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                justifyContent: 'flex-end',
                borderTop: '1px solid #f1f3f4',
                paddingTop: '16px'
              }}>
                <a
                  href={`/admin/resources/course_materials/records/${material.id}/show`}
                  style={{
                    background: '#f8f9fa',
                    color: '#374151',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '12px',
                    border: '1px solid #e5e7eb',
                    fontWeight: '500'
                  }}
                >
                  👁️ View
                </a>
                <a
                  href={`/admin/resources/course_materials/records/${material.id}/edit`}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  ✏️ Edit
                </a>
                <button
                  onClick={() => handleDelete('course_materials', material.id, 'material')}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Enrollments Section Component
  const EnrollmentsSection = () => (
    <div>
      <div style={sectionHeaderStyle}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#1e293b' }}>
          Course Enrollments ({filteredEnrollments.length})
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleRefresh} style={refreshButtonStyle}>
            🔄 Refresh
          </button>
          <a 
            href="/admin/resources/course_enrollments/actions/new"
            style={buttonStyle}
          >
            + Add Enrollment
          </a>
        </div>
      </div>

      <div style={searchBarStyle}>
        <input
          type="text"
          placeholder="Search enrollments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={inputStyle}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              ...refreshButtonStyle,
              background: '#ef4444',
              color: 'white',
              border: 'none'
            }}
          >
            Clear Search
          </button>
        )}
      </div>

      {filteredEnrollments.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <h3 style={{ margin: '0 0 12px 0', color: '#374151' }}>
            {searchTerm ? 'No enrollments match your search' : 'No enrollments found'}
          </h3>
          <p style={{ margin: '0 0 24px 0', fontSize: '16px' }}>
            {searchTerm 
              ? 'Try different search terms'
              : 'Enroll students in courses to track their progress'
            }
          </p>
          {!searchTerm && (
            <a 
              href="/admin/resources/course_enrollments/actions/new"
              style={{...buttonStyle, textDecoration: 'none'}}
            >
              Create First Enrollment
            </a>
          )}
        </div>
      ) : (
        <div style={gridStyle}>
          {filteredEnrollments.map((enrollment) => (
            <div key={enrollment.id} style={cardStyle}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  margin: '0 0 8px 0',
                  color: '#1e293b'
                }}>
                  {enrollment.params?.freelancer_name || `User #${enrollment.params?.freelancer_id}`}
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '14px', 
                  margin: '0 0 4px 0'
                }}>
                  📧 {enrollment.params?.freelancer_email || 'No email provided'}
                </p>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '14px', 
                  margin: '0 0 8px 0'
                }}>
                  📚 {enrollment.params?.course_title || 'Unknown Course'}
                </p>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '12px', 
                  margin: '0 0 16px 0'
                }}>
                  📅 Enrolled: {enrollment.params?.enrolled_at ? 
                    new Date(enrollment.params.enrolled_at).toLocaleDateString() : 
                    'Unknown date'
                  }
                </p>
                
                {/* Progress Section */}
                <div style={{ 
                  background: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Progress
                    </span>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: '700',
                      color: '#1e40af',
                      background: '#dbeafe',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {enrollment.params?.progress || 0}%
                    </span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    background: '#e5e7eb', 
                    borderRadius: '4px', 
                    height: '8px',
                    overflow: 'hidden'
                  }}>
                    <div 
                      style={{ 
                        background: enrollment.params?.progress >= 100 ? '#10b981' : '#3b82f6', 
                        height: '8px', 
                        borderRadius: '4px',
                        width: `${Math.min(enrollment.params?.progress || 0, 100)}%`,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                justifyContent: 'flex-end',
                borderTop: '1px solid #f1f3f4',
                paddingTop: '16px'
              }}>
                <a
                  href={`/admin/resources/course_enrollments/records/${enrollment.id}/show`}
                  style={{
                    background: '#f8f9fa',
                    color: '#374151',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '12px',
                    border: '1px solid #e5e7eb',
                    fontWeight: '500'
                  }}
                >
                  👁️ View
                </a>
                <a
                  href={`/admin/resources/course_enrollments/records/${enrollment.id}/edit`}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  ✏️ Edit
                </a>
                <button
                  onClick={() => handleDelete('course_enrollments', enrollment.id, 'enrollment')}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
          📚 Courses Management
        </h1>
        <button 
          onClick={onBack}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Tabs Navigation */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button 
            onClick={() => {
              setActiveTab('courses');
              setSearchTerm('');
              setFilterStatus('all');
            }}
            style={tabStyle(activeTab === 'courses')}
          >
            📚 Courses ({courses.length})
          </button>
          <button 
            onClick={() => {
              setActiveTab('materials');
              setSearchTerm('');
            }}
            style={tabStyle(activeTab === 'materials')}
          >
            📄 Materials ({materials.length})
          </button>
          <button 
            onClick={() => {
              setActiveTab('enrollments');
              setSearchTerm('');
            }}
            style={tabStyle(activeTab === 'enrollments')}
          >
            👥 Enrollments ({enrollments.length})
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'courses' && <CoursesSection />}
      {activeTab === 'materials' && <MaterialsSection />}
      {activeTab === 'enrollments' && <EnrollmentsSection />}
    </div>
  );
};

export default CoursesManagement;