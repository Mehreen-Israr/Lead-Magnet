# Stripe Webhook Setup Guide

## The Problem
Users are completing Stripe checkout but their subscription data is not being properly stored in the database. The webhook system needs to be properly configured.

## Solution Steps

### 1. Configure Stripe Webhook in Dashboard
1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL to: `https://your-backend-url.onrender.com/api/billing/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret to your `.env` file as `STRIPE_WEBHOOK_SECRET`

### 2. Test Webhook Endpoint
Run the test server to verify webhook connectivity:
```bash
cd backend
node scripts/test-webhook-endpoint.js
```

### 3. Environment Variables Required
Make sure these are set in your `.env` file:
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
MONGODB_URI=mongodb://...
```

### 4. Webhook Flow
1. User completes Stripe checkout
2. Stripe sends `checkout.session.completed` webhook
3. Our webhook handler updates user subscription
4. Stripe sends `customer.subscription.created` webhook
5. Our handler stores complete subscription details

### 5. Debugging
Check Render logs for webhook events:
```bash
# Look for these log messages:
✅ Checkout session completed: cs_...
✅ User subscription updated: user@email.com
✅ Full subscription details updated for: user@email.com
```

## Current Issue
The webhook is not being triggered or the webhook secret is not configured properly in Stripe dashboard.
