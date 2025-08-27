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
import { Link } from "react-router";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPlans } from "../../slice/planSlice";

export default function OrderzHousePage() {
  const [activePlan, setActivePlan] = useState("basic");
  const dispatch = useDispatch();
  const { plans } = useSelector((state) => {
    return {
      plans: state.plan.plans,
    };
  });
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

  const categories = [
    {
      title: "Programming",
      description: "Software Developer, Data Analyst, Network Engineer",
      icon: "💻",
    },
    {
      title: "Photographer",
      description:
        "Photography is the art of capturing moments, emotions, and stories through the lens to create lasting visual impressions.",
      icon: "📷",
    },
    {
      title: "Admin + Project Management",
      description:
        "Administrative Assistant, Project Manager, and Process Analyst",
      icon: "📊",
    },
    {
      title: "Music & Audio",
      description: "Sound Engineer, Music Producer, Audio Editor",
      icon: "🎵",
    },
    {
      title: "Graphic Design",
      description:
        "Graphic design is the art of visual communication that combines images, typography, and creativity to deliver impactful messages.",
      icon: "🎨",
    },
    {
      title: "Remote Work",
      description: "Customer Service Representative, Financial Analyst",
      icon: "🏠",
    },
    {
      title: "Content Creator",
      description:
        "A content writer creates clear, engaging, and informative text tailored to attract and inform a specific audience.",
      icon: "✏️",
    },
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
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600/5 to-purple-600/5">
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
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
              Explore the talent pool
            </button>
            <button className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-300">
              Post a New Project
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            OUR CATEGORIES
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold mb-3">{category.title}</h3>
                <p className="text-gray-600">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work With The Best */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Work With The Best
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Meet the top brands and professionals who trust our platform for
            their projects.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mb-16">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="w-32 h-32 bg-white rounded-2xl shadow-md flex items-center justify-center"
              >
                <div className="text-2xl font-bold text-gray-400">
                  Brand {item}
                </div>
              </div>
            ))}
          </div>

          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center mx-auto">
            <span>Sign in</span>
          </button>
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
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">👔</div>
              <h3 className="text-2xl font-bold mb-4">Employer</h3>
              <p className="text-gray-600">
                Hire key staff as an employer and build your dream team
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-2xl font-bold mb-4">Community</h3>
              <p className="text-gray-600">
                Collaborate as a community and achieve more together
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Best Plans to Go With
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Enter a realm of limitless possibilities, where extraordinary talent
            thrives and beckons you to unfold your boundless potential.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-8 shadow-lg border-2 ${
                  activePlan === plan.id ? "border-blue-500" : "border-gray-200"
                } transition-all duration-300 cursor-pointer`}
                onClick={() => setActivePlan(plan.id)}
              >
                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <div className="text-3xl font-bold text-blue-600 mb-6">
                  ${parseFloat(plan.price).toFixed(2)}
                </div>
                <p className="text-gray-600 mb-6">
                  Duration: {plan.duration} Days
                </p>
                <p className="mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features?.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors duration-300">
                  Get Started
                </button>
              </div>
            ))}
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
            {" "}
            <Link
              to="https://studyzhouse.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Get Started</span>{" "}
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

                <button className="w-full mt-6 py-2 bg-gray-100 text-gray-800 font-medium rounded-xl hover:bg-gray-200 transition-colors duration-300">
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
              <Link to="/ask-more"> Ask More</Link>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
