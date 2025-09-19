
import React, { useState } from 'react';
import axios from 'axios';

const DirectBookingForm = () => {
  const [formData, setFormData] = useState({
    meetingType: 'demo',
    meetingTitle: 'Product Demo',
    scheduledTime: '',
    duration: 30,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    attendee: {
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('attendee.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        attendee: {
          ...prev.attendee,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
    // Use the same environment variable as Contact.js
    const backendUrl = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    const response = await axios.post(
      `${backendUrl}/api/calendly/direct-booking`,
      formData
    );
    
    if (response.data.success) {
      setSuccess(true);
      console.log('Booking created:', response.data.data); // Note: response.data.data not response.data.booking
    }
  }  catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="booking-success">
        <h3>🎉 Booking Confirmed!</h3>
        <p>Your meeting has been scheduled successfully. You'll receive a confirmation email shortly.</p>
        <button onClick={() => { setSuccess(false); setFormData({ ...formData, attendee: { name: '', email: '', phone: '', company: '', notes: '' } }); }}>
          Book Another Meeting
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="direct-booking-form">
      <h3>Schedule a Meeting</h3>
      
      <div className="form-group">
        <label>Meeting Type:</label>
        <select name="meetingType" value={formData.meetingType} onChange={handleChange} required>
          <option value="demo">Product Demo</option>
          <option value="consultation">Consultation</option>
          <option value="strategy">Strategy Session</option>
        </select>
      </div>

      <div className="form-group">
        <label>Meeting Title:</label>
        <input
          type="text"
          name="meetingTitle"
          value={formData.meetingTitle}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Scheduled Time:</label>
        <input
          type="datetime-local"
          name="scheduledTime"
          value={formData.scheduledTime}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Your Name:</label>
        <input
          type="text"
          name="attendee.name"
          value={formData.attendee.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          name="attendee.email"
          value={formData.attendee.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Phone (Optional):</label>
        <input
          type="tel"
          name="attendee.phone"
          value={formData.attendee.phone}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Company (Optional):</label>
        <input
          type="text"
          name="attendee.company"
          value={formData.attendee.company}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Notes (Optional):</label>
        <textarea
          name="attendee.notes"
          value={formData.attendee.notes}
          onChange={handleChange}
          rows="3"
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating Booking...' : 'Schedule Meeting'}
      </button>
    </form>
  );
};

export default DirectBookingForm;