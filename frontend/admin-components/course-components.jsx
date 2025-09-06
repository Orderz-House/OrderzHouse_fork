import React from 'react';

const RelatedMaterials = ({ record }) => {
  const materials = record.params?.course_materials || [];
  const courseId = record.params?.id;

  if (!materials.length) {
    return (
      <div style={{ 
        background: '#f8f9fa', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '16px' 
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          Course Materials
        </h3>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          No materials uploaded yet.
        </p>
        <a 
          href={`/admin/resources/course_materials/actions/new?course_id=${courseId}`}
          style={{
            background: '#3b82f6',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '14px'
          }}
        >
          Add Material
        </a>
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#f8f9fa', 
      padding: '16px', 
      borderRadius: '8px', 
      marginBottom: '16px' 
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '12px' 
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
          Course Materials ({materials.length})
        </h3>
        <a 
          href={`/admin/resources/course_materials/actions/new?course_id=${courseId}`}
          style={{
            background: '#3b82f6',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '12px'
          }}
        >
          Add Material
        </a>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {materials.map((material) => (
          <div 
            key={material.id} 
            style={{ 
              background: 'white', 
              padding: '12px', 
              borderRadius: '6px', 
              border: '1px solid #e5e7eb'
            }}
          >
            <p style={{ fontWeight: '500', margin: '0 0 4px 0' }}>
              Material #{material.id}
            </p>
            <a 
              href={material.file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#3b82f6', fontSize: '14px', textDecoration: 'none' }}
            >
              {material.file_url}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

const RelatedEnrollments = ({ record }) => {
  const enrollments = record.params?.course_enrollments || [];
  const courseId = record.params?.id;

  if (!enrollments.length) {
    return (
      <div style={{ 
        background: '#f8f9fa', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '16px' 
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          Course Enrollments
        </h3>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          No enrollments yet.
        </p>
        <a 
          href={`/admin/resources/course_enrollments/actions/new?course_id=${courseId}`}
          style={{
            background: '#10b981',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '14px'
          }}
        >
          Add Enrollment
        </a>
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#f8f9fa', 
      padding: '16px', 
      borderRadius: '8px', 
      marginBottom: '16px' 
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '12px' 
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
          Enrollments ({enrollments.length})
        </h3>
        <a 
          href={`/admin/resources/course_enrollments/actions/new?course_id=${courseId}`}
          style={{
            background: '#10b981',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '12px'
          }}
        >
          Add Enrollment
        </a>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {enrollments.map((enrollment) => (
          <div 
            key={enrollment.id} 
            style={{ 
              background: 'white', 
              padding: '12px', 
              borderRadius: '6px', 
              border: '1px solid #e5e7eb'
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <p style={{ fontWeight: '500', margin: '0 0 4px 0' }}>
                {enrollment.freelancer_name || `User #${enrollment.freelancer_id}`}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>
                {enrollment.freelancer_email || 'No email'}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
              </p>
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <span style={{ 
                fontSize: '12px', 
                fontWeight: '500', 
                color: '#1e40af',
                background: '#dbeafe',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {enrollment.progress || 0}% Complete
              </span>
            </div>
            
            <div style={{ 
              width: '100%', 
              background: '#e5e7eb', 
              borderRadius: '4px', 
              height: '6px'
            }}>
              <div 
                style={{ 
                  background: '#3b82f6', 
                  height: '6px', 
                  borderRadius: '4px',
                  width: `${enrollment.progress || 0}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { RelatedMaterials, RelatedEnrollments };
export default RelatedMaterials;