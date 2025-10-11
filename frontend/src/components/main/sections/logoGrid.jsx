import React from "react";
import img1 from "../../../assets/Battech.png";
import img2 from "../../../assets/Bildazo.png";
import img3 from "../../../assets/studyzhouse.png";
import img4 from "../../../assets/Fazaat.png";

const LogoGrid = () => {
  return (
    <footer className="relative bg-gradient-to-r from-[#05668D] via-[#028090] to-[#00A896] text-white py-8 sm:py-12">
      {/* Wave SVG Divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-16 sm:h-20"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            fill="white"
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
          />
        </svg>
      </div>

      {/* Logo Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 text-center">
        <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-14 md:gap-20">
          {[img1, img2, img3, img4].map((img, index) => (
            <div key={index} className="flex items-center justify-center">
              <img
                src={img}
                alt={`Logo ${index + 1}`}
                className={`w-auto filter brightness-0 invert opacity-90 hover:opacity-100 transition-all duration-300 ${
                  index === 2
                    ? "h-40 sm:h-44 md:h-48 lg:h-52 xl:h-56"
                    : "h-28 sm:h-32 md:h-36 lg:h-40"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default LogoGrid;
