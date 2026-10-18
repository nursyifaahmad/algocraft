import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { username: username.trim().toLowerCase() },
      include: {
        sessions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!teacher || teacher.password !== password) {
      return NextResponse.json(
        { error: "Username atau kata sandi pengajar salah!" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        name: teacher.name,
        username: teacher.username,
        sessions: teacher.sessions,
      },
    });
  } catch (error: any) {
    console.error("Teacher login error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
