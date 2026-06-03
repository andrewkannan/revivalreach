import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const hash = await bcrypt.hash("godisgoodallthetime", 10);
    const user = await prisma.user.upsert({
      where: { email: "admin@admin.com" },
      update: {
        passwordHash: hash,
        role: "ADMIN",
        isApproved: true,
      },
      create: {
        email: "admin@admin.com",
        name: "Admin",
        passwordHash: hash,
        role: "ADMIN",
        isApproved: true,
      },
    });
    
    return NextResponse.json({ message: "Test admin account created successfully!", user: { email: user.email, role: user.role } });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
