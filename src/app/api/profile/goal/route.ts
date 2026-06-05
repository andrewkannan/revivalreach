import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { evangelismGoal: true }
    });

    // Get first day of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get number of Souls logged by this user this month
    const monthlyEngagements = await prisma.soul.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    return NextResponse.json({
      goal: user?.evangelismGoal || 0,
      current: monthlyEngagements
    });
  } catch (error) {
    console.error("Error fetching goal:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { goal } = await req.json();
    
    if (typeof goal !== 'number' || goal < 0) {
      return NextResponse.json({ message: "Invalid goal" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { evangelismGoal: goal }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
