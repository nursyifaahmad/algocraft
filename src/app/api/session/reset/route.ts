import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { sessionCode } = await req.json();

    if (!sessionCode) {
      return NextResponse.json({ error: "sessionCode diperlukan" }, { status: 400 });
    }

    const cleanCode = sessionCode.toUpperCase().trim();

    const session = await prisma.session.findUnique({
      where: { code: cleanCode },
    });

    if (!session) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
    }

    // Hapus seluruh student pada sesi ini (skor dan badges otomatis terhapus karena Cascade)
    const deletedStudents = await prisma.student.deleteMany({
      where: { sessionId: session.id },
    });

    return NextResponse.json({
      success: true,
      message: `Sesi ${cleanCode} berhasil di-reset. Sebanyak ${deletedStudents.count} data murid telah dibersihkan.`,
      deletedCount: deletedStudents.count,
    });
  } catch (error: any) {
    console.error("Reset session error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
