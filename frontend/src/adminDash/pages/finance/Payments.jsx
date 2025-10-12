import PeopleTable from "../Tables";

export default function Payments() {
  return (
    <PeopleTable
      title="Payments"
      addLabel="Add Payment"
      endpoint="/api/payments"
      columns={[
        { label: "User", key: "user" },
        { label: "Amount", key: "amount" },
        { label: "Method", key: "method" },
        { label: "Status", key: "status" },
        { label: "Date", key: "date" },
        { label: "Reference", key: "ref" },
      ]}
      formFields={[
        { key: "user", label: "User", required: true },
        { key: "amount", label: "Amount", type: "number" },
        {
          key: "method",
          label: "Method",
          type: "select",
          options: ["Card", "PayPal", "Bank", "Cash"],
          defaultValue: "Card",
        },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["Paid", "Pending", "Refunded", "Failed"],
          defaultValue: "Paid",
        },
        { key: "date", label: "Date", type: "date" },
        { key: "ref", label: "Reference" },
      ]}
      chips={[
        { label: "All", value: "" },
        { label: "Paid", value: "Paid" },
        { label: "Pending", value: "Pending" },
        { label: "Refunded", value: "Refunded" },
        { label: "Failed", value: "Failed" },
      ]}
      chipField="status"
      filters={[
        {
          key: "method",
          label: "Method",
          options: ["Card", "PayPal", "Bank", "Cash"],
        },
        {
          key: "status",
          label: "Status",
          options: ["Paid", "Pending", "Refunded", "Failed"],
        },
      ]}
    />
  );
}
