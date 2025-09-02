import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  User,
  ArrowLeft,
  Newspaper,
  Clock,
  MessageCircle,
  Share2,
} from "lucide-react";

const NewsDetails = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);

        // Simulate real API call (replace with actual when backend ready)
        // const res = await axios.get(`http://localhost:5000/news/${id}`);
        // setNews(res.data.post);

        setTimeout(() => {
          setNews({
            id: 1,
            title: "New Course Launch: Master Freelancing in 30 Days",
            content: `We're excited to announce our newest course: "Master Freelancing in 30 Days" — designed to take beginners from zero to earning in under a month.\n\nThis hands-on course covers everything you need to know:\n\n• How to create a winning profile\n• Writing winning proposals\n• Pricing your services competitively\n• Managing clients and deadlines\n• Withdrawing earnings securely\n\nOnce you complete the course, you'll get direct access to OrderzHouse — our freelance marketplace — where you can start applying your skills immediately.\n\nNo experience? No problem. Our students have gone from complete beginners to earning $500+/month within weeks.\n\n✨ This is more than education — it's a career launchpad.\n\nJoin the first batch starting September 15th. Limited seats available.`,
            image_url:
              "https://studyzhouse.com/wp-content/uploads/2025/08/WhatsApp-Image-2025-07-27-at-14.17.18_6166fcdd.jpg",
            created_at: "2025-09-01T08:52:44.620Z",
            author: "orderZHouse Team",
            readTime: "5 min read",
          });
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setLoading(false);
      }
    };

    fetchNewsData();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const publishedDate = new Date(dateString);
    const diffTime = Math.abs(now - publishedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
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
            Loading article...
          </p>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Article Not Found
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            The news article you're looking for doesn't exist or has been
            removed.
          </p>
          <Link
            to="/news"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to News</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/news"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium group transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span>Back to All News</span>
        </Link>

        {/* Article Card */}
        <article className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Featured Image */}
          {news.image_url && (
            <div className="h-72 md:h-96 w-full overflow-hidden">
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8 md:p-10">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
              {news.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 border-b border-gray-100 pb-6 mb-6">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-blue-600" />
                <span>{formatDate(news.created_at)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-green-600" />
                <span>{news.readTime || "5 min read"}</span>
              </div>
              {news.author && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1.5 text-purple-600" />
                  <span>{news.author}</span>
                </div>
              )}
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {news.content.split("\n\n").map((paragraph, i) => (
                <p key={i} className="mb-5 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Divider */}
            <hr className="my-8 border-gray-200" />

            {/* Author Section
            <div className="flex items-center space-x-4 p-6 bg-blue-50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                SH
              </div>
              <div>
                <h4 className="font-bold text-gray-900">StudyzHouse Team</h4>
                <p className="text-gray-600 text-sm">Education & Career Growth</p>
              </div>
            </div> */}

            {/* Share & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center space-x-4 text-gray-500">
                <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>Share Feedback</span>
                </button>
                <button className="flex items-center space-x-2 hover:text-green-600 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>

              <Link
                to="/news"
                className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-5 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md"
              >
                <Newspaper className="w-4 h-4" />
                <span>All Articles</span>
              </Link>
            </div>
          </div>
        </article>

        {/* CTA: Inspired by Homepage */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Turn Learning into Earning?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto text-lg">
            Learn a skill. Apply it. Start earning — all in one ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/courses"
              className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition"
            >
              Browse Courses
            </Link>
            <Link
              to="/freelancers"
              className="px-6 py-3 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition"
            >
              Join as Freelancer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetails;
