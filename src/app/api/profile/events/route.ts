import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userName = session.user.name || "";

    // Find events where the user is a participant
    const participantEvents = await prisma.event.findMany({
      where: {
        participants: {
          some: { userId: userId }
        }
      },
      include: {
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    let leaderEvents: any[] = [];
    if (session.user.role === "ADMIN" || session.user.role === "LEADER") {
      leaderEvents = await prisma.event.findMany({
        where: {
          leaderName: {
            contains: userName
          }
        },
        include: {
          _count: {
            select: { participants: true }
          }
        },
        orderBy: { date: 'asc' }
      });
    }

    // Merge and deduplicate by ID
    const combinedMap = new Map();
    participantEvents.forEach(e => combinedMap.set(e.id, e));
    leaderEvents.forEach(e => combinedMap.set(e.id, e));

    const events = Array.from(combinedMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(events);
  } catch (error) {
    console.error("Fetch profile events error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
