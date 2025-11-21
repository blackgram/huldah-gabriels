# PayPal Payment Integration Setup Guide

## Overview
PayPal payment integration has been implemented using PayPal React SDK. Customers can complete payments directly through PayPal's secure payment buttons.

## Setup Instructions

### 1. Get Your PayPal Client ID

1. Sign up for a PayPal Business account at https://www.paypal.com/business
2. Navigate to the [PayPal Developer Dashboard](https://developer.paypal.com/)
3. Log in with your PayPal Business account
4. Go to **Dashboard** → **My Apps & Credentials**
5. Click **Create App** (or use existing app)
6. Copy your **Client ID** (starts with `A` for sandbox or `A` for live)

### 2. Set Environment Variables

Add your PayPal Client ID to your environment variables:

#### For Local Development (.env.local):
```bash
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id_here
```

#### For Vercel Deployment:
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `VITE_PAYPAL_CLIENT_ID`
   - **Value**: Your PayPal Client ID
   - **Environment**: Production, Preview, Development (select all)

### 3. Test Mode vs Live Mode

- **Sandbox Mode**: Use sandbox Client ID
  - Test with PayPal sandbox accounts
  - No real money is processed
  - Create test accounts in PayPal Developer Dashboard

- **Live Mode**: Switch to live Client ID when ready for production
  - Requires PayPal Business account approval
  - Processes real payments
  - Update environment variable with live Client ID

### 4. How It Works

1. Customer fills out checkout form
2. Selects "PayPal" as payment method
3. PayPal payment button appears (if form is valid)
4. Customer clicks PayPal button
5. PayPal popup/modal opens for payment
6. Customer completes payment through PayPal
7. System captures payment and redirects to success page
8. Confirmation email is sent automatically

### 5. Success/Failure Handling

- **Success**: Redirects to `/checkout/success?payment_method=paypal&reference={TRANSACTION_ID}`
- **Cancel**: Redirects to `/checkout/failure`
- **Error**: Shows error toast and stays on checkout modal

### 6. Testing

1. Use PayPal sandbox Client ID
2. Create sandbox buyer account in PayPal Developer Dashboard
3. Complete a test checkout
4. Use sandbox buyer credentials to test payment
5. Check PayPal Dashboard → **Transactions** to see the transaction

### 7. PayPal Button Styling

The PayPal buttons are configured with:
- **Layout**: Vertical (stacked buttons)
- **Color**: Gold (PayPal brand color)
- **Shape**: Rectangular
- **Label**: PayPal

You can customize these in `CheckoutModal.tsx` if needed.

## Files Modified

- `src/main.tsx` - Added PayPalScriptProvider wrapper
- `src/components/CheckoutModal.tsx` - Added PayPal buttons and success handler
- `src/components/CheckoutSuccess.tsx` - Added PayPal order support
- `package.json` - Added `@paypal/react-paypal-js` package

## Security Notes

- Client ID is safe to expose in frontend code (it's public)
- PayPal handles all PCI compliance requirements
- Payment processing happens securely through PayPal's servers
- Never expose PayPal Secret/Client Secret in frontend code

## Support

For issues or questions:
- PayPal Developer Documentation: https://developer.paypal.com/docs
- PayPal Support: https://www.paypal.com/support

