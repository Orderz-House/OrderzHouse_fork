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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#F0F3BD]/20 flex items-center justify-center" style={{ fontFamily: "'Merriweather', serif" }}>
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#05668D] to-[#028090] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-[#028090] border-t-transparent rounded-full animate-spin absolute -top-2 -right-2"></div>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-[#05668D] mt-4">Loading Article</h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">We're preparing this story for you</p>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#F0F3BD]/20 flex items-center justify-center" style={{ fontFamily: "'Merriweather', serif" }}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#05668D] mb-4">Article Not Found</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">The news article you're looking for doesn't exist or may have been removed.</p>
          <Link 
            to="/news" 
            className="inline-flex items-center px-4 sm:px-5 py-2 sm:py-3 bg-[#028090] text-white rounded-full hover:bg-[#05668D] transition-colors duration-300 text-sm sm:text-base"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#F0F3BD]/20" style={{ fontFamily: "'Merriweather', serif" }}>
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back to News Button */}
        <div className="mb-6 sm:mb-8">
          <Link 
            to="/news" 
            className="inline-flex items-center text-[#028090] hover:text-[#05668D] font-medium transition-colors duration-300 text-sm sm:text-base group"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to News
          </Link>
        </div>

        <article className="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden border border-[#F0F3BD]/30">
          {/* Article Header */}
          <div className="relative">
            {news.image_url && (
              <div className="h-72 sm:h-80 md:h-96 lg:h-[28rem] overflow-hidden">
                <img 
                  src={news.image_url} 
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            )}
            
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                {news.category && (
                  <span className="inline-flex items-center px-3 py-1 bg-[#028090] text-white text-xs sm:text-sm font-medium rounded-full">
                    <Tag className="w-3 h-3 mr-1" />
                    {news.category}
                  </span>
                )}
                <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {formatDate(news.created_at)}
                </div>
                <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  5 min read
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#05668D] mb-6 sm:mb-8 leading-tight">
                {news.title}
              </h1>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#028090] to-[#02C39A] rounded-full flex items-center justify-center text-white font-semibold text-base sm:text-lg">
                  {news.author ? news.author.charAt(0) : 'A'}
                </div>
                <div>
                  <p className="font-medium text-[#05668D] text-base sm:text-lg">{news.author || "Admin"}</p>
                  <p className="text-sm sm:text-base text-gray-500">Content Creator</p>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="px-6 sm:px-8 lg:px-10 pb-8 sm:pb-10 lg:pb-12">
            <div className="prose prose-base sm:prose-lg lg:prose-xl max-w-none prose-headings:font-bold prose-headings:text-[#05668D] prose-p:text-gray-700 prose-blockquote:border-[#028090] prose-blockquote:bg-[#F0F3BD]/20 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-xl prose-a:text-[#028090] prose-strong:text-[#05668D] prose-ol:text-gray-700 prose-ul:text-gray-700">
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 font-medium mb-8 sm:mb-10 leading-relaxed">
                {news.content.substring(0, 200)}...
              </p>
              
              {news.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-6 sm:mb-8 text-base sm:text-lg lg:text-xl leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Share Buttons */}
            <div className="mt-10 sm:mt-12 lg:mt-16 pt-8 sm:pt-10 border-t border-[#F0F3BD]/50">
              <h3 className="text-lg sm:text-xl font-semibold text-[#05668D] mb-6">Share this article</h3>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => shareOnSocialMedia('facebook')}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-[#028090] text-white rounded-full flex items-center justify-center hover:bg-[#05668D] transition-colors duration-300"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button 
                  onClick={() => shareOnSocialMedia('twitter')}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-[#00A896] text-white rounded-full flex items-center justify-center hover:bg-[#028090] transition-colors duration-300"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button 
                  onClick={() => shareOnSocialMedia('linkedin')}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-[#02C39A] text-white rounded-full flex items-center justify-center hover:bg-[#00A896] transition-colors duration-300"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedNews.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#05668D] mb-8 sm:mb-10">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {relatedNews.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group border border-[#F0F3BD]/20 hover:border-[#02C39A]/30"
                >
                  {item.image_url && (
                    <div className="h-32 sm:h-40 overflow-hidden">
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4 sm:p-5">
                    <h3 className="font-semibold text-[#05668D] mb-2 group-hover:text-[#028090] transition-colors duration-300 line-clamp-2 text-sm sm:text-base">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 sm:mb-4">
                      {item.content.substring(0, 80)}...
                    </p>
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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