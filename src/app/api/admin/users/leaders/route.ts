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

    const leaders = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "LEADER"]
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: "asc"
      }
    });

    return NextResponse.json(leaders);
  } catch (error) {
    console.error("Fetch leaders error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
