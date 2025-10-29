import { useSelector } from "react-redux";
import PeopleTable from "../Tables";
import ApproveRejectButtons from "../../../components/buttons/ApproveRejectButtons";

export default function Verifications() {
  const { token } = useSelector((s) => s.auth);

  return (
    <PeopleTable
      title="Verifications"
      endpoint="/verification/verifications"
      token={token}
      addLabel={null}
      hideCrudActions
      filters={[
        {
          key: "dateRange",
          label: "Created Within",
          type: "select",
          options: [
            { label: "All", value: "" },
            { label: "Today", value: "today" },
            { label: "Last 7 Days", value: "week" },
            { label: "Last 30 Days", value: "month" },
          ],
        },
      ]}
      columns={[
        {
          label: "Profile",
          key: "profile_pic_url",
          render: (row) =>
            row.profile_pic_url ? (
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={row.profile_pic_url}
                  alt={row.username || "Profile"}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs font-semibold">
                  {(row.username || "?").charAt(0).toUpperCase()}
                </span>
              </div>
            ),
        },
        { label: "Username", key: "username" },
        { label: "Email", key: "email" },
        { label: "Account Created", key: "AccountCreatedAt" },
      ]}
      renderActions={(row, helpers) => (
        <ApproveRejectButtons
          id={row.id}
          token={token}
          approveApi={`/verification/verifications/${row.id}/approve`}
          onApproved={() => helpers.refresh()}
          variant="circle"
          show="approve" 
        />
      )}
    />
  );
}
