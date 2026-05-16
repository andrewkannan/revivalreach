import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LEADER")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();

    const encodedLocation = encodeURIComponent(data.location);
    const autoGoogleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    const autoWazeLink = `https://waze.com/ul?q=${encodedLocation}`;

    // Generate unique R0001 code
    const lastEvent = await prisma.event.findFirst({
      where: { eventCode: { not: null } },
      orderBy: { eventCode: 'desc' }
    });

    let newCode = "R0001";
    if (lastEvent?.eventCode && lastEvent.eventCode.startsWith("R")) {
      const lastNumber = parseInt(lastEvent.eventCode.substring(1), 10);
      if (!isNaN(lastNumber)) {
        newCode = `R${String(lastNumber + 1).padStart(4, '0')}`;
      }
    }

    const event = await prisma.event.create({
      data: {
        eventCode: newCode,
        title: data.title,
        date: new Date(data.date),
        location: data.location,
        googleMapsLink: data.googleMapsLink || autoGoogleMapsLink,
        wazeLink: data.wazeLink || autoWazeLink,
        whatsappLink: data.whatsappLink || null,
        whatsappGroupLink: data.whatsappGroupLink || null,
        meetingPoint: data.meetingPoint || null,
        remarks: data.remarks || null,
        leaderName: data.leaderName || null,
      }
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LEADER")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Event ID is required" }, { status: 400 });
    }

    await prisma.event.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
