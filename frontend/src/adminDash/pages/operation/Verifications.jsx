import { FiCheck, FiX } from "react-icons/fi";
import PeopleTable from "../Tables"; // أو من "../Tables" إن كنت تعيد التصدير من هناك

export default function Verifications() {
  // بيانات وهمية للتجربة
  const mockVerifications = [
    {
      id: "v1",
      name: "Omar Khaled",
      email: "omar@example.com",
      phone: "+96650000000",
      specialization: "Frontend",
      submittedAt: "2025-10-01",
      status: "Pending",
    },
    {
      id: "v2",
      name: "Lina Saeed",
      email: "lina@example.com",
      phone: "+97150000000",
      specialization: "Backend",
      submittedAt: "2025-10-02",
      status: "Approved",
    },
    {
      id: "v3",
      name: "Aya N.",
      email: "aya@example.com",
      phone: "+201000000000",
      specialization: "Graphic Design",
      submittedAt: "2025-10-03",
      status: "Rejected",
    },
  ];

  return (
    <PeopleTable
      title="Verifications"
      addLabel="Add"
      // endpoint="/api/verifications"  // أثناء الموك، علّقها
      initialRows={mockVerifications}
      columns={[
        { label: "Name", key: "name" },
        { label: "Email", key: "email" },
        { label: "Phone", key: "phone" },
        { label: "Specialization", key: "specialization" },
        { label: "Submitted", key: "submittedAt" },
        { label: "Status", key: "status" },
      ]}
      formFields={[
        { key: "name", label: "Name", required: true },
        { key: "email", label: "Email", type: "email" },
        { key: "phone", label: "Phone", type: "tel" },
        { key: "specialization", label: "Specialization" },
        { key: "submittedAt", label: "Submitted", type: "date" },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["Pending", "Approved", "Rejected"],
          defaultValue: "Pending",
        },
      ]}
      chips={[
        { label: "All", value: "" },
        { label: "Pending", value: "Pending" },
        { label: "Approved", value: "Approved" },
        { label: "Rejected", value: "Rejected" },
      ]}
      chipField="status"
      filters={[
        { key: "specialization", label: "Specialization" },
        {
          key: "status",
          label: "Status",
          options: ["Pending", "Approved", "Rejected"],
        },
      ]}
      // نخفي أكشنات Edit/Delete الافتراضية
      hideCrudActions
      // أزرار قبول/رفض
      renderActions={({ row, helpers }) => {
        const id = row.id ?? row._id;
        const isApproved = row.status === "Approved";
        const isRejected = row.status === "Rejected";

        const approve = async () => {
          // تحديث فوري بالواجهة
          helpers.updateRow(id, { status: "Approved" });
          // وعند الربط لاحقًا:
          // await api.patch(`/api/verifications/${id}`, { status: 'Approved' });
        };

        const reject = async () => {
          helpers.updateRow(id, { status: "Rejected" });
          // وعند الربط لاحقًا:
          // await api.patch(`/api/verifications/${id}`, { status: 'Rejected' });
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
              className="inline-flex h-9 w-9 sm:h-auto sm:w-auto items-center justify-center rounded-xl px-3 py-2 text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
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
