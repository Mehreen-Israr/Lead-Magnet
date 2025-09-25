
import React, { useCallback, useEffect, useState } from 'react';
import { AnimatedSection } from '../hooks/useScrollAnimation';
import useEmblaCarousel from 'embla-carousel-react';
import './GrowthPlanSection.css';

const GrowthPlanSection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Embla Carousel setup with responsive options
  const options = {
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    loop: false,
    skipSnaps: false,
    startIndex: 0,
    slidesToScroll: 1,
    breakpoints: {
      '(max-width: 768px)': { 
        slidesToScroll: 1,
        align: 'center'
      },
      '(max-width: 992px)': { 
        slidesToScroll: 1,
        align: 'start'
      }
    }
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  // Fetch packages from database
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/packages');
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Packages fetched from database:', data.packages);
          const packages = data.packages || [];
          
          if (packages.length > 0) {
            // Transform database packages to match existing structure
            const transformedPlans = packages.map(pkg => ({
              name: pkg.name,
              price: `$${pkg.price}`,
              originalPrice: pkg.originalPrice ? `$${pkg.originalPrice}` : null,
              period: `/${pkg.billingPeriod}`,
              discount: pkg.discountPercentage > 0 ? `${pkg.discountPercentage}% OFF` : null,
              features: pkg.features || [],
              popular: pkg.isPopular || false,
              trialDays: pkg.trialDays || 14,
              platform: pkg.platform,
              logo: pkg.logo
            }));
            
            console.log('✅ Transformed plans for display:', transformedPlans);
            setPricingPlans(transformedPlans);
          } else {
            console.log('❌ No packages found in database');
          }
        } else {
          console.log('❌ API response not ok:', response.status);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching packages:', error);
        setLoading(false);
      }
    };
    
    fetchPackages();
  }, []);

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
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [detectViewport, emblaApi]);

  // Navigation functions
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Brand logos mapping
  const brandLogos = {
    'Instagram Growth': (
      <img 
        src={process.env.PUBLIC_URL + "/instagram.png"} 
        alt="Instagram Logo" 
        className="brand-logo"
        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
      />
    ),
    'Premium Service': (
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
    ),
    'LinkedIn Starter': (
      <img 
        src={process.env.PUBLIC_URL + "/linkedin.png"} 
        alt="LinkedIn Logo" 
        className="brand-logo"
        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
      />
    ),
    'X Growth': (
      <img 
        src={process.env.PUBLIC_URL + "/twitter.png"} 
        alt="Twitter Logo" 
        className="brand-logo"
        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
      />
    ),
    'Facebook Pro': (
      <img 
        src={process.env.PUBLIC_URL + "/logo192.png"} 
        alt="Facebook Logo" 
        className="brand-logo"
        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
      />
    )
  };

  const handleGetStarted = () => {
    // Navigate to subscriptions page
    window.location.href = '/subscriptions';
  };

  if (loading) {
    return (
      <section className="growth-plan-section">
        <div className="container">
          <AnimatedSection animation="fade-in">
            <h2 className="section-title">Choose Your Growth Plan</h2>
            <p className="section-subtitle">
              Loading pricing plans...
            </p>
          </AnimatedSection>
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
                      plan.popular ? 'popular hover-glow' : ''
                    }`}
                  >
                    {plan.popular && <div className="popular-badge">Most Popular</div>}
                    
                    {/* Discount label */}
                    {plan.discount && <div className="discount-badge">{plan.discount}</div>}
                    
                    <div className="plan-header">
                      {/* Brand logo */}
                      <div className="logo-container">
                        {brandLogos[plan.name] || (
                          <svg className="brand-logo" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                          </svg>
                        )}
                      </div>
                      <h3 className="plan-name">{plan.name}</h3>
                      <div className="platform-name">
                        {plan.name === 'Premium Service' ? (
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
                        {plan.price}
                        <span className="period">{plan.period}</span>
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
                    <button 
                      className="plan-button btn-hover-slide hover-lift"
                      onClick={handleGetStarted}
                    >
                      Get Started
                    </button>
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