import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function GET(req: Request) {
  try {
    // 1. Check if reminders are enabled
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "singleton" }
    });

    if (!settings || !settings.autoFollowUpReminders) {
      return NextResponse.json({ message: "Reminders are disabled in settings." });
    }

    if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
      return NextResponse.json({ message: "SMTP settings not fully configured." }, { status: 500 });
    }

    // Configure Mailer
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 465,
      secure: true,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass
      }
    });

    // 2. Query all souls that haven't been followed up
    const souls = await prisma.soul.findMany({
      where: {
        hasFollowedUp: false,
        OR: [
          { followUp24hSent: false },
          { followUp3dSent: false },
          { followUp7dSent: false }
        ]
      },
      include: {
        user: true, // The person who submitted the engage record
        event: true
      }
    });

    const now = new Date();
    const MS_PER_HOUR = 1000 * 60 * 60;
    const MS_PER_DAY = MS_PER_HOUR * 24;

    let emailsSent = 0;

    for (const soul of souls) {
      if (!soul.user.email) continue; // Skip if user has no email

      const hoursSinceCreated = (now.getTime() - new Date(soul.createdAt).getTime()) / MS_PER_HOUR;
      const daysSinceCreated = hoursSinceCreated / 24;

      let shouldSend = false;
      let reminderType = "";
      
      let updateData: any = {};

      if (hoursSinceCreated >= 24 && !soul.followUp24hSent) {
        shouldSend = true;
        reminderType = "24 Hour";
        updateData.followUp24hSent = true;
      } else if (daysSinceCreated >= 3 && !soul.followUp3dSent) {
        shouldSend = true;
        reminderType = "3 Day";
        // Also mark 24h as sent so it doesn't try to send retroactively if it missed it
        updateData.followUp24hSent = true; 
        updateData.followUp3dSent = true;
      } else if (daysSinceCreated >= 7 && !soul.followUp7dSent) {
        shouldSend = true;
        reminderType = "7 Day";
        updateData.followUp24hSent = true;
        updateData.followUp3dSent = true;
        updateData.followUp7dSent = true;
      }

      if (shouldSend) {
        // Send Email
        const mailOptions = {
          from: `"Revival Reach" <${settings.smtpUser}>`,
          to: soul.user.email,
          subject: `Follow-up Reminder (${reminderType}): ${soul.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eaeaea; border-radius: 10px;">
              <h2 style="color: #6366f1;">Follow-up Reminder</h2>
              <p>Hi ${soul.user.name || "Revivalist"},</p>
              <p>It's been <strong>${reminderType}s</strong> since you engaged with <strong>${soul.name}</strong>.</p>
              ${soul.event ? `<p><strong>Event:</strong> ${soul.event.title}</p>` : ''}
              <p><strong>Phone:</strong> ${soul.phone}</p>
              <p>Don't forget to reach out and follow up with them! Once you've followed up, please mark them as "Followed Up" on the Engage page in Revival Reach.</p>
              <br/>
              <p>Blessings,<br/>The Revival Reach Team</p>
            </div>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          
          // Update DB
          await prisma.soul.update({
            where: { id: soul.id },
            data: updateData
          });
          
          emailsSent++;
        } catch (mailErr) {
          console.error(`Failed to send ${reminderType} reminder to ${soul.user.email}`, mailErr);
        }
      }
    }

    return NextResponse.json({ message: "Cron processed successfully", emailsSent });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
