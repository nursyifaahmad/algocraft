import { NextResponse } from "next/server";
import { seedDummyRespondents } from "@/lib/seedDummyService";

export async function POST(req: Request) {
  try {
    const { sessionCode } = await req.json();

    if (!sessionCode) {
      return NextResponse.json({ error: "sessionCode wajib diisi" }, { status: 400 });
    }

    const result = await seedDummyRespondents(sessionCode);

    return NextResponse.json({
      success: true,
      message: `Berhasil memuat 46 data responden siswa ke sesi ${result.sessionCode}`,
      sessionCode: result.sessionCode,
      totalStudents: result.totalSeeded,
      students: result.students,
    });
  } catch (error: any) {
    console.error("API seed-dummy error:", error);
    return NextResponse.json({ error: error.message || "Gagal memuat data responden" }, { status: 500 });
  }
}
