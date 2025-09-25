import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { AnimatedSection, useStaggeredAnimation } from '../hooks/useScrollAnimation';
import useEmblaCarousel from 'embla-carousel-react';
import './Subscriptions.css';

const Subscriptions = () => {
  const { user, updateUser, isLoggedIn } = useAuth();
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [containerRef, visibleItems] = useStaggeredAnimation(6, 150);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAvailablePackages, setShowAvailablePackages] = useState(false);

  // Embla Carousel setup (same as GrowthPlanSection)
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

  // Debug carousel state
  useEffect(() => {
    if (emblaApi) {
      console.log('🎠 Embla API initialized');
      console.log('🎠 Total slides:', emblaApi.slideNodes().length);
      console.log('🎠 Available packages:', availablePackages.length);
      console.log('🎠 Can scroll prev:', emblaApi.canScrollPrev());
      console.log('🎠 Can scroll next:', emblaApi.canScrollNext());
      console.log('🎠 Current slide index:', emblaApi.selectedScrollSnap());
    }
  }, [emblaApi, availablePackages]);

  // Reinitialize carousel when packages change
  useEffect(() => {
    if (emblaApi && availablePackages.length > 0) {
      console.log('🔄 Reinitializing carousel with', availablePackages.length, 'packages');
      // Add a small delay to ensure DOM is updated
      setTimeout(() => {
        emblaApi.reInit();
        console.log('🔄 Carousel reinitialized');
        console.log('🔄 After reinit - Can scroll prev:', emblaApi.canScrollPrev());
        console.log('🔄 After reinit - Can scroll next:', emblaApi.canScrollNext());
        console.log('🔄 After reinit - Total slides:', emblaApi.slideNodes().length);
        // Force scroll to first slide to ensure proper initialization
        emblaApi.scrollTo(0);
      }, 200); // Increased delay to ensure proper DOM rendering
    }
  }, [emblaApi, availablePackages]);

  // Track slide changes
  useEffect(() => {
    if (emblaApi) {
      const onSelect = () => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
        console.log('📍 Current slide index:', emblaApi.selectedScrollSnap());
      };
      
      emblaApi.on('select', onSelect);
      onSelect(); // Set initial index
      
      return () => emblaApi.off('select', onSelect);
    }
  }, [emblaApi]);

  // Navigation functions (same as GrowthPlanSection)
  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      console.log('⬅️ Scrolling to previous slide');
      console.log('⬅️ Current slide index before:', emblaApi.selectedScrollSnap());
      emblaApi.scrollPrev();
      console.log('⬅️ Current slide index after:', emblaApi.selectedScrollSnap());
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      console.log('➡️ Scrolling to next slide');
      console.log('➡️ Current slide index before:', emblaApi.selectedScrollSnap());
      emblaApi.scrollNext();
      console.log('➡️ Current slide index after:', emblaApi.selectedScrollSnap());
    }
  }, [emblaApi]);

  // Fetch user subscriptions and available packages from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const apiBase = 'http://localhost:5000'; // Force local backend for development
        
        // Fetch available packages
        const packagesRes = await axios.get(`${apiBase}/api/packages`);
        if (packagesRes?.data?.success) {
          console.log('✅ Subscriptions page - Packages fetched from database:', packagesRes.data.packages);
          const transformedPackages = packagesRes.data.packages.map(pkg => ({
            id: pkg._id,
            name: pkg.name,
            platform: pkg.platform,
            price: `$${pkg.price}`,
            originalPrice: pkg.originalPrice ? `$${pkg.originalPrice}` : null,
            period: `/${pkg.billingPeriod}`,
            discount: pkg.discountPercentage > 0 ? `${pkg.discountPercentage}% OFF` : null,
            features: pkg.features || [],
            trialDays: pkg.trialDays,
            logo: pkg.logo || "/logo192.png",
            stripePriceId: pkg.stripePriceId,
            popular: pkg.isPopular || false
          }));
          setAvailablePackages(transformedPackages);
        } else {
          console.log('❌ Subscriptions page - API response not successful:', packagesRes.data);
        }

        // Check user's subscription status from user context
        if (token && user?.subscription) {
          const userSub = user.subscription;
          if (userSub.status === 'active' || userSub.status === 'trialing') {
            // Find the package details for user's subscription
            const userPackage = packagesRes.data.packages.find(pkg => 
              pkg.stripePriceId === userSub.stripePriceId
            );
            
            if (userPackage) {
              setActiveSubscriptions([{
                id: userSub.stripeSubscriptionId,
                name: userPackage.name,
                platform: userPackage.platform,
                price: `$${userPackage.price}`,
                period: `/${userPackage.billingPeriod}`,
                status: userSub.status,
                nextBilling: userSub.currentPeriodEnd ? 
                  new Date(userSub.currentPeriodEnd).toISOString().split('T')[0] : 
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                features: userPackage.features || [],
                logo: userPackage.logo || "/logo192.png"
              }]);
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        console.error('❌ Error details:', error.response?.data);
        console.error('❌ Error status:', error.response?.status);
        setActiveSubscriptions([]);
        // Fallback packages to show UI working
        setAvailablePackages([
          {
            id: 'fallback-1',
            name: 'Instagram Growth',
            platform: 'Instagram',
            price: '$359',
            originalPrice: '$599',
            period: '/monthly',
            discount: '40% OFF',
            features: ['Content scheduling', 'Hashtag optimization', 'Basic analytics', 'Email support'],
            trialDays: 14,
            logo: '/instagram.png',
            stripePriceId: 'price_instagram_monthly'
          },
          {
            id: 'fallback-2', 
            name: 'LinkedIn Starter',
            platform: 'LinkedIn',
            price: '$299',
            originalPrice: '$499',
            period: '/monthly',
            discount: '40% OFF',
            features: ['1000 leads/month', 'Basic analytics', 'Email support', 'Secure Payments'],
            trialDays: 14,
            logo: '/linkedin.png',
            stripePriceId: 'price_linkedin_monthly'
          }
        ]);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle success/cancel from Stripe and refresh user
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (status === 'success') {
      const token = localStorage.getItem('token');
      const apiBase = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      if (token) {
        axios.get(`${apiBase}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then((res) => {
          if (res?.data?.success && res?.data?.user) {
            updateUser(res.data.user);
          }
        }).catch(() => {});
      }
    }
  }, [updateUser]);

  const handleCancelSubscription = (subscriptionId) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      setActiveSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscriptionId 
            ? { ...sub, status: 'cancelled' }
            : sub
        )
      );
    }
  };

  const handleUpgradeSubscription = (subscriptionId) => {
    // In real app, this would navigate to upgrade flow
    alert('Upgrade functionality would be implemented here');
  };

  // Update the handleSubscribeToPackage function
  const handleSubscribeToPackage = async (packageId) => {
    try {
      // Find the package by ID
      const selectedPackage = availablePackages.find(pkg => pkg.id === packageId);
      if (!selectedPackage) {
        return alert('Package not found');
      }

      if (!selectedPackage.stripePriceId) {
        return alert('Package pricing not configured.');
      }

      const token = localStorage.getItem('token');
      const apiBase = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

      const successUrl = `${window.location.origin}/subscriptions?status=success`;
      const cancelUrl = `${window.location.origin}/subscriptions?status=cancel`;

      const sessionRes = await axios.post(`${apiBase}/api/billing/create-checkout-session`, {
        priceId: selectedPackage.stripePriceId,
        successUrl,
        cancelUrl
      }, {
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        }
      });
  
      if (sessionRes.data.success) {
        if (sessionRes.data.url) {
          // Redirect to Stripe Checkout
          window.location.href = sessionRes.data.url;
        } else if (sessionRes.data.redirectUrl) {
          // Free plan activation
          window.location.href = sessionRes.data.redirectUrl;
        }
      } else {
        alert(sessionRes.data.message || 'Failed to start subscription');
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      alert('Failed to start subscription. Please try again.');
    }
  };

  const handleManageBilling = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiBase = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiBase}/api/billing/create-portal-session`, {
        returnUrl: `${window.location.origin}/subscriptions`
      }, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
      if (res?.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (e) {
      alert('Unable to open billing portal.');
    }
  };

  if (loading) {
    return (
      <div className="subscriptions-container">
        <div className="subscriptions-background"></div>
        <div className="subscriptions-overlay"></div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subscriptions-container">
      <div className="subscriptions-background"></div>
      <div className="subscriptions-overlay"></div>
      
      <div className="subscriptions-content">
        <AnimatedSection animation="fade-in">
          <div className="subscriptions-header">
            <h1 className="subscriptions-title">Your Subscriptions</h1>
            <p className="subscriptions-subtitle">
              Manage your active subscriptions and discover new packages to grow your business
            </p>
          </div>
        </AnimatedSection>

        {/* Active Subscriptions Section */}
        <AnimatedSection animation="slide-up" delay={200}>
          <section className="active-subscriptions-section">
            <h2 className="Subscription-section-title active">Active Subscriptions</h2>
            {activeSubscriptions.length > 0 ? (
              <div className="subscriptions-grid" ref={containerRef}>
                {activeSubscriptions.map((subscription, index) => (
                  <div 
                    key={subscription.id}
                    data-index={index}
                    className={`subscription-card ${visibleItems.has(index) ? 'animate-in' : ''} ${subscription.status === 'cancelled' ? 'cancelled' : ''}`}
                  >
                    <div className="subscription-header">
                      <div className="subscription-logo">
                        <img 
                          src={process.env.PUBLIC_URL + subscription.logo} 
                          alt={`${subscription.platform} Logo`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="subscription-info">
                        <h3 className="subscription-name">{subscription.name}</h3>
                        <p className="subscription-platform">{subscription.platform}</p>
                        <div className="subscription-price">
                          {subscription.price}<span className="period">{subscription.period}</span>
                        </div>
                      </div>
                      <div className={`subscription-status ${subscription.status}`}>
                        {subscription.status}
                      </div>
                    </div>

                    <div className="subscription-details">
                      <div className="billing-info">
                        <p><strong>Next Billing:</strong> {subscription.nextBilling}</p>
                      </div>

                      {subscription.usage && (
                        <div className="usage-stats">
                          <h4>Usage Statistics</h4>
                          {Object.entries(subscription.usage).map(([key, value]) => (
                            <div key={key} className="usage-item">
                              <div className="usage-label">
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                              </div>
                              <div className="usage-bar">
                                <div 
                                  className="usage-progress"
                                  style={{ 
                                    width: typeof value.current === 'number' && typeof value.limit === 'number' 
                                      ? `${(value.current / value.limit) * 100}%` 
                                      : '100%' 
                                  }}
                                ></div>
                              </div>
                              <div className="usage-text">
                                {typeof value.current === 'number' && typeof value.limit === 'number'
                                  ? `${value.current.toLocaleString()} / ${value.limit.toLocaleString()}`
                                  : `${value.current}`
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="subscription-features">
                        <h4>Features Included</h4>
                        <ul>
                          {subscription.features.map((feature, idx) => (
                            <li key={idx}>
                              <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="subscription-actions">
                      {subscription.status === 'active' && (
                        <>
                          <button 
                            className="btn-secondary"
                            onClick={() => handleUpgradeSubscription(subscription.id)}
                          >
                            Upgrade Plan
                          </button>
                          <button 
                            className="btn-danger"
                            onClick={() => handleCancelSubscription(subscription.id)}
                          >
                            Cancel Subscription
                          </button>
                        </>
                      )}
                      {subscription.status === 'cancelled' && (
                        <div className="cancelled-notice">
                          <p>This subscription has been cancelled and will end on {subscription.nextBilling}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-content">
                  <div className="empty-state-icon">📦</div>
                  <h3>No Active Subscriptions</h3>
                  <p>Looks like you haven’t subscribed yet!</p>
                  <button 
                    className="explore-plans-btn"
                    onClick={() => {
                      setShowAvailablePackages(true);
                      // Scroll to packages section after a short delay to allow for animation
                      setTimeout(() => {
                        document.querySelector('.available-packages-section')?.scrollIntoView({ 
                          behavior: 'smooth' 
                        });
                      }, 300);
                    }}
                  >
                    Explore Available Packages
                  </button>
                </div>
              </div>
            )}
          </section>
        </AnimatedSection>

        {/* Available Packages Section - Using Carousel like GrowthPlanSection */}
        {showAvailablePackages && (
          <AnimatedSection animation="slide-up" delay={400}>
            <section className="available-packages-section">
            <h2 className="Subscription-section-title available">Available Packages</h2>
            <p className="section-subtitle">Expand your reach with additional platforms and features</p>
            
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
                  {availablePackages.map((pkg, index) => (
                    <div key={pkg.id} className="embla__slide">
                      <div className={`package-card ${pkg.popular ? 'popular' : ''}`}>
                        {pkg.discount && <div className="discount-badge">{pkg.discount}</div>}
                        {pkg.popular && <div className="popular-badge">Most Popular</div>}
                        
                        <div className="package-header">
                          <div className="package-logo">
                            <img 
                              src={process.env.PUBLIC_URL + pkg.logo} 
                              alt={`${pkg.platform} Logo`}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                          <h3 className="package-name">{pkg.name}</h3>
                          <p className="package-platform">{pkg.platform}</p>
                        </div>

                        <div className="package-pricing">
                          {pkg.originalPrice && (
                            <div className="sub-original-price">${pkg.originalPrice}</div>
                          )}
                          <div className="package-price">
                            {pkg.price}<span className="period">{pkg.period}</span>
                          </div>
                          {pkg.trialDays && (
                            <div className="free-trial">{pkg.trialDays}-day free trial</div>
                          )}
                        </div>

                        <div className="package-features">
                          <ul>
                            {pkg.features.map((feature, idx) => (
                              <li key={idx}>
                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button 
                          className="package-subscribe-btn"
                          onClick={() => handleSubscribeToPackage(pkg.id)}
                        >
                          Start Free Trial
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Slide indicators */}
            <div className="slide-indicators">
              {availablePackages.map((_, index) => (
                <button
                  key={index}
                  className={`slide-indicator ${index === selectedIndex ? 'active' : ''}`}
                  onClick={() => emblaApi?.scrollTo(index)}
                />
              ))}
            </div>
            
            </section>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;