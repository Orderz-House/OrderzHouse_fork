import { useEffect, useState } from "react";
import {
  ChevronRight,
  Play,
  Download,
  CheckCircle,
  Star,
  Users,
  Award,
  Shield,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPlans } from "../../slice/planSlice";
import LogoLogic from "../logoLoop/LogoLogic";
import Ballpit from "../heroSection/HeroSection";

export default function OrderzHousePage() {
  const [activePlan, setActivePlan] = useState("basic");
  const [categories, setCategories] = useState([]);
  const [isVerified, setIsVerified] = useState(true);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showAll, setShowAll] = useState(false);
   const initialCategoriesCount = 3;
  const displayedCategories = showAll ? categories : categories.slice(0, initialCategoriesCount);
  const { plans, token, roleId } = useSelector((state) => {
    return {
      plans: state.plan.plans,
      token: state.auth.token,
      roleId: state.auth.roleId,
    };
  });
  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    axios
      .get(`${API_BASE}/projects/public/categories`)
      .then((res) => {
        setCategories(res.data.categories || []);
        console.log(res.data.categories);
        
      })
      .catch((e) => console.error(e.message));
  }, []);
  useEffect(() => {
    axios
      .get("http://localhost:5000/plans")
      .then((response) => {
        dispatch(setPlans(response.data.plans));
      })
      .catch((error) => {
        console.error("Error fetching plans:", error.message);
      });
  }, [dispatch]);

  // Check freelancer verification status
  useEffect(() => {
    if (token) {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      };

      axios
        .get("http://localhost:5000/verification/status", config)
        .then((response) => {
          // Only set false if NOT approved
          if (response.data.status === "approved") {
            setIsVerified(true);
            console.log(response.data.status);
          } else {
            setIsVerified(false);
          }
        })
        .catch((error) => {
          console.error("Verification check failed:", error);
          setIsVerified(false);
        });
    } else {
      setIsVerified(true);
    }
  }, [token]);

  // const categories = [
  //   {
  //     title: "Programming",
  //     description: "Software Developer, Data Analyst, Network Engineer",
  //     icon: "💻",
  //   },
  //   {
  //     title: "Photographer",
  //     description:
  //       "Photography is the art of capturing moments, emotions, and stories through the lens to create lasting visual impressions.",
  //     icon: "📷",
  //   },
  //   {
  //     title: "Admin + Project Management",
  //     description:
  //       "Administrative Assistant, Project Manager, and Process Analyst",
  //     icon: "📊",
  //   },
  //   {
  //     title: "Music & Audio",
  //     description: "Sound Engineer, Music Producer, Audio Editor",
  //     icon: "🎵",
  //   },
  //   {
  //     title: "Graphic Design",
  //     description:
  //       "Graphic design is the art of visual communication that combines images, typography, and creativity to deliver impactful messages.",
  //     icon: "🎨",
  //   },
  //   {
  //     title: "Remote Work",
  //     description: "Customer Service Representative, Financial Analyst",
  //     icon: "🏠",
  //   },
  //   {
  //     title: "Content Creator",
  //     description:
  //       "A content writer creates clear, engaging, and informative text tailored to attract and inform a specific audience.",
  //     icon: "✏️",
  //   },
  // ];
  const handleExploreTalent = () => {
    if (!token) {
      navigate("/login", {
        state: { message: "Please login to explore our talent pool" },
      });
    } else {
      navigate("/freelancers");
    }
  };
  const topFreelancers = [
    {
      name: "MAEN NJAR",
      rating: "0.0 (0 review)",
      views: "3 views",
      category: "Graphic Design",
      image: "👤",
    },
    {
      name: "dania albrawie",
      rating: "0.0 (0 review)",
      views: "12 views",
      rate: "$6.00 /hr",
      location: "Jordan",
      category: "App Design",
      image: "👤",
    },
    {
      name: "RASHED ALFOQHA",
      rating: "0.0 (0 review)",
      views: "2 views",
      category: "Photographer",
      image: "👤",
    },
    {
      name: "Yousef Abuagel",
      rating: "0.0 (0 review)",
      views: "6 views",
      category: "Web development",
      image: "👤",
    },
  ];

  const faqs = [
    {
      question: "How do I get started as a freelancer?",
      answer:
        "Sign up, complete your profile, and start browsing projects. Submit proposals and communicate with clients to get hired.",
    },
    {
      question: "What kind of projects can I find?",
      answer:
        "You can find a wide range of projects across various categories including programming, design, writing, marketing, and more.",
    },
    {
      question: "How do I ensure payment security?",
      answer:
        "We use secure payment gateways and escrow systems to ensure that payments are protected for both clients and freelancers.",
    },
    {
      question: "What fees are involved for freelancers?",
      answer:
        "We charge a small service fee on completed projects, which helps us maintain and improve our platform.",
    },
    {
      question: "How can I build trust with clients?",
      answer:
        "Complete your profile, showcase your portfolio, gather positive reviews, and communicate clearly to build trust with clients.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {!isVerified && token && roleId === 3 && (
        <div
          className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Warning: </strong>
          <span className="block sm:inline">
            You must verify your account and complete your portfolio before
            using this feature.
          </span>
          <Link
            to="/verify-profile"
            className="ml-4 underline hover:no-underline font-semibold"
          >
            Go to Verification
          </Link>
        </div>
      )}
      {/* Hero Section */}
      {/* <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600/5 to-purple-600/5">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Unlock the Potential of Your Team with
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
              Exceptional Talent
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Flourish in a thriving freelance ecosystem dedicated to excellence
            and limitless opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleExploreTalent}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              Explore the talent pool
            </button>
            {token ? (
              <Link to="/create-project">
                <button className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-300">
                  Post a New Project
                </button>
              </Link>
            ) : (
              <button
                onClick={() =>
                  navigate("/login", {
                    state: { message: "Please login to post a project" },
                  })
                }
                className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-300"
              >
                Post a New Project
              </button>
            )}
          </div>
        </div>
      </section> */}
      {/* Hero Section V2 */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "500px",
          maxHeight: "500px",
          width: "100%",
        }}
      >
        {/* Overlayed Text and Buttons */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none", // allows Ballpit interaction if needed
          }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 pointer-events-auto">
            Unlock the Potential of Your Team with
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
              Exceptional Talent
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 pointer-events-auto">
            Flourish in a thriving freelance ecosystem dedicated to excellence
            and limitless opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
            <button
              onClick={handleExploreTalent}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              Explore the talent pool
            </button>
            {token ? (
              <Link to="/create-project">
                <button className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-300">
                  Post a New Project
                </button>
              </Link>
            ) : (
              <button
                onClick={() =>
                  navigate("/login", {
                    state: { message: "Please login to post a project" },
                  })
                }
                className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-300"
              >
                Post a New Project
              </button>
            )}
          </div>
        </div>
        {/* Ballpit Animation */}
        <Ballpit
          count={90}
          gravity={0.9}
          friction={1}
          wallBounce={0.95}
          followCursor={false}
        />
      </div>
      {/* Logo loop Section */}
      <div
        style={{
          padding: "60px",
          background: "linear-gradient(135deg, #ffffffff, #ffffffff)",

          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "transform 0.3s, box-shadow 0.3s",
        }}
      >
        <LogoLogic style={{}} />
      </div>



    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Browse Our Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our diverse range of professional categories to find the perfect services for your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCategories.map((category) => (
            <div
              key={category.id}
              className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 relative overflow-hidden"
            >
              {/* Gradient accent bar */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              
              {/* Category header with initial letter */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                  <span className="text-xl font-bold text-blue-700 group-hover:text-white transition-colors duration-300">
                    {category.name.charAt(0)}
                  </span>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                {category.name}
              </h3>
              
              <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                {category.description}
              </p>
            </div>
          ))}
        </div>

        {/* View All Categories toggle button */}
        {categories.length > initialCategoriesCount && (
          <div className="text-center mt-12">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center mx-auto"
            >
              {showAll ? 'Show Less Categories' : 'View All Categories'}
              <svg 
                className={`ml-2 h-5 w-5 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Stats section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 mb-12">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">{categories.length}+</div>
            <div className="text-gray-600">Categories</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
            <div className="text-gray-600">Services</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-600">Support</div>
          </div>
        </div>

        {/* Call to action */}
        
      </div>
    </section>

      {/* Freelancer, Employer, Community */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">👨‍💻</div>
              <h3 className="text-2xl font-bold mb-4">Freelancer</h3>
              <p className="text-gray-600">
                Apply for positions as a freelancer and take control of your
                career
              </p>
              {!token && (
                <button
                  onClick={() =>
                    navigate("/register", { state: { role: "freelancer" } })
                  }
                  className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Join as Freelancer
                </button>
              )}
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">👔</div>
              <h3 className="text-2xl font-bold mb-4">Employer</h3>
              <p className="text-gray-600">
                Hire key staff as an employer and build your dream team
              </p>
              {!token && (
                <button
                  onClick={() =>
                    navigate("/register", { state: { role: "employer" } })
                  }
                  className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  Join as Employer
                </button>
              )}
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-2xl font-bold mb-4">Community</h3>
              <p className="text-gray-600">
                Collaborate as a community and achieve more together
              </p>
              {!token && (
                <button
                  onClick={() => navigate("/register")}
                  className="mt-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  Join Community
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Plans */}
<section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50/30">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Choose Your Perfect Plan
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Unlock your potential with our flexible plans designed to help you succeed 
        in your freelancing journey.
      </p>
    </div>

    {/* Toggle for annual/monthly billing */}
    <div className="flex justify-center items-center mb-10">
      <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200 inline-flex">
        <button
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            billingCycle === 'monthly' 
              ? 'bg-blue-600 text-white shadow' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setBillingCycle('monthly')}
        >
          Monthly
        </button>
        <button
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            billingCycle === 'annual' 
              ? 'bg-blue-600 text-white shadow' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setBillingCycle('annual')}
        >
          Annual <span className="text-green-500 ml-1">(-20%)</span>
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
      {plans.map((plan) => {
        const displayPrice = billingCycle === 'annual' 
          ? parseFloat(plan.price) * 12 * 0.8 
          : parseFloat(plan.price);
        
        const isPopular = plan.isPopular;
        
        return (
          <div
            key={plan.id}
            className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isPopular
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-2xl transform -translate-y-2'
                : 'bg-white border border-gray-200 shadow-lg'
            }`}
          >
            {/* Popular badge */}
            {isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-blue-900 text-xs font-bold px-4 py-2 rounded-full shadow-md">
                  MOST POPULAR
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className={`text-2xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <p className={`text-lg ${isPopular ? 'text-blue-100' : 'text-gray-600'}`}>
                {plan.description}
              </p>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center">
                <span className={`text-4xl font-bold ${isPopular ? 'text-white' : 'text-blue-600'}`}>
                  ${displayPrice.toFixed(2)}
                </span>
                <span className={`ml-1 ${isPopular ? 'text-blue-100' : 'text-gray-600'}`}>
                  /{billingCycle === 'annual' ? 'year' : 'month'}
                </span>
              </div>
              {billingCycle === 'annual' && (
                <p className="text-sm text-green-400 mt-1">
                  Save ${(parseFloat(plan.price) * 12 * 0.2).toFixed(2)} annually
                </p>
              )}
              <p className={`text-sm mt-2 ${isPopular ? 'text-blue-100' : 'text-gray-600'}`}>
                Duration: {plan.duration} Days
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features?.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle 
                    className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
                      isPopular ? 'text-blue-200' : 'text-green-500'
                    }`} 
                  />
                  <span className={isPopular ? 'text-blue-50' : 'text-gray-700'}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleGetStarted(plan.id)}
              className={`w-full py-4 font-bold rounded-xl transition-all duration-300 ${
                isPopular
                  ? 'bg-white text-blue-600 hover:bg-gray-100 hover:shadow-lg'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
              }`}
            >
              {token ? "Get Started" : "Sign Up Now"}
            </button>

            {/* Additional info for popular plan */}
            {isPopular && (
              <p className="text-center text-blue-100 text-sm mt-4">
                Join 2,500+ freelancers using this plan
              </p>
            )}
          </div>
        );
      })}
    </div>

    {/* FAQ section */}
    <div className="mt-16 text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="text-left bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-2">Can I switch plans later?</h4>
          <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Your billing will be prorated accordingly.</p>
        </div>
        <div className="text-left bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
          <p className="text-gray-600">We offer a 7-day free trial for all new users to explore our platform before committing to a paid plan.</p>
        </div>
      </div>
    </div>
  </div>
</section>
      {/* Learning Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Grow Your Skills, Expand Your Opportunities
          </h2>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Want to level up your expertise or learn a new in-demand skill?
          </p>
          <p className="mb-10">
            Join our dedicated learning platform, designed to help you master
            the skills that matter in today's freelance market — one step at a
            time.
          </p>
          <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center mx-auto">
            <Link
              to="https://studyzhouse.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Get Started</span>
            </Link>
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </section>
      {/* Mobile App Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Double Your Experience
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                OrderzHouse is a next-generation freelance platform designed to
                bridge the gap between professional clients and talented
                freelancers. It allows you to create projects, find a wide range
                of expertise, manage tasks with flexibility, and communicate
                securely and efficiently.
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex items-start">
                  <Shield className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h4 className="font-bold">
                      Full protection of your data and financial transactions
                      within the platform.
                    </h4>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h4 className="font-bold">
                      Built-in messaging system for fast and seamless
                      communication.
                    </h4>
                  </div>
                </div>
                <div className="flex items-start">
                  <Award className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h4 className="font-bold">
                      Smart dashboard for managing projects and proposals
                      effortlessly.
                    </h4>
                  </div>
                </div>
              </div>

              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center">
                <Download className="w-5 h-5 mr-2" />
                <span>Download Now</span>
              </button>
            </div>

            <div className="flex justify-center">
              <div className="relative w-80 h-96 bg-gray-800 rounded-3xl p-4 shadow-2xl">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-6 bg-gray-900 rounded-full"></div>
                <div className="h-full bg-gray-700 rounded-2xl flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-4xl mb-4">📱</div>
                    <p className="text-lg font-bold">OrderzHouse App</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Top Freelancers */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Top Freelancers
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Within the top 1%, discover elite talent meticulously vetted to
            uphold the highest standards, ensuring excellence and unparalleled
            expertise.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topFreelancers.map((freelancer, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl mr-4">
                    {freelancer.image}
                  </div>
                  <div>
                    <h3 className="font-bold">{freelancer.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span>{freelancer.rating}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {freelancer.views}
                    </div>
                  </div>
                </div>

                {freelancer.rate && (
                  <div className="mb-3">
                    <span className="font-bold text-green-600">
                      {freelancer.rate}
                    </span>
                  </div>
                )}

                {freelancer.location && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">
                      {freelancer.location}
                    </span>
                  </div>
                )}

                <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full inline-block">
                  {freelancer.category}
                </div>

                <button
                  onClick={() => handleViewProfile(index + 1)}
                  className="w-full mt-6 py-2 bg-gray-100 text-gray-800 font-medium rounded-xl hover:bg-gray-200 transition-colors duration-300"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Frequently asked questions
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Find answers to your questions instantly. Need more guidance? Dive
            into our extensive documentation for all your queries.
          </p>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              >
                <h3 className="font-bold text-lg mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
              <Link to="/ask-more">Ask More</Link>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
