import { seedDummyRespondents } from "../src/lib/seedDummyService";
import { prisma } from "../src/lib/prisma";

async function run() {
  const targetSession = process.argv[2] || "X5-KANTIN";
  console.log(`\n🌱 Memulai seeding 46 data responden siswa ke sesi: ${targetSession}...`);

  try {
    const res = await seedDummyRespondents(targetSession);
    console.log(`✅ Berhasil melakukan seeding data!`);
    console.log(`- Sesi: ${res.sessionCode}`);
    console.log(`- Total Siswa: ${res.totalSeeded}`);

    const finishedCount = res.students.filter((s) => s.isFinished).length;
    console.log(`- Siswa Tuntas (6/6 Misi): ${finishedCount}`);

    const sampleTop = [...res.students].sort((a, b) => b.xp - a.xp).slice(0, 5);
    console.log(`\n🏆 Top 5 XP Siswa:`);
    sampleTop.forEach((s, idx) => {
      console.log(`  ${idx + 1}. [Absen ${s.absentNo}] ${s.name} - ${s.xp} XP (🪙 ${s.coins})`);
    });

    console.log(`\n✨ Selesai. Data siap digunakan di Dashboard Asesmen Guru dan Leaderboard!\n`);
  } catch (err) {
    console.error("❌ Gagal seeding responden:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
