import React, { useState, useEffect } from "react";
import API from "../../api/client.js";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Users, BookOpen, Check, X } from "lucide-react";

const AdminAccessControl = () => {
  const { token } = useSelector((state) => state.auth);
  const [freelancers, setFreelancers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [accessData, setAccessData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [freelancersRes, coursesRes, accessRes] = await Promise.all([
          API.get("/users/freelancers/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          API.get("/courses/view", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          API.get("/access-control/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setFreelancers(freelancersRes.data.freelancers || []);
        setCourses(coursesRes.data.courses || []);
        setAccessData(accessRes.data.accessControl || {});
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const toggleAccess = async (freelancerId, courseId) => {
    const currentAccess = accessData[freelancerId]?.[courseId] || false;
    try {
      await API.post(
        "/access-control/grant-access",
        {
          freelancer_id: freelancerId,
          course_id: courseId,
          can_access: !currentAccess,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAccessData((prev) => ({
        ...prev,
        [freelancerId]: {
          ...prev[freelancerId],
          [courseId]: !currentAccess,
        },
      }));
      toast.success(currentAccess ? "Access revoked!" : "Access granted!");
    } catch (err) {
      console.error("Error toggling access:", err);
      toast.error("Failed to update access.");
    }
  };

  const filteredCourses = selectedFreelancerId ? courses : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-center space-x-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Course Access Control
              </h1>
              <p className="text-gray-600 mt-2">
                Manage freelancer access to courses
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Freelancer List */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Freelancers
            </h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {freelancers.map((freelancer) => (
                <button
                  key={freelancer.id}
                  onClick={() => setSelectedFreelancerId(freelancer.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedFreelancerId === freelancer.id
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="font-medium">
                    {freelancer.first_name} {freelancer.last_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {freelancer.email}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Course Access Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                Course Access{" "}
                {selectedFreelancerId ? "for Selected Freelancer" : ""}
              </h2>

              {selectedFreelancerId ? (
                <div className="space-y-4">
                  {filteredCourses.map((course) => {
                    const hasAccess =
                      accessData[selectedFreelancerId]?.[course.id] || false;
                    return (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {course.description}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            toggleAccess(selectedFreelancerId, course.id)
                          }
                          className={`p-2 rounded-lg ${
                            hasAccess
                              ? "bg-green-100 text-green-600 hover:bg-green-200"
                              : "bg-red-100 text-red-600 hover:bg-red-200"
                          }`}
                          title={hasAccess ? "Revoke Access" : "Grant Access"}
                        >
                          {hasAccess ? (
                            <X className="w-5 h-5" />
                          ) : (
                            <Check className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Select a freelancer to manage their course access</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccessControl;
