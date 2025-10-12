import PeopleTable from "../Tables";

export default function Appointments() {
  return (
    <PeopleTable
      title="Appointments"
      addLabel="Add Appointment"
      endpoint="/api/appointments"
      columns={[
        { label: "Subject", key: "subject" },
        { label: "With", key: "with" },
        { label: "Date", key: "date" },
        { label: "Channel", key: "channel" },
        { label: "Status", key: "status" },
      ]}
      formFields={[
        { key: "subject", label: "Subject", required: true },
        { key: "with", label: "With" },
        { key: "date", label: "Date", type: "date" },
        {
          key: "channel",
          label: "Channel",
          type: "select",
          options: ["Online", "Offline"],
          defaultValue: "Online",
        },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["Scheduled", "Completed", "Canceled"],
          defaultValue: "Scheduled",
        },
      ]}
      chips={[
        { label: "All", value: "" },
        { label: "Scheduled", value: "Scheduled" },
        { label: "Completed", value: "Completed" },
        { label: "Canceled", value: "Canceled" },
      ]}
      chipField="status"
      filters={[
        { key: "channel", label: "Channel", options: ["Online", "Offline"] },
        // لو حابب تضيف مدى تاريخي كفلاتر نصية:
        // { key: "from", label: "From (YYYY-MM-DD)" },
        // { key: "to", label: "To (YYYY-MM-DD)" },
      ]}
    />
  );
}
