import { Phone, Mail, MessageCircle, MapPin, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function CleanFooter() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const { userData } = useSelector((s) => s.auth);
  const roleId = userData?.role_id;
  const isAdmin = roleId === 1;
  const isClient = roleId === 2;
  const isFreelancer = roleId === 3;

  const showClientsBlock = isAdmin || isClient || !roleId;
  const showFreelancersBlock = isAdmin || isFreelancer || !roleId;

  const exploreLinks = [
    { label: "Home", to: "/" },
    { label: "About Us", to: "/about" },
    { label: "Blogs", to: "/blogs" },
    { label: "Contact", to: "/contact" },
    { label: "Projects", to: "/projectsPage" },
    { label: "Plans", to: "/plans" },
  ];

  const clientLinks = [
    { label: "Add project", to: "/create-project" },
    { label: "Plans & Pricing", to: "/plans" },
    { label: "Contact Support", to: "/contact" },
  ];

  const freelancerLinks = [
    { label: "Add task", to: "/freelancer/tasks/new" },
    { label: "Projects", to: "/projectsPage" },
    { label: "Blogs", to: "/blogs" },
  ];

  const resourceLinks = [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "Help Center", to: "/contact" },
  ];

  const companyLinks = [
    { label: "About Us", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Blogs", to: "/blogs" },
  ];

  const Block = ({ title, items }) => (
    <section className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      <ul className="space-y-2">
        {items.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="text-sm text-gray-600 hover:text-[#028090] transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            <Block title="Explore" items={exploreLinks} />

            {showClientsBlock && <Block title="For Clients" items={clientLinks} />}

            {showFreelancersBlock && (
              <Block title="For Freelancers" items={freelancerLinks} />
            )}

            <Block title="Resources" items={resourceLinks} />
            <Block title="Company" items={companyLinks} />

            {/* Contact + Hours */}
            <section className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Get In Touch</h4>
                <div className="space-y-2">
                  <a
                    href="tel:+962791433341"
                    className="flex w-fit items-center gap-3 text-gray-600 hover:text-[#028090] transition-colors"
                  >
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">+962 791433341</span>
                  </a>
                  <a
                    href="mailto:info@orderzhouse.com"
                    className="flex w-fit items-center gap-3 text-gray-600 hover:text-[#028090] transition-colors"
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm break-all sm:break-normal">
                      info@orderzhouse.com
                    </span>
                  </a>
                  <a
                    href="https://wa.me/962791433341"
                    className="flex w-fit items-center gap-3 text-gray-600 hover:text-[#028090] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">WhatsApp</span>
                  </a>
                  <div className="flex w-fit items-start gap-3 text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Amman, Jordan</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Working Hours</h4>
                <div className="space-y-1 text-gray-600">
                  <p className="text-sm">Saturday - Thursday</p>
                  <p className="text-sm">9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-10 lg:mt-12 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
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

            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-400">
                © 2025 - All rights reserved to orderzhouse.com
              </div>
              <button
                onClick={scrollToTop}
                className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-all duration-200 hover:scale-105"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
