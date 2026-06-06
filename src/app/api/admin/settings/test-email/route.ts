import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email address is required" }, { status: 400 });
    }

    const result = await sendEmail({
      to: email,
      subject: "Revival Reach - Test Email Successful",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
          <h2>Test Email Successful!</h2>
          <p>If you are receiving this email, your SMTP configuration in Revival Reach is working correctly.</p>
          <br/>
          <p>Blessings,<br/>The Revival Reach Team</p>
        </div>
      `
    });

    if (result.success) {
      return NextResponse.json({ message: "Test email sent successfully!" });
    } else {
      return NextResponse.json({ message: "Failed to send email: " + result.message }, { status: 500 });
    }
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
