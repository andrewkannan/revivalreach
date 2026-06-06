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
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unknown error sending email" };
  }
}
