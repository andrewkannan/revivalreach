import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { smtpHost, smtpPort, smtpUser, smtpPass, whatsappTemplate } = await req.json();

    const updatedSettings = await prisma.systemSettings.upsert({
      where: { id: "singleton" },
      update: {
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
        whatsappTemplate
      },
      create: {
        id: "singleton",
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
        whatsappTemplate
      }
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
