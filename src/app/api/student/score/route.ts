import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BADGES_DATA } from "@/data/badgesData";

export async function POST(req: Request) {
  try {
    const {
      studentId,
      missionType,
      percentage,
      rubricScore,
      submissionData,
      timeSpent,
    } = await req.json();

    if (!studentId || !missionType || percentage === undefined || rubricScore === undefined) {
      return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
    }

    const currentStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: { scores: true, badges: true },
    });

    if (!currentStudent) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    // 1. Simpan atau perbarui nilai
    const existingScore = currentStudent.scores.find((s) => s.missionType === missionType);
    const isPassing = percentage >= 75 || rubricScore >= 3;

    await prisma.score.upsert({
      where: {
        studentId_missionType: {
          studentId,
          missionType,
        },
      },
      update: {
        percentage: Math.max(existingScore?.percentage || 0, percentage),
        rubricScore: Math.max(existingScore?.rubricScore || 0, rubricScore),
        attempts: (existingScore?.attempts || 0) + 1,
        timeSpent: (existingScore?.timeSpent || 0) + (timeSpent || 0),
        submissionData: JSON.stringify(submissionData),
      },
      create: {
        studentId,
        missionType,
        percentage,
        rubricScore,
        attempts: 1,
        timeSpent: timeSpent || 0,
        submissionData: JSON.stringify(submissionData),
      },
    });

    // 2. Kalkulasi reward XP & Koin
    let earnedXP = 0;
    let earnedCoins = 0;

    if (isPassing) {
      earnedXP += 100;
      earnedCoins += 25;
      if (rubricScore === 4 || percentage === 100) {
        earnedXP += 50; // Bonus skor sempurna
        earnedCoins += 25;
      }
    } else {
      earnedXP += 20; // XP partisipasi belajar
    }

    // 3. Cek pembukaan lencana (Badges)
    const newBadges: { badgeCode: string; title: string; icon: string }[] = [];

    const badgeMap: Record<string, string> = {
      TP1_IPO: "ACCURACY_MASTER",
      TP2_ALGO: "ALGO_ARCHITECT",
      TP3_BRANCH: "BRANCH_NINJA",
      TP4_FLOWCHART: "FLOWCHART_WIZARD",
      TP5_PSEUDO: "PSEUDO_PRO",
      TP6_DEBUG: "BUG_HUNTER",
    };

    const targetBadgeCode = badgeMap[missionType];
    if (targetBadgeCode && isPassing) {
      const alreadyHas = currentStudent.badges.some((b) => b.badgeCode === targetBadgeCode);
      if (!alreadyHas) {
        const badgeDef = BADGES_DATA.find((b) => b.code === targetBadgeCode);
        if (badgeDef) {
          await prisma.studentBadge.create({
            data: {
              studentId,
              badgeCode: targetBadgeCode,
              title: badgeDef.title,
              icon: badgeDef.icon,
            },
          });
          newBadges.push({
            badgeCode: targetBadgeCode,
            title: badgeDef.title,
            icon: badgeDef.icon,
          });
        }
      }
    }

    // 4. Hitung kemajuan Level Misi (1 sampai 6)
    const missionOrder = [
      "TP1_IPO",
      "TP2_ALGO",
      "TP3_BRANCH",
      "TP4_FLOWCHART",
      "TP5_PSEUDO",
      "TP6_DEBUG",
    ];
    const currentMissionIndex = missionOrder.indexOf(missionType);
    let nextLevel = currentStudent.currentLevel;
    if (isPassing && currentMissionIndex + 2 > currentStudent.currentLevel) {
      nextLevel = Math.min(6, currentMissionIndex + 2);
    }

    // Cek jika seluruh 6 misi telah selesai tuntas
    const updatedScores = await prisma.score.findMany({ where: { studentId } });
    const passedCount = updatedScores.filter((s) => s.percentage >= 75 || s.rubricScore >= 3).length;
    let isFinished = passedCount >= 6;

    if (isFinished) {
      const hasGrandmaster = currentStudent.badges.some(
        (b) => b.badgeCode === "GRANDMASTER_CANTIN"
      );
      if (!hasGrandmaster) {
        const gmDef = BADGES_DATA.find((b) => b.code === "GRANDMASTER_CANTIN");
        if (gmDef) {
          await prisma.studentBadge.create({
            data: {
              studentId,
              badgeCode: gmDef.code,
              title: gmDef.title,
              icon: gmDef.icon,
            },
          });
          newBadges.push({
            badgeCode: gmDef.code,
            title: gmDef.title,
            icon: gmDef.icon,
          });
        }
      }
    }

    // Update siswa
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        xp: { increment: earnedXP },
        coins: { increment: earnedCoins },
        currentLevel: nextLevel,
        isFinished,
      },
      include: {
        session: {
          include: {
            teacher: true,
          },
        },
        scores: true,
        badges: true,
      },
    });

    return NextResponse.json({
      success: true,
      isPassing,
      earnedXP,
      earnedCoins,
      newBadges,
      student: updatedStudent,
    });
  } catch (error: any) {
    console.error("Score submit error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
