import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Generate a secure, short-lived token (5 minutes)
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5);

    await prisma.user.update({
      where: { id: userId },
      data: {
        impersonationToken: token,
        impersonationTokenExpiry: expiry
      }
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Impersonate API error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
