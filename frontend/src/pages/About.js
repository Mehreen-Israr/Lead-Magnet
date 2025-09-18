import React from 'react';
import './About.css';

const About = () => {
  const values = [
    {
      icon: "🎯",
      title: "Precision Targeting",
      description: "Our AI algorithms identify and target the most qualified prospects for your business."
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Automated processes that work 24/7 to generate leads while you focus on closing deals."
    },
    {
      icon: "📊",
      title: "Data-Driven Results",
      description: "Every campaign is backed by comprehensive analytics and real-time performance metrics."
    },
    {
      icon: "🤝",
      title: "Partnership Approach",
      description: "We're not just a service provider - we're your growth partner committed to your success."
    }
  ];

  const team = [
    {
      name: "Alex Thompson",
      role: "CEO & Founder",
      description: "Former VP of Growth at TechCorp with 10+ years in lead generation and AI.",
      image: "👨‍💼"
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      description: "AI specialist with expertise in machine learning and automation systems.",
      image: "👩‍💻"
    },
    {
      name: "Michael Rodriguez",
      role: "Head of Strategy",
      description: "Marketing strategist who has helped 500+ businesses scale their operations.",
      image: "👨‍🎯"
    }
  ];

  return (
    <div className="about">
      {/* Hero Banner */}
      <div className="banner-container">
        <div className="banner-background"></div>
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <h1 className="banner-title">About LeadMagnet</h1>
          <p className="banner-subtitle">
            We're revolutionizing how businesses generate leads through the power of AI and automation.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className="mission-vision">
        <div className="container">
          <div className="mission-vision-grid">
            <div className="mission-card">
              <div className="card-image">
                <img src="/1.png" alt="Our Mission"  className="horizontal-image" />
              </div>
              <h3>Our Mission</h3>
              <p>
                To empower businesses of all sizes with AI-driven lead generation tools that 
                deliver real, measurable results. We believe every business deserves access to 
                cutting-edge technology that drives growth and success.
              </p>
            </div>
            <div className="vision-card">
              <div className="card-image">
                <img src="/2.png" alt="Our Vision" className="horizontal-image" />
              </div>
              <h3>Our Vision</h3>
              <p>
                To become the world's leading AI-powered lead generation platform, helping 
                millions of businesses connect with their ideal customers and achieve 
                unprecedented growth through intelligent automation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>Our Story</h2>
              <p>
                LeadMagnet was born from a simple frustration: traditional lead generation 
                methods were time-consuming, expensive, and often ineffective. Our founder, 
                Alex Thompson, spent years in the trenches of business development, watching 
                companies struggle to find and connect with their ideal customers.
              </p>
              <p>
                In 2023, Alex assembled a team of AI specialists, marketing experts, and 
                automation engineers with one goal: create a platform that could generate 
                high-quality leads at scale using the power of artificial intelligence.
              </p>
              <p>
                Today, LeadMagnet serves hundreds of businesses worldwide, from startups to 
                enterprise companies, helping them achieve consistent, predictable growth 
                through our multi-platform lead generation system.
              </p>
            </div>
            <div className="story-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Businesses Served</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1M+</span>
                <span className="stat-label">Leads Generated</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">95%</span>
                <span className="stat-label">Client Satisfaction</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values">
        <div className="container">
          <h2 className="section-title">What Makes Us Unique</h2>
          <p className="section-subtitle">
            Our core values drive everything we do and set us apart in the lead generation industry.
          </p>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <h2>Ready to Join Our Success Story?</h2>
          <p>Let's work together to transform your lead generation and grow your business.</p>
          <div className="cta-buttons">
            <button className="btn-primary">Start Free Trial</button>
            <button className="btn-secondary">Schedule a Demo</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;