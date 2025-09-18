import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserPlus, FaBoxOpen, FaMagnet, FaPaperPlane } from 'react-icons/fa';
import './HowItWorks.css';

const HowItWorks = () => {
  const sectionRef = useRef(null);
  
  const steps = [
    {
      id: 1,
      title: "Open free account",
      description: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
      icon: <FaUserPlus className="step-icon" />
    },
    {
      id: 2,
      title: "Submit your design",
      description: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
      icon: <FaBoxOpen className="step-icon" />
    },
    {
      id: 3,
      title: "Grow in the community",
      description: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
      icon: <FaMagnet className="step-icon" />
    }
  ];

  return (
    <section className="how-it-works" ref={sectionRef}>
  <div className="container">
    {/* Wrap heading and subtitle */}
    <div className="how-it-works-text">
      <h1 className='.section-title'>
        How It Works
      </h1>
      <motion.p 
        className="section-subtitle"
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