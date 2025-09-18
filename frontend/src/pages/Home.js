import React from 'react';
import './Home.css';
import './hero.css';
import '../animations.css';
import { AnimatedSection } from '../hooks/useScrollAnimation';
import Statistics from '../components/Statistics';
import GrowthPlanSection from '../components/GrowthPlanSection';

const Home = () => {

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "TechStart Inc.",
      text: "LeadMagnet increased our qualified leads by 300% in just 2 months. The AI targeting is incredibly accurate!",
      rating: 5
    },
    {
      name: "Michael Chen",
      company: "Growth Solutions",
      text: "Best investment we've made for our business. The automation saves us 20+ hours per week.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      company: "Digital Marketing Pro",
      text: "The multi-platform approach helped us reach customers we never could before. Highly recommended!",
      rating: 5
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        {/* Video Background */}
        <video className="hero-video-bg" autoPlay muted loop playsInline>
          <source src="/videobg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Dark Overlay */}
        <div className="hero-overlay"></div>
        <div className="hero-container">
            <AnimatedSection animation="fade-in" delay={200}>
              <h1 className="hero-title">
                GROW YOUR BUSINESS WITH US<br />
                <span className="highlight">WE BRING YOU PAYING CUSTOMERS</span>
              </h1>
            </AnimatedSection>
            <AnimatedSection animation="slide-up" delay={400}>
            <p className="hero-subtitle">
                AI-powered lead generation platform that helps businesses generate qualified leads 
                across LinkedIn, Instagram, and X (Twitter). Save time, optimize outreach, and 
                generate real paying customers.
              </p>
            </AnimatedSection>
            <AnimatedSection animation="slide-up" delay={600}>
              <button className="hero-action-btn">
                Get Started
                <svg className="btn-arrow" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </button>
            </AnimatedSection>
          </div>
          
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number"></span>
            <span className="stat-label"></span>
          </div>
          <div className="stat">
            <span className="stat-number"></span>
            <span className="stat-label"></span>
          </div>
          <div className="stat">
            <span className="stat-number"></span>
            <span className="stat-label"></span>
          </div>
        </div>
      </section>

        {/* Statistics Section */}
        <Statistics />

        {/* Pricing Section */}
      <GrowthPlanSection />

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <AnimatedSection animation="fade-in">
            <h2 className="section-title">What Our Clients Say</h2>
          </AnimatedSection>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={index} animation="slide-up" delay={200 + index * 200}>
                <div className="testimonial-card card-hover hover-lift">
                  <div className="stars">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="star" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="testimonial-text">"{testimonial.text}"</p>
                  <div className="testimonial-author">
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.company}</span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <AnimatedSection animation="fade-in">
            <h2>Ready to Transform Your Lead Generation?</h2>
            <p>Join thousands of businesses already growing with LeadMagnet</p>
            <button className="btn-primary large hover-lift btn-hover-slide">Start Your Free Trial Today</button>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Home;