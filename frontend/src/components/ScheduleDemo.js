import React, { useState } from 'react';
import { InlineWidget } from 'react-calendly';
import './ScheduleDemo.css';

const ScheduleDemo = ({ variant = 'default' }) => {
  const [showCalendly, setShowCalendly] = useState(false);

  return (
    <section className={`schedule-demo-section ${variant}`}>
      <div className="schedule-demo-container">
        <h2 className="schedule-demo-title">Schedule a Demo</h2>
        <p className="schedule-demo-subtitle">
          Book a 30-minute demo to see LeadMagnet in action.
        </p>
        
        {!showCalendly ? (
          <button 
            onClick={() => setShowCalendly(true)}
            className="schedule-demo-btn"
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
              utm={{
                utmCampaign: 'homepage-demo',
                utmSource: 'website',
                utmMedium: 'inline-widget'
              }}
              onEventScheduled={(e) => {
                console.log('Event scheduled:', e.data.payload);
                setShowCalendly(false);
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default ScheduleDemo;