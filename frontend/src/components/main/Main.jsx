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
  Briefcase,
  Handshake
} from "lucide-react";
import 'animate.css';
import CategoriesFlipCards from "../../components/CategoriesCards/flipCards";
import tools from "../../assets/tools.png";
import LogoLogic from "../logoLoop/LogoLogic";
import communityImg from "../../assets/community.jpg";


export default function OrderzHousePageRedesign() {
  const [activePlan, setActivePlan] = useState("basic");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [showAll, setShowAll] = useState(false);
  

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
<div className="absolute right-20 top-1/2 transform -translate-y-1/2 -translate-x-8 z-10 hidden lg:block">
  <img 
    src={tools}
    alt="Freelance tools" 
    className="w-[900px] h-auto animate__animated animate__lightSpeedInRight"
  />
</div>

{/* Hero Content */}
<div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left transform -translate-x-12 scale-105">
  <div className="lg:w-2/3 animate__animated animate__lightSpeedInLeft">
    <h1
      className="text-6xl md:text-7xl font-bold"
      style={{
        fontFamily: "'Merriweather', serif",
        background: "linear-gradient(90deg, #0072CE, #02C39A)", 
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      ORDERZ HOUSE
    </h1>

    <div className="text-base md:text-base text-[#ccdbdc] font-medium mb-6 italic">
      Where work finds its perfect home.
    </div>

    <p
      className="text-2xl md:text-3xl font-serif text-[#ccdbdc] max-w-3xl mb-12 leading-relaxed"
      style={{ fontFamily: "'Merriweather', serif" }}
    >
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


      <section className="flipCardsSection mt-12">
  <CategoriesFlipCards />
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

      
      
      {/* Community Section*/}
<section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
  {/* Wave Background */}
  <div className="absolute inset-0 overflow-hidden">
    <svg
      className="absolute inset-0 w-full h-full min-w-full min-h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="communityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0F3BD" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#F0F3BD" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#F0F3BD" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      <path
        fill="url(#communityGradient)"
        d="M0,25 C20,15 35,18 50,16 C65,14 80,12 100,15 L100,70 C85,75 70,78 55,76 C40,74 25,78 10,75 C5,74 0,72 0,70 Z"
      />
      <path
        fill="#F0F3BD"
        fillOpacity="0.4"
        d="M0,35 C15,30 30,33 45,31 C60,29 75,27 100,30 L100,60 C85,63 70,62 55,64 C40,66 25,63 10,65 C5,65.5 0,64 0,63 Z"
      />
      <path
        fill="#F0F3BD"
        fillOpacity="0.3"
        d="M0,45 C20,40 40,43 60,41 C75,39 90,37 100,40 L100,85 C80,88 60,87 40,89 C25,90 10,88 0,85 Z"
      />
      <path
        fill="#F0F3BD"
        fillOpacity="0.2"
        d="M0,55 C25,50 50,53 75,51 C85,50 95,49 100,50 L100,100 L0,100 Z"
      />
    </svg>
  </div>

 {/* Content Container */}
<div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
  <div className="flex items-center justify-center min-h-[600px]">
    <div className="max-w-4xl text-center space-y-8 -mt-10">
      {/* Heading & Description */}
      <div className="-translate-y-4">
        <h1
          className="text-5xl md:text-6xl font-bold text-[#05668D] mb-6 leading-tight"
          style={{ fontFamily: "Merriweather, serif" }}
        >
          Join Our <span className="block text-[#028090]">Community</span>
        </h1>
        <p
          className="text-xl text-gray-700 leading-relaxed"
          style={{ fontFamily: "Merriweather, serif" }}
        >
          Connect with talented professionals, collaborate on exciting projects, 
          and build lasting relationships in our thriving freelance ecosystem.
        </p>
      </div>
      {/* Services Section */}
      <div className="mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto items-center">
          {/* Freelancer & Client */}
          <div className="text-left space-y-6 md:-translate-x-2">
            {/* Freelancer */}
            <div>
              <div className="mb-4">
                <Users className="w-12 h-12 text-[#02C39A]" />
              </div>
              <h3 className="text-2xl font-bold text-[#05668D] mb-4" style={{ fontFamily: "Merriweather, serif" }}>Freelancer</h3>
              <p className="text-gray-600 mb-6 leading-relaxed" style={{ fontFamily: "Merriweather, serif" }}>
                Apply for positions as a freelancer and take control of your career
              </p>
            </div>
            {/* Client */}
            <div>
              <div className="mb-4">
                <Briefcase className="w-12 h-12 text-[#02C39A]" />
              </div>
              <h3 className="text-2xl font-bold text-[#05668D] mb-4" style={{ fontFamily: "Merriweather, serif" }}>Client</h3>
              <p className="text-gray-600 mb-6 leading-relaxed" style={{ fontFamily: "Merriweather, serif" }}>
                Order the project you need and build your dream team
              </p>
            </div>
          </div>
          {/* Center Image */}
          <div className="lg:col-span-2 flex justify-center">
            <img
              src={communityImg}
              alt="Community"
              className="w-80 sm:w-[24rem] md:w-80 h-auto object-contain"
            />
          </div>
          {/* Customer Success */}
          <div className="text-left space-y-6 md:translate-x-2">
            <div>
              <div className="mb-4">
                <Handshake className="w-12 h-12 text-[#02C39A]" />
              </div>
              <h3 className="text-2xl font-bold text-[#05668D] mb-4" style={{ fontFamily: "Merriweather, serif" }}>Customer Success</h3>
              <p className="text-gray-600 mb-6 leading-relaxed" style={{ fontFamily: "Merriweather, serif" }}>
                Collaborate and achieve success together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  {/* Floating decorative elements */}
  <div className="absolute top-20 right-20 w-4 h-4 rounded-full bg-[#02C39A] animate-bounce opacity-60"></div>
  <div className="absolute top-40 right-32 w-3 h-3 rounded-full bg-[#00A896] animate-pulse opacity-40"></div>
  <div className="absolute bottom-32 left-16 w-5 h-5 rounded-full bg-[#028090] animate-bounce opacity-50" style={{ animationDelay: '1s' }}></div>
  <div className="absolute bottom-20 left-32 w-2 h-2 rounded-full bg-[#05668D] animate-pulse opacity-30" style={{ animationDelay: '2s' }}></div>
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