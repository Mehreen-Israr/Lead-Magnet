import React, { useState } from 'react';
import { AnimatedSection } from '../hooks/useScrollAnimation';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './GrowthPlanSection.css';

const GrowthPlanSection = () => {
  // Define pricing plans directly in this component
  const pricingPlans = [
    {
      name: "Instagram Outreach",
      price: "$359",
      originalPrice: "599",
      period: "/month",
      discount: "40% OFF",
      features: [
        "Content scheduling",
        "Hashtag optimization",
        "Basic analytics",
        "Email support"
      ],
      popular: false,
      trialDays: 14
    },
    {
      name: "LinkedIn Starter",
      price: "$299",
      originalPrice: "499",
      period: "/month",
      discount: "40% OFF",
      features: [
        "1000 leads/month",
        "Basic analytics",
        "Email support"
      ],
      popular: true,
      trialDays: 14
    },
    {
      name: "X Growth",
      price: "$359",
      originalPrice: "599",
      period: "/month",
      discount: "40% OFF",
      features: [
        "Unlimited posts",
        "Advanced analytics",
        "Priority support",
        "Dedicated dashboard",

      ],
      popular: false,
      trialDays: 14
    },
    {
      name: "Facebook Pro",
      price: "$399",
      originalPrice: "699",
      period: "/month",
      discount: "40% OFF",
      features: [
        "Audience targeting",
        "Ad campaign management",
        "Performance analytics",
        "24/7 support"
      ],
      popular: false,
      trialDays: 14
    }
  ];

  // Slick slider settings
  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    centerMode: false,
    cssEase: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true
        }
      }
    ]
  };
  
  // Brand logos mapping using social media logos from public folder
  const brandLogos = {
    'Instagram Outreach': (
      <img 
        src={process.env.PUBLIC_URL + "/instagram.png"} 
        alt="Instagram Logo" 
        className="brand-logo"
        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
      />
    ),
    'LinkedIn Starter': (
      <img 
        src={process.env.PUBLIC_URL + "/linkedin.png"} 
        alt="LinkedIn Logo" 
        className="brand-logo"
        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
      />
    ),
    'X Growth': (
      <img 
        src={process.env.PUBLIC_URL + "/twitter.png"} 
        alt="Twitter Logo" 
        className="brand-logo"
        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
      />
    ),
    'Facebook Pro': (
      <img 
        src={process.env.PUBLIC_URL + "/logo192.png"} 
        alt="Facebook Logo" 
        className="brand-logo"
        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
      />
    )
  };

  return (
    <section className="growth-plan-section">
      <div className="container">
        <AnimatedSection animation="fade-in">
          <h2 className="section-title">Choose Your Growth Plan</h2>
          <p className="section-subtitle">
            Select the perfect plan to accelerate your lead generation and grow your business
          </p>
        </AnimatedSection>
        
        <div className="pricing-carousel-container">
          {/* Slick Slider */}
          <Slider {...sliderSettings} className="pricing-cards-container">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`pricing-card card-hover hover-lift ${
                  plan.popular ? 'popular hover-glow' : ''
                }`}
              >
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                
                {/* Discount label */}
                {plan.discount && <div className="discount-badge">{plan.discount}</div>}
                
                <div className="plan-header">
                  {/* Brand logo */}
                  <div className="logo-container">
                    {brandLogos[plan.name] || (
                      <svg className="brand-logo" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    )}
                  </div>
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="platform-name">{plan.name.split(' ')[0]}</div>
                </div>
                
                <div className="plan-price">
                  {plan.originalPrice && (
                    <span className="original-price">${plan.originalPrice}</span>
                  )}
                  <span className="price">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                  {plan.trialDays && (
                    <div className="free-trial">{plan.trialDays}-day free trial</div>
                  )}
                </div>
                
                <ul className="plan-features">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>
                      <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="plan-button btn-hover-slide hover-lift">Start Free Trial</button>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default GrowthPlanSection;