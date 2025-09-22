import React, { useState, useEffect } from 'react';
import { AnimatedSection, useStaggeredAnimation } from '../hooks/useScrollAnimation';
import './Subscriptions.css';

const Subscriptions = () => {
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [containerRef, visibleItems] = useStaggeredAnimation(6, 150);

  // Mock data for subscriptions - in real app, this would come from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setActiveSubscriptions([
        {
          id: 1,
          name: "Premium Service",
          platform: "Multi-Platform",
          price: "$1697",
          period: "/month",
          status: "active",
          nextBilling: "2024-02-15",
          features: [
            "Support for 5 Channels",
            "Scalable Business Growth", 
            "Priority Support",
            "Multi-Platform Campaign"
          ],
          usage: {
            leads: { current: 8420, limit: 10000 },
            campaigns: { current: 12, limit: 15 },
            channels: { current: 4, limit: 5 }
          },
          logo: "/instagram.png"
        },
        {
          id: 2,
          name: "Instagram Growth",
          platform: "Instagram",
          price: "$359",
          period: "/month", 
          status: "active",
          nextBilling: "2024-02-20",
          features: [
            "Content scheduling",
            "Hashtag optimization",
            "Basic analytics",
            "Email support"
          ],
          usage: {
            posts: { current: 45, limit: 60 },
            analytics: { current: "Basic", limit: "Basic" },
            support: { current: "Email", limit: "Email" }
          },
          logo: "/instagram.png"
        }
      ]);

      setAvailablePackages([
        {
          id: 3,
          name: "X Growth",
          platform: "Twitter/X",
          price: "$359",
          originalPrice: "$599",
          period: "/month",
          discount: "40% OFF",
          features: [
            "Unlimited posts",
            "Advanced analytics", 
            "Priority support",
            "Dedicated dashboard"
          ],
          trialDays: 14,
          logo: "/twitter.png"
        },
        {
          id: 4,
          name: "LinkedIn Starter",
          platform: "LinkedIn",
          price: "$299",
          originalPrice: "$499", 
          period: "/month",
          discount: "40% OFF",
          features: [
            "1000 leads/month",
            "Basic analytics",
            "Email support", 
            "Secure Payments"
          ],
          trialDays: 14,
          logo: "/linkedin.png"
        },
        {
          id: 5,
          name: "Facebook Pro",
          platform: "Facebook",
          price: "$449",
          originalPrice: "$699",
          period: "/month",
          discount: "35% OFF",
          features: [
            "Advanced targeting",
            "Campaign optimization",
            "Detailed analytics",
            "24/7 Support"
          ],
          trialDays: 14,
          logo: "/logo192.png"
        },
        {
          id: 6,
          name: "Enterprise Suite",
          platform: "All Platforms",
          price: "$2499",
          originalPrice: "$3999",
          period: "/month",
          discount: "37% OFF",
          features: [
            "Unlimited everything",
            "Custom integrations",
            "Dedicated manager",
            "White-label solution"
          ],
          trialDays: 30,
          logo: "/premium.png"
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

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

  const handleSubscribeToPackage = (packageId) => {
    // In real app, this would navigate to checkout
    alert('Subscription checkout would be implemented here');
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
        {activeSubscriptions.length > 0 && (
          <AnimatedSection animation="slide-up" delay={200}>
            <section className="active-subscriptions-section">
              <h2 className="section-title">Active Subscriptions</h2>
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
        )}

        {/* Available Packages Section */}
        <AnimatedSection animation="slide-up" delay={400}>
          <section className="available-packages-section">
            <h2 className="section-title">Available Packages</h2>
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
                      <div className="original-price">${pkg.originalPrice}</div>
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