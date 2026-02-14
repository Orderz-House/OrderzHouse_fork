import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../../api/client.js";
import { useToast } from "../../components/toast/ToastProvider";
import { Archive, FileText, Search, Plus, Edit, Trash2, Eye } from "lucide-react";

export default function TenderVaultManager() {
  const { userData } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const toast = useToast();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stored");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  // Check permission
  useEffect(() => {
    if (userData?.role_id !== 2 || !userData?.can_manage_tender_vault) {
      toast.error("Access denied. You do not have permission to manage tender vault.");
      navigate("/client");
    }
  }, [userData, navigate, toast]);

  useEffect(() => {
    fetchTenders();
  }, [activeTab, searchQuery, pagination.page]);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tender-vault/projects", {
        params: {
          status: activeTab,
          q: searchQuery,
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      if (res.data?.success) {
        setTenders(res.data.tenders || []);
        setPagination(res.data.pagination || pagination);
        // If success=true and projects=[], show empty state (no error toast)
        // Only show error toast when success=false or network error
      } else {
        // Backend returned success=false
        toast.error(res.data?.message || "Failed to load tender vault projects");
        setTenders([]);
      }
    } catch (err) {
      console.error("Failed to fetch tenders:", err);
      if (err.response?.status === 403) {
        toast.error("Access denied. You do not have permission to manage tender vault.");
        navigate("/client");
      } else if (err.response?.status === 200 && err.response?.data?.success) {
        // Success with empty list - no error toast
        setTenders([]);
      } else {
        // Real error - show toast
        toast.error("Failed to load tender vault projects");
        setTenders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await API.patch(`/tender-vault/${id}/status`, { status: newStatus });
      if (res.data?.success) {
        toast.success(`Tender status updated to ${newStatus}`);
        fetchTenders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tender?")) return;
    try {
      const res = await API.delete(`/tender-vault/${id}`);
      if (res.data?.success) {
        toast.success("Tender deleted successfully");
        fetchTenders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete tender");
    }
  };

  const statusTabs = [
    { key: "stored", label: "Stored", count: 0 },
    { key: "published", label: "Published", count: 0 },
    { key: "archived", label: "Archived", count: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tender Vault</h1>
          <p className="text-sm text-slate-600 mt-1">Manage your tender vault projects</p>
        </div>
        <button
          onClick={() => navigate("/client/tender-vault/new")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Tender
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search tenders..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className={`px-4 py-2 font-semibold text-sm border-b-2 transition ${
              activeTab === tab.key
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tenders List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : tenders.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No tenders found in {activeTab} status.
        </div>
      ) : (
        <div className="space-y-4">
          {tenders.map((tender) => (
            <div
              key={tender.id}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{tender.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                    {tender.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    {tender.category_name && (
                      <span>Category: {tender.category_name}</span>
                    )}
                    {tender.budget_min && tender.budget_max && (
                      <span>
                        Budget: {tender.budget_min} - {tender.budget_max} {tender.currency || 'JOD'}
                      </span>
                    )}
                    {tender.closing_date && (
                      <span>Closing: {new Date(tender.closing_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => navigate(`/client/tender-vault/${tender.id}`)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {activeTab === "stored" && (
                    <button
                      onClick={() => handleStatusChange(tender.id, "published")}
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition"
                      title="Publish"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}
                  {activeTab === "published" && (
                    <button
                      onClick={() => handleStatusChange(tender.id, "stored")}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition"
                      title="Unpublish"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusChange(tender.id, "archived")}
                    className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded transition"
                    title="Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tender.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))
            }
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
