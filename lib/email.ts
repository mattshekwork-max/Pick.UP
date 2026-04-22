// lib/email.ts
// Email notifications using Zoho SMTP

import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.ZOHO_EMAIL_USER || 'support@pickuphone.com';
const EMAIL_PASS = process.env.ZOHO_EMAIL_PASSWORD;
const ZOHO_SMTP_HOST = 'smtp.zeptomail.com';
const ZOHO_SMTP_PORT = 587;

interface CallNotification {
  callerName?: string;
  callerPhone: string;
  duration: number;
  summary?: string;
  appointmentBooked?: boolean;
  service?: string;
  appointmentTime?: string;
  wasTransferred?: boolean;
  transcript?: string;
  recordingUrl?: string;
}

/**
 * Create Zoho mail transporter
 */
function createTransporter() {
  if (!EMAIL_PASS) {
    console.error('❌ Zoho email password not configured');
    throw new Error('Email not configured - missing ZOHO_EMAIL_PASSWORD');
  }

  return nodemailer.createTransport({
    host: ZOHO_SMTP_HOST,
    port: ZOHO_SMTP_PORT,
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

/**
 * Send call summary email to business owner
 */
export async function sendCallSummaryEmail(
  to: string,
  businessName: string,
  call: CallNotification
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = createTransporter();

    // Format duration
    const durationMinutes = Math.round(call.duration / 60);
    const durationText = durationMinutes < 1 ? '< 1 min' : `${durationMinutes} min`;

    // Build HTML email
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0D9488 0%, #0f766e 100%); padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
    .header p { color: #e0f2f1; margin: 8px 0 0 0; font-size: 14px; }
    .content { padding: 32px; }
    .section { margin-bottom: 24px; }
    .label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .value { font-size: 16px; color: #1e293b; line-height: 1.5; }
    .highlight { background-color: #f0fdfa; border-left: 4px solid #0D9488; padding: 16px; border-radius: 6px; margin: 16px 0; }
    .highlight-value { font-size: 18px; font-weight: 600; color: #0D9488; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .badge-success { background-color: #dcfce7; color: #166534; }
    .badge-warning { background-color: #fef3c7; color: #92400e; }
    .badge-info { background-color: #e0f2fe; color: #075985; }
    .footer { background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 0; font-size: 12px; color: #64748b; }
    .button { display: inline-block; padding: 12px 24px; background-color: #0D9488; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📞 New Call for ${escapeHtml(businessName)}</h1>
      <p>Pick.UP Call Summary</p>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="label">Caller</div>
        <div class="value">
          ${call.callerName ? `<strong>${escapeHtml(call.callerName)}</strong><br/>` : ''}
          ${escapeHtml(call.callerPhone)}
        </div>
      </div>
      
      <div class="section">
        <div class="label">Duration</div>
        <div class="value">${durationText}</div>
      </div>
      
      ${call.appointmentBooked ? `
      <div class="highlight">
        <div class="label">✅ Appointment Booked</div>
        <div class="highlight-value">${escapeHtml(call.service || 'Service')}</div>
        ${call.appointmentTime ? `<div class="value" style="margin-top: 8px;">📅 ${escapeHtml(call.appointmentTime)}</div>` : ''}
      </div>
      ` : ''}
      
      ${call.wasTransferred ? `
      <div class="highlight">
        <div class="label">🔄 Call Transferred</div>
        <div class="value">This call was transferred to a human representative.</div>
      </div>
      ` : ''}
      
      ${call.summary ? `
      <div class="section">
        <div class="label">Summary</div>
        <div class="value">${escapeHtml(call.summary)}</div>
      </div>
      ` : ''}
      
      ${call.transcript ? `
      <div class="section">
        <div class="label">Full Transcript</div>
        <div class="value" style="font-size: 14px; white-space: pre-wrap;">${escapeHtml(call.transcript)}</div>
      </div>
      ` : ''}
      
      ${call.recordingUrl ? `
      <div class="section" style="text-align: center;">
        <a href="${escapeHtml(call.recordingUrl)}" class="button">🎧 Listen to Recording</a>
      </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <p>Powered by Pick.UP • AI Receptionist</p>
      <p style="margin-top: 8px;">Questions? Reply to this email or contact support@pickuphone.com</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"Pick.UP" <${EMAIL_USER}>`,
      to: to,
      subject: `📞 New Call for ${businessName} - ${call.callerName || call.callerPhone}`,
      text: buildPlainText(businessName, call),
      html: html,
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Email send failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Build plain text version for email clients that don't support HTML
 */
function buildPlainText(businessName: string, call: CallNotification): string {
  const durationMinutes = Math.round(call.duration / 60);
  const durationText = durationMinutes < 1 ? '< 1 min' : `${durationMinutes} min`;

  let text = `New Call for ${businessName}\n`;
  text += `========================\n\n`;
  text += `Caller: ${call.callerName || call.callerPhone}\n`;
  text += `Duration: ${durationText}\n`;

  if (call.appointmentBooked) {
    text += `\n✅ APPOINTMENT BOOKED: ${call.service}\n`;
    if (call.appointmentTime) {
      text += `📅 ${call.appointmentTime}\n`;
    }
  }

  if (call.wasTransferred) {
    text += `\n🔄 Call was transferred to a human.\n`;
  }

  if (call.summary) {
    text += `\nSummary:\n${call.summary}\n`;
  }

  text += `\n--\nPowered by Pick.UP • AI Receptionist`;

  return text;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
