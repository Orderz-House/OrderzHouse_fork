import PeopleTable from "../Tables";

export default function News() {
  return (
    <PeopleTable
      title="News"
      addLabel="Add Post"
      endpoint="/news"
      columns={[
        { label: "Title", key: "title" },
        { label: "Category", key: "category" },
        { label: "Author", key: "author" },
        { label: "Date", key: "date" },
        { label: "Status", key: "status" },
      ]}
      formFields={[
        { key: "title", label: "Title", required: true },
        {
          key: "category",
          label: "Category",
          type: "select",
          options: ["Product", "Company", "Status"],
        },
        { key: "author", label: "Author" },
        { key: "date", label: "Date", type: "date" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["Draft", "Published", "Archived"],
          defaultValue: "Draft",
        },
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
        {
          key: "category",
          label: "Category",
          options: ["Product", "Company", "Status"],
        },
        {
          key: "status",
          label: "Status",
          options: ["Draft", "Published", "Archived"],
        },
      ]}
    />
  );
}
