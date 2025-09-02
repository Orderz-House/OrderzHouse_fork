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
import { useNavigate } from "react-router-dom";
import { Link } from "react-router";
import { useSelector } from "react-redux";

export default function ModernAboutPage() {
  const [activeValue, setActiveValue] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const { isLoggedIn } = useSelector((state) => {
    return {
      isLoggedIn: state.auth.isLoggedIn,
    };
  });

  const navigate = useNavigate();

  const handleFreelancers = () => {
    navigate("/freelancers");
  };
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
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Transparency and Trust",
      description:
        "Building lasting relationships through honest communication and reliable partnerships.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Zap,
      title: "Empowering Innovation",
      description:
        "Fostering creativity and cutting-edge solutions that drive business growth.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Heart,
      title: "Human-Centric Technology",
      description:
        "Technology that serves people, not the other way around - putting humanity first.",
      color: "from-orange-500 to-red-500",
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
        "https://media.istockphoto.com/id/1444536152/photo/portrait-of-happy-business-woman-sitting-in-the-office.jpg?s=612x612&w=0&k=20&c=6u2lrNGkLBn8awKprEN5ccfMeOYKDMRXpAqSL6gwuC4=",
      bio: "Strategic marketing expert driving brand growth",
      social: { linkedin: "#", twitter: "#" },
    },
    {
      name: "Marlon Zain",
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
      desc: "Ensuring confidentiality and security in every transaction.",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-teal-600/5"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8">
              About{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                ORDERZHOUSE
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              We're redefining the future of freelancing by connecting
              visionaries with exceptional talent, where creativity meets
              reliability to build a distinguished future.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  data-animate
                  id={`stat-${index}`}
                  className={`text-center transform transition-all duration-700 ${
                    isVisible[`stat-${index}`]
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div
              data-animate
              id="who-we-are"
              className={`transform transition-all duration-700 ${
                isVisible["who-we-are"]
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-8 opacity-0"
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Who{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  We Are
                </span>
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                ORDERZHOUSE is a curated freelance marketplace connecting
                brilliant minds with bold ideas. We're more than just a platform
                — we're a movement reshaping the future of independent work.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Our Mission
                    </h3>
                    <p className="text-gray-600">
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
              className={`transform transition-all duration-700 ${
                isVisible["team-image"]
                  ? "translate-x-0 opacity-100"
                  : "translate-x-8 opacity-0"
              }`}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-20 blur-xl"></div>
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                  alt="Team collaboration"
                  className="relative w-full rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Our Core{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Values
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and shape our
              commitment to excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <div
                key={index}
                data-animate
                id={`value-${index}`}
                className={`group cursor-pointer transform transition-all duration-700 ${
                  isVisible[`value-${index}`]
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setActiveValue(index)}
              >
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Meet the{" "}
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Team
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals driving innovation and excellence at
              ORDERZHOUSE.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {team.map((member, index) => (
              <div
                key={index}
                data-animate
                id={`team-${index}`}
                className={`group text-center transform transition-all duration-700 ${
                  isVisible[`team-${index}`]
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="relative mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur-xl"></div>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="relative w-48 h-48 rounded-full mx-auto object-cover shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 mb-6">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Why{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ORDERZHOUSE?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We don't just connect — we cultivate long-term collaborations
              through innovation and trust.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                data-animate
                id={`feature-${index}`}
                className={`group transform transition-all duration-700 ${
                  isVisible[`feature-${index}`]
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isLoggedIn ? (
        <></>
      ) : (
        <>
          <section className="py-20 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-12 lg:p-20 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.3),transparent_70%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.3),transparent_70%)]"></div>

                <div className="relative z-10">
                  <h2 className="text-4xl md:text-5xl font-bold mb-8">
                    Ready to Shape the Future?
                  </h2>
                  <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                    Join ORDERZHOUSE and be part of the future of freelancing.
                    Connect with top talent or showcase your skills to global
                    clients.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    {" "}
                    <Link to="/login">
                      {" "}
                      <button className="px-10 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-xl">
                        Get Started
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Categories Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Explore with our <br />
                Versatile{" "}
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Categories
                </span>
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Shortlist and hire with confidence. Streamline your hiring
                process by evaluating candidates holistically. Get a detailed
                and complete platform for making your intelligent decisions.
              </p>

              <button
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-105 shadow-xl flex items-center space-x-3"
                onClick={() => {
                  handleFreelancers();
                }}
              >
                <span>SHOW ALL</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-3xl opacity-20 blur-2xl"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30">
                <div className="grid grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform duration-300 cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
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
