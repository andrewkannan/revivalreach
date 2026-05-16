import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LEADER")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Get event error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LEADER")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const data = await req.json();

    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // Only Admin can edit an approved event, or change status
    if (existingEvent.status === "APPROVED" && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Only Admins can edit approved revivals." }, { status: 403 });
    }

    // Ensure leader cannot spoof status to APPROVED
    if (session.user.role !== "ADMIN" && data.status === "APPROVED") {
      return NextResponse.json({ message: "Only Admins can approve revivals." }, { status: 403 });
    }

    // Auto generate waze/maps links if they are empty
    let newGoogleMapsLink = data.googleMapsLink;
    let newWazeLink = data.wazeLink;

    if (!newGoogleMapsLink) {
      newGoogleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.location)}`;
    }
    if (!newWazeLink) {
      newWazeLink = `https://waze.com/ul?q=${encodeURIComponent(data.location)}`;
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        date: new Date(data.date),
        location: data.location,
        googleMapsLink: newGoogleMapsLink,
        wazeLink: newWazeLink,
        whatsappLink: data.whatsappLink || null,
        whatsappGroupLink: data.whatsappGroupLink || null,
        meetingPoint: data.meetingPoint || null,
        remarks: data.remarks || null,
        leaderName: data.leaderName || null,
        status: data.status || existingEvent.status
      }
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
