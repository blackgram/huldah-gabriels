import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
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

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe) {
    return res.status(500).json({ 
      error: 'Stripe is not configured' 
    });
  }

  try {
    const sessionId = req.query.session_id as string;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer'],
    });

    // Extract order details from metadata
    const metadata = session.metadata || {};
    
    // Get line items
    const lineItems = session.line_items?.data || [];
    const items = lineItems.map((item) => ({
      name: item.description || item.price?.product?.name || 'Product',
      quantity: item.quantity || 1,
      price: (item.price?.unit_amount || 0) / 100, // Convert from cents
    }));

    const orderDetails = {
      sessionId: session.id,
      customerName: metadata.customerName || session.customer_details?.name || 'Customer',
      customerEmail: session.customer_details?.email || metadata.customerEmail || '',
      customerPhone: metadata.customerPhone || session.customer_details?.phone || '',
      customerAddress: metadata.customerAddress || session.customer_details?.address?.line1 || '',
      customerCountry: metadata.customerCountry || session.customer_details?.address?.country || '',
      amount: (session.amount_total || 0) / 100, // Convert from cents
      currency: session.currency || 'usd',
      items: items,
      paymentStatus: session.payment_status || 'paid',
    };

    return res.status(200).json(orderDetails);
  } catch (error) {
    console.error('Error retrieving Stripe session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve session';
    return res.status(500).json({ 
      error: errorMessage
    });
  }
}

