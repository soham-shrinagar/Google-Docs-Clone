import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from '../config/index.js';

export interface DocumentShareEmailParams {
  to: string;
  documentTitle: string;
  sharerName: string;
  role: string;
  docUrl: string;
  isRegistered: boolean;
}

class EmailService {
  private transporter: Transporter | null = null;

  isConfigured(): boolean {
    return Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);
  }

  private getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
      });
    }
    return this.transporter;
  }

  async sendDocumentShareEmail(params: DocumentShareEmailParams): Promise<boolean> {
    if (!this.isConfigured()) {
      if (config.nodeEnv === 'development') {
        console.warn(
          '[email] SMTP not configured — share saved but no email sent. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env'
        );
      }
      return false;
    }

    const { to, documentTitle, sharerName, role, docUrl, isRegistered } = params;
    const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();
    const subject = `${sharerName} shared "${documentTitle}" with you on CollabDocs`;

    const intro = isRegistered
      ? `${sharerName} gave you <strong>${roleLabel}</strong> access to a document.`
      : `${sharerName} invited you to collaborate on a document. Create a free CollabDocs account to open it.`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:16px;border:1px solid #e4e4e7;overflow:hidden;">
        <tr><td style="background:#1e1b4b;padding:24px 28px;">
          <p style="margin:0;color:#fff;font-size:18px;font-weight:600;">CollabDocs</p>
          <p style="margin:6px 0 0;color:#a5b4fc;font-size:13px;">Document shared with you</p>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 12px;color:#18181b;font-size:15px;line-height:1.6;">Hi,</p>
          <p style="margin:0 0 20px;color:#52525b;font-size:15px;line-height:1.6;">${intro}</p>
          <p style="margin:0 0 8px;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Document</p>
          <p style="margin:0 0 24px;color:#1e1b4b;font-size:20px;font-weight:600;">${escapeHtml(documentTitle)}</p>
          <a href="${docUrl}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:600;font-size:14px;">
            Open document →
          </a>
          <p style="margin:24px 0 0;color:#a1a1aa;font-size:12px;line-height:1.5;">
            Or copy this link:<br>
            <a href="${docUrl}" style="color:#6366f1;word-break:break-all;">${docUrl}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const text = [
      `${sharerName} shared "${documentTitle}" with you on CollabDocs.`,
      isRegistered ? `You have ${roleLabel} access.` : 'Sign up or sign in to open the document.',
      `Open: ${docUrl}`,
    ].join('\n\n');

    try {
      await this.getTransporter().sendMail({
        from: config.smtp.from,
        to,
        subject,
        text,
        html,
      });
      return true;
    } catch (err) {
      console.error('[email] Failed to send share email:', err instanceof Error ? err.message : err);
      return false;
    }
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const emailService = new EmailService();
