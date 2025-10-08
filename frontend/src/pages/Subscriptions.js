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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [billingCycles, setBillingCycles] = useState([]);

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

        // Fetch user's active subscriptions from API
        if (token) {
          try {
            const subscriptionsResponse = await apiCall(API_ENDPOINTS.BILLING + '/subscriptions', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (subscriptionsResponse.success && subscriptionsResponse.subscriptions) {
              console.log('✅ Fetched subscriptions from API:', subscriptionsResponse.subscriptions);
              setActiveSubscriptions(subscriptionsResponse.subscriptions);
            } else {
              console.log('No active subscriptions found');
              setActiveSubscriptions([]);
            }
          } catch (error) {
            console.error('Error fetching subscriptions:', error);
            setActiveSubscriptions([]);
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
            stripePriceId: 'price_instagram_monthly',
            popular: false
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
            stripePriceId: 'price_linkedin_monthly',
            popular: false
          },
          {
            id: 'fallback-3',
            name: 'Premium Service',
            platform: 'All Platforms',
            price: '$1060',
            originalPrice: '$1500',
            period: '/monthly',
            discount: '30% OFF',
            features: ['Support for 5 Channels', 'Scalable Business Growth', 'Priority Support', 'Multi-Platform Campaign'],
            trialDays: 14,
            logo: '/premium.png',
            stripePriceId: 'price_premium_monthly',
            popular: true
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
      setLoading(true); // Show loading state to prevent flash
      const token = localStorage.getItem('token');
      // Use dynamic API configuration
      const apiBase = API_BASE_URL;
      if (token) {
        axios.get(`${apiBase}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then((res) => {
          if (res?.data?.success && res?.data?.user) {
            updateUser(res.data.user);
            // Show success message briefly
            setShowSuccessMessage(true);
            setTimeout(() => {
              setShowSuccessMessage(false);
            }, 3000);
            // Small delay to ensure smooth transition
            setTimeout(() => {
              setLoading(false);
            }, 500);
          } else {
            setLoading(false);
          }
        }).catch(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
      
      // Clean up URL parameters to prevent re-triggering
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
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

  const handleCancelSubscription = async (subscriptionId) => {
    if (window.confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const apiBase = API_BASE_URL;

        console.log('🚫 Cancelling subscription:', subscriptionId);

        const response = await axios.post(`${apiBase}/api/billing/cancel-subscription`, {
          subscriptionId: subscriptionId
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          // Update local state
          setActiveSubscriptions(prev => 
            prev.map(sub => 
              sub.id === subscriptionId 
                ? { ...sub, status: 'cancelled' }
                : sub
            )
          );
          
          // Refresh user data to get updated subscription
          const userResponse = await axios.get(`${apiBase}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (userResponse.data.success) {
            updateUser(userResponse.data.user);
          }
          
          alert('Subscription cancelled successfully. You will retain access until the end of your billing period.');
        } else {
          alert('Failed to cancel subscription. Please try again or contact support.');
        }
      } catch (error) {
        console.error('❌ Cancel subscription error:', error);
        alert('Failed to cancel subscription. Please try again or contact support.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpgradeSubscription = (subscription) => {
    setSelectedSubscription(subscription);
    setShowUpgradeModal(true);
    
    // Define billing cycles with discounts
    const cycles = [
      {
        id: 'monthly',
        name: 'Monthly',
        period: 'month',
        discount: 0,
        price: subscription.price,
        description: 'Pay monthly, cancel anytime'
      },
      {
        id: 'quarterly',
        name: 'Quarterly',
        period: 'quarter',
        discount: 10,
        price: Math.round(subscription.price * 3 * 0.9), // 10% discount
        description: 'Save 10% with quarterly billing'
      },
      {
        id: 'yearly',
        name: 'Yearly',
        period: 'year',
        discount: 20,
        price: Math.round(subscription.price * 12 * 0.8), // 20% discount
        description: 'Save 20% with yearly billing'
      }
    ];
    
    setBillingCycles(cycles);
  };

  const handleBillingCycleChange = async (newCycle) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiBase = API_BASE_URL;

      console.log('🔄 Upgrading subscription billing cycle:', newCycle);

      const response = await axios.post(`${apiBase}/api/billing/change-billing-cycle`, {
        subscriptionId: selectedSubscription.id,
        newBillingCycle: newCycle.id
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Refresh user data to get updated subscription
        const userResponse = await axios.get(`${apiBase}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (userResponse.data.success) {
          updateUser(userResponse.data.user);
          setActiveSubscriptions(userResponse.data.user.subscription || []);
        }
        
        setShowUpgradeModal(false);
        alert(`Billing cycle updated to ${newCycle.name} successfully!`);
      } else {
        alert('Failed to update billing cycle. Please try again or contact support.');
      }
    } catch (error) {
      console.error('❌ Change billing cycle error:', error);
      alert('Failed to update billing cycle. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };


  // Navigate to pricing plans page
  const handleSubscribeToPackage = (packageId) => {
    console.log('🔍 Navigating to pricing page for package ID:', packageId);
    console.log('🔍 Package ID type:', typeof packageId);
    
    if (!packageId || packageId === 'undefined') {
      console.error('❌ Invalid package ID:', packageId);
      alert('Invalid package ID. Please try again.');
      return;
    }
    
    // Navigate to pricing plans page
    window.location.href = `/pricing/${packageId}`;
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

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="success-message">
              <div className="success-content">
                <svg className="success-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Payment successful! Your subscription is now active.</span>
              </div>
            </div>
          )}
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
                      <div className="subscription-status">
                        {subscription.status === 'trialing' && (
                          <div className="trial-badge">
                            <span className="trial-icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                            </span>
                            <span className="trial-text">Free Trial</span>
                          </div>
                        )}
                        {subscription.status === 'active' && (
                          <div className="active-badge">
                            <span className="active-icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            </span>
                            <span className="active-text">Active</span>
                          </div>
                        )}
                        {subscription.status === 'cancelled' && (
                          <div className="cancelled-badge">
                            <span className="cancelled-icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                              </svg>
                            </span>
                            <span className="cancelled-text">Cancelled</span>
                          </div>
                        )}
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
                      {(subscription.status === 'active' || subscription.status === 'trialing') && (
                        <button 
                          className="btn-danger"
                          onClick={() => handleCancelSubscription(subscription.id)}
                        >
                          Cancel Subscription
                        </button>
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
                      <div className="popular-badge">Most Popular</div>
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

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upgrade Billing Plan</h3>
              <button 
                className="modal-close"
                onClick={() => setShowUpgradeModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="current-plan-info">
                <h4>Current Plan: {selectedSubscription?.name}</h4>
                <p>Choose your preferred billing cycle:</p>
              </div>
              
              <div className="billing-cycles">
                {billingCycles.map((cycle) => (
                  <div key={cycle.id} className="billing-cycle-option">
                    <div className="cycle-header">
                      <h5>{cycle.name}</h5>
                      {cycle.discount > 0 && (
                        <span className="discount-badge">Save {cycle.discount}%</span>
                      )}
                    </div>
                    <div className="cycle-price">
                      <span className="price">${cycle.price}</span>
                      <span className="period">/{cycle.period}</span>
                    </div>
                    <p className="cycle-description">{cycle.description}</p>
                    <button 
                      className="select-cycle-btn"
                      onClick={() => handleBillingCycleChange(cycle)}
                    >
                      Select {cycle.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;