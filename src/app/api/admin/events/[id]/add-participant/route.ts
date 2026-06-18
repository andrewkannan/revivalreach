import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "LEADER")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const userToAdd = await prisma.user.findUnique({
      where: { email }
    });

    if (!userToAdd) {
      return NextResponse.json({ message: "User with this email not found in the system. They must register first." }, { status: 404 });
    }

    const existingParticipant = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId: userToAdd.id,
          eventId: eventId
        }
      }
    });

    if (existingParticipant) {
      return NextResponse.json({ message: "User is already on the list" }, { status: 400 });
    }

    const participant = await prisma.eventParticipant.create({
      data: {
        userId: userToAdd.id,
        eventId: eventId,
        isPresent: false, 
      },
      include: {
        user: {
          select: { name: true, email: true, phone: true, image: true }
        }
      }
    });

    return NextResponse.json({ message: "Added successfully", participant });
  } catch (error) {
    console.error("Admin add participant error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
