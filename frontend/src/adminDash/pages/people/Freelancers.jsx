// src/pages/Freelancers.jsx
import { useSelector } from "react-redux";
import PeopleTable from "../Tables";

export default function Freelancers() {
  const { roleId, token } = useSelector((state) => state.auth);

  // Access control checks
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

  return (
    <PeopleTable
      title="Freelancers"
      addLabel="Add Freelancer"
      endpoint="/admUser/role/3"
      getOnePath={(id) => `/admUser/${id}`}
      token={token}
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
                <span className="text-gray-400 text-xs">N/A</span>
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
            row.rating_count && row.rating_sum
              ? (row.rating_sum / row.rating_count).toFixed(2)
              : "0.00",
        },
        {
          label: "Verified",
          key: "is_verified",
          render: (row) => (row.is_verified ? "✓ Yes" : "✗ No"),
        },
        {
          label: "Online",
          key: "is_online",
          render: (row) => (
            <span
              className={`inline-flex items-center gap-1.5 ${
                row.is_online ? "text-green-600" : "text-gray-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  row.is_online ? "bg-green-600" : "bg-gray-400"
                }`}
              />
              {row.is_online ? "Online" : "Offline"}
            </span>
          ),
        },
      ]}
      formFields={[
        { key: "first_name", label: "First Name", required: true },
        { key: "last_name", label: "Last Name", required: true },
        { key: "username", label: "Username", required: true },
        { key: "email", label: "Email", type: "email", required: true },
        { key: "password", label: "Password", type: "password", placeholder: "Leave blank to keep current" },
        { key: "country", label: "Country" },
        { key: "bio", label: "Bio", type: "textarea" },
        { key: "hourly_rate", label: "Hourly Rate", type: "number" },
        {
          key: "is_verified",
          label: "Verified",
          type: "select",
          options: [
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ],
          defaultValue: false,
        },
      ]}
      filters={[]}
    />
  );
}