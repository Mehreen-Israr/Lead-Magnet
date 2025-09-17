import React from 'react';
import './Statistics.css';
import { AnimatedSection } from '../hooks/useScrollAnimation';

const Statistics = () => {
  const statsData = [
    {
      number: "10,000+",
      label: "Leads Generated"
    },
    {
      number: "500+",
      label: "Happy Clients"
    },
    {
      number: "95%",
      label: "Success Rate"
    }
  ];

  return (
    <section className="statistics-section">
      <div className="container">
        <AnimatedSection>
          <div className="statistics-grid">
            {statsData.map((stat, index) => (
              <div key={index} className="statistic-item">
                <div className="statistic-number">{stat.number}</div>
                <div className="statistic-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Statistics;