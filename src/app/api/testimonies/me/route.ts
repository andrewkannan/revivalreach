import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testimonies = await prisma.testimony.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(testimonies);
  } catch (error) {
    console.error("Fetch my testimonies error:", error);
    return NextResponse.json({ error: "Failed to fetch testimonies" }, { status: 500 });
  }
}
