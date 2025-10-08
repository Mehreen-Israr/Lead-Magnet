# 🔧 Calendly Webhook Setup - Upgrade Required

## 🚨 **Issue Found**
Your Calendly account needs to be upgraded to **Standard** plan to use webhooks.

## 📋 **Current Error**
```
"title": "Permission Denied",
"message": "Please upgrade your Calendly account to Standard"
```

## 🚀 **Solution: Upgrade Calendly Plan**

### **Step 1: Upgrade to Calendly Standard**
1. **Go to Calendly Settings:**
   - Login to [calendly.com](https://calendly.com)
   - Go to Settings → Billing

2. **Upgrade to Standard Plan:**
   - Click "Upgrade to Standard"
   - Standard plan starts at $8/month per user
   - This enables webhook functionality

3. **Verify Upgrade:**
   - Check that your plan shows "Standard" or higher
   - Webhook features should now be available

### **Step 2: Set Up Webhook After Upgrade**
Once upgraded, run:
```bash
cd backend
node scripts/setup-aws-webhooks.js
```

### **Alternative: Use Stripe Webhooks Only**
If you don't want to upgrade Calendly right now, you can:
1. **Set up only Stripe webhooks:**
   ```bash
   cd backend
   node scripts/setup-stripe-webhook-only.js
   ```

2. **Handle Calendly manually:**
   - Users can still book through Calendly
   - You'll need to manually process bookings
   - Or implement a different booking system

## 💰 **Calendly Pricing**
- **Free:** No webhooks
- **Standard:** $8/month - Includes webhooks
- **Teams:** $8/month per user - Includes webhooks
- **Enterprise:** Custom pricing - Full features

## 🔄 **After Upgrade**
Once you've upgraded to Standard:
1. Run the webhook setup script
2. Test with a real Calendly booking
3. Check CloudWatch logs for webhook activity
4. Verify bookings are saved to your database

## 📞 **Need Help?**
- Calendly Support: [help.calendly.com](https://help.calendly.com)
- Check webhook documentation: [developer.calendly.com](https://developer.calendly.com)
