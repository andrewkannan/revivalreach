import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const eventsWithoutSlugs = await prisma.event.findMany({
      where: { slug: null }
    });

    if (eventsWithoutSlugs.length === 0) {
      return NextResponse.json({ message: "All events already have slugs" });
    }

    const generateSlug = async (title: string, date: Date) => {
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      const dateStr = `${monthNames[date.getMonth()]}-${date.getDate()}`;
      
      let initialSlug = `${baseSlug}-${dateStr}`;
      let slug = initialSlug;
      let counter = 1;
      
      while (true) {
        const existing = await prisma.event.findUnique({ where: { slug } });
        if (!existing) break;
        slug = `${initialSlug}-${counter}`;
        counter++;
      }
      return slug;
    };

    let updatedCount = 0;
    for (const event of eventsWithoutSlugs) {
      const slug = await generateSlug(event.title, new Date(event.date));
      await prisma.event.update({
        where: { id: event.id },
        data: { slug }
      });
      updatedCount++;
    }

    return NextResponse.json({ message: `Successfully backfilled slugs for ${updatedCount} events.` });
  } catch (error) {
    console.error("Backfill error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
