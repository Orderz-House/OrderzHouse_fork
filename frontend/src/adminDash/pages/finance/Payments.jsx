import { useSelector } from "react-redux";
import PeopleTable from "../Tables";

function mapRole(roleId) {
  if (roleId === 1) return "admin";
  if (roleId === 2) return "client";
  if (roleId === 3) return "freelancer";
  return "user";
}

export default function Payments() {
  const { user } = useSelector((state) => state.auth);
  const role = mapRole(user?.role_id);

  const configs = {
    admin: {
      endpoint: "/api/payments",
      columns: [
        { label: "User", key: "user" },
        { label: "Amount", key: "amount" },
        { label: "Method", key: "method" },
        { label: "Status", key: "status" },
        { label: "Date", key: "date" },
        { label: "Reference", key: "ref" },
      ],
    },
    client: {
      endpoint: "/api/client/payments",
      columns: [
        { label: "Project", key: "project" },
        { label: "Amount", key: "amount" },
        { label: "Method", key: "method" },
        { label: "Status", key: "status" },
        { label: "Date", key: "date" },
      ],
    },
    freelancer: {
      endpoint: "/api/freelancer/payments",
      columns: [
        { label: "Project", key: "project" },
        { label: "Amount", key: "amount" },
        { label: "Status", key: "status" },
        { label: "Date", key: "date" },
      ],
    },
    user: {
      endpoint: "/api/payments",
      columns: [
        { label: "Amount", key: "amount" },
        { label: "Status", key: "status" },
        { label: "Date", key: "date" },
      ],
    },
  };

  const { endpoint, columns } = configs[role] ?? configs.user;

  return (
    <PeopleTable
      title="Payments"
      addLabel="Add Payment"
      endpoint={endpoint}
      columns={columns}
    />
  );
}
