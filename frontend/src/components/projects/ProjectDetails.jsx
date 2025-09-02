import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Star, 
  Filter, 
  Search, 
  Briefcase, 
  DollarSign, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Download,
  Eye
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setLoadingRelated, setRelatedFreelancers, setError } from "../../slice/projectSlice";
import axios from "axios";
import { toastError, toastSuccess, toastInfo } from "../../services/toastService";

export default function ProjectDetails() {

  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { relatedFreelancers, loadingRelated, error } = useSelector((s) => s.project);
  const token = useSelector((s) => s.auth.token);
  const roleId = useSelector((s) => s.auth.roleId);
  const API_BASE = "http://localhost:5000";
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
      list = list.filter((f) => 
        Array.isArray(f.portfolios) && 
        f.portfolios.some((p) => (p.skills || "").toLowerCase().includes(q))
      );
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

  const handleAssignSelected = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (!ids.length) {
      toastInfo("Select at least one freelancer");
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
      toastSuccess("Assigned selected freelancers");
      navigate(`/manage-project/${projectId}`);
    } catch (e) {
      toastError("Failed to assign some freelancers");
    }
  };

  const handleAssignSingle = async (freelancerId) => {
    try {
      await axios.post(
        `${API_BASE}/projects/${projectId}/assign`,
        { freelancer_id: freelancerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/manage-project/${projectId}`);
    } catch (e) {
      toastError("Failed to assign freelancer");
      console.log(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Related Freelancers</h1>
                <p className="text-sm text-gray-600">Find the perfect match for your project</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search by skill</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  placeholder="e.g. React, Photoshop, Design"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="assignments">Most Experienced</option>
                <option value="hourly">Lowest Hourly Rate</option>
              </select>
            </div>
          </div>

          {roleId && (Number(roleId) === 1 || Number(roleId) === 2) && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {Object.values(selected).filter(Boolean).length} selected
                </span>
              </div>
              <button
                onClick={handleAssignSelected}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Users className="w-4 h-4 mr-2" />
                Assign Selected
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loadingRelated && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading freelancers...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 mr-3" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Freelancers Grid */}
        {!loadingRelated && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSorted.map((f) => (
              <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Selection Checkbox */}
                {roleId && (Number(roleId) === 1 || Number(roleId) === 2) && (
                  <div className="flex items-center mb-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={!!selected[f.id]}
                        onChange={(e) => setSelected((s) => ({ ...s, [f.id]: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Select freelancer</span>
                    </label>
                  </div>
                )}

                {/* Freelancer Header */}
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-4">
                    {f.profile_pic_url ? (
                      <img src={f.profile_pic_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">👤</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{f.first_name} {f.last_name}</h3>
                    <p className="text-sm text-gray-600">@{f.username}</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">{f.assignments_count || 0} assignments</span>
                    </div>
                  </div>
                </div>

                {/* Portfolio Items */}
                {Array.isArray(f.portfolios) && f.portfolios.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Portfolio
                    </h4>
                    <div className="space-y-3">
                      {f.portfolios.slice(0, 2).map((p) => (
                        <div key={p.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="font-medium text-sm text-gray-900">{p.title}</div>
                          {p.skills && (
                            <div className="text-xs text-gray-600 mt-1">
                              Skills: {p.skills}
                            </div>
                          )}
                          {p.hourly_rate && (
                            <div className="flex items-center text-sm text-gray-700 mt-2">
                              <DollarSign className="w-3 h-3 mr-1" />
                              ${parseFloat(p.hourly_rate).toFixed(2)}/hr
                            </div>
                          )}
                          {p.work_url && (
                            <a
                              href={p.work_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 mt-2"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View work
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {roleId && (Number(roleId) === 1 || Number(roleId) === 2) && (
                  <button
                    onClick={() => handleAssignSingle(f.id)}
                    className="w-full mt-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Assign to Project
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loadingRelated && !error && filteredSorted.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No freelancers found</h3>
            <p className="text-gray-600">
              {skillFilter ? 
                `No freelancers match "${skillFilter}". Try a different skill.` : 
                "No related freelancers available for this project."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}