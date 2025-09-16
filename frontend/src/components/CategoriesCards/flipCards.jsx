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
import CategoriesFlipCards from "../../components/CategoriesCards/flipCards";
import tools from "../../assets/tools.png";
import LogoLogic from "../logoLoop/LogoLogic";

export default function OrderzHousePageRedesign() {
  const [activePlan, setActivePlan] = useState("basic");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [showAll, setShowAll] = useState(false);
  const [categories, setCategories] = useState([]);

  const initialCategoriesCount = 3;
  const displayedCategories = showAll ? categories : categories.slice(0, initialCategoriesCount);

  useEffect(() => {
    // Replace with API fetch if needed
    setCategories([
      { id: 1, name: "Design", description: "Creative services" },
      { id: 2, name: "Development", description: "Web & mobile apps" },
      { id: 3, name: "Marketing", description: "Grow your business" },
      { id: 4, name: "Writing", description: "Content creation" },
      { id: 5, name: "Photography", description: "Capture moments" },
    ]);
  }, []);

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

  const handleExploreTalent = () => console.log("Explore talent clicked");
  const handleGetStarted = (planId) => console.log(`Get started with plan ${planId}`);
  const handleViewProfile = (freelancerId) => console.log(`View profile ${freelancerId}`);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
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
            <path fill="url(#waveGradient1)" d="M0,160L40,176C80,192,160,224,240,224C320,224,400,192,480,165.3C560,139,640,117,720,122.7C800,128,880,160,960,170.7C1040,181,1120,171,1200,149.3C1280,128,1360,96,1400,80L1440,64L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z">
              <animateTransform attributeName="transform" type="translate" values="0,0;50,0;0,0" dur="20s" repeatCount="indefinite" />
            </path>
            <path fill="url(#waveGradient2)" d="M0,224L40,213.3C80,203,160,181,240,186.7C320,192,400,224,480,224C560,224,640,192,720,181.3C800,171,880,181,960,192C1040,203,1120,213,1200,213.3C1280,213,1360,203,1400,197.3L1440,192L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z">
              <animateTransform attributeName="transform" type="translate" values="0,0;-30,0;0,0" dur="15s" repeatCount="indefinite" />
            </path>
          </svg>
        </div>

        {/* Professional tools Image */}
        <div className="absolute right-20 top-1/2 transform -translate-y-1/2 -translate-x-8 z-10 hidden lg:block">
          <img 
            src={tools}
            alt="Freelance tools" 
            loading="lazy"
            className="w-[900px] h-auto animate__animated animate__lightSpeedInRight"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left transform -translate-x-12 scale-105">
          <div className="lg:w-2/3 animate__animated animate__lightSpeedInLeft">
            <h1 className="text-6xl md:text-7xl font-bold" style={{fontFamily: "'Merriweather', serif", background: "linear-gradient(90deg, #0072CE, #02C39A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>
              ORDERZ HOUSE
            </h1>
            <div className="text-base md:text-base text-[#ccdbdc] font-medium mb-6 italic">Where work finds its perfect home.</div>
            <p className="text-2xl md:text-3xl font-serif text-[#ccdbdc] max-w-3xl mb-12 leading-relaxed" style={{ fontFamily: "'Merriweather', serif" }}>
              Connect, create, and grow in a freelance ecosystem built for success.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-start">
              <button onClick={handleExploreTalent} className="group px-10 py-5 bg-gradient-to-r from-[#05668D] via-[#028090] to-[#00A896] text-white font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
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
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LogoLogic />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <CategoriesFlipCards categories={displayedCategories} />
        {categories.length > initialCategoriesCount && (
          <div className="text-center mt-12">
            <button onClick={() => setShowAll(!showAll)} className="bg-gradient-to-r from-[#41b5e2] to-[#028090] hover:from-[#028090] hover:to-[#00A896] text-white font-medium py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto">
              {showAll ? 'Show Less Categories' : 'View All Categories'}
              <ChevronRight className={`ml-2 h-5 w-5 transition-transform duration-300 ${showAll ? 'rotate-90' : ''}`} />
            </button>
          </div>
        )}
      </section>

      {/* Plans Section */}
      <section className="py-20 bg-[#F0F3BD]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-12 text-[#05668D]">Pricing Plans</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {plans.map((plan) => (
              <div key={plan.id} className={`p-8 rounded-3xl shadow-lg transform transition-all duration-300 ${plan.isPopular ? 'border-4 border-[#02C39A] scale-105' : 'border border-gray-200'}`}>
                {plan.isPopular && <div className="bg-[#02C39A] text-white px-4 py-1 rounded-full absolute -mt-12 ml-4 text-sm">Most Popular</div>}
                <h3 className="text-2xl font-semibold mb-4">{plan.name}</h3>
                <p className="mb-6 text-gray-600">{plan.description}</p>
                <div className="text-3xl font-bold mb-6">${plan.price} <span className="text-base font-normal">/month</span></div>
                <ul className="text-left mb-6 space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#02C39A] mr-2" /> {feature}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleGetStarted(plan.id)} className="bg-[#02C39A] text-white px-6 py-3 rounded-2xl hover:scale-105 transition-transform duration-300">Get Started</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Freelancers Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-[#05668D] text-center">Top Freelancers</h2>
          <div className="grid md:grid-cols-4 gap-10">
            {topFreelancers.map((freelancer, i) => (
              <div key={i} className="p-6 rounded-2xl shadow-lg text-center hover:shadow-2xl transition-shadow duration-300">
                <div className="text-6xl mb-4">{freelancer.image}</div>
                <h3 className="text-xl font-semibold mb-2">{freelancer.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{freelancer.category}</p>
                <p className="text-sm text-gray-400">{freelancer.rating} | {freelancer.views}</p>
                <button onClick={() => handleViewProfile(i)} className="mt-4 bg-[#02C39A] text-white px-4 py-2 rounded-full hover:scale-105 transition-transform duration-300">View Profile</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#F0F3BD]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-[#05668D] text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <details key={i} className="p-6 bg-white rounded-2xl shadow-lg">
                <summary className="cursor-pointer text-lg font-semibold">{faq.question}</summary>
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#05668D] text-white text-center">
        <p>© {new Date().getFullYear()} Orderz House. All rights reserved.</p>
      </footer>
    </div>
  );
}
