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
