import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "studentId diperlukan" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        session: true,
        scores: true,
        badges: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Data siswa tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error: any) {
    console.error("Get student state error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
