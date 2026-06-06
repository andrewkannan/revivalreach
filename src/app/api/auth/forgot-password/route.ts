import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

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

    await sendEmail({
      to: user.email!,
      subject: "Revival Reach - Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${user.name || "User"},</p>
          <p>You recently requested to reset your password for your Revival Reach account. Click the button below to reset it.</p>
          <br/>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <br/><br/>
          <p>If you did not request a password reset, please ignore this email. This link will expire in 1 hour.</p>
          <p>Blessings,<br/>The Revival Reach Team</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
