import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { AnimatedSection, useStaggeredAnimation } from '../hooks/useScrollAnimation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { API_ENDPOINTS, apiCall, API_BASE_URL } from '../config/api';
import './Subscriptions.css';

const Subscriptions = () => {
  const { user, updateUser, isLoggedIn } = useAuth();
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [recommendedPackages, setRecommendedPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [containerRef, visibleItems] = useStaggeredAnimation(6, 150);
  const [showAvailablePackages, setShowAvailablePackages] = useState(false);
  const [swiperRef, setSwiperRef] = useState(null);

  // Swiper configuration - show all packages on mobile
  const swiperConfig = {
    modules: [Navigation, Pagination],
    spaceBetween: 20,
    slidesPerView: 1, // Mobile-first approach
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
    breakpoints: {
      1024: {
        slidesPerView: 2,
        spaceBetween: 40,
        slidesPerGroup: 1,
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

  // Fetch user subscriptions and available packages from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch available packages
        console.log('Fetching packages from:', API_ENDPOINTS.PACKAGES);
        const packagesData = await apiCall(API_ENDPOINTS.PACKAGES);
        if (packagesData?.success) {
          console.log('Subscriptions page - Packages fetched from database:', packagesData.packages);
          const transformedPackages = packagesData.packages.map(pkg => ({
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
          
          // Update Swiper after packages are loaded
          setTimeout(() => {
            if (swiperRef) {
              swiperRef.update();
            }
          }, 100);
        } else {
          console.log('Subscriptions page - API response not successful:', packagesData);
        }

        // Check user's subscription status from user context
        if (token && user?.subscription) {
          const userSub = user.subscription;
          if (userSub.status === 'active' || userSub.status === 'trialing') {
            // Find the package details for user's subscription
            const userPackage = packagesData.packages.find(pkg => 
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
        console.error('Error fetching data:', error);
        console.error('Error details:', {
          message: error.message,
          endpoint: API_ENDPOINTS.PACKAGES,
          hostname: window.location.hostname,
          response: error.response?.data,
          status: error.response?.status
        });
        setActiveSubscriptions([]);
        
        // Show user-friendly error message
        console.warn('⚠️ Failed to load packages from database. This might be a network issue or the backend is not accessible.');
        
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
      // Use dynamic API configuration
      const apiBase = API_BASE_URL;
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

  // Filter recommended packages when active subscriptions change
  useEffect(() => {
    if (availablePackages.length > 0) {
      const subscribedPackageNames = activeSubscriptions.map(sub => sub.name);
      const recommended = availablePackages.filter(pkg => 
        !subscribedPackageNames.includes(pkg.name)
      );
      setRecommendedPackages(recommended);
    }
  }, [activeSubscriptions, availablePackages]);

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
      // Use dynamic API configuration
      const apiBase = API_BASE_URL;

      const successUrl = `${window.location.origin}/subscriptions?status=success`;
      const cancelUrl = `${window.location.origin}/subscriptions?status=cancel`;

      console.log('🚀 Creating checkout session with:', {
        priceId: selectedPackage.stripePriceId,
        successUrl,
        cancelUrl,
        apiBase
      });

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

      console.log('✅ Session response:', sessionRes.data);
  
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
      console.error('❌ Subscribe error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to start subscription. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleManageBilling = async () => {
    try {
      const token = localStorage.getItem('token');
      // Use dynamic API configuration
      const apiBase = API_BASE_URL;
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
                  <div className="empty-state-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                      <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                  </div>
                  <h3>No Active Subscriptions</h3>
                  <p>Start your journey to business growth with our powerful packages</p>
                  <div className="empty-state-features">
                    <div className="feature-item">
                      <span className="feature-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                      </span>
                      <span>14-day free trial</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                          <line x1="8" y1="21" x2="16" y2="21"/>
                          <line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                      </span>
                      <span>Professional support</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 20V10"/>
                          <path d="M12 20V4"/>
                          <path d="M6 20v-6"/>
                        </svg>
                      </span>
                      <span>Proven results</span>
                    </div>
                  </div>
                  <button 
                    className="explore-plans-btn"
                    onClick={() => {
                      setShowAvailablePackages(true);
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

        {/* Packages You Might Like Section */}
        {activeSubscriptions.length > 0 && recommendedPackages.length > 0 && (
          <section className="recommended-packages-section">
            <h2 className="Subscription-section-title recommended">Packages You Might Like</h2>
            <div className="recommended-packages-grid">
              {recommendedPackages.slice(0, 3).map((pkg, index) => (
                <div key={pkg.id} className="recommended-package-card">
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
                    <div className="package-info">
                      <h3 className="package-name">{pkg.name}</h3>
                      <p className="package-platform">{pkg.platform}</p>
                      <div className="package-price">
                        {pkg.price}<span className="period">{pkg.period}</span>
                      </div>
                    </div>
                    {pkg.popular && (
                      <div className="popular-badge">Popular</div>
                    )}
                  </div>

                  <div className="package-features">
                    <h4>Features Included</h4>
                    <ul>
                      {pkg.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx}>
                          <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="package-actions">
                    <button 
                      className="btn-primary"
                      onClick={() => handleSubscribeToPackage(pkg.id)}
                    >
                      Subscribe Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Available Packages Section - Using Carousel like GrowthPlanSection */}
        {showAvailablePackages && (
          <AnimatedSection animation="slide-up" delay={400}>
            <section className="available-packages-section">
            <h2 className="Subscription-section-title available">Available Packages</h2>
            <p className="section-subtitle">Expand your reach with additional platforms and features</p>
            
            <div className="pricing-carousel-container">
              {/* Swiper Carousel */}
              <Swiper {...swiperConfig} className="pricing-swiper" onSwiper={setSwiperRef}>
                {availablePackages.map((pkg, index) => (
                  <SwiperSlide key={pkg.id}>
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
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            
            </section>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;