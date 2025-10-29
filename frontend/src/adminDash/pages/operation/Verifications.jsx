import { FiCheck, FiX } from "react-icons/fi";
import PeopleTable from "../Tables";
import { MOCK_ENABLED, mockFetch } from "../mockData.js";

export default function Verifications() {
  const initialRows = MOCK_ENABLED ? (mockFetch("/api/admin/verifications") ?? []) : undefined;

  return (
    <PeopleTable
      title="Verifications"
      addLabel="Add"
      endpoint="/api/admin/verifications"
      initialRows={initialRows}

      columns={[
        { label: "Name",           key: "name" },
        { label: "Email",          key: "email" },
        { label: "Phone",          key: "phone" },
        { label: "Specialization", key: "specialization" },
        { label: "Submitted",      key: "submittedAt" },
        { label: "Status",         key: "status" },
      ]}

      formFields={[
        { key: "name",           label: "Name", required: true },
        { key: "email",          label: "Email", type: "email" },
        { key: "phone",          label: "Phone", type: "tel" },
        { key: "specialization", label: "Specialization" },
        { key: "submittedAt",    label: "Submitted", type: "date" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["Pending", "Approved", "Rejected"],
          defaultValue: "Pending",
        },
      ]}

      chips={[
        { label: "All",      value: "" },
        { label: "Pending",  value: "Pending" },
        { label: "Approved", value: "Approved" },
        { label: "Rejected", value: "Rejected" },
      ]}
      chipField="status"
      filters={[
        { key: "specialization", label: "Specialization" },
        { key: "status",         label: "Status", options: ["Pending", "Approved", "Rejected"] },
      ]}

      hideCrudActions

      renderActions={(row, helpers) => {
        if (!row) return null; 
        const id = typeof helpers?.getId === "function"
          ? helpers.getId(row)
          : (row.id ?? row._id);

        const isApproved = row.status === "Approved";
        const isRejected = row.status === "Rejected";

        const approve = async () => {
          helpers.updateRow?.(id, { status: "Approved" });
        };

        const reject = async () => {
          helpers.updateRow?.(id, { status: "Rejected" });
        };

        return (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={approve}
              disabled={isApproved}
              className="inline-flex h-9 w-9 sm:h-auto sm:w-auto items-center justify-center rounded-xl px-3 py-2 text-white disabled:opacity-50"
              style={{ backgroundColor: "#028090" }}
              title="Approve"
            >
              <FiCheck />
            </button>

            <button
              onClick={reject}
              disabled={isRejected}
              className="h-8 px-2.5 rounded-full border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5 text-xs"
              title="Reject"
            >
              <FiX />
            </button>
          </div>
        );
      }}
    />
  );
}
