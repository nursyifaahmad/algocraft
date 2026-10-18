import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionCode = searchParams.get("sessionCode");

    if (!sessionCode) {
      return NextResponse.json({ error: "sessionCode diperlukan" }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { code: sessionCode.toUpperCase().trim() },
    });

    if (!session) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
    }

    const topStudents = await prisma.student.findMany({
      where: { sessionId: session.id },
      orderBy: [{ xp: "desc" }, { coins: "desc" }],
      take: 10,
      select: {
        id: true,
        name: true,
        absentNo: true,
        avatar: true,
        xp: true,
        coins: true,
        currentLevel: true,
        isFinished: true,
        badges: {
          select: {
            badgeCode: true,
            title: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json({ leaderboard: topStudents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
