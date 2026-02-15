// Tables.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import API from "../api/axios.js";
import { MOCK_ENABLED, mockFetch } from "./mockData.js";
import {
  FiEdit2,
  FiTrash2,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiHeart,
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

const PRIMARY = "#C2410C";
const DEBOUNCE_DELAY = 300;

/* ====================== Skeletons ====================== */
const Sk = ({ className = "" }) => (
  <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} />
);

const TableSkeleton = ({ columnsCount = 6, rowsCount = 6, showExpand = false }) => {
  const cols = Math.max(1, columnsCount);
  const rows = Math.max(3, rowsCount);

  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-[13px]">
        <thead className="border-b border-slate-200 bg-[#FCE7E0]">
          <tr>
            {showExpand && <th className="w-10 px-3 py-2" />}
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-3 py-2">
                <Sk className={`h-3 ${i === 0 ? "w-24" : "w-16"} mx-auto md:mx-0`} />
              </th>
            ))}
            <th className="w-28 px-3 py-2" />
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {showExpand && (
                <td className="px-3 py-2">
                  <Sk className="w-9 h-9 rounded-full" />
                </td>
              )}

              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="px-3 py-2">
                  <Sk className={`h-3 ${c === 0 ? "w-40" : "w-28"}`} />
                </td>
              ))}

              <td className="px-3 py-2">
                <div className="flex items-center justify-center gap-2">
                  <Sk className="w-9 h-9 rounded-full" />
                  <Sk className="w-16 h-9 rounded-full" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CardsSkeleton = ({ count = 8, className = "" }) => (
  <div className={className}>
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="rounded-2xl border border-slate-100 bg-white/90 shadow-sm overflow-hidden"
      >
        <Sk className="h-32 w-full rounded-none" />
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-2">
              <Sk className="h-3 w-40" />
              <Sk className="h-3 w-28" />
            </div>
            <Sk className="h-5 w-16 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Sk className="h-7 rounded-xl" />
            <Sk className="h-7 rounded-xl" />
          </div>
          <div className="pt-1 flex items-center justify-between gap-2">
            <Sk className="h-9 w-24 rounded-full" />
            <div className="flex items-center gap-2">
              <Sk className="h-9 w-16 rounded-full" />
              <Sk className="h-9 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const MobileListSkeleton = ({ count = 6 }) => (
  <div className="block md:hidden space-y-2 w-full max-w-[100vw] overflow-x-hidden">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm"
      >
        <div className="flex items-center gap-3 min-h-[56px]">
          <Sk className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Sk className="h-3 w-40" />
            <Sk className="h-3 w-28" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Sk className="w-8 h-8 rounded-full" />
            <Sk className="w-14 h-8 rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ====================== Drawer ====================== */
const Drawer = ({ open, onClose, title, subtitle, children }) => {
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`absolute inset-y-0 right-0 w-full sm:max-w-[520px] bg-white shadow-2xl ring-1 ring-slate-200
        transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200">
          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-800 truncate">{title}</div>
            {subtitle && <div className="text-[12.5px] text-slate-500 truncate">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700"
            title="Close"
          >
            <FiX />
          </button>
        </div>
        <div className="h-[calc(100%-56px)] overflow-y-auto p-4">{children}</div>
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
  return useMemo(() => API, [token]);
}

/* ====================== Data Hook ====================== */
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

    // Mock
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

    const timeoutId = setTimeout(async () => {
      try {
        const { data } = await API.get(endpoint, { params, signal: controller.signal });

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
          : Array.isArray(data?.payments)
          ? data.payments
          : Array.isArray(data?.tasks)
          ? data.tasks
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
        const isCancel = err?.name === "Canceled" || err?.name === "AbortError" || err?.code === "ERR_CANCELED";
        if (!isCancel) {
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

  if (raw == null || raw === "") return <span className="text-slate-400">—</span>;
  const val = String(raw);
  const key = val.toLowerCase();

  if (label.includes("appointment status") || label.includes("status")) {
    const chipMap = {
      completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      done: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      rescheduled: "bg-amber-50 text-amber-700 ring-amber-200",
      cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
      unknown: "bg-slate-100 text-slate-600 ring-slate-200",
    };
    const cls = chipMap[key] || "bg-slate-100 text-slate-600 ring-slate-200";
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] ring-1 ${cls}`}>
        {val}
      </span>
    );
  }

  if (label.includes("call status") || label.includes("state")) {
    const color = {
      active: "text-emerald-600",
      escalated: "text-orange-500",
      resolved: "text-orange-600",
      dropped: "text-amber-600",
      scheduled: "text-sky-600",
      missed: "text-rose-600",
    }[key];
    return <span className={`font-medium ${color || "text-slate-700"}`}>{val}</span>;
  }

  return val;
}

function pickColumn(columns, keywords = []) {
  const lower = (s) => String(s || "").toLowerCase();
  const byLabel = (kw) =>
    columns.find((c) => lower(c.label).includes(kw)) || columns.find((c) => lower(c.key).includes(kw));
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
  return row?.avatar || row?.image || row?.profile_image || row?.photoUrl || row?.photoURL || "";
}
function pickCover(row) {
  return row?.cover || row?.coverUrl || row?.cover_image || row?.image || "";
}

/* ====================== Course-style card (presentational) ====================== */
const CourseStyleCard = ({
  row,
  idx,
  helpers,
  titleVal,
  subtitleText,
  tagText,
  coverUrl,
  avatarUrl,
  status,
  crudConfig,
  hideCrudActions,
  renderActions,
  onCardClick,
  onOpenDrawer,
  onToggleExpand,
  expandedRow,
  isExpanded,
  formFields,
  editingRowId,
  onSaveEdit,
  onCancelEdit,
  renderSubtitle,
  columns,
}) => {
  const [liked, setLiked] = useState(false);
  const isEditing = editingRowId === helpers.getId(row);

  const description =
    typeof renderSubtitle === "function" ? renderSubtitle(row, helpers) : (subtitleText != null && subtitleText !== "" ? String(subtitleText) : null);
  const nameRoleText = subtitleText != null && String(subtitleText).trim() !== "" ? String(subtitleText) : (status != null ? String(status) : "—");

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onCardClick?.(row, helpers)}
        onKeyDown={(e) => e.key === "Enter" && onCardClick?.(row, helpers)}
        className="cursor-pointer outline-none"
      >
        {/* Cover */}
        <div className="relative h-36 w-full overflow-hidden">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-orange-400 to-red-500" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.5),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(255,255,255,0.4),transparent_55%)]" />
            </>
          )}

         

          {/* Tag pill (bottom-left) */}
          {tagText != null && String(tagText).trim() !== "" && (
            <span className="absolute left-3 bottom-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#C2410C]">
              {String(tagText)}
            </span>
          )}

          {/* Expand (top-left on cover) */}
          {crudConfig?.showExpand && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand?.(idx);
              }}
              className="absolute left-3 top-3 w-9 h-9 grid place-items-center rounded-full bg-white/90 shadow border border-white/60 text-slate-700 hover:bg-white"
              title="Toggle"
            >
              {isExpanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
            </button>
          )}
        </div>

        {/* Content under image */}
        <div className="p-4">
          <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2">{titleVal}</h3>
          {description != null && (
            <p className="mt-1 text-[12px] text-slate-500 line-clamp-2">{description}</p>
          )}

          {/* Bottom row: avatar + name/role + actions */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 shrink-0 grid place-items-center text-[11px] font-semibold text-slate-600">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  initialsFrom(String(titleVal))
                )}
              </div>
              <span className="text-[12px] text-slate-600 truncate">{nameRoleText}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {crudConfig?.showDetails && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDrawer?.(row, idx);
                  }}
                  className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  title="View / Edit"
                >
                  <AiOutlineEdit size={18} />
                </button>
              )}
              {typeof renderActions === "function" && (
                <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
                {renderActions(row, helpers)}
                </div>
              )}
              {!hideCrudActions && (
                <>
                  {crudConfig?.showRowEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDrawer?.(row, idx);
                      }}
                      className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      title="Edit"
                    >
                      <FiEdit2 size={16} />
                    </button>
                  )}
                  {crudConfig?.showDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        helpers.handleDelete(idx);
                      }}
                      className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-red-600"
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-200">
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
};

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
  if (loading) return <MobileListSkeleton count={6} />;
  if (error) return <div className="block md:hidden text-center text-red-600 py-8">{error}</div>;
  if (!rows.length) return <div className="block md:hidden text-center text-slate-500 py-8">No {title} found</div>;

  const nameCol = pickColumn(columns, ["name", "full name", "username"]) || columns[0];
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

        const secondary = email ?? (country ? String(country) : role ? String(role) : undefined);

        return (
          <div key={idx} className="w-full rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
            <div className="flex items-center gap-3 min-h-[56px]">
              {/* Expand */}
              {crudConfig.showExpand && (
                <button
                  onClick={() => onToggleExpand?.(idx)}
                  className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 shrink-0"
                  title="Toggle"
                >
                  {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                </button>
              )}

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
                  <div className="text-[14px] font-medium text-slate-800 truncate">{primary}</div>

                  {state && (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] ${
                        state === "online" ? "text-emerald-600" : "text-slate-500"
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

                  {isVerified && <span className="text-[11px] text-emerald-600">✓ Verified</span>}
                </div>

                {secondary && <div className="text-[12px] text-slate-600 truncate">{secondary}</div>}
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

                {renderActions ? (
                  renderActions(row, helpers)
                ) : !hideCrudActions ? (
                  <>
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
                  </>
                ) : null}
              </div>
            </div>

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
      <TableSkeleton
        columnsCount={columns?.length || 6}
        rowsCount={6}
        showExpand={crudConfig.showExpand}
      />
    );
  }

  if (error) {
    return (
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-8 text-center text-red-600">{error}</div>
      </div>
    );
  }

  // Determine if Actions column should be shown
  const hasActions = renderActions || (!hideCrudActions && (crudConfig?.showDetails || crudConfig?.showRowEdit || crudConfig?.showDelete));

  return (
    <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-[13px] table-fixed">
        <thead className="border-b border-slate-200 bg-[#FCE7E0]">
          <tr>
            {crudConfig.showExpand && <th className="w-10 px-4 py-3 border-r border-gray-200" />}
            {columns.map((col, colIdx) => {
              const widthClass = col.width || "";
              const alignClass = col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left";
              const isLastColumn = colIdx === columns.length - 1 && !hasActions;
              return (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-4 py-3 align-middle ${widthClass} ${alignClass} ${!isLastColumn ? "border-r border-gray-200" : ""} text-[12px] font-semibold text-[#C2410C]`}
                >
                  {col.label}
                </th>
              );
            })}
            {hasActions && (
              <th className="w-[90px] px-4 py-3 text-center align-middle text-[12px] font-semibold text-[#C2410C]">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {!rows.length ? (
            <tr>
              <td
                colSpan={columns.length + (crudConfig.showExpand ? 1 : 0) + (hasActions ? 1 : 0)}
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
                <React.Fragment key={helpers.getId(row) ?? idx}>
                  <tr className={`hover:bg-slate-50 ${isExpanded ? "bg-slate-50" : ""} h-10`}>
                    {crudConfig.showExpand && (
                      <td className="px-4 py-3 text-center align-middle border-r border-gray-200">
                        <button
                          onClick={() => onToggleExpand(idx)}
                          className="w-9 h-9 grid place-items-center rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700"
                          title="Toggle"
                        >
                          {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                        </button>
                      </td>
                    )}

                    {columns.map((col, colIdx) => {
                      const alignClass = col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left";
                      const isLastColumn = colIdx === columns.length - 1 && !hasActions;
                      return (
                        <td key={col.key} className={`px-4 py-3 text-slate-800 align-middle ${alignClass} ${!isLastColumn ? "border-r border-gray-200" : ""}`}>
                          {col.render ? col.render(row, idx) : row[col.key]}
                        </td>
                      );
                    })}
                    {hasActions && (
                      <td className="px-4 py-3 text-center align-middle">
                        <div className="flex items-center justify-center gap-1">
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
                    )}
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td
                        colSpan={columns.length + (crudConfig.showExpand ? 1 : 0) + (hasActions ? 1 : 0)}
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
      <CardsSkeleton
        count={8}
        className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      />
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

  const nameCol = pickColumn(columns, ["title", "name", "full name", "username"]) || columns[0];
  const subCol = pickColumn(columns, ["client", "owner", "email", "country"]);
  const statusCol = pickColumn(columns, ["status"]);
  const tagCol = pickColumn(columns, ["category", "type", "role"]);

  return (
    <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {rows.map((row, idx) => {
        const isExpanded = expandedRow === idx;
        const titleVal = getCellValue(nameCol, row, idx) ?? "—";
        const subVal = getCellValue(subCol, row, idx);
        const status = getCellValue(statusCol, row, idx);
        const tagText = getCellValue(tagCol, row, idx) ?? status ?? "";
        const coverUrl = pickCover(row);
        const avatarUrl = pickAvatar(row);

        return (
          <CourseStyleCard
            key={helpers.getId(row) ?? idx}
            row={row}
            idx={idx}
            helpers={helpers}
            titleVal={titleVal}
            subtitleText={subVal != null ? String(subVal) : ""}
            tagText={tagText != null ? String(tagText) : ""}
            coverUrl={coverUrl}
            avatarUrl={avatarUrl}
            status={status}
            crudConfig={crudConfig}
            hideCrudActions={hideCrudActions}
            renderActions={renderActions}
            onCardClick={onCardClick}
            onOpenDrawer={onOpenDrawer}
            onToggleExpand={onToggleExpand}
            expandedRow={expandedRow}
            isExpanded={isExpanded}
            formFields={formFields}
            editingRowId={editingRowId}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
            renderSubtitle={renderSubtitle}
            columns={columns}
          />
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
  if (loading) return <CardsSkeleton count={4} className="grid md:hidden grid-cols-1 gap-3" />;
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

  const nameCol = pickColumn(columns, ["title", "name", "full name", "username"]) || columns[0];
  const subCol = pickColumn(columns, ["client", "owner", "email", "country"]);
  const statusCol = pickColumn(columns, ["status"]);
  const tagCol = pickColumn(columns, ["category", "type", "role"]);

  return (
    <div className="grid md:hidden grid-cols-1 gap-3">
      {rows.map((row, idx) => {
        const isExpanded = expandedRow === idx;
        const titleVal = getCellValue(nameCol, row, idx) ?? "—";
        const subVal = getCellValue(subCol, row, idx);
        const status = getCellValue(statusCol, row, idx);
        const tagText = getCellValue(tagCol, row, idx) ?? status ?? "";
        const coverUrl = pickCover(row);
        const avatarUrl = pickAvatar(row);

        return (
          <CourseStyleCard
            key={helpers.getId(row) ?? idx}
            row={row}
            idx={idx}
            helpers={helpers}
            titleVal={titleVal}
            subtitleText={subVal != null ? String(subVal) : ""}
            tagText={tagText != null ? String(tagText) : ""}
            coverUrl={coverUrl}
            avatarUrl={avatarUrl}
            status={status}
            crudConfig={crudConfig}
            hideCrudActions={hideCrudActions}
            renderActions={renderActions}
            onCardClick={onCardClick}
            onOpenDrawer={onOpenDrawer}
            onToggleExpand={onToggleExpand}
            expandedRow={expandedRow}
            isExpanded={isExpanded}
            formFields={formFields}
            editingRowId={editingRowId}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
            renderSubtitle={renderSubtitle}
            columns={columns}
          />
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
  onDelete,
  renderSubtitle,
  mobileAsCards = false,
  searchValue,
}) {
  const dispatch = useDispatch();
  const api = useApi(token);
  const { editingRowId } = useSelector((s) => s.users);

  const mergedCrudConfig = useMemo(() => ({ ...DEFAULT_CRUD_CONFIG, ...crudConfig }), [crudConfig]);

  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);

  const { rows, setRows, loading, error } = useTableData({ endpoint, api, refreshKey });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  // reset expand on page change
  useEffect(() => {
    setExpandedRow(null);
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [refreshKey]);

  const tableColumns = columns?.length ? columns : [{ label: "Name", key: "name" }, { label: "Role", key: "role" }];

  const getId = useCallback((row) => row.id ?? row._id, []);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const startEdit = useCallback((rowId) => dispatch(setEditingRowId(rowId)), [dispatch]);

  const handleSaveEdit = useCallback(
    async (formData) => {
      try {
        if (!endpoint) {
          setRows((prev) => prev.map((row) => (row.id === formData.id ? { ...row, ...formData } : row)));
          dispatch(updateUser(formData));
          dispatch(setEditingRowId(null));
          return;
        }
        await API.put(`${endpoint}/${formData.id}`, formData);
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

  const handleCancelEdit = useCallback(() => dispatch(setEditingRowId(null)), [dispatch]);

  // ✅ Important fix: delete by paged index -> global index
  const handleDelete = useCallback(
    async (pagedIdxOrRow) => {
      let row = null;

      if (typeof pagedIdxOrRow === "number") {
        const globalIdx = (page - 1) * pageSize + pagedIdxOrRow;
        row = rows[globalIdx];
      } else if (pagedIdxOrRow && typeof pagedIdxOrRow === "object") {
        row = pagedIdxOrRow;
      }

      if (!row || !window.confirm("Do you want to delete this record?")) return;

      const id = getId(row);

      try {
        if (typeof onDelete === "function") {
          await onDelete(row, pagedIdxOrRow, {
            rows,
            setRows,
            getId,
            refresh,
            startEdit,
            api,
            endpoint,
            token,
          });
          return;
        }

        if (endpoint && id != null) {
          await API.delete(`${endpoint}/${id}`);
          dispatch(removeUser(id));
        }
        refresh();
      } catch (err) {
        console.error(err);
        dispatch(setError("Failed to delete this record"));
      }
    },
    [rows, endpoint, api, dispatch, refresh, onDelete, setRows, getId, startEdit, token, page, pageSize]
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

  const selectedRow = drawerIndex != null && drawerIndex >= 0 ? pagedRows[drawerIndex] : null;

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
          onToggleExpand={handleToggleExpand}
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
          onToggleExpand={handleToggleExpand}
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
          onToggleExpand={handleToggleExpand}
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
          onToggleExpand={handleToggleExpand}
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

      <div className="flex justify-center w-full mt-4">
        <Pagination page={page} total={rows.length} pageSize={pageSize} onPageChange={setPage} />
      </div>

      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={`Edit ${title}`}
        subtitle={selectedRow ? selectedRow.email || selectedRow.name || selectedRow.title || "" : ""}
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
