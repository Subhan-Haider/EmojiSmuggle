import React from 'react';

const GlitchText = ({ text, className = "" }) => {
  return (
    <span 
      className={`glitch inline-block ${className}`} 
      data-text={text}
    >
      {text}
    </span>
  );
};

export default GlitchText;
