import React from "react";
import img1 from "../../../assets/Battech.png";
import img2 from "../../../assets/Bildazo.png";
import img3 from "../../../assets/studyzhouse.png";
import img4 from "../../../assets/Fazaat.png";

const LogoGrid = () => {
  return (
    <footer
      className="relative overflow-hidden py-8 sm:py-12"
      style={{
        backgroundImage: `
          radial-gradient(900px 420px at 10% -10%, rgba(237,233,254,0.9), transparent 55%),
          radial-gradient(900px 420px at 90% 0%, rgba(255,237,213,0.85), transparent 55%),
          radial-gradient(700px 360px at 70% 120%, rgba(255,228,230,0.55), transparent 55%),
          linear-gradient(90deg, #EDE9FE 0%, #FFFFFF 45%, #FFEDD5 100%)
        `,
      }}
    >
      {/* Top wave */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block h-16 w-full sm:h-20"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            fill="#FFFFFF"
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
          />
        </svg>
      </div>

      {/* Soft overlay (اختياري لطراوة أكثر) */}
      <div className="pointer-events-none absolute inset-0 bg-white/35" />

      {/* Logo Grid */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-12 text-center sm:px-6 sm:pt-16 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-14 md:gap-20">
          {[img1, img2, img3, img4].map((img, index) => (
            <div key={index} className="flex items-center justify-center">
              <img
                src={img}
                alt={`Logo ${index + 1}`}
                className={`w-auto opacity-90 transition-all duration-300 hover:opacity-100 ${
                  index === 2
                    ? "h-40 sm:h-44 md:h-48 lg:h-52 xl:h-56"
                    : "h-28 sm:h-32 md:h-36 lg:h-40"
                }`}
                // لو كانت لوجوهاتك فاتحة وتحتاج تباين على الخلفية الفاتحة:
                // style={{ filter: "drop-shadow(0 10px 30px rgba(17,24,39,0.08))" }}
              />
            </div>
          ))}
        </div>

        {/* خط خفيف جداً للفصل (ناعم) */}
        <div className="mx-auto mt-10 h-px w-full max-w-5xl bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      </div>
    </footer>
  );
};

export default LogoGrid;
