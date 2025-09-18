import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserPlus, FaBoxOpen, FaMagnet, FaPaperPlane } from 'react-icons/fa';
import './HowItWorks.css';

const HowItWorks = () => {
  const sectionRef = useRef(null);
  
  const steps = [
    {
      id: 1,
      title: "REGISTER",
      description: "The user creates an account on the platform by providing the necessary details such as name, email, and password.",
      icon: <FaUserPlus className="step-icon" />
    },
    {
      id: 2,
      title: "SELECT PACKAGE",
      description: "After registration, the user chooses a suitable package based on their needs and preferences.",
      icon: <FaBoxOpen className="step-icon" />
    },
    {
      id: 3,
      title: "LEAD GENERATION",
      description: "Once the package is selected, LeadMagnet automatically generates leads for the user, streamlining their marketing or outreach efforts.",
      icon: <FaMagnet className="step-icon" />
    }
  ];

  return (
    <section className="how-it-works" ref={sectionRef}>
  <div className="container">
    {/* Wrap heading and subtitle */}
    <div className="how-it-works-text">

      <h1 className='section-headingis'>
        How It Works
      </h1>
      <motion.p 
        className="section-subtitleis"
        initial={{ opacity: 5, y: 20 }}
        whileInView={{ opacity: 5, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Our simple process to help you get started
      </motion.p>
    </div>
        
<div className="timeline-container">
  {/* Vertical line */}
  <div className="timeline-line"></div>

  {/* Dots are siblings of the line, not children */}
  {steps.map((step, index) => (
    <motion.div
      key={step.id}
      className="timeline-dot"
      style={{ top: `${[20, 55, 85][index]}%`, left: '50%' }} // explicit positioning
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.3 }}
    />
  ))}

  {/* Timeline steps */}
  {steps.map((step, index) => (
    <motion.div
      key={step.id}
      className={`timeline-step ${index % 2 === 0 ? "left" : "right"}`}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.7,
        delay: index * 0.3,
        type: "spring",
        stiffness: 50,
      }}
    >
      <div className="step-number">0{step.id}</div>
      <div className="step-content">
        <div className="step-icon-container">{step.icon}</div>
        <h3 className="step-title">{step.title}</h3>
        <p className="step-description">{step.description}</p>
      </div>
    </motion.div>
  ))}
</div>


      </div>
    </section>
  );
};

export default HowItWorks;