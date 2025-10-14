import PeopleTable from "../Tables";

export default function Clients() {
  return (
    <PeopleTable
      title="Clients"
      addLabel="Add Client"
      endpoint="/clients"
      columns={[
        { label: "Name", key: "name" },
        { label: "Type", key: "type" },
        { label: "Number", key: "phone" },
        { label: "Country", key: "city" },
      ]}
      formFields={[
        { key: "name", label: "Name", required: true },
        {
          key: "type",
          label: "Type",
          type: "select",
          options: ["Online", "Offline", "VIP"],
        },
        {
          key: "phone",
          label: "Number",
          type: "tel",
          placeholder: "07xxxxxxxx",
        },
        { key: "city", label: "Country" },
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
      chips={[
        { label: "All", value: "" },
        { label: "VIP", value: "VIP" },
        { label: "Online", value: "Online" },
        { label: "Offline", value: "Offline" },
      ]}
      chipField="type"
      filters={[
        { key: "type", label: "Type", options: ["VIP", "Online", "Offline"] },
        { key: "city", label: "Country" },
      ]}
    />
  );
}
