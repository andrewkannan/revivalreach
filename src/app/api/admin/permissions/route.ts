import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ allowedPaths: [] });
    }

    const role = session.user.role;

    if (role === "ADMIN") {
      // Admin has access to all paths, we can return a special flag or all paths
      return NextResponse.json({ allowedPaths: ["ALL"] });
    }

    const settings = await prisma.systemSettings.findUnique({
      where: { id: "singleton" }
    });

    if (!settings || !settings.rolePermissions) {
      return NextResponse.json({ allowedPaths: [] });
    }

    const permissions = typeof settings.rolePermissions === 'string' 
      ? JSON.parse(settings.rolePermissions) 
      : settings.rolePermissions as Record<string, string[]>;

    const allowedPaths = permissions[role] || [];
    
    return NextResponse.json({ allowedPaths });
  } catch (error) {
    console.error("Fetch permissions error:", error);
    return NextResponse.json({ allowedPaths: [] }, { status: 500 });
  }
}
