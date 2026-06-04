import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, audioUrl } = await req.json();

    if (!content && !audioUrl) {
      return NextResponse.json({ error: "Content or Audio is required" }, { status: 400 });
    }

    const existingTestimony = await prisma.testimony.findUnique({
      where: { id }
    });

    if (!existingTestimony) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existingTestimony.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existingTestimony.status !== "PENDING") {
      return NextResponse.json({ error: "Only pending testimonies can be edited" }, { status: 400 });
    }

    const updatedTestimony = await prisma.testimony.update({
      where: { id },
      data: {
        content,
        audioUrl,
        status: "PENDING" // Ensure it remains pending for admin review
      }
    });

    return NextResponse.json(updatedTestimony);
  } catch (error) {
    console.error("Update testimony error:", error);
    return NextResponse.json({ error: "Failed to update testimony" }, { status: 500 });
  }
}
