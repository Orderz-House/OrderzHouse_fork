import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setLoadingRelated, setRelatedFreelancers, setError } from "../../slice/projectSlice";
import axios from "axios";

export default function ProjectDetails() {
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const { relatedFreelancers, loadingRelated, error, project } = useSelector((s) => s.project);
    const token = useSelector((s) => s.auth.token);
    const roleId = useSelector((s) => s.auth.roleId);
    const API_BASE =  "http://localhost:5000";
    const [sortBy, setSortBy] = useState("assignments");
    const [skillFilter, setSkillFilter] = useState("");
    const [selected, setSelected] = useState({});


    // import.meta.env.VITE_API_BASE ||
    useEffect(() => {
        if (!projectId) return;
        let isMounted = true;
        dispatch(setLoadingRelated(true));
        dispatch(setError(""));
        axios
            .get(`${API_BASE}/projects/${projectId}/related-freelancers/`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            })
            .then((res) => {
                if (!isMounted) return;
                dispatch(setRelatedFreelancers(res.data.freelancers || []));
                    console.log(res.data);

            })
            .catch((err) => {
                if (!isMounted) return;
                dispatch(setError(err.response?.data?.message || err.message || "Failed to load"));
            })
            .finally(() => {
                if (!isMounted) return;
                dispatch(setLoadingRelated(false));
            });
        return () => {
            isMounted = false;
        };
    }, [dispatch, projectId, token]);
    

    const filteredSorted = useMemo(() => {
        let list = Array.isArray(relatedFreelancers) ? [...relatedFreelancers] : [];
        if (skillFilter.trim()) {
            const q = skillFilter.toLowerCase();
            list = list.filter((f) => Array.isArray(f.portfolios) && f.portfolios.some((p) => (p.skills || "").toLowerCase().includes(q)));
        }
        if (sortBy === "hourly") {
            list.sort((a, b) => {
                const ah = Math.min(...(a.portfolios || []).map((p) => Number(p.hourly_rate) || Infinity));
                const bh = Math.min(...(b.portfolios || []).map((p) => Number(p.hourly_rate) || Infinity));
                return ah - bh;
            });
        } else {
            list.sort((a, b) => (Number(b.assignments_count || 0) - Number(a.assignments_count || 0)));
        }
        return list;
    }, [relatedFreelancers, sortBy, skillFilter]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 sm:px-6 lg:px-8 py-10">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-6">Related Freelancers</h1>
                <div className="flex flex-col md:flex-row md:items-end gap-3 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by skill</label>
                        <input value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} placeholder="e.g. React, Photoshop" className="border p-2 rounded w-full md:w-64" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border p-2 rounded w-full md:w-48">
                            <option value="assignments">Assignments (desc)</option>
                            <option value="hourly">Lowest hourly rate</option>
                        </select>
                    </div>
                </div>
                {loadingRelated && <div>Loading...</div>}
                {error && <div className="text-red-600">{error}</div>}
                {!loadingRelated && !error && (roleId && (Number(roleId) === 1 || Number(roleId) === 2)) && (
                    <div className="mb-4">
                        <button
                            onClick={async () => {
                                const ids = Object.keys(selected).filter((k) => selected[k]);
                                if (!ids.length) {
                                    alert("Select at least one freelancer");
                                    return;
                                }
                                try {
                                    await Promise.all(
                                        ids.map((fid) => axios.post(
                                            `${API_BASE}/projects/${projectId}/assign`,
                                            { freelancer_id: Number(fid) },
                                            { headers: { Authorization: `Bearer ${token}` } }
                                        ))
                                    );
                                    alert("Assigned selected freelancers");
                                } catch (e) {
                                    alert("Failed to assign some freelancers");
                                }
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Assign Selected
                        </button>
                    </div>
                )}
                {!loadingRelated && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSorted.map((f) => (
                            <div key={f.id} className="bg-white rounded-2xl p-6 shadow-lg">
                                {roleId && (Number(roleId) === 1 || Number(roleId) === 2) && (
                                    <div className="mb-2">
                                        <label className="inline-flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={!!selected[f.id]}
                                                onChange={(e) => setSelected((s) => ({ ...s, [f.id]: e.target.checked }))}
                                            />
                                            Select
                                        </label>
                                    </div>
                                )}
                                <div className="flex items-center mb-4">
                                    <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-xl mr-4 overflow-hidden">
                                        {f.profile_pic_url ? (
                                            <img src={f.profile_pic_url} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>👤</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{f.first_name} {f.last_name}</h3>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                            <span>{f.assignments_count || 0} assignments</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">@{f.username}</div>
                                {Array.isArray(f.portfolios) && f.portfolios.length > 0 && (
                                    <div className="border-t pt-3 mt-3">
                                        <div className="text-sm font-semibold mb-2">Portfolio</div>
                                        <ul className="space-y-2">
                                            {f.portfolios.slice(0, 2).map((p) => (
                                                <li key={p.id} className="text-sm text-gray-700">
                                                    <div className="font-medium">{p.title}</div>
                                                    {p.skills && <div className="text-gray-500">{p.skills}</div>}
                                                    {p.hourly_rate && (
                                                        <div className="text-gray-600">${'{'}parseFloat(p.hourly_rate).toFixed(2){'}'} / hr</div>
                                                    )}
                                                    {p.work_url && (
                                                        <a href={p.work_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View work</a>
                                                    )}
                                                </li>)
                                            )}
                                        </ul>
                                    </div>
                                )}
                                {roleId && (Number(roleId) === 1 || Number(roleId) === 2) && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await axios.post(
                                                    `${API_BASE}/projects/${projectId}/assign`,
                                                    { freelancer_id: f.id },
                                                    { headers: { Authorization: `Bearer ${token}` } }
                                                );
                                                alert("Freelancer assigned successfully");
                                            } catch (e) {
                                                alert("Failed to assign freelancer");
                                            }
                                        }}
                                        className="w-full mt-3 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors duration-300"
                                    >
                                        Assign to Project
                                    </button>
                                )}
                            </div>
                        ))}
                        {relatedFreelancers.length === 0 && (
                            <div className="text-gray-600">No related freelancers found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}


