
import React, { useCallback, useEffect, useState } from 'react';
import { AnimatedSection } from '../hooks/useScrollAnimation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { API_ENDPOINTS, apiCall } from '../config/api';
import './GrowthPlanSection.css';

const GrowthPlanSection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Swiper configuration with proper mobile scrolling
  const swiperConfig = {
    modules: [Navigation, Pagination],
    spaceBetween: 20,
    slidesPerView: 2,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      clickable: true,
    },
    loop: false,
    allowTouchMove: true,
    touchRatio: 1,
    grabCursor: true,
    touchStartPreventDefault: false,
    touchMoveStopPropagation: false,
    preventClicks: false,
    preventClicksPropagation: false,
    breakpoints: {
      1024: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 1,
        spaceBetween: 10,
        allowTouchMove: true,
        touchRatio: 1,
        grabCursor: true,
      },
      480: {
        slidesPerView: 1,
        spaceBetween: 10,
        allowTouchMove: true,
        touchRatio: 1,
        grabCursor: true,
      }
    }
  };

  // No need for manual scroll control with Swiper

  // Fetch packages from database
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        console.log('Fetching packages from:', API_ENDPOINTS.PACKAGES);
        
        const data = await apiCall(API_ENDPOINTS.PACKAGES);
        console.log('Packages fetched from database:', data.packages);
        
        const packages = data.packages || [];
        setPricingPlans(packages);
      } catch (error) {
        console.error('Error fetching packages:', error);
        console.error('Error details:', {
          message: error.message,
          endpoint: API_ENDPOINTS.PACKAGES,
          hostname: window.location.hostname
        });
        
        // Fallback to empty array if API fails
        setPricingPlans([]);
        
        // Show user-friendly error message
        console.warn('⚠️ Failed to load packages from database. This might be a network issue or the backend is not accessible.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Swiper handles initialization automatically


  // Viewport detection
  const detectViewport = useCallback(() => {
    const width = window.innerWidth;
    const newIsMobile = width <= 768;
    const newIsTablet = width > 768 && width <= 992;
    
    setIsMobile(newIsMobile);
    setIsTablet(newIsTablet);
  }, []);

  // Swiper handles navigation automatically

  // Helper function to get brand logo based on package name
  const getBrandLogo = (packageName) => {
    const name = packageName.toLowerCase();
    
    if (name.includes('instagram')) {
      return (
        <img 
          src={process.env.PUBLIC_URL + "/instagram.png"} 
          alt="Instagram Logo" 
          className="brand-logo"
          style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
        />
      );
    } else if (name.includes('premium') || name.includes('multi')) {
      return (
        <div className="multi-brand-logos">
          <img 
            src={process.env.PUBLIC_URL + "/instagram.png"} 
            alt="Instagram" 
            className="brand-logo-small"
          />
          <img 
            src={process.env.PUBLIC_URL + "/twitter.png"} 
            alt="Twitter" 
            className="brand-logo-small"
          />
          <img 
            src={process.env.PUBLIC_URL + "/linkedin.png"} 
            alt="LinkedIn" 
            className="brand-logo-small"
          />
          <img 
            src={process.env.PUBLIC_URL + "/logo192.png"} 
            alt="Facebook" 
            className="brand-logo-small"
          />
        </div>
      );
    } else if (name.includes('linkedin')) {
      return (
        <img 
          src={process.env.PUBLIC_URL + "/linkedin.png"} 
          alt="LinkedIn Logo" 
          className="brand-logo"
          style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
        />
      );
    } else if (name.includes('twitter') || name.includes('x growth')) {
      return (
        <img 
          src={process.env.PUBLIC_URL + "/twitter.png"} 
          alt="Twitter Logo" 
          className="brand-logo"
          style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
        />
      );
    } else if (name.includes('facebook')) {
      return (
        <img 
          src={process.env.PUBLIC_URL + "/logo192.png"} 
          alt="Facebook Logo" 
          className="brand-logo"
          style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
        />
      );
    }
    
    // Default icon
    return (
      <svg className="brand-logo" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <section className="growth-plan-section">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading packages...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="growth-plan-section">
      <div className="container">
        <AnimatedSection animation="fade-in">
          <h2 className="section-title">Choose Your Growth Plan</h2>
          <p className="section-subtitle">
            Select the perfect plan to accelerate your lead generation and grow your business
          </p>
        </AnimatedSection>
        
        <div className="pricing-carousel-container">
          {/* Custom Navigation Buttons */}
          
          {/* Swiper Carousel */}
          <Swiper {...swiperConfig} className="pricing-swiper">
            {pricingPlans.map((plan, index) => (
              <SwiperSlide key={index}>
                <div
                  className={`pricing-card card-hover hover-lift ${
                    plan.isPopular ? 'popular hover-glow' : ''
                  }`}
                >
                  {plan.isPopular && <div className="popular-badge">Most Popular</div>}
                  
                  {/* Discount label */}
                  {plan.discount && <div className="discount-badge">{plan.discount}% OFF</div>}
                  
                  <div className="plan-header">
                    {/* Brand logo */}
                    <div className="logo-container">
                      {getBrandLogo(plan.name)}
                    </div>
                    <h3 className="plan-name">{plan.name}</h3>
                    <div className="platform-name">
                      {plan.name.toLowerCase().includes('premium') || plan.name.toLowerCase().includes('multi') ? (
                        <div className="platform-logos">
                          <img 
                            src={process.env.PUBLIC_URL + "/instagram.png"} 
                            alt="Instagram" 
                            className="platform-logo-icon"
                          />
                          <img 
                            src={process.env.PUBLIC_URL + "/twitter.png"} 
                            alt="Twitter" 
                            className="platform-logo-icon"
                          />
                          <img 
                            src={process.env.PUBLIC_URL + "/linkedin.png"} 
                            alt="LinkedIn" 
                            className="platform-logo-icon"
                          />
                          <img 
                            src={process.env.PUBLIC_URL + "/logo192.png"} 
                            alt="Facebook" 
                            className="platform-logo-icon"
                          />
                        </div>
                      ) : (
                        plan.name.split(' ')[0]
                      )}
                    </div>
                  </div>
                  
                  <div className="plan-price">
                    {plan.originalPrice && (
                      <div className="original-price">${plan.originalPrice}</div>
                    )}
                    <div className="price">
                      ${plan.price}
                      <span className="period">/{plan.billingPeriod}</span>
                    </div>
                    {plan.trialDays && (
                      <div className="free-trial">{plan.trialDays}-day free trial</div>
                    )}
                  </div>
                  
                  <ul className="plan-features">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>
                        <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="plan-button btn-hover-slide hover-lift">Start Free Trial</button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default GrowthPlanSection;