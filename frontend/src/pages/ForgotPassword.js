import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import './Login.css'; // Reuse login styles

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const backendUrl = API_BASE_URL;
      
      const response = await axios.post(`${backendUrl}/api/auth/forgot-password`, {
        email: email.trim()
      });

      if (response.data.success) {
        setMessage('Password reset email sent! Please check your inbox.');
        setIsSuccess(true);
        setEmail('');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map(error => error.msg).join(', ');
        setError(errorMessages);
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay"></div>
      </div>
      
      <div className="login-card">
        <div className="login-content">
          <div className="login-header">
            <h1 className="login-title">Forgot Password</h1>
            <p className="login-subtitle">Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message" style={{
                color: '#ff4444',
                backgroundColor: '#ffebee',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #ffcdd2',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
            
            {message && (
              <div className="success-message" style={{
                color: '#4caf50',
                backgroundColor: '#e8f5e8',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #c8e6c9',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {message}
              </div>
            )}

            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  disabled={loading || isSuccess}
                  autoComplete="email"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading || isSuccess}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : isSuccess ? (
                'Email Sent!'
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
          
          <div className="login-footer">
            <p>
              Remember your password? <Link to="/login" className="register-link">Sign In</Link>
            </p>
            <p>
              Don't have an account? <Link to="/signup" className="register-link">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;