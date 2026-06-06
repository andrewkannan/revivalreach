import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "singleton" },
  });

  if (!settings || !settings.smtpHost || !settings.smtpPort || !settings.smtpUser || !settings.smtpPass) {
    console.warn("SMTP settings are not fully configured. Email not sent.");
    return { success: false, message: "SMTP settings not configured." };
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpPort === 465, // true for 465, false for other ports
    connectionTimeout: 10000, // 10 seconds to timeout
    greetingTimeout: 10000,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Revival Reach" <${settings.smtpUser}>`,
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    
    // Log success
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        status: "SUCCESS",
      }
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    
    // Log failure
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    });

    return { success: false, message: error instanceof Error ? error.message : "Unknown error sending email" };
  }
}

export function getSleekEmailHtml({
  title,
  subtitle,
  bodyContent,
  buttonText,
  buttonUrl,
}: {
  title: string;
  subtitle?: string;
  bodyContent: string;
  buttonText?: string;
  buttonUrl?: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
    body {
      margin: 0;
      padding: 0;
      background-color: #050505;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #E2E8F0;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 40px auto;
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .header {
      padding: 40px 30px 20px;
      text-align: center;
      background: linear-gradient(180deg, rgba(217, 70, 239, 0.05) 0%, rgba(10, 10, 10, 0) 100%);
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(to right, #D946EF, #8B5CF6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
      margin: 0 0 20px 0;
    }
    .title {
      font-size: 28px;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0;
      line-height: 1.2;
    }
    .subtitle {
      font-size: 16px;
      color: #94A3B8;
      margin: 10px 0 0 0;
      font-weight: 400;
    }
    .content {
      padding: 30px;
      font-size: 16px;
      line-height: 1.6;
      color: #CBD5E1;
    }
    .content p {
      margin-bottom: 20px;
    }
    .button-container {
      text-align: center;
      margin: 40px 0 20px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(90deg, #D946EF, #8B5CF6);
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 600;
      border-radius: 8px;
      font-size: 16px;
      box-shadow: 0 4px 14px 0 rgba(217, 70, 239, 0.39);
      transition: opacity 0.2s ease;
    }
    .footer {
      padding: 30px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      background: #080808;
    }
    .footer p {
      margin: 0;
      font-size: 14px;
      color: #64748B;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Revival Reach</div>
      <h1 class="title">${title}</h1>
      ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
    </div>
    <div class="content">
      ${bodyContent.replace(/\n/g, '<br/>')}
      ${buttonText && buttonUrl ? `
        <div class="button-container">
          <a href="${buttonUrl}" class="button">${buttonText}</a>
        </div>
      ` : ''}
    </div>
    <div class="footer">
      <p>Season of Territory Expansion.</p>
      <p style="margin-top: 8px; font-size: 12px; color: #475569;">&copy; ${new Date().getFullYear()} CCC Bilingual. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
