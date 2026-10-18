import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TP_RUBRICS } from "@/data/rubricsData";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionCode = searchParams.get("sessionCode");

    if (!sessionCode) {
      return NextResponse.json({ error: "sessionCode diperlukan" }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { code: sessionCode.toUpperCase().trim() },
      include: {
        students: {
          orderBy: { absentNo: "asc" },
          include: {
            scores: true,
            badges: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
    }

    const students = session.students;
    const totalStudents = students.length;

    // Hitung capaian per TP berdasarkan rubrik
    const tpAnalytics = TP_RUBRICS.map((tp) => {
      const scoresForTP = students
        .map((s) => s.scores.find((sc) => sc.missionType === tp.missionType))
        .filter(Boolean);

      const completedCount = scoresForTP.length;
      const passedCount = scoresForTP.filter(
        (sc) => sc && (sc.percentage >= 75 || sc.rubricScore >= 3)
      ).length;

      const avgPercentage =
        completedCount > 0
          ? scoresForTP.reduce((acc, curr) => acc + (curr?.percentage || 0), 0) / completedCount
          : 0;

      const avgRubric =
        completedCount > 0
          ? scoresForTP.reduce((acc, curr) => acc + (curr?.rubricScore || 0), 0) / completedCount
          : 0;

      const passRate = totalStudents > 0 ? (passedCount / totalStudents) * 100 : 0;

      return {
        ...tp,
        totalAttempted: completedCount,
        passedCount,
        passRate: Math.round(passRate * 10) / 10,
        avgPercentage: Math.round(avgPercentage * 10) / 10,
        avgRubric: Math.round(avgRubric * 10) / 10,
      };
    });

    return NextResponse.json({
      session: {
        id: session.id,
        code: session.code,
        title: session.title,
        className: session.className,
        isActive: session.isActive,
      },
      totalStudents,
      tpAnalytics,
      students,
    });
  } catch (error: any) {
    console.error("Teacher stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
