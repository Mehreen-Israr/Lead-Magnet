# 🚀 Deployment Guide for Lead Magnet

## Backend Deployment

### Option 1: Render (Recommended - Free tier available)

1. **Prepare your backend:**
   ```bash
   cd backend
   # Make sure your package.json has a start script
   ```

2. **Deploy to Render:**
   - Go to [render.com](https://render.com)
   - Sign up/login
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your backend folder
   - Configure:
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Environment:** Node
   - Add environment variables:
     - `MONGODB_URI`
     - `CALENDLY_API_TOKEN`
     - `CALENDLY_WEBHOOK_SECRET`
     - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`
     - `ADMIN_EMAIL`
   - Deploy!

3. **Get your backend URL:**
   - After deployment, you'll get a URL like: `https://your-app-name.onrender.com`
   - Copy this URL

### Option 2: Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy:**
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. **Get your backend URL:**
   - Railway will provide a URL like: `https://your-app-name.railway.app`

### Option 3: Heroku

1. **Install Heroku CLI:**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Deploy:**
   ```bash
   cd backend
   heroku create your-app-name
   git push heroku main
   ```

3. **Get your backend URL:**
   - Heroku will provide a URL like: `https://your-app-name.herokuapp.com`

## Frontend Deployment

### Update API Configuration

1. **Update the backend URL in your frontend:**
   ```javascript
   // frontend/src/config/api.js
   const getApiBaseUrl = () => {
     if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
       return 'https://YOUR_ACTUAL_BACKEND_URL.onrender.com'; // ⚠️ UPDATE THIS!
     }
     return 'http://localhost:5000';
   };
   ```

2. **Deploy your frontend:**
   - Vercel: Connect GitHub repo, deploy
   - Netlify: Connect GitHub repo, deploy
   - Render: Create new Web Service for frontend

## Calendly Webhook Setup

1. **Update webhook URL in your backend:**
   ```bash
   # Set environment variable
   export WEBHOOK_URL=https://your-backend-url.onrender.com/api/calendly/webhook
   
   # Or add to your .env file
   WEBHOOK_URL=https://your-backend-url.onrender.com/api/calendly/webhook
   ```

2. **Register webhook with Calendly:**
   ```bash
   cd backend
   node scripts/setup-webhook-proper.js
   ```

## Testing Your Deployment

1. **Test backend health:**
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```

2. **Test packages API:**
   ```bash
   curl https://your-backend-url.onrender.com/api/packages
   ```

3. **Test Calendly webhook:**
   ```bash
   cd backend
   node scripts/test-booking-flow.js
   ```

## Environment Variables Checklist

Make sure these are set in your backend deployment:

### Required for Backend:
- `MONGODB_URI` - Your MongoDB connection string
- `CALENDLY_API_TOKEN` - Your Calendly API token
- `CALENDLY_WEBHOOK_SECRET` - Your webhook secret
- `WEBHOOK_URL` - Your deployed backend URL + `/api/calendly/webhook`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` - Email configuration
- `ADMIN_EMAIL` - Admin email for notifications

### Optional:
- `NODE_ENV=production`
- `PORT` (usually auto-set by deployment platform)

## Troubleshooting

### Common Issues:

1. **"Packages not showing"**
   - Check if backend URL is correct in frontend config
   - Verify backend is deployed and accessible
   - Check browser console for API errors

2. **"Calendly webhook not working"**
   - Verify webhook URL is publicly accessible
   - Check Calendly webhook configuration
   - Test webhook endpoint manually

3. **"Database connection failed"**
   - Verify MONGODB_URI is correct
   - Check if MongoDB allows connections from your deployment platform

### Debug Commands:

```bash
# Test backend locally
cd backend
npm start

# Test API endpoints
curl http://localhost:5000/api/packages
curl http://localhost:5000/health

# Test webhook
node scripts/test-booking-flow.js
```

## Success Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Packages API working (shows packages from database)
- [ ] Calendly webhook registered and working
- [ ] Email notifications working
- [ ] All environment variables set correctly

## Need Help?

If you encounter issues:
1. Check deployment platform logs
2. Test API endpoints manually
3. Verify environment variables
4. Check browser console for errors
5. Test webhook connectivity
