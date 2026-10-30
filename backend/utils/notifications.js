import axios from 'axios';
import dotenv from 'dotenv';
import { transporter, getDefaultSender } from './mailer.js';

dotenv.config();

/**
 * Send Direct Email Notification via Standardized Hostinger SMTP Transporter
 * @param {Object} options
 * @param {string} [options.to] - Target recipient email (defaults to SALES_EMAIL or ADMIN_EMAIL)
 * @param {string} options.subject - Email subject line
 * @param {string} [options.htmlContent] - HTML body content
 * @param {string} [options.html] - HTML body content alias
 * @param {string} [options.replyTo] - Direct Reply-To email address
 * @param {string} [options.from] - Custom from header (defaults to Hostinger compliant sender)
 * @param {Array} [options.attachments] - Array of attachment objects e.g. [{ filename, path }]
 */
export async function sendEmailNotification(options = {}) {
  const { to, subject, htmlContent, html, attachments = [], replyTo, from } = options || {};
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_APP_PASSWORD || '').trim();
  const defaultRecipient = process.env.SALES_EMAIL || process.env.ADMIN_ALERT_EMAIL || process.env.EMAIL_RECEIVER || 'sales@kingsol.in';

  const targetRecipient = to || defaultRecipient;
  const finalHtml = htmlContent || html || '<p>No content provided</p>';

  if (!pass || pass === 'YOUR_HOSTINGER_APP_PASSWORD' || pass === 'your_gmail_app_password') {
    console.warn('⚠️ [Nodemailer Skipped]: SMTP_PASS / EMAIL_APP_PASSWORD not configured or placeholder in .env');
    return { success: false, reason: 'Email credentials unconfigured' };
  }

  try {
    const mailOptions = {
      from: from || getDefaultSender(),
      to: targetRecipient.trim(),
      subject,
      html: finalHtml,
      attachments,
    };

    if (replyTo && typeof replyTo === 'string' && replyTo.trim()) {
      mailOptions.replyTo = replyTo.trim();
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 [Direct Email Sent]: ${info.messageId} to ${targetRecipient.trim()}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ [Direct Email Failed]:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    return {
      success: false,
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    };
  }
}

/**
 * Send WhatsApp Notification via 3rd Party Gateway (e.g. CallMeBot)
 * @param {string} textMessage
 */
export async function sendWhatsAppNotification(textMessage) {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;
  const adminPhone = process.env.ADMIN_PHONE;

  if (!apiUrl || !adminPhone || apiKey === 'your_whatsapp_apikey') {
    console.log('⚠️ [WhatsApp Notification Skipped]: WHATSAPP_API_URL or credentials not configured');
    return { success: false, reason: 'WhatsApp credentials unconfigured' };
  }

  try {
    const encodedText = encodeURIComponent(textMessage);
    const targetUrl = `${apiUrl}?phone=${adminPhone}&text=${encodedText}&apikey=${apiKey}`;

    const response = await axios.get(targetUrl, { timeout: 10000 });
    console.log('📱 [WhatsApp Alert Sent]: Success');
    return { success: true, response: response.data };
  } catch (error) {
    console.error('❌ [WhatsApp Alert Failed]:', error.message);
    return { success: false, error: error.message };
  }
}

export default {
  sendEmailNotification,
  sendWhatsAppNotification,
};
