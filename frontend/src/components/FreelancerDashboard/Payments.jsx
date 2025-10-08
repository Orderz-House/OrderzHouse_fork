import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  DollarSign,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  Download,
  AlertCircle,
  Loader,
  Clock
} from "lucide-react";

const Payments = () => {
  const { userData, token } = useSelector((state) => state.auth);

  const [paymentData, setPaymentData] = useState({
    totalIncome: 0,
    withdrawRequested: 0,
    pendingIncome: 0,
    availableInAccount: 0
  });

  const [earningHistory, setEarningHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch earnings summary
  const fetchEarningsSummary = async () => {
    if (!token || !userData?.id) {
      setError("Authentication required");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/earnings/freelancer/${userData.id}/summary`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );

      if (res.data && res.data.success) {
        const summary = res.data.summary || {};
        setPaymentData({
          totalIncome: summary.totalIncome || 0,
          pendingIncome: summary.pendingIncome || 0,
          availableInAccount: summary.availableInAccount || 0,
          withdrawRequested: summary.withdrawRequested || 0
        });
        setError(null);
      } else {
        setError("Invalid response format from server");
      }
    } catch (err) {
      console.error("Error fetching earnings summary:", err);
      let errorMessage = "Failed to load payment data";
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout - Server is not responding";
      } else if (err.response) {
        errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`;
      } else if (err.request) {
        errorMessage = "Network error - Cannot connect to server";
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const fetchEarningsHistory = async () => {
    if (!token || !userData?.id) return;
    
    try {
      const res = await axios.get(
        `http://localhost:5000/earnings/freelancer/${userData.id}/history`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      if (res.data && res.data.success) {
        setEarningHistory(res.data.earningsHistory || []);
      }
    } catch (err) {
      console.error("Error fetching earnings history:", err);
      // Don't set error here to avoid overriding main error
    }
  };

  const fetchPaymentData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchEarningsSummary(),
        fetchEarningsHistory()
      ]);
    } catch (err) {
      console.error("Error in fetchPaymentData:", err);
      setError("Failed to load payment data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && userData?.id) {
      fetchPaymentData();
    } else {
      setIsLoading(false);
      setError("Please log in to access payment data");
    }
  }, [token, userData?.id]);

  const handleRefresh = () => {
    fetchPaymentData();
  };

  const handleWithdraw = () => {
    alert("Withdrawal system will be implemented in a future update");
  };

  const StatCard = ({ title, value, icon, subtitle, action, actionIcon, onAction, loading }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <Loader className="h-5 w-5 animate-spin text-gray-400 mt-1" />
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                JOD {typeof value === 'number' ? value.toLocaleString("en-JO", { minimumFractionDigits: 2 }) : '0.00'}
              </h3>
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </>
          )}
        </div>
        <div className="p-2 bg-blue-100 rounded-lg">{icon}</div>
      </div>
      {action && (
        <button
          onClick={onAction}
          disabled={loading}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {action} {actionIcon}
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your earnings and payment history
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
          <div className="flex-1">
            <p className="text-red-700">{error}</p>
            {error.includes("Cannot connect to server") && (
              <p className="text-sm text-red-600 mt-1">
                Make sure your backend server is running on http://localhost:5000
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="ml-4 text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
          >
            {isLoading ? "Retrying..." : "Retry"}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading payment data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Payment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StatCard
              title="Pending income"
              value={paymentData.pendingIncome}
              icon={<Clock className="w-6 h-6 text-blue-600" />}
              subtitle="Funds held in escrow"
              action="Refresh"
              actionIcon={<RefreshCw className="w-4 h-4 ml-1" />}
              onAction={handleRefresh}
              loading={isLoading}
            />
            <StatCard
              title="Available in account"
              value={paymentData.availableInAccount}
              icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
              subtitle="Wallet balance"
              action="Withdraw (Coming Soon)"
              actionIcon={<ArrowUpRight className="w-4 h-4 ml-1" />}
              onAction={handleWithdraw}
              loading={isLoading}
            />
          </div>

          {/* Additional Payment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StatCard
              title="Total Income"
              value={paymentData.totalIncome}
              icon={<DollarSign className="w-6 h-6 text-green-600" />}
              subtitle="All-time earnings"
              loading={isLoading}
            />
            <StatCard
              title="Withdraw Requested"
              value={paymentData.withdrawRequested}
              icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
              subtitle="Pending withdrawal"
              loading={isLoading}
            />
          </div>

          {/* Earnings History Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Earning History
              </h2>
              <button
                onClick={() => alert("Export functionality coming soon")}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Download className="w-4 h-4 mr-1" /> Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Project</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {earningHistory.length > 0 ? (
                    earningHistory.map((item, index) => (
                      <tr
                        key={item.id || index}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      >
                        <td className="py-3 text-sm">
                          {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 text-sm font-medium">
                          {item.project || 'Unknown Project'}
                        </td>
                        <td className="py-3 text-sm text-right">
                          JOD {(item.amount || 0).toLocaleString("en-JO", {
                            minimumFractionDigits: 2
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-8 text-center">
                        <div className="flex flex-col items-center text-gray-500">
                          <AlertCircle className="w-12 h-12 mb-2" />
                          <p>No earning history found</p>
                          <p className="text-sm mt-1">
                            Complete some projects to see your earnings here
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Payments;