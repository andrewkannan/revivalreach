import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, contactInfo, area, details } = await req.json();

    if (!name || !contactInfo || !area) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const request = await prisma.evangelismRequest.create({
      data: {
        name,
        contactInfo,
        area,
        details,
        status: "PENDING"
      }
    });

    // TODO: Send notification email to admins using Nodemailer

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error("Evangelism request error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
