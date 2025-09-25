import React, { useEffect, useRef } from 'react';
import './WhyChooseUs.css';
import { Link } from 'react-router-dom';

const WhyChooseUs = () => {
  const advantagesRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay) || 0;
          setTimeout(() => {
            entry.target.classList.add('animate-in');
          }, delay);
        }
      });
    }, observerOptions);

    // Observe advantage cards with staggered timing
    const advantageCards = document.querySelectorAll('.advantage-card');
    advantageCards.forEach((card, index) => {
      card.dataset.delay = index * 200; // 200ms stagger
      observer.observe(card);
    });

    // Observe CTA section
    const ctaSection = document.querySelector('.cta-section');
    if (ctaSection) {
      ctaSection.dataset.delay = 0;
      observer.observe(ctaSection);
    }

    return () => observer.disconnect();
  }, []);

  const advantages = [
    {
      icon: "/1.png",
      title: "AI-powered lead targeting",
      description: "Leverage advanced AI to identify and connect with the most relevant prospects, saving you time and effort.",
      direction: "left"
    },
    {
      icon: "/2.png",
      title: "1000+ verified leads/month",
      description: "Gain access to a consistent and reliable flow of high-quality leads every month to grow your business.",
      direction: "up"
    },
    {
      icon: "/3.png",
      title: "Smart analytics dashboard",
      description: "Monitor, analyze, and optimize your campaigns with a user-friendly, data-driven dashboard built for growth.",
      direction: "right"
    },
    {
      icon: "/4.png",
      title: "Cost-effective subscription plans",
      description: "Choose flexible plans designed to deliver maximum value without breaking the budget or compromising on quality.",
      direction: "left"
    },
    {
      icon: "/5.png",
      title: "24/7 support",
      description: "Our dedicated support team is always available to assist you and resolve any issues, anytime, ensuring a smooth experience.",
      direction: "up"
    },
     {
  icon: "/6.png",
  title: "Seamless CRM Integration",
  description: "Connect effortlessly with popular CRMs and tools to streamline your sales pipeline and keep all your leads organized in one place.",
  direction: "right"
}
  ];

  return (
    <div className="why-choose-us">
      {/* Hero Banner */}
      <div className="banner-container">
        <div className="banner-background"></div>
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <h1 className="banner-title">Why Choose LeadMagnet?</h1>
          <p className="banner-subtitle">
            Discover what makes us the #1 choice for businesses looking to scale their lead generation.
          </p>
        </div>
      </div>

      {/* Competitive Advantages Section */}
      <section className="advantages-section" ref={advantagesRef}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title123">Competitive Advantages</h2>
            <p className="section-subtitle123">
              Discover what sets us apart from the competition
            </p>
          </div>
          <div className="advantages-grid">
            {advantages.map((advantage, index) => (
              <div 
                key={index} 
                className={`advantage-card slide-${advantage.direction}`}
              >
                <div className="advantage-icon">
                  {advantage.icon.startsWith('/') ? 
                    <img src={advantage.icon} alt={advantage.title} className="advantage-icon-img" /> :
                    advantage.icon
                  }
                </div>
                <h3 className="advantage-title">{advantage.title}</h3>
                <p className="advantage-description">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" ref={ctaRef}>
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Lead Generation?</h2>
            <p className="cta-subtitle">
              Join thousands of businesses already growing with LeadMagnet
            </p>
            <Link to="/signup" style={{ textDecoration: "none" }}>
  <button className="cta-button123">Register Now</button>
</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyChooseUs;