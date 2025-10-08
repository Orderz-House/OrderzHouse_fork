import React from "react";

const THEME = "#028090";
const DARK = "#05668D";

const GradientButton = ({
  children,
  onClick,
  className = "",
  style = {},
}) => {
  return (
    <button
      className={`rounded-2xl px-5 py-3 text-white font-medium shadow-lg hover:shadow-xl transition ${className}`}
      style={{
        background: `linear-gradient(90deg, ${DARK}, ${THEME})`,
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default GradientButton;
