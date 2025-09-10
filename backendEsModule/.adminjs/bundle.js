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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9mcm9udGVuZC9hZG1pbi1jb21wb25lbnRzL2NvdXJzZS1jb21wb25lbnRzLmpzeCIsIi4uLy4uL2Zyb250ZW5kL2FkbWluLWNvbXBvbmVudHMvZGFzaGJvYXJkLmpzeCIsIi4uLy4uL2Zyb250ZW5kL2FkbWluLWNvbXBvbmVudHMvYW5hbHl0aWNzLmpzeCIsImVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEFkbWluL2NvbXBvbmVudHMvQ291cnNlc01hbmFnZW1lbnQuanN4XHJcbmltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVN0YXRlLCB1c2VDYWxsYmFjaywgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XHJcbmltcG9ydCB7IEFwaUNsaWVudCB9IGZyb20gXCJhZG1pbmpzXCI7XHJcblxyXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KCk7XHJcblxyXG5jb25zdCBDb3Vyc2VzTWFuYWdlbWVudCA9ICh7IG9uQmFjayB9KSA9PiB7XHJcbiAgY29uc3QgW2NvdXJzZXMsIHNldENvdXJzZXNdID0gdXNlU3RhdGUoW10pO1xyXG4gIGNvbnN0IFttYXRlcmlhbHMsIHNldE1hdGVyaWFsc10gPSB1c2VTdGF0ZShbXSk7XHJcbiAgY29uc3QgW2Vucm9sbG1lbnRzLCBzZXRFbnJvbGxtZW50c10gPSB1c2VTdGF0ZShbXSk7XHJcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XHJcbiAgY29uc3QgW2FjdGl2ZVRhYiwgc2V0QWN0aXZlVGFiXSA9IHVzZVN0YXRlKCdjb3Vyc2VzJyk7XHJcbiAgY29uc3QgW3NlYXJjaFRlcm0sIHNldFNlYXJjaFRlcm1dID0gdXNlU3RhdGUoJycpO1xyXG4gIGNvbnN0IFtmaWx0ZXJTdGF0dXMsIHNldEZpbHRlclN0YXR1c10gPSB1c2VTdGF0ZSgnYWxsJyk7XHJcbiAgY29uc3QgbW91bnRlZFJlZiA9IHVzZVJlZih0cnVlKTtcclxuXHJcbiAgY29uc3QgZmV0Y2hBbGxEYXRhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgc2V0TG9hZGluZyh0cnVlKTtcclxuICAgICAgXHJcbiAgICAgIC8vIEZldGNoIGNvdXJzZXNcclxuICAgICAgY29uc3QgY291cnNlc1Jlc3BvbnNlID0gYXdhaXQgYXBpLnJlc291cmNlQWN0aW9uKHtcclxuICAgICAgICByZXNvdXJjZUlkOiAnY291cnNlcycsXHJcbiAgICAgICAgYWN0aW9uTmFtZTogJ2xpc3QnXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAobW91bnRlZFJlZi5jdXJyZW50KSB7XHJcbiAgICAgICAgc2V0Q291cnNlcyhjb3Vyc2VzUmVzcG9uc2UuZGF0YT8ucmVjb3JkcyB8fCBbXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEZldGNoIG1hdGVyaWFsc1xyXG4gICAgICBjb25zdCBtYXRlcmlhbHNSZXNwb25zZSA9IGF3YWl0IGFwaS5yZXNvdXJjZUFjdGlvbih7XHJcbiAgICAgICAgcmVzb3VyY2VJZDogJ2NvdXJzZV9tYXRlcmlhbHMnLFxyXG4gICAgICAgIGFjdGlvbk5hbWU6ICdsaXN0J1xyXG4gICAgICB9KTtcclxuICAgICAgaWYgKG1vdW50ZWRSZWYuY3VycmVudCkge1xyXG4gICAgICAgIHNldE1hdGVyaWFscyhtYXRlcmlhbHNSZXNwb25zZS5kYXRhPy5yZWNvcmRzIHx8IFtdKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRmV0Y2ggZW5yb2xsbWVudHNcclxuICAgICAgY29uc3QgZW5yb2xsbWVudHNSZXNwb25zZSA9IGF3YWl0IGFwaS5yZXNvdXJjZUFjdGlvbih7XHJcbiAgICAgICAgcmVzb3VyY2VJZDogJ2NvdXJzZV9lbnJvbGxtZW50cycsXHJcbiAgICAgICAgYWN0aW9uTmFtZTogJ2xpc3QnXHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAobW91bnRlZFJlZi5jdXJyZW50KSB7XHJcbiAgICAgICAgc2V0RW5yb2xsbWVudHMoZW5yb2xsbWVudHNSZXNwb25zZS5kYXRhPy5yZWNvcmRzIHx8IFtdKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBmZXRjaCBkYXRhOicsIGVycm9yKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIGlmIChtb3VudGVkUmVmLmN1cnJlbnQpIHtcclxuICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sIFtdKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIG1vdW50ZWRSZWYuY3VycmVudCA9IHRydWU7XHJcbiAgICBmZXRjaEFsbERhdGEoKTtcclxuICAgIFxyXG4gICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgbW91bnRlZFJlZi5jdXJyZW50ID0gZmFsc2U7XHJcbiAgICB9O1xyXG4gIH0sIFtmZXRjaEFsbERhdGFdKTtcclxuXHJcbiAgLy8gQXV0by1yZWZyZXNoIGRhdGEgZXZlcnkgMzAgc2Vjb25kc1xyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgaWYgKG1vdW50ZWRSZWYuY3VycmVudCkge1xyXG4gICAgICAgIGZldGNoQWxsRGF0YSgpO1xyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMCk7XHJcblxyXG4gICAgcmV0dXJuICgpID0+IGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xyXG4gIH0sIFtmZXRjaEFsbERhdGFdKTtcclxuXHJcbiAgaWYgKGxvYWRpbmcpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgZGlzcGxheTogJ2ZsZXgnLCBcclxuICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIFxyXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLCBcclxuICAgICAgICBoZWlnaHQ6ICc0MDBweCcsXHJcbiAgICAgICAgZm9udFNpemU6ICcxNnB4JyxcclxuICAgICAgICBjb2xvcjogJyM2YjcyODAnXHJcbiAgICAgIH19PlxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgdGV4dEFsaWduOiAnY2VudGVyJyB9fT5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgIHdpZHRoOiAnNDBweCcsIFxyXG4gICAgICAgICAgICBoZWlnaHQ6ICc0MHB4JywgXHJcbiAgICAgICAgICAgIGJvcmRlcjogJzRweCBzb2xpZCAjZTVlN2ViJyxcclxuICAgICAgICAgICAgYm9yZGVyVG9wOiAnNHB4IHNvbGlkICMzYjgyZjYnLFxyXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnLFxyXG4gICAgICAgICAgICBhbmltYXRpb246ICdzcGluIDFzIGxpbmVhciBpbmZpbml0ZScsXHJcbiAgICAgICAgICAgIG1hcmdpbjogJzAgYXV0byAxNnB4J1xyXG4gICAgICAgICAgfX0+PC9kaXY+XHJcbiAgICAgICAgICBMb2FkaW5nIGNvdXJzZXMgZGF0YS4uLlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyBGaWx0ZXIgY291cnNlcyBiYXNlZCBvbiBzZWFyY2ggYW5kIHN0YXR1c1xyXG4gIGNvbnN0IGZpbHRlcmVkQ291cnNlcyA9IGNvdXJzZXMuZmlsdGVyKGNvdXJzZSA9PiB7XHJcbiAgICBjb25zdCBtYXRjaGVzU2VhcmNoID0gIXNlYXJjaFRlcm0gfHwgXHJcbiAgICAgIChjb3Vyc2UucGFyYW1zPy50aXRsZSB8fCAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXJtLnRvTG93ZXJDYXNlKCkpIHx8XHJcbiAgICAgIChjb3Vyc2UucGFyYW1zPy5kZXNjcmlwdGlvbiB8fCAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXJtLnRvTG93ZXJDYXNlKCkpO1xyXG4gICAgXHJcbiAgICBjb25zdCBtYXRjaGVzU3RhdHVzID0gZmlsdGVyU3RhdHVzID09PSAnYWxsJyB8fCBcclxuICAgICAgKGNvdXJzZS5wYXJhbXM/LnN0YXR1cyB8fCAnZHJhZnQnKSA9PT0gZmlsdGVyU3RhdHVzO1xyXG4gICAgXHJcbiAgICByZXR1cm4gbWF0Y2hlc1NlYXJjaCAmJiBtYXRjaGVzU3RhdHVzO1xyXG4gIH0pO1xyXG5cclxuICAvLyBGaWx0ZXIgbWF0ZXJpYWxzIGJhc2VkIG9uIHNlYXJjaFxyXG4gIGNvbnN0IGZpbHRlcmVkTWF0ZXJpYWxzID0gbWF0ZXJpYWxzLmZpbHRlcihtYXRlcmlhbCA9PiB7XHJcbiAgICBjb25zdCBtYXRjaGVzU2VhcmNoID0gIXNlYXJjaFRlcm0gfHwgXHJcbiAgICAgIChtYXRlcmlhbC5wYXJhbXM/LnRpdGxlIHx8ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRlcm0udG9Mb3dlckNhc2UoKSkgfHxcclxuICAgICAgKG1hdGVyaWFsLnBhcmFtcz8uY291cnNlX3RpdGxlIHx8ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRlcm0udG9Mb3dlckNhc2UoKSk7XHJcbiAgICBcclxuICAgIHJldHVybiBtYXRjaGVzU2VhcmNoO1xyXG4gIH0pO1xyXG5cclxuICAvLyBGaWx0ZXIgZW5yb2xsbWVudHMgYmFzZWQgb24gc2VhcmNoXHJcbiAgY29uc3QgZmlsdGVyZWRFbnJvbGxtZW50cyA9IGVucm9sbG1lbnRzLmZpbHRlcihlbnJvbGxtZW50ID0+IHtcclxuICAgIGNvbnN0IG1hdGNoZXNTZWFyY2ggPSAhc2VhcmNoVGVybSB8fCBcclxuICAgICAgKGVucm9sbG1lbnQucGFyYW1zPy5mcmVlbGFuY2VyX25hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoVGVybS50b0xvd2VyQ2FzZSgpKSB8fFxyXG4gICAgICAoZW5yb2xsbWVudC5wYXJhbXM/LmZyZWVsYW5jZXJfZW1haWwgfHwgJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoVGVybS50b0xvd2VyQ2FzZSgpKSB8fFxyXG4gICAgICAoZW5yb2xsbWVudC5wYXJhbXM/LmNvdXJzZV90aXRsZSB8fCAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXJtLnRvTG93ZXJDYXNlKCkpO1xyXG4gICAgXHJcbiAgICByZXR1cm4gbWF0Y2hlc1NlYXJjaDtcclxuICB9KTtcclxuXHJcbiAgY29uc3QgaGFuZGxlUmVmcmVzaCA9ICgpID0+IHtcclxuICAgIGZldGNoQWxsRGF0YSgpO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGhhbmRsZURlbGV0ZSA9IGFzeW5jIChyZXNvdXJjZUlkLCByZWNvcmRJZCwgaXRlbU5hbWUpID0+IHtcclxuICAgIGlmIChjb25maXJtKGBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgJHtpdGVtTmFtZX0/IFRoaXMgYWN0aW9uIGNhbm5vdCBiZSB1bmRvbmUuYCkpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBhcGkucmVzb3VyY2VBY3Rpb24oe1xyXG4gICAgICAgICAgcmVzb3VyY2VJZCxcclxuICAgICAgICAgIGFjdGlvbk5hbWU6ICdkZWxldGUnLFxyXG4gICAgICAgICAgcmVjb3JkSWRcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBSZWZyZXNoIGRhdGEgYWZ0ZXIgZGVsZXRpb25cclxuICAgICAgICBmZXRjaEFsbERhdGEoKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gZGVsZXRlICR7aXRlbU5hbWV9OmAsIGVycm9yKTtcclxuICAgICAgICBhbGVydChgRmFpbGVkIHRvIGRlbGV0ZSAke2l0ZW1OYW1lfS4gUGxlYXNlIHRyeSBhZ2Fpbi5gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vIFN0eWxlc1xyXG4gIGNvbnN0IGNvbnRhaW5lclN0eWxlID0ge1xyXG4gICAgYmFja2dyb3VuZENvbG9yOiAnI2ZmZmZmZicsXHJcbiAgICBtaW5IZWlnaHQ6ICcxMDB2aCcsXHJcbiAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICBmb250RmFtaWx5OiAnLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBcIlNlZ29lIFVJXCIsIFJvYm90bywgXCJIZWx2ZXRpY2EgTmV1ZVwiLCBBcmlhbCwgc2Fucy1zZXJpZidcclxuICB9O1xyXG5cclxuICBjb25zdCBoZWFkZXJTdHlsZSA9IHtcclxuICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsXHJcbiAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgIG1hcmdpbkJvdHRvbTogJzMwcHgnLFxyXG4gICAgcGFkZGluZ0JvdHRvbTogJzIwcHgnLFxyXG4gICAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgdGFiU3R5bGUgPSAoaXNBY3RpdmUpID0+ICh7XHJcbiAgICBwYWRkaW5nOiAnMTJweCAyNHB4JyxcclxuICAgIGJhY2tncm91bmQ6IGlzQWN0aXZlID8gJyMzYjgyZjYnIDogJyNmOGY5ZmEnLFxyXG4gICAgY29sb3I6IGlzQWN0aXZlID8gJ3doaXRlJyA6ICcjNmI3MjgwJyxcclxuICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcclxuICAgIGJvcmRlclJhZGl1czogJzZweCcsXHJcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgIGZvbnRTaXplOiAnMTRweCcsXHJcbiAgICBmb250V2VpZ2h0OiAnNTAwJyxcclxuICAgIHRyYW5zaXRpb246ICdhbGwgMC4ycycsXHJcbiAgICBtYXJnaW5SaWdodDogJzhweCdcclxuICB9KTtcclxuXHJcbiAgY29uc3Qgc2VhcmNoQmFyU3R5bGUgPSB7XHJcbiAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICBnYXA6ICcxMnB4JyxcclxuICAgIG1hcmdpbkJvdHRvbTogJzIwcHgnLFxyXG4gICAgYWxpZ25JdGVtczogJ2NlbnRlcidcclxuICB9O1xyXG5cclxuICBjb25zdCBpbnB1dFN0eWxlID0ge1xyXG4gICAgcGFkZGluZzogJzhweCAxMnB4JyxcclxuICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcclxuICAgIGJvcmRlclJhZGl1czogJzZweCcsXHJcbiAgICBmb250U2l6ZTogJzE0cHgnLFxyXG4gICAgbWluV2lkdGg6ICcyMDBweCdcclxuICB9O1xyXG5cclxuICBjb25zdCBzZWxlY3RTdHlsZSA9IHtcclxuICAgIHBhZGRpbmc6ICc4cHggMTJweCcsXHJcbiAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxyXG4gICAgZm9udFNpemU6ICcxNHB4JyxcclxuICAgIGJhY2tncm91bmQ6ICd3aGl0ZSdcclxuICB9O1xyXG5cclxuICBjb25zdCBidXR0b25TdHlsZSA9IHtcclxuICAgIGJhY2tncm91bmQ6ICcjMTBiOTgxJyxcclxuICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgcGFkZGluZzogJzhweCAxNnB4JyxcclxuICAgIGJvcmRlclJhZGl1czogJzZweCcsXHJcbiAgICB0ZXh0RGVjb3JhdGlvbjogJ25vbmUnLFxyXG4gICAgZm9udFNpemU6ICcxNHB4JyxcclxuICAgIGZvbnRXZWlnaHQ6ICc1MDAnLFxyXG4gICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgIGRpc3BsYXk6ICdpbmxpbmUtZmxleCcsXHJcbiAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgIGdhcDogJzhweCdcclxuICB9O1xyXG5cclxuICBjb25zdCByZWZyZXNoQnV0dG9uU3R5bGUgPSB7XHJcbiAgICBiYWNrZ3JvdW5kOiAnI2Y4ZjlmYScsXHJcbiAgICBjb2xvcjogJyMzNzQxNTEnLFxyXG4gICAgcGFkZGluZzogJzhweCAxMnB4JyxcclxuICAgIGJvcmRlclJhZGl1czogJzZweCcsXHJcbiAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgIGZvbnRTaXplOiAnMTRweCdcclxuICB9O1xyXG5cclxuICBjb25zdCBzZWN0aW9uSGVhZGVyU3R5bGUgPSB7XHJcbiAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLFxyXG4gICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICBtYXJnaW5Cb3R0b206ICcyMHB4J1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGNhcmRTdHlsZSA9IHtcclxuICAgIGJhY2tncm91bmQ6ICd3aGl0ZScsXHJcbiAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICBib3JkZXJSYWRpdXM6ICc4cHgnLFxyXG4gICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgbWFyZ2luQm90dG9tOiAnMTZweCcsXHJcbiAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLCAwLCAwLCAwLjEpJyxcclxuICAgIHRyYW5zaXRpb246ICdhbGwgMC4ycyBlYXNlJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGdyaWRTdHlsZSA9IHtcclxuICAgIGRpc3BsYXk6ICdncmlkJyxcclxuICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maWxsLCBtaW5tYXgoMzUwcHgsIDFmcikpJyxcclxuICAgIGdhcDogJzIwcHgnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZW1wdHlTdGF0ZVN0eWxlID0ge1xyXG4gICAgYmFja2dyb3VuZDogJyNmOGY5ZmEnLFxyXG4gICAgcGFkZGluZzogJzYwcHgnLFxyXG4gICAgYm9yZGVyUmFkaXVzOiAnOHB4JyxcclxuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICBjb2xvcjogJyM2YjcyODAnXHJcbiAgfTtcclxuXHJcbiAgLy8gQ291cnNlcyBTZWN0aW9uIENvbXBvbmVudFxyXG4gIGNvbnN0IENvdXJzZXNTZWN0aW9uID0gKCkgPT4gKFxyXG4gICAgPGRpdj5cclxuICAgICAgPGRpdiBzdHlsZT17c2VjdGlvbkhlYWRlclN0eWxlfT5cclxuICAgICAgICA8aDIgc3R5bGU9e3sgZm9udFNpemU6ICcyMHB4JywgZm9udFdlaWdodDogJzYwMCcsIG1hcmdpbjogMCwgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgIENvdXJzZXMgKHtmaWx0ZXJlZENvdXJzZXMubGVuZ3RofSlcclxuICAgICAgICA8L2gyPlxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICcxMnB4JyB9fT5cclxuICAgICAgICAgIDxidXR0b24gb25DbGljaz17aGFuZGxlUmVmcmVzaH0gc3R5bGU9e3JlZnJlc2hCdXR0b25TdHlsZX0+XHJcbiAgICAgICAgICAgIPCflIQgUmVmcmVzaFxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8YSBcclxuICAgICAgICAgICAgaHJlZj1cIi9hZG1pbi9yZXNvdXJjZXMvY291cnNlcy9hY3Rpb25zL25ld1wiXHJcbiAgICAgICAgICAgIHN0eWxlPXtidXR0b25TdHlsZX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgKyBBZGQgQ291cnNlXHJcbiAgICAgICAgICA8L2E+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdiBzdHlsZT17c2VhcmNoQmFyU3R5bGV9PlxyXG4gICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgdHlwZT1cInRleHRcIlxyXG4gICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2ggY291cnNlcy4uLlwiXHJcbiAgICAgICAgICB2YWx1ZT17c2VhcmNoVGVybX1cclxuICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0U2VhcmNoVGVybShlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICBzdHlsZT17aW5wdXRTdHlsZX1cclxuICAgICAgICAvPlxyXG4gICAgICAgIDxzZWxlY3RcclxuICAgICAgICAgIHZhbHVlPXtmaWx0ZXJTdGF0dXN9XHJcbiAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldEZpbHRlclN0YXR1cyhlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICBzdHlsZT17c2VsZWN0U3R5bGV9XHJcbiAgICAgICAgPlxyXG4gICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImFsbFwiPkFsbCBTdGF0dXM8L29wdGlvbj5cclxuICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJhY3RpdmVcIj5BY3RpdmU8L29wdGlvbj5cclxuICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJkcmFmdFwiPkRyYWZ0PC9vcHRpb24+XHJcbiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiYXJjaGl2ZWRcIj5BcmNoaXZlZDwvb3B0aW9uPlxyXG4gICAgICAgIDwvc2VsZWN0PlxyXG4gICAgICAgIHsoc2VhcmNoVGVybSB8fCBmaWx0ZXJTdGF0dXMgIT09ICdhbGwnKSAmJiAoXHJcbiAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcclxuICAgICAgICAgICAgICBzZXRTZWFyY2hUZXJtKCcnKTtcclxuICAgICAgICAgICAgICBzZXRGaWx0ZXJTdGF0dXMoJ2FsbCcpO1xyXG4gICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgIC4uLnJlZnJlc2hCdXR0b25TdHlsZSxcclxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2VmNDQ0NCcsXHJcbiAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZSdcclxuICAgICAgICAgICAgfX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgQ2xlYXIgRmlsdGVyc1xyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgKX1cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICB7ZmlsdGVyZWRDb3Vyc2VzLmxlbmd0aCA9PT0gMCA/IChcclxuICAgICAgICA8ZGl2IHN0eWxlPXtlbXB0eVN0YXRlU3R5bGV9PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzQ4cHgnLCBtYXJnaW5Cb3R0b206ICcxNnB4JyB9fT7wn5OaPC9kaXY+XHJcbiAgICAgICAgICA8aDMgc3R5bGU9e3sgbWFyZ2luOiAnMCAwIDEycHggMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgIHtzZWFyY2hUZXJtIHx8IGZpbHRlclN0YXR1cyAhPT0gJ2FsbCcgPyAnTm8gY291cnNlcyBtYXRjaCB5b3VyIGZpbHRlcnMnIDogJ05vIGNvdXJzZXMgY3JlYXRlZCB5ZXQnfVxyXG4gICAgICAgICAgPC9oMz5cclxuICAgICAgICAgIDxwIHN0eWxlPXt7IG1hcmdpbjogJzAgMCAyNHB4IDAnLCBmb250U2l6ZTogJzE2cHgnIH19PlxyXG4gICAgICAgICAgICB7c2VhcmNoVGVybSB8fCBmaWx0ZXJTdGF0dXMgIT09ICdhbGwnIFxyXG4gICAgICAgICAgICAgID8gJ1RyeSBhZGp1c3RpbmcgeW91ciBzZWFyY2ggdGVybXMgb3IgZmlsdGVycydcclxuICAgICAgICAgICAgICA6ICdDcmVhdGUgeW91ciBmaXJzdCBjb3Vyc2UgdG8gZ2V0IHN0YXJ0ZWQgd2l0aCBjb3Vyc2UgbWFuYWdlbWVudCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgeyghc2VhcmNoVGVybSAmJiBmaWx0ZXJTdGF0dXMgPT09ICdhbGwnKSAmJiAoXHJcbiAgICAgICAgICAgIDxhIFxyXG4gICAgICAgICAgICAgIGhyZWY9XCIvYWRtaW4vcmVzb3VyY2VzL2NvdXJzZXMvYWN0aW9ucy9uZXdcIlxyXG4gICAgICAgICAgICAgIHN0eWxlPXt7Li4uYnV0dG9uU3R5bGUsIHRleHREZWNvcmF0aW9uOiAnbm9uZSd9fVxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgQ3JlYXRlIFlvdXIgRmlyc3QgQ291cnNlXHJcbiAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICkgOiAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17Z3JpZFN0eWxlfT5cclxuICAgICAgICAgIHtmaWx0ZXJlZENvdXJzZXMubWFwKChjb3Vyc2UpID0+IChcclxuICAgICAgICAgICAgPGRpdiBcclxuICAgICAgICAgICAgICBrZXk9e2NvdXJzZS5pZH0gXHJcbiAgICAgICAgICAgICAgc3R5bGU9e2NhcmRTdHlsZX1cclxuICAgICAgICAgICAgICBvbk1vdXNlT3Zlcj17KGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGUuY3VycmVudFRhcmdldC5zdHlsZS5ib3hTaGFkb3cgPSAnMCA0cHggMTJweCByZ2JhKDAsIDAsIDAsIDAuMTUpJztcclxuICAgICAgICAgICAgICAgIGUuY3VycmVudFRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgtMnB4KSc7XHJcbiAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICBvbk1vdXNlT3V0PXsoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJveFNoYWRvdyA9ICcwIDFweCAzcHggcmdiYSgwLCAwLCAwLCAwLjEpJztcclxuICAgICAgICAgICAgICAgIGUuY3VycmVudFRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgwKSc7XHJcbiAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnMTZweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8aDMgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMjBweCcsIFxyXG4gICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNjAwJywgXHJcbiAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzAgMCA4cHggMCcsXHJcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzFlMjkzYicsXHJcbiAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6ICcxLjMnXHJcbiAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAge2NvdXJzZS5wYXJhbXM/LnRpdGxlIHx8IGBDb3Vyc2UgIyR7Y291cnNlLmlkfWB9XHJcbiAgICAgICAgICAgICAgICA8L2gzPlxyXG4gICAgICAgICAgICAgICAgPHAgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzZiNzI4MCcsIFxyXG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE0cHgnLCBcclxuICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnMCAwIDEycHggMCcsXHJcbiAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6ICcxLjUnXHJcbiAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAge2NvdXJzZS5wYXJhbXM/LmRlc2NyaXB0aW9uID8gXHJcbiAgICAgICAgICAgICAgICAgICAgKGNvdXJzZS5wYXJhbXMuZGVzY3JpcHRpb24ubGVuZ3RoID4gMTIwID8gXHJcbiAgICAgICAgICAgICAgICAgICAgICBjb3Vyc2UucGFyYW1zLmRlc2NyaXB0aW9uLnN1YnN0cmluZygwLCAxMjApICsgJy4uLicgOiBcclxuICAgICAgICAgICAgICAgICAgICAgIGNvdXJzZS5wYXJhbXMuZGVzY3JpcHRpb25cclxuICAgICAgICAgICAgICAgICAgICApIDogXHJcbiAgICAgICAgICAgICAgICAgICAgJ05vIGRlc2NyaXB0aW9uIGF2YWlsYWJsZSdcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnOHB4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGZsZXhXcmFwOiAnd3JhcCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogY291cnNlLnBhcmFtcz8uc3RhdHVzID09PSAnYWN0aXZlJyA/ICcjZGNmY2U3JyA6IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291cnNlLnBhcmFtcz8uc3RhdHVzID09PSAnYXJjaGl2ZWQnID8gJyNmZWYzYzcnIDogJyNmM2Y0ZjYnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBjb3Vyc2UucGFyYW1zPy5zdGF0dXMgPT09ICdhY3RpdmUnID8gJyMxNjY1MzQnIDogXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdXJzZS5wYXJhbXM/LnN0YXR1cyA9PT0gJ2FyY2hpdmVkJyA/ICcjOTI0MDBlJyA6ICcjMzc0MTUxJyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNHB4IDhweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNHB4JyxcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc1MDAnXHJcbiAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIHtjb3Vyc2UucGFyYW1zPy5zdGF0dXMgfHwgJ0RyYWZ0J31cclxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAge2NvdXJzZS5wYXJhbXM/LnByaWNlICYmIChcclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNkYmVhZmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjMWU0MGFmJyxcclxuICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc0cHggOHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzRweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzUwMCdcclxuICAgICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICR7Y291cnNlLnBhcmFtcy5wcmljZX1cclxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICB7Y291cnNlLnBhcmFtcz8uZHVyYXRpb24gJiYgKFxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2VjZmRmNScsXHJcbiAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyMxNjY1MzQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzRweCA4cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNTAwJ1xyXG4gICAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAge2NvdXJzZS5wYXJhbXMuZHVyYXRpb259XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JywgXHJcbiAgICAgICAgICAgICAgICBnYXA6ICc4cHgnLCBcclxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnZmxleC1lbmQnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyVG9wOiAnMXB4IHNvbGlkICNmMWYzZjQnLFxyXG4gICAgICAgICAgICAgICAgcGFkZGluZ1RvcDogJzE2cHgnXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8YVxyXG4gICAgICAgICAgICAgICAgICBocmVmPXtgL2FkbWluL3Jlc291cmNlcy9jb3Vyc2VzL3JlY29yZHMvJHtjb3Vyc2UuaWR9L3Nob3dgfVxyXG4gICAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZjhmOWZhJyxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyMzNzQxNTEnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc4cHggMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNHB4JyxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0RGVjb3JhdGlvbjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc1MDAnXHJcbiAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIPCfkYHvuI8gVmlld1xyXG4gICAgICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICAgICAgPGFcclxuICAgICAgICAgICAgICAgICAgaHJlZj17YC9hZG1pbi9yZXNvdXJjZXMvY291cnNlcy9yZWNvcmRzLyR7Y291cnNlLmlkfS9lZGl0YH1cclxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzNiODJmNicsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzhweCAxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc0cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHREZWNvcmF0aW9uOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNTAwJ1xyXG4gICAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICDinI/vuI8gRWRpdFxyXG4gICAgICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBoYW5kbGVEZWxldGUoJ2NvdXJzZXMnLCBjb3Vyc2UuaWQsICdjb3Vyc2UnKX1cclxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2VmNDQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzhweCAxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc0cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzUwMCdcclxuICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAg8J+Xke+4jyBEZWxldGVcclxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICkpfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxuXHJcbiAgLy8gTWF0ZXJpYWxzIFNlY3Rpb24gQ29tcG9uZW50XHJcbiAgY29uc3QgTWF0ZXJpYWxzU2VjdGlvbiA9ICgpID0+IChcclxuICAgIDxkaXY+XHJcbiAgICAgIDxkaXYgc3R5bGU9e3NlY3Rpb25IZWFkZXJTdHlsZX0+XHJcbiAgICAgICAgPGgyIHN0eWxlPXt7IGZvbnRTaXplOiAnMjBweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBtYXJnaW46IDAsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICBDb3Vyc2UgTWF0ZXJpYWxzICh7ZmlsdGVyZWRNYXRlcmlhbHMubGVuZ3RofSlcclxuICAgICAgICA8L2gyPlxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICcxMnB4JyB9fT5cclxuICAgICAgICAgIDxidXR0b24gb25DbGljaz17aGFuZGxlUmVmcmVzaH0gc3R5bGU9e3JlZnJlc2hCdXR0b25TdHlsZX0+XHJcbiAgICAgICAgICAgIPCflIQgUmVmcmVzaFxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8YSBcclxuICAgICAgICAgICAgaHJlZj1cIi9hZG1pbi9yZXNvdXJjZXMvY291cnNlX21hdGVyaWFscy9hY3Rpb25zL25ld1wiXHJcbiAgICAgICAgICAgIHN0eWxlPXtidXR0b25TdHlsZX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgKyBBZGQgTWF0ZXJpYWxcclxuICAgICAgICAgIDwvYT5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICA8ZGl2IHN0eWxlPXtzZWFyY2hCYXJTdHlsZX0+XHJcbiAgICAgICAgPGlucHV0XHJcbiAgICAgICAgICB0eXBlPVwidGV4dFwiXHJcbiAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlYXJjaCBtYXRlcmlhbHMuLi5cIlxyXG4gICAgICAgICAgdmFsdWU9e3NlYXJjaFRlcm19XHJcbiAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldFNlYXJjaFRlcm0oZS50YXJnZXQudmFsdWUpfVxyXG4gICAgICAgICAgc3R5bGU9e2lucHV0U3R5bGV9XHJcbiAgICAgICAgLz5cclxuICAgICAgICB7c2VhcmNoVGVybSAmJiAoXHJcbiAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNlYXJjaFRlcm0oJycpfVxyXG4gICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgIC4uLnJlZnJlc2hCdXR0b25TdHlsZSxcclxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2VmNDQ0NCcsXHJcbiAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZSdcclxuICAgICAgICAgICAgfX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgQ2xlYXIgU2VhcmNoXHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICApfVxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIHtmaWx0ZXJlZE1hdGVyaWFscy5sZW5ndGggPT09IDAgPyAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17ZW1wdHlTdGF0ZVN0eWxlfT5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICc0OHB4JywgbWFyZ2luQm90dG9tOiAnMTZweCcgfX0+8J+ThDwvZGl2PlxyXG4gICAgICAgICAgPGgzIHN0eWxlPXt7IG1hcmdpbjogJzAgMCAxMnB4IDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICB7c2VhcmNoVGVybSA/ICdObyBtYXRlcmlhbHMgbWF0Y2ggeW91ciBzZWFyY2gnIDogJ05vIGNvdXJzZSBtYXRlcmlhbHMgdXBsb2FkZWQgeWV0J31cclxuICAgICAgICAgIDwvaDM+XHJcbiAgICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW46ICcwIDAgMjRweCAwJywgZm9udFNpemU6ICcxNnB4JyB9fT5cclxuICAgICAgICAgICAge3NlYXJjaFRlcm0gXHJcbiAgICAgICAgICAgICAgPyAnVHJ5IGRpZmZlcmVudCBzZWFyY2ggdGVybXMnXHJcbiAgICAgICAgICAgICAgOiAnVXBsb2FkIG1hdGVyaWFscyBsaWtlIFBERnMsIHZpZGVvcywgYW5kIGRvY3VtZW50cyBmb3IgeW91ciBjb3Vyc2VzJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICB7IXNlYXJjaFRlcm0gJiYgKFxyXG4gICAgICAgICAgICA8YSBcclxuICAgICAgICAgICAgICBocmVmPVwiL2FkbWluL3Jlc291cmNlcy9jb3Vyc2VfbWF0ZXJpYWxzL2FjdGlvbnMvbmV3XCJcclxuICAgICAgICAgICAgICBzdHlsZT17ey4uLmJ1dHRvblN0eWxlLCB0ZXh0RGVjb3JhdGlvbjogJ25vbmUnfX1cclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIFVwbG9hZCBGaXJzdCBNYXRlcmlhbFxyXG4gICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApIDogKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e2dyaWRTdHlsZX0+XHJcbiAgICAgICAgICB7ZmlsdGVyZWRNYXRlcmlhbHMubWFwKChtYXRlcmlhbCkgPT4gKFxyXG4gICAgICAgICAgICA8ZGl2IGtleT17bWF0ZXJpYWwuaWR9IHN0eWxlPXtjYXJkU3R5bGV9PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnMTZweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8aDMgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMThweCcsIFxyXG4gICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNjAwJywgXHJcbiAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzAgMCA4cHggMCcsXHJcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzFlMjkzYidcclxuICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICB7bWF0ZXJpYWwucGFyYW1zPy50aXRsZSB8fCBgTWF0ZXJpYWwgIyR7bWF0ZXJpYWwuaWR9YH1cclxuICAgICAgICAgICAgICAgIDwvaDM+XHJcbiAgICAgICAgICAgICAgICA8cCBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgY29sb3I6ICcjNmI3MjgwJywgXHJcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTRweCcsIFxyXG4gICAgICAgICAgICAgICAgICBtYXJnaW46ICcwIDAgOHB4IDAnXHJcbiAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgQ291cnNlOiB7bWF0ZXJpYWwucGFyYW1zPy5jb3Vyc2VfdGl0bGUgfHwgJ1Vua25vd24gQ291cnNlJ31cclxuICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAge21hdGVyaWFsLnBhcmFtcz8uZGVzY3JpcHRpb24gJiYgKFxyXG4gICAgICAgICAgICAgICAgICA8cCBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyM2YjcyODAnLCBcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE0cHgnLCBcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICcwIDAgMTJweCAwJyxcclxuICAgICAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiAnMS40J1xyXG4gICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICB7bWF0ZXJpYWwucGFyYW1zLmRlc2NyaXB0aW9ufVxyXG4gICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB7bWF0ZXJpYWwucGFyYW1zPy5maWxlX3VybCAmJiAoXHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2Y4ZjlmYScsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzZweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxhIFxyXG4gICAgICAgICAgICAgICAgICAgICAgaHJlZj17bWF0ZXJpYWwucGFyYW1zLmZpbGVfdXJsfVxyXG4gICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcclxuICAgICAgICAgICAgICAgICAgICAgIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjM2I4MmY2JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dERlY29yYXRpb246ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzUwMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhcDogJzhweCdcclxuICAgICAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAg8J+TjiB7bWF0ZXJpYWwucGFyYW1zLmZpbGVfdXJsLnNwbGl0KCcvJykucG9wKCkgfHwgJ0Rvd25sb2FkIEZpbGUnfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsIFxyXG4gICAgICAgICAgICAgICAgZ2FwOiAnOHB4JywgXHJcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtZW5kJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclRvcDogJzFweCBzb2xpZCAjZjFmM2Y0JyxcclxuICAgICAgICAgICAgICAgIHBhZGRpbmdUb3A6ICcxNnB4J1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGFcclxuICAgICAgICAgICAgICAgICAgaHJlZj17YC9hZG1pbi9yZXNvdXJjZXMvY291cnNlX21hdGVyaWFscy9yZWNvcmRzLyR7bWF0ZXJpYWwuaWR9L3Nob3dgfVxyXG4gICAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZjhmOWZhJyxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyMzNzQxNTEnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc4cHggMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNHB4JyxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0RGVjb3JhdGlvbjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc1MDAnXHJcbiAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIPCfkYHvuI8gVmlld1xyXG4gICAgICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgICAgICAgICAgPGFcclxuICAgICAgICAgICAgICAgICAgaHJlZj17YC9hZG1pbi9yZXNvdXJjZXMvY291cnNlX21hdGVyaWFscy9yZWNvcmRzLyR7bWF0ZXJpYWwuaWR9L2VkaXRgfVxyXG4gICAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjM2I4MmY2JyxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnOHB4IDEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzRweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dERlY29yYXRpb246ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc1MDAnXHJcbiAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIOKcj++4jyBFZGl0XHJcbiAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZURlbGV0ZSgnY291cnNlX21hdGVyaWFscycsIG1hdGVyaWFsLmlkLCAnbWF0ZXJpYWwnKX1cclxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2VmNDQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzhweCAxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc0cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzUwMCdcclxuICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAg8J+Xke+4jyBEZWxldGVcclxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICkpfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxuXHJcbiAgLy8gRW5yb2xsbWVudHMgU2VjdGlvbiBDb21wb25lbnRcclxuICBjb25zdCBFbnJvbGxtZW50c1NlY3Rpb24gPSAoKSA9PiAoXHJcbiAgICA8ZGl2PlxyXG4gICAgICA8ZGl2IHN0eWxlPXtzZWN0aW9uSGVhZGVyU3R5bGV9PlxyXG4gICAgICAgIDxoMiBzdHlsZT17eyBmb250U2l6ZTogJzIwcHgnLCBmb250V2VpZ2h0OiAnNjAwJywgbWFyZ2luOiAwLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgQ291cnNlIEVucm9sbG1lbnRzICh7ZmlsdGVyZWRFbnJvbGxtZW50cy5sZW5ndGh9KVxyXG4gICAgICAgIDwvaDI+XHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzEycHgnIH19PlxyXG4gICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtoYW5kbGVSZWZyZXNofSBzdHlsZT17cmVmcmVzaEJ1dHRvblN0eWxlfT5cclxuICAgICAgICAgICAg8J+UhCBSZWZyZXNoXHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgIDxhIFxyXG4gICAgICAgICAgICBocmVmPVwiL2FkbWluL3Jlc291cmNlcy9jb3Vyc2VfZW5yb2xsbWVudHMvYWN0aW9ucy9uZXdcIlxyXG4gICAgICAgICAgICBzdHlsZT17YnV0dG9uU3R5bGV9XHJcbiAgICAgICAgICA+XHJcbiAgICAgICAgICAgICsgQWRkIEVucm9sbG1lbnRcclxuICAgICAgICAgIDwvYT5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICA8ZGl2IHN0eWxlPXtzZWFyY2hCYXJTdHlsZX0+XHJcbiAgICAgICAgPGlucHV0XHJcbiAgICAgICAgICB0eXBlPVwidGV4dFwiXHJcbiAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlYXJjaCBlbnJvbGxtZW50cy4uLlwiXHJcbiAgICAgICAgICB2YWx1ZT17c2VhcmNoVGVybX1cclxuICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0U2VhcmNoVGVybShlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICBzdHlsZT17aW5wdXRTdHlsZX1cclxuICAgICAgICAvPlxyXG4gICAgICAgIHtzZWFyY2hUZXJtICYmIChcclxuICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2VhcmNoVGVybSgnJyl9XHJcbiAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgLi4ucmVmcmVzaEJ1dHRvblN0eWxlLFxyXG4gICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZWY0NDQ0JyxcclxuICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICBib3JkZXI6ICdub25lJ1xyXG4gICAgICAgICAgICB9fVxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICBDbGVhciBTZWFyY2hcclxuICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICl9XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAge2ZpbHRlcmVkRW5yb2xsbWVudHMubGVuZ3RoID09PSAwID8gKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e2VtcHR5U3RhdGVTdHlsZX0+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnNDhweCcsIG1hcmdpbkJvdHRvbTogJzE2cHgnIH19PvCfkaU8L2Rpdj5cclxuICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46ICcwIDAgMTJweCAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAge3NlYXJjaFRlcm0gPyAnTm8gZW5yb2xsbWVudHMgbWF0Y2ggeW91ciBzZWFyY2gnIDogJ05vIGVucm9sbG1lbnRzIGZvdW5kJ31cclxuICAgICAgICAgIDwvaDM+XHJcbiAgICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW46ICcwIDAgMjRweCAwJywgZm9udFNpemU6ICcxNnB4JyB9fT5cclxuICAgICAgICAgICAge3NlYXJjaFRlcm0gXHJcbiAgICAgICAgICAgICAgPyAnVHJ5IGRpZmZlcmVudCBzZWFyY2ggdGVybXMnXHJcbiAgICAgICAgICAgICAgOiAnRW5yb2xsIHN0dWRlbnRzIGluIGNvdXJzZXMgdG8gdHJhY2sgdGhlaXIgcHJvZ3Jlc3MnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIDwvcD5cclxuICAgICAgICAgIHshc2VhcmNoVGVybSAmJiAoXHJcbiAgICAgICAgICAgIDxhIFxyXG4gICAgICAgICAgICAgIGhyZWY9XCIvYWRtaW4vcmVzb3VyY2VzL2NvdXJzZV9lbnJvbGxtZW50cy9hY3Rpb25zL25ld1wiXHJcbiAgICAgICAgICAgICAgc3R5bGU9e3suLi5idXR0b25TdHlsZSwgdGV4dERlY29yYXRpb246ICdub25lJ319XHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICBDcmVhdGUgRmlyc3QgRW5yb2xsbWVudFxyXG4gICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApIDogKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e2dyaWRTdHlsZX0+XHJcbiAgICAgICAgICB7ZmlsdGVyZWRFbnJvbGxtZW50cy5tYXAoKGVucm9sbG1lbnQpID0+IChcclxuICAgICAgICAgICAgPGRpdiBrZXk9e2Vucm9sbG1lbnQuaWR9IHN0eWxlPXtjYXJkU3R5bGV9PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnMTZweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8aDMgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMThweCcsIFxyXG4gICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNjAwJywgXHJcbiAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzAgMCA4cHggMCcsXHJcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzFlMjkzYidcclxuICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICB7ZW5yb2xsbWVudC5wYXJhbXM/LmZyZWVsYW5jZXJfbmFtZSB8fCBgVXNlciAjJHtlbnJvbGxtZW50LnBhcmFtcz8uZnJlZWxhbmNlcl9pZH1gfVxyXG4gICAgICAgICAgICAgICAgPC9oMz5cclxuICAgICAgICAgICAgICAgIDxwIHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICBjb2xvcjogJyM2YjcyODAnLCBcclxuICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4JywgXHJcbiAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzAgMCA0cHggMCdcclxuICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICDwn5OnIHtlbnJvbGxtZW50LnBhcmFtcz8uZnJlZWxhbmNlcl9lbWFpbCB8fCAnTm8gZW1haWwgcHJvdmlkZWQnfVxyXG4gICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgPHAgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzZiNzI4MCcsIFxyXG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE0cHgnLCBcclxuICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnMCAwIDhweCAwJ1xyXG4gICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgIPCfk5oge2Vucm9sbG1lbnQucGFyYW1zPy5jb3Vyc2VfdGl0bGUgfHwgJ1Vua25vd24gQ291cnNlJ31cclxuICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICAgIDxwIHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICBjb2xvcjogJyM2YjcyODAnLCBcclxuICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxMnB4JywgXHJcbiAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzAgMCAxNnB4IDAnXHJcbiAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAg8J+ThSBFbnJvbGxlZDoge2Vucm9sbG1lbnQucGFyYW1zPy5lbnJvbGxlZF9hdCA/IFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKGVucm9sbG1lbnQucGFyYW1zLmVucm9sbGVkX2F0KS50b0xvY2FsZURhdGVTdHJpbmcoKSA6IFxyXG4gICAgICAgICAgICAgICAgICAgICdVbmtub3duIGRhdGUnXHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgey8qIFByb2dyZXNzIFNlY3Rpb24gKi99XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2Y4ZjlmYScsXHJcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcclxuICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxMnB4JywgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogJzUwMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICBQcm9ncmVzc1xyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzcwMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyMxZTQwYWYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNkYmVhZmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzJweCA4cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNHB4J1xyXG4gICAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAge2Vucm9sbG1lbnQucGFyYW1zPy5wcm9ncmVzcyB8fCAwfSVcclxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsIFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZTVlN2ViJywgXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNHB4JywgXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnOHB4JyxcclxuICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbidcclxuICAgICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBcclxuICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBlbnJvbGxtZW50LnBhcmFtcz8ucHJvZ3Jlc3MgPj0gMTAwID8gJyMxMGI5ODEnIDogJyMzYjgyZjYnLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnOHB4JywgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzRweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBgJHtNYXRoLm1pbihlbnJvbGxtZW50LnBhcmFtcz8ucHJvZ3Jlc3MgfHwgMCwgMTAwKX0lYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ3dpZHRoIDAuM3MgZWFzZSdcclxuICAgICAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLCBcclxuICAgICAgICAgICAgICAgIGdhcDogJzhweCcsIFxyXG4gICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdmbGV4LWVuZCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJUb3A6ICcxcHggc29saWQgI2YxZjNmNCcsXHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nVG9wOiAnMTZweCdcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxhXHJcbiAgICAgICAgICAgICAgICAgIGhyZWY9e2AvYWRtaW4vcmVzb3VyY2VzL2NvdXJzZV9lbnJvbGxtZW50cy9yZWNvcmRzLyR7ZW5yb2xsbWVudC5pZH0vc2hvd2B9XHJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNmOGY5ZmEnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzM3NDE1MScsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzhweCAxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc0cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHREZWNvcmF0aW9uOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzUwMCdcclxuICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAg8J+Rge+4jyBWaWV3XHJcbiAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICA8YVxyXG4gICAgICAgICAgICAgICAgICBocmVmPXtgL2FkbWluL3Jlc291cmNlcy9jb3Vyc2VfZW5yb2xsbWVudHMvcmVjb3Jkcy8ke2Vucm9sbG1lbnQuaWR9L2VkaXRgfVxyXG4gICAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjM2I4MmY2JyxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnOHB4IDEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzRweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dERlY29yYXRpb246ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc1MDAnXHJcbiAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIOKcj++4jyBFZGl0XHJcbiAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZURlbGV0ZSgnY291cnNlX2Vucm9sbG1lbnRzJywgZW5yb2xsbWVudC5pZCwgJ2Vucm9sbG1lbnQnKX1cclxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2VmNDQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzhweCAxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc0cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzUwMCdcclxuICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAg8J+Xke+4jyBEZWxldGVcclxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICkpfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXYgc3R5bGU9e2NvbnRhaW5lclN0eWxlfT5cclxuICAgICAgPHN0eWxlPlxyXG4gICAgICAgIHtgXHJcbiAgICAgICAgICBAa2V5ZnJhbWVzIHNwaW4ge1xyXG4gICAgICAgICAgICAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9XHJcbiAgICAgICAgICAgIDEwMCUgeyB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOyB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgYH1cclxuICAgICAgPC9zdHlsZT5cclxuICAgICAgXHJcbiAgICAgIHsvKiBIZWFkZXIgKi99XHJcbiAgICAgIDxkaXYgc3R5bGU9e2hlYWRlclN0eWxlfT5cclxuICAgICAgICA8aDEgc3R5bGU9e3sgZm9udFNpemU6ICcxLjVyZW0nLCBmb250V2VpZ2h0OiAnYm9sZCcsIG1hcmdpbjogMCwgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgIPCfk5ogQ291cnNlcyBNYW5hZ2VtZW50XHJcbiAgICAgICAgPC9oMT5cclxuICAgICAgICA8YnV0dG9uIFxyXG4gICAgICAgICAgb25DbGljaz17b25CYWNrfVxyXG4gICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzZiNzI4MCcsXHJcbiAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcclxuICAgICAgICAgICAgcGFkZGluZzogJzhweCAxNnB4JyxcclxuICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgIGZvbnRTaXplOiAnMTRweCcsXHJcbiAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc1MDAnLFxyXG4gICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICBnYXA6ICc4cHgnXHJcbiAgICAgICAgICB9fVxyXG4gICAgICAgID5cclxuICAgICAgICAgIOKGkCBCYWNrIHRvIERhc2hib2FyZFxyXG4gICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIHsvKiBUYWJzIE5hdmlnYXRpb24gKi99XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnMzBweCcgfX0+XHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhXcmFwOiAnd3JhcCcsIGdhcDogJzhweCcgfX0+XHJcbiAgICAgICAgICA8YnV0dG9uIFxyXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2V0QWN0aXZlVGFiKCdjb3Vyc2VzJyk7XHJcbiAgICAgICAgICAgICAgc2V0U2VhcmNoVGVybSgnJyk7XHJcbiAgICAgICAgICAgICAgc2V0RmlsdGVyU3RhdHVzKCdhbGwnKTtcclxuICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgc3R5bGU9e3RhYlN0eWxlKGFjdGl2ZVRhYiA9PT0gJ2NvdXJzZXMnKX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAg8J+TmiBDb3Vyc2VzICh7Y291cnNlcy5sZW5ndGh9KVxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8YnV0dG9uIFxyXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2V0QWN0aXZlVGFiKCdtYXRlcmlhbHMnKTtcclxuICAgICAgICAgICAgICBzZXRTZWFyY2hUZXJtKCcnKTtcclxuICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgc3R5bGU9e3RhYlN0eWxlKGFjdGl2ZVRhYiA9PT0gJ21hdGVyaWFscycpfVxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICDwn5OEIE1hdGVyaWFscyAoe21hdGVyaWFscy5sZW5ndGh9KVxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8YnV0dG9uIFxyXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2V0QWN0aXZlVGFiKCdlbnJvbGxtZW50cycpO1xyXG4gICAgICAgICAgICAgIHNldFNlYXJjaFRlcm0oJycpO1xyXG4gICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICBzdHlsZT17dGFiU3R5bGUoYWN0aXZlVGFiID09PSAnZW5yb2xsbWVudHMnKX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAg8J+RpSBFbnJvbGxtZW50cyAoe2Vucm9sbG1lbnRzLmxlbmd0aH0pXHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICB7LyogQ29udGVudCBiYXNlZCBvbiBhY3RpdmUgdGFiICovfVxyXG4gICAgICB7YWN0aXZlVGFiID09PSAnY291cnNlcycgJiYgPENvdXJzZXNTZWN0aW9uIC8+fVxyXG4gICAgICB7YWN0aXZlVGFiID09PSAnbWF0ZXJpYWxzJyAmJiA8TWF0ZXJpYWxzU2VjdGlvbiAvPn1cclxuICAgICAge2FjdGl2ZVRhYiA9PT0gJ2Vucm9sbG1lbnRzJyAmJiA8RW5yb2xsbWVudHNTZWN0aW9uIC8+fVxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvdXJzZXNNYW5hZ2VtZW50OyIsIi8vIEFkbWluL2NvbXBvbmVudHMvRGFzaGJvYXJkLmpzeFxyXG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xyXG5pbXBvcnQgeyBBcGlDbGllbnQsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSBcImFkbWluanNcIjtcclxuaW1wb3J0IENvdXJzZXNNYW5hZ2VtZW50IGZyb20gXCIuLi9hZG1pbi1jb21wb25lbnRzL2NvdXJzZS1jb21wb25lbnRzLmpzeFwiO1xyXG5cclxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRGFzaGJvYXJkKCkge1xyXG4gIGNvbnN0IHsgdHJhbnNsYXRlTWVzc2FnZSB9ID0gdXNlVHJhbnNsYXRpb24oKTtcclxuICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSB1c2VTdGF0ZShudWxsKTtcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcclxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xyXG4gIGNvbnN0IFthZG1pbkxvZ3MsIHNldEFkbWluTG9nc10gPSB1c2VTdGF0ZShbXSk7XHJcbiAgY29uc3QgW3VzZXJMb2dzLCBzZXRVc2VyTG9nc10gPSB1c2VTdGF0ZShbXSk7XHJcbiAgY29uc3QgW2N1cnJlbnRWaWV3LCBzZXRDdXJyZW50Vmlld10gPSB1c2VTdGF0ZSgnZGFzaGJvYXJkJyk7IFxyXG4gIGNvbnN0IGZldGNoaW5nUmVmID0gdXNlUmVmKGZhbHNlKTtcclxuICBjb25zdCBtb3VudGVkUmVmID0gdXNlUmVmKHRydWUpO1xyXG5cclxuICBjb25zdCBmZXRjaERhc2hib2FyZERhdGEgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XHJcbiAgICBpZiAoZmV0Y2hpbmdSZWYuY3VycmVudCkgcmV0dXJuO1xyXG5cclxuICAgIGZldGNoaW5nUmVmLmN1cnJlbnQgPSB0cnVlO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpLmdldERhc2hib2FyZCgpO1xyXG4gICAgICBpZiAoIW1vdW50ZWRSZWYuY3VycmVudCkgcmV0dXJuO1xyXG5cclxuICAgICAgaWYgKHJlc3BvbnNlPy5kYXRhKSB7XHJcbiAgICAgICAgc2V0RGF0YShyZXNwb25zZS5kYXRhKTtcclxuXHJcbiAgICAgICAgY29uc3QgYWxsTG9ncyA9IHJlc3BvbnNlLmRhdGEucmVjZW50TG9ncyB8fCBbXTtcclxuICAgICAgICBjb25zdCBhZG1pbnMgPSBhbGxMb2dzLmZpbHRlcihcclxuICAgICAgICAgIChsb2cpID0+IGxvZy5yb2xlX2lkID09PSAxIHx8IGxvZy5maXJzdF9uYW1lID09PSBcIlN5c3RlbVwiXHJcbiAgICAgICAgKS5zbGljZSgwLCA1KTtcclxuICAgICAgICBjb25zdCB1c2VycyA9IGFsbExvZ3MuZmlsdGVyKFxyXG4gICAgICAgICAgKGxvZykgPT4gbG9nLnJvbGVfaWQgIT09IDEgJiYgbG9nLmZpcnN0X25hbWUgIT09IFwiU3lzdGVtXCJcclxuICAgICAgICApLnNsaWNlKDAsIDUpO1xyXG5cclxuICAgICAgICBzZXRBZG1pbkxvZ3MoYWRtaW5zKTtcclxuICAgICAgICBzZXRVc2VyTG9ncyh1c2Vycyk7XHJcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gZGF0YSByZWNlaXZlZCBmcm9tIEFQSVwiKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGlmICghbW91bnRlZFJlZi5jdXJyZW50KSByZXR1cm47XHJcbiAgICAgIHNldEVycm9yKGVycj8ubWVzc2FnZSB8fCBcIkZhaWxlZCB0byBsb2FkIGRhc2hib2FyZCBkYXRhXCIpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgaWYgKG1vdW50ZWRSZWYuY3VycmVudCkgc2V0TG9hZGluZyhmYWxzZSk7XHJcbiAgICAgIGZldGNoaW5nUmVmLmN1cnJlbnQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9LCBbXSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBtb3VudGVkUmVmLmN1cnJlbnQgPSB0cnVlO1xyXG4gICAgZmV0Y2hEYXNoYm9hcmREYXRhKCk7XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBtb3VudGVkUmVmLmN1cnJlbnQgPSBmYWxzZTtcclxuICAgIH07XHJcbiAgfSwgW2ZldGNoRGFzaGJvYXJkRGF0YV0pO1xyXG5cclxuICAvLyBSZWFsLXRpbWUgZGF0YSB1cGRhdGVzIGV2ZXJ5IDEwIHNlY29uZHNcclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKGN1cnJlbnRWaWV3ICE9PSAnZGFzaGJvYXJkJykgcmV0dXJuOyAvLyBPbmx5IHJlZnJlc2ggd2hlbiBvbiBkYXNoYm9hcmQgdmlld1xyXG4gICAgXHJcbiAgICBjb25zdCByZWZyZXNoSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgIGlmICghZmV0Y2hpbmdSZWYuY3VycmVudCAmJiBtb3VudGVkUmVmLmN1cnJlbnQpIHtcclxuICAgICAgICBmZXRjaERhc2hib2FyZERhdGEoKTtcclxuICAgICAgfVxyXG4gICAgfSwgMTAwMDApO1xyXG4gICAgcmV0dXJuICgpID0+IGNsZWFySW50ZXJ2YWwocmVmcmVzaEludGVydmFsKTtcclxuICB9LCBbZmV0Y2hEYXNoYm9hcmREYXRhLCBjdXJyZW50Vmlld10pO1xyXG5cclxuICAvLyBSZWFsLXRpbWUgbG9nIHVwZGF0ZXMgZXZlcnkgNSBzZWNvbmRzXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmIChjdXJyZW50VmlldyAhPT0gJ2Rhc2hib2FyZCcpIHJldHVybjsgLy8gT25seSByZWZyZXNoIHdoZW4gb24gZGFzaGJvYXJkIHZpZXdcclxuICAgIFxyXG4gICAgY29uc3QgbG9nSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XHJcbiAgICAgIGlmICghbW91bnRlZFJlZi5jdXJyZW50IHx8IGZldGNoaW5nUmVmLmN1cnJlbnQpIHJldHVybjtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFwiL2FwaS9hZG1pbi9kYXNoYm9hcmQvbG9nc1wiKTtcclxuICAgICAgICBpZiAocmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgIGNvbnN0IG5ld0xvZ3MgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgICBpZiAobW91bnRlZFJlZi5jdXJyZW50ICYmIG5ld0xvZ3M/LnJlY2VudExvZ3MpIHtcclxuICAgICAgICAgICAgY29uc3QgYWxsTG9ncyA9IG5ld0xvZ3MucmVjZW50TG9ncztcclxuICAgICAgICAgICAgY29uc3QgYWRtaW5zID0gYWxsTG9ncy5maWx0ZXIoXHJcbiAgICAgICAgICAgICAgKGxvZykgPT4gbG9nLnJvbGVfaWQgPT09IDEgfHwgbG9nLmZpcnN0X25hbWUgPT09IFwiU3lzdGVtXCJcclxuICAgICAgICAgICAgKS5zbGljZSgwLCA1KTtcclxuICAgICAgICAgICAgY29uc3QgdXNlcnMgPSBhbGxMb2dzLmZpbHRlcihcclxuICAgICAgICAgICAgICAobG9nKSA9PiBsb2cucm9sZV9pZCAhPT0gMSAmJiBsb2cuZmlyc3RfbmFtZSAhPT0gXCJTeXN0ZW1cIlxyXG4gICAgICAgICAgICApLnNsaWNlKDAsIDUpO1xyXG4gICAgICAgICAgICBzZXRBZG1pbkxvZ3MoYWRtaW5zKTtcclxuICAgICAgICAgICAgc2V0VXNlckxvZ3ModXNlcnMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCB7fVxyXG4gICAgfSwgNTAwMCk7XHJcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJJbnRlcnZhbChsb2dJbnRlcnZhbCk7XHJcbiAgfSwgW2N1cnJlbnRWaWV3XSk7XHJcblxyXG4gIGNvbnN0IGhhbmRsZVJlZnJlc2ggPSB1c2VDYWxsYmFjaygoKSA9PiB7XHJcbiAgICBmZXRjaERhc2hib2FyZERhdGEoKTtcclxuICB9LCBbZmV0Y2hEYXNoYm9hcmREYXRhXSk7XHJcblxyXG4gIC8vIFNob3cgY291cnNlcyBtYW5hZ2VtZW50IGlmIGN1cnJlbnRWaWV3IGlzICdjb3Vyc2VzJ1xyXG4gIGlmIChjdXJyZW50VmlldyA9PT0gJ2NvdXJzZXMnKSB7XHJcbiAgICByZXR1cm4gPENvdXJzZXNNYW5hZ2VtZW50IG9uQmFjaz17KCkgPT4gc2V0Q3VycmVudFZpZXcoJ2Rhc2hib2FyZCcpfSAvPjtcclxuICB9XHJcblxyXG4gIC8vIFNob3cgZXJyb3Igc3RhdGVcclxuICBpZiAoZXJyb3IgJiYgIWRhdGEpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXHJcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxyXG4gICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgIGhlaWdodDogJzQwMHB4JyxcclxuICAgICAgICBmb250U2l6ZTogJzE2cHgnLFxyXG4gICAgICAgIGNvbG9yOiAnI2VmNDQ0NCcsXHJcbiAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJ1xyXG4gICAgICB9fT5cclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnNDhweCcsIG1hcmdpbkJvdHRvbTogJzE2cHgnIH19PuKaoO+4jzwvZGl2PlxyXG4gICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46ICcwIDAgOHB4IDAnLCBjb2xvcjogJyNlZjQ0NDQnIH19PkZhaWxlZCB0byBsb2FkIGRhc2hib2FyZDwvaDM+XHJcbiAgICAgICAgPHAgc3R5bGU9e3sgbWFyZ2luOiAnMCAwIDE2cHggMCcsIGNvbG9yOiAnIzZiNzI4MCcgfX0+e2Vycm9yfTwvcD5cclxuICAgICAgICA8YnV0dG9uIFxyXG4gICAgICAgICAgb25DbGljaz17aGFuZGxlUmVmcmVzaH1cclxuICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjM2I4MmY2JyxcclxuICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc2cHgnLFxyXG4gICAgICAgICAgICBwYWRkaW5nOiAnOHB4IDE2cHgnLFxyXG4gICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4J1xyXG4gICAgICAgICAgfX1cclxuICAgICAgICA+XHJcbiAgICAgICAgICBSZXRyeVxyXG4gICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBpZiAobG9hZGluZyAmJiAhZGF0YSkge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcclxuICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXHJcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgaGVpZ2h0OiAnNDAwcHgnLFxyXG4gICAgICAgIGZvbnRTaXplOiAnMTZweCcsXHJcbiAgICAgICAgY29sb3I6ICcjNmI3MjgwJ1xyXG4gICAgICB9fT5cclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgd2lkdGg6ICc0MHB4JywgXHJcbiAgICAgICAgICBoZWlnaHQ6ICc0MHB4JywgXHJcbiAgICAgICAgICBib3JkZXI6ICc0cHggc29saWQgI2U1ZTdlYicsXHJcbiAgICAgICAgICBib3JkZXJUb3A6ICc0cHggc29saWQgIzNiODJmNicsXHJcbiAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnLFxyXG4gICAgICAgICAgYW5pbWF0aW9uOiAnc3BpbiAxcyBsaW5lYXIgaW5maW5pdGUnLFxyXG4gICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTZweCdcclxuICAgICAgICB9fT48L2Rpdj5cclxuICAgICAgICBMb2FkaW5nIERhc2hib2FyZC4uLlxyXG4gICAgICA8L2Rpdj5cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBtZXRyaWNzID0gZGF0YT8ubWV0cmljcyB8fCB7fTtcclxuXHJcbiAgY29uc3Qgc3RhdHNDYXJkcyA9IFtcclxuICAgIHsgdGl0bGU6IFwiVG90YWwgQWRtaW5zXCIsIHZhbHVlOiBtZXRyaWNzLmFkbWluc0NvdW50IHx8IDAsIGxpbms6IFwiL2FkbWluL3Jlc291cmNlcy9hZG1pbnNcIiwgY29sb3I6IFwiIzNiODJmNlwiLCBpY29uOiBcIvCfkaVcIiB9LFxyXG4gICAgeyB0aXRsZTogXCJDbGllbnRzXCIsIHZhbHVlOiBtZXRyaWNzLmNsaWVudHNDb3VudCB8fCAwLCBsaW5rOiBcIi9hZG1pbi9yZXNvdXJjZXMvY2xpZW50c1wiLCBjb2xvcjogXCIjMTBiOTgxXCIsIGljb246IFwi8J+PolwiIH0sXHJcbiAgICB7IHRpdGxlOiBcIkZyZWVsYW5jZXJzXCIsIHZhbHVlOiBtZXRyaWNzLmZyZWVsYW5jZXJzQ291bnQgfHwgMCwgbGluazogXCIvYWRtaW4vcmVzb3VyY2VzL2ZyZWVsYW5jZXJzXCIsIGNvbG9yOiBcIiNmNTllMGJcIiwgaWNvbjogXCLwn5K8XCIgfSxcclxuICAgIHsgdGl0bGU6IFwiQWN0aXZlIFByb2plY3RzXCIsIHZhbHVlOiBtZXRyaWNzLnByb2plY3RzQ291bnQgfHwgMCwgbGluazogXCIvYWRtaW4vcmVzb3VyY2VzL3Byb2plY3RzXCIsIGNvbG9yOiBcIiNlZjQ0NDRcIiwgaWNvbjogXCLwn5qAXCIgfSxcclxuICAgIHsgdGl0bGU6IFwiUGVuZGluZyBBcHBvaW50bWVudHNcIiwgdmFsdWU6IG1ldHJpY3MucGVuZGluZ0FwcG9pbnRtZW50cyB8fCAwLCBsaW5rOiBcIi9hZG1pbi9yZXNvdXJjZXMvYXBwb2ludG1lbnRzXCIsIGNvbG9yOiBcIiM4YjVjZjZcIiwgaWNvbjogXCLwn5OFXCIgfSxcclxuICAgIHsgdGl0bGU6IFwiQ291cnNlc1wiLCB2YWx1ZTogbWV0cmljcy5jb3Vyc2VzQ291bnQgfHwgMCwgYWN0aW9uOiAnY291cnNlcycsIGNvbG9yOiBcIiMwNmI2ZDRcIiwgaWNvbjogXCLwn5OaXCIgfSwgLy8gQ2hhbmdlZCB0byBhY3Rpb25cclxuICAgIHsgdGl0bGU6IFwiUGxhbnNcIiwgdmFsdWU6IG1ldHJpY3MucGxhbnNDb3VudCB8fCAwLCBsaW5rOiBcIi9hZG1pbi9yZXNvdXJjZXMvcGxhbnNcIiwgY29sb3I6IFwiIzg0Y2MxNlwiLCBpY29uOiBcIvCfk4tcIiB9LFxyXG4gICAgeyB0aXRsZTogXCJUb3RhbCBSZXZlbnVlXCIsIHZhbHVlOiBgJCR7KG1ldHJpY3MudG90YWxSZXZlbnVlIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9YCwgbGluazogXCIvYWRtaW4vcmVzb3VyY2VzL3BheW1lbnRzXCIsIGNvbG9yOiBcIiMyMmM1NWVcIiwgaWNvbjogXCLwn5KwXCIgfSxcclxuICAgIHsgdGl0bGU6IFwiQW5hbHl0aWNzXCIsIHZhbHVlOiBcIlZpZXcgUmVwb3J0c1wiLCBsaW5rOiBcIi9hZG1pbi9wYWdlcy9hbmFseXRpY3NcIiwgY29sb3I6IFwiIzYzNjZmMVwiLCBpY29uOiBcIvCfk4pcIiB9LFxyXG4gIF07XHJcblxyXG4gIGNvbnN0IGhhbmRsZUNhcmRDbGljayA9IChjYXJkKSA9PiB7XHJcbiAgICBpZiAoY2FyZC5hY3Rpb24gPT09ICdjb3Vyc2VzJykge1xyXG4gICAgICBzZXRDdXJyZW50VmlldygnY291cnNlcycpO1xyXG4gICAgfSBlbHNlIGlmIChjYXJkLmxpbmspIHtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBjYXJkLmxpbms7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZ2V0VGltZUFnbyA9IChkYXRlU3RyaW5nKSA9PiB7XHJcbiAgICBpZiAoIWRhdGVTdHJpbmcpIHJldHVybiBcIlwiO1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcclxuICAgICAgY29uc3QgbG9nVGltZSA9IG5ldyBEYXRlKGRhdGVTdHJpbmcpO1xyXG4gICAgICBjb25zdCBkaWZmTXMgPSBub3cgLSBsb2dUaW1lO1xyXG4gICAgICBjb25zdCBkaWZmU2VjcyA9IE1hdGguZmxvb3IoZGlmZk1zIC8gMTAwMCk7XHJcbiAgICAgIGlmIChkaWZmU2VjcyA8IDYwKSByZXR1cm4gYCR7ZGlmZlNlY3N9cyBhZ29gO1xyXG4gICAgICBjb25zdCBkaWZmTWlucyA9IE1hdGguZmxvb3IoZGlmZlNlY3MgLyA2MCk7XHJcbiAgICAgIGlmIChkaWZmTWlucyA8IDYwKSByZXR1cm4gYCR7ZGlmZk1pbnN9bSBhZ29gO1xyXG4gICAgICBjb25zdCBkaWZmSG91cnMgPSBNYXRoLmZsb29yKGRpZmZNaW5zIC8gNjApO1xyXG4gICAgICBpZiAoZGlmZkhvdXJzIDwgMjQpIHJldHVybiBgJHtkaWZmSG91cnN9aCBhZ29gO1xyXG4gICAgICBjb25zdCBkaWZmRGF5cyA9IE1hdGguZmxvb3IoZGlmZkhvdXJzIC8gMjQpO1xyXG4gICAgICBpZiAoZGlmZkRheXMgPCA3KSByZXR1cm4gYCR7ZGlmZkRheXN9ZCBhZ29gO1xyXG4gICAgICByZXR1cm4gbG9nVGltZS50b0xvY2FsZURhdGVTdHJpbmcoKTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICByZXR1cm4gXCJcIjtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBjb250YWluZXJTdHlsZSA9IHtcclxuICAgIGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLFxyXG4gICAgbWluSGVpZ2h0OiAnMTAwdmgnLFxyXG4gICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgZm9udEZhbWlseTogJy1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgXCJTZWdvZSBVSVwiLCBSb2JvdG8sIFwiSGVsdmV0aWNhIE5ldWVcIiwgQXJpYWwsIHNhbnMtc2VyaWYnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgaGVhZGVyU3R5bGUgPSB7XHJcbiAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLFxyXG4gICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICBtYXJnaW5Cb3R0b206ICczMHB4JyxcclxuICAgIHBhZGRpbmdCb3R0b206ICcyMHB4JyxcclxuICAgIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IHJlZnJlc2hCdXR0b25TdHlsZSA9IHtcclxuICAgIGJhY2tncm91bmRDb2xvcjogJyNmOGY5ZmEnLFxyXG4gICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlOWVjZWYnLFxyXG4gICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcclxuICAgIHBhZGRpbmc6ICc4cHggMTJweCcsXHJcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgIHRyYW5zaXRpb246ICdhbGwgMC4ycycsXHJcbiAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcclxuICAgIGNvbG9yOiAnIzM3NDE1MScsXHJcbiAgICBmb250U2l6ZTogJzE0cHgnLFxyXG4gICAgZ2FwOiAnOHB4J1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IG1ldHJpY3NHcmlkU3R5bGUgPSB7XHJcbiAgICBkaXNwbGF5OiAnZ3JpZCcsXHJcbiAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjgwcHgsIDFmcikpJyxcclxuICAgIGdhcDogJzI0cHgnLFxyXG4gICAgbWFyZ2luQm90dG9tOiAnNDBweCdcclxuICB9O1xyXG5cclxuICBjb25zdCBjYXJkU3R5bGUgPSB7XHJcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmZmZmJyxcclxuICAgIHBhZGRpbmc6ICcyNHB4JyxcclxuICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTllY2VmJyxcclxuICAgIGJvcmRlclJhZGl1czogJzhweCcsXHJcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgIHRyYW5zaXRpb246ICdhbGwgMC4ycyBlYXNlJyxcclxuICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsIDAsIDAsIDAuMSknLFxyXG4gICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICBvdmVyZmxvdzogJ2hpZGRlbidcclxuICB9O1xyXG5cclxuICBjb25zdCBjYXJkVGl0bGVTdHlsZSA9IHtcclxuICAgIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgICBmb250V2VpZ2h0OiAnNTAwJyxcclxuICAgIGNvbG9yOiAnIzZiNzI4MCcsXHJcbiAgICBtYXJnaW46ICcwIDAgOHB4IDAnLFxyXG4gICAgdGV4dFRyYW5zZm9ybTogJ3VwcGVyY2FzZScsXHJcbiAgICBsZXR0ZXJTcGFjaW5nOiAnMC44cHgnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgY2FyZFZhbHVlU3R5bGUgPSB7XHJcbiAgICBmb250U2l6ZTogJzI4cHgnLFxyXG4gICAgZm9udFdlaWdodDogJzcwMCcsXHJcbiAgICBjb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgbWFyZ2luOiAnMCcsXHJcbiAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgIGdhcDogJzEycHgnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgY2FyZEljb25TdHlsZSA9IHtcclxuICAgIGZvbnRTaXplOiAnMjRweCcsXHJcbiAgICBvcGFjaXR5OiAwLjhcclxuICB9O1xyXG5cclxuICBjb25zdCBsb2dzQ29udGFpbmVyU3R5bGUgPSB7XHJcbiAgICBkaXNwbGF5OiAnZ3JpZCcsXHJcbiAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAnMWZyIDFmcicsXHJcbiAgICBnYXA6ICcyNHB4J1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGxvZ1NlY3Rpb25TdHlsZSA9IHtcclxuICAgIGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLFxyXG4gICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlOWVjZWYnLFxyXG4gICAgYm9yZGVyUmFkaXVzOiAnOHB4JyxcclxuICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcclxuICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsIDAsIDAsIDAuMSknXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbG9nSGVhZGVyU3R5bGUgPSB7XHJcbiAgICBmb250U2l6ZTogJzE2cHgnLFxyXG4gICAgZm9udFdlaWdodDogJzYwMCcsXHJcbiAgICBjb2xvcjogJyMxZTI5M2InLFxyXG4gICAgbWFyZ2luOiAnMCcsXHJcbiAgICBwYWRkaW5nOiAnMTZweCAyMHB4JyxcclxuICAgIGJhY2tncm91bmRDb2xvcjogJyNmOGY5ZmEnLFxyXG4gICAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlOWVjZWYnLFxyXG4gICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICBnYXA6ICc4cHgnXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbG9nSXRlbVN0eWxlID0ge1xyXG4gICAgcGFkZGluZzogJzE2cHggMjBweCcsXHJcbiAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2YxZjNmNCcsXHJcbiAgICB0cmFuc2l0aW9uOiAnYmFja2dyb3VuZC1jb2xvciAwLjJzJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGxvZ0l0ZW1OYW1lU3R5bGUgPSB7XHJcbiAgICBmb250V2VpZ2h0OiAnNjAwJyxcclxuICAgIGNvbG9yOiAnIzFlMjkzYicsXHJcbiAgICBmb250U2l6ZTogJzE0cHgnLFxyXG4gICAgbWFyZ2luQm90dG9tOiAnNHB4J1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGxvZ0l0ZW1BY3Rpb25TdHlsZSA9IHtcclxuICAgIGNvbG9yOiAnIzZiNzI4MCcsXHJcbiAgICBmb250U2l6ZTogJzEzcHgnLFxyXG4gICAgbWFyZ2luQm90dG9tOiAnNHB4J1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGxvZ0l0ZW1UaW1lU3R5bGUgPSB7XHJcbiAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgY29sb3I6ICcjOWNhM2FmJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGVtcHR5U3RhdGVTdHlsZSA9IHtcclxuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICBjb2xvcjogJyM2YjcyODAnLFxyXG4gICAgZm9udFN0eWxlOiAnaXRhbGljJyxcclxuICAgIHBhZGRpbmc6ICc0MHB4IDIwcHgnXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXYgc3R5bGU9e2NvbnRhaW5lclN0eWxlfT5cclxuICAgICAgPHN0eWxlPlxyXG4gICAgICAgIHtgXHJcbiAgICAgICAgICBAa2V5ZnJhbWVzIHNwaW4ge1xyXG4gICAgICAgICAgICAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9XHJcbiAgICAgICAgICAgIDEwMCUgeyB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOyB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC5sb2ctaXRlbTpob3ZlciB7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWZhZmIgIWltcG9ydGFudDtcclxuICAgICAgICAgIH1cclxuICAgICAgICBgfVxyXG4gICAgICA8L3N0eWxlPlxyXG4gICAgICBcclxuICAgICAgPGRpdiBzdHlsZT17aGVhZGVyU3R5bGV9PlxyXG4gICAgICAgIDxkaXY+XHJcbiAgICAgICAgICA8aDEgc3R5bGU9e3sgZm9udFNpemU6IFwiMS41cmVtXCIsIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLCBtYXJnaW46IDAsIGNvbG9yOiBcIiMxZTI5M2JcIiB9fT5cclxuICAgICAgICAgICAgQWRtaW4gRGFzaGJvYXJkXHJcbiAgICAgICAgICA8L2gxPlxyXG4gICAgICAgICAgPHAgc3R5bGU9e3sgbWFyZ2luOiAnNHB4IDAgMCAwJywgY29sb3I6ICcjNmI3MjgwJywgZm9udFNpemU6ICcxNHB4JyB9fT5cclxuICAgICAgICAgICAgV2VsY29tZSBiYWNrISBIZXJlJ3Mgd2hhdCdzIGhhcHBlbmluZyB0b2RheS5cclxuICAgICAgICAgIDwvcD5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8YnV0dG9uIFxyXG4gICAgICAgICAgb25DbGljaz17aGFuZGxlUmVmcmVzaH0gXHJcbiAgICAgICAgICBzdHlsZT17cmVmcmVzaEJ1dHRvblN0eWxlfVxyXG4gICAgICAgICAgb25Nb3VzZU92ZXI9eyhlKSA9PiB7XHJcbiAgICAgICAgICAgIGUudGFyZ2V0LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZTllY2VmJztcclxuICAgICAgICAgICAgZS50YXJnZXQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoLTFweCknO1xyXG4gICAgICAgICAgfX1cclxuICAgICAgICAgIG9uTW91c2VPdXQ9eyhlKSA9PiB7XHJcbiAgICAgICAgICAgIGUudGFyZ2V0LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZjhmOWZhJztcclxuICAgICAgICAgICAgZS50YXJnZXQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoMCknO1xyXG4gICAgICAgICAgfX1cclxuICAgICAgICAgIHRpdGxlPVwiUmVmcmVzaCBEYXNoYm9hcmRcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIDxzdmcgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCI+XHJcbiAgICAgICAgICAgIDxwYXRoIGQ9XCJNMyAxMmE5IDkgMCAwIDEgOS05IDkuNzUgOS43NSAwIDAgMSA2Ljc0IDIuNzRMMjEgOFwiLz5cclxuICAgICAgICAgICAgPHBhdGggZD1cIk0yMSAzdjVoLTVcIi8+XHJcbiAgICAgICAgICAgIDxwYXRoIGQ9XCJNMjEgMTJhOSA5IDAgMCAxLTkgOSA5Ljc1IDkuNzUgMCAwIDEtNi43NC0yLjc0TDMgMTZcIi8+XHJcbiAgICAgICAgICAgIDxwYXRoIGQ9XCJNMyAyMXYtNWg1XCIvPlxyXG4gICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICBSZWZyZXNoXHJcbiAgICAgICAgPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdiBzdHlsZT17bWV0cmljc0dyaWRTdHlsZX0+XHJcbiAgICAgICAge3N0YXRzQ2FyZHMubWFwKChjYXJkLCBpbmRleCkgPT4gKFxyXG4gICAgICAgICAgPGRpdiBcclxuICAgICAgICAgICAga2V5PXtpbmRleH0gXHJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZUNhcmRDbGljayhjYXJkKX0gXHJcbiAgICAgICAgICAgIHN0eWxlPXtjYXJkU3R5bGV9XHJcbiAgICAgICAgICAgIG9uTW91c2VPdmVyPXsoZSkgPT4ge1xyXG4gICAgICAgICAgICAgIGUuY3VycmVudFRhcmdldC5zdHlsZS5ib3JkZXJDb2xvciA9IGNhcmQuY29sb3I7XHJcbiAgICAgICAgICAgICAgZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJveFNoYWRvdyA9IGAwIDhweCAyNXB4ICR7Y2FyZC5jb2xvcn0yMGA7XHJcbiAgICAgICAgICAgICAgZS5jdXJyZW50VGFyZ2V0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKC00cHgpJztcclxuICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgb25Nb3VzZU91dD17KGUpID0+IHtcclxuICAgICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYm9yZGVyQ29sb3IgPSAnI2U5ZWNlZic7XHJcbiAgICAgICAgICAgICAgZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJveFNoYWRvdyA9ICcwIDFweCAzcHggcmdiYSgwLCAwLCAwLCAwLjEpJztcclxuICAgICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoMCknO1xyXG4gICAgICAgICAgICB9fVxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICA8aDMgc3R5bGU9e2NhcmRUaXRsZVN0eWxlfT57Y2FyZC50aXRsZX08L2gzPlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXtjYXJkVmFsdWVTdHlsZX0+XHJcbiAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e2NhcmRJY29uU3R5bGV9PntjYXJkLmljb259PC9zcGFuPlxyXG4gICAgICAgICAgICAgIDxzcGFuPntjYXJkLnZhbHVlfTwvc3Bhbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB7LyogQ2FyZCBhY2NlbnQgYmFyICovfVxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgYm90dG9tOiAwLFxyXG4gICAgICAgICAgICAgIGxlZnQ6IDAsXHJcbiAgICAgICAgICAgICAgcmlnaHQ6IDAsXHJcbiAgICAgICAgICAgICAgaGVpZ2h0OiAnNHB4JyxcclxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBjYXJkLmNvbG9yLFxyXG4gICAgICAgICAgICAgIG9wYWNpdHk6IDAuNlxyXG4gICAgICAgICAgICB9fSAvPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKSl9XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdiBzdHlsZT17bG9nc0NvbnRhaW5lclN0eWxlfT5cclxuICAgICAgICA8ZGl2IHN0eWxlPXtsb2dTZWN0aW9uU3R5bGV9PlxyXG4gICAgICAgICAgPGgzIHN0eWxlPXtsb2dIZWFkZXJTdHlsZX0+XHJcbiAgICAgICAgICAgIDxzcGFuPvCflKc8L3NwYW4+XHJcbiAgICAgICAgICAgIEFkbWluIEFjdGl2aXR5ICh7YWRtaW5Mb2dzLmxlbmd0aH0pXHJcbiAgICAgICAgICA8L2gzPlxyXG4gICAgICAgICAge2FkbWluTG9ncy5sZW5ndGggPT09IDAgPyAoXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e2VtcHR5U3RhdGVTdHlsZX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzMycHgnLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PvCfpKs8L2Rpdj5cclxuICAgICAgICAgICAgICBObyByZWNlbnQgYWRtaW4gYWN0aXZpdHlcclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICBhZG1pbkxvZ3MubWFwKChsb2csIGkpID0+IChcclxuICAgICAgICAgICAgICA8ZGl2IFxyXG4gICAgICAgICAgICAgICAga2V5PXtsb2cuaWQgfHwgaX0gXHJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJsb2ctaXRlbVwiXHJcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAuLi5sb2dJdGVtU3R5bGUsXHJcbiAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogaSA9PT0gYWRtaW5Mb2dzLmxlbmd0aCAtIDEgPyAnbm9uZScgOiAnMXB4IHNvbGlkICNmM2Y0ZjYnXHJcbiAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e2xvZ0l0ZW1OYW1lU3R5bGV9PlxyXG4gICAgICAgICAgICAgICAgICB7bG9nLmZpcnN0X25hbWV9IHtsb2cubGFzdF9uYW1lfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtsb2dJdGVtQWN0aW9uU3R5bGV9Pntsb2cuYWN0aW9ufTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17bG9nSXRlbVRpbWVTdHlsZX0+XHJcbiAgICAgICAgICAgICAgICAgIHtnZXRUaW1lQWdvKGxvZy5jcmVhdGVkX2F0KX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApKVxyXG4gICAgICAgICAgKX1cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGRpdiBzdHlsZT17bG9nU2VjdGlvblN0eWxlfT5cclxuICAgICAgICAgIDxoMyBzdHlsZT17bG9nSGVhZGVyU3R5bGV9PlxyXG4gICAgICAgICAgICA8c3Bhbj7wn5GlPC9zcGFuPlxyXG4gICAgICAgICAgICBVc2VyIEFjdGl2aXR5ICh7dXNlckxvZ3MubGVuZ3RofSlcclxuICAgICAgICAgIDwvaDM+XHJcbiAgICAgICAgICB7dXNlckxvZ3MubGVuZ3RoID09PSAwID8gKFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXtlbXB0eVN0YXRlU3R5bGV9PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICczMnB4JywgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT7wn5i0PC9kaXY+XHJcbiAgICAgICAgICAgICAgTm8gcmVjZW50IHVzZXIgYWN0aXZpdHlcclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICB1c2VyTG9ncy5tYXAoKGxvZywgaSkgPT4gKFxyXG4gICAgICAgICAgICAgIDxkaXYgXHJcbiAgICAgICAgICAgICAgICBrZXk9e2xvZy5pZCB8fCBpfSBcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImxvZy1pdGVtXCJcclxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgIC4uLmxvZ0l0ZW1TdHlsZSxcclxuICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiBpID09PSB1c2VyTG9ncy5sZW5ndGggLSAxID8gJ25vbmUnIDogJzFweCBzb2xpZCAjZjNmNGY2J1xyXG4gICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtsb2dJdGVtTmFtZVN0eWxlfT5cclxuICAgICAgICAgICAgICAgICAge2xvZy5maXJzdF9uYW1lfSB7bG9nLmxhc3RfbmFtZX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17bG9nSXRlbUFjdGlvblN0eWxlfT57bG9nLmFjdGlvbn08L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e2xvZ0l0ZW1UaW1lU3R5bGV9PlxyXG4gICAgICAgICAgICAgICAgICB7Z2V0VGltZUFnbyhsb2cuY3JlYXRlZF9hdCl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKSlcclxuICAgICAgICAgICl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxufSIsIi8vIEFkbWluL2NvbXBvbmVudHMvQW5hbHl0aWNzLmpzeFxyXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gXCJyZWFjdFwiO1xyXG5pbXBvcnQgeyBBcGlDbGllbnQgfSBmcm9tIFwiYWRtaW5qc1wiO1xyXG5cclxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQW5hbHl0aWNzKCkge1xyXG4gIGNvbnN0IFthY3RpdmVUYWIsIHNldEFjdGl2ZVRhYl0gPSB1c2VTdGF0ZSgnb3ZlcnZpZXcnKTtcclxuICBjb25zdCBbZGF0ZVJhbmdlLCBzZXREYXRlUmFuZ2VdID0gdXNlU3RhdGUoJzMwZCcpO1xyXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcclxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xyXG4gIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlKG51bGwpO1xyXG5cclxuICBjb25zdCBmZXRjaEFuYWx5dGljc0RhdGEgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBzZXRMb2FkaW5nKHRydWUpO1xyXG4gICAgc2V0RXJyb3IobnVsbCk7XHJcbiAgICBcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYC9hcGkvYWRtaW4vYW5hbHl0aWNzP3JhbmdlPSR7ZGF0ZVJhbmdlfWApO1xyXG4gICAgICBcclxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGZldGNoIGFuYWx5dGljcyBkYXRhJyk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGNvbnN0IGFuYWx5dGljc0RhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgIHNldERhdGEoYW5hbHl0aWNzRGF0YSk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignQW5hbHl0aWNzIGZldGNoIGVycm9yOicsIGVycik7XHJcbiAgICAgIHNldEVycm9yKCdGYWlsZWQgdG8gbG9hZCBhbmFseXRpY3MgZGF0YScpO1xyXG4gICAgICBzZXREYXRhKHtcclxuICAgICAgICBvdmVydmlldzoge30sXHJcbiAgICAgICAgYXBwb2ludG1lbnRzOiB7IG92ZXJ2aWV3OiB7fSwgYXBwb2ludG1lbnRTdGF0czogW10sIHRvcEZyZWVsYW5jZXJzOiBbXSwgcmVjZW50QXBwb2ludG1lbnRzOiBbXSB9LFxyXG4gICAgICAgIHVzZXJzOiB7IG92ZXJ2aWV3OiB7fSwgdXNlckdyb3d0aDogW10sIHVzZXJEaXN0cmlidXRpb246IFtdLCByZWNlbnRVc2VyczogW10gfSxcclxuICAgICAgICBwcm9qZWN0U3RhdHM6IHsgYnlTdGF0dXM6IFtdIH0sXHJcbiAgICAgIH0pO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGZldGNoQW5hbHl0aWNzRGF0YSgpO1xyXG4gIH0sIFtkYXRlUmFuZ2VdKTtcclxuXHJcbiAgY29uc3QgZm9ybWF0Q3VycmVuY3kgPSAoYW1vdW50KSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IEludGwuTnVtYmVyRm9ybWF0KCdlbi1VUycsIHtcclxuICAgICAgc3R5bGU6ICdjdXJyZW5jeScsXHJcbiAgICAgIGN1cnJlbmN5OiAnVVNEJ1xyXG4gICAgfSkuZm9ybWF0KGFtb3VudCB8fCAwKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBmb3JtYXREYXRlID0gKGRhdGVTdHJpbmcpID0+IHtcclxuICAgIHJldHVybiBuZXcgRGF0ZShkYXRlU3RyaW5nKS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLVVTJywge1xyXG4gICAgICBtb250aDogJ3Nob3J0JyxcclxuICAgICAgZGF5OiAnbnVtZXJpYydcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGZvcm1hdFBlcmNlbnRhZ2UgPSAodmFsdWUpID0+IHtcclxuICAgIHJldHVybiBgJHsodmFsdWUgfHwgMCkudG9GaXhlZCgxKX0lYDtcclxuICB9O1xyXG5cclxuICBpZiAobG9hZGluZykge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICBkaXNwbGF5OiAnZmxleCcsIFxyXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJywgXHJcbiAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsIFxyXG4gICAgICAgIG1pbkhlaWdodDogJzQwMHB4JyxcclxuICAgICAgICBmb250RmFtaWx5OiAnLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBcIlNlZ29lIFVJXCIsIFJvYm90bywgc2Fucy1zZXJpZidcclxuICAgICAgfX0+XHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyB0ZXh0QWxpZ246ICdjZW50ZXInIH19PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICB3aWR0aDogJzQwcHgnLFxyXG4gICAgICAgICAgICBoZWlnaHQ6ICc0MHB4JyxcclxuICAgICAgICAgICAgYm9yZGVyOiAnNHB4IHNvbGlkICNlNWU3ZWInLFxyXG4gICAgICAgICAgICBib3JkZXJUb3A6ICc0cHggc29saWQgIzNiODJmNicsXHJcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzUwJScsXHJcbiAgICAgICAgICAgIGFuaW1hdGlvbjogJ3NwaW4gMXMgbGluZWFyIGluZmluaXRlJyxcclxuICAgICAgICAgICAgbWFyZ2luOiAnMCBhdXRvIDE2cHgnXHJcbiAgICAgICAgICB9fT48L2Rpdj5cclxuICAgICAgICAgIDxwIHN0eWxlPXt7IGNvbG9yOiAnIzZiNzI4MCcgfX0+TG9hZGluZyBhbmFseXRpY3MuLi48L3A+XHJcbiAgICAgICAgICA8c3R5bGU+e2BcclxuICAgICAgICAgICAgQGtleWZyYW1lcyBzcGluIHtcclxuICAgICAgICAgICAgICAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9XHJcbiAgICAgICAgICAgICAgMTAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgYH08L3N0eWxlPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgcGFkZGluZzogJzI0cHgnLCBcclxuICAgICAgZm9udEZhbWlseTogJy1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgXCJTZWdvZSBVSVwiLCBSb2JvdG8sIHNhbnMtc2VyaWYnLFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmYWZjJyxcclxuICAgICAgbWluSGVpZ2h0OiAnMTAwdmgnXHJcbiAgICB9fT5cclxuICAgICAgey8qIEhlYWRlciAqL31cclxuICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICczMnB4JyB9fT5cclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLCBcclxuICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIFxyXG4gICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICBtYXJnaW5Cb3R0b206ICcyNHB4J1xyXG4gICAgICAgIH19PlxyXG4gICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgPGgxIHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgIG1hcmdpbjogJzAgMCA4cHggMCcsIFxyXG4gICAgICAgICAgICAgIGZvbnRTaXplOiAnMjhweCcsIFxyXG4gICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc3MDAnLFxyXG4gICAgICAgICAgICAgIGNvbG9yOiAnIzFlMjkzYidcclxuICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgQW5hbHl0aWNzIERhc2hib2FyZFxyXG4gICAgICAgICAgICA8L2gxPlxyXG4gICAgICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW46ICcwJywgY29sb3I6ICcjNjQ3NDhiJywgZm9udFNpemU6ICcxNnB4JyB9fT5cclxuICAgICAgICAgICAgICBDb21wcmVoZW5zaXZlIGJ1c2luZXNzIGluc2lnaHRzIGFuZCBtZXRyaWNzXHJcbiAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnMTJweCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH19PlxyXG4gICAgICAgICAgICA8c2VsZWN0XHJcbiAgICAgICAgICAgICAgdmFsdWU9e2RhdGVSYW5nZX1cclxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldERhdGVSYW5nZShlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc4cHggMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2QxZDVkYicsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc4cHgnLFxyXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInXHJcbiAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCI3ZFwiPjcgRGF5czwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIzMGRcIj4zMCBEYXlzPC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjkwZFwiPjkwIERheXM8L29wdGlvbj5cclxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMXlcIj4xIFllYXI8L29wdGlvbj5cclxuICAgICAgICAgICAgPC9zZWxlY3Q+XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgb25DbGljaz17ZmV0Y2hBbmFseXRpY3NEYXRhfVxyXG4gICAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnOHB4IDE2cHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzNiODJmNicsXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnOHB4JyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4JyxcclxuICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc1MDAnXHJcbiAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgIFJlZnJlc2hcclxuICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAge2Vycm9yICYmIChcclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgcGFkZGluZzogJzEycHggMTZweCcsXHJcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmZWUyZTInLFxyXG4gICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2ZlY2FjYScsXHJcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzhweCcsXHJcbiAgICAgICAgICAgIGNvbG9yOiAnIzk5MWIxYicsXHJcbiAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzI0cHgnLFxyXG4gICAgICAgICAgICBmb250U2l6ZTogJzE0cHgnXHJcbiAgICAgICAgICB9fT5cclxuICAgICAgICAgICAge2Vycm9yfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKX1cclxuXHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2U1ZTdlYicgfX0+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnMzJweCcgfX0+XHJcbiAgICAgICAgICAgIHtbXHJcbiAgICAgICAgICAgICAgeyBpZDogJ292ZXJ2aWV3JywgbGFiZWw6ICdPdmVydmlldycgfSxcclxuICAgICAgICAgICAgICB7IGlkOiAnYXBwb2ludG1lbnRzJywgbGFiZWw6ICdBcHBvaW50bWVudHMnIH0sXHJcbiAgICAgICAgICAgICAgeyBpZDogJ3VzZXJzJywgbGFiZWw6ICdVc2VycycgfSxcclxuICAgICAgICAgICAgICB7IGlkOiAncHJvamVjdHMnLCBsYWJlbDogJ1Byb2plY3RzJyB9LFxyXG4gICAgICAgICAgICAgIHsgaWQ6ICdmaW5hbmNpYWwnLCBsYWJlbDogJ0ZpbmFuY2lhbCcgfVxyXG4gICAgICAgICAgICBdLm1hcCh0YWIgPT4gKFxyXG4gICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgIGtleT17dGFiLmlkfVxyXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKHRhYi5pZCl9XHJcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTJweCAwJyxcclxuICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4JyxcclxuICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzUwMCcsXHJcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBhY3RpdmVUYWIgPT09IHRhYi5pZCA/ICcjM2I4MmY2JyA6ICcjNmI3MjgwJyxcclxuICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiBhY3RpdmVUYWIgPT09IHRhYi5pZCA/ICcycHggc29saWQgIzNiODJmNicgOiAnMnB4IHNvbGlkIHRyYW5zcGFyZW50JyxcclxuICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICdhbGwgMC4ycydcclxuICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAge3RhYi5sYWJlbH1cclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IG1pbkhlaWdodDogJzQwMHB4JyB9fT5cclxuICAgICAgICB7YWN0aXZlVGFiID09PSAnb3ZlcnZpZXcnICYmIChcclxuICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgZGlzcGxheTogJ2dyaWQnLCBcclxuICAgICAgICAgICAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjQwcHgsIDFmcikpJywgXHJcbiAgICAgICAgICAgICAgZ2FwOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMzJweCdcclxuICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzI0cHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nIH19PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogJzUwMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICBUb3RhbCBVc2Vyc1xyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyOHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7KGRhdGE/Lm92ZXJ2aWV3Py50b3RhbFVzZXJzIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzEycHgnLCBjb2xvcjogJyMxMGI5ODEnLCBtYXJnaW5Ub3A6ICc0cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICt7ZGF0YT8ub3ZlcnZpZXc/Lm5ld1VzZXJzVG9kYXkgfHwgMH0gdG9kYXlcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEycHgnLCBcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZGJlYWZlJywgXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcyNHB4J1xyXG4gICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICDwn5GlXHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyNHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJyB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgVG90YWwgQXBwb2ludG1lbnRzXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI4cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIHsoZGF0YT8uYXBwb2ludG1lbnRzPy5vdmVydmlldz8udG90YWxBcHBvaW50bWVudHMgfHwgMCkudG9Mb2NhbGVTdHJpbmcoKX1cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTJweCcsIGNvbG9yOiAnIzEwYjk4MScsIG1hcmdpblRvcDogJzRweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAge2RhdGE/LmFwcG9pbnRtZW50cz8ub3ZlcnZpZXc/LmFwcG9pbnRtZW50c1RvZGF5IHx8IDB9IHRvZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4JywgXHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2RjZmNlNycsIFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMjRweCdcclxuICAgICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAg8J+ThVxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjRweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIEFjdGl2ZSBQcm9qZWN0c1xyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyOHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7KGRhdGE/Lm92ZXJ2aWV3Py5hY3RpdmVQcm9qZWN0cyB8fCAwKS50b0xvY2FsZVN0cmluZygpfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxMnB4JywgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luVG9wOiAnNHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7ZGF0YT8ub3ZlcnZpZXc/LmNvbXBsZXRlZFByb2plY3RzIHx8IDB9IGNvbXBsZXRlZFxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTJweCcsIFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmM2U4ZmYnLCBcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzI0cHgnXHJcbiAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIPCfkrxcclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzI0cHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nIH19PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogJzUwMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICBUb3RhbCBSZXZlbnVlXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI4cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIHtmb3JtYXRDdXJyZW5jeShkYXRhPy5vdmVydmlldz8udG90YWxSZXZlbnVlIHx8IDApfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxMnB4JywgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luVG9wOiAnNHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7Zm9ybWF0Q3VycmVuY3koZGF0YT8ub3ZlcnZpZXc/Lm1vbnRobHlSZXZlbnVlIHx8IDApfSB0aGlzIG1vbnRoXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4JywgXHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZlZjNjNycsIFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMjRweCdcclxuICAgICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAg8J+SsFxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxyXG4gICAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xyXG4gICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHggMjRweCcsIFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2Y4ZmFmYydcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46ICcwJywgZm9udFNpemU6ICcxOHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIFJlY2VudCBBcHBvaW50bWVudHNcclxuICAgICAgICAgICAgICAgIDwvaDM+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXhIZWlnaHQ6ICc0MDBweCcsIG92ZXJmbG93WTogJ2F1dG8nIH19PlxyXG4gICAgICAgICAgICAgICAge2RhdGE/LmFwcG9pbnRtZW50cz8ucmVjZW50QXBwb2ludG1lbnRzPy5sZW5ndGggPiAwID8gKFxyXG4gICAgICAgICAgICAgICAgICA8dGFibGUgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgYm9yZGVyQ29sbGFwc2U6ICdjb2xsYXBzZScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRoZWFkIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnLCBwb3NpdGlvbjogJ3N0aWNreScsIHRvcDogMCB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgVHlwZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBTdGF0dXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgRGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBGcmVlbGFuY2VyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAge2RhdGEuYXBwb2ludG1lbnRzLnJlY2VudEFwcG9pbnRtZW50cy5zbGljZSgwLCAxMCkubWFwKChhcHBvaW50bWVudCwgaW5kZXgpID0+IChcclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyIGtleT17aW5kZXh9IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZjNmNGY2JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnYmFja2dyb3VuZC1jb2xvciAwLjJzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2FwcG9pbnRtZW50LmFwcG9pbnRtZW50X3R5cGUgfHwgJ0FwcG9pbnRtZW50J31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc0cHggMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNjAwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBvaW50bWVudC5zdGF0dXMgPT09ICdwZW5kaW5nJyA/ICcjZmVmM2M3JyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwb2ludG1lbnQuc3RhdHVzID09PSAnYWNjZXB0ZWQnID8gJyNkY2ZjZTcnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBvaW50bWVudC5zdGF0dXMgPT09ICdyZWplY3RlZCcgPyAnI2ZlZTJlMicgOiAnI2YzZjRmNicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcG9pbnRtZW50LnN0YXR1cyA9PT0gJ3BlbmRpbmcnID8gJyM5MjQwMGUnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBvaW50bWVudC5zdGF0dXMgPT09ICdhY2NlcHRlZCcgPyAnIzA2NWY0NicgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcG9pbnRtZW50LnN0YXR1cyA9PT0gJ3JlamVjdGVkJyA/ICcjOTkxYjFiJyA6ICcjMzc0MTUxJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsoYXBwb2ludG1lbnQuc3RhdHVzIHx8ICdwZW5kaW5nJykuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyAoYXBwb2ludG1lbnQuc3RhdHVzIHx8ICdwZW5kaW5nJykuc2xpY2UoMSl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YXBwb2ludG1lbnQuY3JlYXRlZF9hdCA/IGZvcm1hdERhdGUoYXBwb2ludG1lbnQuY3JlYXRlZF9hdCkgOiAnLSd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2FwcG9pbnRtZW50LmZyZWVsYW5jZXJfZmlyc3RfbmFtZX0ge2FwcG9pbnRtZW50LmZyZWVsYW5jZXJfbGFzdF9uYW1lfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgKSA6IChcclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB0ZXh0QWxpZ246ICdjZW50ZXInLCBwYWRkaW5nOiAnNDhweCAyNHB4JywgY29sb3I6ICcjNmI3MjgwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnNDhweCcsIG1hcmdpbkJvdHRvbTogJzE2cHgnIH19PvCfk4U8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW46ICcwJywgZm9udFNpemU6ICcxNnB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+Tm8gcmVjZW50IGFwcG9pbnRtZW50cyBmb3VuZDwvcD5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICl9XHJcblxyXG4gICAgICAgIHthY3RpdmVUYWIgPT09ICdhcHBvaW50bWVudHMnICYmIChcclxuICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgZGlzcGxheTogJ2dyaWQnLCBcclxuICAgICAgICAgICAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjAwcHgsIDFmcikpJywgXHJcbiAgICAgICAgICAgICAgZ2FwOiAnMTZweCcsXHJcbiAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMzJweCdcclxuICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiAnOHB4JywgaGVpZ2h0OiAnOHB4JywgYmFja2dyb3VuZENvbG9yOiAnI2Y1OWUwYicsIGJvcmRlclJhZGl1czogJzUwJScsIG1hcmdpblJpZ2h0OiAnOHB4JyB9fT48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgZm9udFdlaWdodDogJzUwMCcgfX0+UGVuZGluZzwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAge2RhdGE/LmFwcG9pbnRtZW50cz8ub3ZlcnZpZXc/LnBlbmRpbmdBcHBvaW50bWVudHMgfHwgMH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogJzhweCcsIGhlaWdodDogJzhweCcsIGJhY2tncm91bmRDb2xvcjogJyMxMGI5ODEnLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBtYXJnaW5SaWdodDogJzhweCcgfX0+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PkFjY2VwdGVkPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7ZGF0YT8uYXBwb2ludG1lbnRzPy5vdmVydmlldz8uYWNjZXB0ZWRBcHBvaW50bWVudHMgfHwgMH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogJzhweCcsIGhlaWdodDogJzhweCcsIGJhY2tncm91bmRDb2xvcjogJyNlZjQ0NDQnLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBtYXJnaW5SaWdodDogJzhweCcgfX0+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PlJlamVjdGVkPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7ZGF0YT8uYXBwb2ludG1lbnRzPy5vdmVydmlldz8ucmVqZWN0ZWRBcHBvaW50bWVudHMgfHwgMH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogJzhweCcsIGhlaWdodDogJzhweCcsIGJhY2tncm91bmRDb2xvcjogJyMzYjgyZjYnLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBtYXJnaW5SaWdodDogJzhweCcgfX0+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PkFjY2VwdGFuY2UgUmF0ZTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAge2Zvcm1hdFBlcmNlbnRhZ2UoZGF0YT8uYXBwb2ludG1lbnRzPy5vdmVydmlldz8uYWNjZXB0YW5jZVJhdGUgfHwgMCl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICB7ZGF0YT8uYXBwb2ludG1lbnRzPy50b3BGcmVlbGFuY2Vycz8ubGVuZ3RoID4gMCAmJiAoXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcclxuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHggMjRweCcsIFxyXG4gICAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnXHJcbiAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgPGgzIHN0eWxlPXt7IG1hcmdpbjogJzAnLCBmb250U2l6ZTogJzE4cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICBUb3AgUGVyZm9ybWluZyBGcmVlbGFuY2Vyc1xyXG4gICAgICAgICAgICAgICAgICA8L2gzPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8dGFibGUgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgYm9yZGVyQ29sbGFwc2U6ICdjb2xsYXBzZScgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDx0aGVhZCBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmYWZjJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgRnJlZWxhbmNlclxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBUb3RhbFxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBBY2NlcHRlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBTdWNjZXNzIFJhdGVcclxuICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgPC90aGVhZD5cclxuICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgIHtkYXRhLmFwcG9pbnRtZW50cy50b3BGcmVlbGFuY2Vycy5tYXAoKGZyZWVsYW5jZXIsIGluZGV4KSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICA8dHIga2V5PXtpbmRleH0gc3R5bGU9e3sgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNmM2Y0ZjYnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzQwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICc0MHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzNiODJmNicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzUwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc2MDAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE2cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5SaWdodDogJzEycHgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2ZyZWVsYW5jZXIuZmlyc3RfbmFtZT8uWzBdfXtmcmVlbGFuY2VyLmxhc3RfbmFtZT8uWzBdfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmcmVlbGFuY2VyLmZpcnN0X25hbWV9IHtmcmVlbGFuY2VyLmxhc3RfbmFtZX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxMnB4JywgY29sb3I6ICcjNmI3MjgwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZnJlZWxhbmNlci5lbWFpbH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHgnLCBmb250U2l6ZTogJzE2cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICB7ZnJlZWxhbmNlci50b3RhbF9hcHBvaW50bWVudHN9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNnB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzEwYjk4MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAge2ZyZWVsYW5jZXIuYWNjZXB0ZWRfYXBwb2ludG1lbnRzfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCcsIGZvbnRTaXplOiAnMTZweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzYjgyZjYnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtmb3JtYXRQZXJjZW50YWdlKGZyZWVsYW5jZXIuYWNjZXB0YW5jZV9yYXRlKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKX1cclxuXHJcbiAgICAgICAge2FjdGl2ZVRhYiA9PT0gJ3VzZXJzJyAmJiAoXHJcbiAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IFxyXG4gICAgICAgICAgICAgIGRpc3BsYXk6ICdncmlkJywgXHJcbiAgICAgICAgICAgICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDIwMHB4LCAxZnIpKScsIFxyXG4gICAgICAgICAgICAgIGdhcDogJzE2cHgnLFxyXG4gICAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzMycHgnXHJcbiAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+VG90YWwgVXNlcnM8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHsoZGF0YT8udXNlcnM/Lm92ZXJ2aWV3Py50b3RhbFVzZXJzIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzNiODJmNicsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PkNsaWVudHM8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHsoZGF0YT8udXNlcnM/Lm92ZXJ2aWV3Py50b3RhbENsaWVudHMgfHwgMCkudG9Mb2NhbGVTdHJpbmcoKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjOGI1Y2Y2JywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+RnJlZWxhbmNlcnM8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHsoZGF0YT8udXNlcnM/Lm92ZXJ2aWV3Py50b3RhbEZyZWVsYW5jZXJzIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzEwYjk4MScsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19Pk5ldyBUaGlzIE1vbnRoPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7KGRhdGE/LnVzZXJzPy5vdmVydmlldz8ubmV3VXNlcnNNb250aCB8fCAwKS50b0xvY2FsZVN0cmluZygpfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAge2RhdGE/LnVzZXJzPy5yZWNlbnRVc2Vycz8ubGVuZ3RoID4gMCAmJiAoXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcclxuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHggMjRweCcsIFxyXG4gICAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnXHJcbiAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgPGgzIHN0eWxlPXt7IG1hcmdpbjogJzAnLCBmb250U2l6ZTogJzE4cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICBSZWNlbnQgVXNlciBSZWdpc3RyYXRpb25zXHJcbiAgICAgICAgICAgICAgICAgIDwvaDM+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDx0YWJsZSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBib3JkZXJDb2xsYXBzZTogJ2NvbGxhcHNlJyB9fT5cclxuICAgICAgICAgICAgICAgICAgPHRoZWFkIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzEycHggMjRweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMzNzQxNTEnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBVc2VyXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEVtYWlsXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnMTJweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFJvbGVcclxuICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICcxMnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMzc0MTUxJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgSm9pbmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgIDx0Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICB7ZGF0YS51c2Vycy5yZWNlbnRVc2Vycy5zbGljZSgwLCAxMCkubWFwKCh1c2VyLCBpbmRleCkgPT4gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRyIGtleT17aW5kZXh9IHN0eWxlPXt7IGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZjNmNGY2JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICB7dXNlci5maXJzdF9uYW1lfSB7dXNlci5sYXN0X25hbWV9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICB7dXNlci5lbWFpbH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHgnLCBmb250U2l6ZTogJzE0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNHB4IDEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzYwMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHVzZXIucm9sZV9pZCA9PT0gMiA/ICcjZGJlYWZlJyA6IHVzZXIucm9sZV9pZCA9PT0gMyA/ICcjZjNlOGZmJyA6ICcjZjNmNGY2JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiB1c2VyLnJvbGVfaWQgPT09IDIgPyAnIzFlNDBhZicgOiB1c2VyLnJvbGVfaWQgPT09IDMgPyAnIzdjM2FlZCcgOiAnIzM3NDE1MSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt1c2VyLnJvbGVfaWQgPT09IDIgPyAnQ2xpZW50JyA6IHVzZXIucm9sZV9pZCA9PT0gMyA/ICdGcmVlbGFuY2VyJyA6ICdVc2VyJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4JywgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICB7dXNlci5jcmVhdGVkX2F0ID8gZm9ybWF0RGF0ZSh1c2VyLmNyZWF0ZWRfYXQpIDogJy0nfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICl9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICApfVxyXG5cclxuICAgICAgICB7YWN0aXZlVGFiID09PSAncHJvamVjdHMnICYmIChcclxuICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgZGlzcGxheTogJ2dyaWQnLCBcclxuICAgICAgICAgICAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMTgwcHgsIDFmcikpJywgXHJcbiAgICAgICAgICAgICAgZ2FwOiAnMTZweCcsXHJcbiAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMzJweCdcclxuICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5EcmFmdDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAge2RhdGE/Lm92ZXJ2aWV3Py5kcmFmdFByb2plY3RzIHx8IDB9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzNiODJmNicsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PkFjdGl2ZTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAge2RhdGE/Lm92ZXJ2aWV3Py5hY3RpdmVQcm9qZWN0cyB8fCAwfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyMxMGI5ODEnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5Db21wbGV0ZWQ8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHtkYXRhPy5vdmVydmlldz8uY29tcGxldGVkUHJvamVjdHMgfHwgMH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjMWUyOTNiJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+VG90YWw8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHtkYXRhPy5vdmVydmlldz8udG90YWxQcm9qZWN0cyB8fCAwfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAge2RhdGE/LnByb2plY3RTdGF0cz8uYnlTdGF0dXM/Lmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYicsXHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjRweCdcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46ICcwIDAgMjRweCAwJywgZm9udFNpemU6ICcxOHB4JywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIFByb2plY3QgU3RhdHVzIERpc3RyaWJ1dGlvblxyXG4gICAgICAgICAgICAgICAgPC9oMz5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4V3JhcDogJ3dyYXAnLCBnYXA6ICcxNnB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAge2RhdGEucHJvamVjdFN0YXRzLmJ5U3RhdHVzLm1hcCgoc3RhdHVzLCBpbmRleCkgPT4gKFxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpbmRleH0gc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEycHggMTZweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmYWZjJyxcclxuICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzhweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2UyZThmMCdcclxuICAgICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogc3RhdHVzLmNvbG9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICczcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5SaWdodDogJzhweCdcclxuICAgICAgICAgICAgICAgICAgICAgIH19PjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogJzUwMCcsIGNvbG9yOiAnIzM3NDE1MScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMuc3RhdHVzfToge3N0YXR1cy5jb3VudH1cclxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKX1cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICl9XHJcblxyXG4gICAgICAgIHthY3RpdmVUYWIgPT09ICdmaW5hbmNpYWwnICYmIChcclxuICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgZGlzcGxheTogJ2dyaWQnLCBcclxuICAgICAgICAgICAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiAncmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjAwcHgsIDFmcikpJywgXHJcbiAgICAgICAgICAgICAgZ2FwOiAnMTZweCcsXHJcbiAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMzJweCdcclxuICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5Ub3RhbCBSZXZlbnVlPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7Zm9ybWF0Q3VycmVuY3koZGF0YT8ub3ZlcnZpZXc/LnRvdGFsUmV2ZW51ZSB8fCAwKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYidcclxuICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICcjNmI3MjgwJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFdlaWdodDogJzUwMCcgfX0+VHJhbnNhY3Rpb25zPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMjRweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgICB7KGRhdGE/Lm92ZXJ2aWV3Py50b3RhbFRyYW5zYWN0aW9ucyB8fCAwKS50b0xvY2FsZVN0cmluZygpfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICcwIDFweCAzcHggcmdiYSgwLDAsMCwwLjEpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBjb2xvcjogJyM2YjcyODAnLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5Nb250aGx5IFJldmVudWU8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcyNHB4JywgZm9udFdlaWdodDogJzcwMCcsIGNvbG9yOiAnIzFlMjkzYicgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHtmb3JtYXRDdXJyZW5jeShkYXRhPy5vdmVydmlldz8ubW9udGhseVJldmVudWUgfHwgMCl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMnB4JyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMXB4IDNweCByZ2JhKDAsMCwwLDAuMSknLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInXHJcbiAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnIzZiNzI4MCcsIG1hcmdpbkJvdHRvbTogJzhweCcsIGZvbnRXZWlnaHQ6ICc1MDAnIH19PkF2ZyBUcmFuc2FjdGlvbjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzI0cHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY29sb3I6ICcjMWUyOTNiJyB9fT5cclxuICAgICAgICAgICAgICAgICAge2Zvcm1hdEN1cnJlbmN5KGRhdGE/Lm92ZXJ2aWV3Py5hdmdUcmFuc2FjdGlvbiB8fCAwKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTJweCcsXHJcbiAgICAgICAgICAgICAgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNlNWU3ZWInLFxyXG4gICAgICAgICAgICAgIHBhZGRpbmc6ICcyNHB4J1xyXG4gICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICA8aDMgc3R5bGU9e3sgbWFyZ2luOiAnMCAwIDE2cHggMCcsIGZvbnRTaXplOiAnMThweCcsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMxZTI5M2InIH19PlxyXG4gICAgICAgICAgICAgICAgRmluYW5jaWFsIE92ZXJ2aWV3XHJcbiAgICAgICAgICAgICAgPC9oMz5cclxuICAgICAgICAgICAgICA8cCBzdHlsZT17eyBtYXJnaW46ICcwJywgY29sb3I6ICcjNmI3MjgwJywgZm9udFNpemU6ICcxNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIEZpbmFuY2lhbCBhbmFseXRpY3MgcHJvdmlkZSBpbnNpZ2h0cyBpbnRvIHJldmVudWUgdHJlbmRzLCBwYXltZW50IHBhdHRlcm5zLCBhbmQgdHJhbnNhY3Rpb24gZGF0YS5cclxuICAgICAgICAgICAgICAgIHtkYXRhPy5vdmVydmlldz8udG90YWxSZXZlbnVlID4gMCBcclxuICAgICAgICAgICAgICAgICAgPyBgIEN1cnJlbnQgdG90YWwgcmV2ZW51ZSBzdGFuZHMgYXQgJHtmb3JtYXRDdXJyZW5jeShkYXRhLm92ZXJ2aWV3LnRvdGFsUmV2ZW51ZSl9IGFjcm9zcyAkeyhkYXRhLm92ZXJ2aWV3LnRvdGFsVHJhbnNhY3Rpb25zIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9IHRyYW5zYWN0aW9ucy5gXHJcbiAgICAgICAgICAgICAgICAgIDogJyBObyBwYXltZW50IGRhdGEgYXZhaWxhYmxlIHlldC4nXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICl9XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxufSIsIkFkbWluSlMuVXNlckNvbXBvbmVudHMgPSB7fVxyXG5pbXBvcnQgRGFzaGJvYXJkIGZyb20gJy4uLy4uL2Zyb250ZW5kL2FkbWluLWNvbXBvbmVudHMvZGFzaGJvYXJkJ1xyXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkRhc2hib2FyZCA9IERhc2hib2FyZFxyXG5pbXBvcnQgQW5hbHl0aWNzIGZyb20gJy4uLy4uL2Zyb250ZW5kL2FkbWluLWNvbXBvbmVudHMvYW5hbHl0aWNzJ1xyXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkFuYWx5dGljcyA9IEFuYWx5dGljc1xyXG5pbXBvcnQgUmVsYXRlZE1hdGVyaWFscyBmcm9tICcuLi8uLi9mcm9udGVuZC9hZG1pbi1jb21wb25lbnRzL2NvdXJzZS1jb21wb25lbnRzJ1xyXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlJlbGF0ZWRNYXRlcmlhbHMgPSBSZWxhdGVkTWF0ZXJpYWxzXHJcbmltcG9ydCBSZWxhdGVkRW5yb2xsbWVudHMgZnJvbSAnLi4vLi4vZnJvbnRlbmQvYWRtaW4tY29tcG9uZW50cy9jb3Vyc2UtY29tcG9uZW50cydcclxuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5SZWxhdGVkRW5yb2xsbWVudHMgPSBSZWxhdGVkRW5yb2xsbWVudHMiXSwibmFtZXMiOlsiYXBpIiwiQXBpQ2xpZW50IiwiQ291cnNlc01hbmFnZW1lbnQiLCJvbkJhY2siLCJjb3Vyc2VzIiwic2V0Q291cnNlcyIsInVzZVN0YXRlIiwibWF0ZXJpYWxzIiwic2V0TWF0ZXJpYWxzIiwiZW5yb2xsbWVudHMiLCJzZXRFbnJvbGxtZW50cyIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwiYWN0aXZlVGFiIiwic2V0QWN0aXZlVGFiIiwic2VhcmNoVGVybSIsInNldFNlYXJjaFRlcm0iLCJmaWx0ZXJTdGF0dXMiLCJzZXRGaWx0ZXJTdGF0dXMiLCJtb3VudGVkUmVmIiwidXNlUmVmIiwiZmV0Y2hBbGxEYXRhIiwidXNlQ2FsbGJhY2siLCJjb3Vyc2VzUmVzcG9uc2UiLCJyZXNvdXJjZUFjdGlvbiIsInJlc291cmNlSWQiLCJhY3Rpb25OYW1lIiwiY3VycmVudCIsImRhdGEiLCJyZWNvcmRzIiwibWF0ZXJpYWxzUmVzcG9uc2UiLCJlbnJvbGxtZW50c1Jlc3BvbnNlIiwiZXJyb3IiLCJjb25zb2xlIiwidXNlRWZmZWN0IiwiaW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJSZWFjdCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsImRpc3BsYXkiLCJqdXN0aWZ5Q29udGVudCIsImFsaWduSXRlbXMiLCJoZWlnaHQiLCJmb250U2l6ZSIsImNvbG9yIiwidGV4dEFsaWduIiwid2lkdGgiLCJib3JkZXIiLCJib3JkZXJUb3AiLCJib3JkZXJSYWRpdXMiLCJhbmltYXRpb24iLCJtYXJnaW4iLCJmaWx0ZXJlZENvdXJzZXMiLCJmaWx0ZXIiLCJjb3Vyc2UiLCJtYXRjaGVzU2VhcmNoIiwicGFyYW1zIiwidGl0bGUiLCJ0b0xvd2VyQ2FzZSIsImluY2x1ZGVzIiwiZGVzY3JpcHRpb24iLCJtYXRjaGVzU3RhdHVzIiwic3RhdHVzIiwiZmlsdGVyZWRNYXRlcmlhbHMiLCJtYXRlcmlhbCIsImNvdXJzZV90aXRsZSIsImZpbHRlcmVkRW5yb2xsbWVudHMiLCJlbnJvbGxtZW50IiwiZnJlZWxhbmNlcl9uYW1lIiwiZnJlZWxhbmNlcl9lbWFpbCIsImhhbmRsZVJlZnJlc2giLCJoYW5kbGVEZWxldGUiLCJyZWNvcmRJZCIsIml0ZW1OYW1lIiwiY29uZmlybSIsImFsZXJ0IiwiY29udGFpbmVyU3R5bGUiLCJiYWNrZ3JvdW5kQ29sb3IiLCJtaW5IZWlnaHQiLCJwYWRkaW5nIiwiZm9udEZhbWlseSIsImhlYWRlclN0eWxlIiwibWFyZ2luQm90dG9tIiwicGFkZGluZ0JvdHRvbSIsImJvcmRlckJvdHRvbSIsInRhYlN0eWxlIiwiaXNBY3RpdmUiLCJiYWNrZ3JvdW5kIiwiY3Vyc29yIiwiZm9udFdlaWdodCIsInRyYW5zaXRpb24iLCJtYXJnaW5SaWdodCIsInNlYXJjaEJhclN0eWxlIiwiZ2FwIiwiaW5wdXRTdHlsZSIsIm1pbldpZHRoIiwic2VsZWN0U3R5bGUiLCJidXR0b25TdHlsZSIsInRleHREZWNvcmF0aW9uIiwicmVmcmVzaEJ1dHRvblN0eWxlIiwic2VjdGlvbkhlYWRlclN0eWxlIiwiY2FyZFN0eWxlIiwiYm94U2hhZG93IiwiZ3JpZFN0eWxlIiwiZ3JpZFRlbXBsYXRlQ29sdW1ucyIsImVtcHR5U3RhdGVTdHlsZSIsIkNvdXJzZXNTZWN0aW9uIiwibGVuZ3RoIiwib25DbGljayIsImhyZWYiLCJ0eXBlIiwicGxhY2Vob2xkZXIiLCJ2YWx1ZSIsIm9uQ2hhbmdlIiwiZSIsInRhcmdldCIsIm1hcCIsImtleSIsImlkIiwib25Nb3VzZU92ZXIiLCJjdXJyZW50VGFyZ2V0IiwidHJhbnNmb3JtIiwib25Nb3VzZU91dCIsImxpbmVIZWlnaHQiLCJzdWJzdHJpbmciLCJmbGV4V3JhcCIsInByaWNlIiwiZHVyYXRpb24iLCJwYWRkaW5nVG9wIiwiTWF0ZXJpYWxzU2VjdGlvbiIsImZpbGVfdXJsIiwicmVsIiwic3BsaXQiLCJwb3AiLCJFbnJvbGxtZW50c1NlY3Rpb24iLCJmcmVlbGFuY2VyX2lkIiwiZW5yb2xsZWRfYXQiLCJEYXRlIiwidG9Mb2NhbGVEYXRlU3RyaW5nIiwicHJvZ3Jlc3MiLCJvdmVyZmxvdyIsIk1hdGgiLCJtaW4iLCJEYXNoYm9hcmQiLCJ0cmFuc2xhdGVNZXNzYWdlIiwidXNlVHJhbnNsYXRpb24iLCJzZXREYXRhIiwic2V0RXJyb3IiLCJhZG1pbkxvZ3MiLCJzZXRBZG1pbkxvZ3MiLCJ1c2VyTG9ncyIsInNldFVzZXJMb2dzIiwiY3VycmVudFZpZXciLCJzZXRDdXJyZW50VmlldyIsImZldGNoaW5nUmVmIiwiZmV0Y2hEYXNoYm9hcmREYXRhIiwicmVzcG9uc2UiLCJnZXREYXNoYm9hcmQiLCJhbGxMb2dzIiwicmVjZW50TG9ncyIsImFkbWlucyIsImxvZyIsInJvbGVfaWQiLCJmaXJzdF9uYW1lIiwic2xpY2UiLCJ1c2VycyIsIkVycm9yIiwiZXJyIiwibWVzc2FnZSIsInJlZnJlc2hJbnRlcnZhbCIsImxvZ0ludGVydmFsIiwiZmV0Y2giLCJvayIsIm5ld0xvZ3MiLCJqc29uIiwiZmxleERpcmVjdGlvbiIsIm1ldHJpY3MiLCJzdGF0c0NhcmRzIiwiYWRtaW5zQ291bnQiLCJsaW5rIiwiaWNvbiIsImNsaWVudHNDb3VudCIsImZyZWVsYW5jZXJzQ291bnQiLCJwcm9qZWN0c0NvdW50IiwicGVuZGluZ0FwcG9pbnRtZW50cyIsImNvdXJzZXNDb3VudCIsImFjdGlvbiIsInBsYW5zQ291bnQiLCJ0b3RhbFJldmVudWUiLCJ0b0xvY2FsZVN0cmluZyIsImhhbmRsZUNhcmRDbGljayIsImNhcmQiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImdldFRpbWVBZ28iLCJkYXRlU3RyaW5nIiwibm93IiwibG9nVGltZSIsImRpZmZNcyIsImRpZmZTZWNzIiwiZmxvb3IiLCJkaWZmTWlucyIsImRpZmZIb3VycyIsImRpZmZEYXlzIiwibWV0cmljc0dyaWRTdHlsZSIsInBvc2l0aW9uIiwiY2FyZFRpdGxlU3R5bGUiLCJ0ZXh0VHJhbnNmb3JtIiwibGV0dGVyU3BhY2luZyIsImNhcmRWYWx1ZVN0eWxlIiwiY2FyZEljb25TdHlsZSIsIm9wYWNpdHkiLCJsb2dzQ29udGFpbmVyU3R5bGUiLCJsb2dTZWN0aW9uU3R5bGUiLCJsb2dIZWFkZXJTdHlsZSIsImxvZ0l0ZW1TdHlsZSIsImxvZ0l0ZW1OYW1lU3R5bGUiLCJsb2dJdGVtQWN0aW9uU3R5bGUiLCJsb2dJdGVtVGltZVN0eWxlIiwiZm9udFN0eWxlIiwidmlld0JveCIsImZpbGwiLCJzdHJva2UiLCJzdHJva2VXaWR0aCIsImQiLCJpbmRleCIsImJvcmRlckNvbG9yIiwiYm90dG9tIiwibGVmdCIsInJpZ2h0IiwiaSIsImNsYXNzTmFtZSIsImxhc3RfbmFtZSIsImNyZWF0ZWRfYXQiLCJBbmFseXRpY3MiLCJkYXRlUmFuZ2UiLCJzZXREYXRlUmFuZ2UiLCJmZXRjaEFuYWx5dGljc0RhdGEiLCJhbmFseXRpY3NEYXRhIiwib3ZlcnZpZXciLCJhcHBvaW50bWVudHMiLCJhcHBvaW50bWVudFN0YXRzIiwidG9wRnJlZWxhbmNlcnMiLCJyZWNlbnRBcHBvaW50bWVudHMiLCJ1c2VyR3Jvd3RoIiwidXNlckRpc3RyaWJ1dGlvbiIsInJlY2VudFVzZXJzIiwicHJvamVjdFN0YXRzIiwiYnlTdGF0dXMiLCJmb3JtYXRDdXJyZW5jeSIsImFtb3VudCIsIkludGwiLCJOdW1iZXJGb3JtYXQiLCJjdXJyZW5jeSIsImZvcm1hdCIsImZvcm1hdERhdGUiLCJtb250aCIsImRheSIsImZvcm1hdFBlcmNlbnRhZ2UiLCJ0b0ZpeGVkIiwibGFiZWwiLCJ0YWIiLCJ0b3RhbFVzZXJzIiwibWFyZ2luVG9wIiwibmV3VXNlcnNUb2RheSIsInRvdGFsQXBwb2ludG1lbnRzIiwiYXBwb2ludG1lbnRzVG9kYXkiLCJhY3RpdmVQcm9qZWN0cyIsImNvbXBsZXRlZFByb2plY3RzIiwibW9udGhseVJldmVudWUiLCJtYXhIZWlnaHQiLCJvdmVyZmxvd1kiLCJib3JkZXJDb2xsYXBzZSIsInRvcCIsImFwcG9pbnRtZW50IiwiYXBwb2ludG1lbnRfdHlwZSIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwiZnJlZWxhbmNlcl9maXJzdF9uYW1lIiwiZnJlZWxhbmNlcl9sYXN0X25hbWUiLCJhY2NlcHRlZEFwcG9pbnRtZW50cyIsInJlamVjdGVkQXBwb2ludG1lbnRzIiwiYWNjZXB0YW5jZVJhdGUiLCJmcmVlbGFuY2VyIiwiZW1haWwiLCJ0b3RhbF9hcHBvaW50bWVudHMiLCJhY2NlcHRlZF9hcHBvaW50bWVudHMiLCJhY2NlcHRhbmNlX3JhdGUiLCJ0b3RhbENsaWVudHMiLCJ0b3RhbEZyZWVsYW5jZXJzIiwibmV3VXNlcnNNb250aCIsInVzZXIiLCJkcmFmdFByb2plY3RzIiwidG90YWxQcm9qZWN0cyIsImNvdW50IiwidG90YWxUcmFuc2FjdGlvbnMiLCJhdmdUcmFuc2FjdGlvbiIsIkFkbWluSlMiLCJVc2VyQ29tcG9uZW50cyIsIlJlbGF0ZWRNYXRlcmlhbHMiLCJSZWxhdGVkRW5yb2xsbWVudHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7RUFBQTtFQUlBLE1BQU1BLEtBQUcsR0FBRyxJQUFJQyxpQkFBUyxFQUFFO0VBRTNCLE1BQU1DLGlCQUFpQixHQUFHQSxDQUFDO0VBQUVDLEVBQUFBO0VBQU8sQ0FBQyxLQUFLO0lBQ3hDLE1BQU0sQ0FBQ0MsT0FBTyxFQUFFQyxVQUFVLENBQUMsR0FBR0MsY0FBUSxDQUFDLEVBQUUsQ0FBQztJQUMxQyxNQUFNLENBQUNDLFNBQVMsRUFBRUMsWUFBWSxDQUFDLEdBQUdGLGNBQVEsQ0FBQyxFQUFFLENBQUM7SUFDOUMsTUFBTSxDQUFDRyxXQUFXLEVBQUVDLGNBQWMsQ0FBQyxHQUFHSixjQUFRLENBQUMsRUFBRSxDQUFDO0lBQ2xELE1BQU0sQ0FBQ0ssT0FBTyxFQUFFQyxVQUFVLENBQUMsR0FBR04sY0FBUSxDQUFDLElBQUksQ0FBQztJQUM1QyxNQUFNLENBQUNPLFNBQVMsRUFBRUMsWUFBWSxDQUFDLEdBQUdSLGNBQVEsQ0FBQyxTQUFTLENBQUM7SUFDckQsTUFBTSxDQUFDUyxVQUFVLEVBQUVDLGFBQWEsQ0FBQyxHQUFHVixjQUFRLENBQUMsRUFBRSxDQUFDO0lBQ2hELE1BQU0sQ0FBQ1csWUFBWSxFQUFFQyxlQUFlLENBQUMsR0FBR1osY0FBUSxDQUFDLEtBQUssQ0FBQztFQUN2RCxFQUFBLE1BQU1hLFVBQVUsR0FBR0MsWUFBTSxDQUFDLElBQUksQ0FBQztFQUUvQixFQUFBLE1BQU1DLFlBQVksR0FBR0MsaUJBQVcsQ0FBQyxZQUFZO01BQzNDLElBQUk7UUFDRlYsVUFBVSxDQUFDLElBQUksQ0FBQzs7RUFFaEI7RUFDQSxNQUFBLE1BQU1XLGVBQWUsR0FBRyxNQUFNdkIsS0FBRyxD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
