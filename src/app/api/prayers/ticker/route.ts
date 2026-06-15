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

    const prayerRequests = await prisma.soul.findMany({
      where: { 
        requestedPrayer: true,
        hasTestimony: false,
        prayerNeeds: { not: null }
      },
      select: {
        id: true,
        name: true,
        prayerNeeds: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json(prayerRequests);
  } catch (error) {
    console.error("Fetch prayer ticker error:", error);
    return NextResponse.json({ error: "Failed to fetch prayer requests" }, { status: 500 });
  }
}
