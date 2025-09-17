import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus('success');
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: '',
        service: ''
      });
    }, 2000);
  };

  const contactInfo = [
    {
      icon: "📧",
      title: "Email Us",
      details: "support@leadmagnet.ai",
      description: "Get in touch for any questions or support needs"
    },
    {
      icon: "📞",
      title: "Call Us",
      details: "+1 (555) 123-4567",
      description: "Speak directly with our lead generation experts"
    },
    {
      icon: "📍",
      title: "Visit Us",
      details: "123 Business Avenue, Silicon Valley, CA, USA",
      description: "Our headquarters in the heart of tech innovation"
    },
    {
      icon: "🕐",
      title: "Business Hours",
      details: "24/7 Support Available",
      description: "We're here whenever you need assistance"
    }
  ];

  const faqs = [
    {
      question: "How quickly can I start receiving leads?",
      answer: "Most campaigns are live within 24-48 hours of signup. You'll typically see your first leads within the first week."
    },
    {
      question: "What platforms do you support?",
      answer: "We currently support LinkedIn, Instagram, and X (Twitter) with plans to expand to additional platforms."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time with no cancellation fees or penalties."
    },
    {
      question: "Do you offer custom solutions for enterprise clients?",
      answer: "Absolutely! We provide custom enterprise solutions with dedicated account management and tailored strategies."
    }
  ];

  return (
    <div className="contact">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <h1 className="hero-title">Get In Touch</h1>
          <p className="hero-subtitle">
            Ready to transform your lead generation? Let's discuss how LeadMagnet can help grow your business.
          </p>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="contact-main">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-section">
              <h2>Send Us a Message</h2>
              <p>Fill out the form below and we'll get back to you within 24 hours.</p>
              
              {submitStatus === 'success' && (
                <div className="success-message">
                  <span className="success-icon">✓</span>
                  Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="contact-form">
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
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
            
            {/* Contact Info */}
            <div className="contact-info-section">
              <h2>Contact Information</h2>
              <p>Multiple ways to reach our team of lead generation experts.</p>
              
              <div className="contact-info-grid">
                {contactInfo.map((info, index) => (
                  <div key={index} className="contact-info-card">
                    <div className="info-icon">{info.icon}</div>
                    <h3>{info.title}</h3>
                    <p className="info-details">{info.details}</p>
                    <p className="info-description">{info.description}</p>
                  </div>
                ))}
              </div>
              
              {/* Calendly Integration */}
              <div className="calendly-section">
                <h3>Schedule a Demo</h3>
                <p>Book a 30-minute demo to see LeadMagnet in action.</p>
                <a 
                  href="https://calendly.com/leadmagnet-demo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="calendly-btn"
                >
                  📅 Book Demo Call
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <div className="container">
          <h2 className="section-title">Our Location</h2>
          <div className="map-container">
            <div className="map-placeholder">
              <div className="map-content">
                <div className="map-icon">📍</div>
                <h3>LeadMagnet Headquarters</h3>
                <p>123 Business Avenue<br />Silicon Valley, CA 94000<br />United States</p>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="map-link">
                  View on Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="contact-cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Don't wait – start generating qualified leads today with our free trial.</p>
          <button className="btn-primary">Start Free Trial</button>
        </div>
      </section>
    </div>
  );
};

export default Contact;