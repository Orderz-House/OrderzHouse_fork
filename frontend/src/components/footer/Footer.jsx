import { Phone, Mail, MessageCircle, MapPin, ArrowUp } from "lucide-react";
import { Link } from "react-router";

export default function CleanFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-[1600px] mx-auto px-0 py-12">
        <div className="flex justify-between items-start">
          {/* Left Side - Contact Info */}
          <div className="space-y-4 text-left flex-1 pl-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Get In Touch
            </h3>

            <a
              href="tel:+962791433341"
              className="flex items-center justify-start space-x-3 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">+962 791433341</span>
            </a>

            <a
              href="mailto:info@orderzhouse.com"
              className="flex items-center justify-start space-x-3 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">info@orderzhouse.com</span>
            </a>

            <a
              href="https://wa.me/962791433341"
              className="flex items-center justify-start space-x-3 text-gray-600 hover:text-green-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">WhatsApp</span>
            </a>

            {/* Location */}
            <div className="flex items-center justify-start space-x-3 text-gray-600">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm max-w-xs text-left">
                Jordan - Amman, Al-Madinah Al-Monawara Street, Al-Bassem (2) Complex, 4th Floor, Office 405
              </span>
            </div>
          </div>

          {/* Right Side - Working Hours */}
          <div className="text-right flex-1 pr-0">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              Working Hours
            </h4>
            <p className="text-sm text-gray-600">Saturday - Thursday</p>
            <p className="text-sm text-gray-600">9:00 AM - 6:00 PM</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 px-0">
          <div className="flex items-center space-x-6">
            <Link
              to="/privacy"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Terms of Service
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-xs text-gray-400">
              © 2025 - All rights reserved to orderzhouse.com
            </div>

            {/* Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-all duration-200 hover:scale-105"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
