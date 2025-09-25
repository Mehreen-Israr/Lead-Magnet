# 🔧 Calendly Webhook Setup Guide

## 🚨 **Current Issue**
Your Calendly webhook is not storing data because the environment variables are not properly configured.

## 📋 **Step-by-Step Fix**

### **Step 1: Get Calendly API Credentials**

1. **Login to Calendly:**
   - Go to [calendly.com](https://calendly.com)
   - Login to your account

2. **Get API Token:**
   - Go to Settings → Integrations → API & Webhooks
   - Click "Create New Token"
   - Name: "Lead Magnet Integration"
   - Copy the token (starts with `eyJ...`)

3. **Get Webhook Secret:**
   - In the same section, scroll down to "Webhooks"
   - Click "Create Webhook"
   - Generate a signing key/secret
   - Copy the secret

### **Step 2: Update Your .env File**

Open `backend/.env` and add/update these values:

```env
# Calendly Configuration
CALENDLY_API_TOKEN=eyJ_your_actual_token_here
CALENDLY_WEBHOOK_SECRET=your_actual_webhook_secret_here
WEBHOOK_URL=https://leadmagnet-backend.onrender.com/api/calendly/webhook

# Email Configuration (for notifications)
EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# Database
MONGODB_URI=your_mongodb_connection_string
```

### **Step 3: Test Your Configuration**

```bash
cd backend
node scripts/test-calendly-setup.js
```

### **Step 4: Register Webhook with Calendly**

```bash
cd backend
node scripts/setup-webhook-proper.js
```

### **Step 5: Test the Complete Flow**

```bash
cd backend
node scripts/test-booking-flow.js
```

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **"Missing environment variables"**
   - Make sure your .env file has all required variables
   - Check that values are not placeholders

2. **"Webhook URL not accessible"**
   - Make sure your backend is deployed to Render
   - Test the URL: `https://leadmagnet-backend.onrender.com/health`

3. **"No webhooks found"**
   - Run the setup script to register webhook
   - Check Calendly dashboard for webhook status

4. **"Bookings not saving"**
   - Check webhook endpoint is accessible
   - Verify webhook is registered with Calendly
   - Test with a real Calendly booking

### **Debug Commands:**

```bash
# Test environment variables
node scripts/test-calendly-setup.js

# Test webhook endpoint
node scripts/test-webhook.js

# Test complete booking flow
node scripts/test-booking-flow.js

# List existing webhooks
node scripts/list-webhooks.js

# Setup webhook properly
node scripts/setup-webhook-proper.js
```

## ✅ **Success Checklist**

- [ ] Calendly API token obtained and set
- [ ] Webhook secret obtained and set
- [ ] WEBHOOK_URL set to production URL
- [ ] Email configuration set
- [ ] Backend deployed and accessible
- [ ] Webhook registered with Calendly
- [ ] Test booking creates database entry
- [ ] Email notifications working

## 🎯 **Expected Result**

Once properly configured:
1. ✅ Calendly bookings will be automatically saved to database
2. ✅ Admin will receive email notifications
3. ✅ Attendees will receive confirmation emails
4. ✅ All booking data will be stored with full details

## 📞 **Need Help?**

If you're still having issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Test each step individually
4. Check server logs for errors
5. Verify webhook URL is accessible from internet
