import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const testimonies = await prisma.testimony.findMany({
      where: { status: "APPROVED", isPrivate: false },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true }
        }
      }
    });
    return NextResponse.json(testimonies);
  } catch (error) {
    console.error("Fetch testimonies error:", error);
    return NextResponse.json({ error: "Failed to fetch testimonies" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, audioUrl, isPrivate } = await req.json();

    if (!content && !audioUrl) {
      return NextResponse.json({ error: "Content or Audio is required" }, { status: 400 });
    }

    const testimony = await prisma.testimony.create({
      data: {
        userId: session.user.id,
        name: session.user.name || "Anonymous",
        content,
        audioUrl,
        isPrivate: Boolean(isPrivate),
        status: isPrivate ? "APPROVED" : "PENDING"
      }
    });

    return NextResponse.json(testimony, { status: 201 });
  } catch (error) {
    console.error("Create testimony error:", error);
    return NextResponse.json({ error: "Failed to create testimony" }, { status: 500 });
  }
}
