// 🌐 Unified API Configuration for Local & Production

const getApiBaseUrl = () => {
  // Detect environment (local vs production)
  const isProduction =
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1" &&
    !window.location.hostname.includes("localhost");

  if (isProduction) {
    // ✅ Production: AWS API Gateway base URL
    // Important: Do NOT add `/api` here — endpoints already include it.
    return (
      process.env.REACT_APP_API_URL ||
      "https://2uepc2kf3f.execute-api.eu-west-2.amazonaws.com/prod"
    );
  }

  // ✅ Development: Local backend (Express)
  return "http://localhost:5000";
};

// Export base URL
export const API_BASE_URL = getApiBaseUrl();

// ✅ API Endpoints (with `/api` prefix since backend routes use it)
export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/api/auth`,
  PACKAGES: `${API_BASE_URL}/api/packages`,
  CONTACT: `${API_BASE_URL}/api/contact`,
  BILLING: `${API_BASE_URL}/api/billing`,
  CALENDLY: `${API_BASE_URL}/api/calendly`,
  HEALTH: `${API_BASE_URL}/api/health`,
};

// 🛠️ Generic API call helper
export const apiCall = async (endpoint, options = {}) => {
  try {
    console.log("🌐 API call to:", endpoint);
    console.log("🌐 Hostname:", window.location.hostname);
    console.log("🌐 Base URL:", API_BASE_URL);

    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      mode: "cors",
      credentials: "omit", // Don't send cookies unless explicitly needed
      ...options,
    });

    console.log("🌐 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🌐 API error response:", errorText);
      throw new Error(
        `API call failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("✅ API success:", data);
    return data;
  } catch (error) {
    console.error("❌ API call error:", {
      message: error.message,
      endpoint,
      stack: error.stack,
    });
    throw error;
  }
};

// Example usage:
// apiCall(`${API_ENDPOINTS.AUTH}/login`, { method: "POST", body: JSON.stringify({ email, password }) });

export default API_BASE_URL;
