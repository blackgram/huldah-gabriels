import { getUncontactedEmails, markEmailsAsContacted } from './waitListService';

// Define the email template types
export type EmailTemplateType = 'LAUNCH_ANNOUNCEMENT' | 'EXCLUSIVE_PREVIEW' | 'DISCOUNT_OFFER';

// Sample email templates
const EMAIL_TEMPLATES = {
  LAUNCH_ANNOUNCEMENT: {
    subject: "We've Launched! 🚀",
    body: `
      <h1>We're Now Live!</h1>
      <p>Thank you for joining our waitlist. We're excited to announce that our product is now available!</p>
      <p>Visit our website to explore our collection of lipgloss products.</p>
      <a href="https://example.com" style="display: inline-block; background-color: #946A2E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px;">Shop Now</a>
    `
  },
  EXCLUSIVE_PREVIEW: {
    subject: "Exclusive Preview for Waitlist Members 👀",
    body: `
      <h1>Early Access Just for You</h1>
      <p>As a valued waitlist member, we're giving you exclusive early access to our products before our public launch!</p>
      <p>Use the code EARLYBIRD at checkout for 15% off your first order.</p>
      <a href="https://example.com" style="display: inline-block; background-color: #946A2E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px;">Shop Early</a>
    `
  },
  DISCOUNT_OFFER: {
    subject: "Special Offer: 20% Off Your First Order 💄",
    body: `
      <h1>A Special Discount Just For You</h1>
      <p>Thank you for joining our waitlist! We're offering you an exclusive 20% discount on your first order.</p>
      <p>Use code WAITLIST20 at checkout to redeem your discount.</p>
      <a href="https://example.com" style="display: inline-block; background-color: #946A2E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px;">Shop Now</a>
    `
  }
};

// For demonstration/development, we'll log emails instead of sending them
// In production, you would connect this to a real email service like SendGrid, Mailchimp, etc.
export const sendBulkEmail = async (templateName: EmailTemplateType): Promise<boolean> => {
  try {
    // Get emails of users who haven't been contacted yet
    const emails = await getUncontactedEmails();
    
    if (emails.length === 0) {
      console.log('No uncontacted emails found in waitlist');
      return true;
    }
    
    const template = EMAIL_TEMPLATES[templateName];
    
    // In production, replace this with your actual email sending logic
    // For example, with SendGrid:
    /*
    import sgMail from '@sendgrid/mail';
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const messages = emails.map(email => ({
      to: email,
      from: 'your-email@example.com', // Use your verified sender
      subject: template.subject,
      html: template.body,
    }));
    
    // Send emails in batches to avoid rate limits
    const batchSize = 100;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      await sgMail.send(batch);
    }
    */
    
    // For development/demonstration, log the emails that would be sent
    console.log(`Would send ${template.subject} to ${emails.length} recipients:`);
    console.log('Recipients:', emails);
    
    // After sending, mark these emails as contacted
    await markEmailsAsContacted(emails);
    
    return true;
  } catch (error) {
    console.error('Error sending bulk email:', error);
    return false;
  }
};

// Send a test email to verify configuration
export const sendTestEmail = async (email: string, templateName: EmailTemplateType): Promise<boolean> => {
  try {
    const template = EMAIL_TEMPLATES[templateName];
    
    // In production, replace this with your actual email sending logic
    // For example, with SendGrid:
    /*
    import sgMail from '@sendgrid/mail';
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    await sgMail.send({
      to: email,
      from: 'your-email@example.com', // Use your verified sender
      subject: `[TEST] ${template.subject}`,
      html: template.body,
    });
    */
    
    // For development/demonstration
    console.log(`Would send test email to ${email} with subject: ${template.subject}`);
    console.log('Email body:', template.body);
    
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
};

export default {
  sendBulkEmail,
  sendTestEmail,
  EMAIL_TEMPLATES
};