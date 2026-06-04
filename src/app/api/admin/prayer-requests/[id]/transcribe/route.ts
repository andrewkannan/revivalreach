import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { transcription } = await req.json();

    if (!transcription) {
      return NextResponse.json({ message: "Transcription is required" }, { status: 400 });
    }

    const updatedSoul = await prisma.soul.update({
      where: { id },
      data: {
        prayerNeeds: transcription
      }
    });

    return NextResponse.json(updatedSoul);
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
