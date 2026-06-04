import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Upsert participant to handle both RSVP'd users and new walk-ins
    const participant = await prisma.eventParticipant.upsert({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: eventId
        }
      },
      update: {
        isPresent: true,
        checkedInAt: new Date()
      },
      create: {
        userId: session.user.id,
        eventId: eventId,
        isPresent: true,
        checkedInAt: new Date()
      }
    });

    return NextResponse.json({ message: "Checked in successfully", participant });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
