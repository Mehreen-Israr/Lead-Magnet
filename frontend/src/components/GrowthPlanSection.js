
import React, { useCallback, useEffect, useState } from 'react';
import { AnimatedSection } from '../hooks/useScrollAnimation';
import useEmblaCarousel from 'embla-carousel-react';
import { API_ENDPOINTS, apiCall } from '../config/api';
import './GrowthPlanSection.css';

const GrowthPlanSection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Embla Carousel setup with responsive options
  const options = {
    align: 'start',
    containScroll: false, // Allow scrolling to all slides
    dragFree: false,
    loop: false,
    skipSnaps: false,
    startIndex: 0,
    slidesToScroll: 1,
    breakpoints: {
      '(max-width: 768px)': { 
        slidesToScroll: 1,
        align: 'start', // Changed from 'center' to 'start' for better mobile scrolling
        containScroll: false // Ensure we can reach all slides on mobile
      },
      '(max-width: 992px)': { 
        slidesToScroll: 1,
        align: 'start',
        containScroll: false
      }
    }
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(options);

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

  // Reinitialize carousel when packages are loaded
  useEffect(() => {
    if (emblaApi && pricingPlans.length > 0) {
      console.log('Reinitializing carousel with', pricingPlans.length, 'packages');
      emblaApi.reInit();
      
      
      // Debug: Log carousel state
      setTimeout(() => {
        console.log('Carousel state:', {
          slideNodes: emblaApi.slideNodes(),
          selectedIndex: emblaApi.selectedScrollSnap(),
          canScrollPrev: emblaApi.canScrollPrev(),
          canScrollNext: emblaApi.canScrollNext(),
          totalSlides: emblaApi.slideNodes().length
        });
        
        // Ensure we can scroll to the last slide
        if (emblaApi.slideNodes().length > 0) {
          const lastSlideIndex = emblaApi.slideNodes().length - 1;
          console.log('Last slide index:', lastSlideIndex);
          console.log('Can scroll to last slide:', emblaApi.canScrollNext() || emblaApi.selectedScrollSnap() === lastSlideIndex);
          
          // Force scroll to last slide to test if it's reachable
          setTimeout(() => {
            console.log('Testing scroll to last slide...');
            emblaApi.scrollTo(lastSlideIndex);
            setTimeout(() => {
              console.log('After scroll to last - Current index:', emblaApi.selectedScrollSnap());
              console.log('After scroll to last - Can scroll next:', emblaApi.canScrollNext());
            }, 100);
          }, 200);
        }
      }, 100);
    }
  }, [emblaApi, pricingPlans]);


  // Viewport detection
  const detectViewport = useCallback(() => {
    const width = window.innerWidth;
    const newIsMobile = width <= 768;
    const newIsTablet = width > 768 && width <= 992;
    
    setIsMobile(newIsMobile);
    setIsTablet(newIsTablet);
  }, []);

  // Handle resize events
  useEffect(() => {
    detectViewport();
    
    const handleResize = () => {
      detectViewport();
      // Embla handles resize automatically, no manual intervention needed
      if (emblaApi) {
        emblaApi.reInit();
        // Force reinitialize after resize to ensure proper sliding
        setTimeout(() => {
          console.log('After resize - Can scroll next:', emblaApi.canScrollNext());
          console.log('After resize - Total slides:', emblaApi.slideNodes().length);
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [detectViewport, emblaApi]);

  // Navigation functions - simple fix to prevent sliding when no more cards
  const scrollPrev = useCallback(() => {
    if (emblaApi && emblaApi.canScrollPrev()) {
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi && emblaApi.canScrollNext()) {
      emblaApi.scrollNext();
    }
  }, [emblaApi]);

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
          <button 
            className="embla-nav-button embla-nav-prev" 
            onClick={scrollPrev}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button 
            className="embla-nav-button embla-nav-next" 
            onClick={scrollNext}
            aria-label="Next slide"
          >
            ›
          </button>
          
          {/* Embla Carousel */}
          <div className="embla" ref={emblaRef}>
            <div className="embla__container">
              {pricingPlans.map((plan, index) => (
                <div key={index} className="embla__slide">
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GrowthPlanSection;