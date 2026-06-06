import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { getSleekEmailHtml } from "@/lib/email";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    let settings = await prisma.systemSettings.findUnique({
      where: { id: "singleton" }
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: { id: "singleton" }
      });
    }

    if (!settings.emailTemplateApproved) {
      settings.emailTemplateApproved = getSleekEmailHtml({
        title: "Account Approved",
        subtitle: "Welcome to Revival Reach!",
        bodyContent: "Your account has been approved by an administrator. You can now access the system.",
        buttonText: "Go to Dashboard",
        buttonUrl: "{{link}}"
      });
    }

    if (!settings.emailTemplateReset) {
      settings.emailTemplateReset = getSleekEmailHtml({
        title: "Password Reset Request",
        bodyContent: "A password reset has been requested for your account. Click the button below to reset it. This link will expire in 1 hour.",
        buttonText: "Reset Password",
        buttonUrl: "{{link}}"
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();

    const settings = await prisma.systemSettings.upsert({
      where: { id: "singleton" },
      update: {
        smtpHost: data.smtpHost,
        smtpPort: data.smtpPort ? parseInt(data.smtpPort, 10) : null,
        smtpUser: data.smtpUser,
        smtpPass: data.smtpPass,
        prayerEmailTargets: data.prayerEmailTargets,
        autoFollowUpReminders: data.autoFollowUpReminders !== undefined ? data.autoFollowUpReminders : true,
        emailTemplateApproved: data.emailTemplateApproved,
        emailTemplateReset: data.emailTemplateReset,
        ...(data.rolePermissions && { rolePermissions: data.rolePermissions })
      },
      create: {
        id: "singleton",
        smtpHost: data.smtpHost,
        smtpPort: data.smtpPort ? parseInt(data.smtpPort, 10) : null,
        smtpUser: data.smtpUser,
        smtpPass: data.smtpPass,
        prayerEmailTargets: data.prayerEmailTargets,
        autoFollowUpReminders: data.autoFollowUpReminders !== undefined ? data.autoFollowUpReminders : true,
        emailTemplateApproved: data.emailTemplateApproved,
        emailTemplateReset: data.emailTemplateReset,
        ...(data.rolePermissions && { rolePermissions: data.rolePermissions })
      }
    });

    return NextResponse.json({ message: "Settings updated successfully", settings });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
