import React, { useState, useRef, useEffect } from 'react';
import { InlineWidget, PopupWidget } from 'react-calendly';
import './Contact.css';
import '../animations.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Contact = () => {
  // Ref for intersection observer
  const observerRefs = useRef([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    service: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showCalendly, setShowCalendly] = useState(false);
  const [visibleCards, setVisibleCards] = useState([]);
  
  // Set up intersection observer for cards
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index);
          setTimeout(() => {
            setVisibleCards(prev => [...prev, index]);
          }, 200 * index);
          observer.unobserve(entry.target);
        }
      });
    }, options);
    
    // Observe all card refs
    observerRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });
    
    return () => {
      observerRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear any previous error messages when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSubmitStatus('');
    
    try {
      // Get the backend URL from environment or use default
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      
      const response = await fetch(`${backendUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form after successful submission
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          message: '',
          service: ''
        });
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus('');
        }, 5000);
      } else {
        // Handle validation errors or server errors
        setErrorMessage(data.message || 'Failed to send message. Please try again.');
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: "📧",
      title: "Email Us",
      details: "contact@magnetleads.ai",
      description: "Get in touch for any questions or support needs",
      link: "https://mail.google.com/mail/?view=cm&fs=1&to=contact@magnetleads.ai"
    },
    {
      icon: "📞",
      title: "Call Us",
      details: "001 262 327 6717",
      link: "tel:0012623276717",
      description: "Speak directly with our lead generation experts"
    },
    {
      icon: "📍",
      title: "Our Location",
      details: "330 East Charleston Road, Palo Alto, 94306 California",
      description: "Visit us at our office for a personalized consultation",
      link: "https://www.google.com/maps/search/?api=1&query=330+East+Charleston+Road+Palo+Alto+94306+California"
    }
  ];


  return (
    <div className="contact">
      {/* Hero Banner */}
      <div className="banner-container">
        <div className="banner-background"></div>
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <h1 className="banner-title fadeInUp">Get In Touch</h1>
          <p className="banner-subtitle fadeInUp" style={{ animationDelay: '0.3s' }}>
            Ready to transform your lead generation? Let's discuss how LeadMagnet can help grow your business.
          </p>
        </div>
      </div>

      {/* Contact Form & Info Section */}
      <section className="contact-main">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-section fade-in animate">
              <h2 className="slide-left animate">Send Us a Message</h2>
              <p className="slide-left animate animate-delay-1">Fill out the form below and we'll get back to you within 24 hours.</p>
              
              {submitStatus === 'success' && (
                <div className="success-message">
                  <span className="success-icon">✓</span>
                  Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}
              
              {submitStatus === 'error' && errorMessage && (
                <div className="error-message">
                  <span className="error-icon">⚠</span>
                  {errorMessage}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="contact-form fade-in animate animate-delay-2">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="company">Company Name</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your company name"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="service">Service Interest</label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="">Select a service</option>
                    <option value="instagram">Instagram Outreach</option>
                    <option value="linkedin">LinkedIn Starter</option>
                    <option value="twitter">X Growth</option>
                    <option value="custom">Custom Solution</option>
                    <option value="consultation">Free Consultation</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder="Tell us about your business and lead generation goals..."
                    disabled={isSubmitting}
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className={`submit-btn ${isSubmitting ? 'submitting' : ''} btn-hover-slide`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
            
            {/* Contact Info */}
            <div className="contact-info-section fade-in animate">
              <h2 className="slide-right animate">Contact Information</h2>
              <p className="slide-right animate animate-delay-1">Multiple ways to reach our team of lead generation experts.</p>
              
              <div className="contact-info-grid">
                {contactInfo.map((info, index) => (
                  <div 
                    key={index} 
                    ref={el => observerRefs.current[index] = el}
                    data-index={index}
                    className={`contact-info-card scale-in ${visibleCards.includes(index) ? 'animate' : ''}`}
                    onClick={() => info.link && window.open(info.link, '_blank')}
                    style={{ cursor: info.link ? 'pointer' : 'default' }}
                  >
                    <div className="info-icon">{info.icon}</div>
                    <h3>{info.title}</h3>
                    <p className="info-details">{info.details}</p>
                    <p className="info-description">{info.description}</p>
                  </div>
                ))}
              </div>
              
              {/* Calendly Integration */}
              <div className="calendly-section slide-up animate animate-delay-3">
                <h3>Schedule a Demo</h3>
                <p>Book a 30-minute demo to see LeadMagnet in action.</p>
                
                {!showCalendly ? (
                  <button 
                    onClick={() => setShowCalendly(true)}
                    className="calendly-btn btn-hover-slide"
                  >
                    📅 Book Demo Call
                  </button>
                ) : (
                  <div className="calendly-widget-container">
                    <button 
                      onClick={() => setShowCalendly(false)}
                      className="calendly-close-btn"
                    >
                      ✕ Close Scheduler
                    </button>
                    <InlineWidget 
                      url="https://calendly.com/leadmagnet-notifications/demo"
                      styles={{
                        height: '700px',
                        width: '100%'
                      }}
                      onLoad={() => {
                        console.log('✅ Calendly widget loaded successfully');
                      }}
                      onError={(error) => {
                        console.error('❌ Calendly widget error:', error);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Contact;