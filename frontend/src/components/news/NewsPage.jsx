import React, { useEffect, useState } from "react";
import axios from "axios";
import { toastInfo } from "../../services/toastService";
import { Link } from "react-router-dom";
import ImgBBUpload from "../uploadImage/Upload";
import { useSelector } from "react-redux";
import {
  Edit,
  Trash2,
  Plus,
  Image as ImageIcon,
  Calendar,
  User,
  Newspaper,
  ArrowRight,
  Eye,
  Clock,
} from "lucide-react";

const NewsPage = () => {
  const [newsList, setNewsList] = useState([]);
  const [newNews, setNewNews] = useState({
    title: "",
    content: "",
    image_url: "",
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Get token + roleId from Redux
  const { token, roleId } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/news");
      setNewsList(res.data.news || []); // Ensure correct key (posts vs news)
    } catch (err) {
      console.error("Failed to load news:", err);
      showMessage("Failed to load news", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/news", newNews, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setNewNews({ title: "", content: "", image_url: "" });
      setIsFormOpen(false);
      fetchNews();
      showMessage("News article created successfully!", "success");
    } catch (err) {
      console.error("Failed to create news:", err);
      showMessage("Failed to create news article", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news article?")) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      fetchNews();
      showMessage("News article deleted successfully!", "success");
    } catch (err) {
      console.error("Failed to delete news:", err);
      showMessage("Failed to delete news article", "error");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateContent = (content, maxLength = 180) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + "…";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Newspaper className="w-16 h-16 text-blue-600 mx-auto animate-bounce opacity-70" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full animate-spin opacity-30"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">
            Loading updates...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white mb-5 shadow-lg">
            <Newspaper className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-3">
            News & Updates
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay informed with the latest announcements, events, and success
            stories from StudyzHouse.
          </p>
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div
            className={`p-4 rounded-xl mb-8 text-center font-medium shadow-md transition-all duration-300 transform animate-fade-in ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Add News Button (Admin Only) */}
        {roleId === 1 && (
          <div className="flex justify-center mb-10">
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span>{isFormOpen ? "Cancel" : "Add News Article"}</span>
            </button>
          </div>
        )}

        {/* Add News Form */}
        {isFormOpen && roleId === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Newspaper className="w-6 h-6 mr-2 text-blue-600" />
              Create New Article
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter a compelling title"
                  value={newNews.title}
                  onChange={(e) =>
                    setNewNews({ ...newNews, title: e.target.value })
                  }
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  placeholder="Write your article here..."
                  value={newNews.content}
                  onChange={(e) =>
                    setNewNews({ ...newNews, content: e.target.value })
                  }
                  rows={6}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Featured Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors duration-300">
                  {newNews.image_url ? (
                    <div className="space-y-4">
                      <div className="relative inline-block rounded-2xl overflow-hidden shadow-md group">
                        <img
                          src={newNews.image_url}
                          alt="Featured"
                          className="w-64 h-40 object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                          style={{ objectFit: "cover" }} // Prevents stretching
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-2xl"></div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setNewNews({ ...newNews, image_url: "" })
                        }
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-2">
                        Upload a high-quality image
                      </p>
                      <ImgBBUpload
                        onUpload={(url) =>
                          setNewNews({ ...newNews, image_url: url })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-blue-600 shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                🚀 Publish Article
              </button>
            </form>
          </div>
        )}

        {/* News List */}
        <div className="space-y-10">
          {newsList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
              <Newspaper className="w-20 h-20 text-gray-300 mx-auto mb-5 opacity-70" />
              <h3 className="text-2xl font-bold text-gray-500 mb-3">
                No articles yet
              </h3>
              <p className="text-gray-400 text-lg">
                {roleId === 1
                  ? "Be the first to share an update!"
                  : "Check back soon for exciting news."}
              </p>
            </div>
          ) : (
            newsList.map((news) => (
              <article
                key={news.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              >
                {/* Image Section */}
                {news.image_url && (
                  <div className="h-60 md:h-72 w-full overflow-hidden">
                    <img
                      src={news.image_url}
                      alt={news.title}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-8">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-5">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(news.createdAt)}</span>
                    </div>
                    {news.author && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span>{news.author}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>
                        {Math.ceil(news.content.length / 500)} min read
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight hover:text-blue-600 transition-colors">
                    {news.title}
                  </h2>

                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    {truncateContent(news.content)}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-gray-100">
                    <Link
                      to={`/news/${news.id}`}
                      className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-800 transition-colors group"
                    >
                      Read Full Story
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Admin Actions */}
                    {roleId === 1 && (
                      <div className="flex space-x-3 mt-4 sm:mt-0">
                        <button
                          onClick={() => toastInfo("Edit feature coming soon!")}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(news.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-200 text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16 mb-8">
          <p className="text-gray-500 mb-4">Want to contribute?</p>
          <Link
            to="/contact"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg"
          >
            <span>Share Your Story</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
