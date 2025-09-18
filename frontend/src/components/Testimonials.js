import React from 'react';
import './Testimonials.css';
import useInView from '../hooks/useInView';

const testimonialData = [
  {
    id: 1,
    name: "Bruce Hardy",
    role: "FOUNDER",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "When white lovely valley with vapor around meadow will end become mountain sun shine.",
    rating: 5,
    color: "#ff6b6b"
  },
  {
    id: 2,
    name: "Mark Smith",
    role: "CEO",
    image: "https://randomuser.me/api/portraits/men/54.jpg",
    text: "When white lovely valley with vapor around meadow will end become mountain sun shine.",
    rating: 5,
    color: "#6b66ff"
  },
  {
    id: 3,
    name: "Mark Smith",
    role: "DESIGNER",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    text: "When white lovely valley with vapor around meadow will end become mountain sun shine.",
    rating: 5,
    color: "#ff6b6b"
  },
  {
    id: 4,
    name: "Vera Duncan",
    role: "DEVELOPER",
    image: "https://randomuser.me/api/portraits/women/29.jpg",
    text: "When white lovely valley with vapor around meadow will end become mountain sun shine.",
    rating: 5,
    color: "#ff6b6b"
  }
];

const Testimonials = () => {
  const [sectionRef, sectionInView] = useInView({ threshold: 0.1 });

  return (
    <section ref={sectionRef} className="testimonials-section">
      <div className="testimonials-container">
        <div className={`testimonials-header ${sectionInView ? 'animate' : ''}`}>
          <span className="testimonials-label">Testimonial</span>
          <h2 className="testimonials-title">We Care About Our Customers<br />Experience Too</h2>
        </div>
        
        <div className="testimonials-grid">
          {testimonialData.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className={`testimonial-card ${sectionInView ? 'animate' : ''}`}
              style={{ animationDelay: `${0.2 * index}s` }}
            >
              <div className="testimonial-image-container">
                <img src={testimonial.image} alt={testimonial.name} className="testimonial-image" />
              </div>
              <h3 className="testimonial-name">{testimonial.name}</h3>
              <p className="testimonial-role">{testimonial.role}</p>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-rating" style={{ color: testimonial.color }}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`star ${sectionInView ? 'animate' : ''}`}
                    style={{ animationDelay: `${0.2 * index + 0.1 * i + 0.5}s` }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;