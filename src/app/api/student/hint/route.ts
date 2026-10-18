import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { studentId, cost } = await req.json();

    if (!studentId || cost === undefined) {
      return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    if (student.coins < cost) {
      return NextResponse.json(
        { error: "Koin tidak mencukupi untuk membuka petunjuk ini!" },
        { status: 400 }
      );
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        coins: Math.max(0, student.coins - cost),
      },
    });

    return NextResponse.json({ success: true, coins: updated.coins });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
