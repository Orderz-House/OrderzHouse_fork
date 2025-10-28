import PeopleTable from "../Tables";
import { MOCK_ENABLED, mockFetch } from "../mockData.js";
import ApproveRejectButtons from "../../../components/buttons/ApproveRejectButtons.jsx";
import { useSelector } from "react-redux";

export default function Verifications() {
  const { token } = useSelector((s) => s.auth || {}); 

  const initialRows = MOCK_ENABLED
    ? mockFetch("/api/admin/verifications") ?? []
    : undefined;

  return (
    <PeopleTable
      title="Verifications"
      endpoint="/api/admin/verifications"
      initialRows={initialRows}
      columns={[
        { label: "Name", key: "name" },
        { label: "Email", key: "email" },
        { label: "Phone", key: "phone" },
        { label: "Specialization", key: "specialization" },
        { label: "Submitted", key: "submittedAt" },
        { label: "Status", key: "status" },
      ]}
      chips={[
        { label: "All", value: "" },
        { label: "Pending", value: "Pending" },
        { label: "Approved", value: "Approved" },
        { label: "Rejected", value: "Rejected" },
      ]}
      chipField="status"
      renderActions={(row, helpers) => {
        const id =
          typeof helpers?.getId === "function"
            ? helpers.getId(row)
            : row?.id ?? row?._id;

        return (
          <ApproveRejectButtons
            id={id}
            status={row.status}
            approveApi={`/api/admin/verifications/${id}/approve`}
            rejectApi={`/api/admin/verifications/${id}/reject`}
            token={token}
            onApproved={(rid) => helpers.updateRow?.(rid, { status: "Approved" })}
            onRejected={(rid) => helpers.updateRow?.(rid, { status: "Rejected" })}
            variant="circle"
          />
        );
      }}
    />
  );
}
