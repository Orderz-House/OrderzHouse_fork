import { useState } from "react";
import {
  Phone,
  Mail,
  MessageCircle,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  Dribbble,
  ArrowUp,
  MapPin,
  Clock,
  Users,
  Award,
  Instagram,
} from "lucide-react";
import { Link } from "react-router";

export default function EnhancedFooter() {
  const [hoveredSocial, setHoveredSocial] = useState(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const contactInfo = [
    {
      icon: Phone,
      label: "Call Us",
      value: "00971543210343",
      link: "tel:00971543210343",
      color: "text-green-400",
    },
    {
      icon: Mail,
      label: "Email Us",
      value: "info@orderzhouse.com",
      link: "mailto:info@orderzhouse.com",
      color: "text-blue-400",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "00971543210343",
      link: "https://wa.me/00971543210343",
      color: "text-green-500",
    },
  ];

  const socialLinks = [
    {
      icon: Facebook,
      name: "Facebook",
      color: "hover:text-blue-500",
      bgColor: "hover:bg-blue-500/10",
      link: "https://www.facebook.com/battechno/",
    },
    {
      icon: Linkedin,
      name: "LinkedIn",
      color: "hover:text-blue-600",
      bgColor: "hover:bg-blue-600/10",
      link: "https://www.linkedin.com/in/bat-techno-b19197229/",
    },
    {
      icon: Instagram,
      name: "Instagram",
      color: "hover:text-red-500",
      bgColor: "hover:bg-red-500/10",
      link: "https://www.instagram.com/bat_techno/ ",
    },
  ];

  const quickLinks = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Projects", path: "/projects/Available" },
    { label: "News", path: "/news" },
    { label: "Contact", path: "/contact" },
  ];

  const services = [
    "Web Development",
    "Mobile Apps",
    "Digital Marketing",
    "E-commerce",
    "UI/UX Design",
    "Cloud Solutions",
  ];

  const stats = [
    { icon: Users, value: "500+", label: "Happy Clients" },
    { icon: Award, value: "200+", label: "Projects Completed" },
    { icon: MapPin, value: "15+", label: "Countries Served" },
    { icon: Clock, value: "24/7", label: "Support Available" },
  ];

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(14,165,233,0.1),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_70%)]"></div>
      </div>

      <div className="relative z-10">
        {/* Stats Section */}
        <div className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-4">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <div className="w-6 h-6 bg-white rounded-sm opacity-90"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                  ORDERZ HOUSE
                </span>
              </div>

              <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                At ORDERZHOUSE, we redefine freelancing by connecting
                visionaries with exceptional talent. Where creativity meets
                reliability to build a distinguished future.
              </p>

              {/* App Store Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <a href="#" className="group">
                  <div className="flex items-center bg-gray-800 hover:bg-gray-700 rounded-2xl px-6 py-3 border border-gray-700 hover:border-gray-600 transition-all duration-300 group-hover:scale-105">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                      <span className="text-black font-bold text-sm">🍎</span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">
                        Available on the
                      </div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </div>
                </a>

                <a href="#" className="group">
                  <div className="flex items-center bg-gray-800 hover:bg-gray-700 rounded-2xl px-6 py-3 border border-gray-700 hover:border-gray-600 transition-all duration-300 group-hover:scale-105">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">▶</span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Get it on</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold text-white mb-6">Quick Links</h3>
              <ul className="space-y-4">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-teal-400 transition-colors duration-200 flex items-center group"
                    >
                      <span className="w-2 h-2 bg-teal-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-3"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Services */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold text-white mb-6">Services</h3>
              <ul className="space-y-4">
                {services.map((service, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-teal-400 transition-colors duration-200 flex items-center group"
                    >
                      <span className="w-2 h-2 bg-teal-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-3"></span>
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-4">
              <h3 className="text-xl font-bold text-white mb-6">
                Feel Free To Share Your Question
              </h3>
              <div className="space-y-6">
                {contactInfo.map((contact, index) => (
                  <a
                    key={index}
                    href={contact.link}
                    className="flex items-center space-x-4 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 group hover:scale-[1.02]"
                  >
                    <div
                      className={`p-3 bg-gray-700 group-hover:bg-gradient-to-br group-hover:from-teal-400 group-hover:to-blue-500 rounded-xl transition-all duration-300`}
                    >
                      <contact.icon
                        className={`w-5 h-5 ${contact.color} group-hover:text-white transition-colors duration-300`}
                      />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 group-hover:text-gray-300">
                        {contact.label}
                      </div>
                      <div className="font-medium text-white group-hover:text-teal-300 transition-colors duration-300">
                        {contact.value}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Social Links */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Follow Us
                </h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.link || "#"}
                      onMouseEnter={() => setHoveredSocial(index)}
                      onMouseLeave={() => setHoveredSocial(null)}
                      className={`p-3 bg-gray-800 hover:bg-gray-700 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 ${social.color} ${social.bgColor} group hover:scale-110`}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6">
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200"
                >
                  Privacy Policy
                </Link>

                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200"
                >
                  Terms of Service
                </Link>

                <button
                  onClick={scrollToTop}
                  className="p-2 bg-gradient-to-br from-teal-400 to-blue-500 text-white rounded-xl hover:shadow-lg hover:scale-110 transition-all duration-300 group"
                >
                  <ArrowUp className="w-4 h-4 group-hover:animate-bounce" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
