import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const souls = await prisma.soul.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isPriority: "desc" },
        { createdAt: "desc" }
      ],
      include: {
        event: {
          select: { title: true }
        }
      }
    });

    return NextResponse.json(souls);
  } catch (error) {
    console.error("Fetch souls error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, prayed, healed, requestedPrayer, prayerNeeds, remarks, eventId, isPriority } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ message: "Name and phone are required" }, { status: 400 });
    }

    const newSoul = await prisma.soul.create({
      data: {
        userId: session.user.id,
        name,
        phone,
        prayed: Boolean(prayed),
        healed: Boolean(healed),
        requestedPrayer: Boolean(requestedPrayer),
        prayerNeeds: prayerNeeds || null,
        remarks: remarks || null,
        eventId: eventId || null,
        isPriority: Boolean(isPriority)
      }
    });

    return NextResponse.json(newSoul, { status: 201 });
  } catch (error) {
    console.error("Create soul error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
