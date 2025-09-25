import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { ApiClient } from "adminjs";

const api = new ApiClient();

export default function UserManagementDashboard({ initialTab = "admins", onBack }) {
  const [role, setRole] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Redirect if somehow no role was provided
  useEffect(() => {
    if (!role) {
      setRole("admins");
    }
  }, [role]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Adjust endpoint to your backend API
        const res = await api.resource(role).list();
        setUsers(res?.data?.records || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [role]);

  const getRoleLabel = (r) => {
    if (r === "admins") return "Admin";
    if (r === "clients") return "Client";
    if (r === "freelancers") return "Freelancer";
    return "User";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-800">
          {getRoleLabel(role)} Management
        </h1>

        <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add {getRoleLabel(role)}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b pb-2 mb-4">
        {["admins", "clients", "freelancers"].map((tab) => (
          <button
            key={tab}
            onClick={() => setRole(tab)}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              role === tab
                ? "bg-white border border-b-0 text-teal-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {getRoleLabel(tab)}s
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500">
            No {getRoleLabel(role)}s found
          </p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-100 text-gray-700">
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{u.id}</td>
                  <td className="p-3">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
