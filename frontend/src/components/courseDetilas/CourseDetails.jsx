import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toastError, toastSuccess } from "../../services/toastService";
import { useParams } from 'react-router-dom';
import { ArrowLeft, Play, Download, Clock, Users, DollarSign, BookOpen } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolled, setEnrolled] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, matRes, enrollRes] = await Promise.all([
          axios.get(`http://localhost:5000/courses/view/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://localhost:5000/courses/${id}/materials`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://localhost:5000/courses/${id}/enrollment`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setCourse(courseRes.data.course);
        setMaterials(matRes.data.materials);
        setEnrolled(enrollRes.data.enrolled);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  const handleEnroll = async () => {
    try {
      await axios.post('http://localhost:5000/courses/enroll', { course_id: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrolled(true);
      toastSuccess("Enrolled successfully!");
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed');
      toastError('Enrollment failed');
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!course) return <Error message="Course not found" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button onClick={() => window.history.back()} className="flex items-center text-blue-600 mb-4">
            <ArrowLeft className="w-5 h-5 mr-1" /> Back
          </button>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-gray-600 mt-2">{course.description}</p>
              <div className="flex flex-wrap gap-6 mt-4 text-gray-600">
                <span className="flex items-center"><DollarSign className="w-5 h-5 mr-1" />${course.price}</span>
                <span className="flex items-center"><Clock className="w-5 h-5 mr-1" />10 hours</span>
                <span className="flex items-center"><BookOpen className="w-5 h-5 mr-1" />{materials.length} lessons</span>
                <span className="flex items-center"><Users className="w-5 h-5 mr-1" />150 students</span>
              </div>
            </div>
            <div className="lg:w-80">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-2xl font-bold text-gray-900">${course.price}</div>
                <div className="text-gray-500 text-sm mb-4">One-time payment</div>
                {enrolled ? (
                  <button disabled className="w-full bg-green-600 text-white py-3 rounded">Enrolled</button>
                ) : (
                  <button onClick={handleEnroll} className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700">
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Course Content</h2>
            <div className="bg-white rounded-lg shadow-sm">
              {materials.map((m, i) => (
                <div key={m.id} className="p-6 border-b last:border-b-0 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Play className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Lesson {i + 1}: {m.title}</h3>
                        <p className="text-sm text-gray-500">15 min</p>
                      </div>
                    </div>
                    <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold mb-4">What You'll Learn</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Advanced programming</span>
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Real-world projects</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Loading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin h-10 w-10 border-4 border-blue-600 rounded-full"></div>
  </div>
);

const Error = ({ message }) => (
  <div className="flex items-center justify-center h-64 text-red-600">{message}</div>
);

export default CourseDetail;