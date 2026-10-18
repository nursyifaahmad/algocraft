const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Menyiapkan data awal AlgoCraft...");

  // 1. Akun Guru Utama
  const teacher = await prisma.teacher.upsert({
    where: { username: "guru" },
    update: {},
    create: {
      username: "guru",
      password: "guru123", // Password default pengajar
      name: "Bapak Ahmad Nursyifa, S.Kom.",
    },
  });
  console.log(`✅ Akun Guru dibuat: username: ${teacher.username} | password: guru123`);

  // 2. Sesi Pembelajaran PBL Kelas X-5
  const session = await prisma.session.upsert({
    where: { code: "X5-KANTIN" },
    update: {},
    create: {
      code: "X5-KANTIN",
      title: "PBL Algoritma Pemrograman: Kantin Digital Pintar",
      className: "X-5",
      teacherId: teacher.id,
      isActive: true,
    },
  });
  console.log(`✅ Sesi Kelas dibuat: ${session.title} (Kode Sesi: ${session.code})`);

  console.log("✨ Seed database berhasil!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
