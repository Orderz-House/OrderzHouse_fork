// TopbarInfo.jsx
import React from "react";

const TopbarInfo = ({ theme = "#028090", links = [] }) => {
  return (
    <div
      className="w-full flex justify-center items-center px-4 py-1 text-sm sm:text-base text-white"
      style={{ backgroundColor: theme }}
    >
      <div className="flex flex-wrap gap-4 justify-center max-w-7xl w-full">
        {links.map((link, idx) =>
          link.href ? (
            <a
              key={idx}
              href={link.href}
              target={link.external ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {link.label}
            </a>
          ) : (
            <span key={idx}>{link.label}</span>
          )
        )}
      </div>
    </div>
  );
};

export default TopbarInfo;
