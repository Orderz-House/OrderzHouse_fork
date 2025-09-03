import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Clock,
  User,
  Calendar,
  ArrowLeft,
  Tag,
  Share,
  BookOpen,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle
} from "lucide-react";

export default function NewsDetailPage() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/news/${id}`);
        setNews(res.data.news);
        
        // Fetch related news (same category)
        const allNewsRes = await axios.get("http://localhost:5000/news");
        const related = allNewsRes.data.news
          .filter(item => item.category === res.data.news.category && item.id !== res.data.news.id)
          .slice(0, 3);
        setRelatedNews(related);
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const shareOnSocialMedia = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(news.title);
    
    let shareUrl;
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute -top-2 -right-2"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mt-4">Loading Article</h2>
          <p className="text-gray-500 mt-2">We're preparing this story for you</p>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Article Not Found</h2>
          <p className="text-gray-500 mb-6">The news article you're looking for doesn't exist or may have been removed.</p>
          <Link 
            to="/news" 
            className="inline-flex items-center px-5 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with back button */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to="/news" 
            className="inline-flex items-center text-blue-500 hover:text-blue-600 font-medium transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Article Header */}
          <div className="relative">
            {news.image_url && (
              <div className="h-80 overflow-hidden">
                <img 
                  src={news.image_url} 
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            )}
            
            <div className="p-8">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {news.category && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    <Tag className="w-3 h-3 mr-1" />
                    {news.category}
                  </span>
                )}
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(news.created_at)}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  5 min read
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {news.title}
              </h1>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {news.author ? news.author.charAt(0) : 'A'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{news.author || "Admin"}</p>
                  <p className="text-sm text-gray-500">Content Creator</p>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="px-8 pb-8">
            <div className="prose max-w-none prose-lg prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-xl prose-a:text-blue-500 prose-strong:text-gray-900 prose-ol:text-gray-700 prose-ul:text-gray-700">
              <p className="lead text-xl text-gray-600 font-medium mb-8">
                {news.content.substring(0, 200)}...
              </p>
              
              {news.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-6">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Share Buttons */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this article</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => shareOnSocialMedia('facebook')}
                  className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => shareOnSocialMedia('twitter')}
                  className="w-12 h-12 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors duration-300"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => shareOnSocialMedia('linkedin')}
                  className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-300"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedNews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedNews.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                >
                  {item.image_url && (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {item.content.substring(0, 80)}...
                    </p>
                    <div className="flex items-center mt-4 text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}


      </div>
    </div>
  );
}