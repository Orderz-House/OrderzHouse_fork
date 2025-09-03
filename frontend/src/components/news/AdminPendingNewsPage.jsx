import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  User,
  Calendar,
  Shield,
  Info,
} from "lucide-react";
import { useSelector } from "react-redux";

export default function AdminPendingNewsPage() {
  const [pendingNews, setPendingNews] = useState([]);
  const [expandedNews, setExpandedNews] = useState({});
  const { token } = useSelector((s) => s.auth);

  const fetchPendingNews = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/news/admin/notApporve",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const pending = Array.isArray(res.data.news) ? res.data.news : [];
      setPendingNews(pending);
    } catch (error) {
      console.error("Error fetching pending news:", error);
    }
  };

  useEffect(() => {
    fetchPendingNews();
  }, []);


  const approveNews = async (id) => {
    try {
      await axios.put(`http://localhost:5000/news/approve/${id}`);
      fetchPendingNews();
    } catch (error) {
      console.error("Error approving news:", error);
    }
  };

  const toggleNewsExpansion = (id) => {
    setExpandedNews((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(14,165,233,0.1),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_70%)]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl mb-8 shadow-2xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                Pending News Approval
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Review and approve news articles before they are published on the
              website
            </p>
            <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-blue-400 mr-2" />
                {pendingNews.length} pending articles
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 text-blue-400 mr-2" />
                Admin Dashboard
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 mb-12 border border-blue-100">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Quick Overview
              </h2>
              <div className="grid md:grid-cols-3 gap-6 text-gray-700">
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <h3 className="font-semibold mb-2 text-center">
                    Pending News
                  </h3>
                  <p className="text-3xl font-bold text-center text-blue-600">
                    {pendingNews.length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <h3 className="font-semibold mb-2 text-center">
                    Last Updated
                  </h3>
                  <p className="text-lg text-center text-gray-600">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <h3 className="font-semibold mb-2 text-center">
                    System Status
                  </h3>
                  <p className="text-lg text-center text-green-600">
                    Operational
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending News List */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            News Pending Review
          </h2>

          {!pendingNews?.length ? (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No Pending News
              </h3>
              <p className="text-gray-500">
                All news articles have been approved. There are currently no
                articles in the queue.
              </p>
            </div>
          ) : (
            pendingNews.map((news) => (
              <div
                key={news.id}
                className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div
                  className="p-8 cursor-pointer"
                  onClick={() => toggleNewsExpansion(news.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {news.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-gray-600 text-sm">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {news.author || "Unknown User"}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(news.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center space-x-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          approveNews(news.id);
                        }}
                        className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md"
                      >
                        Approve
                      </button>
                      {expandedNews[news.id] ? (
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {expandedNews[news.id] && (
                    <div className="mt-8 pl-20 space-y-6">
                      <div className="prose prose-lg max-w-none">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Article Content:
                        </h4>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {news.content}
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                        <div className="flex items-start space-x-3">
                          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-blue-800 mb-2">
                              Article Information
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4 text-blue-700">
                              <p>
                                <span className="font-medium">Category:</span>{" "}
                                {news.category || "Not specified"}
                              </p>
                              <p>
                                <span className="font-medium">Views:</span>{" "}
                                {news.views || 0}
                              </p>
                              <p>
                                <span className="font-medium">Status:</span>{" "}
                                <span className="text-amber-600">
                                  Pending Approval
                                </span>
                              </p>
                              <p>
                                <span className="font-medium">Date:</span>{" "}
                                {new Date(news.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Help Section */}
        <div className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Need Assistance?</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            If you have any questions about news management or encounter any
            issues, feel free to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold rounded-2xl hover:from-teal-600 hover:to-blue-600 transition-all duration-300 hover:scale-105 shadow-lg">
              Contact Support
            </button>
            <button className="px-8 py-4 border-2 border-gray-600 text-white font-semibold rounded-2xl hover:border-gray-500 hover:bg-gray-800 transition-all duration-300">
              View Guidelines
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}