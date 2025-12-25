import { useState, useEffect } from "react";
import {
  Users,
  Target,
  Heart,
  Zap,
  Shield,
  Award,
  CheckCircle,
  Lightbulb,
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

  // ✅ Theme: soft orange + nahdi(mint) — no blues
  const coreValues = [
    {
      icon: Award,
      title: "Excellence in Service",
      description:
        "We strive for perfection in every project, delivering results that exceed expectations.",
      color: "from-orange-500 to-rose-500",
    },
    {
      icon: Shield,
      title: "Transparency and Trust",
      description:
        "Building lasting relationships through honest communication and reliable partnerships.",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: Zap,
      title: "Empowering Innovation",
      description:
        "Fostering creativity and cutting-edge solutions that drive business growth.",
      color: " from-violet-500 to-indigo-600",
    },
    {
      icon: Heart,
      title: "Human-Centric Technology",
      description:
        "Technology that serves people, not the other way around - putting humanity first.",
      color: " from-violet-500 to-indigo-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* ✅ Soft background like Contact */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/70 via-white to-emerald-50/50" />
        <div className="pointer-events-none absolute -top-28 left-[-80px] h-[360px] w-[360px] rounded-full bg-yellow-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -top-28 right-[-90px] h-[380px] w-[380px] rounded-full bg-orange-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-140px] left-[12%] h-[360px] w-[360px] rounded-full bg-emerald-300/18 blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-slate-900"
            style={{ fontFamily: "'Merriweather', serif" }}
          >
            About{" "}
            <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent">
              ORDERZHOUSE
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl md:text-l text-slate-600 max-w-4xl mx-auto leading-relaxed mb-12"
            style={{ fontFamily: "'Merriweather', serif" }}
          >
            ORDERZHOUSE is your go-to platform for freelancing success. We make
            it simple for talented freelancers to find great projects and for
            businesses to hire the right people. Think of us as the bridge that
            connects skills with opportunities, making work easier and more
            rewarding for everyone involved.
          </p>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-20 sm:py-32 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div
              data-animate
              id="mission"
              className={`transform transition-all duration-1000 ${
                isVisible["mission"]
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-12 opacity-0"
              }`}
            >
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-slate-900"
                style={{ fontFamily: "'Merriweather', serif" }}
              >
                Our{" "}
                <span className="bg-gradient-to-r from-orange-600 to-rose-500 bg-clip-text text-transparent">
                  Mission
                </span>
              </h2>

              <p
                className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8"
                style={{ fontFamily: "'Merriweather', serif" }}
              >
                To empower freelancers and businesses through seamless, secure,
                and smart collaborations that drive success and innovation
                across the globe.
              </p>

              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-100/70 to-emerald-100/50 rounded-2xl border border-orange-100/60">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-[0_12px_30px_rgba(249,115,22,0.20)]">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span
                  className="text-slate-700 font-semibold"
                  style={{ fontFamily: "'Merriweather', serif" }}
                >
                  Focused on Excellence
                </span>
              </div>
            </div>

            <div
              data-animate
              id="vision"
              className={`transform transition-all duration-1000 ${
                isVisible["vision"]
                  ? "translate-x-0 opacity-100"
                  : "translate-x-12 opacity-0"
              }`}
            >
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-slate-900"
                style={{ fontFamily: "'Merriweather', serif" }}
              >
                Our{" "}
                <span className="bg-gradient-to-b from-violet-500 to-indigo-600 bg-clip-text text-transparent">
                  Vision
                </span>
              </h2>

              <p
                className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8"
                style={{ fontFamily: "'Merriweather', serif" }}
              >
                To be the global leader in freelance innovation, shaping the
                future of remote work and creating a world where talent knows no
                boundaries.
              </p>

              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-100/55 to-orange-100/45 rounded-2xl border border-orange-100/50">
                <div className="w-12 h-12 bg-gradient-to-b from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_12px_30px_rgba(16,185,129,0.16)]">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <span
                  className="text-slate-700 font-semibold"
                  style={{ fontFamily: "'Merriweather', serif" }}
                >
                  Innovation Driven
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 sm:py-32 relative bg-gradient-to-br from-orange-50/60 to-emerald-50/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-slate-900"
              style={{ fontFamily: "'Merriweather', serif" }}
            >
              Our Core{" "}
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Values
              </span>
            </h2>

            <p
              className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto"
              style={{ fontFamily: "'Merriweather', serif" }}
            >
              The principles that guide everything we do and shape our
              commitment to excellence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {coreValues.map((value, index) => (
              <div
                key={index}
                data-animate
                id={`value-${index}`}
                className={`group transform transition-all duration-700 ${
                  isVisible[`value-${index}`]
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)] hover:shadow-[0_28px_80px_rgba(15,23,42,0.10)] transition-all duration-300 hover:-translate-y-2 border border-orange-100/60 h-full">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <value.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3
                    className="text-xl font-bold text-slate-800 mb-3"
                    style={{ fontFamily: "'Merriweather', serif" }}
                  >
                    {value.title}
                  </h3>

                  <p
                    className="text-slate-600 text-sm leading-relaxed"
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

      {/* How We Work */}
      <section className="py-20 sm:py-32 relative">
        {/* soft glows */}
        <div className="pointer-events-none absolute -top-24 left-[6%] h-[300px] w-[300px] rounded-full bg-orange-300/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-[8%] h-[320px] w-[320px] rounded-full bg-emerald-300/14 blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-slate-900"
              style={{ fontFamily: "'Merriweather', serif" }}
            >
              How We{" "}
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Work
              </span>
            </h2>

            <p
              className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto"
              style={{ fontFamily: "'Merriweather', serif" }}
            >
              Our simple 4-step process that connects talent with opportunity
              seamlessly.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-4 sm:left-1/2 transform sm:-translate-x-0.5 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 via-amber-500 to-violet-500 rounded-full" />

            <div className="space-y-12 sm:space-y-16">
              {[
                {
                  step: "1",
                  title: "Freelancer Subscribe",
                  desc: "Join our platform and create your professional profile to showcase your skills.",
                  icon: Users,
                  color: "from-orange-500 to-rose-500",
                },
                {
                  step: "2",
                  title: "Get Work",
                  desc: "Browse available projects that match your skills and submit proposals.",
                  icon: Target,
                  color: "from-amber-500 to-orange-600",
                },
                {
                  step: "3",
                  title: "Submit the Work",
                  desc: "Complete the project and deliver high-quality work on time.",
                  icon: CheckCircle,
                  color: "from-violet-500 to-indigo-600",
                },
                {
                  step: "4",
                  title: "Earn Money",
                  desc: "Get paid securely once the client approves your completed work.",
                  icon: Award,
                  color: "from-violet-500 to-indigo-600",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  data-animate
                  id={`work-${index}`}
                  className={`relative transform transition-all duration-1000 ${
                    isVisible[`work-${index}`]
                      ? "translate-y-0 opacity-100"
                      : "translate-y-12 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 300}ms` }}
                >
                  <div
                    className={`flex items-center ${
                      index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                    }`}
                  >
                    <div className="absolute left-0 sm:left-1/2 transform sm:-translate-x-1/2 flex items-center justify-center">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-full shadow-xl flex items-center justify-center border-4 border-white`}
                      >
                        <span
                          className="text-white font-bold text-sm"
                          style={{ fontFamily: "'Merriweather', serif" }}
                        >
                          {item.step}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-full sm:w-5/12 ${
                        index % 2 === 0
                          ? "sm:text-right sm:pr-10"
                          : "sm:pl-10"
                      } ml-20 sm:ml-0`}
                    >
                      <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-[0_25px_70px_rgba(15,23,42,0.08)] border border-orange-100/60 hover:shadow-[0_30px_90px_rgba(15,23,42,0.10)] transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-[0.06] group-hover:opacity-[0.10] transition-opacity duration-500`}
                        />

                        <div className="relative z-10">
                          <div
                            className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                          >
                            <item.icon className="w-6 h-6 text-white" />
                          </div>

                          <h3
                            className="text-lg font-bold text-slate-800 mb-3 group-hover:text-orange-700 transition-colors"
                            style={{ fontFamily: "'Merriweather', serif" }}
                          >
                            {item.title}
                          </h3>

                          <p
                            className="text-slate-600 leading-relaxed text-sm"
                            style={{ fontFamily: "'Merriweather', serif" }}
                          >
                            {item.desc}
                          </p>
                        </div>

                        <div
                          className={`absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br ${item.color} rounded-full animate-pulse`}
                        />
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
