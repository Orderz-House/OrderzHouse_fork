import React from "react";

const THEME = "#F97316";
const DARK = "#C2410C";

const GradientButton = ({
  children,
  onClick,
  href,
  className = "",
  style = {},
}) => {
  const baseClasses = `rounded-2xl px-6 py-3 text-white font-medium text-sm sm:text-lg shadow-lg bg-gradient-to-b from-orange-400 to-red-500
                       hover:shadow-xl transition-all hover:-translate-y-0.5 
                       flex items-center justify-center ${className}`;

  // const baseStyle = {
  //   background: `linear-gradient(to right, ${DARK}, ${THEME}, ${THEME})`,
  //   ...style,
  // };

  // 🔥 إذا فيه href → استخدم <a>
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
        // style={baseStyle}
      >
        {children}
      </a>
    );
  }

  // 🔥 إذا ما فيه href → استخدم <button> كالمعتاد
  return (
    <button className={baseClasses}  onClick={onClick}>
      {children}
    </button>
  );
};

export default GradientButton;
