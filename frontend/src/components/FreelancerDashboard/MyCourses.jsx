import React, { useEffect, useState } from "react";
import axios from "axios";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/courses/my-courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(res.data.courses || []);
      } catch (error) {
        console.error("Error loading courses:", error);
      }
    };
    fetchMyCourses();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">My Courses</h1>
          {courses.length === 0 ? (
            <p className="text-gray-500">No courses enrolled yet.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <li key={course.id} className="border rounded-lg p-4 text-left">
                  <h2 className="font-semibold text-gray-800">{course.title}</h2>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{course.description}</p>
                  <p className="text-gray-800 font-medium mt-2">${course.price}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
