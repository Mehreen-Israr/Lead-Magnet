import React from 'react';
import './Home.css';
import './hero.css';
import '../animations.css';
import { AnimatedSection } from '../hooks/useScrollAnimation';
import Statistics from '../components/Statistics';
import HowItWorks from '../components/HowItWorks';
import GrowthPlanSection from '../components/GrowthPlanSection';
import Testimonials from '../components/Testimonials';

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
              <h1 className="home-hero-title">
                GROW YOUR BUSINESS WITH US<br />
                <span className="home-highlight">WE BRING YOU PAYING CUSTOMERS</span>
              </h1>
            </AnimatedSection>
            <AnimatedSection animation="slide-up" delay={400}>
            <p className="home-hero-subtitle desktop-only">
                AI-powered lead generation platform that drives qualified leads from LinkedIn, Instagram, and X saving time, optimizing outreach, and converting into real customers.
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

        {/* How It Works Section */}
        <HowItWorks />

        {/* Pricing Section */}
      <GrowthPlanSection />

      {/* Testimonials Section */}
      <Testimonials />

      
    </div>
  );
};

export default Home;