// Production Configuration
// Update these URLs when you deploy your backend

export const PRODUCTION_CONFIG = {
  // Replace with your actual backend URL when deployed
  BACKEND_URL: 'https://leadmagnet-backend.onrender.com', // Update this!
  
  // Common deployment URLs (choose one):
  // Render: https://your-app-name.onrender.com
  // Heroku: https://your-app-name.herokuapp.com
  // Railway: https://your-app-name.railway.app
  // Vercel: https://your-app-name.vercel.app
  // Netlify: https://your-app-name.netlify.app
};

// Instructions for deployment:
/*
1. Deploy your backend to a cloud service (Render, Heroku, Railway, etc.)
2. Get your backend URL from the deployment service
3. Update BACKEND_URL above with your actual URL
4. Update the API configuration in api.js
5. Redeploy your frontend

Example:
- Backend deployed to: https://lead-magnet-backend.onrender.com
- Update BACKEND_URL: 'https://lead-magnet-backend.onrender.com'
- Update api.js: return 'https://lead-magnet-backend.onrender.com';
*/
