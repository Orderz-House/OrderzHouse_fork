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
import 'animate.css';

import tools from "../../assets/tools.png";

export default function OrderzHousePageRedesign() {
  const [activePlan, setActivePlan] = useState("basic");
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Programming",
      description: "Software Developer, Data Analyst, Network Engineer"
    },
    {
      id: 2,
      name: "Photography",
      description: "Photography is the art of capturing moments, emotions, and stories through the lens to create lasting visual impressions."
    },
    {
      id: 3,
      name: "Admin + Project Management",
      description: "Administrative Assistant, Project Manager, and Process Analyst"
    },
    {
      id: 4,
      name: "Music & Audio",
      description: "Sound Engineer, Music Producer, Audio Editor"
    },
    {
      id: 5,
      name: "Graphic Design",
      description: "Graphic design is the art of visual communication that combines images, typography, and creativity to deliver impactful messages."
    },
    {
      id: 6,
      name: "Remote Work",
      description: "Customer Service Representative, Financial Analyst"
    },
    {
      id: 7,
      name: "Content Creator",
      description: "A content writer creates clear, engaging, and informative text tailored to attract and inform a specific audience."
    }
  ]);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [showAll, setShowAll] = useState(false);
  const initialCategoriesCount = 3;
  const displayedCategories = showAll ? categories : categories.slice(0, initialCategoriesCount);

  const plans = [
    {
      id: 1,
      name: "Basic",
      description: "Perfect for getting started",
      price: "9.99",
      duration: 30,
      isPopular: false,
      features: [
        "Up to 5 project bids",
        "Basic profile visibility",
        "Standard support",
        "Basic analytics"
      ]
    },
    {
      id: 2,
      name: "Professional",
      description: "Most popular choice",
      price: "19.99",
      duration: 30,
      isPopular: true,
      features: [
        "Unlimited project bids",
        "Enhanced profile visibility",
        "Priority support",
        "Advanced analytics",
        "Featured in search results"
      ]
    },
    {
      id: 3,
      name: "Enterprise",
      description: "For serious professionals",
      price: "39.99",
      duration: 30,
      isPopular: false,
      features: [
        "Everything in Professional",
        "Dedicated account manager",
        "Custom branding",
        "White-label solutions",
        "API access"
      ]
    }
  ];

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
      answer: "Sign up, complete your profile, and start browsing projects. Submit proposals and communicate with clients to get hired.",
    },
    {
      question: "What kind of projects can I find?",
      answer: "You can find a wide range of projects across various categories including programming, design, writing, marketing, and more.",
    },
    {
      question: "How do I ensure payment security?",
      answer: "We use secure payment gateways and escrow systems to ensure that payments are protected for both clients and freelancers.",
    },
    {
      question: "What fees are involved for freelancers?",
      answer: "We charge a small service fee on completed projects, which helps us maintain and improve our platform.",
    },
    {
      question: "How can I build trust with clients?",
      answer: "Complete your profile, showcase your portfolio, gather positive reviews, and communicate clearly to build trust with clients.",
    },
  ];

  const handleExploreTalent = () => {
    console.log("Explore talent clicked");
  };

  const handleGetStarted = (planId) => {
    console.log(`Get started with plan ${planId}`);
  };

  const handleViewProfile = (freelancerId) => {
    console.log(`View profile ${freelancerId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Wave Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Wave Background */}
        <div className="absolute inset-0 overflow-hidden">
          <svg
            className="absolute bottom-0 left-0 w-full h-full"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#05668D" stopOpacity="0.1" />
                <stop offset="25%" stopColor="#028090" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#00A896" stopOpacity="0.2" />
                <stop offset="75%" stopColor="#02C39A" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#F0F3BD" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#028090" stopOpacity="0.08" />
                <stop offset="33%" stopColor="#00A896" stopOpacity="0.12" />
                <stop offset="66%" stopColor="#02C39A" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#F0F3BD" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            <path
              fill="url(#waveGradient1)"
              d="M0,160L40,176C80,192,160,224,240,224C320,224,400,192,480,165.3C560,139,640,117,720,122.7C800,128,880,160,960,170.7C1040,181,1120,171,1200,149.3C1280,128,1360,96,1400,80L1440,64L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0;50,0;0,0"
                dur="20s"
                repeatCount="indefinite"
              />
            </path>
            
            <path
              fill="url(#waveGradient2)"
              d="M0,224L40,213.3C80,203,160,181,240,186.7C320,192,400,224,480,224C560,224,640,192,720,181.3C800,171,880,181,960,192C1040,203,1120,213,1200,213.3C1280,213,1360,203,1400,197.3L1440,192L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0;-30,0;0,0"
                dur="15s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>

        {/* Professional tools Image */}
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 z-10 hidden lg:block">
  <img 
    src={tools}
    alt="Freelance tools" 
    className="w-[700px] h-auto"
  />
</div>


        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left">
          <div className="lg:w-2/3">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-gray-700">
              Orderz House
              <span className="block bg-gradient-to-r from-[#05668D] via-[#028090] to-[#00A896] bg-clip-text text-transparent mt-4">
                
              </span>
            </h1>
            
            <div className="text-2xl md:text-3xl text-[#05668D] font-medium mb-8 italic">
              Where work finds its perfect home.
            </div>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mb-12 leading-relaxed">
              Connect, create, and grow in a freelance ecosystem built for success.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-start">
              <button
                onClick={handleExploreTalent}
                className="group px-10 py-5 bg-gradient-to-r from-[#05668D] via-[#028090] to-[#00A896] text-white font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  Explore the talent pool
                  <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button className="px-10 py-5 bg-white text-[#05668D] font-bold rounded-2xl border-2 border-[#02C39A] hover:bg-[#F0F3BD] hover:border-[#00A896] transition-all duration-300 transform hover:scale-105 shadow-lg">
                Post a New Project
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Loop Section */}
      <section className="py-16 bg-gradient-to-r from-[#F0F3BD]/20 to-[#02C39A]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-semibold text-[#05668D] mb-8">Trusted by leading companies worldwide</h3>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            {['Company A', 'Company B', 'Company C', 'Company D', 'Company E'].map((company, index) => (
              <div key={index} className="text-lg font-medium text-[#028090]">{company}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section with Modern Design */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-[#02C39A]/10 to-[#F0F3BD]/20"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 rounded-full bg-gradient-to-br from-[#05668D]/10 to-[#028090]/20"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#05668D] mb-6">
              Browse Our Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our diverse range of professional categories to find the perfect services for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedCategories.map((category, index) => (
              <div
                key={category.id}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-[#02C39A]/30 relative overflow-hidden transform hover:-translate-y-2"
              >
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#05668D] via-[#028090] to-[#00A896]"></div>
                
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#02C39A]/20 to-[#F0F3BD]/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-[#05668D]">
                    {category.name.charAt(0)}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-[#05668D] mb-4 group-hover:text-[#028090] transition-colors">
                  {category.name}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {category.description}
                </p>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#02C39A]/5 to-[#F0F3BD]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          {categories.length > initialCategoriesCount && (
            <div className="text-center mt-12">
              <button 
                onClick={() => setShowAll(!showAll)}
                className="bg-gradient-to-r from-[#05668D] to-[#028090] hover:from-[#028090] hover:to-[#00A896] text-white font-medium py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto"
              >
                {showAll ? 'Show Less Categories' : 'View All Categories'}
                <ChevronRight className={`ml-2 h-5 w-5 transition-transform duration-300 ${showAll ? 'rotate-90' : ''}`} />
              </button>
            </div>
          )}

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {[
              { number: `${categories.length}+`, label: 'Categories' },
              { number: '1000+', label: 'Services' },
              { number: '98%', label: 'Satisfaction Rate' },
              { number: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-lg border border-[#F0F3BD]/30">
                <div className="text-3xl font-bold text-[#05668D] mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#F0F3BD]/10 via-white to-[#02C39A]/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "👨‍💻", title: "Freelancer", description: "Apply for positions as a freelancer and take control of your career", color: "from-[#05668D] to-[#028090]" },
              { icon: "👔", title: "Employer", description: "Hire key staff as an employer and build your dream team", color: "from-[#028090] to-[#00A896]" },
              { icon: "👥", title: "Community", description: "Collaborate as a community and achieve more together", color: "from-[#00A896] to-[#02C39A]" }
            ].map((role, index) => (
              <div key={index} className="group text-center p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-[#F0F3BD]/50">
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">{role.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-[#05668D]">{role.title}</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {role.description}
                </p>
                <button className={`px-8 py-3 bg-gradient-to-r ${role.color} text-white rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium`}>
                  Join as {role.title}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans with Modern Design */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-[#F0F3BD]/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#05668D] mb-6">
              Choose Your Perfect Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unlock your potential with our flexible plans designed to help you succeed 
              in your freelancing journey.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center items-center mb-12">
            <div className="bg-white rounded-2xl p-1 shadow-lg border border-[#F0F3BD] inline-flex">
              <button
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  billingCycle === 'monthly' 
                    ? 'bg-gradient-to-r from-[#05668D] to-[#028090] text-white shadow-lg' 
                    : 'text-gray-600 hover:text-[#05668D]'
                }`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  billingCycle === 'annual' 
                    ? 'bg-gradient-to-r from-[#05668D] to-[#028090] text-white shadow-lg' 
                    : 'text-gray-600 hover:text-[#05668D]'
                }`}
                onClick={() => setBillingCycle('annual')}
              >
                Annual <span className="text-[#02C39A] ml-1 font-bold">(-20%)</span>
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
                  className={`relative rounded-3xl p-8 transition-all duration-500 hover:scale-105 ${
                    isPopular
                      ? 'bg-gradient-to-br from-[#05668D] via-[#028090] to-[#00A896] text-white border-0 shadow-2xl transform -translate-y-4'
                      : 'bg-white border-2 border-[#F0F3BD] shadow-xl hover:border-[#02C39A]/50'
                  }`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-[#F0F3BD] to-[#02C39A] text-[#05668D] text-xs font-bold px-6 py-2 rounded-full shadow-lg">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className={`text-2xl font-bold mb-3 ${isPopular ? 'text-white' : 'text-[#05668D]'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-lg ${isPopular ? 'text-blue-100' : 'text-gray-600'}`}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center">
                      <span className={`text-4xl font-bold ${isPopular ? 'text-white' : 'text-[#05668D]'}`}>
                        ${displayPrice.toFixed(2)}
                      </span>
                      <span className={`ml-1 ${isPopular ? 'text-blue-100' : 'text-gray-600'}`}>
                        /{billingCycle === 'annual' ? 'year' : 'month'}
                      </span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className="text-sm text-[#02C39A] mt-2 font-medium">
                        Save ${(parseFloat(plan.price) * 12 * 0.2).toFixed(2)} annually
                      </p>
                    )}
                  </div>

                  <ul className="space-y-4 mb-10">
                    {plan.features?.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle 
                          className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
                            isPopular ? 'text-[#F0F3BD]' : 'text-[#02C39A]'
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
                    className={`w-full py-4 font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                      isPopular
                        ? 'bg-white text-[#05668D] hover:bg-[#F0F3BD] hover:shadow-lg'
                        : 'bg-gradient-to-r from-[#05668D] to-[#028090] text-white hover:from-[#028090] hover:to-[#00A896] hover:shadow-lg'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Learning Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#05668D] via-[#028090] to-[#00A896] text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-40 h-40 rounded-full bg-white/10"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 rounded-full bg-white/5"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-[#F0F3BD]/20"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Grow Your Skills, Expand Your Opportunities
          </h2>
          <p className="text-xl max-w-3xl mx-auto mb-8 text-blue-100">
            Want to level up your expertise or learn a new in-demand skill?
          </p>
          <p className="mb-12 text-lg text-blue-50 max-w-4xl mx-auto">
            Join our dedicated learning platform, designed to help you master
            the skills that matter in today's freelance market — one step at a
            time.
          </p>
          <button className="px-10 py-5 bg-white text-[#05668D] font-bold rounded-2xl hover:bg-[#F0F3BD] hover:shadow-2xl transition-all duration-300 flex items-center justify-center mx-auto transform hover:scale-105">
            <span>Get Started</span>
            <ChevronRight className="w-6 h-6 ml-2" />
          </button>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#F0F3BD]/10 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-[#05668D]">
                Double Your Experience
              </h2>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                OrderzHouse is a next-generation freelance platform designed to
                bridge the gap between professional clients and talented
                freelancers. It allows you to create projects, find a wide range
                of expertise, manage tasks with flexibility, and communicate
                securely and efficiently.
              </p>

              <div className="space-y-6 mb-12">
                <div className="flex items-start group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#05668D]/20 to-[#028090]/30 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-6 h-6 text-[#05668D]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#05668D] mb-2">
                      Full protection of your data and financial transactions
                    </h4>
                    <p className="text-gray-600">within the platform.</p>
                  </div>
                </div>
                
                <div className="flex items-start group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#028090]/20 to-[#00A896]/30 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-[#028090]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#05668D] mb-2">
                      Built-in messaging system for fast and seamless
                    </h4>
                    <p className="text-gray-600">communication.</p>
                  </div>
                </div>
                
                <div className="flex items-start group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00A896]/20 to-[#02C39A]/30 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-6 h-6 text-[#00A896]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#05668D] mb-2">
                      Smart dashboard for managing projects and proposals
                    </h4>
                    <p className="text-gray-600">effortlessly.</p>
                  </div>
                </div>
              </div>

              <button className="px-10 py-5 bg-gradient-to-r from-[#05668D] to-[#028090] text-white font-bold rounded-2xl hover:from-[#028090] hover:to-[#00A896] transition-all duration-300 flex items-center transform hover:scale-105 shadow-lg">
                <Download className="w-6 h-6 mr-3" />
                <span>Download Now</span>
              </button>
            </div>

            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="w-80 h-96 bg-gradient-to-br from-[#05668D] to-[#028090] rounded-3xl p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-6 bg-[#00A896] rounded-full"></div>
                  <div className="h-full bg-white rounded-2xl flex items-center justify-center relative overflow-hidden">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#02C39A] to-[#F0F3BD] flex items-center justify-center mx-auto mb-6">
                        <span className="text-2xl">📱</span>
                      </div>
                      <h3 className="text-xl font-bold text-[#05668D] mb-2">OrderzHouse App</h3>
                      <p className="text-gray-600 text-sm">Coming Soon</p>
                    </div>
                    
                    {/* App interface mockup */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#F0F3BD]/10 to-transparent"></div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[#02C39A] animate-bounce"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full bg-[#F0F3BD] animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Freelancers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-[#F0F3BD]/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#05668D] mb-6">
              Top Freelancers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Within the top 1%, discover elite talent meticulously vetted to
              uphold the highest standards, ensuring excellence and unparalleled
              expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {topFreelancers.map((freelancer, index) => (
              <div key={index} className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#F0F3BD]/50 hover:border-[#02C39A]/50 transform hover:-translate-y-2">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#02C39A]/20 to-[#F0F3BD]/40 rounded-2xl flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform duration-300">
                    {freelancer.image}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#05668D] group-hover:text-[#028090] transition-colors">{freelancer.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="w-4 h-4 text-[#F0F3BD] mr-1" />
                      <span>{freelancer.rating}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {freelancer.views}
                    </div>
                  </div>
                </div>

                {freelancer.rate && (
                  <div className="mb-4">
                    <span className="font-bold text-[#02C39A] text-lg">
                      {freelancer.rate}
                    </span>
                  </div>
                )}

                {freelancer.location && (
                  <div className="mb-6">
                    <span className="text-sm text-gray-500">
                      📍 {freelancer.location}
                    </span>
                  </div>
                )}

                <div className="bg-gradient-to-r from-[#02C39A]/20 to-[#F0F3BD]/30 text-[#05668D] text-sm font-medium px-4 py-2 rounded-full inline-block mb-6">
                  {freelancer.category}
                </div>

                <button
                  onClick={() => handleViewProfile(index + 1)}
                  className="w-full py-3 bg-gradient-to-r from-[#05668D] to-[#028090] text-white font-medium rounded-2xl hover:from-[#028090] hover:to-[#00A896] transition-all duration-300 transform hover:scale-105"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F0F3BD]/5 to-[#02C39A]/5"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#05668D] mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to your questions instantly. Need more guidance? Dive
              into our extensive documentation for all your queries.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-lg border-2 border-[#F0F3BD]/30 hover:border-[#02C39A]/50 hover:shadow-xl transition-all duration-300"
              >
                <h3 className="font-bold text-xl mb-4 text-[#05668D] group-hover:text-[#028090] transition-colors">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="px-10 py-5 bg-gradient-to-r from-[#05668D] via-[#028090] to-[#00A896] text-white font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              Ask More Questions
            </button>
          </div>
        </div>
      </section>

      {/* Footer Wave */}
      <footer className="relative bg-gradient-to-r from-[#05668D] via-[#028090] to-[#00A896] text-white py-16">
        {/* Top Wave */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              fill="white"
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-xl text-blue-100 mb-8">Join thousands of freelancers and employers today.</p>
          <button className="px-10 py-5 bg-white text-[#05668D] font-bold rounded-2xl hover:bg-[#F0F3BD] hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            Get Started Now
          </button>
        </div>
      </footer>
    </div>
  );
}