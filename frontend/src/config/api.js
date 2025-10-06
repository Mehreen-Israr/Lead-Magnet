// API Configuration for different environments
const getApiBaseUrl = () => {
  // Check if we're in production (deployed)
  const isProduction = window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1' &&
                      !window.location.hostname.includes('localhost');
  
  if (isProduction) {
    // Production URL - your actual backend URL
    return 'https://2uepc2kf3f.execute-api.eu-west-2.amazonaws.com/prod';
  }
  
  // Development - use localhost
  return 'http://localhost:5000';
};

// Export the API base URL
export const API_BASE_URL = getApiBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  PACKAGES: `${API_BASE_URL}/api/packages`,
  AUTH: `${API_BASE_URL}/api/auth`,
  CONTACT: `${API_BASE_URL}/api/contact`,
  BILLING: `${API_BASE_URL}/api/billing`,
  CALENDLY: `${API_BASE_URL}/api/calendly`,
  HEALTH: `${API_BASE_URL}/health`
};

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  try {
    console.log('🌐 Making API call to:', endpoint);
    console.log('🌐 Current hostname:', window.location.hostname);
    console.log('🌐 Is production:', window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
    
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit', // Don't send credentials for public endpoints
      ...options
    });
    
    console.log('🌐 API Response status:', response.status);
    console.log('🌐 API Response headers:', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🌐 API Error response:', errorText);
      throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('🌐 API Success - Data received:', data);
    return data;
  } catch (error) {
    console.error('🌐 API call error:', error);
    console.error('🌐 Error details:', {
      message: error.message,
      stack: error.stack,
      endpoint: endpoint
    });
    throw error;
  }
};

export default API_BASE_URL;
