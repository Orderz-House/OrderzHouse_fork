import { useState, useEffect } from "react";
import {
  DollarSign,
  RefreshCw,
  CreditCard,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Download,
  Filter,
  Search,
  Plus,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { useSelector } from "react-redux";
import { toastInfo } from "../../services/toastService";

const Dashboard = () => {
  const { userData } = useSelector((state) => state.auth);
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    withdrawRequested: 0,
    pendingIncome: 0,
    availableInAccount: 0,
    completedProjects: 0,
    ongoingProjects: 0,
    cancelledProjects: 0,
    tasksSold: 0,
    ongoingTasks: 0,
    cancelledTasks: 0
  });
  
  const [earningHistory, setEarningHistory] = useState([]);
  const [payoutsHistory, setPayoutsHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawFilter, setWithdrawFilter] = useState("all");
  
  // Simulate data fetching
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch this from your API
        const mockData = {
          totalIncome: 12500.75,
          withdrawRequested: 3200.00,
          pendingIncome: 1850.50,
          availableInAccount: 5600.25,
          completedProjects: 12,
          ongoingProjects: 3,
          cancelledProjects: 1,
          tasksSold: 8,
          ongoingTasks: 2,
          cancelledTasks: 0
        };
        
        const mockEarningHistory = [
          { id: 1, date: "2023-10-15", project: "Website Redesign", amount: 2500.00 },
          { id: 2, date: "2023-10-10", project: "Mobile App Development", amount: 4500.00 },
          { id: 3, date: "2023-10-05", project: "Logo Design", amount: 800.00 },
          { id: 4, date: "2023-10-01", project: "SEO Optimization", amount: 1200.00 },
          { id: 5, date: "2023-09-25", project: "Content Writing", amount: 500.00 }
        ];
        
        const mockPayoutsHistory = [
          { id: 1, ref: "REF12345", status: "Completed", method: "PayPal", date: "2023-10-10", amount: 2000.00 },
          { id: 2, ref: "REF12346", status: "Processing", method: "Bank Transfer", date: "2023-10-05", amount: 1200.00 },
          { id: 3, ref: "REF12347", status: "Completed", method: "PayPal", date: "2023-09-28", amount: 1800.00 }
        ];
        
        setDashboardData(mockData);
        setEarningHistory(mockEarningHistory);
        setPayoutsHistory(mockPayoutsHistory);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Handle refresh action
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle withdraw action
  const handleWithdraw = () => {
    toastInfo("Withdraw functionality would be implemented here");
  };
  
  // Stats cards component
  const StatCard = ({ title, value, icon, subtitle, action, actionIcon, onAction }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">
            ${typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2 }) : value}
          </h3>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-2 bg-blue-100 rounded-lg">
          {icon}
        </div>
      </div>
      {action && (
        <button 
          onClick={onAction}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {action} {actionIcon}
        </button>
      )}
    </div>
  );
  
  // Count card component
  const CountCard = ({ title, count, icon, action, onAction }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{count}</h3>
        </div>
        <div className="p-2 bg-blue-100 rounded-lg">
          {icon}
        </div>
      </div>
      {action && (
        <button 
          onClick={onAction}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {action} <ArrowUpRight className="w-4 h-4 ml-1" />
        </button>
      )}
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, {userData?.first_name}!</p>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total income"
            value={dashboardData.totalIncome}
            icon={<DollarSign className="w-6 h-6 text-blue-600" />}
            action="Refresh"
            actionIcon={<RefreshCw className="w-4 h-4 ml-1" />}
            onAction={handleRefresh}
          />
          
          <StatCard
            title="Withdraw requested"
            value={dashboardData.withdrawRequested}
            icon={<CreditCard className="w-6 h-6 text-blue-600" />}
            action="Show all invoices"
            actionIcon={<ArrowUpRight className="w-4 h-4 ml-1" />}
            onAction={() => toastInfo("Show invoices")}
          />
          
          <StatCard
            title="Pending income"
            value={dashboardData.pendingIncome}
            icon={<Clock className="w-6 h-6 text-blue-600" />}
            action="Refresh"
            actionIcon={<RefreshCw className="w-4 h-4 ml-1" />}
            onAction={handleRefresh}
          />
          
          <StatCard
            title="Available in account"
            value={dashboardData.availableInAccount}
            icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
            action="Withdraw now"
            actionIcon={<ArrowUpRight className="w-4 h-4 ml-1" />}
            onAction={handleWithdraw}
          />
        </div>
        
        {/* Counts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <CountCard
            title="Completed projects"
            count={dashboardData.completedProjects}
            icon={<CheckCircle className="w-6 h-6 text-blue-600" />}
            action="View"
            onAction={() => toastInfo("View completed projects")}
          />
          
          <CountCard
            title="Ongoing projects"
            count={dashboardData.ongoingProjects}
            icon={<Clock className="w-6 h-6 text-blue-600" />}
            action="View"
            onAction={() => toastInfo("View ongoing projects")}
          />
          
          <CountCard
            title="Cancelled projects"
            count={dashboardData.cancelledProjects}
            icon={<XCircle className="w-6 h-6 text-blue-600" />}
            action="View"
            onAction={() => toastInfo("View cancelled projects")}
          />
          
          <CountCard
            title="Tasks sold"
            count={dashboardData.tasksSold}
            icon={<FileText className="w-6 h-6 text-blue-600" />}
            action="View"
            onAction={() => toastInfo("View tasks sold")}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Earning History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Earning History</h2>
                <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
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
                    {earningHistory.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 last:border-b-0">
                        <td className="py-3 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="py-3 text-sm font-medium">{item.project}</td>
                        <td className="py-3 text-sm text-right">${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Payouts Method */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payouts Method</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">PayPal</span>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Setup
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">Bank Account</span>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Setup
                  </button>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                Choose any payment method to receive your earned amount direct to your desired account. 
                Leaving this empty or unchecked will cause delay or no payments. 
                For further info read our details Privacy Policy
              </p>
            </div>
          </div>
        </div>
        
        {/* Payouts History */}
        <div className="mt-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 md:mb-0">Payouts History</h2>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search withdrawn records here"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <Filter className="w-4 h-4 text-gray-400 mr-2" />
                  <select 
                    value={withdrawFilter}
                    onChange={(e) => setWithdrawFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="processing">Processing</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                    <th className="pb-3">Ref#</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutsHistory.length > 0 ? (
                    payoutsHistory.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 last:border-b-0">
                        <td className="py-3 text-sm font-medium">{item.ref}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'Completed' 
                              ? 'bg-green-100 text-green-800' 
                              : item.status === 'Processing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 text-sm">{item.method}</td>
                        <td className="py-3 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="py-3 text-sm text-right">${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center">
                        <div className="flex flex-col items-center text-gray-500">
                          <AlertCircle className="w-12 h-12 mb-2" />
                          <p>Oops!! record not found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;