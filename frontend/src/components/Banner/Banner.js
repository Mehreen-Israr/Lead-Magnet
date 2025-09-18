import React from 'react';
import './Banner.css';
import Bgimg from '/Bgimg.jpg';

const Banner = ({ title, subtitle }) => {
  const bannerStyle = {
    backgroundImage: 'url(/Bgimg.jpg)'    
  };  
  
  return (
    <>
      <div className="banner" style={bannerStyle}>
        <div className="banner-overlay"></div>
      </div>
      <div className="banner-content">
        <h1 className="banner-title">{title}</h1>
        {subtitle && <p className="banner-subtitle">{subtitle}</p>}
      </div>
    </>
  );
};

export default Banner;