import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LEADER")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "Soul ID is required" }, { status: 400 });
    }

    // Get the soul
    const soul = await prisma.soul.findUnique({
      where: { id },
      include: { user: true, event: true }
    });

    if (!soul) {
      return NextResponse.json({ message: "Soul not found" }, { status: 404 });
    }

    // Get settings
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "singleton" }
    });

    if (!settings || !settings.smtpHost || !settings.smtpPort || !settings.smtpUser || !settings.smtpPass || !settings.prayerEmailTargets) {
      return NextResponse.json({ message: "SMTP or prayer email targets are not fully configured in settings." }, { status: 400 });
    }

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });

    // Send email
    const mailOptions = {
      from: `"Revival Reach" <${settings.smtpUser}>`,
      to: settings.prayerEmailTargets, // can be comma separated
      subject: `[VERIFIED] Prayer Request: ${soul.name}`,
      text: `
We have a verified prayer request for ${soul.name}.

Details:
Name: ${soul.name}
Phone: ${soul.phone}
Prayer Needs: ${soul.prayerNeeds || "None specified"}
Remarks: ${soul.remarks || "None"}
Event: ${soul.event ? soul.event.title : "None"}
Added by: ${soul.user.name || soul.user.email}

Please keep them in your prayers!
      `,
      html: `
        <h2>Verified Prayer Request</h2>
        <p>We have a verified prayer request for <strong>${soul.name}</strong>.</p>
        <ul>
          <li><strong>Name:</strong> ${soul.name}</li>
          <li><strong>Phone:</strong> ${soul.phone}</li>
          <li><strong>Prayer Needs:</strong> ${soul.prayerNeeds || "None specified"}</li>
          <li><strong>Remarks:</strong> ${soul.remarks || "None"}</li>
          <li><strong>Event:</strong> ${soul.event ? soul.event.title : "None"}</li>
          <li><strong>Added by:</strong> ${soul.user.name || soul.user.email}</li>
        </ul>
        <p>Please keep them in your prayers!</p>
      `
    };

    await transporter.sendMail(mailOptions);

    // Update the soul to mark email sent
    await prisma.soul.update({
      where: { id },
      data: { prayerEmailSent: true }
    });

    return NextResponse.json({ message: "Prayer request verified and email sent successfully." });
  } catch (error) {
    console.error("Verify prayer request error:", error);
    return NextResponse.json({ message: "Failed to send email. Check SMTP settings." }, { status: 500 });
  }
}
