import { useState, useEffect } from "react";
import {
  Users,
  Target,
  Heart,
  Zap,
  Shield,
  Award,
  TrendingUp,
  Globe,
  CheckCircle,
  ArrowRight,
  Star,
  Play,
  Calendar,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { useSelector } from "react-redux";

export default function ModernAboutPageRedesign() {
  const [activeValue, setActiveValue] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const { isLoggedIn } = useSelector((state) => {
    return {
      isLoggedIn: state.auth.isLoggedIn,
    };
  });

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const coreValues = [
    {
      icon: Award,
      title: "Excellence in Service",
      description:
        "We strive for perfection in every project, delivering results that exceed expectations.",
      color: "from-[#05668D] to-[#028090]",
    },
    {
      icon: Shield,
      title: "Transparency and Trust",
      description:
        "Building lasting relationships through honest communication and reliable partnerships.",
      color: "from-[#028090] to-[#00A896]",
    },
    {
      icon: Zap,
      title: "Empowering Innovation",
      description:
        "Fostering creativity and cutting-edge solutions that drive business growth.",
      color: "from-[#00A896] to-[#02C39A]",
    },
    {
      icon: Heart,
      title: "Human-Centric Technology",
      description:
        "Technology that serves people, not the other way around - putting humanity first.",
      color: "from-[#02C39A] to-[#F0F3BD]",
    },
  ];

  const team = [
    {
      name: "Adam Khalid",
      role: "Founder & CEO",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      bio: "Visionary leader with 10+ years in tech innovation",
      social: { linkedin: "#", twitter: "#" },
    },
    {
      name: "Sara El-Helou",
      role: "Marketing Director",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      bio: "Strategic marketing expert driving brand growth",
      social: { linkedin: "#", twitter: "#" },
    },
    {
      name: "Omar Zain",
      role: "CTO",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      bio: "Technology architect building scalable solutions",
      social: { linkedin: "#", twitter: "#" },
    },
  ];

  const stats = [
    { number: "500+", label: "Happy Clients", icon: Users },
    { number: "98%", label: "Success Rate", icon: TrendingUp },
    { number: "15+", label: "Countries", icon: Globe },
    { number: "24/7", label: "Support", icon: Shield },
  ];

  const whyChooseUs = [
    {
      title: "Verified professionals",
      desc: "All freelancers are thoroughly vetted",
    },
    {
      title: "Secure payment gateways",
      desc: "Your transactions are 100% secure",
    },
    {
      title: "Transparent project tracking",
      desc: "Real-time progress monitoring",
    },
    { title: "Quality assurance", desc: "Every project meets high standards" },
    {
      title: "Direct marketing approach",
      desc: "Targeted strategies that work",
    },
    { title: "Dedicated support", desc: "24/7 assistance when you need it" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Smooth Waves */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Animated Wave Background */}
        <div className="absolute inset-0">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="heroGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F0F3BD" stopOpacity="0.3" />
                <stop offset="25%" stopColor="#02C39A" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#00A896" stopOpacity="0.25" />
                <stop offset="75%" stopColor="#028090" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#05668D" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="heroGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#05668D" stopOpacity="0.1" />
                <stop offset="33%" stopColor="#028090" stopOpacity="0.15" />
                <stop offset="66%" stopColor="#00A896" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#F0F3BD" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            
            <path
              fill="url(#heroGradient1)"
              d="M0,200L48,220C96,240,192,280,288,300C384,320,480,320,576,310C672,300,768,280,864,270C960,260,1056,260,1152,280C1248,300,1344,340,1392,360L1440,380L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0;30,0;0,0"
                dur="25s"
                repeatCount="indefinite"
              />
            </path>
            
            <path
              fill="url(#heroGradient2)"
              d="M0,320L48,340C96,360,192,400,288,420C384,440,480,440,576,430C672,420,768,400,864,390C960,380,1056,380,1152,400C1248,420,1344,460,1392,480L1440,500L1440,800L1392,800C1344,800,1248,800,1152,800C1056,800,960,800,864,800C768,800,672,800,576,800C480,800,384,800,288,800C192,800,96,800,48,800L0,800Z"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0;-20,0;0,0"
                dur="20s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-[#F0F3BD]/30 to-[#02C39A]/20 blur-2xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 rounded-full bg-gradient-to-br from-[#05668D]/20 to-[#028090]/30 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-[#00A896]/25 to-[#02C39A]/15 blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center min-h-screen">
          <div className="w-full text-center">
            <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-[#F0F3BD]/50 mb-8 shadow-lg">
              <span className="text-sm font-medium text-[#05668D]" style={{ fontFamily: "'Merriweather', serif" }}>
                ABOUT US
              </span>
            </div>

            <h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
              style={{ fontFamily: "'Merriweather', serif" }}
            >
              About{" "}
              <span 
                className="bg-gradient-to-r from-[#05668D] via-[#028090] to-[#00A896] bg-clip-text text-transparent"
                style={{ fontFamily: "'Merriweather', serif" }}
              >
                ORDERZHOUSE
              </span>
            </h1>

            <p 
              className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12"
              style={{ fontFamily: "'Merriweather', serif" }}
            >
              We're redefining the future of freelancing by connecting
              visionaries with exceptional talent, where creativity meets
              reliability to build a distinguished future.
            </p>

            {/* Stats with smoother design */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  data-animate
                  id={`stat-${index}`}
                  className={`group text-center transform transition-all duration-700 ${
                    isVisible[`stat-${index}`]
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#05668D] to-[#028090] rounded-3xl mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                    <stat.icon className="w-10 h-10 text-white" />
                  </div>
                  <div 
                    className="text-3xl md:text-4xl font-bold text-[#05668D] mb-3"
                    style={{ fontFamily: "'Merriweather', serif" }}
                  >
                    {stat.number}
                  </div>
                  <div 
                    className="text-gray-600 font-medium"
                    style={{ fontFamily: "'Merriweather', serif" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are - Smoother Layout */}
      <section className="py-32 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F0F3BD]/10 via-white to-[#02C39A]/5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div
              data-animate
              id="who-we-are"
              className={`transform transition-all duration-1000 ${
                isVisible["who-we-are"]
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-12 opacity-0"
              }`}
            >
              <h2 
                className="text-5xl md:text-6xl font-bold mb-8 leading-tight"
                style={{ fontFamily: "'Merriweather', serif" }}
              >
                Who{" "}
                <span className="bg-gradient-to-r from-[#05668D] to-[#028090] bg-clip-text text-transparent">
                  We Are
                </span>
              </h2>

              <p 
                className="text-xl text-gray-600 leading-relaxed mb-10"
                style={{ fontFamily: "'Merriweather', serif" }}
              >
                ORDERZHOUSE is a curated freelance marketplace connecting
                brilliant minds with bold ideas. We're more than just a platform
                — we're a movement reshaping the future of independent work.
              </p>

              <div className="space-y-8">
                <div className="flex items-start space-x-6 group">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#05668D] to-[#028090] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 
                      className="text-2xl font-bold text-[#05668D] mb-3"
                      style={{ fontFamily: "'Merriweather', serif" }}
                    >
                      Our Mission
                    </h3>
                    <p 
                      className="text-gray-600 text-lg"
                      style={{ fontFamily: "'Merriweather', serif" }}
                    >
                      To empower freelancers and businesses through seamless,
                      secure, and smart collaborations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              data-animate
              id="team-image"
              className={`transform transition-all duration-1000 ${
                isVisible["team-image"]
                  ? "translate-x-0 opacity-100"
                  : "translate-x-12 opacity-0"
              }`}
            >
              <div className="relative group">
                <div className="absolute -inset-6 bg-gradient-to-r from-[#05668D]/20 to-[#02C39A]/20 rounded-3xl opacity-60 blur-2xl group-hover:opacity-80 transition-all duration-500"></div>
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                  alt="Team collaboration"
                  className="relative w-full rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05668D]/20 to-transparent rounded-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values - Enhanced Design */}
      <section className="py-32 relative overflow-hidden">
        {/* Background with flowing pattern */}
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none">
            <defs>
              <linearGradient id="valuesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F0F3BD" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#02C39A" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#05668D" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path
              fill="url(#valuesGradient)"
              d="M0,100 C200,50 400,150 600,100 C800,50 1000,150 1200,100 L1440,120 L1440,800 L0,800 Z"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0;50,0;0,0"
                dur="30s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 
              className="text-5xl md:text-6xl font-bold mb-8"
              style={{ fontFamily: "'Merriweather', serif" }}
            >
              Our Core{" "}
              <span className="bg-gradient-to-r from-[#028090] to-[#02C39A] bg-clip-text text-transparent">
                Values
              </span>
            </h2>
            <p 
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: "'Merriweather', serif" }}
            >
              The principles that guide everything we do and shape our
              commitment to excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {coreValues.map((value, index) => (
              <div
                key={index}
                data-animate
                id={`value-${index}`}
                className={`group cursor-pointer transform transition-all duration-700 ${
                  isVisible[`value-${index}`]
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
                onMouseEnter={() => setActiveValue(index)}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-[#F0F3BD]/30 group-hover:border-[#02C39A]/50 h-full">
                  <div
                    className={`w-20 h-20 bg-gradient-to-br ${value.color} rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl`}
                  >
                    <value.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 
                    className="text-2xl font-bold text-[#05668D] mb-4 group-hover:text-[#028090] transition-colors"
                    style={{ fontFamily: "'Merriweather', serif" }}
                  >
                    {value.title}
                  </h3>
                  <p 
                    className="text-gray-600 leading-relaxed"
                    style={{ fontFamily: "'Merriweather', serif" }}
                  >
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section - Refined */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 
              className="text-5xl md:text-6xl font-bold mb-8"
              style={{ fontFamily: "'Merriweather', serif" }}
            >
              Meet the{" "}
              <span className="bg-gradient-to-r from-[#00A896] to-[#05668D] bg-clip-text text-transparent">
                Team
              </span>
            </h2>
            <p 
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: "'Merriweather', serif" }}
            >
              The passionate individuals driving innovation and excellence at
              ORDERZHOUSE.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            {team.map((member, index) => (
              <div
                key={index}
                data-animate
                id={`team-${index}`}
                className={`group text-center transform transition-all duration-1000 ${
                  isVisible[`team-${index}`]
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative mb-10">
                  <div className="absolute -inset-4 bg-gradient-to-br from-[#05668D]/30 to-[#02C39A]/20 rounded-full opacity-40 group-hover:opacity-60 transition-all duration-500 blur-2xl"></div>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="relative w-56 h-56 rounded-full mx-auto object-cover shadow-2xl group-hover:scale-105 transition-transform duration-500 border-4 border-white"
                  />
                </div>
                <h3 
                  className="text-3xl font-bold text-[#05668D] mb-3"
                  style={{ fontFamily: "'Merriweather', serif" }}
                >
                  {member.name}
                </h3>
                <p 
                  className="text-xl font-semibold bg-gradient-to-r from-[#028090] to-[#02C39A] bg-clip-text text-transparent mb-6"
                  style={{ fontFamily: "'Merriweather', serif" }}
                >
                  {member.role}
                </p>
                <p 
                  className="text-gray-600 mb-8 text-lg"
                  style={{ fontFamily: "'Merriweather', serif" }}
                >
                  {member.bio}
                </p>

                <div className="flex justify-center space-x-4">
                  {Object.entries(member.social).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      className="w-14 h-14 bg-gradient-to-br from-[#F0F3BD]/50 to-[#02C39A]/30 hover:from-[#05668D] hover:to-[#028090] rounded-2xl flex items-center justify-center text-[#05668D] hover:text-white transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm border border-white/50"
                    >
                      <Users className="w-6 h-6" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Improved Flow */}
      <section className="py-32 relative overflow-hidden">
        {/* Flowing background */}
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chooseUsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#05668D" stopOpacity="0.05" />
                <stop offset="50%" stopColor="#F0F3BD" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#02C39A" stopOpacity="0.08" />
              </linearGradient>
            </defs>
            <path
              fill="url(#chooseUsGradient)"
              d="M0,400 C360,300 720,500 1080,400 C1260,350 1350,375 1440,400 L1440,800 L0,800 Z"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0;-30,0;0,0"
                dur="35s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 
              className="text-5xl md:text-6xl font-bold mb-8"
              style={{ fontFamily: "'Merriweather', serif" }}
            >
              Why{" "}
              <span className="bg-gradient-to-r from-[#05668D] to-[#02C39A] bg-clip-text text-transparent">
                ORDERZHOUSE?
              </span>
            </h2>
            <p 
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: "'Merriweather', serif" }}
            >
              We don't just connect — we cultivate long-term collaborations
              through innovation and trust.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                data-animate
                id={`feature-${index}`}
                className={`group transform transition-all duration-700 ${
                  isVisible[`feature-${index}`]
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 border border-[#F0F3BD]/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group-hover:border-[#02C39A]/50 h-full">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#00A896] to-[#02C39A] rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 
                        className="text-2xl font-bold text-[#05668D] mb-4 group-hover:text-[#028090] transition-colors"
                        style={{ fontFamily: "'Merriweather', serif" }}
                      >
                        {item.title}
                      </h3>
                      <p 
                        className="text-gray-600 text-lg"
                        style={{ fontFamily: "'Merriweather', serif" }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-32 relative overflow-hidden">
          {/* Dramatic background with flowing gradients */}
          <div className="absolute inset-0">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ctaGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#05668D" stopOpacity="0.9" />
                  <stop offset="30%" stopColor="#028090" stopOpacity="0.85" />
                  <stop offset="70%" stopColor="#00A896" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#02C39A" stopOpacity="0.75" />
                </linearGradient>
                <radialGradient id="ctaRadial" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#F0F3BD" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#02C39A" stopOpacity="0.1" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#ctaGradient1)" />
              <circle cx="30%" cy="40%" r="300" fill="url(#ctaRadial)">
                <animate attributeName="r" values="300;350;300" dur="20s" repeatCount="indefinite" />
              </circle>
              <circle cx="70%" cy="60%" r="250" fill="url(#ctaRadial)">
                <animate attributeName="r" values="250;300;250" dur="25s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center text-white">
              <h2 
                className="text-5xl md:text-6xl font-bold mb-8"
                style={{ fontFamily: "'Merriweather', serif" }}
              >
                Ready to Shape the Future?
              </h2>
              <p 
                className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
                style={{ fontFamily: "'Merriweather', serif" }}
              >
                Join ORDERZHOUSE and be part of the future of freelancing.
                Connect with top talent or showcase your skills to global
                clients.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button className="px-12 py-5 bg-white text-[#05668D] font-bold rounded-2xl hover:bg-[#F0F3BD] transition-all duration-300 hover:scale-105 shadow-2xl border-2 border-white/20 backdrop-blur-sm">
                  <span 
                    className="text-lg"
                    style={{ fontFamily: "'Merriweather', serif" }}
                  >
                    Get Started
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section - Enhanced */}
      <section className="py-32 relative overflow-hidden">
        {/* Background with organic flow */}
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none">
            <defs>
              <linearGradient id="categoriesGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F0F3BD" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#02C39A" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#F0F3BD" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              fill="url(#categoriesGradient)"
              d="M0,200 C300,100 600,300 900,200 C1200,100 1440,150 1440,200 L1440,800 L0,800 Z"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0;40,0;0,0"
                dur="40s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 
                className="text-5xl md:text-6xl font-bold mb-8 leading-tight"
                style={{ fontFamily: "'Merriweather', serif" }}
              >
                Explore with our <br />
                Versatile{" "}
                <span className="bg-gradient-to-r from-[#028090] to-[#02C39A] bg-clip-text text-transparent">
                  Categories
                </span>
              </h2>

              <p 
                className="text-xl text-gray-600 leading-relaxed mb-10"
                style={{ fontFamily: "'Merriweather', serif" }}
              >
                Shortlist and hire with confidence. Streamline your hiring
                process by evaluating candidates holistically. Get a detailed
                and complete platform for making your intelligent decisions.
              </p>

              <button className="group px-10 py-5 bg-gradient-to-r from-[#028090] to-[#02C39A] text-white font-bold rounded-2xl hover:from-[#05668D] hover:to-[#028090] transition-all duration-300 hover:scale-105 shadow-xl flex items-center space-x-3">
                <span 
                  className="text-lg"
                  style={{ fontFamily: "'Merriweather', serif" }}
                >
                  SHOW ALL
                </span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="relative group">
              <div className="absolute -inset-6 bg-gradient-to-r from-[#028090]/20 to-[#02C39A]/20 rounded-3xl opacity-60 blur-2xl group-hover:opacity-80 transition-all duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-[#F0F3BD]/50 group-hover:shadow-3xl transition-all duration-500">
                <div className="grid grid-cols-3 gap-8">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-gradient-to-br from-[#F0F3BD]/30 to-[#02C39A]/20 rounded-3xl flex items-center justify-center hover:scale-110 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl border border-white/30"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-[#05668D] to-[#028090] rounded-2xl shadow-lg"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}