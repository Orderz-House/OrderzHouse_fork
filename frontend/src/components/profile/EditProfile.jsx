import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Settings, Briefcase, FileText, CreditCard, UserCog } from "lucide-react";

// Import all the child components that this page will manage
import ProfileSettings from "./ProfileSettings"; // The main form for name, bio, etc.
import EditPortfolio from "./EditPortfolio";
import Identity from "./Identity";
import Billing from "./Billing";
import AccountSettings from "./AccountSettings"; // The new page for password & deactivation

const EditProfile = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [activeSection, setActiveSection] = useState("profile");

  // Redirect to login if the user is not authenticated
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Navigation items for the sidebar
  const navigationItems = [
    { id: "profile", label: "Profile Settings", icon: Settings },
    { id: "portfolio", label: "Manage Portfolio", icon: Briefcase },
    { id: "identity", label: "Identity Verification", icon: FileText },
    { id: "billing", label: "Billing Information", icon: CreditCard },
    { id: "account", label: "Account & Security", icon: UserCog },
  ];

  // Function to render the correct component based on the active section
  const renderActiveSection = () => {
    switch (activeSection) {
      case "portfolio":
        return <EditPortfolio />;
      case "identity":
        return <Identity />;
      case "billing":
        return <Billing />;
      case "account":
        return <AccountSettings />;
      case "profile":
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* --- Navigation Sidebar --- */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${activeSection === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* --- Main Content Area --- */}
          <div className="lg:col-span-4">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
