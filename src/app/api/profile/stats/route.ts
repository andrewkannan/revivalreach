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

    const [totalSouls, revivalsJoined, prayedFor, healed] = await Promise.all([
      prisma.soul.count({ where: { userId } }),
      prisma.eventParticipant.count({ where: { userId } }),
      prisma.soul.count({ where: { userId, prayed: true } }),
      prisma.soul.count({ where: { userId, healed: true } })
    ]);

    return NextResponse.json({
      totalSouls,
      revivalsJoined,
      prayedFor,
      healed
    });
  } catch (error) {
    console.error("Profile Stats GET Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
