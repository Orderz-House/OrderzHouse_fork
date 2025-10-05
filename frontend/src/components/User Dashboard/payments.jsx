import React, { useState, useEffect } from 'react';
import { MoreVertical, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Filter, Wallet, FileText, Lock, X } from 'lucide-react';

const FinancialTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [proofModal, setProofModal] = useState({ isOpen: false, url: null });
  const transactionsPerPage = 8;

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/payments/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setTransactions(result.data.overview);
        setBalance(result.data.balance);
      } else {
        setError(result.message || 'Failed to fetch financial data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      held: { color: 'bg-purple-100 text-purple-800', icon: Lock, label: 'Held' },
      released: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Released' },
      refunded: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Refunded' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'payment':
        return <DollarSign className="w-4 h-4 text-[#028090]" />;
      case 'wallet_transaction':
        return <Wallet className="w-4 h-4 text-[#028090]" />;
      case 'escrow':
        return <Lock className="w-4 h-4 text-[#028090]" />;
      default:
        return <FileText className="w-4 h-4 text-[#028090]" />;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'JOD',
      currencyDisplay: 'code'
    }).format(amount).replace('JOD', 'JD');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleDropdown = (transactionId) => {
    setOpenDropdown(openDropdown === transactionId ? null : transactionId);
  };

  const openProofModal = (url) => {
    setProofModal({ isOpen: true, url });
  };

  const closeProofModal = () => {
    setProofModal({ isOpen: false, url: null });
  };

  const filteredTransactions = activeFilter === 'all' 
    ? transactions 
    : transactions.filter(t => t.category === activeFilter);

  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const allColumns = ['id', 'category', 'project_id', 'amount', 'status', 'type', 'note', 'proof_url', 'created_at', 'released_at', 'date'];

  const getColumnsForType = (type) => {
    const sharedColumns = ['id', 'category', 'amount', 'date'];
    
    if (type === 'payment') {
      return [...sharedColumns.slice(0, 2), 'project_id', 'amount', 'status', 'proof_url', 'date'];
    } else if (type === 'wallet_transaction') {
      return [...sharedColumns.slice(0, 2), 'amount', 'type', 'note', 'date'];
    } else if (type === 'escrow') {
      return [...sharedColumns.slice(0, 2), 'project_id', 'amount', 'status', 'created_at', 'released_at'];
    } else if (type === 'all') {
      return allColumns;
    }
    return sharedColumns;
  };

  const renderColumnHeader = (column) => {
    const headers = {
      id: 'ID',
      category: 'Category',
      project_id: 'Project ID',
      amount: 'Amount',
      status: 'Status',
      type: 'Type',
      note: 'Note',
      proof_url: 'Proof',
      created_at: 'Created At',
      released_at: 'Released At',
      date: 'Date',
    };
    return headers[column] || column;
  };

  const renderCellContent = (transaction, column) => {
    switch (column) {
      case 'id':
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#028090] flex items-center justify-center text-white font-bold">
              {getCategoryIcon(transaction.category)}
            </div>
            <div className="ml-3">
              <div className="text-sm font-semibold text-gray-900">
                #{transaction.id}
              </div>
              <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                {transaction.category.replace('_', ' ')}
              </span>
            </div>
          </div>
        );
      
      case 'category':
        return (
          <div className="text-sm text-gray-700 capitalize">
            {transaction.category.replace('_', ' ')}
          </div>
        );
      
      case 'project_id':
        if (!transaction.project_id) return <div className="text-sm text-gray-400">-</div>;
        return (
          <div className="text-sm text-gray-900 font-medium">
            Project #{transaction.project_id}
          </div>
        );
      
      case 'amount':
        return (
          <div className="text-sm text-gray-900 font-medium">
            {formatCurrency(transaction.amount)}
          </div>
        );
      
      case 'status':
        if (!transaction.status) return <div className="text-sm text-gray-400">-</div>;
        return getStatusBadge(transaction.status);
      
      case 'type':
        if (!transaction.type) return <div className="text-sm text-gray-400">-</div>;
        return (
          <div className="text-sm text-gray-700 capitalize">
            {transaction.type.replace('_', ' ')}
          </div>
        );
      
      case 'note':
        if (!transaction.note) return <div className="text-sm text-gray-400">-</div>;
        return (
          <div className="text-sm text-gray-700 line-clamp-1">
            {transaction.note}
          </div>
        );
      
      case 'proof_url':
        if (!transaction.proof_url) return <div className="text-sm text-gray-400">-</div>;
        return (
          <button
            onClick={() => openProofModal(transaction.proof_url)}
            className="text-sm text-[#028090] hover:text-[#016d7a] underline"
          >
            View Proof
          </button>
        );
      
      case 'created_at':
        if (!transaction.created_at) return <div className="text-sm text-gray-400">-</div>;
        return (
          <div className="text-sm text-gray-700">
            {formatDate(transaction.created_at)}
          </div>
        );
      
      case 'released_at':
        if (!transaction.released_at) return <div className="text-sm text-gray-400">-</div>;
        return (
          <div className="text-sm text-gray-700">
            {formatDate(transaction.released_at)}
          </div>
        );
      
      case 'date':
        return (
          <div className="text-sm text-gray-700">
            {formatDate(transaction.date)}
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#028090] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Financial Data</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchFinancialData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Yet</h3>
        <p className="text-gray-600 mb-4">You haven't made any financial transactions yet.</p>
      </div>
    );
  }

  const columns = getColumnsForType(activeFilter);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-[#028090]">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white">Financial Overview</h2>
              <p className="text-white text-opacity-80 text-sm mt-1">
                Wallet Balance: {formatCurrency(balance)} • {filteredTransactions.length} {activeFilter !== 'all' ? activeFilter.replace('_', ' ') : 'total'} transactions
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-white text-[#028090]'
                    : 'bg-[#016d7a] text-white hover:bg-[#015a66]'
                }`}
              >
                <Filter className="w-4 h-4 inline mr-1" />
                All
              </button>
              <button
                onClick={() => setActiveFilter('payment')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'payment'
                    ? 'bg-white text-[#028090]'
                    : 'bg-[#016d7a] text-white hover:bg-[#015a66]'
                }`}
              >
                Payments
              </button>
              <button
                onClick={() => setActiveFilter('wallet_transaction')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'wallet_transaction'
                    ? 'bg-white text-[#028090]'
                    : 'bg-[#016d7a] text-white hover:bg-[#015a66]'
                }`}
              >
                Wallet
              </button>
              <button
                onClick={() => setActiveFilter('escrow')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'escrow'
                    ? 'bg-white text-[#028090]'
                    : 'bg-[#016d7a] text-white hover:bg-[#015a66]'
                }`}
              >
                Escrow
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                  >
                    {renderColumnHeader(column)}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentTransactions.map((transaction) => (
                <tr key={`${transaction.category}-${transaction.id}`} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => (
                    <td key={column} className="px-6 py-4">
                      {renderCellContent(transaction, column)}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => toggleDropdown(`${transaction.category}-${transaction.id}`)}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    {openDropdown === `${transaction.category}-${transaction.id}` && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenDropdown(null)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">
                            View Details
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            Download Receipt
                          </button>
                          {transaction.category === 'payment' && transaction.status === 'pending' && (
                            <>
                              <div className="border-t border-gray-200"></div>
                              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg">
                                Cancel Payment
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#028090] text-white hover:bg-[#016d7a]'
                }`}
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-[#028090] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#028090] text-white hover:bg-[#016d7a]'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {proofModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Payment Proof</h3>
              <button
                onClick={closeProofModal}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <img
                src={proofModal.url}
                alt="Payment Proof"
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none' }} className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Unable to load image. The file might be in an unsupported format.</p>
                <a
                  href={proofModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-4 py-2 bg-[#028090] text-white rounded-lg hover:bg-[#016d7a] transition-colors"
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FinancialTable;