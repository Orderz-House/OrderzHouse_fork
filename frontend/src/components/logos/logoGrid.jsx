import React from "react";
import img1 from "../../assets/Battach.jpg";
import img2 from "../../assets/Bildazo.jpg";
import img3 from "../../assets/studyzhouse.png";

const LogoGrid = () => {
  const logos = [
    { src: img1, alt: "Battach" },
    { src: img2, alt: "Bildazo" },
    { src: img3, alt: "StudyzHouse" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {logos.map((logo, index) => (
          <div
            key={index}
            className="group relative flex items-center justify-center"
          >
            <img
              src={logo.src}
              alt={logo.alt}
              className="w-full h-auto object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white font-semibold">{logo.alt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogoGrid;
