import { useSelector } from "react-redux";
import PeopleTable from "../Tables";

export default function Blogs() {
  const { userData, user } = useSelector((s) => s.auth);
  const roleId = userData?.role_id ?? user?.role_id;
  const isAdmin = roleId === 1;

  return (
    <PeopleTable
      title="Blogs"
      addLabel="Add Post"
      endpoint="/blogs"
      
      columns={[
        { label: "Title", key: "title" },
        { label: "Category", key: "category" },
        { label: "Author", key: "author" },
        { label: "Date", key: "date" },
        { label: "Status", key: "status" },
      ]}
      formFields={[
        { key: "title", label: "Title", required: true },
        { key: "category", label: "Category", type: "select", options: ["Product", "Company", "Status"] },
        { key: "author", label: "Author" },
        { key: "date", label: "Date", type: "date" },
        { key: "status", label: "Status", type: "select", options: ["Draft", "Published", "Archived"], defaultValue: "Draft" },
        { key: "content", label: "Content", type: "textarea" },
      ]}
      chips={[
        { label: "All", value: "" },
        { label: "Draft", value: "Draft" },
        { label: "Published", value: "Published" },
        { label: "Archived", value: "Archived" },
      ]}
      chipField="status"
      filters={[
        { key: "category", label: "Category", options: ["Product", "Company", "Status"] },
        { key: "status", label: "Status", options: ["Draft", "Published", "Archived"] },
      ]}
    />
  );
}
