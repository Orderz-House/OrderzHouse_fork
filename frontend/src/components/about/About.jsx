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
  Mail,
  Phone,
  Eye,
  Lightbulb,
  MapPin,
} from "lucide-react";
export default function ModernAboutPageRedesign() {
  const [activeValue, setActiveValue] = useState(0);
  const [isVisible, setIsVisible] = useState({});

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
      description: "We strive for perfection in every project, delivering results that exceed expectations.",
      color: "from-[#05668D] to-[#028090]",
    },
    {
      icon: Shield,
      title: "Transparency and Trust",
      description: "Building lasting relationships through honest communication and reliable partnerships.",
      color: "from-[#028090] to-[#00A896]",
    },
    {
      icon: Zap,
      title: "Empowering Innovation",
      description: "Fostering creativity and cutting-edge solutions that drive business growth.",
      color: "from-[#00A896] to-[#02C39A]",
    },
    {
      icon: Heart,
      title: "Human-Centric Technology",
      description: "Technology that serves people, not the other way around - putting humanity first.",
      color: "from-[#02C39A] to-[#F0F3BD]",
    },
  ];

 
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F0F3BD]/10 via-white to-[#02C39A]/5"></div>
        
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-[#F0F3BD]/20 to-[#02C39A]/10 blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-[#05668D]/10 to-[#028090]/20 blur-2xl"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight" style={{ fontFamily: "'Merriweather', serif" }}>
            About{" "}
            <span className="bg-gradient-to-r from-[#05668D] via-[#028090] to-[#00A896] bg-clip-text text-transparent">
              ORDERZHOUSE
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-l text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12" style={{ fontFamily: "'Merriweather', serif" }}>
            ORDERZHOUSE is your go-to platform for freelancing success. We make it simple for talented freelancers to find great projects and for businesses to hire the right people. Think of us as the bridge that connects skills with opportunities, making work easier and more rewarding for everyone involved.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-32 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div data-animate id="mission" className={`transform transition-all duration-1000 ${isVisible["mission"] ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Merriweather', serif" }}>
                Our{" "}
                <span className="bg-gradient-to-r from-[#05668D] to-[#028090] bg-clip-text text-transparent">
                  Mission
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8" style={{ fontFamily: "'Merriweather', serif" }}>
                To empower freelancers and businesses through seamless, secure, and smart collaborations that drive success and innovation across the globe.
              </p>
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-[#F0F3BD]/20 to-[#02C39A]/10 rounded-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-[#05668D] to-[#028090] rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="text-gray-700 font-semibold" style={{ fontFamily: "'Merriweather', serif" }}>
                  Focused on Excellence
                </span>
              </div>
            </div>

            <div data-animate id="vision" className={`transform transition-all duration-1000 ${isVisible["vision"] ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Merriweather', serif" }}>
                Our{" "}
                <span className="bg-gradient-to-r from-[#028090] to-[#02C39A] bg-clip-text text-transparent">
                  Vision
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8" style={{ fontFamily: "'Merriweather', serif" }}>
                To be the global leader in freelance innovation, shaping the future of remote work and creating a world where talent knows no boundaries.
              </p>
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-[#02C39A]/10 to-[#F0F3BD]/20 rounded-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00A896] to-[#02C39A] rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <span className="text-gray-700 font-semibold" style={{ fontFamily: "'Merriweather', serif" }}>
                  Innovation Driven
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-32 relative bg-gradient-to-br from-[#F0F3BD]/5 to-[#02C39A]/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Merriweather', serif" }}>
              Our Core{" "}
              <span className="bg-gradient-to-r from-[#028090] to-[#02C39A] bg-clip-text text-transparent">
                Values
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: "'Merriweather', serif" }}>
              The principles that guide everything we do and shape our commitment to excellence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {coreValues.map((value, index) => (
              <div key={index} data-animate id={`value-${index}`} className={`group transform transition-all duration-700 ${isVisible[`value-${index}`] ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`} style={{ transitionDelay: `${index * 200}ms` }}>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-[#F0F3BD]/20 h-full">
                  <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-3" style={{ fontFamily: "'Merriweather', serif" }}>
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed" style={{ fontFamily: "'Merriweather', serif" }}>
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-32 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Merriweather', serif" }}>
              How We{" "}
              <span className="bg-gradient-to-r from-[#05668D] to-[#02C39A] bg-clip-text text-transparent">
                Work
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto" style={{ fontFamily: "'Merriweather', serif" }}>
              Our simple 4-step process that connects talent with opportunity seamlessly.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-4 sm:left-1/2 transform sm:-translate-x-0.5 top-0 bottom-0 w-1 bg-gradient-to-b from-[#05668D] via-[#028090] to-[#02C39A] rounded-full"></div>
            
            <div className="space-y-12 sm:space-y-16">
              {[
                {
                  step: "1",
                  title: "Freelancer Subscribe",
                  desc: "Join our platform and create your professional profile to showcase your skills.",
                  icon: Users,
                  color: "from-[#05668D] to-[#028090]"
                },
                {
                  step: "2", 
                  title: "Get Work",
                  desc: "Browse available projects that match your skills and submit proposals.",
                  icon: Target,
                  color: "from-[#028090] to-[#00A896]"
                },
                {
                  step: "3",
                  title: "Submit the Work", 
                  desc: "Complete the project and deliver high-quality work on time.",
                  icon: CheckCircle,
                  color: "from-[#00A896] to-[#02C39A]"
                },
                {
                  step: "4",
                  title: "Earn Money",
                  desc: "Get paid securely once the client approves your completed work.",
                  icon: Award,
                  color: "from-[#02C39A] to-[#F0F3BD]"
                }
              ].map((item, index) => (
                <div key={index} data-animate id={`work-${index}`} className={`relative transform transition-all duration-1000 ${isVisible[`work-${index}`] ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`} style={{ transitionDelay: `${index * 300}ms` }}>
                  <div className={`flex items-center ${index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                    <div className="absolute left-0 sm:left-1/2 transform sm:-translate-x-1/2 flex items-center justify-center">
                      <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-full shadow-xl flex items-center justify-center border-4 border-white`}>
                        <span className="text-white font-bold text-sm" style={{ fontFamily: "'Merriweather', serif" }}>
                          {item.step}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`w-full sm:w-5/12 ${index % 2 === 0 ? 'sm:text-right sm:pr-10' : 'sm:pl-10'} ml-20 sm:ml-0`}>
                      <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#F0F3BD]/30 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
                        
                        <div className="relative z-10">
                          <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-700 mb-3 group-hover:text-[#028090] transition-colors" style={{ fontFamily: "'Merriweather', serif" }}>
                            {item.title}
                          </h3>
                          
                          <p className="text-gray-600 leading-relaxed text-sm" style={{ fontFamily: "'Merriweather', serif" }}>
                            {item.desc}
                          </p>
                        </div>
                        
                        <div className={`absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br ${item.color} rounded-full animate-pulse`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}