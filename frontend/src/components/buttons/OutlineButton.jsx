import React from "react";

const COLOR = "#028090";

const OutlineButton = ({
  children,
  onClick,
  className = "",
  style = {},
}) => {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border-2 text-white font-medium px-5 py-3 transition-transform duration-200 hover:scale-[.98] flex items-center justify-center ${className}`}
      style={{
        ...style,
        background: "transparent",
        borderColor: COLOR,
        color: COLOR,
      }}
    >
      {children}
    </button>
  );
};

export default OutlineButton;
