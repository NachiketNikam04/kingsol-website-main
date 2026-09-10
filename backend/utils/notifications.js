import nodemailer from 'nodemailer';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Send Direct Email Notification via Nodemailer (Gmail App Password)
 * @param {Object} options
 * @param {string} [options.to] - Target recipient email (defaults to ADMIN_EMAIL or EMAIL_USER)
 * @param {string} options.subject - Email subject line
 * @param {string} [options.htmlContent] - HTML body content
 * @param {string} [options.html] - HTML body content alias
 * @param {Array} [options.attachments] - Array of attachment objects e.g. [{ filename, path }]
 */
export async function sendEmailNotification(options) {
  const { to, subject, htmlContent, html, attachments = [] } = options || {};
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_APP_PASSWORD || process.env.SMTP_PASS;
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || process.env.EMAIL_RECEIVER || process.env.ADMIN_EMAIL || user;

  const targetRecipient = to || adminEmail;
  const finalHtml = htmlContent || html || '<p>No content provided</p>';

  if (!user || !pass || pass === 'your_gmail_app_password') {
    console.log('⚠️ [Nodemailer Skipped]: EMAIL_USER / EMAIL_APP_PASSWORD not configured in .env');
    return { success: false, reason: 'Email credentials unconfigured' };
  }

  console.log(`🔍 [Notification Debug] Attempting email dispatch for user: ${user.trim()}`);

  try {
    // Configure Transporter with service: 'gmail'
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user.trim(),
        pass: pass.trim(),
      },
    });

    const mailOptions = {
      from: `"Kingsol Portal Alerts" <${user.trim()}>`,
      to: targetRecipient.trim(),
      subject,
      html: finalHtml,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 [Direct Email Sent]:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ [Direct Email Failed]:', error.message);
    return { success: false, error: error.message };
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
