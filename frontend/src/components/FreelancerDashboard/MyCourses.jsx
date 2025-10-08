import React from 'react';

const MyCourses = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">My Courses</h1>
          <p className="text-gray-600 mb-6">
            Your enrolled courses will appear here.
          </p>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-500">No courses enrolled yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;