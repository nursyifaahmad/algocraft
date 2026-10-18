import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, title, className, teacherId } = await req.json();

    if (!code || !title) {
      return NextResponse.json({ error: "Kode dan judul sesi wajib diisi" }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();

    const existing = await prisma.session.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json({ error: "Kode sesi sudah digunakan!" }, { status: 400 });
    }

    const session = await prisma.session.create({
      data: {
        code: cleanCode,
        title: title.trim(),
        className: className ? className.trim() : "X-5",
        teacherId,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    console.error("Create session error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
