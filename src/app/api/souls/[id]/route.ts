import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const soul = await prisma.soul.findUnique({
      where: { id }
    });

    if (!soul) {
      return NextResponse.json({ message: "Soul not found" }, { status: 404 });
    }

    // Ensure the soul belongs to the user or user is admin
    if (soul.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { name, phone, prayed, healed, remarks } = await req.json();

    const updatedSoul = await prisma.soul.update({
      where: { id },
      data: {
        name,
        phone,
        prayed: Boolean(prayed),
        healed: Boolean(healed),
        remarks: remarks || null
      }
    });

    return NextResponse.json(updatedSoul);
  } catch (error) {
    console.error("Update soul error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const soul = await prisma.soul.findUnique({
      where: { id }
    });

    if (!soul) {
      return NextResponse.json({ message: "Soul not found" }, { status: 404 });
    }

    // Ensure the soul belongs to the user or user is admin
    if (soul.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.soul.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Soul deleted successfully" });
  } catch (error) {
    console.error("Delete soul error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
