import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { studentId, activeTab } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: "studentId diperlukan" }, { status: 400 });
    }

    const currentStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!currentStudent) {
      return NextResponse.json(
        { error: "Data siswa tidak ditemukan atau sesi telah di-reset oleh guru", isReset: true },
        { status: 404 }
      );
    }

    const validTab =
      typeof activeTab === "number" && activeTab >= 1 && activeTab <= 6
        ? activeTab
        : currentStudent.activeTab;

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        activeTab: validTab,
        lastActiveAt: new Date(),
      },
      select: {
        id: true,
        activeTab: true,
        currentLevel: true,
        lastActiveAt: true,
        isFinished: true,
      },
    });

    return NextResponse.json({
      success: true,
      isReset: false,
      student: updated,
    });
  } catch (error: any) {
    console.error("Heartbeat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
