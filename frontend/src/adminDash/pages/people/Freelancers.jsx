// src/pages/Freelancers.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PeopleTable from "../Tables";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../api/users";

export default function Freelancers() {
  const { roleId, token } = useSelector((state) => state.auth);

  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || Number(roleId) !== 1) return;

    const fetchFreelancers = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getUsers(3, token); // roleId 3 = freelancers
        setFreelancers(data.users || []);
      } catch (err) {
        setError(err.message || "Failed to fetch freelancers");
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, [token, roleId]);

  if (!token) {
    return (
      <div className="text-center mt-10 text-red-500">
        Please log in to access this page.
      </div>
    );
  }

  if (Number(roleId) !== 1) {
    return (
      <div className="text-center mt-10 text-red-500">
        Access denied: Admins only.
      </div>
    );
  }

  if (loading) return <div className="text-center mt-10">Loading freelancers...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <PeopleTable
      title="Freelancers"
      addLabel="Add Freelancer"
      initialRows={freelancers}
      onAdd={async (formData) => {
        try {
          const newUser = await createUser(formData);
          setFreelancers((prev) => [...prev, newUser]);
        } catch (err) {
          alert(err.message || "Failed to create freelancer");
        }
      }}
      onEdit={async (id, formData) => {
        try {
          const updatedUser = await updateUser(id, formData, token);
          setFreelancers((prev) =>
            prev.map((f) => (f.id === updatedUser.id ? updatedUser : f))
          );
        } catch (err) {
          alert(err.message || "Failed to update freelancer");
        }
      }}
      onDelete={async (id) => {
        if (!confirm("Do you want to delete this record?")) return;
        try {
          await deleteUser(id);
          setFreelancers((prev) => prev.filter((f) => f.id !== id));
        } catch (err) {
          alert(err.message || "Failed to delete freelancer");
        }
      }}
      columns={[
        {
          label: "",
          key: "profile_pic_url",
          render: (row) =>
            row.profile_pic_url ? (
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={row.profile_pic_url}
                  alt={`${row.first_name} ${row.last_name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">N/A</span>
              </div>
            ),
        },
        { label: "ID", key: "id" },
        { label: "First Name", key: "first_name" },
        { label: "Last Name", key: "last_name" },
        { label: "Username", key: "username" },
        { label: "Email", key: "email" },
        { label: "Country", key: "country" },
        {
          label: "Rating",
          key: "rating",
          render: (row) =>
            row.rating_count ? (row.rating_sum / row.rating_count).toFixed(2) : "0",
        },
        {
          label: "Verified",
          key: "is_verified",
          render: (row) => (row.is_verified ? "Yes" : "No"),
        },
        {
          label: "Online",
          key: "is_online",
          render: (row) => (row.is_online ? "Yes" : "No"),
        },
      ]}
      formFields={[
        { key: "first_name", label: "First Name", required: true },
        { key: "last_name", label: "Last Name", required: true },
        { key: "username", label: "Username", required: true },
        { key: "email", label: "Email", type: "email", required: true },
        { key: "country", label: "Country" },
        { key: "bio", label: "Bio", type: "textarea" },
      ]}
      filters={[
        { key: "country", label: "Country" },
        {
          key: "is_verified",
          label: "Verified",
          options: [
            { value: "true", label: "Yes" },
            { value: "false", label: "No" },
          ],
        },
      ]}
    />
  );
}
