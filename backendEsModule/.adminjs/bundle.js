(function (React, adminjs) {
  'use strict';

  function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

  var React__default = /*#__PURE__*/_interopDefault(React);

  // Admin/components/CoursesManagement.jsx
  const api$1 = new adminjs.ApiClient();
  const CoursesManagement = ({
    onBack
  }) => {
    const [courses, setCourses] = React.useState([]);
    const [materials, setMaterials] = React.useState([]);
    const [enrollments, setEnrollments] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('courses');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('all');
    const mountedRef = React.useRef(true);
    const fetchAllData = React.useCallback(async () => {
      try {
        setLoading(true);

        // Fetch courses
        const coursesResponse = await api$1.resourceAction({
          resourceId: 'courses',
          actionName: 'list'
        });
        if (mountedRef.current) {
          setCourses(coursesResponse.data?.records || []);
        }

        // Fetch materials
        const materialsResponse = await api$1.resourceAction({
          resourceId: 'course_materials',
          actionName: 'list'
        });
        if (mountedRef.current) {
          setMaterials(materialsResponse.data?.records || []);
        }

        // Fetch enrollments
        const enrollmentsResponse = await api$1.resourceAction({
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
    React.useEffect(() => {
      mountedRef.current = true;
      fetchAllData();
      return () => {
        mountedRef.current = false;
      };
    }, [fetchAllData]);

    // Auto-refresh data every 30 seconds
    React.useEffect(() => {
      const interval = setInterval(() => {
        if (mountedRef.current) {
          fetchAllData();
        }
      }, 30000);
      return () => clearInterval(interval);
    }, [fetchAllData]);
    if (loading) {
      return /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          fontSize: '16px',
          color: '#6b7280'
        }
      }, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          textAlign: 'center'
        }
      }, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }
      }), "Loading courses data..."));
    }

    // Filter courses based on search and status
    const filteredCourses = courses.filter(course => {
      const matchesSearch = !searchTerm || (course.params?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (course.params?.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || (course.params?.status || 'draft') === filterStatus;
      return matchesSearch && matchesStatus;
    });

    // Filter materials based on search
    const filteredMaterials = materials.filter(material => {
      const matchesSearch = !searchTerm || (material.params?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (material.params?.course_title || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    // Filter enrollments based on search
    const filteredEnrollments = enrollments.filter(enrollment => {
      const matchesSearch = !searchTerm || (enrollment.params?.freelancer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (enrollment.params?.freelancer_email || '').toLowerCase().includes(searchTerm.toLowerCase()) || (enrollment.params?.course_title || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
    const handleRefresh = () => {
      fetchAllData();
    };
    const handleDelete = async (resourceId, recordId, itemName) => {
      if (confirm(`Are you sure you want to delete this ${itemName}? This action cannot be undone.`)) {
        try {
          await api$1.resourceAction({
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
    const tabStyle = isActive => ({
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
    const CoursesSection = () => /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: sectionHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("h2", {
      style: {
        fontSize: '20px',
        fontWeight: '600',
        margin: 0,
        color: '#1e293b'
      }
    }, "Courses (", filteredCourses.length, ")"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement("button", {
      onClick: handleRefresh,
      style: refreshButtonStyle
    }, "\uD83D\uDD04 Refresh"), /*#__PURE__*/React__default.default.createElement("a", {
      href: "/admin/resources/courses/actions/new",
      style: buttonStyle
    }, "+ Add Course"))), /*#__PURE__*/React__default.default.createElement("div", {
      style: searchBarStyle
    }, /*#__PURE__*/React__default.default.createElement("input", {
      type: "text",
      placeholder: "Search courses...",
      value: searchTerm,
      onChange: e => setSearchTerm(e.target.value),
      style: inputStyle
    }), /*#__PURE__*/React__default.default.createElement("select", {
      value: filterStatus,
      onChange: e => setFilterStatus(e.target.value),
      style: selectStyle
    }, /*#__PURE__*/React__default.default.createElement("option", {
      value: "all"
    }, "All Status"), /*#__PURE__*/React__default.default.createElement("option", {
      value: "active"
    }, "Active"), /*#__PURE__*/React__default.default.createElement("option", {
      value: "draft"
    }, "Draft"), /*#__PURE__*/React__default.default.createElement("option", {
      value: "archived"
    }, "Archived")), (searchTerm || filterStatus !== 'all') && /*#__PURE__*/React__default.default.createElement("button", {
      onClick: () => {
        setSearchTerm('');
        setFilterStatus('all');
      },
      style: {
        ...refreshButtonStyle,
        background: '#ef4444',
        color: 'white',
        border: 'none'
      }
    }, "Clear Filters")), filteredCourses.length === 0 ? /*#__PURE__*/React__default.default.createElement("div", {
      style: emptyStateStyle
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '48px',
        marginBottom: '16px'
      }
    }, "\uD83D\uDCDA"), /*#__PURE__*/React__default.default.createElement("h3", {
      style: {
        margin: '0 0 12px 0',
        color: '#374151'
      }
    }, searchTerm || filterStatus !== 'all' ? 'No courses match your filters' : 'No courses created yet'), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        margin: '0 0 24px 0',
        fontSize: '16px'
      }
    }, searchTerm || filterStatus !== 'all' ? 'Try adjusting your search terms or filters' : 'Create your first course to get started with course management'), !searchTerm && filterStatus === 'all' && /*#__PURE__*/React__default.default.createElement("a", {
      href: "/admin/resources/courses/actions/new",
      style: {
        ...buttonStyle,
        textDecoration: 'none'
      }
    }, "Create Your First Course")) : /*#__PURE__*/React__default.default.createElement("div", {
      style: gridStyle
    }, filteredCourses.map(course => /*#__PURE__*/React__default.default.createElement("div", {
      key: course.id,
      style: cardStyle,
      onMouseOver: e => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      },
      onMouseOut: e => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: '16px'
      }
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: {
        fontSize: '20px',
        fontWeight: '600',
        margin: '0 0 8px 0',
        color: '#1e293b',
        lineHeight: '1.3'
      }
    }, course.params?.title || `Course #${course.id}`), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        color: '#6b7280',
        fontSize: '14px',
        margin: '0 0 12px 0',
        lineHeight: '1.5'
      }
    }, course.params?.description ? course.params.description.length > 120 ? course.params.description.substring(0, 120) + '...' : course.params.description : 'No description available'), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        background: course.params?.status === 'active' ? '#dcfce7' : course.params?.status === 'archived' ? '#fef3c7' : '#f3f4f6',
        color: course.params?.status === 'active' ? '#166534' : course.params?.status === 'archived' ? '#92400e' : '#374151',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500'
      }
    }, course.params?.status || 'Draft'), course.params?.price && /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        background: '#dbeafe',
        color: '#1e40af',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500'
      }
    }, "$", course.params.price), course.params?.duration && /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        background: '#ecfdf5',
        color: '#166534',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500'
      }
    }, course.params.duration))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end',
        borderTop: '1px solid #f1f3f4',
        paddingTop: '16px'
      }
    }, /*#__PURE__*/React__default.default.createElement("a", {
      href: `/admin/resources/courses/records/${course.id}/show`,
      style: {
        background: '#f8f9fa',
        color: '#374151',
        padding: '8px 12px',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '12px',
        border: '1px solid #e5e7eb',
        fontWeight: '500'
      }
    }, "\uD83D\uDC41\uFE0F View"), /*#__PURE__*/React__default.default.createElement("a", {
      href: `/admin/resources/courses/records/${course.id}/edit`,
      style: {
        background: '#3b82f6',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '12px',
        fontWeight: '500'
      }
    }, "\u270F\uFE0F Edit"), /*#__PURE__*/React__default.default.createElement("button", {
      onClick: () => handleDelete('courses', course.id, 'course'),
      style: {
        background: '#ef4444',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        border: 'none',
        fontSize: '12px',
        cursor: 'pointer',
        fontWeight: '500'
      }
    }, "\uD83D\uDDD1\uFE0F Delete"))))));

    // Materials Section Component
    const MaterialsSection = () => /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: sectionHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("h2", {
      style: {
        fontSize: '20px',
        fontWeight: '600',
        margin: 0,
        color: '#1e293b'
      }
    }, "Course Materials (", filteredMaterials.length, ")"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement("button", {
      onClick: handleRefresh,
      style: refreshButtonStyle
    }, "\uD83D\uDD04 Refresh"), /*#__PURE__*/React__default.default.createElement("a", {
      href: "/admin/resources/course_materials/actions/new",
      style: buttonStyle
    }, "+ Add Material"))), /*#__PURE__*/React__default.default.createElement("div", {
      style: searchBarStyle
    }, /*#__PURE__*/React__default.default.createElement("input", {
      type: "text",
      placeholder: "Search materials...",
      value: searchTerm,
      onChange: e => setSearchTerm(e.target.value),
      style: inputStyle
    }), searchTerm && /*#__PURE__*/React__default.default.createElement("button", {
      onClick: () => setSearchTerm(''),
      style: {
        ...refreshButtonStyle,
        background: '#ef4444',
        color: 'white',
        border: 'none'
      }
    }, "Clear Search")), filteredMaterials.length === 0 ? /*#__PURE__*/React__default.default.createElement("div", {
      style: emptyStateStyle
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '48px',
        marginBottom: '16px'
      }
    }, "\uD83D\uDCC4"), /*#__PURE__*/React__default.default.createElement("h3", {
      style: {
        margin: '0 0 12px 0',
        color: '#374151'
      }
    }, searchTerm ? 'No materials match your search' : 'No course materials uploaded yet'), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        margin: '0 0 24px 0',
        fontSize: '16px'
      }
    }, searchTerm ? 'Try different search terms' : 'Upload materials like PDFs, videos, and documents for your courses'), !searchTerm && /*#__PURE__*/React__default.default.createElement("a", {
      href: "/admin/resources/course_materials/actions/new",
      style: {
        ...buttonStyle,
        textDecoration: 'none'
      }
    }, "Upload First Material")) : /*#__PURE__*/React__default.default.createElement("div", {
      style: gridStyle
    }, filteredMaterials.map(material => /*#__PURE__*/React__default.default.createElement("div", {
      key: material.id,
      style: cardStyle
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: '16px'
      }
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: {
        fontSize: '18px',
        fontWeight: '600',
        margin: '0 0 8px 0',
        color: '#1e293b'
      }
    }, material.params?.title || `Material #${material.id}`), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        color: '#6b7280',
        fontSize: '14px',
        margin: '0 0 8px 0'
      }
    }, "Course: ", material.params?.course_title || 'Unknown Course'), material.params?.description && /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        color: '#6b7280',
        fontSize: '14px',
        margin: '0 0 12px 0',
        lineHeight: '1.4'
      }
    }, material.params.description), material.params?.file_url && /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        background: '#f8f9fa',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("a", {
      href: material.params.file_url,
      target: "_blank",
      rel: "noopener noreferrer",
      style: {
        color: '#3b82f6',
        fontSize: '14px',
        textDecoration: 'none',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, "\uD83D\uDCCE ", material.params.file_url.split('/').pop() || 'Download File'))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end',
        borderTop: '1px solid #f1f3f4',
        paddingTop: '16px'
      }
    }, /*#__PURE__*/React__default.default.createElement("a", {
      href: `/admin/resources/course_materials/records/${material.id}/show`,
      style: {
        background: '#f8f9fa',
        color: '#374151',
        padding: '8px 12px',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '12px',
        border: '1px solid #e5e7eb',
        fontWeight: '500'
      }
    }, "\uD83D\uDC41\uFE0F View"), /*#__PURE__*/React__default.default.createElement("a", {
      href: `/admin/resources/course_materials/records/${material.id}/edit`,
      style: {
        background: '#3b82f6',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '12px',
        fontWeight: '500'
      }
    }, "\u270F\uFE0F Edit"), /*#__PURE__*/React__default.default.createElement("button", {
      onClick: () => handleDelete('course_materials', material.id, 'material'),
      style: {
        background: '#ef4444',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        border: 'none',
        fontSize: '12px',
        cursor: 'pointer',
        fontWeight: '500'
      }
    }, "\uD83D\uDDD1\uFE0F Delete"))))));

    // Enrollments Section Component
    const EnrollmentsSection = () => /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: sectionHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("h2", {
      style: {
        fontSize: '20px',
        fontWeight: '600',
        margin: 0,
        color: '#1e293b'
      }
    }, "Course Enrollments (", filteredEnrollments.length, ")"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: '12px'
      }
    }, /*#__PURE__*/React__default.default.createElement("button", {
      onClick: handleRefresh,
      style: refreshButtonStyle
    }, "\uD83D\uDD04 Refresh"), /*#__PURE__*/React__default.default.createElement("a", {
      href: "/admin/resources/course_enrollments/actions/new",
      style: buttonStyle
    }, "+ Add Enrollment"))), /*#__PURE__*/React__default.default.createElement("div", {
      style: searchBarStyle
    }, /*#__PURE__*/React__default.default.createElement("input", {
      type: "text",
      placeholder: "Search enrollments...",
      value: searchTerm,
      onChange: e => setSearchTerm(e.target.value),
      style: inputStyle
    }), searchTerm && /*#__PURE__*/React__default.default.createElement("button", {
      onClick: () => setSearchTerm(''),
      style: {
        ...refreshButtonStyle,
        background: '#ef4444',
        color: 'white',
        border: 'none'
      }
    }, "Clear Search")), filteredEnrollments.length === 0 ? /*#__PURE__*/React__default.default.createElement("div", {
      style: emptyStateStyle
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '48px',
        marginBottom: '16px'
      }
    }, "\uD83D\uDC65"), /*#__PURE__*/React__default.default.createElement("h3", {
      style: {
        margin: '0 0 12px 0',
        color: '#374151'
      }
    }, searchTerm ? 'No enrollments match your search' : 'No enrollments found'), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        margin: '0 0 24px 0',
        fontSize: '16px'
      }
    }, searchTerm ? 'Try different search terms' : 'Enroll students in courses to track their progress'), !searchTerm && /*#__PURE__*/React__default.default.createElement("a", {
      href: "/admin/resources/course_enrollments/actions/new",
      style: {
        ...buttonStyle,
        textDecoration: 'none'
      }
    }, "Create First Enrollment")) : /*#__PURE__*/React__default.default.createElement("div", {
      style: gridStyle
    }, filteredEnrollments.map(enrollment => /*#__PURE__*/React__default.default.createElement("div", {
      key: enrollment.id,
      style: cardStyle
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: '16px'
      }
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: {
        fontSize: '18px',
        fontWeight: '600',
        margin: '0 0 8px 0',
        color: '#1e293b'
      }
    }, enrollment.params?.freelancer_name || `User #${enrollment.params?.freelancer_id}`), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        color: '#6b7280',
        fontSize: '14px',
        margin: '0 0 4px 0'
      }
    }, "\uD83D\uDCE7 ", enrollment.params?.freelancer_email || 'No email provided'), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        color: '#6b7280',
        fontSize: '14px',
        margin: '0 0 8px 0'
      }
    }, "\uD83D\uDCDA ", enrollment.params?.course_title || 'Unknown Course'), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        color: '#6b7280',
        fontSize: '12px',
        margin: '0 0 16px 0'
      }
    }, "\uD83D\uDCC5 Enrolled: ", enrollment.params?.enrolled_at ? new Date(enrollment.params.enrolled_at).toLocaleDateString() : 'Unknown date'), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        background: '#f8f9fa',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        fontSize: '12px',
        color: '#6b7280',
        fontWeight: '500'
      }
    }, "Progress"), /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        fontSize: '12px',
        fontWeight: '700',
        color: '#1e40af',
        background: '#dbeafe',
        padding: '2px 8px',
        borderRadius: '4px'
      }
    }, enrollment.params?.progress || 0, "%")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        width: '100%',
        background: '#e5e7eb',
        borderRadius: '4px',
        height: '8px',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        background: enrollment.params?.progress >= 100 ? '#10b981' : '#3b82f6',
        height: '8px',
        borderRadius: '4px',
        width: `${Math.min(enrollment.params?.progress || 0, 100)}%`,
        transition: 'width 0.3s ease'
      }
    })))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end',
        borderTop: '1px solid #f1f3f4',
        paddingTop: '16px'
      }
    }, /*#__PURE__*/React__default.default.createElement("a", {
      href: `/admin/resources/course_enrollments/records/${enrollment.id}/show`,
      style: {
        background: '#f8f9fa',
        color: '#374151',
        padding: '8px 12px',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '12px',
        border: '1px solid #e5e7eb',
        fontWeight: '500'
      }
    }, "\uD83D\uDC41\uFE0F View"), /*#__PURE__*/React__default.default.createElement("a", {
      href: `/admin/resources/course_enrollments/records/${enrollment.id}/edit`,
      style: {
        background: '#3b82f6',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '12px',
        fontWeight: '500'
      }
    }, "\u270F\uFE0F Edit"), /*#__PURE__*/React__default.default.createElement("button", {
      onClick: () => handleDelete('course_enrollments', enrollment.id, 'enrollment'),
      style: {
        background: '#ef4444',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        border: 'none',
        fontSize: '12px',
        cursor: 'pointer',
        fontWeight: '500'
      }
    }, "\uD83D\uDDD1\uFE0F Delete"))))));
    return /*#__PURE__*/React__default.default.createElement("div", {
      style: containerStyle
    }, /*#__PURE__*/React__default.default.createElement("style", null, `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `), /*#__PURE__*/React__default.default.createElement("div", {
      style: headerStyle
    }, /*#__PURE__*/React__default.default.createElement("h1", {
      style: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        margin: 0,
        color: '#1e293b'
      }
    }, "\uD83D\uDCDA Courses Management"), /*#__PURE__*/React__default.default.createElement("button", {
      onClick: onBack,
      style: {
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
      }
    }, "\u2190 Back to Dashboard")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: '30px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement("button", {
      onClick: () => {
        setActiveTab('courses');
        setSearchTerm('');
        setFilterStatus('all');
      },
      style: tabStyle(activeTab === 'courses')
    }, "\uD83D\uDCDA Courses (", courses.length, ")"), /*#__PURE__*/React__default.default.createElement("button", {
      onClick: () => {
        setActiveTab('materials');
        setSearchTerm('');
      },
      style: tabStyle(activeTab === 'materials')
    }, "\uD83D\uDCC4 Materials (", materials.length, ")"), /*#__PURE__*/React__default.default.createElement("button", {
      onClick: () => {
        setActiveTab('enrollments');
        setSearchTerm('');
      },
      style: tabStyle(activeTab === 'enrollments')
    }, "\uD83D\uDC65 Enrollments (", enrollments.length, ")"))), activeTab === 'courses' && /*#__PURE__*/React__default.default.createElement(CoursesSection, null), activeTab === 'materials' && /*#__PURE__*/React__default.default.createElement(MaterialsSection, null), activeTab === 'enrollments' && /*#__PURE__*/React__default.default.createElement(EnrollmentsSection, null));
  };

  // Admin/components/Dashboard.jsx
  const api = new adminjs.ApiClient();
  function Dashboard() {
    const {
      translateMessage
    } = adminjs.useTranslation();
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [adminLogs, setAdminLogs] = React.useState([]);
    const [userLogs, setUserLogs] = React.useState([]);
    const [currentView, setCurrentView] = React.useState('dashboard');
    const fetchingRef = React.useRef(false);
    const mountedRef = React.useRef(true);
    const fetchDashboardData = React.useCallback(async () => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      try {
        const response = await api.getDashboard();
        if (!mountedRef.current) return;
        if (response?.data) {
          setData(response.data);
          const allLogs = response.data.recentLogs || [];
          const admins = allLogs.filter(log => log.role_id === 1 || log.first_name === "System").slice(0, 5);
          const users = allLogs.filter(log => log.role_id !== 1 && log.first_name !== "System").slice(0, 5);
          setAdminLogs(admins);
          setUserLogs(users);
          setError(null);
        } else {
          throw new Error("No data received from API");
        }
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        if (mountedRef.current) setLoading(false);
        fetchingRef.current = false;
      }
    }, []);
    React.useEffect(() => {
      mountedRef.current = true;
      fetchDashboardData();
      return () => {
        mountedRef.current = false;
      };
    }, [fetchDashboardData]);

    // Real-time data updates every 10 seconds
    React.useEffect(() => {
      if (currentView !== 'dashboard') return; // Only refresh when on dashboard view

      const refreshInterval = setInterval(() => {
        if (!fetchingRef.current && mountedRef.current) {
          fetchDashboardData();
        }
      }, 10000);
      return () => clearInterval(refreshInterval);
    }, [fetchDashboardData, currentView]);

    // Real-time log updates every 5 seconds
    React.useEffect(() => {
      if (currentView !== 'dashboard') return; // Only refresh when on dashboard view

      const logInterval = setInterval(async () => {
        if (!mountedRef.current || fetchingRef.current) return;
        try {
          const response = await fetch("/api/admin/dashboard/logs");
          if (response.ok) {
            const newLogs = await response.json();
            if (mountedRef.current && newLogs?.recentLogs) {
              const allLogs = newLogs.recentLogs;
              const admins = allLogs.filter(log => log.role_id === 1 || log.first_name === "System").slice(0, 5);
              const users = allLogs.filter(log => log.role_id !== 1 && log.first_name !== "System").slice(0, 5);
              setAdminLogs(admins);
              setUserLogs(users);
            }
          }
        } catch {}
      }, 5000);
      return () => clearInterval(logInterval);
    }, [currentView]);
    const handleRefresh = React.useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData]);

    // Show courses management if currentView is 'courses'
    if (currentView === 'courses') {
      return /*#__PURE__*/React__default.default.createElement(CoursesManagement, {
        onBack: () => setCurrentView('dashboard')
      });
    }

    // Show error state
    if (error && !data) {
      return /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          fontSize: '16px',
          color: '#ef4444',
          textAlign: 'center'
        }
      }, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          fontSize: '48px',
          marginBottom: '16px'
        }
      }, "\u26A0\uFE0F"), /*#__PURE__*/React__default.default.createElement("h3", {
        style: {
          margin: '0 0 8px 0',
          color: '#ef4444'
        }
      }, "Failed to load dashboard"), /*#__PURE__*/React__default.default.createElement("p", {
        style: {
          margin: '0 0 16px 0',
          color: '#6b7280'
        }
      }, error), /*#__PURE__*/React__default.default.createElement("button", {
        onClick: handleRefresh,
        style: {
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: '14px'
        }
      }, "Retry"));
    }
    if (loading && !data) {
      return /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          fontSize: '16px',
          color: '#6b7280'
        }
      }, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }
      }), "Loading Dashboard...");
    }
    const metrics = data?.metrics || {};
    const statsCards = [{
      title: "Total Admins",
      value: metrics.adminsCount || 0,
      link: "/admin/resources/admins",
      color: "#3b82f6",
      icon: "👥"
    }, {
      title: "Clients",
      value: metrics.clientsCount || 0,
      link: "/admin/resources/clients",
      color: "#10b981",
      icon: "🏢"
    }, {
      title: "Freelancers",
      value: metrics.freelancersCount || 0,
      link: "/admin/resources/freelancers",
      color: "#f59e0b",
      icon: "💼"
    }, {
      title: "Active Projects",
      value: metrics.projectsCount || 0,
      link: "/admin/resources/projects",
      color: "#ef4444",
      icon: "🚀"
    }, {
      title: "Pending Appointments",
      value: metrics.pendingAppointments || 0,
      link: "/admin/resources/appointments",
      color: "#8b5cf6",
      icon: "📅"
    }, {
      title: "Courses",
      value: metrics.coursesCount || 0,
      action: 'courses',
      color: "#06b6d4",
      icon: "📚"
    },
    // Changed to action
    {
      title: "Plans",
      value: metrics.plansCount || 0,
      link: "/admin/resources/plans",
      color: "#84cc16",
      icon: "📋"
    }, {
      title: "Total Revenue",
      value: `$${(metrics.totalRevenue || 0).toLocaleString()}`,
      link: "/admin/resources/payments",
      color: "#22c55e",
      icon: "💰"
    }, {
      title: "Analytics",
      value: "View Reports",
      link: "/admin/pages/analytics",
      color: "#6366f1",
      icon: "📊"
    }];
    const handleCardClick = card => {
      if (card.action === 'courses') {
        setCurrentView('courses');
      } else if (card.link) {
        window.location.href = card.link;
      }
    };
    const getTimeAgo = dateString => {
      if (!dateString) return "";
      try {
        const now = new Date();
        const logTime = new Date(dateString);
        const diffMs = now - logTime;
        const diffSecs = Math.floor(diffMs / 1000);
        if (diffSecs < 60) return `${diffSecs}s ago`;
        const diffMins = Math.floor(diffSecs / 60);
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        return logTime.toLocaleDateString();
      } catch {
        return "";
      }
    };
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
    const refreshButtonStyle = {
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '6px',
      padding: '8px 12px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#374151',
      fontSize: '14px',
      gap: '8px'
    };
    const metricsGridStyle = {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      marginBottom: '40px'
    };
    const cardStyle = {
      backgroundColor: '#ffffff',
      padding: '24px',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    };
    const cardTitleStyle = {
      fontSize: '12px',
      fontWeight: '500',
      color: '#6b7280',
      margin: '0 0 8px 0',
      textTransform: 'uppercase',
      letterSpacing: '0.8px'
    };
    const cardValueStyle = {
      fontSize: '28px',
      fontWeight: '700',
      color: '#000000',
      margin: '0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    };
    const cardIconStyle = {
      fontSize: '24px',
      opacity: 0.8
    };
    const logsContainerStyle = {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px'
    };
    const logSectionStyle = {
      backgroundColor: '#ffffff',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    };
    const logHeaderStyle = {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1e293b',
      margin: '0',
      padding: '16px 20px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e9ecef',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    };
    const logItemStyle = {
      padding: '16px 20px',
      borderBottom: '1px solid #f1f3f4',
      transition: 'background-color 0.2s'
    };
    const logItemNameStyle = {
      fontWeight: '600',
      color: '#1e293b',
      fontSize: '14px',
      marginBottom: '4px'
    };
    const logItemActionStyle = {
      color: '#6b7280',
      fontSize: '13px',
      marginBottom: '4px'
    };
    const logItemTimeStyle = {
      fontSize: '12px',
      color: '#9ca3af'
    };
    const emptyStateStyle = {
      textAlign: 'center',
      color: '#6b7280',
      fontStyle: 'italic',
      padding: '40px 20px'
    };
    return /*#__PURE__*/React__default.default.createElement("div", {
      style: containerStyle
    }, /*#__PURE__*/React__default.default.createElement("style", null, `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .log-item:hover {
            background-color: #f9fafb !important;
          }
        `), /*#__PURE__*/React__default.default.createElement("div", {
      style: headerStyle
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h1", {
      style: {
        fontSize: "1.5rem",
        fontWeight: "bold",
        margin: 0,
        color: "#1e293b"
      }
    }, "Admin Dashboard"), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        margin: '4px 0 0 0',
        color: '#6b7280',
        fontSize: '14px'
      }
    }, "Welcome back! Here's what's happening today.")), /*#__PURE__*/React__default.default.createElement("button", {
      onClick: handleRefresh,
      style: refreshButtonStyle,
      onMouseOver: e => {
        e.target.style.backgroundColor = '#e9ecef';
        e.target.style.transform = 'translateY(-1px)';
      },
      onMouseOut: e => {
        e.target.style.backgroundColor = '#f8f9fa';
        e.target.style.transform = 'translateY(0)';
      },
      title: "Refresh Dashboard"
    }, /*#__PURE__*/React__default.default.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2"
    }, /*#__PURE__*/React__default.default.createElement("path", {
      d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
    }), /*#__PURE__*/React__default.default.createElement("path", {
      d: "M21 3v5h-5"
    }), /*#__PURE__*/React__default.default.createElement("path", {
      d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
    }), /*#__PURE__*/React__default.default.createElement("path", {
      d: "M3 21v-5h5"
    })), "Refresh")), /*#__PURE__*/React__default.default.createElement("div", {
      style: metricsGridStyle
    }, statsCards.map((card, index) => /*#__PURE__*/React__default.default.createElement("div", {
      key: index,
      onClick: () => handleCardClick(card),
      style: cardStyle,
      onMouseOver: e => {
        e.currentTarget.style.borderColor = card.color;
        e.currentTarget.style.boxShadow = `0 8px 25px ${card.color}20`;
        e.currentTarget.style.transform = 'translateY(-4px)';
      },
      onMouseOut: e => {
        e.currentTarget.style.borderColor = '#e9ecef';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: cardTitleStyle
    }, card.title), /*#__PURE__*/React__default.default.createElement("div", {
      style: cardValueStyle
    }, /*#__PURE__*/React__default.default.createElement("span", {
      style: cardIconStyle
    }, card.icon), /*#__PURE__*/React__default.default.createElement("span", null, card.value)), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: card.color,
        opacity: 0.6
      }
    })))), /*#__PURE__*/React__default.default.createElement("div", {
      style: logsContainerStyle
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: logSectionStyle
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: logHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("span", null, "\uD83D\uDD27"), "Admin Activity (", adminLogs.length, ")"), adminLogs.length === 0 ? /*#__PURE__*/React__default.default.createElement("div", {
      style: emptyStateStyle
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '32px',
        marginBottom: '8px'
      }
    }, "\uD83E\uDD2B"), "No recent admin activity") : adminLogs.map((log, i) => /*#__PURE__*/React__default.default.createElement("div", {
      key: log.id || i,
      className: "log-item",
      style: {
        ...logItemStyle,
        borderBottom: i === adminLogs.length - 1 ? 'none' : '1px solid #f3f4f6'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: logItemNameStyle
    }, log.first_name, " ", log.last_name), /*#__PURE__*/React__default.default.createElement("div", {
      style: logItemActionStyle
    }, log.action), /*#__PURE__*/React__default.default.createElement("div", {
      style: logItemTimeStyle
    }, getTimeAgo(log.created_at))))), /*#__PURE__*/React__default.default.createElement("div", {
      style: logSectionStyle
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: logHeaderStyle
    }, /*#__PURE__*/React__default.default.createElement("span", null, "\uD83D\uDC65"), "User Activity (", userLogs.length, ")"), userLogs.length === 0 ? /*#__PURE__*/React__default.default.createElement("div", {
      style: emptyStateStyle
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '32px',
        marginBottom: '8px'
      }
    }, "\uD83D\uDE34"), "No recent user activity") : userLogs.map((log, i) => /*#__PURE__*/React__default.default.createElement("div", {
      key: log.id || i,
      className: "log-item",
      style: {
        ...logItemStyle,
        borderBottom: i === userLogs.length - 1 ? 'none' : '1px solid #f3f4f6'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: logItemNameStyle
    }, log.first_name, " ", log.last_name), /*#__PURE__*/React__default.default.createElement("div", {
      style: logItemActionStyle
    }, log.action), /*#__PURE__*/React__default.default.createElement("div", {
      style: logItemTimeStyle
    }, getTimeAgo(log.created_at)))))));
  }

  // Admin/components/Analytics.jsx
  new adminjs.ApiClient();
  function Analytics() {
    const [activeTab, setActiveTab] = React.useState('overview');
    const [dateRange, setDateRange] = React.useState('30d');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [data, setData] = React.useState(null);
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/analytics?range=${dateRange}`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError('Failed to load analytics data');
        setData({
          overview: {},
          appointments: {
            overview: {},
            appointmentStats: [],
            topFreelancers: [],
            recentAppointments: []
          },
          users: {
            overview: {},
            userGrowth: [],
            userDistribution: [],
            recentUsers: []
          },
          projectStats: {
            byStatus: []
          }
        });
      } finally {
        setLoading(false);
      }
    };
    React.useEffect(() => {
      fetchAnalyticsData();
    }, [dateRange]);
    const formatCurrency = amount => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount || 0);
    };
    const formatDate = dateString => {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    };
    const formatPercentage = value => {
      return `${(value || 0).toFixed(1)}%`;
    };
    if (loading) {
      return /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }
      }, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          textAlign: 'center'
        }
      }, /*#__PURE__*/React__default.default.createElement("div", {
        style: {
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }
      }), /*#__PURE__*/React__default.default.createElement("p", {
        style: {
          color: '#6b7280'
        }
      }, "Loading analytics..."), /*#__PURE__*/React__default.default.createElement("style", null, `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `)));
    }
    return /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f8fafc',
        minHeight: '100vh'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("h1", {
      style: {
        margin: '0 0 8px 0',
        fontSize: '28px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, "Analytics Dashboard"), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        margin: '0',
        color: '#64748b',
        fontSize: '16px'
      }
    }, "Comprehensive business insights and metrics")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React__default.default.createElement("select", {
      value: dateRange,
      onChange: e => setDateRange(e.target.value),
      style: {
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: 'white',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React__default.default.createElement("option", {
      value: "7d"
    }, "7 Days"), /*#__PURE__*/React__default.default.createElement("option", {
      value: "30d"
    }, "30 Days"), /*#__PURE__*/React__default.default.createElement("option", {
      value: "90d"
    }, "90 Days"), /*#__PURE__*/React__default.default.createElement("option", {
      value: "1y"
    }, "1 Year")), /*#__PURE__*/React__default.default.createElement("button", {
      onClick: fetchAnalyticsData,
      style: {
        padding: '8px 16px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
      }
    }, "Refresh"))), error && /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '12px 16px',
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#991b1b',
        marginBottom: '24px',
        fontSize: '14px'
      }
    }, error), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        borderBottom: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        gap: '32px'
      }
    }, [{
      id: 'overview',
      label: 'Overview'
    }, {
      id: 'appointments',
      label: 'Appointments'
    }, {
      id: 'users',
      label: 'Users'
    }, {
      id: 'projects',
      label: 'Projects'
    }, {
      id: 'financial',
      label: 'Financial'
    }].map(tab => /*#__PURE__*/React__default.default.createElement("button", {
      key: tab.id,
      onClick: () => setActiveTab(tab.id),
      style: {
        padding: '12px 0',
        border: 'none',
        background: 'none',
        fontSize: '14px',
        fontWeight: '500',
        color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
        borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }
    }, tab.label))))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        minHeight: '400px'
      }
    }, activeTab === 'overview' && /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: '8px',
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }
    }, "Total Users"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, (data?.overview?.totalUsers || 0).toLocaleString()), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#10b981',
        marginTop: '4px',
        fontWeight: '500'
      }
    }, "+", data?.overview?.newUsersToday || 0, " today")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '12px',
        backgroundColor: '#dbeafe',
        borderRadius: '12px',
        fontSize: '24px'
      }
    }, "\uD83D\uDC65"))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: '8px',
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }
    }, "Total Appointments"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, (data?.appointments?.overview?.totalAppointments || 0).toLocaleString()), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#10b981',
        marginTop: '4px',
        fontWeight: '500'
      }
    }, data?.appointments?.overview?.appointmentsToday || 0, " today")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '12px',
        backgroundColor: '#dcfce7',
        borderRadius: '12px',
        fontSize: '24px'
      }
    }, "\uD83D\uDCC5"))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: '8px',
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }
    }, "Active Projects"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, (data?.overview?.activeProjects || 0).toLocaleString()), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#6b7280',
        marginTop: '4px',
        fontWeight: '500'
      }
    }, data?.overview?.completedProjects || 0, " completed")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '12px',
        backgroundColor: '#f3e8ff',
        borderRadius: '12px',
        fontSize: '24px'
      }
    }, "\uD83D\uDCBC"))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        marginBottom: '8px',
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }
    }, "Total Revenue"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, formatCurrency(data?.overview?.totalRevenue || 0)), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#6b7280',
        marginTop: '4px',
        fontWeight: '500'
      }
    }, formatCurrency(data?.overview?.monthlyRevenue || 0), " this month")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '12px',
        backgroundColor: '#fef3c7',
        borderRadius: '12px',
        fontSize: '24px'
      }
    }, "\uD83D\uDCB0")))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px 24px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f8fafc'
      }
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: {
        margin: '0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b'
      }
    }, "Recent Appointments")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        maxHeight: '400px',
        overflowY: 'auto'
      }
    }, data?.appointments?.recentAppointments?.length > 0 ? /*#__PURE__*/React__default.default.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse'
      }
    }, /*#__PURE__*/React__default.default.createElement("thead", {
      style: {
        backgroundColor: '#f8fafc',
        position: 'sticky',
        top: 0
      }
    }, /*#__PURE__*/React__default.default.createElement("tr", null, /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Type"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Status"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Date"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Freelancer"))), /*#__PURE__*/React__default.default.createElement("tbody", null, data.appointments.recentAppointments.slice(0, 10).map((appointment, index) => /*#__PURE__*/React__default.default.createElement("tr", {
      key: index,
      style: {
        borderBottom: '1px solid #f3f4f6',
        transition: 'background-color 0.2s'
      }
    }, /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px',
        fontWeight: '500'
      }
    }, appointment.appointment_type || 'Appointment'), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px'
      }
    }, /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: appointment.status === 'pending' ? '#fef3c7' : appointment.status === 'accepted' ? '#dcfce7' : appointment.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
        color: appointment.status === 'pending' ? '#92400e' : appointment.status === 'accepted' ? '#065f46' : appointment.status === 'rejected' ? '#991b1b' : '#374151'
      }
    }, (appointment.status || 'pending').charAt(0).toUpperCase() + (appointment.status || 'pending').slice(1))), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px',
        color: '#6b7280'
      }
    }, appointment.created_at ? formatDate(appointment.created_at) : '-'), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px',
        fontWeight: '500'
      }
    }, appointment.freelancer_first_name, " ", appointment.freelancer_last_name))))) : /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        textAlign: 'center',
        padding: '48px 24px',
        color: '#6b7280'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '48px',
        marginBottom: '16px'
      }
    }, "\uD83D\uDCC5"), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        margin: '0',
        fontSize: '16px',
        fontWeight: '500'
      }
    }, "No recent appointments found"))))), activeTab === 'appointments' && /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        width: '8px',
        height: '8px',
        backgroundColor: '#f59e0b',
        borderRadius: '50%',
        marginRight: '8px'
      }
    }), /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }
    }, "Pending")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, data?.appointments?.overview?.pendingAppointments || 0)), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        width: '8px',
        height: '8px',
        backgroundColor: '#10b981',
        borderRadius: '50%',
        marginRight: '8px'
      }
    }), /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }
    }, "Accepted")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, data?.appointments?.overview?.acceptedAppointments || 0)), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        width: '8px',
        height: '8px',
        backgroundColor: '#ef4444',
        borderRadius: '50%',
        marginRight: '8px'
      }
    }), /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }
    }, "Rejected")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, data?.appointments?.overview?.rejectedAppointments || 0)), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        width: '8px',
        height: '8px',
        backgroundColor: '#3b82f6',
        borderRadius: '50%',
        marginRight: '8px'
      }
    }), /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
      }
    }, "Acceptance Rate")), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, formatPercentage(data?.appointments?.overview?.acceptanceRate || 0)))), data?.appointments?.topFreelancers?.length > 0 && /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px 24px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f8fafc'
      }
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: {
        margin: '0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b'
      }
    }, "Top Performing Freelancers")), /*#__PURE__*/React__default.default.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse'
      }
    }, /*#__PURE__*/React__default.default.createElement("thead", {
      style: {
        backgroundColor: '#f8fafc'
      }
    }, /*#__PURE__*/React__default.default.createElement("tr", null, /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Freelancer"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Total"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Accepted"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Success Rate"))), /*#__PURE__*/React__default.default.createElement("tbody", null, data.appointments.topFreelancers.map((freelancer, index) => /*#__PURE__*/React__default.default.createElement("tr", {
      key: index,
      style: {
        borderBottom: '1px solid #f3f4f6'
      }
    }, /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        width: '40px',
        height: '40px',
        backgroundColor: '#3b82f6',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: '600',
        fontSize: '16px',
        marginRight: '12px'
      }
    }, freelancer.first_name?.[0], freelancer.last_name?.[0]), /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontWeight: '600',
        color: '#1e293b'
      }
    }, freelancer.first_name, " ", freelancer.last_name), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '12px',
        color: '#6b7280'
      }
    }, freelancer.email)))), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#1e293b'
      }
    }, freelancer.total_appointments), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#10b981'
      }
    }, freelancer.accepted_appointments), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#3b82f6'
      }
    }, formatPercentage(freelancer.acceptance_rate)))))))), activeTab === 'users' && /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Total Users"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, (data?.users?.overview?.totalUsers || 0).toLocaleString())), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#3b82f6',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Clients"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, (data?.users?.overview?.totalClients || 0).toLocaleString())), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#8b5cf6',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Freelancers"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, (data?.users?.overview?.totalFreelancers || 0).toLocaleString())), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#10b981',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "New This Month"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, (data?.users?.overview?.newUsersMonth || 0).toLocaleString()))), data?.users?.recentUsers?.length > 0 && /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px 24px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f8fafc'
      }
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: {
        margin: '0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b'
      }
    }, "Recent User Registrations")), /*#__PURE__*/React__default.default.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse'
      }
    }, /*#__PURE__*/React__default.default.createElement("thead", {
      style: {
        backgroundColor: '#f8fafc'
      }
    }, /*#__PURE__*/React__default.default.createElement("tr", null, /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "User"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Email"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Role"), /*#__PURE__*/React__default.default.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }
    }, "Joined"))), /*#__PURE__*/React__default.default.createElement("tbody", null, data.users.recentUsers.slice(0, 10).map((user, index) => /*#__PURE__*/React__default.default.createElement("tr", {
      key: index,
      style: {
        borderBottom: '1px solid #f3f4f6'
      }
    }, /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#1e293b'
      }
    }, user.first_name, " ", user.last_name), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px',
        color: '#6b7280'
      }
    }, user.email), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px'
      }
    }, /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: user.role_id === 2 ? '#dbeafe' : user.role_id === 3 ? '#f3e8ff' : '#f3f4f6',
        color: user.role_id === 2 ? '#1e40af' : user.role_id === 3 ? '#7c3aed' : '#374151'
      }
    }, user.role_id === 2 ? 'Client' : user.role_id === 3 ? 'Freelancer' : 'User')), /*#__PURE__*/React__default.default.createElement("td", {
      style: {
        padding: '16px 24px',
        fontSize: '14px',
        color: '#6b7280'
      }
    }, user.created_at ? formatDate(user.created_at) : '-'))))))), activeTab === 'projects' && /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Draft"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, data?.overview?.draftProjects || 0)), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#3b82f6',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Active"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, data?.overview?.activeProjects || 0)), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#10b981',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Completed"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, data?.overview?.completedProjects || 0)), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#1e293b',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Total"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, data?.overview?.totalProjects || 0))), data?.projectStats?.byStatus?.length > 0 && /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        padding: '24px'
      }
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: {
        margin: '0 0 24px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b'
      }
    }, "Project Status Distribution"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px'
      }
    }, data.projectStats.byStatus.map((status, index) => /*#__PURE__*/React__default.default.createElement("div", {
      key: index,
      style: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        width: '12px',
        height: '12px',
        backgroundColor: status.color,
        borderRadius: '3px',
        marginRight: '8px'
      }
    }), /*#__PURE__*/React__default.default.createElement("span", {
      style: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151'
      }
    }, status.status, ": ", status.count)))))), activeTab === 'financial' && /*#__PURE__*/React__default.default.createElement("div", null, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Total Revenue"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, formatCurrency(data?.overview?.totalRevenue || 0))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Transactions"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, (data?.overview?.totalTransactions || 0).toLocaleString())), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Monthly Revenue"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, formatCurrency(data?.overview?.monthlyRevenue || 0))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }
    }, /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '8px',
        fontWeight: '500'
      }
    }, "Avg Transaction"), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b'
      }
    }, formatCurrency(data?.overview?.avgTransaction || 0)))), /*#__PURE__*/React__default.default.createElement("div", {
      style: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        padding: '24px'
      }
    }, /*#__PURE__*/React__default.default.createElement("h3", {
      style: {
        margin: '0 0 16px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b'
      }
    }, "Financial Overview"), /*#__PURE__*/React__default.default.createElement("p", {
      style: {
        margin: '0',
        color: '#6b7280',
        fontSize: '14px'
      }
    }, "Financial analytics provide insights into revenue trends, payment patterns, and transaction data.", data?.overview?.totalRevenue > 0 ? ` Current total revenue stands at ${formatCurrency(data.overview.totalRevenue)} across ${(data.overview.totalTransactions || 0).toLocaleString()} transactions.` : ' No payment data available yet.')))));
  }

  AdminJS.UserComponents = {};
  AdminJS.UserComponents.Dashboard = Dashboard;
  AdminJS.UserComponents.Analytics = Analytics;
  AdminJS.UserComponents.RelatedMaterials = CoursesManagement;
  AdminJS.UserComponents.RelatedEnrollments = CoursesManagement;

})(React, AdminJS);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9mcm9udGVuZC9hZG1pbi1jb21wb25lbnRzL2NvdXJzZS1jb21wb25lbnRzLmpzeCIsIi4uLy4uL2Zyb250ZW5kL2FkbWluLWNvbXBvbmVudHMvZGFzaGJvYXJkLmpzeCIsIi4uLy4uL2Zyb250ZW5kL2FkbWluLWNvbXBvbmVudHMvYW5hbHl0aWNzLmpzeCIsImVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEFkbWluL2NvbXBvbmVudHMvQ291cnNlc01hbmFnZW1lbnQuanN4XHJcbmltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVN0YXRlLCB1c2VDYWxsYmFjaywgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XHJcbmltcG9ydCB7IEFwaUNsaWVudCB9IGZyb20gXCJhZG1pbmpzXCI7XHJcblxyXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KCk7XHJcblxyXG5jb25zdCBDb3Vyc2VzTWFuYWdlbWVudCA9ICh7IG9uQmFjayB9KSA9PiB7XHJcbiAgY29uc3QgW2NvdXJzZXMsIHNldENvdXJzZXNdID0gdXNlU3RhdGUoW10pO1xyXG4gIGNvbnN0IFttYXRlcmlhbHMsIHNldE1hdGVyaWFsc10gPSB1c2VTdGF0ZShbXSk7XHJcbiAgY29uc3QgW2Vucm9sbG1lbnRzLCBzZXRFbnJvbGxtZW50c10gPSB1c2VTdGF0ZShbXSk7XHJcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XHJcbiAgY29uc3QgW2FjdGl2ZVRhYiwgc2V0QWN0aXZlVGFiXSA9IHVzZVN0YXRlKCdjb3Vyc2VzJyk7XHJcbiAgY29uc3QgW3NlYXJjaFRlcm0sIHNldFNlYXJjaFRlcm1dID0gdXNlU3RhdGUoJycpO1xyXG4gIGNvbnN0IFtmaWx0ZXJTdGF0dXMsIHNldEZpbHRlclN0YXR1c10gPSB1c2VTdGF0ZSgnYWxsJyk7XHJcbiAgY29uc3QgbW91bnRlZFJlZiA9IHVzZVJlZih0cnVlKTtcclxuXHJcbiAgY29uc3QgZmV0Y2hBbGxEYXRhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgc2V0TG9hZGluZyh0cnVlKTtcclxuICAgICAgXHJcbiAgICAgIC8vIEZldGNoIGNvdXJzZXNcclxuICAgICAgY29uc3QgY291cnNlc1Jlc3BvbnNlID0gYXdhaXQgYXBpLnJlc291cmNlQWN0aW9uKHtcclxuICAgICAgICByZXNvdXJjZUlkOiAnY291cnNlcycsXHJcbiAgICAgICAgYWN0aW9uTmFtZTogJ2xpc3QnXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAobW91bnRlZFJlZi5jdXJyZW50KSB7XHJcbiAgICAgICAgc2V0Q291cnNlcyhjb3Vyc2VzUmVzcG9uc2UuZGF0YT8ucmVjb3JkcyB8fCBbXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEZldGNoIG1hdGVyaWFsc1xyXG4gICAgICBjb25zdCBtYXRlcmlhbHNSZXNwb25zZSA9IGF3YWl0IGFwaS5yZXNvdXJjZUFjdGlvbih7XHJcbiAgICAgICAgcmVzb3VyY2VJZDogJ2NvdXJzZV9tYXRlcmlhbHMnLFxyXG4gICAgICAgIGFjdGlvbk5hbWU6ICdsaXN0J1xyXG4gICAgICB9KTtcclxuICAgICAgaWYgKG1vdW50ZWRSZWYuY3VycmVudCkge1xyXG4gICAgICAgIHNldE1hdGVyaWFscyhtYXRlcmlhbHNSZXNwb25zZS5kYXRhPy5yZWNvcmRzIHx8IFtdKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRmV0Y2ggZW5yb2xsbWVudHNcclxuICAgICAgY29uc3QgZW5yb2xsbWVudHNSZXNwb25zZSA9IGF3YWl0IGFwaS5yZXNvdXJjZUFjdGlvbih7XHJcbiAgICAgICAgcmVzb3VyY2VJZDogJ2NvdXJzZV9lbnJvbGxtZW50cycsXHJcbiAgICAgICAgYWN0aW9uTmFtZTogJ2xpc3QnXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAobW91bnRlZFJlZi5jdXJyZW50KSB7XHJcbiAgICAgICAgc2V0RW5yb2xsbWVudHMoZW5yb2xsbWVudHNSZXNwb25zZS5kYXRhPy5yZWNvcmRzIHx8IFtdKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBmZXRjaCBkYXRhOicsIGVycm9yKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIGlmIChtb3VudGVkUmVmLmN1cnJlbnQpIHtcclxuICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sIFtdKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIG1vdW50ZWRSZWYuY3VycmVudCA9IHRydWU7XHJcbiAgICBmZXRjaEFsbERhdGEoKTtcclxuICAgIFxyXG4gICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgbW91bnRlZFJlZi5jdXJyZW50ID0gZmFsc2U7XHJcbiAgICB9O1xyXG4gIH0sIFtmZXRjaEFsbERhdGFdKTtcclxuXHJcbiAgLy8gQXV0by1yZWZyZXNoIGRhdGEgZXZlcnkgMzAgc2Vjb25kc1xyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgaWYgKG1vdW50ZWRSZWYuY3VycmVudCkge1xyXG4gICAgICAgIGZldGNoQWxsRGF0YSgpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMCk7XHJcblxyXG4gICAgcmV0dXJuICgpID0+IGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xyXG4gIH0sIFtmZXRjaEFsbERhdGFdKTtcclxuXHJcbiAgaWYgKGxvYWRpbmcpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgZGlzcGxheTogJ2ZsZXgnLCBcclxuICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIFxyXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLCBcclxuICAgICAgICBoZWlnaHQ6ICc0MDBweCcsXHJcbiAgICAgICAgZm9udFNpemU6ICcxNnB4JyxcclxuICAgICAgICBjb2xvcjogJyM2YjcyODAnXHJcbiAgICAgIH19PlxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgdGV4dEFsaWduOiAnY2VudGVyJyB9fT5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgIHdpZHRoOiAnNDBweCcsIFxyXG4gICAgICAgICAgICBoZWlnaHQ6ICc0MHB4JywgXHJcbiAgICAgICAgICAgIGJvcmRlcjogJzRweCBzb2xpZCAjZTVlN2ViJyxcclxuICAgICAgICAgICAgYm9yZGVyVG9wOiAnNHB4IHNvbGlkICMzYjgyZjYnLFxyXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnLFxyXG4gICAgICAgICAgICBhbmltYXRpb246ICdzcGluIDFzIGxpbmVhciBpbmZpbml0ZScsXHJcbiAgICAgICAgICAgIG1hcmdpbjogJzAgYXV0byAxNnB4J1xyXG4gICAgICAgICAgfX0+PC9kaXY+XHJcbiAgICAgICAgICBMb2FkaW5nIGNvdXJzZXMgZGF0YS4uLlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyBGaWx0ZXIgY291cnNlcyBiYXNlZCBvbiBzZWFyY2ggYW5kIHN0YXR1c1xyXG4gIGNvbnN0IGZpbHRlcmVkQ291cnNlcyA9IGNvdXJzZXMuZmlsdGVyKGNvdXJzZSA9PiB7XHJcbiAgICBjb25zdCBtYXRjaGVzU2VhcmNoID0gIXNlYXJjaFRlcm0gfHwgXHJcbiAgICAgIChjb3Vyc2UucGFyYW1zPy50aXRsZSB8fCAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXJtLnRvTG93ZXJDYXNlKCkpIHx8XHJcbiAgICAgIChjb3Vyc2UucGFyYW1zPy5kZXNjcmlwdGlvbiB8fCAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXJtLnRvTG93ZXJDYXNlKCkpO1xyXG4gICAgXHJcbiAgICBjb25zdCBtYXRjaGVzU3RhdHVzID0gZmlsdGVyU3RhdHVzID09PSAnYWxsJyB8fCBcclxuICAgICAgKGNvdXJzZS5wYXJhbXM/LnN0YXR1cyB8fCAnZHJhZnQnKSA9PT0gZmlsdGVyU3RhdHVzO1xyXG4gICAgXHJcbiAgICByZXR1cm4gbWF0Y2hlc1NlYXJjaCAmJiBtYXRjaGVzU3RhdHVzO1xyXG4gIH0pO1xyXG5cclxuICAvLyBGaWx0ZXIgbWF0ZXJpYWxzIGJhc2VkIG9uIHNlYXJjaFxyXG4gIGNvbnN0IGZpbHRlcmVkTWF0ZXJpYWxzID0gbWF0ZXJpYWxzLmZpbHRlcihtYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBtYXRjaGVzU2VhcmNoID0gIXNlYXJjaFRlcm0gfHwgXHJcbiAgICAgIChtYXRlcmlhbC5wYXJhbXM/LnRpdGxlIHx8ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRlcm0udG9Mb3dlckNhc2UoKSkgfHxcclxuICAgICAgKG1hdGVyaWFsLnBhcmFtcz8uY291cnNlX3RpdGxlIHx8ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRlcm0udG9Mb3dlckNhc2UoKSk7XHJcbiAgICBcclxuICAgIHJldHVybiBtYXRjaGVzU2VhcmNoO1xyXG4gIH0pO1xyXG5cclxuICAvLyBGaWx0ZXIgZW5yb2xsbWVudHMgYmFzZWQgb24gc2VhcmNoXHJcbiAgY29uc3QgZmlsdGVyZWRFbnJvbGxtZW50cyA9IGVucm9sbG1lbnRzLmZpbHRlcihlbnJvbGxtZW50ID0+IHtcclxuICAgIGNvbnN0IG1hdGNoZXNTZWFyY2ggPSAhc2VhcmNoVGVybSB8fCBcclxuICAgICAgKGVucm9sbG1lbnQucGFyYW1zPy5mcmVlbGFuY2VyX25hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoVGVybS50b0xvd2VyQ2FzZSgpKSB8fFxyXG4gICAgICAoZW5yb2xsbWVudC5wYXJhbXM/LmZyZWVsYW5jZXJfZW1haWwgfHwgJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoVGVybS50b0xvd2VyQ2FzZSgpKSB8fFxyXG4gICAgICAoZW5yb2xsbWVudC5wYXJhbXM/LmNvdXJzZV90aXRsZSB8fCAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXJtLnRvTG93ZXJDYXNlKCkpO1xyXG4gICAgXHJcbiAgICByZXR1cm4gbWF0Y2hlc1NlYXJjaDtcclxuICB9KTtcclxuXHJcbiAgY29uc3QgaGFuZGxlUmVmcmVzaCA9ICgpID0+IHtcclxuICAgIGZldGNoQWxsRGF0YSgpO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGhhbmRsZURlbGV0ZSA9IGFzeW5jIChyZXNvdXJjZUlkLCByZWNvcmRJZCwgaXRlbU5hbWUpID0+IHtcclxuICAgIGlmIChjb25maXJtKGBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgJHtpdGVtTmFtZX0/IFRoaXMgYWN0aW9uIGNhbm5vdCBiZSB1bmRvbmUuYCkpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBhcGkucmVzb3VyY2VBY3Rpb24oe1xyXG4gICAgICAgICAgcmVzb3VyY2VJZCxcclxuICAgICAgICAgIGFjdGlvbk5hbWU6ICdkZWxldGUnLFxyXG4gICAgICAgICAgcmVjb3JkSWRcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBSZWZyZXNoIGRhdGEgYWZ0ZXIgZGVsZXRpb25cclxuICAgICAgICBmZXRjaEFsbERhdGEoKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gZGVsZXRlICR7aXRlbU5hbWV9OmAsIGVycm9yKTtcclxuICAgICAgICBhbGVydChgRmFpbGVkIHRvIGRlbGV0ZSAke2l0ZW1OYW1lfS4gUGxlYXNlIHRyeSBhZ2Fpbi5gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vIFN0eWxlc1xyXG4gIGNvbnN0IGNvbnRhaW5lclN0eWxlID0ge1xyXG4gICAgYmFja2dyb3VuZENvbG9yOiAnI2ZmZmZmZicsXHJcbiAgICBtaW5IZWlnaHQ6ICcxMDB2aCcsXHJcbiAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICBmb250RmFtaWx5OiAnLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBcIlNlZ29lIFVJXCIsIFJvYm90bywgXCJIZWx2ZXRpY2EgTmV1ZVwiLCBBcmlhbCwgc2Fucy1zZXJpZidcclxuICB9O1xyXG5cclxuICBjb25zdCBoZWFkZXJTdHlsZSA9IHtcclxuICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsXHJcbiAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgIG1hcmdpbkJvdHRvbTogJzMwcHgnLFxyXG4gICAgcGFkZGluZ0JvdHRvbTogJzIwcHgnLFxyXG4gICAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgdGFiU3R5bGUgPSAoaXNBY3RpdmUpID0+ICh7XHJcbiAgICBwYWRkaW5nOiAnMTJweCAyNHB4JyxcclxuICAgIGJhY2tncm91bmQ6IGlzQWN0aXZlID8gJyMzYjgyZjYnIDogJyNmOGY5ZmEnLFxyXG4gICAgY29sb3I6IGlzQWN0aXZlID8gJ3doaXRlJyA6ICcjNmI3MjgwJyxcclxuICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcclxuICAgIGJvcmRlclJhZGl1czogJzZweCcsXHJcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgIGZvbnRTaXplOiAnMTRweCcsXHJcbiAgICBmb250V2VpZ2h0OiAnNTAwJyxcclxuICAgIHRyYW5zaXRpb246ICdhbGwgMC4ycycsXHJcbiAgICBtYXJnaW5SaWdodDogJzhweCdcclxuICB9KTtcclxuXHJcbiAgY29uc3Qgc2VhcmNoQmFyU3R5bGUgPSB7XHJcbiAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICBnYXA6ICcxMnB4JyxcclxuICAgIG1hcmdpbkJvdHRvbTogJzIwcHgnLFxyXG4gICAgYWxpZ25JdGVtczogJ2NlbnRlcidcclxuICB9O1xyXG5cclxuICBjb25zdCBpbnB1dFN0eWxlID0ge1xyXG4gICAgcGFkZGluZzogJzhweCAxMnB4JyxcclxuICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcclxuICAgIGJvcmRlclJhZGl1czogJzZweCcsXHJcbiAgICBmb250U2l6ZTogJzE0cHgnLFxyXG4gICAgbWluV2lkdGg6ICcyMDBweCdcclxuICB9O1xyXG5cclxuICBjb25zdCBzZWxlY3RTdHlsZSA9IHtcclxuICAgIHBhZGRpbmc6ICc4cHggMTJweCcsXHJcbiAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxyXG4gICAgZm9udFNpemU6ICcxNHB4JyxcclxuICAgIGJhY2tncm91bmQ6ICd3aGl0ZSdcclxuICB9O1xyXG5cclxuICBjb25zdCBidXR0b25TdHlsZSA9IHtcclxuICAgIGJhY2tncm91bmQ6ICcjMTBiOTgxJyxcclxuICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgcGFkZGluZzogJzhweCAxNnB4JyxcclxuICAgIGJvcmRlclJhZGl1czogJzZweCcsXHJcbiAgICB0ZXh0RGVjb3JhdGlvbjogJ25vbmUnLFxyXG4gICAgZm9udFNpemU6ICcxNHB4JyxcclxuICAgIGZvbnRXZWlnaHQ6ICc1MDAnLFxyXG4gICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgIGRpc3BsYXk6ICdpbmxpbmUtZmxleCcsXHJcbiAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgIGdhcDogJzhweCdcclxuICB9O1xyXG5cclxuICBjb25zdCByZWZyZXNoQnV0dG9uU3R5bGUgPSB7XHJcbiAgICBiYWNrZ3JvdW5kOiAnI2Y4ZjlmYScsXHJcbiAgICBjb2xvcjogJyMzNzQxNTEnLFxyXG4gICAgcGFkZGluZzogJzhweCAxMnB4JyxcclxuICAgIGJvcmRlclJhZGl1czogJzZweCcsXHJcbiAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgIGZvbnRTaXplOiAnMTRweCdcclxuICB9O1xyXG5cclxuICBjb25zdCBzZWN0aW9uSGVhZGVyU3R5bGUgPSB7XHJcbiAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLFxyXG4gICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICBtYXJnaW5Cb3R0b206ICcyMHB4J1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGNhcmRTdHlsZSA9IHtcclxuICAgIGJhY2tncm91bmQ6ICd3aGl0ZScsXHJcbiAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICBib3JkZXJSYWRpdXM6ICc4cHgnLFxyXG4gICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgbWFyZ2luQm90dG9tOiAnMTZweCcsXHJcbiAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLCAwLCAwLCAwLjEpJyxcclxuICAgIHRyYW5zaXRpb246ICdhbGwgMC4ycyBlYXNlJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGdyaWRTdHlsZSA9IHtcclxuICAgIGRpc3BsYXk6ICdncmlkJyxcclxuICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maWxsLCBtaW5tYXgoMzUwcHgsIDFmcikpJyxcclxuICAgIGdhcDogJzIwcHgnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZW1wdHlTdGF0ZVN0eWxlID0ge1xyXG4gICAgYmFja2dyb3VuZDogJyNmOGY5ZmEnLFxyXG4gICAgcGFkZGluZzogJzYwcHgnLFxyXG4gICAgYm9yZGVyUmFkaXVzOiAnOHB4JyxcclxuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICBjb2xvcjogJyM2YjcyODAnXHJcbiAgfTtcclxuXHJcbiAgLy8gQ291cnNlcyBTZWN0aW9uIENvbXBvbmVudFxyXG4gIGNvbnN0IENvdXJzZXNTZWN0aW9uID0gKCkgPT4gKFxyXG4gICAgPGRpdj5cclxuICAgICAgPGRpdiBzdHlsZT17c2VjdGlvbkhlYWRlclN0eWxlfT5cclxuICAgICAgICA8aDIgc3R5bGU9e3sgZm9udFNpemU6ICcyMHB4JywgZm9udFdlaWdodDogJzYwMCcsIG1hcmdpbjogMCwgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgIENvdXJzZXMgKHtmaWx0ZXJlZENvdXJzZXMubGVuZ3RofSlcclxuICAgICAgICA8L2gyPlxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICcxMnB4JyB9fT5cclxuICAgICAgICAgIDxidXR0b24gb25DbGljaz17aGFuZGxlUmVmcmVzaH0gc3R5bGU9e3JlZnJlc2hCdXR0b25TdHlsZX0+XHJcbiAgICAgICAgICAgIPCflIQgUmVmcmVzaFxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8YSBcclxuICAgICAgICAgICAgaHJlZj1cIi9hZG1pbi9yZXNvdXJjZXMvY291cnNlcy9hY3Rpb25zL25ld1wiXHJcbiAgICAgICAgICAgIHN0eWxlPXtidXR0b25TdHlsZX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgKyBBZGQgQ291cnNlXHJcbiAgICAgICAgICA8L2E+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdiBzdHlsZT17c2VhcmNoQmFyU3R5bGV9PlxyXG4gICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgdHlwZT1cInRleHRcIlxyXG4gICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2ggY291cnNlcy4uLlwiXHJcbiAgICAgICAgICB2YWx1ZT17c2VhcmNoVGVybX1cclxuICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0U2VhcmNoVGVybShlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICBzdHlsZT17aW5wdXRTdHlsZX1cclxuICAgICAgICAvPlxyXG4gICAgICAgIDxzZWxlY3RcclxuICAgICAgICAgIHZhbHVlPXtmaWx0ZXJTdGF0dXN9XHJcbiAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldEZpbHRlclN0YXR1cyhlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICBzdHlsZT17c2VsZWN0U3R5bGV9XHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImFsbFwiPkFsbCBTdGF0dXM8L29wdGlvbj5cclxuICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJhY3RpdmVcIj5BY3RpdmU8L29wdGlvbj5cclxuICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJkcmFmdFwiPkRyYWZ0PC9vcHRpb24+XHJcbiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiYXJjaGl2ZWRcIj5BcmNoaXZlZDwvb3B0aW9uPlxyXG4gICAgICAgIDwvc2VsZWN0PlxyXG4gICAgICAgIHsoc2VhcmNoVGVybSB8fCBmaWx0ZXJTdGF0dXMgIT09ICdhbGwnKSAmJiAoXHJcbiAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcclxuICAgICAgICAgICAgICBzZXRTZWFyY2hUZXJtKCcnKTtcclxuICAgICAgICAgICAgICBzZXRGaWx0ZXJTdGF0dXMoJ2FsbCcpO1xyXG4gICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgIC4uLnJlZnJlc2hCdXR0b25TdHlsZSxcclxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2VmNDQ0NCcsXHJcbiAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZSdcclxuICAgICAgICAgICAgfX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgQ2xlYXIgRmlsdGVyc1xyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgKX1cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICB7ZmlsdGVyZWRDb3Vyc2VzLmxlbmd0aCA9PT0gMCA/IChcclxuICAgICAgICA8ZGl2IHN0eWxlPXtlbXB0eVN0YXRlU3R5bGV9PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzQ4cHgnLCBtYXJnaW5Cb3R0b206ICcxNnB4JyB9fT7wn5OaPC9kaXY+XHJcbiAgICAgICAgICA8aDMgc3R5bGU9e3sgbWFyZ2luOiAnMCAwIDEycHggMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgIHtzZWFyY2hUZXJtIHx8IGZpbHRlclN0YXR1cyAhPT0gJ2FsbCcgPyAnTm8gY291cnNlcyBtYXRjaCB5b3VyIGZpbHRlcnMnIDogJ05vIGNvdXJzZXMgY3JlYXRlZCB5ZXQnfVxyXG4gICAgICAgICAgPC9oMz5cclxuICAgICAgICAgIDxwIHN0eWxlPXt7IG1hcmdpbjogJzAgMCAyNHB4IDAnLCBmb250U2l6ZTogJzE2cHgnIH19PlxyXG4gICAgICAgICAgICB7c2VhcmNoVGVybSB8fCBmaWx0ZXJTdGF0dXMgIT09ICdhbGwnIFxyXG4gICAgICAgICAgICAgID8gJ1RyeSBhZGp1c3RpbmcgeW91ciBzZWFyY2ggdGVybXMgb3IgZmlsdGVycydcclxuICAgICAgICAgICAgICA6ICdDcmVhdGUgeW91ciBmaXJzdCBjb3Vyc2UgdG8gZ2V0IHN0YXJ0ZWQgd2l0aCBjb3Vyc2UgbWFuYWdlbWVudCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgeyghc2VhcmNoVGVybSAmJiBmaWx0ZXJTdGF0dXMgPT09ICdhbGwnKSAmJiAoXHJcbiAgICAgICAgICAgIDxhIFxyXG4gICAgICAgICAgICAgIGhyZWY9XCIvYWRtaW4vcmVzb3VyY2VzL2NvdXJzZXMvYWN0aW9ucy9uZXdcIlxyXG4gICAgICAgICAgICAgIHN0eWxlPXt7Li4uYnV0dG9uU3R5bGUsIHRleHREZWNvcmF0aW9uOiAnbm9uZSd9fVxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgQ3JlYXRlIFlvdXIgRmlyc3QgQ291cnNlXHJcbiAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICkgOiAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17Z3JpZFN0eWxlfT5cclxuICAgICAgICAgIHtmaWx0ZXJlZENvdXJzZXMubWFwKChjb3Vyc2UpID0+IChcclxuICAgICAgICAgICAgPGRpdiBcclxuICAgICAgICAgICAgICBrZXk9e2NvdXJzZS5pZH0gXHJcbiAgICAgICAgICAgICAgc3R5bGU9e2NhcmRTdHlsZX1cclxuICAgICAgICAgICAgICBvbk1vdXNlT3Zlcj17KGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGUuY3VycmVudFRhcmdldC5zdHlsZS5ib3hTaGFkb3cgPSAnMCA0cHggMTJweCByZ2JhKDAsIDAsIDAsIDAuMTUpJztcclxuICAgICAgICAgICAgICAgIGUuY3VycmVudFRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgtMnB4KSc7XHJcbiAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICBvbk1vdXNlT3V0PXsoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJveFNoYWRvdyA9ICcwIDFweCAzcHggcmdiYSgwLCAwLCAwLCAwLjEpJztcclxuICAgICAgICAgICAgICAgIGUuY3VycmVudFRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgwKSc7XHJcbiAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnMTZweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8aDMgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMjBweCcsIFxyXG4gICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNjAwJywgXHJcbiAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzAgMCA4cHggMCcsXHJcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzFlMjkzYicsXHJcbiAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6ICcxLjMnXHJcbiAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAge2NvdXJzZS5wYXJhbXM/LnRpdGxlIHx8IGBDb3Vyc2UgIyR7Y291cnNlLmlkfWB9XHJcbiAgICAgICAgICAgICAgICA8L2gzPlxyXG4gICAgICAgICAgICAgICAgPHAgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzZiNzI4MCcsIFxyXG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE0cHgnLCBcclxuICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnMCAwIDEycHggMCcsXHJcbiAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6ICcxLjUnXHJcbiAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAge2NvdXJzZS5wYXJhbXM/LmRlc2NyaXB0aW9uID8gXHJcbiAgICAgICAgICAgICAgICAgICAgKGNvdXJzZS5wYXJhbXMuZGVzY3JpcHRpb24ubGVuZ3RoID4gMTIwID8gXHJcbiAgICAgICAgICAgICAgICAgICAgICBjb3Vyc2UucGFyYW1zLmRlc2NyaXB0aW9uLnN1YnN0cmluZygwLCAxMjApICsgJy4uLicgOiBcclxuICAgICAgICAgICAgICAgICAgICAgIGNvdXJzZS5wYXJhbXMuZGVzY3JpcHRpb25cclxuICAgICAgICAgICAgICAgICAgICApIDogXHJcbiAgICAgICAgICAgICAgICAgICAgJ05vIGRlc2NyaXB0aW9uIGF2YWlsYWJsZSdcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnOHB4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGZsZXhXcmFwOiAnd3JhcCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogY291cnNlLnBhcmFtcz8uc3RhdHVzID09PSAnYWN0aXZlJyA/ICcjZGNmY2U3JyA6IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291cnNlLnBhcmFtcz8uc3RhdHVzID09PSAnYXJjaGl2ZWQnID8gJyNmZWYzYzcnIDogJyNmM2Y0ZjYnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBjb3Vyc2UucGFyYW1zPy5zdGF0dXMgPT09ICdhY3RpdmUnID8gJyMxNjY1MzQnIDogXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdXJzZS5wYXJhbXM/LnN0YXR1cyA9PT0gJ2FyY2hpdmVkJyA/ICcjOTI0MDBlJyA6ICcjMzc0MTUxJyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNHB4IDhweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNHB4JyxcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc1MDAnXHJcbiAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIHtjb3Vyc2UucGFyYW1zPy5zdGF0dXMgfHwgJ0RyYWZ0J31cclxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAge2NvdXJzZS5wYXJhbXM/LnByaWNlICYmIChcclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNkYmVhZmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjMWU0MGFmJyxcclxuICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc0cHggOHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzRweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzUwMCdcclxuICAgICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICR7Y291cnNlLnBhcmFtcy5wcmljZX1cclxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICB7Y291cnNlLnBhcmFtcz8uZHVyYXRpb24gJiYgKFxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2VjZmRmNScsXHJcbiAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyMxNjY1MzQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzRweCA4cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNTAwJ1xyXG4gICAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAge2NvdXJzZS5wYXJhbXMuZHVyYXRpb259XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JywgXHJcbiAgICAgICAgICAgICAgICBnYXA6ICc4cHgnLCBcclxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnZmxleC1lbmQnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyVG9wOiAnMXB4IHNvbGlkICNmMWYzZjQnLFxyXG4gICAgICAgICAgICAgICAgcGFkZGluZ1RvcDogJzE2cHgnXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8YVxyXG4gICAgICAgICAgICAgICAgICBocmVmPXtgL2FkbWluL3Jlc291cmNlcy9jb3Vyc2VzL3JlY29yZHMvJHtjb3Vyc2UuaWR9L3Nob3dgfVxyXG4gICAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZjhmOWZhJyxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyMzNzQxNTEnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc4cHggMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNHB4JyxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0RGVjb3JhdGlvbjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc1MDAnXHJcbiAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIPCfkYHvuI8gVmlld1xyXG4gICAgICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICAgICAgPGFcclxuICAgICAgICAgICAgICAgICAgaHJlZj17YC9hZG1pbi9yZXNvdXJjZXMvY291cnNlcy9yZWNvcmRzLyR7Y291cnNlLmlkfS9lZGl0YH1cclxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzNiODJmNicsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzhweCAxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc0cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHREZWNvcmF0aW9uOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNTAwJ1xyXG4gICAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICDinI/vuI8gRWRpdFxyXG4gICAgICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBoYW5kbGVEZWxldGUoJ2NvdXJzZXMnLCBjb3Vyc2UuaWQsICdjb3Vyc2UnKX1cclxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2VmNDQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzhweCAxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc0cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzUwMCdcclxuICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAg8J+Xke+4jyBEZWxldGVcclxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICkpfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxuXHJcbiAgLy8gTWF0ZXJpYWxzIFNlY3Rpb24gQ29tcG9uZW50XHJcbiAgY29uc3QgTWF0ZXJpYWxzU2VjdGlvbiA9ICgpID0+IChcclxuICAgIDxkaXY+XHJcbiAgICAgIDxkaXYgc3R5bGU9e3NlY3Rpb25IZWFkZXJTdHlsZX0+XHJcbiAgICAgICAgPGgyIHN0eWxlPXt7IGZvbnRTaXplOiAnMjBweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBtYXJnaW46IDAsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICBDb3Vyc2UgTWF0ZXJpYWxzICh7ZmlsdGVyZWRNYXRlcmlhbHMubGVuZ3RofSlcclxuICAgICAgICA8L2gyPlxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICcxMnB4JyB9fT5cclxuICAgICAgICAgIDxidXR0b24gb25DbGljaz17aGFuZGxlUmVmcmVzaH0gc3R5bGU9e3JlZnJlc2hCdXR0b25TdHlsZX0+XHJcbiAgICAgICAgICAgIPCflIQgUmVmcmVzaFxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8YSBcclxuICAgICAgICAgICAgaHJlZj1cIi9hZG1pbi9yZXNvdXJjZXMvY291cnNlX21hdGVyaWFscy9hY3Rpb25zL25ld1wiXHJcbiAgICAgICAgICAgIHN0eWxlPXtidXR0b25TdHlsZX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgKyBBZGQgTWF0ZXJpYWxcclxuICAgICAgICAgIDwvYT5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICA8ZGl2IHN0eWxlPXtzZWFyY2hCYXJTdHlsZX0+XHJcbiAgICAgICAgPGlucHV0XHJcbiAgICAgICAgICB0eXBlPVwidGV4dFwiXHJcbiAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlYXJjaCBtYXRlcmlhbHMuLi5cIlxyXG4gICAgICAgICAgdmFsdWU9e3NlYXJjaFRlcm19XHJcbiAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldFNlYXJjaFRlcm0oZS50YXJnZXQudmFsdWUpfVxyXG4gICAgICAgICAgc3R5bGU9e2lucHV0U3R5bGV9XHJcbiAgICAgICAgLz5cclxuICAgICAgICB7c2VhcmNoVGVybSAmJiAoXHJcbiAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNlYXJjaFRlcm0oJycpfVxyXG4gICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgIC4uLnJlZnJlc2hCdXR0b25TdHlsZSxcclxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2VmNDQ0NCcsXHJcbiAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZSdcclxuICAgICAgICAgICAgfX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgQ2xlYXIgU2VhcmNoXHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICApfVxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIHtmaWx0ZXJlZE1hdGVyaWFscy5sZW5ndGggPT09IDAgPyAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17ZW1wdHlTdGF0ZVN0eWxlfT5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICc0OHB4JywgbWFyZ2luQm90dG9tOiAnMTZweCcgfX0+8J+ThDwvZGl2PlxyXG4gICAgICAgICAgPGgzIHN0eWxlPXt7IG1hcmdpbjogJzAgMCAxMnB4IDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICB7c2VhcmNoVGVybSA/ICdObyBtYXRlcmlhbHMgbWF0Y2ggeW91ciBzZWFyY2gnIDogJ05vIGNvdXJzZSBtYXRlcmlhbHMgdXBsb2FkZWQgeWV0J31cclxuICAgICAgICAgIDwvaDM+XHJcbiAgICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW46ICcwIDAgMjRweCAwJywgZm9udFNpemU6ICcxNnB4JyB9fT5cclxuICAgICAgICAgICAge3NlYXJjaFRlcm0gXHJcbiAgICAgICAgICAgICAgPyAnVHJ5IGRpZmZlcmVudCBzZWFyY2ggdGVybXMnXHJcbiAgICAgICAgICAgICAgOiAnVXBsb2FkIG1hdGVyaWFscyBsaWtlIFBERnMsIHZpZGVvcywgYW5kIGRvY3VtZW50cyBmb3IgeW91ciBjb3Vyc2VzJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICB7IXNlYXJjaFRlcm0gJiYgKFxyXG4gICAgICAgICAgICA8YSBcclxuICAgICAgICAgICAgICBocmVmPVwiL2FkbWluL3Jlc291cmNlcy9jb3Vyc2VfbWF0ZXJpYWxzL2FjdGlvbnMvbmV3XCJcclxuICAgICAgICAgICAgICBzdHlsZT17ey4uLmJ1dHRvblN0eWxlLCB0ZXh0RGVjb3JhdGlvbjogJ25vbmUnfX1cclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIFVwbG9hZCBGaXJzdCBNYXRlcmlhbFxyXG4gICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApIDogKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e2dyaWRTdHlsZX0+XHJcbiAgICAgICAgICB7ZmlsdGVyZWRNYXRlcmlhbHMubWFwKChtYXRlcmlhbCkgPT4gKFxyXG4gICAgICAgICAgICA8ZGl2IGtleT17bWF0ZXJpYWwuaWR9IHN0eWxlPXtjYXJkU3R5bGV9PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnMTZweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8aDMgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMThweCcsIFxyXG4gICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNjAwJywgXHJcbiAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzAgMCA4cHggMCcsXHJcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzFlMjkzYidcclxuICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICB7bWF0ZXJpYWwucGFyYW1zPy50aXRsZSB8fCBgTWF0ZXJpYWwgIyR7bWF0ZXJpYWwuaWR9YH1cclxuICAgICAgICAgICAgICAgIDwvaDM+XHJcbiAgICAgICAgICAgICAgICA8cCBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgY29sb3I6ICcjNmI3MjgwJywgXHJcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTRweCcsIFxyXG4gICAgICAgICAgICAgICAgICBtYXJnaW46ICcwIDAgOHB4IDAnXHJcbiAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgQ291cnNlOiB7bWF0ZXJpYWwucGFyYW1zPy5jb3Vyc2VfdGl0bGUgfHwgJ1Vua25vd24gQ291cnNlJ31cclxuICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAge21hdGVyaWFsLnBhcmFtcz8uZGVzY3JpcHRpb24gJiYgKFxyXG4gICAgICAgICAgICAgICAgICA8cCBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyM2YjcyODAnLCBcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE0cHgnLCBcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICcwIDAgMTJweCAwJyxcclxuICAgICAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiAnMS40J1xyXG4gICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICB7bWF0ZXJpYWwucGFyYW1zLmRlc2NyaXB0aW9ufVxyXG4gICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB7bWF0ZXJpYWwucGFyYW1zPy5maWxlX3VybCAmJiAoXHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2Y4ZjlmYScsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzZweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxhIFxyXG4gICAgICAgICAgICAgICAgICAgICAgaHJlZj17bWF0ZXJpYWwucGFyYW1zLmZpbGVfdXJsfVxyXG4gICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcclxuICAgICAgICAgICAgICAgICAgICAgIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjM2I4MmY2JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dERlY29yYXRpb246ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzUwMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhcDogJzhweCdcclxuICAgICAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAg8J+TjiB7bWF0ZXJpYWwucGFyYW1zLmZpbGVfdXJsLnNwbGl0KCcvJykucG9wKCkgfHwgJ0Rvd25sb2FkIEZpbGUnfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsIFxyXG4gICAgICAgICAgICAgICAgZ2FwOiAnOHB4JywgXHJcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtZW5kJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclRvcDogJzFweCBzb2xpZCAjZjFmM2Y0JyxcclxuICAgICAgICAgICAgICAgIHBhZGRpbmdUb3A6ICcxNnB4J1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGFcclxuICAgICAgICAgICAgICAgICAgaHJlZj17YC9hZG1pbi9yZXNvdXJjZXMvY291cnNlX21hdGVyaWFscy9yZWNvcmRzLyR7bWF0ZXJpYWwuaWR9L3Nob3dgfVxyXG4gICAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZjhmOWZhJyxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyMzNzQxNTEnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc4cHggMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNHB4JyxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0RGVjb3JhdGlvbjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc1MDAnXHJcbiAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIPCfkYHvuI8gVmlld1xyXG4gICAgICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICAgICAgPGFcclxuICAgICAgICAgICAgICAgICAgaHJlZj17YC9hZG1pbi9yZXNvdXJjZXMvY291cnNlX21hdGVyaWFscy9yZWNvcmRzLyR7bWF0ZXJpYWwuaWR9L2VkaXRgfVxyXG4gICAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjM2I4MmY2JyxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnOHB4IDEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzRweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dERlY29yYXRpb246ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc1MDAnXHJcbiAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIOKcj++4jyBFZGl0XHJcbiAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZURlbGV0ZSgnY291cnNlX21hdGVyaWFscycsIG1hdGVyaWFsLmlkLCAnbWF0ZXJpYWwnKX1cclxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2VmNDQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzhweCAxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc0cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzUwMCdcclxuICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAg8J+Xke+4jyBEZWxldGVcclxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICkpfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxuXHJcbiAgLy8gRW5yb2xsbWVudHMgU2VjdGlvbiBDb21wb25lbnRcclxuICBjb25zdCBFbnJvbGxtZW50c1NlY3Rpb24gPSAoKSA9PiAoXHJcbiAgICA8ZGl2PlxyXG4gICAgICA8ZGl2IHN0eWxlPXtzZWN0aW9uSGVhZGVyU3R5bGV9PlxyXG4gICAgICAgIDxoMiBzdHlsZT17eyBmb250U2l6ZTogJzIwcHgnLCBmb250V2VpZ2h0OiAnNjAwJywgbWFyZ2luOiAwLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgQ291cnNlIEVucm9sbG1lbnRzICh7ZmlsdGVyZWRFbnJvbGxtZW50cy5sZW5ndGh9KVxyXG4gICAgICAgIDwvaDI+XHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzEycHgnIH19PlxyXG4gICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtoYW5kbGVSZWZyZXNofSBzdHlsZT17cmVmcmVzaEJ1dHRvblN0eWxlfT5cclxuICAgICAgICAgICAg8J+UhCBSZWZyZXNoXHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgIDxhIFxyXG4gICAgICAgICAgICBocmVmPVwiL2FkbWluL3Jlc291cmNlcy9jb3Vyc2VfZW5yb2xsbWVudHMvYWN0aW9ucy9uZXdcIlxyXG4gICAgICAgICAgICBzdHlsZT17YnV0dG9uU3R5bGV9XHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgICAgICsgQWRkIEVucm9sbG1lbnRcclxuICAgICAgICAgIDwvYT5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICA8ZGl2IHN0eWxlPXtzZWFyY2hCYXJTdHlsZX0+XHJcbiAgICAgICAgPGlucHV0XHJcbiAgICAgICAgICB0eXBlPVwidGV4dFwiXHJcbiAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlYXJjaCBlbnJvbGxtZW50cy4uLlwiXHJcbiAgICAgICAgICB2YWx1ZT17c2VhcmNoVGVybX1cclxuICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0U2VhcmNoVGVybShlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICBzdHlsZT17aW5wdXRTdHlsZX1cclxuICAgICAgICAvPlxyXG4gICAgICAgIHtzZWFyY2hUZXJtICYmIChcclxuICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2VhcmNoVGVybSgnJyl9XHJcbiAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgLi4ucmVmcmVzaEJ1dHRvblN0eWxlLFxyXG4gICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZWY0NDQ0JyxcclxuICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICBib3JkZXI6ICdub25lJ1xyXG4gICAgICAgICAgICB9fVxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICBDbGVhciBTZWFyY2hcclxuICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICl9XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAge2ZpbHRlcmVkRW5yb2xsbWVudHMubGVuZ3RoID09PSAwID8gKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e2VtcHR5U3RhdGVTdHlsZX0+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnNDhweCcsIG1hcmdpbkJvdHRvbTogJzE2cHgnIH19PvCfkaU8L2Rpdj5cclxuICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46ICcwIDAgMTJweCAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAge3NlYXJjaFRlcm0gPyAnTm8gZW5yb2xsbWVudHMgbWF0Y2ggeW91ciBzZWFyY2gnIDogJ05vIGVucm9sbG1lbnRzIGZvdW5kJ31cclxuICAgICAgICAgIDwvaDM+XHJcbiAgICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW46ICcwIDAgMjRweCAwJywgZm9udFNpemU6ICcxNnB4JyB9fT5cclxuICAgICAgICAgICAge3NlYXJjaFRlcm0gXHJcbiAgICAgICAgICAgICAgPyAnVHJ5IGRpZmZlcmVudCBzZWFyY2ggdGVybXMnXHJcbiAgICAgICAgICAgICAgOiAnRW5yb2xsIHN0dWRlbnRzIGluIGNvdXJzZXMgdG8gdHJhY2sgdGhlaXIgcHJvZ3Jlc3MnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIDwvcD5cclxuICAgICAgICAgIHshc2VhcmNoVGVybSAmJiAoXHJcbiAgICAgICAgICAgIDxhIFxyXG4gICAgICAgICAgICAgIGhyZWY9XCIvYWRtaW4vcmVzb3VyY2VzL2NvdXJzZV9lbnJvbGxtZW50cy9hY3Rpb25zL25ld1wiXHJcbiAgICAgICAgICAgICAgc3R5bGU9e3suLi5idXR0b25TdHlsZSwgdGV4dERlY29yYXRpb246ICdub25lJ319XHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICBDcmVhdGUgRmlyc3QgRW5yb2xsbWVudFxyXG4gICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApIDogKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e2dyaWRTdHlsZX0+XHJcbiAgICAgICAgICB7ZmlsdGVyZWRFbnJvbGxtZW50cy5tYXAoKGVucm9sbG1lbnQpID0+IChcclxuICAgICAgICAgICAgPGRpdiBrZXk9e2Vucm9sbG1lbnQuaWR9IHN0eWxlPXtjYXJkU3R5bGV9PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnMTZweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8aDMgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMThweCcsIFxyXG4gICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNjAwJywgXHJcbiAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzAgMCA4cHggMCcsXHJcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzFlMjkzYidcclxuICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICB7ZW5yb2xsbWVudC5wYXJhbXM/LmZyZWVsYW5jZXJfbmFtZSB8fCBgVXNlciAjJHtlbnJvbGxtZW50LnBhcmFtcz8uZnJlZWxhbmNlcl9pZH1gfVxyXG4gICAgICAgICAgICAgICAgPC9oMz5cclxuICAgICAgICAgICAgICAgIDxwIHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICBjb2xvcjogJyM2YjcyODAnLCBcclxuICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4JywgXHJcbiAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzAgMCA0cHggMCdcclxuICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICDwn5OnIHtlbnJvbGxtZW50LnBhcmFtcz8uZnJlZWxhbmNlcl9lbWFpbCB8fCAnTm8gZW1haWwgcHJvdmlkZWQnfVxyXG4gICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgPHAgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzZiNzI4MCcsIFxyXG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE0cHgnLCBcclxuICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnMCAwIDhweCAwJ1xyXG4gICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgIPCfk5oge2Vucm9sbG1lbnQucGFyYW1zPy5jb3Vyc2VfdGl0bGUgfHwgJ1Vua25vd24gQ291cnNlJ31cclxuICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICAgIDxwIHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICBjb2xvcjogJyM2YjcyODAnLCBcclxuICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxMnB4JywgXHJcbiAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzAgMCAxNnB4IDAnXHJcbiAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAg8J+ThSBFbnJvbGxlZDoge2Vucm9sbG1lbnQucGFyYW1zPy5lbnJvbGxlZF9hdCA/IFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKGVucm9sbG1lbnQucGFyYW1zLmVucm9sbGVkX2F0KS50b0xvY2FsZURhdGVTdHJpbmcoKSA6IFxyXG4gICAgICAgICAgICAgICAgICAgICdVbmtub3duIGRhdGUnXHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgey8qIFByb2dyZXNzIFNlY3Rpb24gKi99XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2Y4ZjlmYScsXHJcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcclxuICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxMnB4JywgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogJzUwMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICBQcm9ncmVzc1xyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzcwMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyMxZTQwYWYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNkYmVhZmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzJweCA4cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNHB4J1xyXG4gICAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAge2Vucm9sbG1lbnQucGFyYW1zPy5wcm9ncmVzcyB8fCAwfSVcclxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsIFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZTVlN2ViJywgXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNHB4JywgXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnOHB4JyxcclxuICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbidcclxuICAgICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBcclxuICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBlbnJvbGxtZW50LnBhcmFtcz8ucHJvZ3Jlc3MgPj0gMTAwID8gJyMxMGI5ODEnIDogJyMzYjgyZjYnLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnOHB4JywgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzRweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBgJHtNYXRoLm1pbihlbnJvbGxtZW50LnBhcmFtcz8ucHJvZ3Jlc3MgfHwgMCwgMTAwKX0lYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ3dpZHRoIDAuM3MgZWFzZSdcclxuICAgICAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLCBcclxuICAgICAgICAgICAgICAgIGdhcDogJzhweCcsIFxyXG4gICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdmbGV4LWVuZCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJUb3A6ICcxcHggc29saWQgI2YxZjNmNCcsXHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nVG9wOiAnMTZweCdcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxhXHJcbiAgICAgICAgICAgICAgICAgIGhyZWY9e2AvYWRtaW4vcmVzb3VyY2VzL2NvdXJzZV9lbnJvbGxtZW50cy9yZWNvcmRzLyR7ZW5yb2xsbWVudC5pZH0vc2hvd2B9XHJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNmOGY5ZmEnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzM3NDE1MScsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzhweCAxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc0cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHREZWNvcmF0aW9uOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzUwMCdcclxuICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAg8J+Rge+4jyBWaWV3XHJcbiAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICA8YVxyXG4gICAgICAgICAgICAgICAgICBocmVmPXtgL2FkbWluL3Jlc291cmNlcy9jb3Vyc2VfZW5yb2xsbWVudHMvcmVjb3Jkcy8ke2Vucm9sbG1lbnQuaWR9L2VkaXRgfVxyXG4gICAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjM2I4MmY2JyxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnOHB4IDEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzRweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dERlY29yYXRpb246ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc1MDAnXHJcbiAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIOKcj++4jyBFZGl0XHJcbiAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZURlbGV0ZSgnY291cnNlX2Vucm9sbG1lbnRzJywgZW5yb2xsbWVudC5pZCwgJ2Vucm9sbG1lbnQnKX1cclxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2VmNDQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzhweCAxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc0cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzUwMCdcclxuICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAg8J+Xke+4jyBEZWxldGVcclxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICkpfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXYgc3R5bGU9e2NvbnRhaW5lclN0eWxlfT5cclxuICAgICAgPHN0eWxlPlxyXG4gICAgICAgIHtgXHJcbiAgICAgICAgICBAa2V5ZnJhbWVzIHNwaW4ge1xyXG4gICAgICAgICAgICAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9XHJcbiAgICAgICAgICAgIDEwMCUgeyB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOyB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgYH1cclxuICAgICAgPC9zdHlsZT5cclxuICAgICAgXHJcbiAgICAgIHsvKiBIZWFkZXIgKi99XHJcbiAgICAgIDxkaXYgc3R5bGU9e2hlYWRlclN0eWxlfT5cclxuICAgICAgICA8aDEgc3R5bGU9e3sgZm9udFNpemU6ICcxLjVyZW0nLCBmb250V2VpZ2h0OiAnYm9sZCcsIG1hcmdpbjogMCwgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgIPCfk5ogQ291cnNlcyBNYW5hZ2VtZW50XHJcbiAgICAgICAgPC9oMT5cclxuICAgICAgICA8YnV0dG9uIFxyXG4gICAgICAgICAgb25DbGljaz17b25CYWNrfVxyXG4gICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzZiNzI4MCcsXHJcbiAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcclxuICAgICAgICAgICAgcGFkZGluZzogJzhweCAxNnB4JyxcclxuICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgIGZvbnRTaXplOiAnMTRweCcsXHJcbiAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc1MDAnLFxyXG4gICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICBnYXA6ICc4cHgnXHJcbiAgICAgICAgICB9fVxyXG4gICAgICAgID5cclxuICAgICAgICAgIOKGkCBCYWNrIHRvIERhc2hib2FyZFxyXG4gICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIHsvKiBUYWJzIE5hdmlnYXRpb24gKi99XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnMzBweCcgfX0+XHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhXcmFwOiAnd3JhcCcsIGdhcDogJzhweCcgfX0+XHJcbiAgICAgICAgICA8YnV0dG9uIFxyXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2V0QWN0aXZlVGFiKCdjb3Vyc2VzJyk7XHJcbiAgICAgICAgICAgICAgc2V0U2VhcmNoVGVybSgnJyk7XHJcbiAgICAgICAgICAgICAgc2V0RmlsdGVyU3RhdHVzKCdhbGwnKTtcclxuICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgc3R5bGU9e3RhYlN0eWxlKGFjdGl2ZVRhYiA9PT0gJ2NvdXJzZXMnKX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAg8J+TmiBDb3Vyc2VzICh7Y291cnNlcy5sZW5ndGh9KVxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8YnV0dG9uIFxyXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2V0QWN0aXZlVGFiKCdtYXRlcmlhbHMnKTtcclxuICAgICAgICAgICAgICBzZXRTZWFyY2hUZXJtKCcnKTtcclxuICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgc3R5bGU9e3RhYlN0eWxlKGFjdGl2ZVRhYiA9PT0gJ21hdGVyaWFscycpfVxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICDwn5OEIE1hdGVyaWFscyAoe21hdGVyaWFscy5sZW5ndGh9KVxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8YnV0dG9uIFxyXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2V0QWN0aXZlVGFiKCdlbnJvbGxtZW50cycpO1xyXG4gICAgICAgICAgICAgIHNldFNlYXJjaFRlcm0oJycpO1xyXG4gICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICBzdHlsZT17dGFiU3R5bGUoYWN0aXZlVGFiID09PSAnZW5yb2xsbWVudHMnKX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAg8J+RpSBFbnJvbGxtZW50cyAoe2Vucm9sbG1lbnRzLmxlbmd0aH0pXHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICB7LyogQ29udGVudCBiYXNlZCBvbiBhY3RpdmUgdGFiICovfVxyXG4gICAgICB7YWN0aXZlVGFiID09PSAnY291cnNlcycgJiYgPENvdXJzZXNTZWN0aW9uIC8+fVxyXG4gICAgICB7YWN0aXZlVGFiID09PSAnbWF0ZXJpYWxzJyAmJiA8TWF0ZXJpYWxzU2VjdGlvbiAvPn1cclxuICAgICAge2FjdGl2ZVRhYiA9PT0gJ2Vucm9sbG1lbnRzJyAmJiA8RW5yb2xsbWVudHNTZWN0aW9uIC8+fVxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvdXJzZXNNYW5hZ2VtZW50OyIsIi8vIEFkbWluL2NvbXBvbmVudHMvRGFzaGJvYXJkLmpzeFxyXG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xyXG5pbXBvcnQgeyBBcGlDbGllbnQsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSBcImFkbWluanNcIjtcclxuaW1wb3J0IENvdXJzZXNNYW5hZ2VtZW50IGZyb20gXCIuLi9hZG1pbi1jb21wb25lbnRzL2NvdXJzZS1jb21wb25lbnRzLmpzeFwiO1xyXG5cclxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRGFzaGJvYXJkKCkge1xyXG4gIGNvbnN0IHsgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcclxuICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSB1c2VTdGF0ZShudWxsKTtcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcclxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xyXG4gIGNvbnN0IFthZG1pbkxvZ3MsIHNldEFkbWluTG9nc10gPSB1c2VTdGF0ZShbXSk7XHJcbiAgY29uc3QgW3VzZXJMb2dzLCBzZXRVc2VyTG9nc10gPSB1c2VTdGF0ZShbXSk7XHJcbiAgY29uc3QgW2N1cnJlbnRWaWV3LCBzZXRDdXJyZW50Vmlld10gPSB1c2VTdGF0ZSgnZGFzaGJvYXJkJyk7IFxyXG4gIGNvbnN0IGZldGNoaW5nUmVmID0gdXNlUmVmKGZhbHNlKTtcclxuICBjb25zdCBtb3VudGVkUmVmID0gdXNlUmVmKHRydWUpO1xyXG5cclxuICBjb25zdCBmZXRjaERhc2hib2FyZERhdGEgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XHJcbiAgICBpZiAoZmV0Y2hpbmdSZWYuY3VycmVudCkgcmV0dXJuO1xyXG5cclxuICAgIGZldGNoaW5nUmVmLmN1cnJlbnQgPSB0cnVlO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpLmdldERhc2hib2FyZCgpO1xyXG4gICAgICBpZiAoIW1vdW50ZWRSZWYuY3VycmVudCkgcmV0dXJuO1xyXG5cclxuICAgICAgaWYgKHJlc3BvbnNlPy5kYXRhKSB7XHJcbiAgICAgICAgc2V0RGF0YShyZXNwb25zZS5kYXRhKTtcclxuXHJcbiAgICAgICAgY29uc3QgYWxsTG9ncyA9IHJlc3BvbnNlLmRhdGEucmVjZW50TG9ncyB8fCBbXTtcclxuICAgICAgICBjb25zdCBhZG1pbnMgPSBhbGxMb2dzLmZpbHRlcihcclxuICAgICAgICAgIChsb2cpID0+IGxvZy5yb2xlX2lkID09PSAxIHx8IGxvZy5maXJzdF9uYW1lID09PSBcIlN5c3RlbVwiXHJcbiAgICAgICAgKS5zbGljZSgwLCA1KTtcclxuICAgICAgICBjb25zdCB1c2VycyA9IGFsbExvZ3MuZmlsdGVyKFxyXG4gICAgICAgICAgKGxvZykgPT4gbG9nLnJvbGVfaWQgIT09IDEgJiYgbG9nLmZpcnN0X25hbWUgIT09IFwiU3lzdGVtXCJcclxuICAgICAgICApLnNsaWNlKDAsIDUpO1xyXG5cclxuICAgICAgICBzZXRBZG1pbkxvZ3MoYWRtaW5zKTtcclxuICAgICAgICBzZXRVc2VyTG9ncyh1c2Vycyk7XHJcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gZGF0YSByZWNlaXZlZCBmcm9tIEFQSVwiKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGlmICghbW91bnRlZFJlZi5jdXJyZW50KSByZXR1cm47XHJcbiAgICAgIHNldEVycm9yKGVycj8ubWVzc2FnZSB8fCBcIkZhaWxlZCB0byBsb2FkIGRhc2hib2FyZCBkYXRhXCIpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgaWYgKG1vdW50ZWRSZWYuY3VycmVudCkgc2V0TG9hZGluZyhmYWxzZSk7XHJcbiAgICAgIGZldGNoaW5nUmVmLmN1cnJlbnQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9LCBbXSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBtb3VudGVkUmVmLmN1cnJlbnQgPSB0cnVlO1xyXG4gICAgZmV0Y2hEYXNoYm9hcmREYXRhKCk7XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBtb3VudGVkUmVmLmN1cnJlbnQgPSBmYWxzZTtcclxuICAgIH07XHJcbiAgfSwgW2ZldGNoRGFzaGJvYXJkRGF0YV0pO1xyXG5cclxuICAvLyBSZWFsLXRpbWUgZGF0YSB1cGRhdGVzIGV2ZXJ5IDEwIHNlY29uZHNcclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKGN1cnJlbnRWaWV3ICE9PSAnZGFzaGJvYXJkJykgcmV0dXJuOyAvLyBPbmx5IHJlZnJlc2ggd2hlbiBvbiBkYXNoYm9hcmQgdmlld1xyXG4gICAgXHJcbiAgICBjb25zdCByZWZyZXNoSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgIGlmICghZmV0Y2hpbmdSZWYuY3VycmVudCAmJiBtb3VudGVkUmVmLmN1cnJlbnQpIHtcclxuICAgICAgICBmZXRjaERhc2hib2FyZERhdGEoKTtcclxuICAgICAgfVxyXG4gICAgfSwgMTAwMDApO1xyXG4gICAgcmV0dXJuICgpID0+IGNsZWFySW50ZXJ2YWwocmVmcmVzaEludGVydmFsKTtcclxuICB9LCBbZmV0Y2hEYXNoYm9hcmREYXRhLCBjdXJyZW50Vmlld10pO1xyXG5cclxuICAvLyBSZWFsLXRpbWUgbG9nIHVwZGF0ZXMgZXZlcnkgNSBzZWNvbmRzXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmIChjdXJyZW50VmlldyAhPT0gJ2Rhc2hib2FyZCcpIHJldHVybjsgLy8gT25seSByZWZyZXNoIHdoZW4gb24gZGFzaGJvYXJkIHZpZXdcclxuICAgIFxyXG4gICAgY29uc3QgbG9nSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XHJcbiAgICAgIGlmICghbW91bnRlZFJlZi5jdXJyZW50IHx8IGZldGNoaW5nUmVmLmN1cnJlbnQpIHJldHVybjtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFwiL2FwaS9hZG1pbi9kYXNoYm9hcmQvbG9nc1wiKTtcclxuICAgICAgICBpZiAocmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgIGNvbnN0IG5ld0xvZ3MgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgICBpZiAobW91bnRlZFJlZi5jdXJyZW50ICYmIG5ld0xvZ3M/LnJlY2VudExvZ3MpIHtcclxuICAgICAgICAgICAgY29uc3QgYWxsTG9ncyA9IG5ld0xvZ3MucmVjZW50TG9ncztcclxuICAgICAgICAgICAgY29uc3QgYWRtaW5zID0gYWxsTG9ncy5maWx0ZXIoXHJcbiAgICAgICAgICAgICAgKGxvZykgPT4gbG9nLnJvbGVfaWQgPT09IDEgfHwgbG9nLmZpcnN0X25hbWUgPT09IFwiU3lzdGVtXCJcclxuICAgICAgICAgICAgKS5zbGljZSgwLCA1KTtcclxuICAgICAgICAgICAgY29uc3QgdXNlcnMgPSBhbGxMb2dzLmZpbHRlcihcclxuICAgICAgICAgICAgICAobG9nKSA9PiBsb2cucm9sZV9pZCAhPT0gMSAmJiBsb2cuZmlyc3RfbmFtZSAhPT0gXCJTeXN0ZW1cIlxyXG4gICAgICAgICAgICApLnNsaWNlKDAsIDUpO1xyXG4gICAgICAgICAgICBzZXRBZG1pbkxvZ3MoYWRtaW5zKTtcclxuICAgICAgICAgICAgc2V0VXNlckxvZ3ModXNlcnMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7fVxyXG4gICAgfSwgNTAwMCk7XHJcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJJbnRlcnZhbChsb2dJbnRlcnZhbCk7XHJcbiAgfSwgW2N1cnJlbnRWaWV3XSk7XHJcblxyXG4gIGNvbnN0IGhhbmRsZVJlZnJlc2ggPSB1c2VDYWxsYmFjaygoKSA9PiB7XHJcbiAgICBmZXRjaERhc2hib2FyZERhdGEoKTtcclxuICB9LCBbZmV0Y2hEYXNoYm9hcmREYXRhXSk7XHJcblxyXG4gIC8vIFNob3cgY291cnNlcyBtYW5hZ2VtZW50IGlmIGN1cnJlbnRWaWV3IGlzICdjb3Vyc2VzJ1xyXG4gIGlmIChjdXJyZW50VmlldyA9PT0gJ2NvdXJzZXMnKSB7XHJcbiAgICByZXR1cm4gPENvdXJzZXNNYW5hZ2VtZW50IG9uQmFjaz17KCkgPT4gc2V0Q3VycmVudFZpZXcoJ2Rhc2hib2FyZCcpfSAvPjtcclxuICB9XHJcblxyXG4gIC8vIFNob3cgZXJyb3Igc3RhdGVcclxuICBpZiAoZXJyb3IgJiYgIWRhdGEpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXHJcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxyXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgIGhlaWdodDogJzQwMHB4JyxcclxuICAgICAgICBmb250U2l6ZTogJzE2cHgnLFxyXG4gICAgICAgIGNvbG9yOiAnI2VmNDQ0NCcsXHJcbiAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJ1xyXG4gICAgICB9fT5cclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnNDhweCcsIG1hcmdpbkJvdHRvbTogJzE2cHgnIH19PuKaoO+4jzwvZGl2PlxyXG4gICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46ICcwIDAgOHB4IDAnLCBjb2xvcjogJyNlZjQ0NDQnIH19PkZhaWxlZCB0byBsb2FkIGRhc2hib2FyZDwvaDM+XHJcbiAgICAgICAgPHAgc3R5bGU9e3sgbWFyZ2luOiAnMCAwIDE2cHggMCcsIGNvbG9yOiAnIzZiNzI4MCcgfX0+e2Vycm9yfTwvcD5cclxuICAgICAgICA8YnV0dG9uIFxyXG4gICAgICAgICAgb25DbGljaz17aGFuZGxlUmVmcmVzaH1cclxuICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjM2I4MmY2JyxcclxuICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxyXG4gICAgICAgICAgICBwYWRkaW5nOiAnOHB4IDE2cHgnLFxyXG4gICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4J1xyXG4gICAgICAgICAgfX1cclxuICAgICAgICA+XHJcbiAgICAgICAgICBSZXRyeVxyXG4gICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBpZiAobG9hZGluZyAmJiAhZGF0YSkge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcclxuICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXHJcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgaGVpZ2h0OiAnNDAwcHgnLFxyXG4gICAgICAgIGZvbnRTaXplOiAnMTZweCcsXHJcbiAgICAgICAgY29sb3I6ICcjNmI3MjgwJ1xyXG4gICAgICB9fT5cclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgd2lkdGg6ICc0MHB4JywgXHJcbiAgICAgICAgICBoZWlnaHQ6ICc0MHB4JywgXHJcbiAgICAgICAgICBib3JkZXI6ICc0cHggc29saWQgI2U1ZTdlYicsXHJcbiAgICAgICAgICBib3JkZXJUb3A6ICc0cHggc29saWQgIzNiODJmNicsXHJcbiAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnLFxyXG4gICAgICAgICAgYW5pbWF0aW9uOiAnc3BpbiAxcyBsaW5lYXIgaW5maW5pdGUnLFxyXG4gICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTZweCdcclxuICAgICAgICB9fT48L2Rpdj5cclxuICAgICAgICBMb2FkaW5nIERhc2hib2FyZC4uLlxyXG4gICAgICA8L2Rpdj5cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBtZXRyaWNzID0gZGF0YT8ubWV0cmljcyB8fCB7fTtcclxuXHJcbiAgY29uc3Qgc3RhdHNDYXJkcyA9IFtcclxuICAgIHsgdGl0bGU6IFwiVG90YWwgQWRtaW5zXCIsIHZhbHVlOiBtZXRyaWNzLmFkbWluc0NvdW50IHx8IDAsIGxpbms6IFwiL2FkbWluL3Jlc291cmNlcy9hZG1pbnNcIiwgY29sb3I6IFwiIzNiODJmNlwiLCBpY29uOiBcIvCfkaVcIiB9LFxyXG4gICAgeyB0aXRsZTogXCJDbGllbnRzXCIsIHZhbHVlOiBtZXRyaWNzLmNsaWVudHNDb3VudCB8fCAwLCBsaW5rOiBcIi9hZG1pbi9yZXNvdXJjZXMvY2xpZW50c1wiLCBjb2xvcjogXCIjMTBiOTgxXCIsIGljb246IFwi8J+PolwiIH0sXHJcbiAgICB7IHRpdGxlOiBcIkZyZWVsYW5jZXJzXCIsIHZhbHVlOiBtZXRyaWNzLmZyZWVsYW5jZXJzQ291bnQgfHwgMCwgbGluazogXCIvYWRtaW4vcmVzb3VyY2VzL2ZyZWVsYW5jZXJzXCIsIGNvbG9yOiBcIiNmNTllMGJcIiwgaWNvbjogXCLwn5K8XCIgfSxcclxuICAgIHsgdGl0bGU6IFwiQWN0aXZlIFByb2plY3RzXCIsIHZhbHVlOiBtZXRyaWNzLnByb2plY3RzQ291bnQgfHwgMCwgbGluazogXCIvYWRtaW4vcmVzb3VyY2VzL3Byb2plY3RzXCIsIGNvbG9yOiBcIiNlZjQ0NDRcIiwgaWNvbjogXCLwn5qAXCIgfSxcclxuICAgIHsgdGl0bGU6IFwiUGVuZGluZyBBcHBvaW50bWVudHNcIiwgdmFsdWU6IG1ldHJpY3MucGVuZGluZ0FwcG9pbnRtZW50cyB8fCAwLCBsaW5rOiBcIi9hZG1pbi9yZXNvdXJjZXMvYXBwb2ludG1lbnRzXCIsIGNvbG9yOiBcIiM4YjVjZjZcIiwgaWNvbjogXCLwn5OFXCIgfSxcclxuICAgIHsgdGl0bGU6IFwiQ291cnNlc1wiLCB2YWx1ZTogbWV0cmljcy5jb3Vyc2VzQ291bnQgfHwgMCwgYWN0aW9uOiAnY291cnNlcycsIGNvbG9yOiBcIiMwNmI2ZDRcIiwgaWNvbjogXCLwn5OaXCIgfSwgLy8gQ2hhbmdlZCB0byBhY3Rpb25cclxuICAgIHsgdGl0bGU6IFwiUGxhbnNcIiwgdmFsdWU6IG1ldHJpY3MucGxhbnNDb3VudCB8fCAwLCBsaW5rOiBcIi9hZG1pbi9yZXNvdXJjZXMvcGxhbnNcIiwgY29sb3I6IFwiIzg0Y2MxNlwiLCBpY29uOiBcIvCfk4tcIiB9LFxyXG4gICAgeyB0aXRsZTogXCJUb3RhbCBSZXZlbnVlXCIsIHZhbHVlOiBgJCR7KG1ldHJpY3MudG90YWxSZXZlbnVlIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9YCwgbGluazogXCIvYWRtaW4vcmVzb3VyY2VzL3BheW1lbnRzXCIsIGNvbG9yOiBcIiMyMmM1NWVcIiwgaWNvbjogXCLwn5KwXCIgfSxcclxuICAgIHsgdGl0bGU6IFwiQW5hbHl0aWNzXCIsIHZhbHVlOiBcIlZpZXcgUmVwb3J0c1wiLCBsaW5rOiBcIi9hZG1pbi9wYWdlcy9hbmFseXRpY3NcIiwgY29sb3I6IFwiIzYzNjZmMVwiLCBpY29uOiBcIvCfk4pcIiB9LFxyXG4gIF07XHJcblxyXG4gIGNvbnN0IGhhbmRsZUNhcmRDbGljayA9IChjYXJkKSA9PiB7XHJcbiAgICBpZiAoY2FyZC5hY3Rpb24gPT09ICdjb3Vyc2VzJykge1xyXG4gICAgICBzZXRDdXJyZW50VmlldygnY291cnNlcycpO1xyXG4gICAgfSBlbHNlIGlmIChjYXJkLmxpbmspIHtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBjYXJkLmxpbms7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZ2V0VGltZUFnbyA9IChkYXRlU3RyaW5nKSA9PiB7XHJcbiAgICBpZiAoIWRhdGVTdHJpbmcpIHJldHVybiBcIlwiO1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcclxuICAgICAgY29uc3QgbG9nVGltZSA9IG5ldyBEYXRlKGRhdGVTdHJpbmcpO1xyXG4gICAgICBjb25zdCBkaWZmTXMgPSBub3cgLSBsb2dUaW1lO1xyXG4gICAgICBjb25zdCBkaWZmU2VjcyA9IE1hdGguZmxvb3IoZGlmZk1zIC8gMTAwMCk7XHJcbiAgICAgIGlmIChkaWZmU2VjcyA8IDYwKSByZXR1cm4gYCR7ZGlmZlNlY3N9cyBhZ29gO1xyXG4gICAgICBjb25zdCBkaWZmTWlucyA9IE1hdGguZmxvb3IoZGlmZlNlY3MgLyA2MCk7XHJcbiAgICAgIGlmIChkaWZmTWlucyA8IDYwKSByZXR1cm4gYCR7ZGlmZk1pbnN9bSBhZ29gO1xyXG4gICAgICBjb25zdCBkaWZmSG91cnMgPSBNYXRoLmZsb29yKGRpZmZNaW5zIC8gNjApO1xyXG4gICAgICBpZiAoZGlmZkhvdXJzIDwgMjQpIHJldHVybiBgJHtkaWZmSG91cnN9aCBhZ29gO1xyXG4gICAgICBjb25zdCBkaWZmRGF5cyA9IE1hdGguZmxvb3IoZGlmZkhvdXJzIC8gMjQpO1xyXG4gICAgICBpZiAoZGlmZkRheXMgPCA3KSByZXR1cm4gYCR7ZGlmZkRheXN9ZCBhZ29gO1xyXG4gICAgICByZXR1cm4gbG9nVGltZS50b0xvY2FsZURhdGVTdHJpbmcoKTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICByZXR1cm4gXCJcIjtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBjb250YWluZXJTdHlsZSA9IHtcclxuICAgIGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLFxyXG4gICAgbWluSGVpZ2h0OiAnMTAwdmgnLFxyXG4gICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgZm9udEZhbWlseTogJy1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgXCJTZWdvZSBVSVwiLCBSb2JvdG8sIFwiSGVsdmV0aWNhIE5ldWVcIiwgQXJpYWwsIHNhbnMtc2VyaWYnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgaGVhZGVyU3R5bGUgPSB7XHJcbiAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLFxyXG4gICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICBtYXJnaW5Cb3R0b206ICczMHB4JyxcclxuICAgIHBhZGRpbmdCb3R0b206ICcyMHB4JyxcclxuICAgIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IHJlZnJlc2hCdXR0b25TdHlsZSA9IHtcclxuICAgIGJhY2tncm91bmRDb2xvcjogJyNmOGY5ZmEnLFxyXG4gICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlOWVjZWYnLFxyXG4gICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcclxuICAgIHBhZGRpbmc6ICc4cHggMTJweCcsXHJcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgIHRyYW5zaXRpb246ICdhbGwgMC4ycycsXHJcbiAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcclxuICAgIGNvbG9yOiAnIzM3NDE1MScsXHJcbiAgICBmb250U2l6ZTogJzE0cHgnLFxyXG4gICAgZ2FwOiAnOHB4J1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IG1ldHJpY3NHcmlkU3R5bGUgPSB7XHJcbiAgICBkaXNwbGF5OiAnZ3JpZCcsXHJcbiAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjgwcHgsIDFmcikpJyxcclxuICAgIGdhcDogJzI0cHgnLFxyXG4gICAgbWFyZ2luQm90dG9tOiAnNDBweCdcclxuICB9O1xyXG5cclxuICBjb25zdCBjYXJkU3R5bGUgPSB7XHJcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmZmZmJyxcclxuICAgIHBhZGRpbmc6ICcyNHB4JyxcclxuICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTllY2VmJyxcclxuICAgIGJvcmRlclJhZGl1czogJzhweCcsXHJcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgIHRyYW5zaXRpb246ICdhbGwgMC4ycyBlYXNlJyxcclxuICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsIDAsIDAsIDAuMSknLFxyXG4gICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICBvdmVyZmxvdzogJ2hpZGRlbidcclxuICB9O1xyXG5cclxuICBjb25zdCBjYXJkVGl0bGVTdHlsZSA9IHtcclxuICAgIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgICBmb250V2VpZ2h0OiAnNTAwJyxcclxuICAgIGNvbG9yOiAnIzZiNzI4MCcsXHJcbiAgICBtYXJnaW46ICcwIDAgOHB4IDAnLFxyXG4gICAgdGV4dFRyYW5zZm9ybTogJ3VwcGVyY2FzZScsXHJcbiAgICBsZXR0ZXJTcGFjaW5nOiAnMC44cHgnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgY2FyZFZhbHVlU3R5bGUgPSB7XHJcbiAgICBmb250U2l6ZTogJzI4cHgnLFxyXG4gICAgZm9udFdlaWdodDogJzcwMCcsXHJcbiAgICBjb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgbWFyZ2luOiAnMCcsXHJcbiAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgIGdhcDogJzEycHgnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgY2FyZEljb25TdHlsZSA9IHtcclxuICAgIGZvbnRTaXplOiAnMjRweCcsXHJcbiAgICBvcGFjaXR5OiAwLjhcclxuICB9O1xyXG5cclxuICBjb25zdCBsb2dzQ29udGFpbmVyU3R5bGUgPSB7XHJcbiAgICBkaXNwbGF5OiAnZ3JpZCcsXHJcbiAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAnMWZyIDFmcicsXHJcbiAgICBnYXA6ICcyNHB4J1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGxvZ1NlY3Rpb25TdHlsZSA9IHtcclxuICAgIGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLFxyXG4gICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlOWVjZWYnLFxyXG4gICAgYm9yZGVyUmFkaXVzOiAnOHB4JyxcclxuICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcclxuICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsIDAsIDAsIDAuMSknXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbG9nSGVhZGVyU3R5bGUgPSB7XHJcbiAgICBmb250U2l6ZTogJzE2cHgnLFxyXG4gICAgZm9udFdlaWdodDogJzYwMCcsXHJcbiAgICBjb2xvcjogJyMxZTI5M2InLFxyXG4gICAgbWFyZ2luOiAnMCcsXHJcbiAgICBwYWRkaW5nOiAnMTZweCAyMHB4JyxcclxuICAgIGJhY2tncm91bmRDb2xvcjogJyNmOGY5ZmEnLFxyXG4gICAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlOWVjZWYnLFxyXG4gICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICBnYXA6ICc4cHgnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbG9nSXRlbVN0eWxlID0ge1xyXG4gICAgcGFkZGluZzogJzE2cHggMjBweCcsXHJcbiAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2YxZjNmNCcsXHJcbiAgICB0cmFuc2l0aW9uOiAnYmFja2dyb3VuZC1jb2xvciAwLjJzJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGxvZ0l0ZW1OYW1lU3R5bGUgPSB7XHJcbiAgICBmb250V2VpZ2h0OiAnNjAwJyxcclxuICAgIGNvbG9yOiAnIzFlMjkzYicsXHJcbiAgICBmb250U2l6ZTogJzE0cHgnLFxyXG4gICAgbWFyZ2luQm90dG9tOiAnNHB4J1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGxvZ0l0ZW1BY3Rpb25TdHlsZSA9IHtcclxuICAgIGNvbG9yOiAnIzZiNzI4MCcsXHJcbiAgICBmb250U2l6ZTogJzEzcHgnLFxyXG4gICAgbWFyZ2luQm90dG9tOiAnNHB4J1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGxvZ0l0ZW1UaW1lU3R5bGUgPSB7XHJcbiAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgY29sb3I6ICcjOWNhM2FmJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGVtcHR5U3RhdGVTdHlsZSA9IHtcclxuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICBjb2xvcjogJyM2YjcyODAnLFxyXG4gICAgZm9udFN0eWxlOiAnaXRhbGljJyxcclxuICAgIHBhZGRpbmc6ICc0MHB4IDIwcHgnXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXYgc3R5bGU9e2NvbnRhaW5lclN0eWxlfT5cclxuICAgICAgPHN0eWxlPlxyXG4gICAgICAgIHtgXHJcbiAgICAgICAgICBAa2V5ZnJhbWVzIHNwaW4ge1xyXG4gICAgICAgICAgICAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9XHJcbiAgICAgICAgICAgIDEwMCUgeyB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOyB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC5sb2ctaXRlbTpob3ZlciB7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWZhZmIgIWltcG9ydGFudDtcclxuICAgICAgICAgIH1cclxuICAgICAgICBgfVxyXG4gICAgICA8L3N0eWxlPlxyXG4gICAgICBcclxuICAgICAgPGRpdiBzdHlsZT17aGVhZGVyU3R5bGV9PlxyXG4gICAgICAgIDxkaXY+XHJcbiAgICAgICAgICA8aDEgc3R5bGU9e3sgZm9udFNpemU6IFwiMS41cmVtXCIsIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLCBtYXJnaW46IDAsIGNvbG9yOiBcIiMxZTI5M2JcIiB9fT5cclxuICAgICAgICAgICAgQWRtaW4gRGFzaGJvYXJkXHJcbiAgICAgICAgICA8L2gxPlxyXG4gICAgICAgICAgPHAgc3R5bGU9e3sgbWFyZ2luOiAnNHB4IDAgMCAwJywgY29sb3I6ICcjNmI3MjgwJywgZm9udFNpemU6ICcxNHB4JyB9fT5cclxuICAgICAgICAgICAgV2VsY29tZSBiYWNrISBIZXJlJ3Mgd2hhdCdzIGhhcHBlbmluZyB0b2RheS5cclxuICAgICAgICAgIDwvcD5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8YnV0dG9uIFxyXG4gICAgICAgICAgb25DbGljaz17aGFuZGxlUmVmcmVzaH0gXHJcbiAgICAgICAgICBzdHlsZT17cmVmcmVzaEJ1dHRvblN0eWxlfVxyXG4gICAgICAgICAgb25Nb3VzZU92ZXI9eyhlKSA9PiB7XHJcbiAgICAgICAgICAgIGUudGFyZ2V0LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZTllY2VmJztcclxuICAgICAgICAgICAgZS50YXJnZXQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoLTFweCknO1xyXG4gICAgICAgICAgfX1cclxuICAgICAgICAgIG9uTW91c2VPdXQ9eyhlKSA9PiB7XHJcbiAgICAgICAgICAgIGUudGFyZ2V0LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZjhmOWZhJztcclxuICAgICAgICAgICAgZS50YXJnZXQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoMCknO1xyXG4gICAgICAgICAgfX1cclxuICAgICAgICAgIHRpdGxlPVwiUmVmcmVzaCBEYXNoYm9hcmRcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIDxzdmcgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCI+XHJcbiAgICAgICAgICAgIDxwYXRoIGQ9XCJNMyAxMmE5IDkgMCAwIDEgOS05IDkuNzUgOS43NSAwIDAgMSA2Ljc0IDIuNzRMMjEgOFwiLz5cclxuICAgICAgICAgICAgPHBhdGggZD1cIk0yMSAzdjVoLTVcIi8+XHJcbiAgICAgICAgICAgIDxwYXRoIGQ9XCJNMjEgMTJhOSA5IDAgMCAxLTkgOSA5Ljc1IDkuNzUgMCAwIDEtNi43NC0yLjc0TDMgMTZcIi8+XHJcbiAgICAgICAgICAgIDxwYXRoIGQ9XCJNMyAyMXYtNWg1XCIvPlxyXG4gICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICBSZWZyZXNoXHJcbiAgICAgICAgPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdiBzdHlsZT17bWV0cmljc0dyaWRTdHlsZX0+XHJcbiAgICAgICAge3N0YXRzQ2FyZHMubWFwKChjYXJkLCBpbmRleCkgPT4gKFxyXG4gICAgICAgICAgPGRpdiBcclxuICAgICAgICAgICAga2V5PXtpbmRleH0gXHJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZUNhcmRDbGljayhjYXJkKX0gXHJcbiAgICAgICAgICAgIHN0eWxlPXtjYXJkU3R5bGV9XHJcbiAgICAgICAgICAgIG9uTW91c2VPdmVyPXsoZSkgPT4ge1xyXG4gICAgICAgICAgICAgIGUuY3VycmVudFRhcmdldC5zdHlsZS5ib3JkZXJDb2xvciA9IGNhcmQuY29sb3I7XHJcbiAgICAgICAgICAgICAgZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJveFNoYWRvdyA9IGAwIDhweCAyNXB4ICR7Y2FyZC5jb2xvcn0yMGA7XHJcbiAgICAgICAgICAgICAgZS5jdXJyZW50VGFyZ2V0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKC00cHgpJztcclxuICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgb25Nb3VzZU91dD17KGUpID0+IHtcclxuICAgICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYm9yZGVyQ29sb3IgPSAnI2U5ZWNlZic7XHJcbiAgICAgICAgICAgICAgZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJveFNoYWRvdyA9ICcwIDFweCAzcHggcmdiYSgwLCAwLCAwLCAwLjEpJztcclxuICAgICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoMCknO1xyXG4gICAgICAgICAgICB9fVxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICA8aDMgc3R5bGU9e2NhcmRUaXRsZVN0eWxlfT57Y2FyZC50aXRsZX08L2gzPlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXtjYXJkVmFsdWVTdHlsZX0+XHJcbiAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e2NhcmRJY29uU3R5bGV9PntjYXJkLmljb259PC9zcGFuPlxyXG4gICAgICAgICAgICAgIDxzcGFuPntjYXJkLnZhbHVlfTwvc3Bhbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB7LyogQ2FyZCBhY2NlbnQgYmFyICovfVxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgYm90dG9tOiAwLFxyXG4gICAgICAgICAgICAgIGxlZnQ6IDAsXHJcbiAgICAgICAgICAgICAgcmlnaHQ6IDAsXHJcbiAgICAgICAgICAgICAgaGVpZ2h0OiAnNHB4JyxcclxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBjYXJkLmNvbG9yLFxyXG4gICAgICAgICAgICAgIG9wYWNpdHk6IDAuNlxyXG4gICAgICAgICAgICB9fSAvPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKSl9XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdiBzdHlsZT17bG9nc0NvbnRhaW5lclN0eWxlfT5cclxuICAgICAgICA8ZGl2IHN0eWxlPXtsb2dTZWN0aW9uU3R5bGV9PlxyXG4gICAgICAgICAgPGgzIHN0eWxlPXtsb2dIZWFkZXJTdHlsZX0+XHJcbiAgICAgICAgICAgIDxzcGFuPvCflKc8L3NwYW4+XHJcbiAgICAgICAgICAgIEFkbWluIEFjdGl2aXR5ICh7YWRtaW5Mb2dzLmxlbmd0aH0pXHJcbiAgICAgICAgICA8L2gzPlxyXG4gICAgICAgICAge2FkbWluTG9ncy5sZW5ndGggPT09IDAgPyAoXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e2VtcHR5U3RhdGVTdHlsZX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzMycHgnLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PvCfpKs8L2Rpdj5cclxuICAgICAgICAgICAgICBObyByZWNlbnQgYWRtaW4gYWN0aXZpdHlcclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICBhZG1pbkxvZ3MubWFwKChsb2csIGkpID0+IChcclxuICAgICAgICAgICAgICA8ZGl2IFxyXG4gICAgICAgICAgICAgICAga2V5PXtsb2cuaWQgfHwgaX0gXHJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJsb2ctaXRlbVwiXHJcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAuLi5sb2dJdGVtU3R5bGUsXHJcbiAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogaSA9PT0gYWRtaW5Mb2dzLmxlbmd0aCAtIDEgPyAnbm9uZScgOiAnMXB4IHNvbGlkICNmM2Y0ZjYnXHJcbiAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e2xvZ0l0ZW1OYW1lU3R5bGV9PlxyXG4gICAgICAgICAgICAgICAgICB7bG9nLmZpcnN0X25hbWV9IHtsb2cubGFzdF9uYW1lfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtsb2dJdGVtQWN0aW9uU3R5bGV9Pntsb2cuYWN0aW9ufTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17bG9nSXRlbVRpbWVTdHlsZX0+XHJcbiAgICAgICAgICAgICAgICAgIHtnZXRUaW1lQWdvKGxvZy5jcmVhdGVkX2F0KX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApKVxyXG4gICAgICAgICAgKX1cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGRpdiBzdHlsZT17bG9nU2VjdGlvblN0eWxlfT5cclxuICAgICAgICAgIDxoMyBzdHlsZT17bG9nSGVhZGVyU3R5bGV9PlxyXG4gICAgICAgICAgICA8c3Bhbj7wn5GlPC9zcGFuPlxyXG4gICAgICAgICAgICBVc2VyIEFjdGl2aXR5ICh7dXNlckxvZ3MubGVuZ3RofSlcclxuICAgICAgICAgIDwvaDM+XHJcbiAgICAgICAgICB7dXNlckxvZ3MubGVuZ3RoID09PSAwID8gKFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXtlbXB0eVN0YXRlU3R5bGV9PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICczMnB4JywgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT7wn5i0PC9kaXY+XHJcbiAgICAgICAgICAgICAgTm8gcmVjZW50IHVzZXIgYWN0aXZpdHlcclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICB1c2VyTG9ncy5tYXAoKGxvZywgaSkgPT4gKFxyXG4gICAgICAgICAgICAgIDxkaXYgXHJcbiAgICAgICAgICAgICAgICBrZXk9e2xvZy5pZCB8fCBpfSBcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImxvZy1pdGVtXCJcclxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgIC4uLmxvZ0l0ZW1TdHlsZSxcclxuICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiBpID09PSB1c2VyTG9ncy5sZW5ndGggLSAxID8gJ25vbmUnIDogJzFweCBzb2xpZCAjZjNmNGY2J1xyXG4gICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtsb2dJdGVtTmFtZVN0eWxlfT5cclxuICAgICAgICAgICAgICAgICAge2xvZy5maXJzdF9uYW1lfSB7bG9nLmxhc3RfbmFtZX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17bG9nSXRlbUFjdGlvblN0eWxlfT57bG9nLmFjdGlvbn08L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e2xvZ0l0ZW1UaW1lU3R5bGV9PlxyXG4gICAgICAgICAgICAgICAgICB7Z2V0VGltZUFnbyhsb2cuY3JlYXRlZF9hdCl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKSlcclxuICAgICAgICAgICl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxufSIsIi8vIEFkbWluL2NvbXBvbmVudHMvQW5hbHl0aWNzLmpzeFxyXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gXCJyZWFjdFwiO1xyXG5pbXBvcnQgeyBBcGlDbGllbnQgfSBmcm9tIFwiYWRtaW5qc1wiO1xyXG5cclxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQW5hbHl0aWNzKCkge1xyXG4gIGNvbnN0IFthY3RpdmVUYWIsIHNldEFjdGl2ZVRhYl0gPSB1c2VTdGF0ZSgnb3ZlcnZpZXcnKTtcclxuICBjb25zdCBbZGF0ZVJhbmdlLCBzZXREYXRlUmFuZ2VdID0gdXNlU3RhdGUoJzMwZCcpO1xyXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcclxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xyXG4gIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlKG51bGwpO1xyXG5cclxuICBjb25zdCBmZXRjaEFuYWx5dGljc0RhdGEgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBzZXRMb2FkaW5nKHRydWUpO1xyXG4gICAgc2V0RXJyb3IobnVsbCk7XHJcbiAgICBcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYC9hcGkvYWRtaW4vYW5hbHl0aWNzP3JhbmdlPSR7ZGF0ZVJhbmdlfWApO1xyXG4gICAgICBcclxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGZldGNoIGFuYWx5dGljcyBkYXRhJyk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGNvbnN0IGFuYWx5dGljc0RhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgIHNldERhdGEoYW5hbHl0aWNzRGF0YSk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignQW5hbHl0aWNzIGZldGNoIGVycm9yOicsIGVycik7XHJcbiAgICAgIHNldEVycm9yKCdGYWlsZWQgdG8gbG9hZCBhbmFseXRpY3MgZGF0YScpO1xyXG4gICAgICBzZXREYXRhKHtcclxuICAgICAgICBvdmVydmlldzoge30sXHJcbiAgICAgICAgYXBwb2ludG1lbnRzOiB7IG92ZXJ2aWV3OiB7fSwgYXBwb2ludG1lbnRTdGF0czogW10sIHRvcEZyZWVsYW5jZXJzOiBbXSwgcmVjZW50QXBwb2ludG1lbnRzOiBbXSB9LFxyXG4gICAgICAgIHVzZXJzOiB7IG92ZXJ2aWV3OiB7fSwgdXNlckdyb3d0aDogW10sIHVzZXJEaXN0cmlidXRpb246IFtdLCByZWNlbnRVc2VyczogW10gfSxcclxuICAgICAgICBwcm9qZWN0U3RhdHM6IHsgYnlTdGF0dXM6IFtdIH0sXHJcbiAgICAgIH0pO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGZldGNoQW5hbHl0aWNzRGF0YSgpO1xyXG4gIH0sIFtkYXRlUmFuZ2VdKTtcclxuXHJcbiAgY29uc3QgZm9ybWF0Q3VycmVuY3kgPSAoYW1vdW50KSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IEludGwuTnVtYmVyRm9ybWF0KCdlbi1VUycsIHtcclxuICAgICAgc3R5bGU6ICdjdXJyZW5jeScsXHJcbiAgICAgIGN1cnJlbmN5OiAnVVNEJ1xyXG4gICAgfSkuZm9ybWF0KGFtb3VudCB8fCAwKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBmb3JtYXREYXRlID0gKGRhdGVTdHJpbmcpID0+IHtcclxuICAgIHJldHVybiBuZXcgRGF0ZShkYXRlU3RyaW5nKS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLVVTJywge1xyXG4gICAgICBtb250aDogJ3Nob3J0JyxcclxuICAgICAgZGF5OiAnbnVtZXJpYydcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGZvcm1hdFBlcmNlbnRhZ2UgPSAodmFsdWUpID0+IHtcclxuICAgIHJldHVybiBgJHsodmFsdWUgfHwgMCkudG9GaXhlZCgxKX0lYDtcclxuICB9O1xyXG5cclxuICBpZiAobG9hZGluZykge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICBkaXNwbGF5OiAnZmxleCcsIFxyXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJywgXHJcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsIFxyXG4gICAgICAgIG1pbkhlaWdodDogJzQwMHB4JyxcclxuICAgICAgICBmb250RmFtaWx5OiAnLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBcIlNlZ29lIFVJXCIsIFJvYm90bywgc2Fucy1zZXJpZidcclxuICAgICAgfX0+XHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyB0ZXh0QWxpZ246ICdjZW50ZXInIH19PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICB3aWR0aDogJzQwcHgnLFxyXG4gICAgICAgICAgICBoZWlnaHQ6ICc0MHB4JyxcclxuICAgICAgICAgICAgYm9yZGVyOiAnNHB4IHNvbGlkICNlNWU3ZWInLFxyXG4gICAgICAgICAgICBib3JkZXJUb3A6ICc0cHggc29saWQgIzNiODJmNicsXHJcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzUwJScsXHJcbiAgICAgICAgICAgIGFuaW1hdGlvbjogJ3NwaW4gMXMgbGluZWFyIGluZmluaXRlJyxcclxuICAgICAgICAgICAgbWFyZ2luOiAnMCBhdXRvIDE2cHgnXHJcbiAgICAgICAgICB9fT48L2Rpdj5cclxuICAgICAgICAgIDxwIHN0eWxlPXt7IGNvbG9yOiAnIzZiNzI4MCcgfX0+TG9hZGluZyBhbmFseXRpY3MuLi48L3A+XHJcbiAgICAgICAgICA8c3R5bGU+e2BcclxuICAgICAgICAgICAgQGtleWZyYW1lcyBzcGluIHtcclxuICAgICAgICAgICAgICAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9XHJcbiAgICAgICAgICAgICAgMTAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgYH08L3N0eWxlPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgcGFkZGluZzogJzI0cHgnLCBcclxuICAgICAgZm9udEZhbWlseTogJy1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgXCJTZWdvZSBVSVwiLCBSb2JvdG8sIHNhbnMtc2VyaWYnLFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmYWZjJyxcclxuICAgICAgbWluSGVpZ2h0OiAnMTAwdmgnXHJcbiAgICB9fT5cclxuICAgICAgey8qIEhlYWRlciAqL31cclxuICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICczMnB4JyB9fT5cclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLCBcclxuICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIFxyXG4gICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICBtYXJnaW5Cb3R0b206ICcyNHB4J1xyXG4gICAgICAgIH19PlxyXG4gICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgPGgxIHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgIG1hcmdpbjogJzAgMCA4cHggMCcsIFxyXG4gICAgICAgICAgICAgIGZvbnRTaXplOiAnMjhweCcsIFxyXG4gICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc3MDAnLFxyXG4gICAgICAgICAgICAgIGNvbG9yOiAnIzFlMjkzYidcclxuICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgQW5hbHl0aWNzIERhc2hib2FyZFxyXG4gICAgICAgICAgICA8L2gxPlxyXG4gICAgICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW46ICcwJywgY29sb3I6ICcjNjQ3NDhiJywgZm9udFNpemU6ICcxNnB4JyB9fT5cclxuICAgICAgICAgICAgICBDb21wcmVoZW5zaXZlIGJ1c2luZXNzIGluc2lnaHRzIGFuZCBtZXRyaWNzXHJcbiAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnMTJweCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH19PlxyXG4gICAgICAgICAgICA8c2VsZWN0XHJcbiAgICAgICAgICAgICAgdmFsdWU9e2RhdGVSYW5nZX1cclxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldERhdGVSYW5nZShlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc4cHggMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2QxZDVkYicsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc4cHgnLFxyXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInXHJcbiAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI3ZFwiPjcgRGF5czwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIzMGRcIj4zMCBEYXlzPC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjkwZFwiPjkwIERheXM8L29wdGlvbj5cclxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMXlcIj4xIFllYXI8L29wdGlvbj5cclxuICAgICAgICAgICAgPC9zZWxlY3Q+XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgb25DbGljaz17ZmV0Y2hBbmFseXRpY3NEYXRhfVxyXG4gICAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnOHB4IDE2cHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzNiODJmNicsXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnOHB4JyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4JyxcclxuICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc1MDAnXHJcbiAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIFJlZnJlc2hcclxuICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAge2Vycm9yICYmIChcclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgcGFkZGluZzogJzEycHggMTZweCcsXHJcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmZWUyZTInLFxyXG4gICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2ZlY2FjYScsXHJcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzhweCcsXHJcbiAgICAgICAgICAgIGNvbG9yOiAnIzk5MWIxYicsXHJcbiAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzI0cHgnLFxyXG4gICAgICAgICAgICBmb250U2l6ZTogJzE0cHgnXHJcbiAgICAgICAgICB9fT5cclxuICAgICAgICAgICAge2Vycm9yfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKX1cclxuXHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2U1ZTdlYicgfX0+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnMzJweCcgfX0+XHJcbiAgICAgICAgICAgIHtbXHJcbiAgICAgICAgICAgICAgeyBpZDogJ292ZXJ2aWV3JywgbGFiZWw6ICdPdmVydmlldycgfSxcclxuICAgICAgICAgICAgICB7IGlkOiAnYXBwb2ludG1lbnRzJywgbGFiZWw6ICdBcHBvaW50bWVudHMnIH0sXHJcbiAgICAgICAgICAgICAgeyBpZDogJ3VzZXJzJywgbGFiZWw6ICdVc2VycycgfSxcclxuICAgICAgICAgICAgICB7IGlkOiAncHJvamVjdHMnLCBsYWJlbDogJ1Byb2plY3RzJyB9LFxyXG4gICAgICAgICAgICAgIHsgaWQ6ICdmaW5hbmNpYWwnLCBsYWJlbDogJ0ZpbmFuY2lhbCcgfVxyXG4gICAgICAgICAgICBdLm1hcCh0YWIgPT4gKFxyXG4gICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgIGtleT17dGFiLmlkfVxyXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKHRhYi5pZCl9XHJcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTJweCAwJyxcclxuICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4JyxcclxuICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzUwMCcsXHJcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBhY3RpdmVUYWIgPT09IHRhYi5pZCA/ICcjM2I4MmY2JyA6ICcjNmI3MjgwJyxcclxuICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiBhY3RpdmVUYWIgPT09IHRhYi5pZCA/ICcycHggc29saWQgIzNiODJmNicgOiAnMnB4IHNvbGlkIHRyYW5zcGFyZW50JyxcclxuICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICdhbGwgMC4ycydcclxuICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAge3RhYi5sYWJlbH1cclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IG1pbkhlaWdodDogJzQwMHB4JyB9fT5cclxuICAgICAgICB7YWN0aXZlVGFiID09PSAnb3ZlcnZpZXcnICYmIChcclxuICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgZGlzcGxheTogJ2dyaWQnLCBcclxuICAgICAgICAgICAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjQwcHgsIDFmcikpJywgXHJcbiAgICAgICAgICAgICAgZ2FwOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMzJweCdcclxuICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzI0cHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nIH19PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogJzUwMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICBUb3RhbCBVc2Vyc1xyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyOHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7KGRhdGE/Lm92ZXJ2aWV3Py50b3RhbFVzZXJzIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzEycHgnLCBjb2xvcjogJyMxMGI5ODEnLCBtYXJnaW5Ub3A6ICc0cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICt7ZGF0YT8ub3ZlcnZpZXc/Lm5ld1VzZXJzVG9kYXkgfHwgMH0gdG9kYXlcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEycHgnLCBcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZGJlYWZlJywgXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcyNHB4J1xyXG4gICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICDwn5GlXHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyNHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJyB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgVG90YWwgQXBwb2ludG1lbnRzXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI4cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIHsoZGF0YT8uYXBwb2ludG1lbnRzPy5vdmVydmlldz8udG90YWxBcHBvaW50bWVudHMgfHwgMCkudG9Mb2NhbGVTdHJpbmcoKX1cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTJweCcsIGNvbG9yOiAnIzEwYjk4MScsIG1hcmdpblRvcDogJzRweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAge2RhdGE/LmFwcG9pbnRtZW50cz8ub3ZlcnZpZXc/LmFwcG9pbnRtZW50c1RvZGF5IHx8IDB9IHRvZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4JywgXHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2RjZmNlNycsIFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMjRweCdcclxuICAgICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAg8J+ThVxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjRweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIEFjdGl2ZSBQcm9qZWN0c1xyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyOHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7KGRhdGE/Lm92ZXJ2aWV3Py5hY3RpdmVQcm9qZWN0cyB8fCAwKS50b0xvY2FsZVN0cmluZygpfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxMnB4JywgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luVG9wOiAnNHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7ZGF0YT8ub3ZlcnZpZXc/LmNvbXBsZXRlZFByb2plY3RzIHx8IDB9IGNvbXBsZXRlZFxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTJweCcsIFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmM2U4ZmYnLCBcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzI0cHgnXHJcbiAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIPCfkrxcclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzI0cHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nIH19PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogJzUwMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICBUb3RhbCBSZXZlbnVlXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI4cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIHtmb3JtYXRDdXJyZW5jeShkYXRhPy5vdmVydmlldz8udG90YWxSZXZlbnVlIHx8IDApfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxMnB4JywgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luVG9wOiAnNHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7Zm9ybWF0Q3VycmVuY3koZGF0YT8ub3ZlcnZpZXc/Lm1vbnRobHlSZXZlbnVlIHx8IDApfSB0aGlzIG1vbnRoXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4JywgXHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZlZjNjNycsIFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMjRweCdcclxuICAgICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAg8J+SsFxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxyXG4gICAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xyXG4gICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHggMjRweCcsIFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2Y4ZmFmYydcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46ICcwJywgZm9udFNpemU6ICcxOHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIFJlY2VudCBBcHBvaW50bWVudHNcclxuICAgICAgICAgICAgICAgIDwvaDM+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXhIZWlnaHQ6ICc0MDBweCcsIG92ZXJmbG93WTogJ2F1dG8nIH19PlxyXG4gICAgICAgICAgICAgICAge2RhdGE/LmFwcG9pbnRtZW50cz8ucmVjZW50QXBwb2ludG1lbnRzPy5sZW5ndGggPiAwID8gKFxyXG4gICAgICAgICAgICAgICAgICA8dGFibGUgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgYm9yZGVyQ29sbGFwc2U6ICdjb2xsYXBzZScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRoZWFkIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnLCBwb3NpdGlvbjogJ3N0aWNreScsIHRvcDogMCB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgVHlwZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBTdGF0dXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgRGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBGcmVlbGFuY2VyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAge2RhdGEuYXBwb2ludG1lbnRzLnJlY2VudEFwcG9pbnRtZW50cy5zbGljZSgwLCAxMCkubWFwKChhcHBvaW50bWVudCwgaW5kZXgpID0+IChcclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyIGtleT17aW5kZXh9IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZjNmNGY2JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnYmFja2dyb3VuZC1jb2xvciAwLjJzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2FwcG9pbnRtZW50LmFwcG9pbnRtZW50X3R5cGUgfHwgJ0FwcG9pbnRtZW50J31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc0cHggMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNjAwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBvaW50bWVudC5zdGF0dXMgPT09ICdwZW5kaW5nJyA/ICcjZmVmM2M3JyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwb2ludG1lbnQuc3RhdHVzID09PSAnYWNjZXB0ZWQnID8gJyNkY2ZjZTcnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBvaW50bWVudC5zdGF0dXMgPT09ICdyZWplY3RlZCcgPyAnI2ZlZTJlMicgOiAnI2YzZjRmNicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcG9pbnRtZW50LnN0YXR1cyA9PT0gJ3BlbmRpbmcnID8gJyM5MjQwMGUnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBvaW50bWVudC5zdGF0dXMgPT09ICdhY2NlcHRlZCcgPyAnIzA2NWY0NicgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcG9pbnRtZW50LnN0YXR1cyA9PT0gJ3JlamVjdGVkJyA/ICcjOTkxYjFiJyA6ICcjMzc0MTUxJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsoYXBwb2ludG1lbnQuc3RhdHVzIHx8ICdwZW5kaW5nJykuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyAoYXBwb2ludG1lbnQuc3RhdHVzIHx8ICdwZW5kaW5nJykuc2xpY2UoMSl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YXBwb2ludG1lbnQuY3JlYXRlZF9hdCA/IGZvcm1hdERhdGUoYXBwb2ludG1lbnQuY3JlYXRlZF9hdCkgOiAnLSd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2FwcG9pbnRtZW50LmZyZWVsYW5jZXJfZmlyc3RfbmFtZX0ge2FwcG9pbnRtZW50LmZyZWVsYW5jZXJfbGFzdF9uYW1lfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgKSA6IChcclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB0ZXh0QWxpZ246ICdjZW50ZXInLCBwYWRkaW5nOiAnNDhweCAyNHB4JywgY29sb3I6ICcjNmI3MjgwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnNDhweCcsIG1hcmdpbkJvdHRvbTogJzE2cHgnIH19PvCfk4U8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW46ICcwJywgZm9udFNpemU6ICcxNnB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+Tm8gcmVjZW50IGFwcG9pbnRtZW50cyBmb3VuZDwvcD5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICl9XHJcblxyXG4gICAgICAgIHthY3RpdmVUYWIgPT09ICdhcHBvaW50bWVudHMnICYmIChcclxuICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgZGlzcGxheTogJ2dyaWQnLCBcclxuICAgICAgICAgICAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjAwcHgsIDFmcikpJywgXHJcbiAgICAgICAgICAgICAgZ2FwOiAnMTZweCcsXHJcbiAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMzJweCdcclxuICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiAnOHB4JywgaGVpZ2h0OiAnOHB4JywgYmFja2dyb3VuZENvbG9yOiAnI2Y1OWUwYicsIGJvcmRlclJhZGl1czogJzUwJScsIG1hcmdpblJpZ2h0OiAnOHB4JyB9fT48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogJzUwMCcgfX0+UGVuZGluZzwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAge2RhdGE/LmFwcG9pbnRtZW50cz8ub3ZlcnZpZXc/LnBlbmRpbmdBcHBvaW50bWVudHMgfHwgMH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogJzhweCcsIGhlaWdodDogJzhweCcsIGJhY2tncm91bmRDb2xvcjogJyMxMGI5ODEnLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBtYXJnaW5SaWdodDogJzhweCcgfX0+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PkFjY2VwdGVkPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7ZGF0YT8uYXBwb2ludG1lbnRzPy5vdmVydmlldz8uYWNjZXB0ZWRBcHBvaW50bWVudHMgfHwgMH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogJzhweCcsIGhlaWdodDogJzhweCcsIGJhY2tncm91bmRDb2xvcjogJyNlZjQ0NDQnLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBtYXJnaW5SaWdodDogJzhweCcgfX0+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlJlamVjdGVkPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7ZGF0YT8uYXBwb2ludG1lbnRzPy5vdmVydmlldz8ucmVqZWN0ZWRBcHBvaW50bWVudHMgfHwgMH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogJzhweCcsIGhlaWdodDogJzhweCcsIGJhY2tncm91bmRDb2xvcjogJyMzYjgyZjYnLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBtYXJnaW5SaWdodDogJzhweCcgfX0+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PkFjY2VwdGFuY2UgUmF0ZTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAge2Zvcm1hdFBlcmNlbnRhZ2UoZGF0YT8uYXBwb2ludG1lbnRzPy5vdmVydmlldz8uYWNjZXB0YW5jZVJhdGUgfHwgMCl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICB7ZGF0YT8uYXBwb2ludG1lbnRzPy50b3BGcmVlbGFuY2Vycz8ubGVuZ3RoID4gMCAmJiAoXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcclxuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHggMjRweCcsIFxyXG4gICAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnXHJcbiAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgPGgzIHN0eWxlPXt7IG1hcmdpbjogJzAnLCBmb250U2l6ZTogJzE4cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICBUb3AgUGVyZm9ybWluZyBGcmVlbGFuY2Vyc1xyXG4gICAgICAgICAgICAgICAgICA8L2gzPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8dGFibGUgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgYm9yZGVyQ29sbGFwc2U6ICdjb2xsYXBzZScgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDx0aGVhZCBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmYWZjJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgRnJlZWxhbmNlclxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBUb3RhbFxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBBY2NlcHRlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBTdWNjZXNzIFJhdGVcclxuICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgPC90aGVhZD5cclxuICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgIHtkYXRhLmFwcG9pbnRtZW50cy50b3BGcmVlbGFuY2Vycy5tYXAoKGZyZWVsYW5jZXIsIGluZGV4KSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICA8dHIga2V5PXtpbmRleH0gc3R5bGU9e3sgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNmM2Y0ZjYnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzQwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICc0MHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzNiODJmNicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzUwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc2MDAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE2cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5SaWdodDogJzEycHgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2ZyZWVsYW5jZXIuZmlyc3RfbmFtZT8uWzBdfXtmcmVlbGFuY2VyLmxhc3RfbmFtZT8uWzBdfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmcmVlbGFuY2VyLmZpcnN0X25hbWV9IHtmcmVlbGFuY2VyLmxhc3RfbmFtZX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxMnB4JywgY29sb3I6ICcjNmI3MjgwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZnJlZWxhbmNlci5lbWFpbH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHgnLCBmb250U2l6ZTogJzE2cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICB7ZnJlZWxhbmNlci50b3RhbF9hcHBvaW50bWVudHN9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNnB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzEwYjk4MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAge2ZyZWVsYW5jZXIuYWNjZXB0ZWRfYXBwb2ludG1lbnRzfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTZweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzYjgyZjYnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtmb3JtYXRQZXJjZW50YWdlKGZyZWVsYW5jZXIuYWNjZXB0YW5jZV9yYXRlKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKX1cclxuXHJcbiAgICAgICAge2FjdGl2ZVRhYiA9PT0gJ3VzZXJzJyAmJiAoXHJcbiAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgIGRpc3BsYXk6ICdncmlkJywgXHJcbiAgICAgICAgICAgICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDIwMHB4LCAxZnIpKScsIFxyXG4gICAgICAgICAgICAgIGdhcDogJzE2cHgnLFxyXG4gICAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzMycHgnXHJcbiAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+VG90YWwgVXNlcnM8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHsoZGF0YT8udXNlcnM/Lm92ZXJ2aWV3Py50b3RhbFVzZXJzIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzNiODJmNicsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PkNsaWVudHM8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHsoZGF0YT8udXNlcnM/Lm92ZXJ2aWV3Py50b3RhbENsaWVudHMgfHwgMCkudG9Mb2NhbGVTdHJpbmcoKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjOGI1Y2Y2JywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+RnJlZWxhbmNlcnM8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHsoZGF0YT8udXNlcnM/Lm92ZXJ2aWV3Py50b3RhbEZyZWVsYW5jZXJzIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzEwYjk4MScsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19Pk5ldyBUaGlzIE1vbnRoPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7KGRhdGE/LnVzZXJzPy5vdmVydmlldz8ubmV3VXNlcnNNb250aCB8fCAwKS50b0xvY2FsZVN0cmluZygpfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAge2RhdGE/LnVzZXJzPy5yZWNlbnRVc2Vycz8ubGVuZ3RoID4gMCAmJiAoXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcclxuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHggMjRweCcsIFxyXG4gICAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnXHJcbiAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgPGgzIHN0eWxlPXt7IG1hcmdpbjogJzAnLCBmb250U2l6ZTogJzE4cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICBSZWNlbnQgVXNlciBSZWdpc3RyYXRpb25zXHJcbiAgICAgICAgICAgICAgICAgIDwvaDM+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDx0YWJsZSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBib3JkZXJDb2xsYXBzZTogJ2NvbGxhcHNlJyB9fT5cclxuICAgICAgICAgICAgICAgICAgPHRoZWFkIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBVc2VyXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEVtYWlsXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFJvbGVcclxuICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgSm9pbmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgIDx0Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICB7ZGF0YS51c2Vycy5yZWNlbnRVc2Vycy5zbGljZSgwLCAxMCkubWFwKCh1c2VyLCBpbmRleCkgPT4gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRyIGtleT17aW5kZXh9IHN0eWxlPXt7IGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZjNmNGY2JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICB7dXNlci5maXJzdF9uYW1lfSB7dXNlci5sYXN0X25hbWV9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICB7dXNlci5lbWFpbH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNHB4IDEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzYwMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHVzZXIucm9sZV9pZCA9PT0gMiA/ICcjZGJlYWZlJyA6IHVzZXIucm9sZV9pZCA9PT0gMyA/ICcjZjNlOGZmJyA6ICcjZjNmNGY2JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiB1c2VyLnJvbGVfaWQgPT09IDIgPyAnIzFlNDBhZicgOiB1c2VyLnJvbGVfaWQgPT09IDMgPyAnIzdjM2FlZCcgOiAnIzM3NDE1MSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt1c2VyLnJvbGVfaWQgPT09IDIgPyAnQ2xpZW50JyA6IHVzZXIucm9sZV9pZCA9PT0gMyA/ICdGcmVlbGFuY2VyJyA6ICdVc2VyJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICB7dXNlci5jcmVhdGVkX2F0ID8gZm9ybWF0RGF0ZSh1c2VyLmNyZWF0ZWRfYXQpIDogJy0nfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICl9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICApfVxyXG5cclxuICAgICAgICB7YWN0aXZlVGFiID09PSAncHJvamVjdHMnICYmIChcclxuICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgZGlzcGxheTogJ2dyaWQnLCBcclxuICAgICAgICAgICAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMTgwcHgsIDFmcikpJywgXHJcbiAgICAgICAgICAgICAgZ2FwOiAnMTZweCcsXHJcbiAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMzJweCdcclxuICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5EcmFmdDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAge2RhdGE/Lm92ZXJ2aWV3Py5kcmFmdFByb2plY3RzIHx8IDB9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzNiODJmNicsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PkFjdGl2ZTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAge2RhdGE/Lm92ZXJ2aWV3Py5hY3RpdmVQcm9qZWN0cyB8fCAwfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyMxMGI5ODEnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5Db21wbGV0ZWQ8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHtkYXRhPy5vdmVydmlldz8uY29tcGxldGVkUHJvamVjdHMgfHwgMH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjMWUyOTNiJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+VG90YWw8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHtkYXRhPy5vdmVydmlldz8udG90YWxQcm9qZWN0cyB8fCAwfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAge2RhdGE/LnByb2plY3RTdGF0cz8uYnlTdGF0dXM/Lmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjRweCdcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46ICcwIDAgMjRweCAwJywgZm9udFNpemU6ICcxOHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIFByb2plY3QgU3RhdHVzIERpc3RyaWJ1dGlvblxyXG4gICAgICAgICAgICAgICAgPC9oMz5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4V3JhcDogJ3dyYXAnLCBnYXA6ICcxNnB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAge2RhdGEucHJvamVjdFN0YXRzLmJ5U3RhdHVzLm1hcCgoc3RhdHVzLCBpbmRleCkgPT4gKFxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpbmRleH0gc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEycHggMTZweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmYWZjJyxcclxuICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzhweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2UyZThmMCdcclxuICAgICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogc3RhdHVzLmNvbG9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICczcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5SaWdodDogJzhweCdcclxuICAgICAgICAgICAgICAgICAgICAgIH19PjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzUwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMuc3RhdHVzfToge3N0YXR1cy5jb3VudH1cclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKX1cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICl9XHJcblxyXG4gICAgICAgIHthY3RpdmVUYWIgPT09ICdmaW5hbmNpYWwnICYmIChcclxuICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgZGlzcGxheTogJ2dyaWQnLCBcclxuICAgICAgICAgICAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjAwcHgsIDFmcikpJywgXHJcbiAgICAgICAgICAgICAgZ2FwOiAnMTZweCcsXHJcbiAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMzJweCdcclxuICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5Ub3RhbCBSZXZlbnVlPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7Zm9ybWF0Q3VycmVuY3koZGF0YT8ub3ZlcnZpZXc/LnRvdGFsUmV2ZW51ZSB8fCAwKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+VHJhbnNhY3Rpb25zPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7KGRhdGE/Lm92ZXJ2aWV3Py50b3RhbFRyYW5zYWN0aW9ucyB8fCAwKS50b0xvY2FsZVN0cmluZygpfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5Nb250aGx5IFJldmVudWU8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHtmb3JtYXRDdXJyZW5jeShkYXRhPy5vdmVydmlldz8ubW9udGhseVJldmVudWUgfHwgMCl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PkF2ZyBUcmFuc2FjdGlvbjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAge2Zvcm1hdEN1cnJlbmN5KGRhdGE/Lm92ZXJ2aWV3Py5hdmdUcmFuc2FjdGlvbiB8fCAwKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxyXG4gICAgICAgICAgICAgIHBhZGRpbmc6ICcyNHB4J1xyXG4gICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICA8aDMgc3R5bGU9e3sgbWFyZ2luOiAnMCAwIDE2cHggMCcsIGZvbnRTaXplOiAnMThweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgRmluYW5jaWFsIE92ZXJ2aWV3XHJcbiAgICAgICAgICAgICAgPC9oMz5cclxuICAgICAgICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW46ICcwJywgY29sb3I6ICcjNmI3MjgwJywgZm9udFNpemU6ICcxNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIEZpbmFuY2lhbCBhbmFseXRpY3MgcHJvdmlkZSBpbnNpZ2h0cyBpbnRvIHJldmVudWUgdHJlbmRzLCBwYXltZW50IHBhdHRlcm5zLCBhbmQgdHJhbnNhY3Rpb24gZGF0YS5cclxuICAgICAgICAgICAgICAgIHtkYXRhPy5vdmVydmlldz8udG90YWxSZXZlbnVlID4gMCBcclxuICAgICAgICAgICAgICAgICAgPyBgIEN1cnJlbnQgdG90YWwgcmV2ZW51ZSBzdGFuZHMgYXQgJHtmb3JtYXRDdXJyZW5jeShkYXRhLm92ZXJ2aWV3LnRvdGFsUmV2ZW51ZSl9IGFjcm9zcyAkeyhkYXRhLm92ZXJ2aWV3LnRvdGFsVHJhbnNhY3Rpb25zIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9IHRyYW5zYWN0aW9ucy5gXHJcbiAgICAgICAgICAgICAgICAgIDogJyBObyBwYXltZW50IGRhdGEgYXZhaWxhYmxlIHlldC4nXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICl9XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxufSIsIkFkbWluSlMuVXNlckNvbXBvbmVudHMgPSB7fVxuaW1wb3J0IERhc2hib2FyZCBmcm9tICcuLi8uLi9mcm9udGVuZC9hZG1pbi1jb21wb25lbnRzL2Rhc2hib2FyZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuRGFzaGJvYXJkID0gRGFzaGJvYXJkXG5pbXBvcnQgQW5hbHl0aWNzIGZyb20gJy4uLy4uL2Zyb250ZW5kL2FkbWluLWNvbXBvbmVudHMvYW5hbHl0aWNzJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5BbmFseXRpY3MgPSBBbmFseXRpY3NcbmltcG9ydCBSZWxhdGVkTWF0ZXJpYWxzIGZyb20gJy4uLy4uL2Zyb250ZW5kL2FkbWluLWNvbXBvbmVudHMvY291cnNlLWNvbXBvbmVudHMnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlJlbGF0ZWRNYXRlcmlhbHMgPSBSZWxhdGVkTWF0ZXJpYWxzXG5pbXBvcnQgUmVsYXRlZEVucm9sbG1lbnRzIGZyb20gJy4uLy4uL2Zyb250ZW5kL2FkbWluLWNvbXBvbmVudHMvY291cnNlLWNvbXBvbmVudHMnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlJlbGF0ZWRFbnJvbGxtZW50cyA9IFJlbGF0ZWRFbnJvbGxtZW50cyJdLCJuYW1lcyI6WyJhcGkiLCJBcGlDbGllbnQiLCJDb3Vyc2VzTWFuYWdlbWVudCIsIm9uQmFjayIsImNvdXJzZXMiLCJzZXRDb3Vyc2VzIiwidXNlU3RhdGUiLCJtYXRlcmlhbHMiLCJzZXRNYXRlcmlhbHMiLCJlbnJvbGxtZW50cyIsInNldEVucm9sbG1lbnRzIiwibG9hZGluZyIsInNldExvYWRpbmciLCJhY3RpdmVUYWIiLCJzZXRBY3RpdmVUYWIiLCJzZWFyY2hUZXJtIiwic2V0U2VhcmNoVGVybSIsImZpbHRlclN0YXR1cyIsInNldEZpbHRlclN0YXR1cyIsIm1vdW50ZWRSZWYiLCJ1c2VSZWYiLCJmZXRjaEFsbERhdGEiLCJ1c2VDYWxsYmFjayIsImNvdXJzZXNSZXNwb25zZSIsInJlc291cmNlQWN0aW9uIiwicmVzb3VyY2VJZCIsImFjdGlvbk5hbWUiLCJjdXJyZW50IiwiZGF0YSIsInJlY29yZHMiLCJtYXRlcmlhbHNSZXNwb25zZSIsImVucm9sbG1lbnRzUmVzcG9uc2UiLCJlcnJvciIsImNvbnNvbGUiLCJ1c2VFZmZlY3QiLCJpbnRlcnZhbCIsInNldEludGVydmFsIiwiY2xlYXJJbnRlcnZhbCIsIlJlYWN0IiwiY3JlYXRlRWxlbWVudCIsInN0eWxlIiwiZGlzcGxheSIsImp1c3RpZnlDb250ZW50IiwiYWxpZ25JdGVtcyIsImhlaWdodCIsImZvbnRTaXplIiwiY29sb3IiLCJ0ZXh0QWxpZ24iLCJ3aWR0aCIsImJvcmRlciIsImJvcmRlclRvcCIsImJvcmRlclJhZGl1cyIsImFuaW1hdGlvbiIsIm1hcmdpbiIsImZpbHRlcmVkQ291cnNlcyIsImZpbHRlciIsImNvdXJzZSIsIm1hdGNoZXNTZWFyY2giLCJwYXJhbXMiLCJ0aXRsZSIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJkZXNjcmlwdGlvbiIsIm1hdGNoZXNTdGF0dXMiLCJzdGF0dXMiLCJmaWx0ZXJlZE1hdGVyaWFscyIsIm1hdGVyaWFsIiwiY291cnNlX3RpdGxlIiwiZmlsdGVyZWRFbnJvbGxtZW50cyIsImVucm9sbG1lbnQiLCJmcmVlbGFuY2VyX25hbWUiLCJmcmVlbGFuY2VyX2VtYWlsIiwiaGFuZGxlUmVmcmVzaCIsImhhbmRsZURlbGV0ZSIsInJlY29yZElkIiwiaXRlbU5hbWUiLCJjb25maXJtIiwiYWxlcnQiLCJjb250YWluZXJTdHlsZSIsImJhY2tncm91bmRDb2xvciIsIm1pbkhlaWdodCIsInBhZGRpbmciLCJmb250RmFtaWx5IiwiaGVhZGVyU3R5bGUiLCJtYXJnaW5Cb3R0b20iLCJwYWRkaW5nQm90dG9tIiwiYm9yZGVyQm90dG9tIiwidGFiU3R5bGUiLCJpc0FjdGl2ZSIsImJhY2tncm91bmQiLCJjdXJzb3IiLCJmb250V2VpZ2h0IiwidHJhbnNpdGlvbiIsIm1hcmdpblJpZ2h0Iiwic2VhcmNoQmFyU3R5bGUiLCJnYXAiLCJpbnB1dFN0eWxlIiwibWluV2lkdGgiLCJzZWxlY3RTdHlsZSIsImJ1dHRvblN0eWxlIiwidGV4dERlY29yYXRpb24iLCJyZWZyZXNoQnV0dG9uU3R5bGUiLCJzZWN0aW9uSGVhZGVyU3R5bGUiLCJjYXJkU3R5bGUiLCJib3hTaGFkb3ciLCJncmlkU3R5bGUiLCJncmlkVGVtcGxhdGVDb2x1bW5zIiwiZW1wdHlTdGF0ZVN0eWxlIiwiQ291cnNlc1NlY3Rpb24iLCJsZW5ndGgiLCJvbkNsaWNrIiwiaHJlZiIsInR5cGUiLCJwbGFjZWhvbGRlciIsInZhbHVlIiwib25DaGFuZ2UiLCJlIiwidGFyZ2V0IiwibWFwIiwia2V5IiwiaWQiLCJvbk1vdXNlT3ZlciIsImN1cnJlbnRUYXJnZXQiLCJ0cmFuc2Zvcm0iLCJvbk1vdXNlT3V0IiwibGluZUhlaWdodCIsInN1YnN0cmluZyIsImZsZXhXcmFwIiwicHJpY2UiLCJkdXJhdGlvbiIsInBhZGRpbmdUb3AiLCJNYXRlcmlhbHNTZWN0aW9uIiwiZmlsZV91cmwiLCJyZWwiLCJzcGxpdCIsInBvcCIsIkVucm9sbG1lbnRzU2VjdGlvbiIsImZyZWVsYW5jZXJfaWQiLCJlbnJvbGxlZF9hdCIsIkRhdGUiLCJ0b0xvY2FsZURhdGVTdHJpbmciLCJwcm9ncmVzcyIsIm92ZXJmbG93IiwiTWF0aCIsIm1pbiIsIkRhc2hib2FyZCIsInRyYW5zbGF0ZU1lc3NhZ2UiLCJ1c2VUcmFuc2xhdGlvbiIsInNldERhdGEiLCJzZXRFcnJvciIsImFkbWluTG9ncyIsInNldEFkbWluTG9ncyIsInVzZXJMb2dzIiwic2V0VXNlckxvZ3MiLCJjdXJyZW50VmlldyIsInNldEN1cnJlbnRWaWV3IiwiZmV0Y2hpbmdSZWYiLCJmZXRjaERhc2hib2FyZERhdGEiLCJyZXNwb25zZSIsImdldERhc2hib2FyZCIsImFsbExvZ3MiLCJyZWNlbnRMb2dzIiwiYWRtaW5zIiwibG9nIiwicm9sZV9pZCIsImZpcnN0X25hbWUiLCJzbGljZSIsInVzZXJzIiwiRXJyb3IiLCJlcnIiLCJtZXNzYWdlIiwicmVmcmVzaEludGVydmFsIiwibG9nSW50ZXJ2YWwiLCJmZXRjaCIsIm9rIiwibmV3TG9ncyIsImpzb24iLCJmbGV4RGlyZWN0aW9uIiwibWV0cmljcyIsInN0YXRzQ2FyZHMiLCJhZG1pbnNDb3VudCIsImxpbmsiLCJpY29uIiwiY2xpZW50c0NvdW50IiwiZnJlZWxhbmNlcnNDb3VudCIsInByb2plY3RzQ291bnQiLCJwZW5kaW5nQXBwb2ludG1lbnRzIiwiY291cnNlc0NvdW50IiwiYWN0aW9uIiwicGxhbnNDb3VudCIsInRvdGFsUmV2ZW51ZSIsInRvTG9jYWxlU3RyaW5nIiwiaGFuZGxlQ2FyZENsaWNrIiwiY2FyZCIsIndpbmRvdyIsImxvY2F0aW9uIiwiZ2V0VGltZUFnbyIsImRhdGVTdHJpbmciLCJub3ciLCJsb2dUaW1lIiwiZGlmZk1zIiwiZGlmZlNlY3MiLCJmbG9vciIsImRpZmZNaW5zIiwiZGlmZkhvdXJzIiwiZGlmZkRheXMiLCJtZXRyaWNzR3JpZFN0eWxlIiwicG9zaXRpb24iLCJjYXJkVGl0bGVTdHlsZSIsInRleHRUcmFuc2Zvcm0iLCJsZXR0ZXJTcGFjaW5nIiwiY2FyZFZhbHVlU3R5bGUiLCJjYXJkSWNvblN0eWxlIiwib3BhY2l0eSIsImxvZ3NDb250YWluZXJTdHlsZSIsImxvZ1NlY3Rpb25TdHlsZSIsImxvZ0hlYWRlclN0eWxlIiwibG9nSXRlbVN0eWxlIiwibG9nSXRlbU5hbWVTdHlsZSIsImxvZ0l0ZW1BY3Rpb25TdHlsZSIsImxvZ0l0ZW1UaW1lU3R5bGUiLCJmb250U3R5bGUiLCJ2aWV3Qm94IiwiZmlsbCIsInN0cm9rZSIsInN0cm9rZVdpZHRoIiwiZCIsImluZGV4IiwiYm9yZGVyQ29sb3IiLCJib3R0b20iLCJsZWZ0IiwicmlnaHQiLCJpIiwiY2xhc3NOYW1lIiwibGFzdF9uYW1lIiwiY3JlYXRlZF9hdCIsIkFuYWx5dGljcyIsImRhdGVSYW5nZSIsInNldERhdGVSYW5nZSIsImZldGNoQW5hbHl0aWNzRGF0YSIsImFuYWx5dGljc0RhdGEiLCJvdmVydmlldyIsImFwcG9pbnRtZW50cyIsImFwcG9pbnRtZW50U3RhdHMiLCJ0b3BGcmVlbGFuY2VycyIsInJlY2VudEFwcG9pbnRtZW50cyIsInVzZXJHcm93dGgiLCJ1c2VyRGlzdHJpYnV0aW9uIiwicmVjZW50VXNlcnMiLCJwcm9qZWN0U3RhdHMiLCJieVN0YXR1cyIsImZvcm1hdEN1cnJlbmN5IiwiYW1vdW50IiwiSW50bCIsIk51bWJlckZvcm1hdCIsImN1cnJlbmN5IiwiZm9ybWF0IiwiZm9ybWF0RGF0ZSIsIm1vbnRoIiwiZGF5IiwiZm9ybWF0UGVyY2VudGFnZSIsInRvRml4ZWQiLCJsYWJlbCIsInRhYiIsInRvdGFsVXNlcnMiLCJtYXJnaW5Ub3AiLCJuZXdVc2Vyc1RvZGF5IiwidG90YWxBcHBvaW50bWVudHMiLCJhcHBvaW50bWVudHNUb2RheSIsImFjdGl2ZVByb2plY3RzIiwiY29tcGxldGVkUHJvamVjdHMiLCJtb250aGx5UmV2ZW51ZSIsIm1heEhlaWdodCIsIm92ZXJmbG93WSIsImJvcmRlckNvbGxhcHNlIiwidG9wIiwiYXBwb2ludG1lbnQiLCJhcHBvaW50bWVudF90eXBlIiwiY2hhckF0IiwidG9VcHBlckNhc2UiLCJmcmVlbGFuY2VyX2ZpcnN0X25hbWUiLCJmcmVlbGFuY2VyX2xhc3RfbmFtZSIsImFjY2VwdGVkQXBwb2ludG1lbnRzIiwicmVqZWN0ZWRBcHBvaW50bWVudHMiLCJhY2NlcHRhbmNlUmF0ZSIsImZyZWVsYW5jZXIiLCJlbWFpbCIsInRvdGFsX2FwcG9pbnRtZW50cyIsImFjY2VwdGVkX2FwcG9pbnRtZW50cyIsImFjY2VwdGFuY2VfcmF0ZSIsInRvdGFsQ2xpZW50cyIsInRvdGFsRnJlZWxhbmNlcnMiLCJuZXdVc2Vyc01vbnRoIiwidXNlciIsImRyYWZ0UHJvamVjdHMiLCJ0b3RhbFByb2plY3RzIiwiY291bnQiLCJ0b3RhbFRyYW5zYWN0aW9ucyIsImF2Z1RyYW5zYWN0aW9uIiwiQWRtaW5KUyIsIlVzZXJDb21wb25lbnRzIiwiUmVsYXRlZE1hdGVyaWFscyIsIlJlbGF0ZWRFbnJvbGxtZW50cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztFQUFBO0VBSUEsTUFBTUEsS0FBRyxHQUFHLElBQUlDLGlCQUFTLEVBQUU7RUFFM0IsTUFBTUMsaUJBQWlCLEdBQUdBLENBQUM7RUFBRUMsRUFBQUE7RUFBTyxDQUFDLEtBQUs7SUFDeEMsTUFBTSxDQUFDQyxPQUFPLEVBQUVDLFVBQVUsQ0FBQyxHQUFHQyxjQUFRLENBQUMsRUFBRSxDQUFDO0lBQzFDLE1BQU0sQ0FBQ0MsU0FBUyxFQUFFQyxZQUFZLENBQUMsR0FBR0YsY0FBUSxDQUFDLEVBQUUsQ0FBQztJQUM5QyxNQUFNLENBQUNHLFdBQVcsRUFBRUMsY0FBYyxDQUFDLEdBQUdKLGNBQVEsQ0FBQyxFQUFFLENBQUM7SUFDbEQsTUFBTSxDQUFDSyxPQUFPLEVBQUVDLFVBQVUsQ0FBQyxHQUFHTixjQUFRLENBQUMsSUFBSSxDQUFDO0lBQzVDLE1BQU0sQ0FBQ08sU0FBUyxFQUFFQyxZQUFZLENBQUMsR0FBR1IsY0FBUSxDQUFDLFNBQVMsQ0FBQztJQUNyRCxNQUFNLENBQUNTLFVBQVUsRUFBRUMsYUFBYSxDQUFDLEdBQUdWLGNBQVEsQ0FBQyxFQUFFLENBQUM7SUFDaEQsTUFBTSxDQUFDVyxZQUFZLEVBQUVDLGVBQWUsQ0FBQyxHQUFHWixjQUFRLENBQUMsS0FBSyxDQUFDO0VBQ3ZELEVBQUEsTUFBTWEsVUFBVSxHQUFHQyxZQUFNLENBQUMsSUFBSSxDQUFDO0VBRS9CLEVBQUEsTUFBTUMsWUFBWSxHQUFHQyxpQkFBVyxDQUFDLFlBQVk7TUFDM0MsSUFBSTtRQUNGVixVQUFVLENBQUMsSUFBSSxDQUFDOztFQUVoQjtFQUNBLE1BQUEsTUFBTVcsZUFBZSxHQUFHLE1BQU12QixLQUFHLENBQUN3QixjQUFjLENBQUM7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
