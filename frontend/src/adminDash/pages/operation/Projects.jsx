import PeopleTable from "../Tables";

export default function Projects() {
  // بيانات وهمية للتجربة
  const mockProjects = [
    {
      id: "p1",
      title: "Website Redesign",
      client: "Tech Corp",
      owner: "Ali Ahmed",
      due: "2025-11-01",
      budget: 12000,
      progress: 60,
      status: "Active",
    },
    {
      id: "p2",
      title: "Brand Identity",
      client: "Design House",
      owner: "Sara Khalid",
      due: "2025-12-10",
      budget: 5000,
      progress: 30,
      status: "Planning",
    },
  ];

  return (
    <PeopleTable
      title="Projects"
      addLabel="Add Project"
      // endpoint="/api/projects"  ← احذفها الآن عشان نستخدم بيانات وهمية
      initialRows={mockProjects} // ← هنا أضفنا البيانات الوهمية
      columns={[
        { label: "Title", key: "title" },
        { label: "Client", key: "client" },
        { label: "Owner", key: "owner" },
        { label: "Due", key: "due" },
        { label: "Budget", key: "budget" },
        { label: "Progress", key: "progress" },
        { label: "Status", key: "status" },
      ]}
      formFields={[
        { key: "title", label: "Title", required: true },
        { key: "client", label: "Client" },
        { key: "owner", label: "Owner" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["Planning", "Active", "On hold", "Done"],
          defaultValue: "Planning",
        },
        {
          key: "progress",
          label: "Progress %",
          type: "number",
          defaultValue: 0,
        },
        {
          key: "budget",
          label: "Budget",
          type: "number",
          placeholder: "12000",
        },
        { key: "due", label: "Due", type: "date" },
        { key: "description", label: "Description", type: "textarea" },
      ]}
      chips={[
        { label: "All", value: "" },
        { label: "Active", value: "Active" },
        { label: "Planning", value: "Planning" },
        { label: "On hold", value: "On hold" },
        { label: "Done", value: "Done" },
      ]}
      chipField="status"
      filters={[
        {
          key: "status",
          label: "Status",
          options: ["Planning", "Active", "On hold", "Done"],
        },
      ]}
    />
  );
}
