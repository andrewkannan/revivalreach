import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testimonies = await prisma.testimony.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
    return NextResponse.json(testimonies);
  } catch (error) {
    console.error("Fetch admin testimonies error:", error);
    return NextResponse.json({ error: "Failed to fetch testimonies" }, { status: 500 });
  }
}
