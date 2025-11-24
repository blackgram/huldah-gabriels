import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Get Stripe secret key from environment
// Vercel CLI loads .env.local automatically, but we can also check other sources
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.VERCEL_ENV_STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not set in environment variables');
  console.error('Available env vars with STRIPE:', Object.keys(process.env).filter(k => k.toUpperCase().includes('STRIPE')));
}

const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
      maxNetworkRetries: 2,
      timeout: 10000,
    })
  : null;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Stripe is configured
  if (!stripe) {
    console.error('Stripe is not configured. STRIPE_SECRET_KEY is missing.');
    console.error('Environment check:', {
      hasKey: !!process.env.STRIPE_SECRET_KEY,
      keyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
      nodeEnv: process.env.NODE_ENV,
    });
    return res.status(500).json({ 
      error: 'Stripe is not configured. Please ensure STRIPE_SECRET_KEY is set in .env.local and restart vercel dev.' 
    });
  }

  try {
    const { amount, currency = 'cad', customerEmail, orderItems, metadata } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Track skipped images to avoid console spam
    const skippedImages: string[] = [];

    // Get origin from request headers, fallback to environment variable or default
    const origin = req.headers.origin 
      || (process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.NEXT_PUBLIC_URL || 'http://localhost:5173'));

    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development' || origin.includes('localhost') || origin.includes('127.0.0.1');

    // Helper function to convert image URL to absolute URL
    const getAbsoluteImageUrl = (imageUrl: string | undefined, origin: string): string[] => {
      if (!imageUrl) return [];
      
      // If already absolute URL (http:// or https://), use as is
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // Still check if it's localhost even if absolute
        if (imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1')) {
          if (isDevelopment && !skippedImages.includes(imageUrl)) {
            skippedImages.push(imageUrl);
          }
          return [];
        }
        return [imageUrl];
      }
      
      // If it's a data URL or blob URL, use as is
      if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
        return [imageUrl];
      }
      
      // If relative URL starting with /, make it absolute
      if (imageUrl.startsWith('/')) {
        const absoluteUrl = `${origin}${imageUrl}`;
        // In local development, Stripe can't access localhost URLs, so skip images
        if (absoluteUrl.includes('localhost') || absoluteUrl.includes('127.0.0.1')) {
          if (isDevelopment && !skippedImages.includes(absoluteUrl)) {
            skippedImages.push(absoluteUrl);
          }
          return [];
        }
        return [absoluteUrl];
      }
      
      // For imported assets or other relative paths, skip image (Stripe requires absolute URLs)
      if (isDevelopment && !skippedImages.includes(imageUrl)) {
        skippedImages.push(imageUrl);
      }
      return [];
    };

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: orderItems?.map((item: { name: string; description?: string; price: number; quantity: number; image?: string }) => ({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: item.name,
            description: item.description || '',
            images: getAbsoluteImageUrl(item.image, origin),
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })) || [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'Order Total',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:5173'}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}?checkout=canceled`,
      customer_email: customerEmail,
      metadata: metadata || {},
    });

    // Log skipped images summary after processing all items (only in development)
    if (isDevelopment && skippedImages.length > 0) {
      console.log(`[Stripe Checkout] Skipped ${skippedImages.length} localhost image(s) (Stripe requires publicly accessible URLs):`, skippedImages);
    }

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create checkout session';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific Stripe error types
      if ('type' in error && typeof error.type === 'string') {
        const stripeError = error as { type: string; message: string };
        if (stripeError.type === 'StripeInvalidRequestError') {
          errorMessage = `Stripe API Error: ${stripeError.message}`;
          statusCode = 400;
        } else if (stripeError.type === 'StripeAPIError') {
          errorMessage = `Stripe API Connection Error: ${stripeError.message}`;
          statusCode = 503;
        } else if (stripeError.type === 'StripeAuthenticationError') {
          errorMessage = `Stripe Authentication Error: Invalid API key`;
          statusCode = 401;
        }
      }
    }
    
    console.error('Error details:', {
      message: errorMessage,
      error: error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
    });
  }
}

