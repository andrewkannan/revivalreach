import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "LEADER")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId, isPresent } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "userId is required" }, { status: 400 });
    }

    const participant = await prisma.eventParticipant.update({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: eventId
        }
      },
      data: {
        isPresent,
        checkedInAt: isPresent ? new Date() : null
      }
    });

    return NextResponse.json({ message: "Updated successfully", participant });
  } catch (error) {
    console.error("Admin participant update error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
