import React, { useEffect, useRef } from 'react';
import './Services.css';
import '../animations.css';
import GrowthPlanSection from '../components/GrowthPlanSection';
const Services = () => {
  
  // Define processSteps array first
  const processSteps = [
    {
      step: "01",
      title: "Strategy Development",
      description: "We analyze your target audience and create a customized outreach strategy for each platform."
    },
    {
      step: "02",
      title: "AI Targeting",
      description: "Our AI algorithms are configured to identify and target your ideal prospects with precision."
    },
    {
      step: "03",
      title: "Campaign Launch",
      description: "We launch your campaigns across selected platforms with automated sequences and monitoring."
    },
    
  ];

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);

    // Add a small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      const animatedElements = document.querySelectorAll('.fade-in, .slide-left, .slide-right, .slide-up, .scale-in, .rotate-in');
      animatedElements.forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      const animatedElements = document.querySelectorAll('.fade-in, .slide-left, .slide-right, .slide-up, .scale-in, .rotate-in');
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="services">
      {/* Hero Section */}
      <div className="banner-container">
        <div className="banner-background"></div>
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <h1 className="banner-title fade-in">Our Lead Generation Services</h1>
          <p className="banner-subtitle fade-in animate-delay-2">
            Choose from our specialized platforms to reach your ideal customers where they spend their time.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <section className="services-grid">
        <div className="container">
          <h2 className="Services-section-title fade-in">Our Social Media Services</h2>
          <p className="section-subtitleService fade-in animate-delay-1">
            Specialized solutions to grow your brand across major social platforms
          </p>
          
          <div className="services-cards">
            {/* Instagram Service Card */}
            <div className="service-card instagram-card scale-in animate-delay-1">
              <div className="service-icon">
                <img src="/instagram.png" alt="Instagram" className="platform-logo" />
               
              </div>
              <h3 className="service-title">INSTAGRAM OUTREACH</h3>
              <p className="service-description">
                The user connects with their ideal audience on Instagram through targeted outreach and engagement strategies.
              </p>
            </div>
            
            {/* LinkedIn Service Card */}
            <div className="service-card linkedin-card scale-in animate-delay-2">
              <div className="service-icon">
                <img src="/linkedin.png" alt="LinkedIn" className="platform-logo" />
               
              </div>
              <h3 className="service-title">LINKEDIN STARTER</h3>
              <p className="service-description">
                Professional networking at scale to connect with decision makers and industry leaders on the world's largest professional platform.
              </p>
            </div>
            
            {/* X (Twitter) Service Card */}
            <div className="service-card x-card scale-in animate-delay-3">
              <div className="service-icon">
                <img src="/twitter.png" alt="X (Twitter)" className="platform-logo" />
               
              </div>
              <h3 className="service-title">X GROWTH</h3>
              <p className="service-description">
                Harness the power of real-time conversations on X (Twitter) to engage with prospects and build your brand presence.
              </p>
            </div>
          </div>
        </div>
      </section>
      <GrowthPlanSection />
      {/* Process Section */}
      <section className="service-process" style={{background: "white", padding: "120px 0"}}>
        <div className="container" style={{background: "transparent"}}>
          <h2 className="section-title fade-in">How It Works</h2>
          <p className="section-subtitle fade-in animate-delay-1">
            Our proven 4-step process ensures maximum results from your lead generation campaigns.
          </p>
          <div className="process-carousel">
            <div className="process-grid">
              {processSteps.map((step, index) => (
                <div key={index} className={`process-step slide-up animate-delay-${index + 1}`}>
                  <div className="step-number">{step.step}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

     {/* Comparison Section */}
<section className="comparison">
  <div className="container">
    <h2 className="section-title fade-in">Platform Comparison</h2>
    <div className="comparison-table fade-in animate-delay-1">
      <div className="table-wrapper">
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
  </div>
</section>

      {/* CTA Section */}
      
    </div>
  );
};

export default Services;