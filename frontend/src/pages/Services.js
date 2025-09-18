import React, { useState } from 'react';
import './Services.css';

const Services = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerPage = 3;
  
  const nextPage = () => {
    setCurrentIndex((prev) => 
      prev + 1 >= processSteps.length ? 0 : prev + 1
    );
  };
  
  const prevPage = () => {
    setCurrentIndex((prev) => 
      prev - 1 < 0 ? processSteps.length - 1 : prev - 1
    );
  };
  
  // Calculate which cards to show based on current index
  const getVisibleCards = () => {
    const cards = [];
    for (let i = 0; i < cardsPerPage; i++) {
      const index = (currentIndex + i) % processSteps.length;
      cards.push(processSteps[index]);
    }
    return cards;
  };
  const services = [
    {
      name: "Instagram Outreach",
      price: "$297",
      period: "/month",
      icon: "📸",
      description: "Leverage Instagram's visual platform to connect with your ideal customers through targeted outreach and engagement.",
      features: [
        "1000+ verified leads/month",
        "AI-powered hashtag targeting",
        "Automated DM sequences",
        "Story and post engagement",
        "Influencer identification",
        "Content performance analytics",
        "24/7 support"
      ],
      benefits: [
        "Reach visual-first audiences",
        "Build brand awareness",
        "Generate high-quality leads",
        "Increase follower engagement"
      ],
      popular: false
    },
    {
      name: "LinkedIn Starter",
      price: "$497",
      period: "/month",
      icon: "💼",
      description: "Professional networking at scale. Connect with decision-makers and industry leaders on the world's largest professional platform.",
      features: [
        "2000+ verified leads/month",
        "Advanced professional targeting",
        "Personalized connection requests",
        "Multi-touch message sequences",
        "Company and role-based filtering",
        "LinkedIn Sales Navigator integration",
        "Priority support",
        "Custom campaign templates"
      ],
      benefits: [
        "Access C-level executives",
        "Build professional network",
        "Generate B2B leads",
        "Establish thought leadership"
      ],
      popular: true
    },
    {
      name: "X Growth",
      price: "$797",
      period: "/month",
      icon: "🐦",
      description: "Harness the power of real-time conversations on X (Twitter) to engage with prospects and build your brand presence.",
      features: [
        "5000+ verified leads/month",
        "Real-time trend monitoring",
        "Automated engagement sequences",
        "Hashtag and keyword targeting",
        "Competitor audience analysis",
        "Tweet scheduling and optimization",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced analytics dashboard"
      ],
      benefits: [
        "Tap into trending conversations",
        "Build thought leadership",
        "Generate viral content",
        "Connect with industry influencers"
      ],
      popular: false
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Strategy Development",
      description: "We analyze your target audience and create a customized outreach strategy for each platform."
    },
    {
      step: "02",
      title: "AI Setup & Configuration",
      description: "Our AI algorithms are configured to identify and target your ideal prospects with precision."
    },
    {
      step: "03",
      title: "Campaign Launch",
      description: "We launch your campaigns across selected platforms with automated sequences and monitoring."
    },
    {
      step: "04",
      title: "Optimization & Scaling",
      description: "Continuous optimization based on performance data to maximize your lead generation results."
    }
  ];

  return (
    <div className="services">
      {/* Hero Section */}
      <div className="banner-container">
        <div className="banner-background"></div>
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <h1 className="banner-title">Our Lead Generation Services</h1>
          <p className="banner-subtitle">
            Choose from our specialized platforms to reach your ideal customers where they spend their time.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <section className="services-grid-section">
        <div className="container">
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className={`service-card ${service.popular ? 'popular' : ''}`}>
                {service.popular && <div className="popular-badge">Most Popular</div>}
                
                <div className="service-header">
                  <div className="service-icon">{service.icon}</div>
                  <h3 className="service-name">{service.name}</h3>
                  <div className="service-price">
                    <span className="price">{service.price}</span>
                    <span className="period">{service.period}</span>
                  </div>
                </div>
                
                <p className="service-description">{service.description}</p>
                
                <div className="service-features">
                  <h4>Features Included:</h4>
                  <ul>
                    {service.features.map((feature, idx) => (
                      <li key={idx}>
                        <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="service-benefits">
                  <h4>Key Benefits:</h4>
                  <ul className="benefits-list">
                    {service.benefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                
                <button className="service-cta">Get Started</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process" style={{background: "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #1a1a1a 100%)", padding: "120px 0"}}>
        <div className="container" style={{background: "transparent"}}>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Our proven 4-step process ensures maximum results from your lead generation campaigns.
          </p>
          <div className="process-carousel">
            <div className="process-grid">
              {getVisibleCards().map((step, index) => (
                <div key={`${currentIndex}-${index}`} className="process-step">
                  <div className="step-number">{step.step}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
            <div className="carousel-controls">
              <button className="carousel-control prev" onClick={prevPage}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <div className="carousel-indicators">
                {processSteps.map((_, index) => (
                  <span 
                    key={index} 
                    className={index >= currentIndex && index < currentIndex + cardsPerPage ? "indicator active" : "indicator"}
                    onClick={() => setCurrentIndex(index)}
                  ></span>
                ))}
              </div>
              <button className="carousel-control next" onClick={nextPage}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

     {/* Comparison Section */}
<section className="comparison">
  <div className="container">
    <h2 className="section-title">Platform Comparison</h2>
    <div className="comparison-table">
      <div className="table-header">
        <div className="header-cell">Feature</div>
        <div className="header-cell">Instagram</div>
        <div className="header-cell">LinkedIn</div>
        <div className="header-cell">X (Twitter)</div>
      </div>
      
      <div className="table-row">
        <div className="cell feature-cell">Best For</div>
        <div className="cell">B2C, Visual Brands</div>
        <div className="cell">B2B, Professionals</div>
        <div className="cell">Real-time Engagement</div>
      </div>
      
      <div className="table-row">
        <div className="cell feature-cell">Lead Volume</div>
        <div className="cell">1,000+/month</div>
        <div className="cell">2,000+/month</div>
        <div className="cell">5,000+/month</div>
      </div>
      
      <div className="table-row">
        <div className="cell feature-cell">Targeting</div>
        <div className="cell">Hashtags, Interests</div>
        <div className="cell">Job Titles, Companies</div>
        <div className="cell">Keywords, Trends</div>
      </div>
      
      <div className="table-row">
        <div className="cell feature-cell">Engagement Type</div>
        <div className="cell">Visual Content</div>
        <div className="cell">Professional Network</div>
        <div className="cell">Conversations</div>
      </div>
    </div>
  </div>
</section>

      {/* CTA Section */}
      <section className="services-cta">
        <div className="container">
          <h2>Ready to Start Generating Leads?</h2>
          <p>Choose your platform and start your free trial today. No setup fees, no long-term contracts.</p>
          <div className="cta-buttons">
            <button className="btn-primary">Start Free Trial</button>
            <button className="btn-secondary">Schedule Consultation</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;