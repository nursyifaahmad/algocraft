import { prisma } from "@/lib/prisma";
import { DUMMY_RESPONDENTS } from "@/data/dummyRespondents";
import { BADGES_DATA } from "@/data/badgesData";

const rubricToPercent = (r: number): number => {
  if (r === 4) return 100;
  if (r === 3) return 85;
  if (r === 2) return 65;
  if (r === 1) return 40;
  return 0;
};

const MISSION_KEYS = [
  { key: "ipo" as const, missionType: "TP1_IPO", badgeCode: "ACCURACY_MASTER" },
  { key: "algo" as const, missionType: "TP2_ALGO", badgeCode: "ALGO_ARCHITECT" },
  { key: "branch" as const, missionType: "TP3_BRANCH", badgeCode: "BRANCH_NINJA" },
  { key: "flowchart" as const, missionType: "TP4_FLOWCHART", badgeCode: "FLOWCHART_WIZARD" },
  { key: "pseudo" as const, missionType: "TP5_PSEUDO", badgeCode: "PSEUDO_PRO" },
  { key: "debug" as const, missionType: "TP6_DEBUG", badgeCode: "BUG_HUNTER" },
];

export async function seedDummyRespondents(targetSessionCode = "X5-KANTIN") {
  const sessionCode = targetSessionCode.toUpperCase().trim();

  // Pastikan sesi dan guru default tersedia
  let session = await prisma.session.findUnique({
    where: { code: sessionCode },
  });

  if (!session) {
    const defaultTeacher = await prisma.teacher.upsert({
      where: { username: "guru" },
      update: {},
      create: {
        username: "guru",
        password: "guru123",
        name: "Guru Informatika",
      },
    });

    session = await prisma.session.create({
      data: {
        code: sessionCode,
        title: "PBL Algoritma Pemrograman: Kantin Digital Pintar",
        className: "X-5",
        teacherId: defaultTeacher.id,
      },
    });
  }

  const results = [];

  for (const r of DUMMY_RESPONDENTS) {
    let earnedXP = 0;
    let earnedCoins = 0;
    let passedCount = 0;
    let lastCompletedStage = 0;

    const missionScoresToCreate: {
      missionType: string;
      percentage: number;
      rubricScore: number;
      attempts: number;
      timeSpent: number;
    }[] = [];

    const badgesToCreate: {
      badgeCode: string;
      title: string;
      icon: string;
    }[] = [];

    // Evaluasi 6 misi
    for (let i = 0; i < MISSION_KEYS.length; i++) {
      const item = MISSION_KEYS[i];
      const rawScore = r[item.key];

      if (rawScore !== undefined && rawScore !== null && rawScore > 0) {
        lastCompletedStage = i + 1;
        const percentage = rubricToPercent(rawScore);
        const isPassing = rawScore >= 3;

        missionScoresToCreate.push({
          missionType: item.missionType,
          percentage,
          rubricScore: rawScore,
          attempts: rawScore === 4 ? 1 : 2,
          timeSpent: 120 + i * 45 + (4 - rawScore) * 60,
        });

        if (isPassing) {
          passedCount++;
          earnedXP += 100;
          earnedCoins += 25;
          if (rawScore === 4) {
            earnedXP += 50;
            earnedCoins += 25;
          }

          const badgeDef = BADGES_DATA.find((b) => b.code === item.badgeCode);
          if (badgeDef) {
            badgesToCreate.push({
              badgeCode: badgeDef.code,
              title: badgeDef.title,
              icon: badgeDef.icon,
            });
          }
        } else {
          earnedXP += 20; // Partisipasi
        }
      }
    }

    const isFinished = passedCount >= 6;
    if (isFinished) {
      const gmDef = BADGES_DATA.find((b) => b.code === "GRANDMASTER_CANTIN");
      if (gmDef) {
        badgesToCreate.push({
          badgeCode: gmDef.code,
          title: gmDef.title,
          icon: gmDef.icon,
        });
      }
    }

    const currentLevel = isFinished ? 6 : Math.min(6, Math.max(1, lastCompletedStage + 1));
    const activeTab = currentLevel;

    // Variasi waktu aktif agar beberapa siswa tampil Live/Online di dashboard
    const isOnlineSimulated = [5, 9, 23, 28, 39, 42, 46].includes(r.absentNo);
    const lastActiveAt = isOnlineSimulated
      ? new Date(Date.now() - Math.floor(Math.random() * 20000))
      : new Date(Date.now() - (1000 * 60 * (5 + r.absentNo * 2)));

    // Upsert Student
    const student = await prisma.student.upsert({
      where: {
        sessionId_absentNo: {
          sessionId: session.id,
          absentNo: r.absentNo,
        },
      },
      update: {
        name: r.name,
        avatar: `avatar-${((r.absentNo - 1) % 8) + 1}`,
        xp: earnedXP,
        coins: 100 + earnedCoins,
        hearts: 3,
        currentLevel,
        activeTab,
        isFinished,
        lastActiveAt,
      },
      create: {
        sessionId: session.id,
        name: r.name,
        absentNo: r.absentNo,
        avatar: `avatar-${((r.absentNo - 1) % 8) + 1}`,
        xp: earnedXP,
        coins: 100 + earnedCoins,
        hearts: 3,
        currentLevel,
        activeTab,
        isFinished,
        lastActiveAt,
      },
    });

    // Simpan / update scores
    for (const sc of missionScoresToCreate) {
      await prisma.score.upsert({
        where: {
          studentId_missionType: {
            studentId: student.id,
            missionType: sc.missionType,
          },
        },
        update: {
          percentage: sc.percentage,
          rubricScore: sc.rubricScore,
          attempts: sc.attempts,
          timeSpent: sc.timeSpent,
        },
        create: {
          studentId: student.id,
          missionType: sc.missionType,
          percentage: sc.percentage,
          rubricScore: sc.rubricScore,
          attempts: sc.attempts,
          timeSpent: sc.timeSpent,
        },
      });
    }

    // Simpan / update badges
    for (const b of badgesToCreate) {
      await prisma.studentBadge.upsert({
        where: {
          studentId_badgeCode: {
            studentId: student.id,
            badgeCode: b.badgeCode,
          },
        },
        update: {
          title: b.title,
          icon: b.icon,
        },
        create: {
          studentId: student.id,
          badgeCode: b.badgeCode,
          title: b.title,
          icon: b.icon,
        },
      });
    }

    results.push({
      absentNo: r.absentNo,
      name: r.name,
      xp: earnedXP,
      coins: 100 + earnedCoins,
      isFinished,
      missionsCount: missionScoresToCreate.length,
    });
  }

  return {
    sessionCode,
    totalSeeded: results.length,
    students: results,
  };
}
