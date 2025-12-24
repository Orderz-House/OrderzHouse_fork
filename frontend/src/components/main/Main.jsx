import { Users, Briefcase, Handshake } from "lucide-react";

import HeroSection from './sections/Hero';
import Categories from './sections/Categories';
import Faq from './sections/Faq';
import LogoGrid from './sections/logoGrid'; 
import JoinCommunity from './sections/JoinCommunity'; 


export default function OrderzHousePageRedesign() {
  const handleSearch = (q) => console.log(q);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Merriweather', serif" }}>
      {/* Hero Section */}
      <HeroSection onSearch={handleSearch} />
      

      {/* Categories Section */}
      <Categories />

      {/* Community Section */}
      <JoinCommunity />
      {/* FAQ Section */}
      <Faq />

      {/* ✅ LogoGrid Section */}
      <LogoGrid />
    </div>
  );
}
