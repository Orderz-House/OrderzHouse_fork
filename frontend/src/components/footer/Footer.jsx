import { Phone, Mail, MessageCircle, MapPin, ArrowUp } from "lucide-react";
import { Link } from "react-router";

export default function CleanFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row lg:justify-center lg:items-start gap-8 lg:gap-16">
          {/* Left Side - Contact Info (moved right) */}
          <div className="space-y-4 text-left flex-1 lg:pl-12">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Get In Touch
            </h3>

            <a
              href="tel:+962791433341"
              className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">+962 791433341</span>
            </a>

            <a
              href="mailto:info@orderzhouse.com"
              className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm break-all sm:break-normal">info@orderzhouse.com</span>
            </a>

            <a
              href="https://wa.me/962791433341"
              className="flex items-center space-x-3 text-gray-600 hover:text-green-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">WhatsApp</span>
            </a>

            {/* Location */}
            <div className="flex items-start space-x-3 text-gray-600">
              <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm leading-relaxed">
                Jordan - Amman, Al-Madinah Al-Monawara Street, Al-Bassem (2) Complex, 4th Floor, Office 405
              </span>
            </div>
          </div>

          {/* Right Side - Working Hours (moved left) */}
          <div className="text-left lg:text-left flex-1 lg:max-w-xs lg:pr-12">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">
              Working Hours
            </h4>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Saturday - Thursday</p>
              <p className="text-sm text-gray-600">9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-8 sm:mt-12 pt-6 border-t border-gray-200 gap-4 sm:gap-0">
          {/* Links */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 order-2 sm:order-1">
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

          {/* Copyright and Scroll Button */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 order-1 sm:order-2">
            <div className="text-xs text-gray-400 text-center sm:text-right">
              © 2025 - All rights reserved to orderzhouse.com
            </div>

            {/* Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              className="self-center sm:self-auto inline-flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-all duration-200 hover:scale-105"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}