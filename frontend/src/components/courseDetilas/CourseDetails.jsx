import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Download,
  Clock,
  Users,
  DollarSign,
  BookOpen,
} from "lucide-react";

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    checkEnrollment();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const [courseRes, materialsRes] = await Promise.all([
        axios.get(`http://localhost:5000/courses/view/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:5000/courses/${id}/materials`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (courseRes.data.success) {
        setCourse(courseRes.data.course);
      }
      if (materialsRes.data.success) {
        setMaterials(materialsRes.data.materials);
      }
    } catch (error) {
      setError("Failed to fetch course details");
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/courses/${id}/enrollment`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEnrolled(response.data.enrolled);
    } catch (error) {
      setEnrolled(false);
    }
  };

  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/courses/enroll",
        { course_id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setEnrolled(true);
        alert("Successfully enrolled in the course!");
      }
    } catch (error) {
      setError("Failed to enroll in course");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Course not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Courses
          </button>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              <p className="text-gray-600 mb-6">{course.description}</p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-5 h-5 mr-2" />${course.price}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  10 hours
                </div>
                <div className="flex items-center text-gray-600">
                  <BookOpen className="w-5 h-5 mr-2" />
                  {materials.length} lessons
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-2" />
                  150 students
                </div>
              </div>
            </div>

            <div className="lg:w-80">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900">
                    ${course.price}
                  </div>
                  <div className="text-gray-600">One-time payment</div>
                </div>

                {enrolled ? (
                  <button
                    disabled
                    className="w-full bg-green-600 text-white py-3 rounded-lg mb-4"
                  >
                    Already Enrolled
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 mb-4"
                  >
                    Enroll Now
                  </button>
                )}

                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-2">
                    <span>Duration</span>
                    <span>10 hours</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Lessons</span>
                    <span>{materials.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level</span>
                    <span>Beginner</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Materials Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Course Content
            </h2>

            <div className="bg-white rounded-xl shadow-sm">
              {materials.map((material, index) => (
                <div key={material.id} className="border-b last:border-b-0">
                  <div className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <Play className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Lesson {index + 1}: {material.title}
                          </h3>
                          <p className="text-sm text-gray-600">15 min</p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                What you'll learn
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-600">
                    Advanced programming concepts
                  </span>
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-600">
                    Real-world project experience
                  </span>
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Industry best practices</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
