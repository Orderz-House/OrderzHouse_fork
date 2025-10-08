import { Users, Briefcase, Handshake } from "lucide-react";

import HeroSection from './sections/Hero';
import Categories from './sections/Categories';
import Faq from './sections/Faq';

// Image imports
import communityImg from "../../assets/community.jpg";

export default function OrderzHousePageRedesign() {
  const handleSearch = (q) => console.log(q);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Merriweather', serif" }}>
      {/* Hero Section */}
      <HeroSection onSearch={handleSearch}/>

      {/* Categories Section */}
      <Categories />

      {/* Community Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full min-w-full min-h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs><linearGradient id="communityGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F0F3BD" stopOpacity="0.8" /><stop offset="50%" stopColor="#F0F3BD" stopOpacity="0.6" /><stop offset="100%" stopColor="#F0F3BD" stopOpacity="0.4" /></linearGradient></defs>
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
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#05668D] mb-4 sm:mb-6 leading-tight">Join Our <span className="block text-[#028090]">Community</span></h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed px-4">Connect with talented professionals, collaborate on exciting projects, and build lasting relationships in our thriving freelance ecosystem.</p>
              </div>
              <div className="mt-8 sm:mt-10 md:mt-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto items-start lg:items-center">
                  <div className="text-center sm:text-left space-y-6 sm:space-y-8 order-1 lg:order-1">
                    <div>
                      <div className="mb-3 sm:mb-4 flex justify-center sm:justify-start"><Users className="w-10 h-10 sm:w-12 sm:h-12 text-[#02C39A]" /></div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#05668D] mb-3 sm:mb-4">Freelancer</h3>
                      <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">Apply for positions as a freelancer and take control of your career</p>
                    </div>
                    <div>
                      <div className="mb-3 sm:mb-4 flex justify-center sm:justify-start"><Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-[#02C39A]" /></div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#05668D] mb-3 sm:mb-4">Client</h3>
                      <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">Order the project you need and build your dream team</p>
                    </div>
                  </div>
                  <div className="lg:col-span-2 flex justify-center order-3 sm:order-2 lg:order-2">
                    <img src={communityImg} alt="Community" className="w-64 sm:w-72 md:w-80 lg:w-96 xl:w-[28rem] h-auto object-contain" />
                  </div>
                  <div className="text-center sm:text-left space-y-6 sm:space-y-8 order-2 sm:order-3 lg:order-3">
                    <div>
                      <div className="mb-3 sm:mb-4 flex justify-center sm:justify-start lg:justify-end"><Handshake className="w-10 h-10 sm:w-12 sm:h-12 text-[#02C39A]" /></div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#05668D] mb-3 sm:mb-4 lg:text-right">Customer Success</h3>
                      <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base lg:text-right">Collaborate and achieve success together</p>
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

      {/* FAQ Section */}
      <Faq />
    </div>
  );
}
