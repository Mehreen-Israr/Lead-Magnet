// 🌐 API Configuration for different environments
const getApiBaseUrl = () => {
  // Detect environment (local vs production)
  const hostname = window.location.hostname;
  const isProduction = 
    hostname !== "localhost" && 
    hostname !== "127.0.0.1" && 
    !hostname.includes("localhost") &&
    (hostname.includes("amplifyapp.com") || hostname.includes("vercel.app") || hostname.includes("onrender.com"));

  console.log("🌐 Hostname:", hostname);
  console.log("🌐 Is production:", isProduction);

  if (isProduction) {
    // ✅ Production: AWS API Gateway base URL
    const prodUrl = process.env.REACT_APP_API_URL || "https://2uepc2kf3f.execute-api.eu-west-2.amazonaws.com/prod";
    console.log("🌐 Using production URL:", prodUrl);
    return prodUrl;
  }

  // ✅ Development: Local backend
  const devUrl = "http://localhost:5000";
  console.log("🌐 Using development URL:", devUrl);
  return devUrl;
};

// Export the API base URL
export const API_BASE_URL = getApiBaseUrl();

// ✅ API Endpoints
const isProduction = window.location.hostname !== "localhost" && 
  window.location.hostname !== "127.0.0.1" && 
  !window.location.hostname.includes("localhost") &&
  (window.location.hostname.includes("amplifyapp.com") || window.location.hostname.includes("vercel.app") || window.location.hostname.includes("onrender.com"));

export const API_ENDPOINTS = {
  PACKAGES: isProduction ? `${API_BASE_URL}/api/packages` : `${API_BASE_URL}/api/packages`,
  AUTH: isProduction ? `${API_BASE_URL}/api/auth` : `${API_BASE_URL}/api/auth`,
  CONTACT: isProduction ? `${API_BASE_URL}/api/contact` : `${API_BASE_URL}/api/contact`,
  BILLING: isProduction ? `${API_BASE_URL}/api/billing` : `${API_BASE_URL}/api/billing`,
  CALENDLY: isProduction ? `${API_BASE_URL}/api/calendly` : `${API_BASE_URL}/api/calendly`,
  HEALTH: isProduction ? `${API_BASE_URL}/api/health` : `${API_BASE_URL}/api/health`,
};

// 🛠️ Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  try {
    console.log("🌐 Making API call to:", endpoint);
    console.log("🌐 Current hostname:", window.location.hostname);
    console.log(
      "🌐 Is production:",
      window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
    );

    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      mode: "cors", // Allow CORS
      credentials: "omit", // Don't send cookies unless needed
      ...options,
    });

    console.log("🌐 API Response status:", response.status);
    console.log("🌐 API Response headers:", response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🌐 API Error response:", errorText);
      throw new Error(
        `API call failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("🌐 API Success - Data received:", data);
    return data;
  } catch (error) {
    console.error("🌐 API call error:", error);
    console.error("🌐 Error details:", {
      message: error.message,
      stack: error.stack,
      endpoint: endpoint,
    });
    throw error;
  }
};

export default API_BASE_URL;
