import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Standardized Hostinger SMTP Transporter Singleton
 * Supports configurable Hostinger custom domain email (sales@kingsol.in, hr@kingsol.in)
 */
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true, // 465 is SSL (true), 587 is TLS (false)
  auth: {
    user: (process.env.SMTP_USER || process.env.EMAIL_USER || 'sales@kingsol.in').trim(),
    pass: (process.env.SMTP_PASS || process.env.EMAIL_APP_PASSWORD || '').trim(), // Hostinger email or app password
  },
  // Pool settings to prevent socket timeouts on high traffic
  pool: true,
  maxConnections: 3,
  maxMessages: 50,
});

/**
 * Get Default Sender matching Hostinger Authenticated Mailbox
 * Hostinger strictly enforces that the SMTP from address matches the authenticated mailbox.
 */
export function getDefaultSender() {
  const smtpUser = (process.env.SMTP_USER || process.env.EMAIL_USER || 'sales@kingsol.in').trim();
  return process.env.SMTP_FROM || `"Kingsol Energy" <${smtpUser}>`;
}

export function getTransporter() {
  return transporter;
}

export async function sendInquiryEmailAlert(payload = {}) {
  const {
    name = 'Anonymous',
    email = '',
    phone = '',
    company_name,
    company,
    state,
    product_interest,
    message = '',
    inquiry_type,
    type,
    productName,
    product,
    brandName,
    subject: customSubject,
    attachments = [],
    replyTo: customReplyTo,
    to: customTo,
  } = payload;

  const pass = (process.env.SMTP_PASS || process.env.EMAIL_APP_PASSWORD || '').trim();
  // Route Quotes, Estimates, and Contact submissions to SALES_EMAIL by default
  const toEmail = customTo || process.env.SALES_EMAIL || process.env.ADMIN_ALERT_EMAIL || process.env.EMAIL_RECEIVER || 'sales@kingsol.in';

  if (!pass || pass === 'YOUR_HOSTINGER_APP_PASSWORD' || pass === 'your_gmail_app_password') {
    console.warn('ℹ️ [Mailer] SMTP credentials not set or placeholder in process.env (SMTP_PASS / EMAIL_APP_PASSWORD). Skipping email alert dispatch.');
    return false;
  }

  try {
    const resolvedCompany = company_name || company || '';
    const resolvedState = state || '';
    const targetProduct = product_interest || productName || product || '';
    const formType =
      type ||
      inquiry_type ||
      (product_interest
        ? 'Product Quotation Request'
        : productName || product
        ? 'Product Quick Quote'
        : 'General Contact Form');
    const subject =
      customSubject ||
      `[Kingsol Alert] ${formType} - ${targetProduct ? `${targetProduct} - ` : ''}${name}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #0F172A 0%, #78C257 100%); padding: 18px 20px; border-radius: 12px; margin-bottom: 20px; text-align: left;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold;">⚡ ${formType}</h2>
          <p style="color: #e2e8f0; margin: 4px 0 0 0; font-size: 13px;">New submission received from the Kingsol Solar website.</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
          <tr>
            <td style="padding: 10px 0; font-weight: bold; width: 140px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Submission Type:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${formType}</td>
          </tr>
          ${
            targetProduct && targetProduct !== 'N/A'
              ? `
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Product / System Interest:</td>
            <td style="padding: 10px 0; color: #0284c7; font-weight: bold; border-bottom: 1px solid #f1f5f9;">${targetProduct}</td>
          </tr>
          `
              : ''
          }
          ${
            brandName
              ? `
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Manufacturer Brand:</td>
            <td style="padding: 10px 0; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${brandName}</td>
          </tr>
          `
              : ''
          }
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Customer Name:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${name}</td>
          </tr>
          ${
            resolvedCompany
              ? `
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Company / Org:</td>
            <td style="padding: 10px 0; font-weight: 500; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${resolvedCompany}</td>
          </tr>
          `
              : ''
          }
          ${
            resolvedState
              ? `
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">State / Region:</td>
            <td style="padding: 10px 0; font-weight: 500; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${resolvedState}</td>
          </tr>
          `
              : ''
          }
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Email Address:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${email}" style="color: #0284c7; text-decoration: none; font-weight: 500;">${email || 'N/A'}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Phone Number:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;"><a href="tel:${phone}" style="color: #0f172a; text-decoration: none; font-weight: 500;">${phone || 'N/A'}</a></td>
          </tr>
        </table>
        
        ${
          message && typeof message === 'string' && message.trim()
            ? `
        <div style="margin-top: 16px; padding: 16px; background-color: #f8fafc; border-radius: 10px; border-left: 4px solid #78C257;">
          <h4 style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Message / Project Specifications:</h4>
          <p style="margin: 0; font-size: 14px; color: #334155; white-space: pre-line;">${message.trim()}</p>
        </div>
        `
            : ''
        }
        
        <p style="font-size: 11px; color: #94a3b8; margin-top: 24px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          Kingsol Solar Automated Lead System • Admin Panel Logged
        </p>
      </div>
    `;

    const customerEmail = email && typeof email === 'string' ? email.trim() : '';
    const resolvedReplyTo = customReplyTo || (customerEmail ? customerEmail : undefined);

    const mailOptions = {
      from: getDefaultSender(),
      to: toEmail.trim(),
      subject,
      html: htmlContent,
      attachments,
    };

    if (resolvedReplyTo) {
      mailOptions.replyTo = resolvedReplyTo;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Mailer] Email alert sent successfully to ${toEmail.trim()}. MessageID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ [Mailer] Email dispatch error:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    return false;
  }
}

export default {
  transporter,
  getDefaultSender,
  getTransporter,
  sendInquiryEmailAlert,
};
