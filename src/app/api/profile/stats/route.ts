import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [totalSouls, revivalsJoined, totalTestimonies, user] = await Promise.all([
      prisma.soul.count({ where: { userId } }),
      prisma.eventParticipant.count({ where: { userId } }),
      prisma.testimony.count({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId }, select: { image: true, vision: true, name: true, email: true, ministry: true } })
    ]);

    return NextResponse.json({
      engage: totalSouls,
      revivals: revivalsJoined,
      testimony: totalTestimonies,
      user
    });
  } catch (error) {
    console.error("Profile Stats GET Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
