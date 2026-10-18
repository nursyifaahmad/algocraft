import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { studentId, action } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: "studentId diperlukan" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    let newHearts = student.hearts;
    if (action === "decrease") {
      newHearts = Math.max(0, student.hearts - 1);
    } else if (action === "reset") {
      newHearts = 3;
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { hearts: newHearts },
    });

    return NextResponse.json({ hearts: updated.hearts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
