import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Clock,
  User,
  Calendar,
  Eye,
  Search,
  Filter,
  ChevronRight,
  BookOpen,
  Tag,
  ArrowRight,
  Loader,
  Newspaper,
} from "lucide-react";

export default function NewsListPage() {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/news");
        setNews(res.data.news);
        setFilteredNews(res.data.news);

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(
            res.data.news.map((item) => item.category).filter(Boolean)
          ),
        ];
        setCategories(uniqueCategories);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching news:", error);
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      let result = news;

      // Apply search filter
      if (searchTerm) {
        result = result.filter(
          (item) =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply category filter
      if (selectedCategory !== "all") {
        result = result.filter((item) => item.category === selectedCategory);
      }

      setFilteredNews(result);
      setIsSearching(false);
    }, 300); // Small delay for better UX

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, news]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#F0F3BD]/20 flex items-center justify-center" style={{ fontFamily: "'Merriweather', serif" }}>
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#05668D] to-[#028090] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Newspaper className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <Loader className="w-5 h-5 sm:w-6 sm:h-6 text-[#028090] animate-spin absolute -top-2 -right-2" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-[#05668D] mt-4">
            Loading News Articles
          </h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            We're gathering the latest stories for you
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#F0F3BD]/20" style={{ fontFamily: "'Merriweather', serif" }}>
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-[#05668D] via-[#028090] to-[#00A896] text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-[#02C39A]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-[#F0F3BD]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#02C39A] to-[#00A896] rounded-3xl mb-6 sm:mb-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <Newspaper className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-[#F0F3BD] to-white bg-clip-text text-transparent">
                News & Insights
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed px-4">
              Stay informed with the latest updates, stories, and insights from
              our platform. Discover content that inspires and matters to you.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-blue-200">
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-[#F0F3BD] mr-2" />
                {news.length} articles published
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-[#F0F3BD] mr-2" />
                Updated daily
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-[#F0F3BD] mr-2" />
                Expert authors
              </div>
            </div>
          </div>
        </div>

        {/* Decorative wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-12 sm:h-16 text-gray-50"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V56.44Z"
              className="fill-current"
            ></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 -mt-6 sm:-mt-10">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 mb-8 sm:mb-12 border border-[#F0F3BD]/30">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-center justify-between">
            <div className="relative flex-1 max-w-2xl w-full">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search news articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#028090] focus:border-transparent transition-all duration-300 text-sm sm:text-base"
              />
            </div>

            <div className="flex items-center gap-3 sm:gap-4 bg-gray-50 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-[#028090]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent border-0 px-2 py-1 focus:outline-none focus:ring-0 text-sm sm:text-base text-[#05668D]"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* News Grid */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#05668D]">
              {selectedCategory === "all" ? "All News" : selectedCategory}
              {searchTerm && `: Results for "${searchTerm}"`}
            </h2>
            <div className="text-gray-600 bg-[#F0F3BD]/30 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm">
              Showing {filteredNews.length} of {news.length} articles
            </div>
          </div>

          {isSearching ? (
            <div className="flex justify-center items-center h-48 sm:h-64">
              <Loader className="w-6 h-6 sm:w-8 sm:h-8 text-[#028090] animate-spin mr-3" />
              <span className="text-gray-600 text-sm sm:text-base">Searching articles...</span>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-8 sm:p-12 text-center border border-[#F0F3BD]/30">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#05668D] mb-3 sm:mb-4">
                No articles found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
                {searchTerm
                  ? `No results found for "${searchTerm}". Try adjusting your search terms.`
                  : `No articles available in the "${selectedCategory}" category.`}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 bg-[#028090] text-white rounded-full hover:bg-[#05668D] transition-colors duration-300 text-sm sm:text-base"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredNews.map((item) => (
                <div key={item.id} className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#028090] to-[#02C39A] opacity-0 group-hover:opacity-10 blur transition-all duration-300 rounded-2xl sm:rounded-3xl"></div>
                  <Link
                    to={`/news/${item.id}`}
                    className="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 relative h-full flex flex-col border border-[#F0F3BD]/20 hover:border-[#02C39A]/30"
                  >
                    {item.image_url && (
                      <div className="h-36 sm:h-40 md:h-48 overflow-hidden relative">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        {item.category && (
                          <span className="absolute top-3 sm:top-4 left-3 sm:left-4 inline-flex items-center px-2 sm:px-3 py-1 bg-[#028090] text-white text-xs font-medium rounded-full">
                            {item.category}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-4 sm:p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-[#05668D] mb-2 sm:mb-3 group-hover:text-[#028090] transition-colors duration-300 line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-3 flex-grow text-sm sm:text-base">
                        {item.content.substring(0, 150)}...
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-3 sm:pt-4 border-t border-gray-100">
                        <div className="flex items-center text-xs sm:text-sm text-gray-500">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span>{item.author || "Admin"}</span>
                        </div>

                        <div className="flex items-center text-[#028090] font-medium group-hover:gap-2 transition-all duration-300 text-xs sm:text-sm">
                          Read more
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}