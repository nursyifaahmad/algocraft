import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }

    let teacher = await prisma.teacher.findUnique({
      where: { username: username.trim().toLowerCase() },
      include: {
        sessions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Auto-seed akun default guru jika database production masih kosong
    if (!teacher && username.trim().toLowerCase() === "guru" && password === "guru123") {
      teacher = await prisma.teacher.create({
        data: {
          username: "guru",
          password: "guru123",
          name: "Guru Informatika",
          sessions: {
            create: {
              code: "X5-KANTIN",
              title: "PBL Kasir Kantin Pintar",
              className: "X-5",
            },
          },
        },
        include: {
          sessions: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    if (!teacher || teacher.password !== password) {
      return NextResponse.json(
        { error: "Username atau kata sandi pengajar salah!" },
        { status: 401 }
      );
    }

    // Pastikan minimal ada 1 sesi X5-KANTIN jika belum ada sesi
    if (!teacher.sessions || teacher.sessions.length === 0) {
      const defaultSession = await prisma.session.upsert({
        where: { code: "X5-KANTIN" },
        update: { teacherId: teacher.id },
        create: {
          code: "X5-KANTIN",
          title: "PBL Kasir Kantin Pintar",
          className: "X-5",
          teacherId: teacher.id,
        },
      });
      teacher.sessions = [defaultSession];
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
