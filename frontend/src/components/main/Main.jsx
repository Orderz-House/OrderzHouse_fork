import { useEffect, useState } from "react";
import { 
  CheckCircle,
  Users,
  Briefcase,
  Handshake
} from "lucide-react";

// Image imports
import graphicDesignImg from "../../assets/graphic.jpg";
import contentWritingImg from "../../assets/writing.jpg";
import programmingImg from "../../assets/programming.jpg";
import photographyImg from "../../assets/camera.jpg";
import voiceAudioImg from "../../assets/voiceover.jpg";
import communityImg from "../../assets/community.jpg";

import img1 from "../../assets/Battech.png";
import img2 from "../../assets/Bildazo.png";
import img3 from "../../assets/studyzhouse.png";
import img4 from "../../assets/Fazaat.png";

import newImg1 from '../../assets/img1.jpg';
import newImg2 from '../../assets/img2.jpg';
import newImg3 from '../../assets/img3.jpg';

export default function OrderzHousePageRedesign() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [openFaq, setOpenFaq] = useState(0);

  // Static data
  const categories = [
    {
      id: 1,
      name: "Graphic Design",
      description: "Crafting visual content that communicates ideas and captivates audiences.",
      image: graphicDesignImg,
    },
    {
      id: 2,
      name: "Content Writing",
      description: "Turning ideas into well-written content for your needs.",
      image: contentWritingImg,
    },
    {
      id: 3,
      name: "Programming",
      description: "Writing code to build websites, apps, and software that solve problems.",
      image: programmingImg,
    },
    {
      id: 4,
      name: "Photography",
      description: "Capturing moments and telling stories through stunning images.",
      image: photographyImg,
    },
    {
      id: 5,
      name: "Voice & Audio",
      description: "Creating voiceovers, podcasts, and audio content for your projects.",
      image: voiceAudioImg,
    },
  ];

  const plans = {
    monthly: [
      {
        id: 1,
        name: "Free",
        description: "Perfect for getting started",
        subscriptionFee: "0",
        earnLimit: "100",
      },
      {
        id: 2,
        name: "Professional",
        description: "Most popular choice",
        subscriptionFee: "20",
        earnLimit: "unlimited",
        isPopular: true,
      }
    ],
    annual: [
      {
        id: 3,
        name: "1 Year",
        description: "Best value for professionals",
        subscriptionFee: "45",
        earnLimit: "unlimited",
        isPopular: true,
      },
      {
        id: 4,
        name: "2-Year Plan",
        description: "Maximum value for serious professionals",
        subscriptionFee: "65",
        earnLimit: "unlimited",
      }
    ]
  };

  const faqs = [
    {
      question: "Do you offer a free trial?",
      answer: "No, a free trial is not necessary because we already provide a free plan."
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes, but only after your current subscription period ends."
    },
    {
      question: "Can I freeze my plan subscription?",
      answer: "No, plans cannot be frozen."
    },
    {
      question: "When does my plan period start?",
      answer: "The plan time counter starts after you receive your first project."
    },
    {
      question: "Can I deactivate my account?",
      answer: "Yes, you can deactivate your account, but only if you do not have any in-progress projects."
    },
    {
      question: "What happens if I miss a project deadline?",
      answer: "If project deadlines are not met, the contract may be terminated."
    },
    {
      question: "Do I need to pay for additional services?",
      answer: "Any additional services outside your selected plan may require extra fees, which will be clearly communicated before purchase."
    },
    {
      question: "Are refunds available?",
      answer: "No refunds or returns are offered once a subscription is active."
    },
    {
      question: "Is the free plan truly free?",
      answer: "Yes, the free plan includes limited features to get started with no payment required."
    },
    {
      question: "Can I switch between monthly and annual billing?",
      answer: "You can choose your billing cycle when subscribing, but changes can only occur at the end of the current subscription period."
    },
    {
      question: "Are there any hidden fees?",
      answer: "No, all fees including the one-time verification fee are clearly stated during the subscription process."
    },
    {
      question: "What if I want to cancel my subscription?",
      answer: "You may cancel at any time, but no refunds are provided and your current plan will remain active until the end of the subscription period."
    },
    {
      question: "Can I have multiple projects under the same plan?",
      answer: "Yes, your plan supports multiple projects, but the plan time counter starts when your first project is assigned."
    }
  ];

  // Preload images
  useEffect(() => {
    const preloadImages = [
      graphicDesignImg,
      contentWritingImg,
      programmingImg,
      photographyImg,
      voiceAudioImg
    ];
    
    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const currentPlans = plans[billingCycle];

  const handleGetStarted = (planId) => {
    console.log(`Get started with plan ${planId}`);
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Merriweather', serif" }}>
  
  {/* Hero Section */}
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
    
    {/* Background Elements */}
    <div className="absolute inset-0 opacity-[0.02]">
      <div className="w-full h-full" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}></div>
    </div>

    <div className="absolute inset-0">
      <div className="absolute top-16 left-16">
        <div className="w-24 h-1 bg-gradient-to-r from-[#05668D] to-transparent"></div>
        <div className="w-1 h-24 bg-gradient-to-b from-[#05668D] to-transparent mt-2"></div>
      </div>
      
      <div className="absolute bottom-16 right-16">
        <div className="w-24 h-1 bg-gradient-to-l from-[#02C39A] to-transparent"></div>
        <div className="w-1 h-24 bg-gradient-to-t from-[#02C39A] to-transparent -mt-24 ml-auto"></div>
      </div>
    </div>

    {/* Hero Content Container */}
    <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side - Text Content */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50/50 text-gray-600 mb-8">
            <div className="flex -space-x-1">
              <div className="w-4 h-4 rounded-full bg-[#05668D]"></div>
              <div className="w-4 h-4 rounded-full bg-[#028090]"></div>
              <div className="w-4 h-4 rounded-full bg-[#00A896]"></div>
              <div className="w-4 h-4 rounded-full bg-[#02C39A]"></div>
            </div>
            <span className="text-sm font-medium">10,000+ Creative Professionals</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-2 tracking-tight text-[#05668D]">
            ORDERZ
            <span className="block text-3xl md:text-4xl lg:text-5xl font-light text-[#02C39A] mt-2">
              HOUSE
            </span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 font-medium mb-12 leading-relaxed">
            Where work finds its perfect home.
          </p>

          <div className="flex justify-center lg:justify-start mb-12">
            <button className="px-10 py-5 bg-white text-[#05668D] font-bold rounded-lg border-2 border-[#05668D] hover:bg-[#05668D] hover:text-white transition-all duration-300 text-lg">
              Start a Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto lg:mx-0">
            <div className="text-center lg:text-left">
              <div className="text-2xl font-bold text-[#05668D]">10K+</div>
              <div className="text-sm text-gray-500">Creative Professionals</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-2xl font-bold text-[#028090]">50K+</div>
              <div className="text-sm text-gray-500">Projects Delivered</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-2xl font-bold text-[#00A896]">4.9★</div>
              <div className="text-sm text-gray-500">Client Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Right Side - Image Grid */}
<div className="hidden lg:block">
  <div className="grid grid-cols-2 gap-4 max-w-md ml-auto">

    {/* Row 1 - top images fade from top */}
    <div className="relative">
      <img src={graphicDesignImg} alt="Creative work example" className="w-full h-48 object-cover rounded-2xl shadow-lg"/>
      {/* Top fade only for first row */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent rounded-2xl"></div>
    </div>
    <div className="relative">
      <img src={contentWritingImg} alt="Design showcase" className="w-full h-48 object-cover rounded-2xl shadow-lg"/>
      <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent rounded-2xl"></div>
    </div>

    {/* Row 2 - large image (no fade or optional top fade) */}
    <div className="col-span-2 relative">
      <img src={programmingImg} alt="Professional portfolio" className="w-full h-56 object-cover rounded-2xl shadow-lg"/>
      {/* Optional: subtle top fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent rounded-2xl"></div>
    </div>

    {/* Row 3 - middle row fade from bottom */}
    <div className="relative">
      <img src={photographyImg} alt="Creative project" className="w-full h-40 object-cover rounded-2xl shadow-lg"/>
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent rounded-2xl"></div>
    </div>
    <div className="relative">
      <img src={voiceAudioImg} alt="Work example" className="w-full h-40 object-cover rounded-2xl shadow-lg"/>
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent rounded-2xl"></div>
    </div>

    {/* Row 4 - bottom large image fade from bottom */}
    <div className="col-span-2 relative">
      <img src={newImg1} alt="New example 1" className="w-full h-56 object-cover rounded-2xl shadow-lg"/>
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-transparent rounded-2xl"></div>
    </div>

    {/* Row 5 - two small bottom images fade from bottom */}
    <div className="relative">
      <img src={newImg2} alt="New example 2" className="w-full h-40 object-cover rounded-2xl shadow-lg"/>
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-transparent rounded-2xl"></div>
    </div>
    <div className="relative">
      <img src={newImg3} alt="New example 3" className="w-full h-40 object-cover rounded-2xl shadow-lg"/>
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-transparent rounded-2xl"></div>
    </div>

  </div>

        </div>

      </div>
    </div>

    {/* Bottom Gradient Line */}
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#05668D] via-[#028090] via-[#00A896] via-[#02C39A] to-[#F0F3BD] opacity-30"></div>

  </section>



      {/* Categories Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#028090]">
            Our Categories
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto mt-3 sm:mt-4 px-4">
            Discover our wide range of professional categories and find the perfect services to meet your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flip-card w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto cursor-pointer rounded-full shadow-2xl border-2 border-[#00A896] transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,168,150,0.6)]"
              style={{ backgroundColor: "#F0F3BD" }}
            >
              <div className="flip-card-inner relative w-full h-full rounded-full">
                
                <div className="flip-card-front absolute w-full h-full rounded-full overflow-hidden shadow-lg">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full"
                    loading="eager"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full">
                    <h3 className="text-black text-lg sm:text-xl font-bold text-center px-2 sm:px-4">
                      {cat.name}
                    </h3>
                  </div>
                </div>

                <div className="flip-card-back absolute w-full h-full rounded-full bg-white p-4 sm:p-6 shadow-lg flex items-center justify-center text-center border-2 border-[#00A896]">
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <h3 className="text-[#028090] text-base sm:text-lg font-bold mb-2 sm:mb-3">{cat.name}</h3>
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{cat.description}</p>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        <style jsx>{`
          .flip-card {
            perspective: 1000px;
          }
          
          .flip-card-inner {
            transition: transform 0.6s ease;
            transform-style: preserve-3d;
          }
          
          .flip-card:hover .flip-card-inner {
            transform: rotateY(180deg);
          }
          
          .flip-card-front,
          .flip-card-back {
            backface-visibility: hidden;
          }
          
          .flip-card-back {
            transform: rotateY(180deg);
          }
          
          @media (max-width: 475px) {
            .flip-card {
              width: 180px !important;
              height: 180px !important;
            }
          }
        `}</style>
      </section>

      {/* Community Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full min-w-full min-h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="communityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F0F3BD" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#F0F3BD" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#F0F3BD" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <path fill="url(#communityGradient)" d="M0,25 C20,15 35,18 50,16 C65,14 80,12 100,15 L100,70 C85,75 70,78 55,76 C40,74 25,78 10,75 C5,74 0,72 0,70 Z" />
            <path fill="#F0F3BD" fillOpacity="0.4" d="M0,35 C15,30 30,33 45,31 C60,29 75,27 100,30 L100,60 C85,63 70,62 55,64 C40,66 25,63 10,65 C5,65.5 0,64 0,63 Z" />
            <path fill="#F0F3BD" fillOpacity="0.3" d="M0,45 C20,40 40,43 60,41 C75,39 90,37 100,40 L100,85 C80,88 60,87 40,89 C25,90 10,88 0,85 Z" />
            <path fill="#F0F3BD" fillOpacity="0.2" d="M0,55 C25,50 50,53 75,51 C85,50 95,49 100,50 L100,100 L0,100 Z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
            <div className="max-w-4xl text-center space-y-6 sm:space-y-8">
              
              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#05668D] mb-4 sm:mb-6 leading-tight">
                  Join Our <span className="block text-[#028090]">Community</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed px-4">
                  Connect with talented professionals, collaborate on exciting projects, 
                  and build lasting relationships in our thriving freelance ecosystem.
                </p>
              </div>

              <div className="mt-8 sm:mt-10 md:mt-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto items-start lg:items-center">
                  
                  <div className="text-center sm:text-left space-y-6 sm:space-y-8 order-1 lg:order-1">
                    <div>
                      <div className="mb-3 sm:mb-4 flex justify-center sm:justify-start">
                        <Users className="w-10 h-10 sm:w-12 sm:h-12 text-[#02C39A]" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#05668D] mb-3 sm:mb-4">Freelancer</h3>
                      <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                        Apply for positions as a freelancer and take control of your career
                      </p>
                    </div>
                    
                    <div>
                      <div className="mb-3 sm:mb-4 flex justify-center sm:justify-start">
                        <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-[#02C39A]" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#05668D] mb-3 sm:mb-4">Client</h3>
                      <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                        Order the project you need and build your dream team
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex justify-center order-3 sm:order-2 lg:order-2">
                    <img src={communityImg} alt="Community" className="w-64 sm:w-72 md:w-80 lg:w-96 xl:w-[28rem] h-auto object-contain" />
                  </div>

                  <div className="text-center sm:text-left space-y-6 sm:space-y-8 order-2 sm:order-3 lg:order-3">
                    <div>
                      <div className="mb-3 sm:mb-4 flex justify-center sm:justify-start lg:justify-end">
                        <Handshake className="w-10 h-10 sm:w-12 sm:h-12 text-[#02C39A]" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#05668D] mb-3 sm:mb-4 lg:text-right">Customer Success</h3>
                      <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base lg:text-right">
                        Collaborate and achieve success together
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#02C39A] animate-bounce opacity-60"></div>
        <div className="absolute top-20 sm:top-40 right-16 sm:right-32 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#00A896] animate-pulse opacity-40"></div>
        <div className="absolute bottom-16 sm:bottom-32 left-8 sm:left-16 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#028090] animate-bounce opacity-50" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 sm:bottom-20 left-16 sm:left-32 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#05668D] animate-pulse opacity-30" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4 sm:mb-6">
              Choose Your Plan
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Flexible subscription options designed to help you grow.  
              Work anywhere, across all your devices, with the right plan for your needs.
            </p>
          </div>

          <div className="flex justify-center items-center mb-8 sm:mb-12">
            <div className="bg-gray-100 rounded-lg p-1 inline-flex">
              <button
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  billingCycle === "monthly"
                    ? "bg-black text-white shadow-lg"
                    : "text-gray-600 hover:text-black"
                }`}
                onClick={() => setBillingCycle("monthly")}
              >
                Pay monthly
              </button>
              <button
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  billingCycle === "annual"
                    ? "bg-black text-white shadow-lg"
                    : "text-gray-600 hover:text-black"
                }`}
                onClick={() => setBillingCycle("annual")}
              >
                Pay annually
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {currentPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-lg border-2 p-8 transition-all duration-300 ${
                  plan.isPopular
                    ? "bg-white border-[#F0F3BD] shadow-sm"
                    : "bg-white border-gray-300 shadow-sm"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#F0F3BD] text-black px-4 py-1 rounded-full text-sm font-medium">
                      Most popular
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-black">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold text-black">
                      {plan.subscriptionFee === "0" ? "0 JD" : `${plan.subscriptionFee} JD`}
                    </span>
                    {plan.subscriptionFee !== "0" && (
                      <span className="ml-1 text-gray-600">
                        /{plan.id === 4 ? "2 years" : billingCycle === "annual" ? "year" : "month"}
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-medium text-gray-600 mb-6">
                    {plan.earnLimit === "unlimited"
                      ? "Unlimited earnings"
                      : `Max ${plan.earnLimit} JD/month`}
                  </div>

                  <button
                    onClick={() => handleGetStarted(plan.id)}
                    className="w-full py-3 font-medium rounded-lg transition-all duration-300 bg-[#F0F3BD] text-black hover:bg-[#E5E8A3]"
                  >
                    Get started
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12 text-sm text-gray-500 space-y-1">
            <p>* A contract is signed after subscription.</p>
            <p>* Account verification fee is a one-time payment across all plans (25 JD).</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute top-10 left-10 w-32 h-32 opacity-20" viewBox="0 0 100 100">
            <defs>
              <pattern id="dots1" patternUnits="userSpaceOnUse" width="10" height="10">
                <circle cx="5" cy="5" r="1" fill="#028090" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#dots1)" />
          </svg>
          
          <svg className="absolute bottom-20 right-16 w-40 h-40 opacity-15" viewBox="0 0 100 100">
            <defs>
              <pattern id="dots2" patternUnits="userSpaceOnUse" width="8" height="8">
                <circle cx="4" cy="4" r="1.5" fill="#028090" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#dots2)" />
          </svg>

          <div className="absolute top-16 right-20 w-6 h-6 border-2 border-[#028090] rotate-45 opacity-30"></div>
          <div className="absolute bottom-32 left-20 w-8 h-8 rounded-full border-2 border-[#028090] opacity-25"></div>
          <div className="absolute top-32 right-1/3 w-4 h-8 bg-[#028090] opacity-20 rotate-12"></div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative z-10">
          
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4 leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-700 text-sm sm:text-base max-w-md">
              Everything you need to know about using our platform and services.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 sm:p-8 shadow-lg relative" style={{ height: "500px", overflowY: "auto" }}>
            {faqs.map((faq, index) => (
              <div key={index} className="mb-4 relative">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-100 transition-colors duration-200 rounded-lg group"
                >
                  <span className="text-black font-medium text-sm sm:text-base pr-4 group-hover:text-[#028090] transition-colors">
                    {faq.question}
                  </span>
                  <div className={`transform transition-all duration-200 ${openFaq === index ? 'rotate-180 text-[#028090]' : 'text-gray-500'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-48' : 'max-h-0'}`}>
                  <div className="pt-2 pb-2 text-gray-600 text-sm leading-relaxed border-l-2 border-[#028090] pl-4 ml-2">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-r from-[#05668D] via-[#028090] to-[#00A896] text-white py-8 sm:py-12">
        
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-16 sm:h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              fill="white"
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 text-center">
          <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-14 md:gap-20">
            {[img1, img2, img3, img4].map((img, index) => (
              <div key={index} className="flex items-center justify-center">
                <img 
                  src={img} 
                  alt={`Logo ${index + 1}`} 
                  className={`w-auto filter brightness-0 invert opacity-90 hover:opacity-100 transition-all duration-300 ${
                    index === 2
                      ? "h-40 sm:h-44 md:h-48 lg:h-52 xl:h-56 hover:scale-125" 
                      : "h-28 sm:h-32 md:h-36 lg:h-40 hover:scale-110"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}