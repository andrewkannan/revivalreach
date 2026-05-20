import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() - 1); // Subtracted 1 to account for timezone edge cases, like we did on homepage

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2); // Get a window of 48 hours to be safe

    const events = await prisma.event.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        },
        status: "APPROVED"
      },
      orderBy: {
        date: 'asc'
      },
      include: {
        participants: {
          where: { userId: session.user.id },
          select: { id: true }
        }
      }
    });

    const mappedEvents = events.map(e => ({
      id: e.id,
      title: e.title,
      location: e.location,
      date: e.date,
      hasJoined: e.participants.length > 0
    }));

    return NextResponse.json(mappedEvents);
  } catch (error) {
    console.error("Fetch today events error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
