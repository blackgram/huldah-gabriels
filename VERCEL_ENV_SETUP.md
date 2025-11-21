# Vercel Environment Variables Setup

## Issue
The error "Neither apiKey nor config.authenticator provided" means Vercel CLI is not loading your `.env.local` file.

## Solution

### Option 1: Use Vercel Environment Variables (Recommended)

Vercel CLI can load environment variables from the Vercel dashboard or a `.env` file:

1. **Pull environment variables from Vercel**:
   ```bash
   vercel env pull .env.local
   ```
   
   This will download environment variables from your Vercel project and create/update `.env.local`.

2. **Or manually add to `.env.local`**:
   Make sure your `.env.local` file has:
   ```bash
   STRIPE_SECRET_KEY=sk_test_your_key_here
   ```

3. **Restart Vercel dev**:
   ```bash
   # Stop the current vercel dev (Ctrl+C)
   # Then restart:
   vercel dev
   ```

### Option 2: Use `.env` instead of `.env.local`

Vercel CLI might prefer `.env` file:

1. **Copy your `.env.local` to `.env`**:
   ```bash
   cp .env.local .env
   ```

2. **Restart vercel dev**

### Option 3: Set Environment Variables Directly

You can also set environment variables when starting Vercel dev:

```bash
STRIPE_SECRET_KEY=sk_test_your_key_here vercel dev
```

## Verify Environment Variables are Loaded

After restarting `vercel dev`, check the terminal output. You should see environment variables being loaded.

If you still get the error, check:

1. **File location**: `.env.local` should be in the project root (same directory as `package.json`)
2. **File format**: Make sure there are no spaces around the `=` sign:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...  # ✅ Correct
   STRIPE_SECRET_KEY = sk_test_... # ❌ Wrong (spaces)
   ```
3. **No quotes**: Don't wrap the value in quotes unless necessary
4. **Restart**: Always restart `vercel dev` after changing `.env.local`

## Testing

After setting up, try the Stripe checkout again. The error should change from "Neither apiKey..." to a more specific error if there are other issues.

