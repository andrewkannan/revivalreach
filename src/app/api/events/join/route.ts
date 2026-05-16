import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ message: "Missing eventId" }, { status: 400 });
    }

    const userId = session.user.id;

    // Check if user is approved
    const user = await prisma.user.findUnique({ where: { id: userId }});
    if (!user?.isApproved) {
      return NextResponse.json({ message: "Your account must be approved by an admin first." }, { status: 403 });
    }

    // Check if already joined
    const existingParticipation = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    if (existingParticipation) {
      return NextResponse.json({ message: "You have already joined this event" }, { status: 400 });
    }

    // Create participation
    await prisma.eventParticipant.create({
      data: {
        userId,
        eventId
      }
    });

    // TODO: Send confirmation email using Nodemailer

    return NextResponse.json({ message: "Successfully joined the event" });
  } catch (error) {
    console.error("Join event error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
