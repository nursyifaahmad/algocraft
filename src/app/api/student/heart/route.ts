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
    let newCoins = student.coins;
    let newHeartRedeems = (student as any).heartRedeems || 0;

    if (action === "decrease") {
      newHearts = Math.max(0, student.hearts - 1);
    } else if (action === "redeem_coins") {
      if (student.coins < 25) {
        return NextResponse.json(
          { error: "Koin tidak mencukupi untuk menebus nyawa (minimal 25 koin)" },
          { status: 400 }
        );
      }
      newCoins = student.coins - 25;
      newHearts = 1; // 25 koin hanya mengisi 1 nyawa
      newHeartRedeems += 1;
    } else if (action === "cooldown_refill") {
      newHearts = 3; // pemulihan penuh setelah jeda refleksi 30 detik
      newHeartRedeems += 1;
    } else if (action === "reset") {
      newHearts = 3;
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        hearts: newHearts,
        coins: newCoins,
        heartRedeems: newHeartRedeems,
      },
    });

    return NextResponse.json({
      success: true,
      hearts: updated.hearts,
      coins: updated.coins,
      heartRedeems: (updated as any).heartRedeems,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
