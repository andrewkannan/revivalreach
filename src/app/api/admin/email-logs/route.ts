import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const logs = await prisma.emailLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to recent 100 to avoid huge payloads
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Fetch email logs error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
