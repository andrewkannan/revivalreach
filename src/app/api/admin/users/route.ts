import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

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
      // TODO: Send approval email using Nodemailer
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
