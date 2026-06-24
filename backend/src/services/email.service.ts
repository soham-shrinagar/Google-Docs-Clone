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

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private transporter: Transporter | null = null;

  private provider(): 'brevo' | 'resend' | 'smtp' | null {
    if (config.brevo.apiKey && config.brevo.senderEmail) return 'brevo';
    if (config.resend.apiKey) return 'resend';
    if (config.smtp.host && config.smtp.user && config.smtp.pass) return 'smtp';
    return null;
  }

  /** HTTP API (Brevo or Resend) — works on Render free tier. */
  usesHttpApi(): boolean {
    const p = this.provider();
    return p === 'brevo' || p === 'resend';
  }

  isConfigured(): boolean {
    return this.provider() !== null;
  }

  private brevoSender() {
    return {
      name: config.brevo.senderName,
      email: config.brevo.senderEmail,
    };
  }

  private resendFrom(): string {
    return config.resend.from;
  }

  private getTransporter(): Transporter {
    if (!this.transporter) {
      const port = config.smtp.port;
      const secure = config.smtp.secure || port === 465;

      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port,
        secure,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
        connectionTimeout: 15_000,
        greetingTimeout: 15_000,
        socketTimeout: 30_000,
        tls: { minVersion: 'TLSv1.2' },
      });
    }
    return this.transporter;
  }

  private async sendViaBrevo(params: SendEmailParams): Promise<boolean> {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': config.brevo.apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: this.brevoSender(),
        to: [{ email: params.to }],
        subject: params.subject,
        htmlContent: params.html,
        textContent: params.text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] Brevo API error (${res.status}):`, body);
      return false;
    }

    if (config.nodeEnv === 'development') {
      const data = await res.json().catch(() => ({})) as { messageId?: string };
      console.log(`[email] Sent via Brevo to ${params.to}${data.messageId ? ` (${data.messageId})` : ''}`);
    }
    return true;
  }

  private async sendViaResend(params: SendEmailParams): Promise<boolean> {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.resend.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.resendFrom(),
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] Resend API error (${res.status}):`, body);
      return false;
    }

    if (config.nodeEnv === 'development') {
      const data = await res.json().catch(() => ({})) as { id?: string };
      console.log(`[email] Sent via Resend to ${params.to}${data.id ? ` (${data.id})` : ''}`);
    }
    return true;
  }

  private async sendViaSmtp(params: SendEmailParams): Promise<boolean> {
    try {
      const info = await this.getTransporter().sendMail({
        from: config.smtp.from,
        replyTo: config.smtp.user,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      });
      if (config.nodeEnv === 'development') {
        console.log(`[email] Sent via SMTP to ${params.to} (${info.messageId})`);
      }
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[email] SMTP failed for ${params.to}:`, message);
      if (/timeout|ETIMEDOUT|ECONNREFUSED/i.test(message)) {
        console.error(
          '[email] Hint: Render free tier blocks SMTP ports 465/587. Set BREVO_API_KEY on Render instead.'
        );
      }
      return false;
    }
  }

  private async deliver(params: SendEmailParams): Promise<boolean> {
    const provider = this.provider();
    if (!provider) {
      if (config.nodeEnv === 'development') {
        console.warn('[email] Not configured — set BREVO_API_KEY or SMTP_* in .env');
      }
      return false;
    }
    if (provider === 'brevo') return this.sendViaBrevo(params);
    if (provider === 'resend') return this.sendViaResend(params);
    return this.sendViaSmtp(params);
  }

  async sendDocumentShareEmail(params: DocumentShareEmailParams): Promise<boolean> {
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

    return this.deliver({ to, subject, html, text });
  }

  async sendOtpEmail(params: {
    to: string;
    code: string;
    purpose: 'SIGNUP' | 'LOGIN';
  }): Promise<boolean> {
    const { to, code, purpose } = params;
    const actionLabel = purpose === 'SIGNUP' ? 'complete your sign up' : 'sign in';
    const subject = `Your CollabDocs verification code: ${code}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#fff;border-radius:16px;border:1px solid #e4e4e7;overflow:hidden;">
        <tr><td style="background:#1e1b4b;padding:24px 28px;">
          <p style="margin:0;color:#fff;font-size:18px;font-weight:600;">CollabDocs</p>
          <p style="margin:6px 0 0;color:#a5b4fc;font-size:13px;">Email verification</p>
        </td></tr>
        <tr><td style="padding:28px;text-align:center;">
          <p style="margin:0 0 8px;color:#52525b;font-size:15px;">Use this code to ${actionLabel}:</p>
          <p style="margin:16px 0;font-size:32px;font-weight:700;letter-spacing:8px;color:#1e1b4b;font-family:monospace;">${code}</p>
          <p style="margin:0;color:#a1a1aa;font-size:13px;line-height:1.5;">
            This code expires in 10 minutes.<br>
            If you didn't request this, you can ignore this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const text = `Your CollabDocs verification code is ${code}. It expires in 10 minutes. Use it to ${actionLabel}.`;

    return this.deliver({ to, subject, html, text });
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
