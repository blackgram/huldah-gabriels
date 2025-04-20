import axios from "axios";
import { getUncontactedEmails, markEmailsAsContacted } from "./waitListService";

// Define API URL based on environment
// For Vite, using import.meta.env for environment detection
const API_URL = import.meta.env.PROD
  ? "/api" // Production (Vercel)
  : import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Define the email template types
export type EmailTemplateType =
  | "WELCOME"
  | "LAUNCH_ANNOUNCEMENT"
  | "EXCLUSIVE_PREVIEW"
  | "DISCOUNT_OFFER"
  | "VERIFICATION";

export const EMAIL_TEMPLATES: Record<EmailTemplateType, EmailTemplateType> = {
  WELCOME: "WELCOME",
  LAUNCH_ANNOUNCEMENT: "LAUNCH_ANNOUNCEMENT",
  EXCLUSIVE_PREVIEW: "EXCLUSIVE_PREVIEW",
  DISCOUNT_OFFER: "DISCOUNT_OFFER",
  VERIFICATION: "VERIFICATION",
};

// Shared styling for consistent branding
const emailStyle = {
  fontFamily: "'Georgia', serif",
  textColor: "#5a3a1a",
  accentColor: "#8b5e3c",
  backgroundColor: "#fff",
  borderColor: "#e0d4c3",
  bodyWidth: "600px",
  buttonStyle:
    "background-color: #8b5e3c; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;",
  footerColor: "#a08974",
};

// Email templates with subjects and bodies
const TEMPLATE_CONTENT: Record<
  EmailTemplateType,
  { subject: string; body: string }
> = {
  WELCOME: {
    subject: "Welcome to Huldah Gabriels! 💄",
    body: `
      <!DOCTYPE html>
      <html lang="en" style="font-family: ${emailStyle.fontFamily}; background-color: #fffaf5; color: ${emailStyle.textColor};">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Welcome to Huldah Gabriels</title>
        </head>
        <body style="margin: 0; padding: 0; font-size: 16px; color: ${emailStyle.textColor};">
          <div style="max-width: ${emailStyle.bodyWidth}; margin: auto; padding: 30px; border: 1px solid ${emailStyle.borderColor}; background-color: ${emailStyle.backgroundColor}; border-radius: 8px;">
            
            <div style="text-align: center;">
              <img src="https://www.huldahgabriels.com/images/logoHG.png" alt="Huldah Gabriels" style="width: 100px; margin-bottom: 20px;" />
            </div>

            <h2 style="text-align: center; color: ${emailStyle.accentColor};">Thank You for Joining Us!</h2>

            <p style="line-height: 1.6;">
              We're thrilled to welcome you to <strong>Huldah Gabriels</strong>. You're now part of our exclusive community, and we can't wait to share our luxury beauty products with you.
            </p>

            <p style="line-height: 1.6;">
              While you wait, follow us on social media for sneak peeks and updates:
            </p>

            <div style="text-align: center; margin: 25px 0;">
              <a href="https://instagram.com/huldahgabriels" style="text-decoration: none; margin-right: 15px; color: ${emailStyle.accentColor};">Instagram</a>
              <a href="https://facebook.com/huldahgabriels" style="text-decoration: none; margin-right: 15px; color: ${emailStyle.accentColor};">Facebook</a>
              <a href="https://twitter.com/huldahgabriels" style="text-decoration: none; color: ${emailStyle.accentColor};">Twitter</a>
            </div>

            <p style="text-align: center; margin: 30px 0;">
              <a href="https://example.com/shop" style="${emailStyle.buttonStyle}">
                Explore Our Collection
              </a>
            </p>

            <p style="margin-top: 40px;">
              With love,<br />
              The Huldah Gabriels Team
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: ${emailStyle.footerColor};">
            &copy; 2025 Huldah Gabriels. All rights reserved.
          </div>
        </body>
      </html>
    `,
  },
  LAUNCH_ANNOUNCEMENT: {
    subject: "We've Launched! 🚀 Huldah Gabriels Is Now Live",
    body: `
      <!DOCTYPE html>
      <html lang="en" style="font-family: ${emailStyle.fontFamily}; background-color: #fffaf5; color: ${emailStyle.textColor};">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Huldah Gabriels Has Launched</title>
        </head>
        <body style="margin: 0; padding: 0; font-size: 16px; color: ${emailStyle.textColor};">
          <div style="max-width: ${emailStyle.bodyWidth}; margin: auto; padding: 30px; border: 1px solid ${emailStyle.borderColor}; background-color: ${emailStyle.backgroundColor}; border-radius: 8px;">
            
            <div style="text-align: center;">
              <img src="https://www.huldahgabriels.com/images/logoHG.png" alt="Huldah Gabriels" style="width: 100px; margin-bottom: 20px;" />
            </div>

            <h2 style="text-align: center; color: ${emailStyle.accentColor};">We're Now Live!</h2>

            <p style="line-height: 1.6;">
              The moment you've been waiting for has arrived! <strong>Huldah Gabriels</strong> has officially launched, and our full collection is now available online.
            </p>
            
            <p style="line-height: 1.6;">
              As one of our valued waitlist members, you're among the first to experience our premium lip products created with the finest ingredients.
            </p>

            <p style="text-align: center; margin: 30px 0;">
              <a href="https://example.com/shop" style="${emailStyle.buttonStyle}">
                Shop Now
              </a>
            </p>

            <p style="margin-top: 40px;">
              With love,<br />
              The Huldah Gabriels Team
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: ${emailStyle.footerColor};">
            &copy; 2025 Huldah Gabriels. All rights reserved.
          </div>
        </body>
      </html>
    `,
  },
  EXCLUSIVE_PREVIEW: {
    subject: "Exclusive Preview for Huldah Gabriels Waitlist Members 👀",
    body: `
      <!DOCTYPE html>
      <html lang="en" style="font-family: ${emailStyle.fontFamily}; background-color: #fffaf5; color: ${emailStyle.textColor};">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Exclusive Preview</title>
        </head>
        <body style="margin: 0; padding: 0; font-size: 16px; color: ${emailStyle.textColor};">
          <div style="max-width: ${emailStyle.bodyWidth}; margin: auto; padding: 30px; border: 1px solid ${emailStyle.borderColor}; background-color: ${emailStyle.backgroundColor}; border-radius: 8px;">
            
            <div style="text-align: center;">
              <img src="https://www.huldahgabriels.com/images/logoHG.png" alt="Huldah Gabriels" style="width: 100px; margin-bottom: 20px;" />
            </div>

            <h2 style="text-align: center; color: ${emailStyle.accentColor};">Early Access Just for You</h2>

            <p style="line-height: 1.6;">
              As a valued member of our waitlist, we're delighted to offer you <strong>exclusive early access</strong> to the Huldah Gabriels collection before our public launch.
            </p>
            
            <p style="line-height: 1.6;">
              Use the code <strong>EARLYBIRD</strong> at checkout for 15% off your first order.
            </p>

            <p style="text-align: center; margin: 30px 0;">
              <a href="https://example.com/preview" style="${emailStyle.buttonStyle}">
                Shop Early
              </a>
            </p>

            <p style="margin-top: 40px;">
              With love,<br />
              The Huldah Gabriels Team
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: ${emailStyle.footerColor};">
            &copy; 2025 Huldah Gabriels. All rights reserved.
          </div>
        </body>
      </html>
    `,
  },
  DISCOUNT_OFFER: {
    subject: "Special Offer: 20% Off Your First Huldah Gabriels Order 💄",
    body: `
      <!DOCTYPE html>
      <html lang="en" style="font-family: ${emailStyle.fontFamily}; background-color: #fffaf5; color: ${emailStyle.textColor};">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Special Discount</title>
        </head>
        <body style="margin: 0; padding: 0; font-size: 16px; color: ${emailStyle.textColor};">
          <div style="max-width: ${emailStyle.bodyWidth}; margin: auto; padding: 30px; border: 1px solid ${emailStyle.borderColor}; background-color: ${emailStyle.backgroundColor}; border-radius: 8px;">
            
            <div style="text-align: center;">
              <img src="https://www.huldahgabriels.com/images/logoHG.png" alt="Huldah Gabriels" style="width: 100px; margin-bottom: 20px;" />
            </div>

            <h2 style="text-align: center; color: ${emailStyle.accentColor};">A Special Discount Just For You</h2>

            <p style="line-height: 1.6;">
              Thank you for joining our waitlist! To show our appreciation, we're offering you an <strong>exclusive 20% discount</strong> on your first Huldah Gabriels order.
            </p>
            
            <p style="line-height: 1.6;">
              Use code <strong>WAITLIST20</strong> at checkout to redeem your discount.
            </p>

            <p style="text-align: center; margin: 30px 0;">
              <a href="https://example.com/shop" style="${emailStyle.buttonStyle}">
                Shop Now
              </a>
            </p>

            <p style="margin-top: 40px;">
              With love,<br />
              The Huldah Gabriels Team
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: ${emailStyle.footerColor};">
            &copy; 2025 Huldah Gabriels. All rights reserved.
          </div>
        </body>
      </html>
    `,
  },
  VERIFICATION: {
    subject: "Verify Your Email Address for Huldah Gabriels",
    body: `
      <!DOCTYPE html>
      <html lang="en" style="font-family: ${emailStyle.fontFamily}; background-color: #fffaf5; color: ${emailStyle.textColor};">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-size: 16px; color: ${emailStyle.textColor};">
          <div style="max-width: ${emailStyle.bodyWidth}; margin: auto; padding: 30px; border: 1px solid ${emailStyle.borderColor}; background-color: ${emailStyle.backgroundColor}; border-radius: 8px;">
            
            <div style="text-align: center;">
              <img src="https://www.huldahgabriels.com/images/logoHG.png" alt="Huldah Gabriels" style="width: 100px; margin-bottom: 20px;" />
            </div>

            <h2 style="text-align: center; color: ${emailStyle.accentColor};">Verify Your Email</h2>

            <p style="line-height: 1.6;">
              Thank you for creating a <strong>Huldah Gabriels</strong> account. Please verify your email address for <strong>{{email}}</strong> by clicking the button below.
            </p>

            <p style="text-align: center; margin: 30px 0;">
              <a href="{{verificationLink}}" style="${emailStyle.buttonStyle}">
                Verify Email Address
              </a>
            </p>

            <p style="line-height: 1.6;">
              If you didn't create this account, you can safely ignore this email.
            </p>

            <p style="margin-top: 40px;">
              With love,<br />
              The Huldah Gabriels Team
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: ${emailStyle.footerColor};">
            &copy; 2025 Huldah Gabriels. All rights reserved.
          </div>
        </body>
      </html>
    `,
  },
};

// Send welcome email when user joins waitlist
export const sendWelcomeEmail = async (
  email: string,
  name: string = ""
): Promise<boolean> => {
  try {
    const template = TEMPLATE_CONTENT[EMAIL_TEMPLATES.WELCOME];

    // Personalize the email if name is provided
    let personalizedBody = template.body;
    if (name) {
      personalizedBody = personalizedBody.replace(
        '<h2 style="text-align: center; color: #8b5e3c;">Thank You for Joining Us!</h2>',
        `<h2 style="text-align: center; color: #8b5e3c;">Thank You for Joining Us, ${name}!</h2>`
      );
    }

    const response = await axios.post(`${API_URL}/send-email`, {
      to: email,
      subject: template.subject,
      html: personalizedBody,
    });

    return response.data.success;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
};

// Send verification email
export const sendVerificationEmail = async (
  email: string,
  verificationLink: string
): Promise<boolean> => {
  try {
    const template = TEMPLATE_CONTENT[EMAIL_TEMPLATES.VERIFICATION];

    // Replace placeholders with actual values
    const emailBody = template.body
      .replace("{{email}}", email)
      .replace("{{verificationLink}}", verificationLink);

    const response = await axios.post(`${API_URL}/send-email`, {
      to: email,
      subject: template.subject,
      html: emailBody,
    });

    return response.data.success;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

// Send a test email to verify configuration
export const sendTestEmail = async (
  email: string,
  templateName: EmailTemplateType
): Promise<boolean> => {
  try {
    if (!TEMPLATE_CONTENT[templateName]) {
      throw new Error(`Template "${templateName}" not found`);
    }

    const template = TEMPLATE_CONTENT[templateName];
    let emailBody = template.body;

    // Add placeholder substitutions for test emails
    if (templateName === EMAIL_TEMPLATES.VERIFICATION) {
      emailBody = emailBody
        .replace("{{email}}", email)
        .replace(
          "{{verificationLink}}",
          "https://example.com/verify-test-link"
        );
    }

    const response = await axios.post(`${API_URL}/send-test-email`, {
      to: email,
      subject: template.subject,
      html: emailBody,
    });

    return response.data.success;
  } catch (error) {
    console.error("Error sending test email:", error);
    throw error;
  }
};

// Send bulk emails to waitlist subscribers
export const sendBulkEmail = async (
  templateName: EmailTemplateType
): Promise<boolean> => {
  try {
    if (!TEMPLATE_CONTENT[templateName]) {
      throw new Error(`Template "${templateName}" not found`);
    }

    // Get emails of users who haven't been contacted yet
    const uncontactedEmails = await getUncontactedEmails();

    if (uncontactedEmails.length === 0) {
      console.log("No uncontacted emails found in waitlist");
      return true;
    }

    const template = TEMPLATE_CONTENT[templateName];

    const response = await axios.post(`${API_URL}/send-bulk-email`, {
      recipients: uncontactedEmails,
      subject: template.subject,
      html: template.body,
    });

    if (response.data.success) {
      // Mark emails as contacted in the database
      const successfulEmails = response.data.successfulEmails;
      if (successfulEmails && successfulEmails.length > 0) {
        await markEmailsAsContacted(successfulEmails);
      }

      console.log(
        `Successfully sent ${response.data.sent} emails with template: ${templateName}`
      );
      return true;
    } else {
      throw new Error(response.data.error || "Failed to send bulk emails");
    }
  } catch (error) {
    console.error("Error sending bulk emails:", error);
    throw error;
  }
};

export default {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendTestEmail,
  sendBulkEmail,
  EMAIL_TEMPLATES,
};
