import nodemailer from 'nodemailer';

export async function sendInquiryEmailAlert(payload = {}) {
  const {
    name = 'Anonymous',
    email = '',
    phone = '',
    message = '',
    inquiry_type,
    type,
    productName,
    product,
    brandName,
    subject: customSubject,
    attachments = [],
  } = payload;

  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_APP_PASSWORD || process.env.SMTP_PASS;
  const toEmail = process.env.ADMIN_ALERT_EMAIL || process.env.EMAIL_RECEIVER || process.env.ADMIN_EMAIL || user;

  if (!user || !pass) {
    console.log('ℹ️ [Mailer] SMTP credentials not set in process.env (EMAIL_USER / EMAIL_APP_PASSWORD). Skipping email alert dispatch.');
    return false;
  }

  console.log(`🔍 [Mailer Debug] Attempting login for user: ${user.trim()}`);

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user.trim(),
        pass: pass.trim(),
      },
    });

    const formType = type || inquiry_type || (productName || product ? 'Product Quick Quote' : 'General Contact Form');
    const targetProduct = productName || product || '';
    const subject = customSubject || `[Kingsol Alert] ${formType} - ${targetProduct ? `${targetProduct} - ` : ''}${name}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #0F172A 0%, #78C257 100%); padding: 18px 20px; border-radius: 12px; margin-bottom: 20px; text-align: left;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: bold;">⚡ ${formType}</h2>
          <p style="color: #e2e8f0; margin: 4px 0 0 0; font-size: 13px;">New submission received from the Kingsol Solar website.</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
          <tr>
            <td style="padding: 10px 0; font-weight: bold; width: 140px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Inquiry Type:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${formType}</td>
          </tr>
          ${
            targetProduct && targetProduct !== 'N/A'
              ? `
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Product Inquired:</td>
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
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Email Address:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${email}" style="color: #0284c7; text-decoration: none; font-weight: 500;">${email || 'N/A'}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Phone Number:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;"><a href="tel:${phone}" style="color: #0f172a; text-decoration: none; font-weight: 500;">${phone || 'N/A'}</a></td>
          </tr>
        </table>
        
        <div style="margin-top: 16px; padding: 16px; background-color: #f8fafc; border-radius: 10px; border-left: 4px solid #78C257;">
          <h4 style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Message / Requirements:</h4>
          <p style="margin: 0; font-size: 14px; color: #334155; white-space: pre-line;">${message || 'No additional message provided.'}</p>
        </div>
        
        <p style="font-size: 11px; color: #94a3b8; margin-top: 24px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          Kingsol Solar Automated Lead System • Admin Panel Logged
        </p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Kingsol Solar Alert" <${user.trim()}>`,
      to: toEmail.trim(),
      subject,
      html: htmlContent,
      attachments,
    });

    console.log(`✅ [Mailer] Email alert sent successfully to ${toEmail.trim()}. MessageID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ [Mailer] Email dispatch error:', error);
    return false;
  }
}
