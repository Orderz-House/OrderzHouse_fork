import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUsers } from "react-icons/fi";
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
  const [viewAllSubscriptions, setViewAllSubscriptions] = useState(false);

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

  // Handlers
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

  const viewSubscribers = (id) => setViewSubsPlanId(id);
  const closeSubs = () => setViewSubsPlanId(null);
  const openAllSubscriptions = () => setViewAllSubscriptions(true);
  const closeAllSubscriptions = () => setViewAllSubscriptions(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Plans</h1>
        <div className="flex gap-2">
          <OutlineButton onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl shadow hover:shadow-md transition">
            <FiPlus className="text-lg" />
            <span className="hidden sm:inline">Add Plan</span>
          </OutlineButton>
          <OutlineButton onClick={openAllSubscriptions} className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl shadow hover:shadow-md transition bg-green-500 text-white">
            <FiUsers className="text-lg" />
            <span className="hidden sm:inline">All Subscribers</span>
          </OutlineButton>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && <div className="text-center py-5 text-slate-500">Loading…</div>}
      {!loading && error && <div className="bg-red-100 text-red-700 py-3 px-4 rounded-lg text-center">{error}</div>}

      {/* Plan Cards */}
      {!loading && !error && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <article key={p.id} className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-md hover:shadow-xl transition p-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-800">{p.name}</h3>
                  <span className="rounded-full px-3 py-1 text-xs font-semibold text-white uppercase" style={{ backgroundColor: primary }}>
                    {p.plan_type}
                  </span>
                </div>

                <div className="text-2xl font-bold text-slate-800">
                  ${p.price}
                  <span className="text-base font-normal text-slate-500">
                    / {p.duration} {p.duration === 1 ? "day" : "days"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-600">{p.description}</p>

                <ul className="mt-3 space-y-1 text-sm text-slate-700 list-disc list-inside">
                  {(p.features ?? []).map((f, i) => <li key={i}>{f}</li>)}
                </ul>

                <div className="mt-2 text-sm text-slate-500">
                  {subscriptionCounts[p.id] ?? 0} {subscriptionCounts[p.id] === 1 ? "subscriber" : "subscribers"}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <button onClick={() => openEdit(p.id)} className="inline-flex items-center justify-center px-3 py-2 text-white rounded-xl" style={{ backgroundColor: primary }} title="Edit">
                  <FiEdit2 />
                </button>
                <button onClick={() => onDelete(p.id)} className="inline-flex items-center justify-center px-3 py-2 text-white bg-red-500 rounded-xl hover:bg-red-600 transition" title="Delete">
                  <FiTrash2 />
                </button>
                <button onClick={() => viewSubscribers(p.id)} className="inline-flex items-center justify-center px-3 py-2 text-white bg-green-500 rounded-xl hover:bg-green-600 transition" title="View Subscribers">
                  <FiUsers />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modals */}
      {open && (
        <Modal title={editId == null ? "Add Plan" : "Edit Plan"} onClose={() => setOpen(false)}>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Name" required>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border px-3 py-2" required />
            </Field>
            <Field label="Price" required>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full rounded-lg border px-3 py-2" required />
            </Field>
            <Field label="Duration (days)" required>
              <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full rounded-lg border px-3 py-2" required />
            </Field>
            <Field label="Description">
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
            </Field>
            <Field label="Features (one per line)">
              <textarea value={form.featuresText} onChange={(e) => setForm({ ...form, featuresText: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
            </Field>
            <Field label="Plan Type">
              <select value={form.plan_type} onChange={(e) => setForm({ ...form, plan_type: e.target.value })} className="w-full rounded-lg border px-3 py-2">
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </Field>
            <div className="flex justify-end gap-2 mt-3">
              <OutlineButton type="button" onClick={() => setOpen(false)}>Cancel</OutlineButton>
              <button type="submit" className="px-5 py-2 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {viewSubsPlanId && (
        <Modal title="Plan Subscribers" onClose={closeSubs}>
          <PeopleTable
            title={`Subscribers for Plan ${viewSubsPlanId}`}
            endpoint={`/plans/${viewSubsPlanId}/subscriptions`}
            token={token}
            columns={[
              { label: "ID", key: "id" },
              { label: "First Name", key: "first_name" },
              { label: "Last Name", key: "last_name" },
              { label: "Email", key: "email" },
              { label: "Country", key: "country" },
              { label: "Status", key: "status" },
            ]}
            filters={[]}
            formFields={[]}
          />
        </Modal>
      )}

      {viewAllSubscriptions && (
        <Modal title="All Subscribers" onClose={closeAllSubscriptions}>
          <PeopleTable
            title="All Subscribers"
            endpoint="/plans/subscriptions/all"
            token={token}
            columns={[
              { label: "ID", key: "id" },
              { label: "First Name", key: "first_name" },
              { label: "Last Name", key: "last_name" },
              { label: "Email", key: "email" },
              { label: "Country", key: "country" },
              { label: "Status", key: "status" },
              { label: "Plan Name", key: "plan_name" },
            ]}
            filters={[]}
            formFields={[]}
          />
        </Modal>
      )}
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <label className="space-y-1">
      <span className="text-sm font-medium text-slate-500">{label} {required ? "*" : ""}</span>
      {children}
    </label>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 overflow-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600 transition" aria-label="Close">
            <FiX />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
