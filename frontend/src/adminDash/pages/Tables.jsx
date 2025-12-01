// Tables.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { MOCK_ENABLED, mockFetch } from "./mockData.js";
import {
  FiEdit2,
  FiTrash2,
  FiX,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import { AiOutlineEdit } from "react-icons/ai";
import {
  setUsers,
  updateUser,
  removeUser,
  setLoading,
  setError,
  setEditingRowId,
} from "../../slice/usersSlice";
import React from "react";
import ExpandedRow from "./expandedRow.jsx";
import Pagination from "../../components/Catigories/Pagination.jsx";

const PRIMARY = "#028090";
const DEBOUNCE_DELAY = 300;

/* ====================== Drawer ====================== */
const Drawer = ({ open, onClose, title, subtitle, children }) => {
  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`absolute inset-y-0 right-0 w-full sm:max-w-[520px] bg-white shadow-2xl ring-1 ring-slate-200
        transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200">
          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-800 truncate">
              {title}
            </div>
            {subtitle && (
              <div className="text-[12.5px] text-slate-500 truncate">
                {subtitle}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700"
            title="Close"
          >
            <FiX />
          </button>
        </div>
        <div className="h-[calc(100%-56px)] overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

/* ====================== Defaults ====================== */
const DEFAULT_CRUD_CONFIG = {
  showEdit: true,
  showDelete: true,
  showExpand: false,
  showRowEdit: false,
  showDetails: true,
};

function useApi(token) {
  return useMemo(
    () =>
      axios.create({
        baseURL: import.meta.env.VITE_APP_API_URL || "",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }),
    [token]
  );
}

/* ====================== Data Hook (بدون بحث/فلترة) ====================== */
function useTableData({ endpoint, api, refreshKey }) {
  const dispatch = useDispatch();
  const [localRows, setLocalRows] = useState([]);
  const [loading, setLoadingLocal] = useState(!!endpoint);
  const [error, setErrorLocal] = useState("");

  useEffect(() => {
    if (!endpoint) return;

    const controller = new AbortController();
    setLoadingLocal(true);
    setErrorLocal("");
    dispatch(setLoading(true));

    const params = {};

    // ===== Mock short-circuit =====
    if (MOCK_ENABLED) {
      const mockList = mockFetch(endpoint, params);
      if (Array.isArray(mockList)) {
        const processedList = mockList.map((row) => ({
          ...row,
          categories:
            typeof row.categories === "string"
              ? (() => {
                  try {
                    return JSON.parse(row.categories);
                  } catch {
                    return [];
                  }
                })()
              : row.categories,
        }));
        setLocalRows(processedList);
        dispatch(setUsers(processedList));
        setLoadingLocal(false);
        dispatch(setLoading(false));
        return;
      }
    }
    // ==============================

    const timeoutId = setTimeout(async () => {
      try {
        const { data } = await api.get(endpoint, {
          params,
          signal: controller.signal,
        });

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.appointments)
          ? data.appointments
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.users)
          ? data.users
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.projects)
          ? data.projects
          : [];

        const processedList = list.map((row) => ({
          ...row,
          categories:
            typeof row.categories === "string"
              ? (() => {
                  try {
                    return JSON.parse(row.categories);
                  } catch {
                    return [];
                  }
                })()
              : row.categories,
        }));

        setLocalRows(processedList);
        dispatch(setUsers(processedList));
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error(err);
          const msg = "Failed to load data";
          setErrorLocal(msg);
          dispatch(setError(msg));
        }
      } finally {
        setLoadingLocal(false);
        dispatch(setLoading(false));
      }
    }, DEBOUNCE_DELAY);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [endpoint, refreshKey, api, dispatch]);

  return { rows: localRows, setRows: setLocalRows, loading, error };
}

/* ====================== Helpers ====================== */
function renderPrettyCell(col, row, idx) {
  const raw = col.render ? col.render(row, idx) : row[col.key];
  const label = String(col.label || col.key || "").toLowerCase();

  if (raw == null || raw === "")
    return <span className="text-slate-400">—</span>;
  const val = String(raw);
  const key = val.toLowerCase();

  if (label.includes("appointment status") || label.includes("status")) {
    const chipMap = {
      confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      rescheduled: "bg-amber-50 text-amber-700 ring-amber-200",
      cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
      unknown: "bg-slate-100 text-slate-600 ring-slate-200",
    };
    const cls = chipMap[key] || "bg-slate-100 text-slate-600 ring-slate-200";
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] ring-1 ${cls}`}
      >
        {val}
      </span>
    );
  }

  if (label.includes("call status") || label.includes("state")) {
    const color = {
      active: "text-emerald-600",
      escalated: "text-orange-500",
      resolved: "text-violet-600",
      dropped: "text-amber-600",
      scheduled: "text-sky-600",
      missed: "text-rose-600",
    }[key];
    return (
      <span className={`font-medium ${color || "text-slate-700"}`}>{val}</span>
    );
  }

  return val;
}

function pickColumn(columns, keywords = []) {
  const lower = (s) => String(s || "").toLowerCase();
  const byLabel = (kw) =>
    columns.find((c) => lower(c.label).includes(kw)) ||
    columns.find((c) => lower(c.key).includes(kw));
  for (const k of keywords) {
    const c = byLabel(k);
    if (c) return c;
  }
  return null;
}
function getCellValue(col, row, idx) {
  if (!col) return undefined;
  return col.render ? col.render(row, idx) : row[col.key];
}
function truthyYes(val) {
  const s = String(val ?? "").toLowerCase();
  return ["yes", "true", "1", "verified"].some((x) => s.includes(x));
}
function onlineState(val) {
  const s = String(val ?? "").toLowerCase();
  if (s.includes("online")) return "online";
  if (s.includes("offline")) return "offline";
  return "";
}
function initialsFrom(name) {
  const s = String(name || "").trim();
  if (!s) return "•";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}
function pickAvatar(row) {
  return (
    row?.avatar ||
    row?.image ||
    row?.profile_image ||
    row?.photoUrl ||
    row?.photoURL ||
    ""
  );
}

/* ====================== Mobile List ====================== */
const MobileCards = ({
  title,
  columns,
  rows,
  loading,
  error,
  renderActions,
  hideCrudActions,
  helpers,
  crudConfig,
  expandedRow,
  onToggleExpand,
  formFields,
  editingRowId,
  onSaveEdit,
  onCancelEdit,
  onOpenDrawer,
}) => {
  if (loading) {
    return (
      <div className="block md:hidden text-center text-slate-600 py-8">
        Loading {title}…
      </div>
    );
  }
  if (error) {
    return (
      <div className="block md:hidden text-center text-red-600 py-8">
        {error}
      </div>
    );
  }
  if (!rows.length) {
    return (
      <div className="block md:hidden text-center text-slate-500 py-8">
        No {title} found
      </div>
    );
  }

  const nameCol =
    pickColumn(columns, ["name", "full name", "username"]) || columns[0];
  const emailCol = pickColumn(columns, ["email"]);
  const countryCol = pickColumn(columns, ["country", "city"]);
  const roleCol = pickColumn(columns, ["role", "type"]);
  const statusCol = pickColumn(columns, ["status"]);
  const verifiedCol = pickColumn(columns, ["verified", "is verified"]);

  return (
    <div className="block md:hidden space-y-2 w-full max-w-[100vw] overflow-x-hidden">
      {rows.map((row, idx) => {
        const isEditing = editingRowId === helpers.getId(row);
        const isExpanded = expandedRow === idx;

        const primary = getCellValue(nameCol, row, idx) ?? "—";
        const email = getCellValue(emailCol, row, idx);
        const country = getCellValue(countryCol, row, idx);
        const role = getCellValue(roleCol, row, idx);
        const statusVal = getCellValue(statusCol, row, idx);
        const verifiedVal = getCellValue(verifiedCol, row, idx);

        const avatarUrl = pickAvatar(row);
        const state = onlineState(statusVal);
        const isVerified = truthyYes(verifiedVal);

        const secondary =
          email ?? (country ? String(country) : role ? String(role) : undefined);

        return (
          <div
            key={idx}
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm"
          >
            <div className="flex items-center gap-3 min-h[56px]">
              {/* Avatar */}
              <div className="shrink-0 w-10 h-10 rounded-full bg-slate-100 overflow-hidden grid place-items-center text-[12px] text-slate-600">
                {avatarUrl ? (
                  <img src={avatarUrl} className="w-full h-full object-cover" />
                ) : (
                  initialsFrom(primary)
                )}
              </div>

              {/* Texts */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-[14px] font-medium text-slate-800 truncate">
                    {primary}
                  </div>

                  {state && (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] ${
                        state === "online"
                          ? "text-emerald-600"
                          : "text-slate-500"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          state === "online" ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {state === "online" ? "Online" : "Offline"}
                    </span>
                  )}

                  {isVerified && (
                    <span className="text-[11px] text-emerald-600">
                      ✓ Verified
                    </span>
                  )}
                </div>

                {secondary && (
                  <div className="text-[12px] text-slate-600 truncate">
                    {secondary}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {crudConfig.showDetails && (
                  <button
                    onClick={() => onOpenDrawer?.(row, idx)}
                    className="w-8 h-8 grid place-items-center rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700"
                    title="View / Edit"
                  >
                    <AiOutlineEdit size={18} />
                  </button>
                )}

                {crudConfig.showRowEdit && (
                  <button
                    onClick={() => onOpenDrawer?.(row, idx)}
                    className="h-8 px-3 rounded-full border inline-flex items-center gap-1.5 text-[12px]"
                    style={{ borderColor: PRIMARY, color: PRIMARY }}
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                )}

                {crudConfig.showDelete && (
                  <button
                    onClick={() => helpers.handleDelete(idx)}
                    className="h-8 px-3 rounded-full border border-slate-200 hover:bg-red-50 inline-flex items-center gap-1.5 text-[12px] text-red-600"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>

            {/* (Optional) inline expand */}
            {isExpanded && (
              <div className="mt-2">
                <ExpandedRow
                  row={row}
                  columns={columns}
                  formFields={formFields}
                  isEditing={isEditing}
                  onSave={onSaveEdit}
                  onDelete={() => helpers.handleDelete(idx)}
                  onCancel={onCancelEdit}
                  helpers={helpers}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ====================== Desktop Table ====================== */
const DesktopTable = ({
  columns,
  rows,
  loading,
  error,
  expandedRow,
  onToggleExpand,
  renderActions,
  hideCrudActions,
  helpers,
  formFields,
  editingRowId,
  onSaveEdit,
  onCancelEdit,
  crudConfig,
  onOpenDrawer,
}) => {
  if (loading) {
    return (
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-8 text-center text-slate-600">Loading data…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-8 text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-[13px]">
        <thead className="border-b border-slate-200 bg-[#028090]">
          <tr>
            {crudConfig.showExpand && <th className="w-10 px-3 py-2"></th>}
            {columns.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap px-3 py-2 text-left text-[12px] font-semibold text-white"
              >
                {col.label}
              </th>
            ))}
            <th className="w-28 px-3 py-2 text-center text-[12px] font-semibold text-white">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {!rows.length ? (
            <tr>
              <td
                colSpan={columns.length + (crudConfig.showExpand ? 2 : 1)}
                className="px-4 py-8 text-center text-slate-500"
              >
                No records found
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => {
              const isExpanded = expandedRow === idx;
              const isEditing = editingRowId === helpers.getId(row);

              return (
                <React.Fragment key={idx}>
                  <tr
                    className={`hover:bg-slate-50 ${
                      isExpanded ? "bg-slate-50" : ""
                    }`}
                  >
                    {crudConfig.showExpand && (
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => onToggleExpand(idx)}
                          className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700"
                          title="Toggle"
                        >
                          {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                        </button>
                      </td>
                    )}

                    {columns.map((col) => (
                      <td key={col.key} className="px-3 py-2 text-slate-800">
                        {col.render ? col.render(row, idx) : row[col.key]}
                      </td>
                    ))}

                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1.5">
                        {crudConfig.showDetails && (
                          <button
                            onClick={() => onOpenDrawer?.(row, idx)}
                            className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700"
                            title="View / Edit"
                          >
                            <AiOutlineEdit size={18} />
                          </button>
                        )}

                        {renderActions ? (
                          renderActions(row, helpers)
                        ) : !hideCrudActions ? (
                          <>
                            {crudConfig.showRowEdit && (
                              <button
                                onClick={() => onOpenDrawer?.(row, idx)}
                                className="h-9 px-3 rounded-full border inline-flex items-center gap-2 text-sm"
                                style={{ borderColor: PRIMARY, color: PRIMARY }}
                                title="Edit"
                              >
                                <FiEdit2 />
                              </button>
                            )}

                            {crudConfig.showDelete && (
                              <button
                                onClick={() => helpers.handleDelete(idx)}
                                className="h-9 px-3 rounded-full border border-slate-200 hover:bg-red-50 inline-flex items-center gap-2 text-sm text-red-600"
                                title="Delete"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td
                        colSpan={
                          columns.length + (crudConfig.showExpand ? 2 : 1)
                        }
                        className="px-0 py-0"
                      >
                        <ExpandedRow
                          row={row}
                          columns={columns}
                          formFields={formFields}
                          isEditing={isEditing}
                          onSave={onSaveEdit}
                          onDelete={() => helpers.handleDelete(idx)}
                          onCancel={onCancelEdit}
                          helpers={helpers}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

/* ====================== Desktop Cards ====================== */
const DesktopCards = ({
  title,
  columns,
  rows,
  loading,
  error,
  renderActions,
  hideCrudActions,
  helpers,
  crudConfig,
  expandedRow,
  onToggleExpand,
  formFields,
  editingRowId,
  onSaveEdit,
  onCancelEdit,
  onCardClick,
  renderSubtitle,
  onOpenDrawer,
}) => {
  if (loading) {
    return (
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center text-slate-600">
        Loading {title}…
      </div>
    );
  }
  if (error) {
    return (
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center text-red-600">
        {error}
      </div>
    );
  }
  if (!rows.length) {
    return (
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center text-slate-500">
        No {title} found
      </div>
    );
  }

  const nameCol =
    pickColumn(columns, ["title", "name", "full name", "username"]) ||
    columns[0];
  const subCol = pickColumn(columns, ["client", "owner", "email", "country"]);
  const statusCol = pickColumn(columns, ["status"]);
  const dueCol = pickColumn(columns, ["due", "date"]);
  const budgetCol = pickColumn(columns, ["budget", "price", "amount"]);

  return (
    <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {rows.map((row, idx) => {
        const isExpanded = expandedRow === idx;
        const isEditing = editingRowId === helpers.getId(row);

        const titleVal = getCellValue(nameCol, row, idx) ?? "—";
        const subVal = getCellValue(subCol, row, idx);
        const status = getCellValue(statusCol, row, idx);
        const due = getCellValue(dueCol, row, idx);
        const budget = getCellValue(budgetCol, row, idx);

        const avatarUrl = pickAvatar(row);

        return (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
          >
            {/* صورة / أفاتار بسيطة */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => onCardClick?.(row, helpers)}
              onKeyDown={(e) =>
                e.key === "Enter" && onCardClick?.(row, helpers)
              }
              className="h-36 bg-slate-100 grid place-items-center overflow-hidden cursor-pointer"
              title="Open"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/80 grid place-items-center text-slate-400 text-sm ring-1 ring-slate-200">
                  {initialsFrom(String(titleVal))}
                </div>
              )}
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 truncate">
                    {titleVal}
                  </div>
                  {typeof renderSubtitle === "function" && (
                    <div className="mt-1">{renderSubtitle(row, helpers)}</div>
                  )}

                  {subVal && (
                    <div className="text-xs text-slate-500 truncate">
                      {String(subVal)}
                    </div>
                  )}
                </div>
                {status && (
                  <div className="shrink-0">
                    {renderPrettyCell(
                      { label: "Status", key: "status" },
                      { status },
                      idx
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                {due && (
                  <div className="rounded-xl bg-slate-50 px-2 py-1 ring-1 ring-slate-200">
                    <span className="text-slate-500">Due:</span> {String(due)}
                  </div>
                )}
                {budget != null && budget !== "" && (
                  <div className="rounded-xl bg-slate-50 px-2 py-1 ring-1 ring-slate-200">
                    <span className="text-slate-500">Budget:</span>{" "}
                    {String(budget)}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between gap-1.5">
                {crudConfig.showDetails && (
                  <button
                    onClick={() => onOpenDrawer?.(row, idx)}
                    className="h-9 px-3 rounded-full border border-slate-200 hover:bg-slate-50 text-sm text-slate-700"
                    title="View / Edit"
                  >
                    <AiOutlineEdit size={18} />
                  </button>
                )}

                <div className="flex items-center gap-1.5">
                  {typeof renderActions === "function" &&
                    renderActions(row, helpers)}

                  {!hideCrudActions && (
                    <>
                      {crudConfig?.showRowEdit && (
                        <button
                          onClick={() => onOpenDrawer?.(row, idx)}
                          className="h-9 px-3 rounded-full border text-sm"
                          style={{ borderColor: PRIMARY, color: PRIMARY }}
                          title="Edit"
                        >
                          Edit
                        </button>
                      )}

                      {crudConfig?.showDelete && (
                        <button
                          onClick={() => helpers.handleDelete(idx)}
                          className="h-9 px-3 rounded-full border border-slate-200 hover:bg-red-50 text-sm text-red-600"
                          title="Delete"
                        >
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* (Optional) inline expand */}
              {isExpanded && (
                <div className="mt-2">
                  <ExpandedRow
                    row={row}
                    columns={columns}
                    formFields={formFields}
                    isEditing={isEditing}
                    onSave={onSaveEdit}
                    onDelete={() => helpers.handleDelete(idx)}
                    onCancel={onCancelEdit}
                    helpers={helpers}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ====================== Mobile Cards Grid ====================== */
const CardsGrid = ({
  title,
  columns,
  rows,
  loading,
  error,
  renderActions,
  hideCrudActions,
  helpers,
  crudConfig,
  expandedRow,
  onToggleExpand,
  formFields,
  editingRowId,
  onSaveEdit,
  onCancelEdit,
  onCardClick,
  renderSubtitle,
  onOpenDrawer,
}) => {
  if (loading) {
    return (
      <div className="block md:hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center text-slate-600">
        Loading {title}…
      </div>
    );
  }
  if (error) {
    return (
      <div className="block md:hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center text-red-600">
        {error}
      </div>
    );
  }
  if (!rows.length) {
    return (
      <div className="block md:hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center text-slate-500">
        No {title} found
      </div>
    );
  }

  const nameCol =
    pickColumn(columns, ["title", "name", "full name", "username"]) ||
    columns[0];
  const subCol = pickColumn(columns, ["client", "owner", "email", "country"]);
  const statusCol = pickColumn(columns, ["status"]);
  const dueCol = pickColumn(columns, ["due", "date"]);
  const budgetCol = pickColumn(columns, ["budget", "price", "amount"]);

  return (
    <div className="grid md:hidden grid-cols-1 gap-3">
      {rows.map((row, idx) => {
        const isExpanded = expandedRow === idx;
        const isEditing = editingRowId === helpers.getId(row);

        const titleVal = getCellValue(nameCol, row, idx) ?? "—";
        const subVal = getCellValue(subCol, row, idx);
        const status = getCellValue(statusCol, row, idx);
        const due = getCellValue(dueCol, row, idx);
        const budget = getCellValue(budgetCol, row, idx);

        const avatarUrl = pickAvatar(row);

        return (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => onCardClick?.(row, helpers)}
              onKeyDown={(e) =>
                e.key === "Enter" && onCardClick?.(row, helpers)
              }
              className="h-36 bg-slate-100 grid place-items-center overflow-hidden cursor-pointer"
              title="Open"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/80 grid place-items-center text-slate-400 text-sm ring-1 ring-slate-200">
                  {initialsFrom(String(titleVal))}
                </div>
              )}
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 truncate">
                    {titleVal}
                  </div>
                  {typeof renderSubtitle === "function" && (
                    <div className="mt-1">{renderSubtitle(row, helpers)}</div>
                  )}

                  {subVal && (
                    <div className="text-xs text-slate-500 truncate">
                      {String(subVal)}
                    </div>
                  )}
                </div>
                {status && (
                  <div className="shrink-0">
                    {renderPrettyCell(
                      { label: "Status", key: "status" },
                      { status },
                      idx
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                {due && (
                  <div className="rounded-xl bg-slate-50 px-2 py-1 ring-1 ring-slate-200">
                    <span className="text-slate-500">Due:</span> {String(due)}
                  </div>
                )}
                {budget != null && budget !== "" && (
                  <div className="rounded-xl bg-slate-50 px-2 py-1 ring-1 ring-slate-200">
                    <span className="text-slate-500">Budget:</span>{" "}
                    {String(budget)}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between gap-1.5">
                {crudConfig.showDetails && (
                  <button
                    onClick={() => onOpenDrawer?.(row, idx)}
                    className="h-9 px-3 rounded-full border border-slate-200 hover:bg-slate-50 text-sm text-slate-700"
                    title="View / Edit"
                  >
                    <AiOutlineEdit size={18} />
                  </button>
                )}

                <div className="flex items-center gap-1.5">
                  {typeof renderActions === "function" &&
                    renderActions(row, helpers)}

                  {!hideCrudActions && (
                    <>
                      {crudConfig?.showRowEdit && (
                        <button
                          onClick={() => onOpenDrawer?.(row, idx)}
                          className="h-9 px-3 rounded-full border text-sm"
                          style={{ borderColor: PRIMARY, color: PRIMARY }}
                          title="Edit"
                        >
                          Edit
                        </button>
                      )}

                      {crudConfig?.showDelete && (
                        <button
                          onClick={() => helpers.handleDelete(idx)}
                          className="h-9 px-3 rounded-full border border-slate-200 hover:bg-red-50 text-sm text-red-600"
                          title="Delete"
                        >
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* (Optional) inline expand */}
              {isExpanded && (
                <div className="mt-2">
                  <ExpandedRow
                    row={row}
                    columns={columns}
                    formFields={formFields}
                    isEditing={isEditing}
                    onSave={onSaveEdit}
                    onDelete={() => helpers.handleDelete(idx)}
                    onCancel={onCancelEdit}
                    helpers={helpers}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ====================== Main ====================== */
export default function PeopleTable({
  title = "People",
  endpoint,
  getOnePath,
  columns,
  formFields = [],
  renderActions,
  hideCrudActions = false,
  token,
  crudConfig = {},
  desktopAsCards = false,
  onCardClick,
  renderSubtitle,
  mobileAsCards = false,
  searchValue,
}) {
  const dispatch = useDispatch();
  const api = useApi(token);
  const { editingRowId } = useSelector((s) => s.users);

  const mergedCrudConfig = useMemo(
    () => ({ ...DEFAULT_CRUD_CONFIG, ...crudConfig }),
    [crudConfig]
  );

  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);

  const { rows, setRows, loading, error } = useTableData({
    endpoint,
    api,
    refreshKey,
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [refreshKey]);

  const tableColumns = columns?.length
    ? columns
    : [
        { label: "Name", key: "name" },
        { label: "Role", key: "role" },
      ];

  const getId = useCallback((row) => row.id ?? row._id, []);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const startEdit = useCallback(
    (rowId) => dispatch(setEditingRowId(rowId)),
    [dispatch]
  );

  const handleSaveEdit = useCallback(
    async (formData) => {
      try {
        if (!endpoint) {
          setRows((prev) =>
            prev.map((row) =>
              row.id === formData.id ? { ...row, ...formData } : row
            )
          );
          dispatch(updateUser(formData));
          dispatch(setEditingRowId(null));
          return;
        }
        await api.put(`${endpoint}/${formData.id}`, formData);
        dispatch(updateUser(formData));
        dispatch(setEditingRowId(null));
        refresh();
      } catch (err) {
        console.error(err);
        dispatch(setError("Failed to update the data"));
      }
    },
    [endpoint, api, dispatch, refresh, setRows]
  );

  const handleCancelEdit = useCallback(
    () => dispatch(setEditingRowId(null)),
    [dispatch]
  );

  const handleDelete = useCallback(
    async (idx) => {
      const row = rows[idx];
      if (!row || !window.confirm("Do you want to delete this record?")) return;
      try {
        if (endpoint && row?.id != null) {
          await api.delete(`${endpoint}/${row.id}`);
          dispatch(removeUser(row.id));
        }
        refresh();
      } catch (err) {
        console.error(err);
        dispatch(setError("Failed to delete this record"));
      }
    },
    [rows, endpoint, api, dispatch, refresh]
  );

  const handleToggleExpand = useCallback(
    (idx) => {
      setExpandedRow((current) => (current === idx ? null : idx));
      dispatch(setEditingRowId(null));
    },
    [dispatch]
  );

  const helpers = useMemo(
    () => ({
      rows,
      setRows,
      getId,
      refresh,
      startEdit,
      handleDelete,
    }),
    [rows, setRows, getId, refresh, startEdit, handleDelete]
  );

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerIndex, setDrawerIndex] = useState(null);

  const selectedRow =
    drawerIndex != null && drawerIndex >= 0 ? pagedRows[drawerIndex] : null;

  const openDrawer = useCallback(
    (row, idx) => {
      setDrawerIndex(idx);
      setDrawerOpen(true);
      dispatch(setEditingRowId(getId(row)));
    },
    [dispatch, getId]
  );

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    dispatch(setEditingRowId(null));
  }, [dispatch]);

  const handleSaveAndClose = useCallback(
    async (data) => {
      await handleSaveEdit(data);
      setDrawerOpen(false);
    },
    [handleSaveEdit]
  );

  return (
    <div className="space-y-3 px-3 sm:px-4 py-3 w-full max-w-[100vw] overflow-x-hidden text-[13.5px] sm:text-[14px]">
      {/* ===== Mobile View ===== */}
      {mobileAsCards ? (
        <CardsGrid
          title={title}
          columns={tableColumns}
          rows={pagedRows}
          loading={loading}
          error={error}
          renderActions={renderActions}
          hideCrudActions={hideCrudActions}
          helpers={helpers}
          crudConfig={mergedCrudConfig}
          expandedRow={expandedRow}
          onToggleExpand={setExpandedRow}
          formFields={formFields}
          editingRowId={editingRowId}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onCardClick={onCardClick}
          renderSubtitle={renderSubtitle}
          onOpenDrawer={openDrawer}
        />
      ) : (
        <MobileCards
          title={title}
          columns={tableColumns}
          rows={pagedRows}
          loading={loading}
          error={error}
          renderActions={renderActions}
          hideCrudActions={hideCrudActions}
          helpers={helpers}
          crudConfig={mergedCrudConfig}
          expandedRow={expandedRow}
          onToggleExpand={setExpandedRow}
          formFields={formFields}
          editingRowId={editingRowId}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onOpenDrawer={openDrawer}
        />
      )}

      {desktopAsCards ? (
        <DesktopCards
          title={title}
          columns={tableColumns}
          rows={pagedRows}
          loading={loading}
          error={error}
          renderActions={renderActions}
          hideCrudActions={hideCrudActions}
          helpers={helpers}
          crudConfig={mergedCrudConfig}
          expandedRow={expandedRow}
          onToggleExpand={setExpandedRow}
          formFields={formFields}
          editingRowId={editingRowId}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onCardClick={onCardClick}
          renderSubtitle={renderSubtitle}
          onOpenDrawer={openDrawer}
        />
      ) : (
        <DesktopTable
          columns={tableColumns}
          rows={pagedRows}
          loading={loading}
          error={error}
          expandedRow={expandedRow}
          onToggleExpand={setExpandedRow}
          renderActions={renderActions}
          hideCrudActions={hideCrudActions}
          helpers={helpers}
          formFields={formFields}
          editingRowId={editingRowId}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          crudConfig={mergedCrudConfig}
          onOpenDrawer={openDrawer}
        />
      )}

      <Pagination
        page={page}
        total={rows.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={`Edit ${title}`}
        subtitle={
          selectedRow
            ? selectedRow.email || selectedRow.name || selectedRow.title || ""
            : ""
        }
      >
        {selectedRow && (
          <ExpandedRow
            row={selectedRow}
            columns={tableColumns}
            formFields={formFields}
            isEditing={true}
            onSave={handleSaveAndClose}
            onDelete={() => {
              if (drawerIndex != null) helpers.handleDelete(drawerIndex);
              closeDrawer();
            }}
            onCancel={closeDrawer}
            helpers={helpers}
            hideCrudActions
          />
        )}
      </Drawer>
    </div>
  );
}
