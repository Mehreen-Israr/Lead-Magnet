import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { AnimatedSection, useStaggeredAnimation } from '../hooks/useScrollAnimation';
import './Subscriptions.css';

const Subscriptions = () => {
  const { user, updateUser, isLoggedIn } = useAuth();
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [containerRef, visibleItems] = useStaggeredAnimation(6, 150);

  // Mock data for subscriptions - in real app, this would come from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch active subscriptions from API
        const subscriptionsResponse = await fetch('/api/billing/subscriptions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (subscriptionsResponse.ok) {
          const subscriptionsData = await subscriptionsResponse.json();
          setActiveSubscriptions(subscriptionsData.subscriptions || []);
        } else {
          console.error('Failed to fetch subscriptions');
          setActiveSubscriptions([]);
        }

        // Fetch available packages from API
        const packagesResponse = await fetch('/api/packages');
        if (packagesResponse.ok) {
          const packagesData = await packagesResponse.json();
          setAvailablePackages(packagesData.packages || []);
        } else {
          console.error('Failed to fetch packages');
          // No fallback data - only show packages from database
          setAvailablePackages([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setActiveSubscriptions([]);
        setAvailablePackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle success/cancel from Stripe and refresh user
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (status === 'success') {
      const token = localStorage.getItem('token');
      const apiBase = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
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
      // Map package IDs to subscription plans
      const planMap = {
        1: 'free',
        2: 'pro', 
        5: 'business',
        6: 'enterprise',
        7: 'pro',
        8: 'premium'
      };
      
      const plan = planMap[packageId];
      if (!plan) {
        return alert('Unknown subscription plan');
      }
  
      const token = localStorage.getItem('token');
      const apiBase = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  
      const successUrl = `${window.location.origin}/subscriptions?status=success`;
      const cancelUrl = `${window.location.origin}/subscriptions?status=cancel`;
  
      const sessionRes = await axios.post(`${apiBase}/api/billing/create-checkout-session`, {
        plan,
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
      const apiBase = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
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
        {activeSubscriptions.length > 0 ? (
          <AnimatedSection animation="slide-up" delay={200}>
            <section className="active-subscriptions-section">
              <h2 className="Subscription-section-title">Active Subscriptions</h2>
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
            </section>
          </AnimatedSection>
        ) : (
          <AnimatedSection animation="slide-up" delay={200}>
            <section className="no-subscriptions-section">
              <div className="empty-state">
                <h2 className="Subscription-section-title">Active Subscriptions</h2>
                <p className="empty-state-message">
                  You haven't subscribed to any subscription. Check below our subscriptions
                </p>
              </div>
            </section>
          </AnimatedSection>
        )}

        {/* Available Packages Section */}
        <AnimatedSection animation="slide-up" delay={400}>
          <section className="available-packages-section">
            <h2 className="Subscription-section-title">Available Packages</h2>
            <p className="section-subtitle">Expand your reach with additional platforms and features</p>
            
            <div className="packages-grid">
              {availablePackages.map((pkg, index) => (
                <div 
                  key={pkg.id}
                  data-index={index + activeSubscriptions.length}
                  className={`package-card ${visibleItems.has(index + activeSubscriptions.length) ? 'animate-in' : ''}`}
                >
                  {pkg.discount && <div className="discount-badge">{pkg.discount}</div>}
                  
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
              ))}
            </div>
          </section>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Subscriptions;