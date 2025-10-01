import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import axios from 'axios';
import './PricingPlans.css';

const PricingPlans = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  useEffect(() => {
    fetchPackageData();
  }, [packageId]);

  const fetchPackageData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching package with ID:', packageId);
      
      if (!packageId || packageId === 'undefined') {
        console.error('❌ Invalid package ID:', packageId);
        navigate('/subscriptions');
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/packages/${packageId}`);
      
      if (response.data.success) {
        setPackageData(response.data.package);
      } else {
        console.error('Failed to fetch package data:', response.data.message);
        navigate('/subscriptions');
      }
    } catch (error) {
      console.error('Error fetching package data:', error);
      navigate('/subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelection = async (billingPeriod) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Create checkout session with selected billing period
      const successUrl = `${window.location.origin}/subscriptions?status=success`;
      const cancelUrl = `${window.location.origin}/subscriptions?status=cancel`;
      
      console.log('🚀 Creating checkout session with:', {
        packageId,
        billingPeriod,
        successUrl,
        cancelUrl
      });
      
      const requestData = {
        packageId: packageId,
        billingPeriod: billingPeriod,
        successUrl: successUrl,
        cancelUrl: cancelUrl
      };
      
      console.log('📤 Sending request data:', requestData);
      
      const response = await axios.post(`${API_BASE_URL}/api/billing/create-checkout-session`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📥 Response received:', response.data);

      if (response.data.success) {
        console.log('✅ Checkout session created successfully');
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        console.error('❌ Checkout session creation failed:', response.data.message);
        alert(`Failed to create checkout session: ${response.data.message}`);
      }
    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to create checkout session. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pricing-plans-container">
        <div className="loading-spinner">
          <p>Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="pricing-plans-container">
        <div className="error-message">
          <h2>Package not found</h2>
          <p>The package you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/subscriptions')} className="btn-primary">
            Back to Subscriptions
          </button>
        </div>
      </div>
    );
  }

  const { pricing } = packageData;

  return (
    <div className="pricing-plans-container">
      <div className="pricing-plans-header">
        <button 
          onClick={() => navigate('/subscriptions')} 
          className="back-button"
        >
          ← Back to Subscriptions
        </button>
        
        <div className="package-header">
          <div className="package-logo">
            <img 
              src={process.env.PUBLIC_URL + packageData.logo} 
              alt={`${packageData.platform} Logo`}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="package-info">
            <h1>{packageData.name}</h1>
            <p className="package-platform">{packageData.platform}</p>
            <p className="package-description">{packageData.description}</p>
          </div>
        </div>
      </div>

      <div className="pricing-plans-content">
        <h2>Choose Your Billing Plan</h2>
        <p>Select the billing cycle that works best for you</p>
        
        <div className="pricing-cards">
          {/* Monthly Plan */}
          <div className={`pricing-card ${selectedPlan === 'monthly' ? 'selected' : ''}`}>
            <div className="plan-header">
              <h3>Monthly</h3>
              <div className="plan-price">
                <span className="currency">$</span>
                <span className="amount">{pricing.monthly.amount}</span>
                <span className="period">/month</span>
              </div>
            </div>
            <div className="plan-features">
              <ul>
                {packageData.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            <button 
              className="select-plan-btn"
              onClick={() => handlePlanSelection('monthly')}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Start Free Trial'}
            </button>
          </div>

          {/* Quarterly Plan */}
          <div className={`pricing-card ${selectedPlan === 'quarterly' ? 'selected' : ''}`}>
            {pricing.quarterly.discount && (
              <div className="discount-badge">
                Save {pricing.quarterly.discount}
              </div>
            )}
            <div className="plan-header">
              <h3>Quarterly</h3>
              <div className="plan-price">
                <span className="currency">$</span>
                <span className="amount">{pricing.quarterly.amount}</span>
                <span className="period">/quarter</span>
              </div>
            </div>
            <div className="plan-features">
              <ul>
                {packageData.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            <button 
              className="select-plan-btn"
              onClick={() => handlePlanSelection('quarterly')}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Start Free Trial'}
            </button>
          </div>

          {/* Yearly Plan */}
          <div className={`pricing-card ${selectedPlan === 'yearly' ? 'selected' : ''}`}>
            {pricing.yearly.discount && (
              <div className="discount-badge">
                Save {pricing.yearly.discount}
              </div>
            )}
            <div className="plan-header">
              <h3>Yearly</h3>
              <div className="plan-price">
                <span className="currency">$</span>
                <span className="amount">{pricing.yearly.amount}</span>
                <span className="period">/year</span>
              </div>
            </div>
            <div className="plan-features">
              <ul>
                {packageData.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            <button 
              className="select-plan-btn"
              onClick={() => handlePlanSelection('yearly')}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Start Free Trial'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;