import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Star, 
  Filter, 
  ArrowUpDown, 
  Check, 
  User,
  ExternalLink,
  Briefcase,
  DollarSign
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setLoadingRelated, setRelatedFreelancers, setError } from "../../slice/projectSlice";
import axios from "axios";

export default function ProjectDetails() {
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const { relatedFreelancers, loadingRelated, error } = useSelector((s) => s.project);
    const token = useSelector((s) => s.auth.token);
    const roleId = useSelector((s) => s.auth.roleId);
    const API_BASE =  "http://localhost:5000";
    const [sortBy, setSortBy] = useState("assignments");
    const [skillFilter, setSkillFilter] = useState("");
    const [selected, setSelected] = useState({});
    
    useEffect(() => {
        if (!projectId) return;
        let isMounted = true;
        dispatch(setLoadingRelated(true));
        dispatch(setError(""));
        axios
            .get(`${API_BASE}/projects/${projectId}/related-freelancers`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            })
            .then((res) => {
                if (!isMounted) return;
                dispatch(setRelatedFreelancers(res.data.freelancers || []));
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
                <div className="mb-6">
                    <Link 
                        to="/" 
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                        ← Back to Home
                    </Link>
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Related Freelancers</h1>
                    <p className="text-gray-600 mb-6">
                        Discover talented professionals who match your project requirements
                    </p>
                    
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <Filter className="w-4 h-4 mr-1" />
                                Filter by skill
                            </label>
                            <input 
                                value={skillFilter} 
                                onChange={(e) => setSkillFilter(e.target.value)} 
                                placeholder="e.g. React, Photoshop, UI/UX Design" 
                                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            />
                        </div>
                        <div className="md:w-64">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <ArrowUpDown className="w-4 h-4 mr-1" />
                                Sort by
                            </label>
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)} 
                                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="assignments">Most Experienced</option>
                                <option value="hourly">Lowest Hourly Rate</option>
                            </select>
                        </div>
                    </div>
                    
                    {roleId && (Number(roleId) === 1 || Number(roleId) === 2) && (
                        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-blue-800 mb-1">Select multiple freelancers</h3>
                                    <p className="text-blue-700 text-sm">
                                        You can assign multiple freelancers to this project
                                    </p>
                                </div>
                                <button
                                    onClick={async () => {
                                        const ids = Object.keys(selected).filter((k) => selected[k]);
                                        if (!ids.length) {
                                            alert("Please select at least one freelancer");
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
                                            alert("Successfully assigned selected freelancers!");
                                            setSelected({});
                                        } catch (e) {
                                            alert("Failed to assign some freelancers");
                                        }
                                    }}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                                >
                                    Assign Selected ({Object.values(selected).filter(Boolean).length})
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                {loadingRelated && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-50 rounded-xl p-6 text-red-700 mb-8 text-center">
                        <p className="font-medium">{error}</p>
                    </div>
                )}
                
                {!loadingRelated && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSorted.map((f) => (
                            <div key={f.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                {roleId && (Number(roleId) === 1 || Number(roleId) === 2) && (
                                    <div className="flex items-center mb-4">
                                        <label className="inline-flex items-center gap-2 text-sm font-medium">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={!!selected[f.id]}
                                                    onChange={(e) => setSelected((s) => ({ ...s, [f.id]: e.target.checked }))}
                                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </div>
                                            Select for assignment
                                        </label>
                                    </div>
                                )}
                                
                                <div className="flex items-center mb-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl mr-4 overflow-hidden">
                                        {f.profile_pic_url ? (
                                            <img src={f.profile_pic_url} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-gray-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{f.first_name} {f.last_name}</h3>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                            <span>{f.assignments_count || 0} assignments completed</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-sm text-gray-600 mb-4">@{f.username}</div>
                                
                                {Array.isArray(f.portfolios) && f.portfolios.length > 0 && (
                                    <div className="border-t pt-4 mt-4">
                                        <div className="flex items-center text-sm font-semibold mb-3 text-gray-700">
                                            <Briefcase className="w-4 h-4 mr-2" />
                                            Portfolio Highlights
                                        </div>
                                        <ul className="space-y-3">
                                            {f.portfolios.slice(0, 2).map((p) => (
                                                <li key={p.id} className="text-sm">
                                                    <div className="font-medium text-gray-900">{p.title}</div>
                                                    {p.skills && (
                                                        <div className="flex flex-wrap gap-1 my-2">
                                                            {p.skills.split(',').map((skill, index) => (
                                                                <span 
                                                                    key={index} 
                                                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                                                >
                                                                    {skill.trim()}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {p.hourly_rate && (
                                                        <div className="flex items-center text-gray-600 mt-1">
                                                            <DollarSign className="w-4 h-4 mr-1" />
                                                            ${parseFloat(p.hourly_rate).toFixed(2)} / hr
                                                        </div>
                                                    )}
                                                    {p.work_url && (
                                                        <a 
                                                            href={p.work_url} 
                                                            target="_blank" 
                                                            rel="noreferrer" 
                                                            className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-2 text-xs"
                                                        >
                                                            View work <ExternalLink className="w-3 h-3 ml-1" />
                                                        </a>
                                                    )}
                                                </li>
                                            ))}
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
                                                alert("Freelancer assigned successfully!");
                                            } catch (e) {
                                                alert("Failed to assign freelancer");
                                            }
                                        }}
                                        className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center"
                                    >
                                        <Check className="w-5 h-5 mr-2" />
                                        Assign to Project
                                    </button>
                                )}
                            </div>
                        ))}
                        
                        {filteredSorted.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <div className="text-gray-500 text-lg mb-2">No related freelancers found</div>
                                <p className="text-gray-400">Try adjusting your filters or check back later</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}