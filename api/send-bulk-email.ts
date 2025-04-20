import { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

// interface Recipient {
//   email: string;
//   name?: string;
// }

interface FailedEmail {
  email: string;
  error: string;
}

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

  // Only allow POST method for actual requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { recipients, subject, html } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Recipients array is required' 
      });
    }
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    // For tracking which emails were sent successfully
    const successfulEmails: string[] = [];
    const failedEmails: FailedEmail[] = [];
    
    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const emailPromises = batch.map(recipient => {
        // Personalize email if name is provided
        let personalizedHtml = html;
        if (recipient.name) {
          personalizedHtml = html.replace(
            '<p>Thank you for joining our waitlist',
            `<p>Thank you ${recipient.name} for joining our waitlist`
          );
        }
        
        return transporter.sendMail({
          from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
          to: recipient.email,
          subject,
          html: personalizedHtml,
        }).then(info => {
          successfulEmails.push(recipient.email);
          return info;
        }).catch(error => {
          failedEmails.push({ 
            email: recipient.email, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
          return null;
        });
      });
      
      await Promise.all(emailPromises);
      
      // Add a small delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      sent: successfulEmails.length,
      failed: failedEmails.length,
      successfulEmails,
      failedEmails
    });
  } catch (error) {
    console.error('Bulk email error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}