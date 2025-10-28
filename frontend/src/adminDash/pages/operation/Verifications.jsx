import { useSelector } from "react-redux";
import PeopleTable from "../Tables";
import ApproveRejectButtons from "../../../components/buttons/ApproveRejectButtons";

export default function Verifications() {
  const { token } = useSelector((s) => s.auth);

  return (
    <PeopleTable
      title="Verifications"
      addLabel="Add Verification"
      endpoint="/verification/verifications"
      token={token}
      columns={[
        { label: "Username", key: "username" },
        { label: "Email", key: "email" },
        { label: "Submitted", key: "submittedAt" },
      ]}
      filters={[
        { key: "from", label: "From Date", type: "date" },
        { key: "to", label: "To Date", type: "date" },
      ]}
      hideCrudActions
      renderActions={(row, helpers) => (
        <ApproveRejectButtons
          id={row.id}
          token={token}
          approveApi={`/verification/verifications/${row.id}/approve`}
          rejectApi={`/verification/verifications/${row.id}/reject`}
          onApproved={() => helpers.refresh()}
          onRejected={() => helpers.refresh()}
          variant="circle"
        />
      )}
    />
  );
}
