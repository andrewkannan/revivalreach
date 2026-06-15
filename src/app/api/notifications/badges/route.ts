import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role || "GUEST";
    
    // 1. Pending Followups for Engage (Admin/Leader only)
    let pendingEngageCount = 0;
    if (userRole === "ADMIN" || userRole === "LEADER") {
      pendingEngageCount = await prisma.evangelismRequest.count({
        where: { status: "PENDING" }
      });
    }

    // 2. New Revivals created in the last 3 days (For all users)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const newRevivalCount = await prisma.event.count({
      where: {
        status: "APPROVED",
        createdAt: { gte: threeDaysAgo }
      }
    });

    return NextResponse.json({
      pendingEngage: pendingEngageCount,
      newRevivals: newRevivalCount
    });

  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
