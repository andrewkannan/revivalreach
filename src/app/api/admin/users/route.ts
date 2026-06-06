import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { sendEmail } from "@/lib/email";

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
        await sendEmail({
          to: updatedUser.email,
          subject: "Your Revival Reach Account is Approved!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Welcome to Revival Reach!</h2>
              <p>Hi ${updatedUser.name || "User"},</p>
              <p>Your account has been approved by an administrator. You can now access the system.</p>
              <p><strong>Your Username (Email):</strong> ${updatedUser.email}</p>
              <br/>
              <a href="${appUrl}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
              <br/><br/>
              <p>Blessings,<br/>The Revival Reach Team</p>
            </div>
          `
        });
      }
    } else if (action === "role") {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: value },
      });
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
