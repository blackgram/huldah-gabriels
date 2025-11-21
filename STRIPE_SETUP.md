# Stripe Payment Integration Setup Guide

## Overview
Stripe payment integration has been implemented using Stripe Checkout. This allows customers to complete payments securely through Stripe's hosted checkout page.

## Setup Instructions

### 1. Get Your Stripe API Keys

1. Sign up for a Stripe account at https://stripe.com
2. Navigate to the [Stripe Dashboard](https://dashboard.stripe.com)
3. Go to **Developers** → **API keys**
4. Copy your **Publishable key** (starts with `pk_test_` for test mode)
5. Copy your **Secret key** (starts with `sk_test_` for test mode)

### 2. Set Environment Variables

Add your Stripe secret key to your environment variables:

#### For Local Development (.env.local):
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

#### For Vercel Deployment:
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: Your Stripe secret key (starts with `sk_test_` for test mode)
   - **Environment**: Production, Preview, Development (select all)

### 3. Test Mode vs Live Mode

- **Test Mode**: Use keys starting with `pk_test_` and `sk_test_`
  - Use test card numbers: `4242 4242 4242 4242`
  - Any future expiry date
  - Any 3-digit CVC
  - Any ZIP code

- **Live Mode**: Switch to live keys when ready for production
  - Keys start with `pk_live_` and `sk_live_`
  - Update environment variables with live keys

### 4. How It Works

1. Customer fills out checkout form
2. Selects "Stripe" as payment method
3. Clicks "Pay with Stripe" button
4. System creates a Stripe Checkout Session via `/api/create-stripe-checkout`
5. Customer is redirected to Stripe's secure checkout page
6. After payment, customer is redirected back to your site

### 5. Success/Cancel URLs

The checkout session redirects to:
- **Success**: `/?checkout=success&session_id={CHECKOUT_SESSION_ID}`
- **Cancel**: `/?checkout=canceled`

You can customize these URLs in `api/create-stripe-checkout.ts` if needed.

### 6. Testing

1. Use Stripe test mode keys
2. Use test card: `4242 4242 4242 4242`
3. Complete a test checkout
4. Check Stripe Dashboard → **Payments** to see the transaction

### 7. Webhooks (Optional but Recommended)

For production, set up webhooks to handle payment confirmations:

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Add endpoint: `https://yourdomain.com/api/stripe-webhook`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Create webhook handler in `/api/stripe-webhook.ts`

## Files Modified

- `api/create-stripe-checkout.ts` - Creates Stripe Checkout Session
- `src/components/CheckoutModal.tsx` - Stripe payment button and handler
- `package.json` - Added `stripe` package

## Security Notes

- Never expose your secret key in client-side code
- Always use environment variables for sensitive keys
- The secret key is only used server-side in the API endpoint
- Stripe handles all PCI compliance requirements

## Support

For issues or questions:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

