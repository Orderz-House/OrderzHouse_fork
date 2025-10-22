import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUsers } from "react-icons/fi";
import OutlineButton from "../../../components/buttons/OutlineButton.jsx";
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

  const [viewSubsId, setViewSubsId] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);

  // Fetch plans
  useEffect(() => {
    (async () => {
      try {
        dispatch(setLoading(true));
        dispatch(clearError());
        const data = await PlansAPI.getPlans();
        dispatch(setPlans(Array.isArray(data) ? data : data?.plans ?? []));
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
    const r = items.find((x) => (x.id ?? x._id) === id);
    if (!r) return;
    setEditId(id);
    setForm({
      name: r.name ?? "",
      price: r.price ?? "",
      duration: r.duration ?? 30,
      description: r.description ?? "",
      featuresText: (r.features ?? []).join("\n"),
      plan_type: r.plan_type ?? "monthly",
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

  const viewSubscriptions = async (id) => {
    try {
      // Replace with your API call to fetch subscriptions for the plan
      const subs = await PlansAPI.getPlanSubscriptions(id);
      setSubscriptions(subs);
      setViewSubsId(id);
    } catch {
      alert("Failed to fetch subscriptions");
    }
  };

  const closeSubs = () => {
    setViewSubsId(null);
    setSubscriptions([]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Plans</h1>
        <OutlineButton
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-2xl px-5 py-2 shadow hover:shadow-md transition-shadow duration-200"
        >
          <FiPlus className="text-lg" />
          <span className="hidden sm:inline">Add Plan</span>
          <span className="sm:hidden">Add</span>
        </OutlineButton>
      </div>

      {/* Loading / Error */}
      {loading && <div className="text-slate-500 text-center py-5">Loading…</div>}
      {!loading && error && (
        <div className="bg-red-100 text-red-700 text-center py-3 px-4 rounded-lg">{error}</div>
      )}

      {/* Plan Cards */}
      {!loading && !error && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => {
            const id = p.id ?? p._id;
            return (
              <article
                key={id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-md hover:shadow-xl transition-shadow duration-200 p-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-800">{p.name}</h3>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold text-white uppercase"
                      style={{ backgroundColor: primary }}
                    >
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
                    {(p.features ?? []).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openEdit(id)}
                    className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white hover:opacity-90 transition"
                    style={{ backgroundColor: primary }}
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => onDelete(id)}
                    className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white bg-red-500 hover:bg-red-600 transition"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                  <button
                    onClick={() => viewSubscriptions(id)}
                    className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-white bg-green-500 hover:bg-green-600 transition"
                    title="View Subscriptions"
                  >
                    <FiUsers />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal for Add/Edit Plan */}
      {open && (
        <Modal title={editId == null ? "Add Plan" : "Edit Plan"} onClose={() => setOpen(false)}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name" required>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </Field>

              <Field label="Price" required>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </Field>

              <Field label="Duration (Days)" required>
                <input
                  type="number"
                  min="1"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </Field>

              <Field label="Plan Type" required>
                <select
                  value={form.plan_type}
                  onChange={(e) => setForm({ ...form, plan_type: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </Field>
            </div>

            <Field label="Description">
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
              />
            </Field>

            <Field label="Features (one per line)">
              <textarea
                rows={5}
                value={form.featuresText}
                onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
              />
            </Field>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl px-4 py-2 text-white shadow-sm"
                style={{ backgroundColor: primary }}
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal for Viewing Subscriptions */}
      {viewSubsId && (
        <Modal title="Plan Subscriptions" onClose={closeSubs}>
          {subscriptions.length === 0 ? (
            <p className="text-sm text-slate-600">No subscriptions for this plan.</p>
          ) : (
            <ul className="space-y-2">
              {subscriptions.map((s) => (
                <li key={s.id} className="flex justify-between border-b border-slate-200 py-2">
                  <span>{s.user_name}</span>
                  <span className="text-slate-500">{s.status}</span>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <label className="space-y-1">
      <span className="text-sm font-medium text-slate-500">
        {label} {required ? "*" : ""}
      </span>
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
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600 transition"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
