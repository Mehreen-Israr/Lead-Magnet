import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser, FaPhone } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import './Signup.css';
import '../animations.css';
import { useAuth } from '../contexts/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const { firstName, lastName, email, phone, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Check for special character
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (!specialCharRegex.test(password)) {
      setError('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|\\,.<>?/)');
      setLoading(false);
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password
      });

      if (response.data.success) {
        // Use the auth context login method
        login(response.data.token, response.data.user);
        
        setSuccess('Registration successful! Please check your email to verify your account.');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });
        // Redirect to subscriptions page after 3 seconds
        setTimeout(() => {
          navigate('/subscriptions');
        }, 3000);
      }
    } catch (err) {
      console.error('Signup error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = err.response.data.errors.map(error => error.msg).join(', ');
        setError(errorMessages);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-background">
        <div className="signup-overlay"></div>
      </div>
      
      <div className="signup-card">
        <div className="signup-content">
          <div className="signup-header">
            <h1 className="signup-title">Create Account</h1>
            <p className="signup-subtitle">Join LeadMagnet and start growing your business</p>
          </div>
          
          <form className="signup-form" onSubmit={handleSubmit}>
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
            
            {success && (
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
                {success}
              </div>
            )}

            <div className="form-row">
              <div className="form-group half-width">
                <div className="input-wrapper">
                 
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={firstName}
                    onChange={handleChange}
                    required
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-group half-width">
                <div className="input-wrapper">
                 
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={handleChange}
                    required
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
            
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
              
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number (Optional)"
                  value={phone}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={handleChange}
                  required
                  className="form-input"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
     
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={handleChange}
                  required
                  className="form-input"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={loading}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={`signup-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>
          
          <div className="signup-footer">
            <p>Already have an account? <Link to="/login" className="login-link">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;