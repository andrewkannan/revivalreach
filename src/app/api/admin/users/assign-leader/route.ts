import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { userId, leaderId } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { leaderId: leaderId || null } // null unassigns the leader
    });

    return NextResponse.json({ message: "Leader assigned successfully", user });
  } catch (error) {
    console.error("Assign leader error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        leaderId: true,
        leader: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Fetch users for leaders error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
