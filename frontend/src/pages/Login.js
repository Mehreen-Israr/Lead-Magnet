import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import './Login.css';
import '../animations.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic client-side validation
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      
      const response = await axios.post(`${backendUrl}/api/auth/login`, {
        email: email.trim(),
        password
      });

      if (response.data.success) {
        // Store the JWT token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Set axios default header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Redirect to dashboard or home page
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = err.response.data.errors.map(error => error.msg).join(', ');
        setError(errorMessages);
      } else if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else {
        setError('Login failed. Please try again.');
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
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to access your LeadMagnet account</p>
          </div>
          
          <form className="login-form" onSubmit={handleSubmit}>
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

            <div className="form-group">
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={handleChange}
                  required
                  className="form-input"
                  disabled={loading}
                  autoComplete="current-password"
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

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
            </div>

            <button 
              type="submit" 
              className={`login-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Don't have an account? <Link to="/signup" className="signup-link">Create Account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;