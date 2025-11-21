import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderDetails, newStatus, trackingNumber, courier } = req.body;

    if (!orderDetails || !orderDetails.customerEmail || !newStatus) {
      return res.status(400).json({ error: 'Order details, customer email, and new status are required' });
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Generate status-specific email content
    const getStatusEmailContent = () => {
      const statusMessages: Record<string, { title: string; message: string; color: string }> = {
        processing: {
          title: 'Order Processing',
          message: 'Your order is now being processed and prepared for shipment.',
          color: '#3b82f6',
        },
        shipped: {
          title: 'Order Shipped!',
          message: 'Great news! Your order has been shipped and is on its way to you.',
          color: '#8b5cf6',
        },
        delivered: {
          title: 'Order Delivered',
          message: 'Your order has been successfully delivered. We hope you love your purchase!',
          color: '#22c55e',
        },
        cancelled: {
          title: 'Order Cancelled',
          message: 'Your order has been cancelled. If you have any questions, please contact us.',
          color: '#ef4444',
        },
      };

      return statusMessages[newStatus] || {
        title: 'Order Status Update',
        message: `Your order status has been updated to ${newStatus}.`,
        color: '#946A2E',
      };
    };

    const statusInfo = getStatusEmailContent();

    // Generate tracking section HTML if shipped
    const trackingSection = newStatus === 'shipped' && trackingNumber ? `
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid ${statusInfo.color}; margin-bottom: 20px;">
        <h3 style="color: ${statusInfo.color}; margin-top: 0;">📦 Tracking Information</h3>
        <p style="margin: 5px 0;"><strong>Tracking Number:</strong> <span style="font-family: monospace; font-size: 16px; font-weight: bold;">${trackingNumber}</span></p>
        ${courier ? `<p style="margin: 5px 0;"><strong>Courier:</strong> ${courier}</p>` : ''}
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
          You can track your package using the tracking number above on the courier's website.
        </p>
      </div>
    ` : '';

    // Generate order items HTML
    const itemsHtml = orderDetails.items
      .map(
        (item: { name: string; quantity: number; price: number }) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${orderDetails.currency.toUpperCase()} ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Status Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">${statusInfo.title}</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Order #${orderDetails.id?.substring(0, 8) || orderDetails.transactionReference?.substring(0, 8) || 'N/A'}</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hi ${orderDetails.customerName},
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              ${statusInfo.message}
            </p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #946A2E; margin-top: 0; margin-bottom: 15px;">Order Details</h2>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderDetails.id?.substring(0, 20) || orderDetails.transactionReference?.substring(0, 20) || 'N/A'}...</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusInfo.color}; font-weight: bold; text-transform: capitalize;">${newStatus}</span></p>
              <p style="margin: 5px 0;"><strong>Total Amount:</strong> ${orderDetails.currency.toUpperCase()} ${orderDetails.amount.toFixed(2)}</p>
            </div>

            ${trackingSection}

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #946A2E; margin-top: 0; margin-bottom: 15px;">Order Items</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #946A2E; border-top: 2px solid #ddd;">
                      ${orderDetails.currency.toUpperCase()} ${orderDetails.amount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #946A2E; margin-top: 0; margin-bottom: 15px;">Delivery Address</h2>
              <p style="margin: 5px 0;">${orderDetails.customerName}</p>
              <p style="margin: 5px 0;">${orderDetails.customerAddress}</p>
              <p style="margin: 5px 0;">${orderDetails.customerCountry}</p>
              <p style="margin: 5px 0;">Phone: ${orderDetails.customerPhone}</p>
            </div>

            <p style="font-size: 16px; margin-top: 30px;">
              If you have any questions about your order, please don't hesitate to contact us.
            </p>

            <p style="font-size: 16px; margin-top: 20px;">
              Best regards,<br>
              <strong>The Huldah Gabriels Team</strong>
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>© ${new Date().getFullYear()} Huldah Gabriels. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Huldah Gabriels'}" <${process.env.EMAIL_FROM}>`,
      to: orderDetails.customerEmail,
      subject: `Order Status Update - ${statusInfo.title} (Order #${orderDetails.id?.substring(0, 8) || orderDetails.transactionReference?.substring(0, 8) || 'N/A'})`,
      html: emailHtml,
    });

    return res.status(200).json({ 
      success: true, 
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Error sending order status update email:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email' 
    });
  }
}

