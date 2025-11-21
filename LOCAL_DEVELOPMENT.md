# Local Development Setup for Stripe API

## Problem
The Stripe API endpoint (`/api/create-stripe-checkout`) is a Vercel serverless function that doesn't work with Vite's dev server directly.

## Solution Options

### Option 1: Use Vercel CLI (Recommended)

Vercel CLI allows you to run serverless functions locally:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project** (first time only):
   ```bash
   vercel link
   ```

4. **Run development server with API support**:
   ```bash
   npm run dev:vercel
   ```
   
   This will start both the frontend and API routes on `http://localhost:3000`

### Option 2: Use Environment Variable

If you're running Vercel dev on a different port or URL:

1. Create a `.env.local` file:
   ```bash
   VITE_API_URL=http://localhost:3000/api
   ```

2. Run Vercel dev:
   ```bash
   vercel dev
   ```

3. The CheckoutModal will automatically use the correct API URL

### Option 3: Deploy to Vercel Preview

For testing with real API endpoints:

1. Push your code to GitHub
2. Vercel will automatically create a preview deployment
3. Test Stripe checkout on the preview URL

## Quick Start

```bash
# Install Vercel CLI (one time)
npm install -g vercel

# Login (one time)
vercel login

# Link project (one time)
vercel link

# Start dev server with API support
npm run dev:vercel
```

## Environment Variables

Make sure you have a `.env.local` file with:

```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

Vercel CLI will automatically load environment variables from:
- `.env.local` (local development)
- Vercel dashboard (production/preview)

## Troubleshooting

### 404 Error on API Routes
- Make sure you're using `npm run dev:vercel` instead of `npm run dev`
- Check that `vercel dev` is running on port 3000
- Verify your `.env.local` has `STRIPE_SECRET_KEY` set

### CORS Errors
- Vercel dev handles CORS automatically
- If issues persist, check `vercel.json` headers configuration

### Environment Variables Not Loading
- Restart `vercel dev` after adding environment variables
- Check `.env.local` is in the project root
- Verify variable names match exactly (case-sensitive)

