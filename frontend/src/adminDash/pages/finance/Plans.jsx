import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUsers, FiArrowLeft } from "react-icons/fi";
import OutlineButton from "../../../components/buttons/OutlineButton.jsx";
import PeopleTable from "../Tables";
import PlansAPI from "../../api/plans";
import {
  setPlans,
  addPlan,
  removePlan,
  updatePlan,
  setLoading,
  setError,
  clearError,
} from "../../../slice/planSlice.js";

const primary = "#028090";

export default function Plans() {
  const dispatch = useDispatch();
  const { plans: items, loading, error } = useSelector((state) => state.plan);
  const { token } = useSelector((state) => state.auth);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: 30,
    description: "",
    featuresText: "",
    plan_type: "monthly",
  });

  const [subscriptionCounts, setSubscriptionCounts] = useState({});
  const [viewSubsPlanId, setViewSubsPlanId] = useState(null);
  const [selectedPlanName, setSelectedPlanName] = useState("");

  // Fetch plans + subscription counts
  useEffect(() => {
    (async () => {
      try {
        dispatch(setLoading(true));
        dispatch(clearError());

        const data = await PlansAPI.getPlans();
        const plansArray = Array.isArray(data) ? data : data?.plans ?? [];
        dispatch(setPlans(plansArray));

        const counts = {};
        for (const plan of plansArray) {
          try {
            const { plan: planCount } = await PlansAPI.getPlanSubscriptions(plan.id);
            counts[plan.id] = Number(planCount.subscription_count ?? 0);
          } catch {
            counts[plan.id] = 0;
          }
        }
        setSubscriptionCounts(counts);
      } catch (e) {
        dispatch(setError("Failed to load plans."));
      } finally {
        dispatch(setLoading(false));
      }
    })();
  }, [dispatch]);

  const openAdd = () => {
    setEditId(null);
    setForm({
      name: "",
      price: "",
      duration: 30,
      description: "",
      featuresText: "",
      plan_type: "monthly",
    });
    setOpen(true);
  };

  const openEdit = (id) => {
    const plan = items.find((p) => p.id === id);
    if (!plan) return;
    setEditId(id);
    setForm({
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      description: plan.description,
      featuresText: (plan.features ?? []).join("\n"),
      plan_type: plan.plan_type ?? "monthly",
    });
    setOpen(true);
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this plan?")) return;
    const prev = items;
    dispatch(removePlan(id));
    try {
      await PlansAPI.deletePlan(id);
    } catch {
      alert("Delete failed");
      dispatch(setPlans(prev));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      duration: Number(form.duration),
      features: form.featuresText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (editId == null) {
        const data = await PlansAPI.createPlan(payload);
        dispatch(addPlan(data));
      } else {
        const data = await PlansAPI.editPlan(editId, payload);
        dispatch(updatePlan(data));
      }
      setOpen(false);
    } catch {
      alert("Save failed");
    }
  };

  const viewSubscribers = (id) => {
    const plan = items.find((p) => p.id === id);
    setSelectedPlanName(plan?.name || "");
    setViewSubsPlanId(id);
  };

  const closeSubs = () => {
    setViewSubsPlanId(null);
    setSelectedPlanName("");
  };

  const formatDuration = (duration, planType) => {
    const num = Number(duration);
    if (planType === "yearly") {
      return `${num} ${num === 1 ? "year" : "years"}`;
    }
    if (planType === "monthly") {
      return `${num} ${num === 1 ? "month" : "months"}`;
    }
    return `${num} ${num === 1 ? "day" : "days"}`;
  };

  // ✅ View plan subscribers (using new route)
  if (viewSubsPlanId) {
    return (
      <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={closeSubs}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition text-slate-700"
          >
            <FiArrowLeft />
            <span>Back to Plans</span>
          </button>
          <h1 className="text-3xl font-bold text-slate-900">
            {selectedPlanName} - Subscribers
          </h1>
        </div>

        <PeopleTable
          title=""
          endpoint={`/plans/${viewSubsPlanId}/subscribers`}
          token={token}
          columns={[
            { 
              label: "#", 
              key: "row_number",
              render: (row, index) => index + 1
            },
            { label: "User ID", key: "user_id" },
            { label: "Email", key: "email" },
            { label: "Status", key: "status" },
            { label: "Start Date", key: "start_date" },
            { label: "End Date", key: "end_date" },
          ]}
          filters={[]}
          formFields={[]}
          crudConfig={{
            showEdit: false,
            showDelete: true,
            showExpand: false
          }}
        />
      </div>
    );
  }

  // Default view: Plan cards
  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Plans</h1>
        <OutlineButton
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl shadow hover:shadow-md transition"
        >
          <FiPlus className="text-lg" />
          <span>Add Plan</span>
        </OutlineButton>
      </div>

      {loading && <div className="text-center py-8 text-slate-500 text-lg">Loading…</div>}
      {!loading && error && <div className="bg-red-100 text-red-700 py-4 px-5 rounded-lg text-center">{error}</div>}

      {!loading && !error && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <div
              key={p.id}
              className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg hover:shadow-lg transition-shadow duration-300 w-full max-w-md mx-auto"
            >
              <div className="mx-4 mb-0 border-b border-slate-200 pt-4 pb-3 px-1">
                <span className="text-sm font-medium text-slate-600 uppercase">
                  {p.plan_type}
                </span>
              </div>

              <div className="p-5 flex-grow">
                <h5 className="mb-3 text-slate-800 text-2xl font-semibold">{p.name}</h5>
                <div className="text-3xl font-bold text-slate-800 mb-3">
                  ${p.price}
                  <span className="text-base font-normal text-slate-500">
                    / {formatDuration(p.duration, p.plan_type)}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed font-light mb-4">
                  {p.description}
                </p>
                <ul className="space-y-2 text-sm text-slate-700">
                  {(p.features ?? []).map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 pt-0">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openEdit(p.id)}
                    className="inline-flex items-center justify-center px-4 py-2.5 text-white rounded-xl hover:opacity-90 transition"
                    style={{ backgroundColor: primary }}
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="inline-flex items-center justify-center px-4 py-2.5 text-white bg-red-500 rounded-xl hover:bg-red-600 transition"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                  <button
                    onClick={() => viewSubscribers(p.id)}
                    className="inline-flex items-center justify-center px-4 py-2.5 text-white bg-green-500 rounded-xl hover:bg-green-600 transition"
                    title="View Subscribers"
                  >
                    <FiUsers />
                  </button>
                </div>
              </div>

              <div className="mx-4 border-t border-slate-200 pb-4 pt-3 px-1">
                <span className="text-sm text-slate-600 font-medium">
                  {subscriptionCounts[p.id] ?? 0}{" "}
                  {subscriptionCounts[p.id] === 1 ? "subscriber" : "subscribers"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <Modal title={editId == null ? "Add Plan" : "Edit Plan"} onClose={() => setOpen(false)}>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Name" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                required
              />
            </Field>
            <Field label="Price" required>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                required
              />
            </Field>
            <Field label="Duration (days)" required>
              <input
                type="number"
                min="1"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                required
              />
            </Field>
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                rows="3"
              />
            </Field>
            <Field label="Features (one per line)">
              <textarea
                value={form.featuresText}
                onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                rows="4"
              />
            </Field>
            <Field label="Plan Type">
              <select
                value={form.plan_type}
                onChange={(e) => setForm({ ...form, plan_type: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </Field>
            <div className="flex justify-end gap-3 mt-6">
              <OutlineButton type="button" onClick={() => setOpen(false)}>
                Cancel
              </OutlineButton>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl my-8">
        <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition"
            aria-label="Close"
          >
            <FiX className="text-xl" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}