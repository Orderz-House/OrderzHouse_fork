import PeopleTable from "../Tables";

export default function Freelancers() {
  return (
    <PeopleTable
      title="Freelancers"
      addLabel="Add Freelancer"
      endpoint="/freelancers"
      columns={[
        { label: "Name", key: "name" },
        { label: "Role", key: "role" },
        { label: "Rate", key: "rate" },
        { label: "Country", key: "country" },
      ]}
      formFields={[
        { key: "name", label: "Name", required: true },
        {
          key: "role",
          label: "Role",
          type: "select",
          options: ["Frontend Dev", "Backend Dev", "Designer"],
        },
        { key: "rate", label: "Rate", type: "text", placeholder: "$25/h" },
        { key: "city", label: "City" },
        {
          key: "skills",
          label: "Skills",
          type: "textarea",
          placeholder: "React, Node…",
        },
        {
          key: "badge",
          label: "Badge",
          type: "select",
          options: ["Top Rated", "Available", "Busy"],
        },
        { key: "portfolioUrl", label: "Portfolio URL", type: "text" },
      ]}
      chips={[
        { label: "All", value: "" },
        { label: "Top Rated", value: "Top Rated" },
        { label: "Available", value: "Available" },
        { label: "Busy", value: "Busy" },
      ]}
      chipField="badge"
      filters={[
        { key: "role", label: "Role" },
        { key: "city", label: "City" },
        {
          key: "badge",
          label: "Badge",
          options: ["Top Rated", "Available", "Busy"],
        },
      ]}
    />
  );
}
