import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios.js";
import { Share2, Users, UserPlus, TrendingUp, RefreshCw, ExternalLink } from "lucide-react";

const PRIMARY = "#f97316";
const CARD_CLASS = "bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden";
const PAGE_BG = "#F6F8FB";

export default function PartnerReferrals() {
  const navigate = useNavigate();
  const { token, userData } = useSelector((s) => s.auth);
  const isAdmin = Number(userData?.role_id) === 1;

  const RANGE_OPTIONS = [
    { value: "24h", label: "Last 24h" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "all", label: "All time" },
  ];

  const [partners, setPartners] = useState([]);
  const [selectedCode, setSelectedCode] = useState("efe");
  const [selectedRange, setSelectedRange] = useState("30d");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [signups, setSignups] = useState({ items: [], page: 1, limit: 20, total: 0 });
  const [signupsLoading, setSignupsLoading] = useState(false);
  const [signupsError, setSignupsError] = useState(null);

  const fetchPartners = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await API.get("/referrals/partners");
      const list = Array.isArray(data) ? data : [];
      setPartners(list);
      if (list.length > 0) {
        const hasEfe = list.some((p) => p.code === "efe");
        setSelectedCode((prev) => (hasEfe ? "efe" : list[0].code));
      }
    } catch (err) {
      console.error("Partners fetch:", err);
      setPartners([]);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    if (!selectedCode || !token) return;
    setStatsLoading(true);
    setStatsError(null);
    try {
      const params = { source: selectedCode, range: selectedRange };
      const response = await API.get("/referrals/stats", { params });
      const data = response?.data ?? response;
      const statsPayload = data?.data ?? data;
      if (statsPayload && typeof statsPayload.visits === "number") {
        setStats(statsPayload);
      } else {
        setStats(statsPayload || null);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to load stats";
      setStatsError(msg);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [selectedCode, selectedRange, token]);

  const fetchSignups = useCallback(async (pageOverride) => {
    if (!selectedCode || !token) return;
    setSignupsLoading(true);
    setSignupsError(null);
    const page = pageOverride !== undefined ? pageOverride : signups.page;
    try {
      const params = { source: selectedCode, range: selectedRange, page, limit: signups.limit };
      const response = await API.get("/referrals/signups", { params });
      const data = response?.data ?? response;
      const payload = data?.data ?? data;
      setSignups({
        items: payload?.items ?? [],
        page: payload?.page ?? 1,
        limit: payload?.limit ?? 20,
        total: payload?.total ?? 0,
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to load signups";
      setSignupsError(msg);
      setSignups((s) => ({ ...s, items: [] }));
    } finally {
      setSignupsLoading(false);
    }
  }, [selectedCode, selectedRange, token, signups.page, signups.limit]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  useEffect(() => {
    if (!selectedCode) return;
    fetchStats();
  }, [selectedCode, selectedRange, fetchStats]);

  useEffect(() => {
    if (!selectedCode) return;
    fetchSignups();
  }, [selectedCode, selectedRange, signups.page, fetchSignups]);

  const handleRefresh = () => {
    fetchStats();
    fetchSignups(1);
  };

  const totalPages = Math.max(1, Math.ceil(signups.total / signups.limit));
  const showingStart = signups.total === 0 ? 0 : (signups.page - 1) * signups.limit + 1;
  const showingEnd = Math.min(signups.page * signups.limit, signups.total);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: PAGE_BG }}>
        <div className={`${CARD_CLASS} p-6 max-w-md`}>
          <p className="text-slate-600">Only administrators can access Partner Referrals.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: PAGE_BG }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Partner Referrals</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Visits and signups by partner (e.g. EFE)
            </p>
          </div>
        </header>

        {/* Filters */}
        <div className={CARD_CLASS}>
          <div className="p-4 flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Partner</label>
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm min-w-[180px] bg-white"
              >
                {partners.length === 0 && (
                  <option value="efe">EFE</option>
                )}
                {partners.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-medium text-slate-500 mb-1">Range</label>
              {/* Pills on md+, Select on small screens */}
              <div className="hidden md:flex flex-wrap gap-1.5">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedRange(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                      selectedRange === opt.value
                        ? "text-white border-transparent"
                        : "text-slate-600 border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                    style={selectedRange === opt.value ? { backgroundColor: PRIMARY } : {}}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                className="md:hidden border border-slate-200 rounded-lg px-3 py-2 text-sm w-full max-w-[200px] bg-white"
              >
                {RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={statsLoading || signupsLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition"
              style={{ backgroundColor: PRIMARY }}
            >
              <RefreshCw className={`w-4 h-4 ${statsLoading || signupsLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {(statsError || signupsError) && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">
            {statsError || signupsError}
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`${CARD_CLASS} p-4`}>
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Share2 className="w-4 h-4" />
              <span className="text-xs font-medium">Total page visits</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {statsLoading ? "…" : stats != null && typeof stats.visits === "number" ? stats.visits : "—"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Every landing with ref/utm</p>
          </div>
          <div className={`${CARD_CLASS} p-4`}>
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Distinct sessions</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {statsLoading ? "…" : stats != null && typeof stats.uniqueVisits === "number" ? stats.uniqueVisits : "—"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Distinct sessions</p>
          </div>
          <div className={`${CARD_CLASS} p-4`}>
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <UserPlus className="w-4 h-4" />
              <span className="text-xs font-medium">Signups</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {statsLoading ? "…" : stats != null && typeof stats.signups === "number" ? stats.signups : "—"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Registered from this partner</p>
          </div>
          <div className={`${CARD_CLASS} p-4`}>
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Conversion rate</span>
            </div>
            <p className="text-lg font-bold text-slate-900" style={{ color: PRIMARY }}>
              {statsLoading ? "…" : stats != null && typeof stats.conversionRate === "number" ? `${stats.conversionRate}%` : "—"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Signups ÷ unique visits</p>
          </div>
        </div>

        {/* Table: Registered users from this partner */}
        <div className={CARD_CLASS}>
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Registered users from this partner</h2>
          </div>
          <div className="overflow-x-auto">
            {signupsLoading && signups.items.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Loading…</div>
            ) : signups.items.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No users in this range.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">User ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Created at</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Campaign</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Medium</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Landing path</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {signups.items.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-slate-900">{row.id}</td>
                      <td className="py-3 px-4 text-slate-700">{row.name || "—"}</td>
                      <td className="py-3 px-4 text-slate-700">{row.email || "—"}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {row.created_at
                          ? new Date(row.created_at).toLocaleDateString("en", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-[120px] truncate" title={row.signup_campaign}>
                        {row.signup_campaign || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{row.signup_medium || "—"}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-[160px] truncate" title={row.signup_landing_path}>
                        {row.signup_landing_path || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/people/clients`, { state: { highlightUserId: row.id } })}
                          className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {signups.total > 0 && (
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-600">
                Showing <span className="font-medium">{showingStart}</span>–
                <span className="font-medium">{showingEnd}</span> of{" "}
                <span className="font-medium">{signups.total}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSignups((s) => ({ ...s, page: Math.max(1, s.page - 1) }))}
                  disabled={signups.page <= 1}
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {signups.page} of {totalPages}
                </span>
                <button
                  onClick={() => setSignups((s) => ({ ...s, page: Math.min(totalPages, s.page + 1) }))}
                  disabled={signups.page >= totalPages}
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
