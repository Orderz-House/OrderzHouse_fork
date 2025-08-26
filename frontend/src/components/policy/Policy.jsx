import { useState } from "react";
import {
  Shield,
  User,
  MessageSquare,
  Image,
  Cookie,
  Globe,
  Database,
  Clock,
  Eye,
  Share2,
  Download,
  Trash2,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Info,
  AlertCircle,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const sections = [
    {
      id: "who-we-are",
      title: "Who We Are",
      icon: User,
      color: "from-blue-500 to-cyan-500",
      content: {
        summary: "Learn about our company and website information",
        details:
          "Our website address is: https://ti8ah.com. We are committed to protecting your privacy and ensuring transparency in how we handle your personal information.",
      },
    },
    {
      id: "comments",
      title: "Comments & Interactions",
      icon: MessageSquare,
      color: "from-green-500 to-emerald-500",
      content: {
        summary: "How we handle comments and user interactions",
        details:
          "When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor's IP address and browser user agent string to help spam detection. An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. After approval of your comment, your profile picture is visible to the public in the context of your comment.",
        additionalInfo:
          "This helps us maintain a safe and spam-free environment for all users.",
      },
    },
    {
      id: "media",
      title: "Media & Uploads",
      icon: Image,
      color: "from-purple-500 to-pink-500",
      content: {
        summary: "Guidelines for image and media uploads",
        details:
          "If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website.",
        warning:
          "For your privacy, please remove location data from images before uploading.",
      },
    },
    {
      id: "cookies",
      title: "Cookies Policy",
      icon: Cookie,
      color: "from-orange-500 to-red-500",
      content: {
        summary: "How we use cookies to improve your experience",
        details: `We use several types of cookies:
        • Comment cookies: Save your name, email, and website for convenience (1 year)
        • Login cookies: Remember your login status (2 days to 2 weeks)
        • Preference cookies: Remember your display choices (1 year)
        • Temporary cookies: Check browser compatibility (session only)`,
        additionalInfo:
          "All cookies are designed to enhance your user experience and can be managed through your browser settings.",
      },
    },
    {
      id: "embedded-content",
      title: "Embedded Content",
      icon: Globe,
      color: "from-teal-500 to-blue-500",
      content: {
        summary: "Third-party content and external websites",
        details:
          "Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website. These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content.",
        warning: "External content is subject to third-party privacy policies.",
      },
    },
    {
      id: "data-sharing",
      title: "Data Sharing",
      icon: Share2,
      color: "from-indigo-500 to-purple-500",
      content: {
        summary: "When and how we share your information",
        details:
          "If you request a password reset, your IP address will be included in the reset email for security purposes. We do not sell or share your personal data with third parties for marketing purposes.",
        additionalInfo:
          "Your data is only shared when necessary for functionality or security.",
      },
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: Clock,
      color: "from-cyan-500 to-teal-500",
      content: {
        summary: "How long we keep your information",
        details:
          "If you leave a comment, the comment and its metadata are retained indefinitely. This is so we can recognize and approve any follow-up comments automatically instead of holding them in a moderation queue. For users that register on our website, we store the personal information they provide in their user profile.",
        additionalInfo: "You can request deletion of your data at any time.",
      },
    },
    {
      id: "your-rights",
      title: "Your Rights",
      icon: Eye,
      color: "from-pink-500 to-rose-500",
      content: {
        summary: "Your rights regarding your personal data",
        details:
          "If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you.",
        rights: [
          "Request a copy of your data",
          "Request data correction",
          "Request data deletion",
          "Withdraw consent",
          "Data portability",
        ],
      },
    },
    {
      id: "data-transfer",
      title: "Where Your Data Goes",
      icon: Database,
      color: "from-emerald-500 to-green-500",
      content: {
        summary: "How your data is processed and transferred",
        details:
          "Visitor comments may be checked through an automated spam detection service. Your data is stored securely and processed in accordance with applicable data protection laws.",
        additionalInfo:
          "We use industry-standard security measures to protect your information.",
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(14,165,233,0.1),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_70%)]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-400 to-blue-500 rounded-3xl mb-8 shadow-2xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                Privacy Policy
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your privacy is important to us. This policy explains how we
              collect, use, and protect your personal information when you use
              our services.
            </p>
            <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                GDPR Compliant
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                Last Updated: January 2025
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Quick Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-8 mb-12 border border-blue-100">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Info className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Quick Summary
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-2">What we collect:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Comment information and IP addresses</li>
                    <li>• Account details for registered users</li>
                    <li>• Cookies for functionality</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Your rights:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Access your data anytime</li>
                    <li>• Request data deletion</li>
                    <li>• Export your information</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div
                className="p-8 cursor-pointer"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div
                      className={`p-4 bg-gradient-to-br ${section.color} rounded-2xl shadow-lg`}
                    >
                      <section.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {section.title}
                      </h3>
                      <p className="text-gray-600">{section.content.summary}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {expandedSections[section.id] ? (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedSections[section.id] && (
                  <div className="mt-8 pl-20 space-y-6">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {section.content.details}
                      </p>
                    </div>

                    {section.content.rights && (
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Your Rights Include:
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          {section.content.rights.map((right, idx) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-3"
                            >
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">{right}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {section.content.warning && (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-amber-800 mb-2">
                              Important Note
                            </h4>
                            <p className="text-amber-700">
                              {section.content.warning}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {section.content.additionalInfo && (
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                        <div className="flex items-start space-x-3">
                          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-blue-700">
                            {section.content.additionalInfo}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">
            Questions About Your Privacy?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            If you have any questions about this Privacy Policy or how we handle
            your data, we're here to help. Contact us anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@orderzhouse.com"
              className="px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold rounded-2xl hover:from-teal-600 hover:to-blue-600 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Email Us
            </a>
            <button className="px-8 py-4 border-2 border-gray-600 text-white font-semibold rounded-2xl hover:border-gray-500 hover:bg-gray-800 transition-all duration-300">
              Download Policy (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
