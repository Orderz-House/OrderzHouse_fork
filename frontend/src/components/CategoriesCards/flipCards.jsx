import React from "react";
import graphicDesignImg from "../../assets/graphic.jpg";
import contentWritingImg from "../../assets/writing.jpg";
import programmingImg from "../../assets/programming.jpg";
import photographyImg from "../../assets/camera.jpg";
import voiceAudioImg from "../../assets/voiceover.jpg";

const categories = [
  {
    id: 1,
    name: "Graphic Design",
    description:
      "Crafting visual content that communicates ideas and captivates audiences.",
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

const CategoriesFlipCards = () => {
  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 bg-white"
      style={{ fontFamily: "Merriweather, serif" }}
    >
      {/* Section Title */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#028090" }}>
          Our Categories
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
          Discover our wide range of professional categories and find the perfect services to meet your needs.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flip-card w-64 h-64 mx-auto cursor-pointer rounded-full shadow-2xl border-2 border-[#00A896] transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,168,150,0.6)]"
            style={{ backgroundColor: "#F0F3BD" }}
          >
            <div className="flip-card-inner relative w-full h-full rounded-full">
              
              {/* Front */}
              <div className="flip-card-front absolute w-full h-full rounded-full overflow-hidden shadow-lg">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full"
                />
                {/* Full white semi-transparent overlay */}
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full">
                  <h3 className="text-black text-xl font-bold text-center px-4">
                    {cat.name}
                  </h3>
                </div>
              </div>

              {/* Back */}
              <div className="flip-card-back absolute w-full h-full rounded-full bg-white p-6 shadow-lg flex items-center justify-center text-center border-2 border-[#00A896]">
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <h3 className="text-[#028090] text-lg font-bold mb-3">{cat.name}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{cat.description}</p>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Flip Animation */}
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
      `}</style>
    </section>
  );
};

export default CategoriesFlipCards;
