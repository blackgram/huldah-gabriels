import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Helper function to get Stripe secret key from environment
// Checks multiple possible environment variable names
const getStripeSecretKey = (): string | null => {
  // Try common environment variable names
  const possibleKeys = [
    'STRIPE_SECRET_KEY',
    'VERCEL_ENV_STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_SECRET_KEY', // Some setups use this (though not recommended for secret keys)
  ];
  
  for (const key of possibleKeys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }
  
  return null;
};

// Initialize Stripe instance (will be created per request to ensure env vars are available)
const createStripeInstance = (): Stripe | null => {
  const stripeSecretKey = getStripeSecretKey();
  
  if (!stripeSecretKey) {
    return null;
  }
  
  try {
    return new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
      maxNetworkRetries: 2,
      timeout: 10000,
    });
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    return null;
  }
};

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

  // Check if Stripe is configured (check at runtime for production)
  const stripe = createStripeInstance();
  
  if (!stripe) {
    const isProduction = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
    const availableEnvVars = Object.keys(process.env)
      .filter(k => k.toUpperCase().includes('STRIPE'))
      .map(k => `${k}=${process.env[k]?.substring(0, 10)}...`);
    
    console.error('Stripe is not configured. STRIPE_SECRET_KEY is missing.');
    console.error('Environment check:', {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      isProduction,
      availableStripeVars: availableEnvVars,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('STRIPE')),
    });
    
    const errorMessage = isProduction
      ? 'Stripe is not configured. Please ensure STRIPE_SECRET_KEY is set in Vercel project settings (Environment Variables).'
      : 'Stripe is not configured. Please ensure STRIPE_SECRET_KEY is set in your environment variables (.env.local for local development).';
    
    return res.status(500).json({ 
      error: errorMessage,
      hint: isProduction 
        ? 'Go to Vercel Dashboard → Your Project → Settings → Environment Variables → Add STRIPE_SECRET_KEY'
        : 'For local development, add STRIPE_SECRET_KEY to .env.local and restart vercel dev'
    });
  }

  try {
    const { 
      amount, 
      currency = 'cad', 
      customerEmail, 
      orderItems, 
      discountAmount = 0,
      discountCode,
      shippingFee = 0,
      hst = 0,
      subtotal = 0,
      metadata 
    } = req.body;

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
      
      // Stripe has a 2048 character limit for URLs
      const STRIPE_URL_MAX_LENGTH = 2048;
      
      // If already absolute URL (http:// or https://), use as is
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // Still check if it's localhost even if absolute
        if (imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1')) {
          if (isDevelopment && !skippedImages.includes(imageUrl)) {
            skippedImages.push(imageUrl);
          }
          return [];
        }
        // Check URL length limit
        if (imageUrl.length > STRIPE_URL_MAX_LENGTH) {
          console.warn(`[Stripe Checkout] Skipping image URL exceeding 2048 character limit (${imageUrl.length} chars)`);
          if (!skippedImages.includes(imageUrl.substring(0, 100))) {
            skippedImages.push(imageUrl.substring(0, 100) + '...');
          }
          return [];
        }
        return [imageUrl];
      }
      
      // If it's a data URL or blob URL, check length before using
      if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
        // Data URLs can be very long (base64 encoded images), check length
        if (imageUrl.length > STRIPE_URL_MAX_LENGTH) {
          console.warn(`[Stripe Checkout] Skipping data/blob URL exceeding 2048 character limit (${imageUrl.length} chars)`);
          if (!skippedImages.includes('data/blob URL')) {
            skippedImages.push('data/blob URL (too long)');
          }
          return [];
        }
        return [imageUrl];
      }
      
      // If relative URL starting with /, make it absolute
      if (imageUrl.startsWith('/')) {
        const absoluteUrl = `${origin}${imageUrl}`;
        // In local development, Stripe can't access localhost URLs, so skip images
        if (absoluteUrl.includes('localhost') || absoluteUrl.includes('127.0.0.1')) {
          if (isDevelopment && !skippedImages.includes(imageUrl)) {
            skippedImages.push(imageUrl);
          }
          return [];
        }
        // Check URL length limit
        if (absoluteUrl.length > STRIPE_URL_MAX_LENGTH) {
          console.warn(`[Stripe Checkout] Skipping image URL exceeding 2048 character limit (${absoluteUrl.length} chars)`);
          if (!skippedImages.includes(imageUrl)) {
            skippedImages.push(imageUrl);
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

    // Build line items array
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    
    // Add product items
    if (orderItems && orderItems.length > 0) {
      orderItems.forEach((item: { name: string; description?: string; price: number; quantity: number; image?: string }) => {
        lineItems.push({
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
        });
      });
    }
    
    // Add discount as a negative line item if applicable
    if (discountAmount > 0) {
      lineItems.push({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'Discount',
            description: discountCode ? `Discount code: ${discountCode}` : 'Discount applied',
          },
          unit_amount: -Math.round(discountAmount * 100), // Negative amount for discount
        },
        quantity: 1,
      });
    }
    
    // Add shipping fee as a line item if applicable
    if (shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'Shipping',
            description: 'Shipping fee',
          },
          unit_amount: Math.round(shippingFee * 100), // Convert to cents
        },
        quantity: 1,
      });
    }
    
    // Add HST/Tax as a line item if applicable
    if (hst > 0) {
      lineItems.push({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'HST (13%)',
            description: 'Harmonized Sales Tax',
          },
          unit_amount: Math.round(hst * 100), // Convert to cents
        },
        quantity: 1,
      });
    }
    
    // Fallback: if no line items, create a single "Order Total" item
    if (lineItems.length === 0) {
      lineItems.push({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'Order Total',
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:5173'}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}?checkout=canceled`,
      customer_email: customerEmail,
      metadata: metadata || {},
    });

    // Log skipped images summary after processing all items
    if (skippedImages.length > 0) {
      const reason = isDevelopment 
        ? 'localhost image(s) (Stripe requires publicly accessible URLs)'
        : 'image(s) (localhost URLs or URLs exceeding 2048 character limit)';
      console.log(`[Stripe Checkout] Skipped ${skippedImages.length} ${reason}:`, skippedImages);
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

