// import React, { useMemo, useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import PeopleTable from "../Tables";
// import { UserPlus2, BookOpen, Edit3, Trash2, Play, CheckCircle2, XCircle, Loader2 } from "lucide-react";

// /* ========= theme ========= */
// const PRIMARY = "#028090";
// const DARK = "#05668D";
// const ring = "rgba(15,23,42,.10)";
// const ringStyle = { border: `1px solid ${ring}` };

// /* ========= role ========= */
// function mapRole(roleId) {
//   if (roleId === 1) return "admin";
//   if (roleId === 2) return "client";
//   if (roleId === 3) return "freelancer";
//   return "user";
// }

// /* ========= axios ========= */
// function useApi(token) {
//   return useMemo(
//     () =>
//       axios.create({
//         baseURL: import.meta.env.VITE_API_URL || "",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { authorization: `Bearer ${token}` } : {}),
//         },
//       }),
//     [token]
//   );
// }

// /* ========= entry ========= */
// export default function Courses() {
//   const { userData } = useSelector((s) => s.auth);
//   const role = mapRole(userData?.role_id);

//   if (role === "admin") return <AdminCourses />;
//   if (role === "freelancer") return <FreelancerCourses />;
//   return <FreelancerCourses />;
// }

// /* ===================================================================================== */
// /* =====================================  ADMIN  ====================================== */
// /* ===================================================================================== */

// function AdminCourses() {
//   const { token } = useSelector((s) => s.auth);
//   const api = useApi(token);
//   const navigate = useNavigate();

//   /* ---- columns ---- */
//   const columns = [
//     { label: "Title", key: "title" },
//     { label: "Category", key: "category" },
//     { label: "Level", key: "level" },
//     { label: "Duration", key: "duration" },
//     { label: "Instructor", key: "instructor" },
//     { label: "Status", key: "status" }, // Draft / Published / Archived
//     { label: "Price", key: "price", render: (r) => (r.price ? `$${r.price}` : "—") },
//     { label: "Assigned", key: "assignedToName", render: (r) => r.assignedToName || "—" },
//   ];

//   /* ---- form ---- */
//   const formFields = [
//     { key: "title", label: "Title", required: true },
//     { key: "category", label: "Category" },
//     { key: "level", label: "Level" },
//     { key: "duration", label: "Duration" },
//     { key: "instructor", label: "Instructor" },
//     { key: "status", label: "Status", type: "select", options: ["Draft", "Published", "Archived"], defaultValue: "Draft" },
//     { key: "price", label: "Price", type: "number" },
//     { key: "description", label: "Description", type: "textarea" },
//     { key: "image", label: "Image URL" },
//   ];

//   /* ---- filter chips ---- */
//   const chips = [
//     { label: "All", value: "" },
//     { label: "Draft", value: "Draft" },
//     { label: "Published", value: "Published" },
//     { label: "Archived", value: "Archived" },
//   ];

//   /* ---- assign modal state ---- */
//   const [assignOpen, setAssignOpen] = useState(false);
//   const [assignFor, setAssignFor] = useState(null);
//   const [assignCtx, setAssignCtx] = useState({ helpers: null, rowId: null });

//   /* ---- actions (render beside CRUD) ---- */
//   const renderActions = (row, helpers) => {
//     const id = helpers.getId(row);

//     const openAssign = () => {
//       setAssignOpen(true);
//       setAssignFor(row);
//       setAssignCtx({ helpers, rowId: id });
//     };

//     return (
//       <div className="flex items-center gap-2">
       
//         <button
//           onClick={openAssign}
//           className="inline-flex items-center gap-2 h-9 rounded-xl text-white px-3 text-xs hover:shadow"
//           style={{ backgroundColor: PRIMARY }}
//           title="Assign to user"
//         >
//           <UserPlus2 className="w-3 h-3" />
//           Assign
//         </button>

        
//       </div>
//     );
//   };

//   /* ---- on assign confirmed ---- */
//   const handleAssign = async ({ userId, userName }) => {
//     if (!assignFor) return;
//     const courseId = assignCtx.rowId;

//     await api.post(`/api/admin/courses/${courseId}/assign`, { userId });

//     assignCtx.helpers?.updateRow?.(courseId, {
//       assignedTo: userId,
//       assignedToName: userName,
//       status: "Published", 
//     });

//     setAssignOpen(false);
//     setAssignFor(null);
//     setAssignCtx({ helpers: null, rowId: null });
//   };

//   return (
//     <>
//       <PeopleTable
//         title="Courses"
//         addLabel="Add Course"
//         endpoint="/api/admin/courses"
//         token={token}
//         columns={columns}
//         formFields={formFields}
//         chips={chips}
//         chipField="status"
//         filters={[{ key: "status", label: "Status", options: chips.slice(1).map((c) => c.value) }]}
//         desktopAsCards
//         mobileAsCards
//         crudConfig={{ showDetails: false, showRowEdit: false, showDelete: true }}
//         renderActions={renderActions}
//         onCardClick={(row, h) => navigate(`/courses/${h.getId(row)}`)}
//       />

//        {assignOpen && assignFor && (
//         <AssignModal
//           onClose={() => {
//             setAssignOpen(false);
//             setAssignFor(null);
//             setAssignCtx({ helpers: null, rowId: null });
//           }}
//           onAssign={/* دالة التعامل بعد الاختيار */ (payload) => { /* ... */ }}
//           api={api}
//           usersEndpoint="/admUser/role/3"   
//         />
//       )}
//     </>
//   );
// }

// /* ===================================================================================== */
// /* ==================================  FREELANCER  ==================================== */
// /* ===================================================================================== */

// function FreelancerCourses() {
//   const { token } = useSelector((s) => s.auth);
//   const navigate = useNavigate();

//   const columns = [
//     { label: "Title", key: "title" },
//     { label: "Category", key: "category" },
//     { label: "Level", key: "level" },
//     { label: "Duration", key: "duration" },
//     { label: "Instructor", key: "instructor" },
//     { label: "Status", key: "status" },
//   ];

//   const renderActions = (row, helpers) => {
//     const id = helpers.getId(row);
//     const started = (row.progress ?? 0) > 0;
//     return (
//       <div className="flex items-center gap-2">
//         <button
//           onClick={() => navigate(`/courses/${id}`)}
//           className="inline-flex items-center gap-2 h-9 rounded-xl bg-white hover:bg-slate-50 px-3 text-slate-700 text-xs"
//           style={ringStyle}
//           title="Open"
//         >
//           <BookOpen className="w-3 h-3" />
//           Open
//         </button>

//         <button
//           onClick={() => navigate(`/courses/${id}?start=1`)}
//           className="inline-flex items-center gap-2 h-9 rounded-xl text-white px-3 text-xs hover:shadow"
//           style={{ backgroundColor: PRIMARY }}
//           title={started ? "Continue" : "Start"}
//         >
//           <Play className="w-3 h-3" />
//           {started ? "Continue" : "Start"}
//         </button>
//       </div>
//     );
//   };

//   return (
//     <PeopleTable
//       title="My Courses"
//       endpoint="/api/freelancer/courses"
//       token={token}
//       columns={columns}
//       formFields={[]}
//       desktopAsCards
//       mobileAsCards
//       crudConfig={{ showDetails: false, showRowEdit: false, showDelete: false }}
//       renderActions={renderActions}
//       onCardClick={(row, h) => navigate(`/courses/${h.getId(row)}`)}
//     />
//   );
// }

// /* ===================================================================================== */
// /* ==================================  ASSIGN MODAL  ================================== */
// /* ===================================================================================== */

// /* ===== Assign Modal (robust search & parsing) ===== */
// function AssignModal({ onClose, onAssign, api, usersEndpoint = "/admUser/role/3" }) {
//   const [query, setQuery] = React.useState("");
//   const [loading, setLoading] = React.useState(false);
//   const [users, setUsers] = React.useState([]);
//   const [selected, setSelected] = React.useState(null);

//   const pickArray = React.useCallback((data) => {
//     if (Array.isArray(data)) return data;
//     if (Array.isArray(data?.items)) return data.items;
//     if (Array.isArray(data?.users)) return data.users;
//     if (Array.isArray(data?.results)) return data.results;
//     if (Array.isArray(data?.data)) return data.data;
//     const values = Object.values(data || {});
//     const nestedArr = values.find(Array.isArray);
//     if (nestedArr) return nestedArr;
//     if (data?.data && typeof data.data === "object") {
//       const deep = Object.values(data.data).find(Array.isArray);
//       if (deep) return deep;
//     }
//     return [];
//   }, []);

//   const normalize = React.useCallback((arr) => {
//     return (arr || []).map((u) => ({
//       raw: u,
//       id: u.id ?? u._id,
//       name:
//         `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() ||
//         u.full_name || u.username || u.email || "User",
//       email: u.email || "",
//       username: u.username || "",
//     }));
//   }, []);

//   const fetchUsers = React.useCallback(
//     async (q) => {
//       try {
//         setLoading(true);
//         console.log("[AssignModal] GET", usersEndpoint, { q });

//         const { data } = await api.get(usersEndpoint, {
//           params: { role: 3, q: q || undefined, limit: 20 },
//           silent: true,
//         });

//         let list = pickArray(data);

//         if (q) {
//           const k = q.toLowerCase();
//           list = list.filter((u) => {
//             const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.toLowerCase();
//             return (
//               name.includes(k) ||
//               (u.email ?? "").toLowerCase().includes(k) ||
//               (u.username ?? "").toLowerCase().includes(k)
//             );
//           });
//         }

//         setUsers(normalize(list));
//       } catch (e) {
//         console.error("AssignModal fetch users failed:", e);
//         setUsers([]);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [api, usersEndpoint, pickArray, normalize]
//   );

//   React.useEffect(() => {
//     fetchUsers(query);
//   }, [fetchUsers, query]);

//   const confirm = () => {
//     if (!selected) return;
//     onAssign({ userId: selected.id, userName: selected.name });
//   };

//   const ringStyle = { border: "1px solid rgba(15,23,42,.10)" };

//   return (
//     <div className="fixed inset-0 z-[9999]">
//       <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
//       <div className="absolute inset-0 flex items-center justify-center p-4">
//         <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl overflow-hidden">
//           {/* header */}
//           <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
//             <div className="font-semibold text-slate-800">Assign course to user</div>
//             <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100" title="Close">×</button>
//           </div>

//           {/* body */}
//           <div className="p-5 space-y-4">
//             <div>
//               <label className="text-sm text-slate-600">Search user</label>
//               <input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Name, email or username…"
//                 className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-white text-sm outline-none"
//                 style={ringStyle}
//               />
//             </div>

//             <div className="rounded-2xl bg-white" style={ringStyle}>
//               <div className="max-h-64 overflow-auto divide-y divide-slate-100">
//                 {loading ? (
//                   <div className="p-4 text-sm text-slate-500">Loading…</div>
//                 ) : users.length === 0 ? (
//                   <div className="p-4 text-sm text-slate-500">No results.</div>
//                 ) : (
//                   users.map((u) => {
//                     const active = selected?.id === u.id;
//                     return (
//                       <button
//                         key={u.id}
//                         onClick={() => setSelected(u)}
//                         className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 ${active ? "bg-slate-50" : ""}`}
//                         title="Select"
//                       >
//                         <div className="font-medium text-slate-800">{u.name}</div>
//                         <div className="text-xs text-slate-500">{u.email || u.username || "—"}</div>
//                       </button>
//                     );
//                   })
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* footer */}
//           <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
//             <button type="button" onClick={onClose} className="h-10 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm" style={ringStyle}>
//               Cancel
//             </button>
//             <button
//               onClick={confirm}
//               disabled={!selected}
//               className="h-10 px-4 rounded-xl text-white text-sm disabled:opacity-50"
//               style={{ backgroundColor: "#028090" }}
//               title="Assign"
//             >
//               Assign
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
