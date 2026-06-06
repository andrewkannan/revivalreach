import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { sendEmail, getSleekEmailHtml } from "@/lib/email";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { userId, action, value } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    let updatedUser;

    if (action === "approve") {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isApproved: true },
      });
      
      const appUrl = process.env.NEXTAUTH_URL || req.headers.get("origin") || "https://revivalreach.up.railway.app";
      if (updatedUser.email) {
        const settings = await prisma.systemSettings.findUnique({ where: { id: "singleton" } });
        const defaultTemplate = "Your account has been approved by an administrator. You can now access the system.";
        let bodyContent = (settings?.emailTemplateApproved || defaultTemplate)
          .replace(/{{name}}/g, updatedUser.name || "User")
          .replace(/{{email}}/g, updatedUser.email);
        
        const html = getSleekEmailHtml({
          title: "Account Approved",
          subtitle: "Welcome to Revival Reach!",
          bodyContent,
          buttonText: "Go to Dashboard",
          buttonUrl: appUrl
        });

        await sendEmail({
          to: updatedUser.email,
          subject: "Your Revival Reach Account is Approved!",
          html
        });
      }
    } else if (action === "role") {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: value },
      });
    } else if (action === "disable") {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });
    } else if (action === "enable") {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
      });
    } else if (action === "trigger-reset") {
      const targetUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!targetUser || !targetUser.email) {
        return NextResponse.json({ message: "User not found or has no email" }, { status: 400 });
      }
      const crypto = require("crypto");
      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 1);
      
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { resetToken: token, resetTokenExpiry: expiry }
      });

      const appUrl = process.env.NEXTAUTH_URL || req.headers.get("origin") || "https://revivalreach.up.railway.app";
      const resetUrl = `${appUrl}/reset-password?token=${token}`;

      const settings = await prisma.systemSettings.findUnique({ where: { id: "singleton" } });
      const defaultTemplate = "A password reset has been requested for your account. Click the button below to reset it. This link will expire in 1 hour.";
      let bodyContent = (settings?.emailTemplateReset || defaultTemplate)
        .replace(/{{name}}/g, targetUser.name || "User")
        .replace(/{{email}}/g, targetUser.email);

      const html = getSleekEmailHtml({
        title: "Password Reset",
        subtitle: "Admin Initiated Request",
        bodyContent,
        buttonText: "Reset Password",
        buttonUrl: resetUrl
      });

      await sendEmail({
        to: targetUser.email,
        subject: "Revival Reach - Password Reset Request",
        html
      });
    } else if (action === "delete") {
      await prisma.user.delete({
        where: { id: userId }
      });
      return NextResponse.json({ message: "User deleted" });
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
