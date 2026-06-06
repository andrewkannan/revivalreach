import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail, getSleekEmailHtml } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // We return success even if user not found to prevent email enumeration
      return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // 1 hour expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    const appUrl = process.env.NEXTAUTH_URL || req.headers.get("origin") || "https://revivalreach.up.railway.app";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    const settings = await prisma.systemSettings.findUnique({ where: { id: "singleton" } });
    const defaultTemplate = "A password reset has been requested for your account. Click the button below to reset it. This link will expire in 1 hour.";
    let bodyContent = (settings?.emailTemplateReset || defaultTemplate)
      .replace(/{{name}}/g, user.name || "User")
      .replace(/{{email}}/g, user.email || "");

    const html = getSleekEmailHtml({
      title: "Password Reset Request",
      bodyContent,
      buttonText: "Reset Password",
      buttonUrl: resetUrl
    });

    await sendEmail({
      to: user.email!,
      subject: "Revival Reach - Password Reset Request",
      html
    });

    return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
