import React, { useState, createContext, useContext, useMemo } from 'react';
import { Star } from 'lucide-react';

// Create a context to share state between parent and children
const RatingContext = createContext();

// The Parent <Rating> component
export const Rating = ({ children, value, onChange }) => {
  const [hover, setHover] = useState(null);

  const onHover = (index) => setHover(index);
  const onClick = (index) => {
    if (onChange) {
      onChange(index);
    }
  };

  // Use useMemo to avoid re-creating the context value on every render
  const contextValue = useMemo(() => ({
    value,
    hover,
    onHover,
    onClick,
  }), [value, hover]);

  return (
    <RatingContext.Provider value={contextValue}>
      <div className="flex items-center" onMouseLeave={() => onHover(null)}>
        {children}
      </div>
    </RatingContext.Provider>
  );
};

// The Child <Rating.Star> component
Rating.Star = ({ index }) => {
  const { value, hover, onHover, onClick } = useContext(RatingContext);
  const isFilled = (hover || value) >= index;

  return (
    <Star
      onMouseEnter={() => onHover(index)}
      onClick={() => onClick(index)}
      className={`h-8 w-8 cursor-pointer transition-colors ${
        isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'
      }`}
    />
  );
};
