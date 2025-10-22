// src/pages/Clients.jsx
import { useSelector } from "react-redux";
import PeopleTable from "../Tables";

export default function Clients() {
  const { roleId, token } = useSelector((state) => state.auth);

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
      title="Clients"
      addLabel="Add Client"
      endpoint="/admUser/role/2"
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
                  alt={row.first_name || row.name || "Client"}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs font-semibold">
                  {(row.first_name || row.name)?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
            ),
        },
        { label: "ID", key: "id" },
        { 
          label: "Name", 
          key: "name",
          render: (row) => `${row.first_name || ""} ${row.last_name || ""}`.trim() || row.name || "-"
        },
        { label: "Username", key: "username" },
        { label: "Email", key: "email" },
        { label: "Phone", key: "phone_number" },
        { label: "Country", key: "country" },
      ]}
      formFields={[
        { key: "first_name", label: "First Name", required: true },
        { key: "last_name", label: "Last Name", required: true },
        { key: "username", label: "Username", required: true },
        { key: "email", label: "Email", type: "email", required: true },
        { key: "password", label: "Password", type: "password", placeholder: "Leave blank to keep current" },
        {
          key: "phone_number",
          label: "Phone Number",
          type: "tel",
          placeholder: "07xxxxxxxx",
        },
        { key: "country", label: "Country" },
        { key: "bio", label: "Bio/Notes", type: "textarea" },
      ]}
      filters={[]}
    />
  );
}