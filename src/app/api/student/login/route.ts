import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, absentNo, sessionCode, avatar } = await req.json();

    if (!name || absentNo === undefined || !sessionCode) {
      return NextResponse.json(
        { error: "Nama, Nomor Absen, dan Kode Sesi wajib diisi!" },
        { status: 400 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { code: sessionCode.toUpperCase().trim() },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Kode Sesi tidak ditemukan! Hubungi guru pengajar." },
        { status: 404 }
      );
    }

    if (!session.isActive) {
      return NextResponse.json(
        { error: "Sesi pembelajaran ini sedang dinonaktifkan." },
        { status: 403 }
      );
    }

    const student = await prisma.student.upsert({
      where: {
        sessionId_absentNo: {
          sessionId: session.id,
          absentNo: parseInt(absentNo, 10),
        },
      },
      update: {
        name: name.trim(),
        avatar: avatar || "avatar-1",
      },
      create: {
        sessionId: session.id,
        name: name.trim(),
        absentNo: parseInt(absentNo, 10),
        avatar: avatar || "avatar-1",
        hearts: 3,
        coins: 100,
        xp: 0,
        currentLevel: 1,
      },
      include: {
        scores: true,
        badges: true,
      },
    });

    return NextResponse.json({ student, session });
  } catch (error: any) {
    console.error("Login student error:", error);
    return NextResponse.json(
      { error: "Gagal memproses data siswa: " + error.message },
      { status: 500 }
    );
  }
}
