import React from 'react';
import './WhyChooseUs.css';

const WhyChooseUs = () => {
  const advantages = [
    {
      icon: "🤖",
      title: "AI-Powered Lead Targeting",
      description: "Our advanced AI algorithms analyze millions of data points to identify your perfect prospects with 95% accuracy.",
      stats: "95% Accuracy Rate"
    },
    {
      icon: "📊",
      title: "1000+ Verified Leads/Month",
      description: "Guaranteed delivery of high-quality, verified leads that match your ideal customer profile across all platforms.",
      stats: "1000+ Leads Monthly"
    },
    {
      icon: "📈",
      title: "Smart Analytics Dashboard",
      description: "Real-time insights and performance metrics to track your campaigns and optimize for maximum ROI.",
      stats: "Real-time Tracking"
    },
    {
      icon: "💰",
      title: "Cost-Effective Subscription Plans",
      description: "Get more value for your investment with our transparent pricing and no hidden fees. Cancel anytime.",
      stats: "No Hidden Fees"
    },
    {
      icon: "🕐",
      title: "24/7 Support",
      description: "Our dedicated support team is available around the clock to help you maximize your lead generation success.",
      stats: "24/7 Availability"
    },
    {
      icon: "⚡",
      title: "Multi-Platform Automation",
      description: "Seamlessly manage campaigns across LinkedIn, Instagram, and X with our unified automation platform.",
      stats: "3 Platforms"
    }
  ];

  const comparisonData = [
    {
      feature: "Lead Quality",
      us: "AI-verified, 95% accuracy",
      competitors: "Manual verification, 60-70% accuracy",
      advantage: true
    },
    {
      feature: "Platform Coverage",
      us: "LinkedIn, Instagram, X (Twitter)",
      competitors: "Usually 1-2 platforms",
      advantage: true
    },
    {
      feature: "Setup Time",
      us: "24 hours or less",
      competitors: "1-2 weeks",
      advantage: true
    },
    {
      feature: "Monthly Leads",
      us: "1000-5000+ guaranteed",
      competitors: "500-1000 estimated",
      advantage: true
    },
    {
      feature: "Support",
      us: "24/7 dedicated support",
      competitors: "Business hours only",
      advantage: true
    },
    {
      feature: "Pricing",
      us: "Transparent, no hidden fees",
      competitors: "Hidden setup and maintenance fees",
      advantage: true
    }
  ];

  const testimonialStats = [
    {
      number: "300%",
      label: "Average Lead Increase",
      description: "Our clients see an average 300% increase in qualified leads within the first 60 days."
    },
    {
      number: "95%",
      label: "Client Satisfaction Rate",
      description: "95% of our clients rate our service as excellent and continue their subscription."
    },
    {
      number: "48hrs",
      label: "Average Setup Time",
      description: "Most campaigns are live and generating leads within 48 hours of signup."
    },
    {
      number: "500+",
      label: "Happy Businesses",
      description: "Over 500 businesses trust LeadMagnet for their lead generation needs."
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: "Sign Up",
      description: "Choose your plan and complete the quick onboarding process.",
      time: "5 minutes"
    },
    {
      step: 2,
      title: "Strategy Session",
      description: "Our experts create a customized strategy for your business.",
      time: "30 minutes"
    },
    {
      step: 3,
      title: "Campaign Launch",
      description: "We launch your AI-powered campaigns across selected platforms.",
      time: "24 hours"
    },
    {
      step: 4,
      title: "Lead Delivery",
      description: "Start receiving qualified leads and track performance in real-time.",
      time: "Ongoing"
    }
  ];

  return (
    <div className="why-choose-us">
      {/* Hero Section */}
      <section className="why-hero">
        <div className="container">
          <h1 className="hero-title">Why Choose LeadMagnet?</h1>
          <p className="hero-subtitle">
            Discover what makes us the #1 choice for businesses looking to scale their lead generation.
          </p>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="advantages">
        <div className="container">
          <h2 className="section-title">Our Competitive Advantages</h2>
          <div className="advantages-grid">
            {advantages.map((advantage, index) => (
              <div key={index} className="advantage-card">
                <div className="advantage-icon">{advantage.icon}</div>
                <h3>{advantage.title}</h3>
                <p>{advantage.description}</p>
                <div className="advantage-stat">{advantage.stats}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <h2 className="section-title">Proven Results</h2>
          <div className="stats-grid">
            {testimonialStats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
                <p className="stat-description">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="comparison">
        <div className="container">
          <h2 className="section-title">LeadMagnet vs Competitors</h2>
          <div className="comparison-table">
            <div className="table-header">
              <div className="header-cell feature-header">Feature</div>
              <div className="header-cell us-header">LeadMagnet</div>
              <div className="header-cell competitor-header">Competitors</div>
            </div>
            {comparisonData.map((item, index) => (
              <div key={index} className="table-row">
                <div className="cell feature-cell">{item.feature}</div>
                <div className="cell us-cell">
                  <span className="checkmark">✓</span>
                  {item.us}
                </div>
                <div className="cell competitor-cell">
                  <span className="cross">✗</span>
                  {item.competitors}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process">
        <div className="container">
          <h2 className="section-title">How We Deliver Results</h2>
          <p className="section-subtitle">
            Our streamlined process gets you from signup to leads in record time.
          </p>
          <div className="process-timeline">
            {processSteps.map((step, index) => (
              <div key={index} className="process-step">
                <div className="step-number">{step.step}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <span className="step-time">{step.time}</span>
                </div>
                {index < processSteps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="guarantee">
        <div className="container">
          <div className="guarantee-content">
            <div className="guarantee-icon">🛡️</div>
            <h2>Our 30-Day Money-Back Guarantee</h2>
            <p>
              We're so confident in our service that we offer a 30-day money-back guarantee. 
              If you're not completely satisfied with the quality of leads we deliver, 
              we'll refund your investment, no questions asked.
            </p>
            <div className="guarantee-features">
              <div className="guarantee-feature">
                <span className="feature-icon">✓</span>
                <span>No setup fees</span>
              </div>
              <div className="guarantee-feature">
                <span className="feature-icon">✓</span>
                <span>Cancel anytime</span>
              </div>
              <div className="guarantee-feature">
                <span className="feature-icon">✓</span>
                <span>Full refund within 30 days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="why-cta">
        <div className="container">
          <h2>Ready to Experience the LeadMagnet Difference?</h2>
          <p>Join hundreds of businesses already growing with our AI-powered lead generation.</p>
          <div className="cta-buttons">
            <button className="btn-primary">Start Free Trial</button>
            <button className="btn-secondary">Schedule Demo</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyChooseUs;