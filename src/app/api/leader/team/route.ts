import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LEADER")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const members = await prisma.user.findMany({
      where: { leaderId: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        _count: {
          select: {
            participations: true,
            souls: true,
          }
        }
      }
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Fetch team error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
