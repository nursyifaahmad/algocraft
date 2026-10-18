export interface BadgeDefinition {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  criteria: string;
}

export const BADGES_DATA: BadgeDefinition[] = [
  {
    id: "b-1",
    code: "ACCURACY_MASTER",
    title: "Logika Presisi",
    description: "Mampu membedakan elemen Input, Proses, dan Output dengan akurasi minimal 75%.",
    icon: "🎯",
    criteria: "Selesaikan TP 1 dengan nilai >= 75%",
  },
  {
    id: "b-2",
    code: "ALGO_ARCHITECT",
    title: "Arsitek Algoritma",
    description: "Menyusun tahapan alur transaksi kasir secara logis, runtut, dan sistematis.",
    icon: "📐",
    criteria: "Selesaikan TP 2 dengan skor minimal 3 dari skala 4",
  },
  {
    id: "b-3",
    code: "BRANCH_NINJA",
    title: "Master Percabangan",
    description: "Menerapkan logika keputusan IF-THEN-ELSE pada aturan diskon dan validasi saldo.",
    icon: "⚡",
    criteria: "Selesaikan TP 3 dengan akurasi minimal 75%",
  },
  {
    id: "b-4",
    code: "FLOWCHART_WIZARD",
    title: "Penyihir Flowchart",
    description: "Merepresentasikan diagram alir kasir secara tepat dengan simbol dan arah panah standar.",
    icon: "📊",
    criteria: "Selesaikan TP 4 dengan skor minimal 3 dari skala 4",
  },
  {
    id: "b-5",
    code: "PSEUDO_PRO",
    title: "Pujangga Pseudocode",
    description: "Menyusun struktur kode semu formal dengan urutan dan indentasi logika yang sempurna.",
    icon: "📜",
    criteria: "Selesaikan TP 5 dengan skor minimal 3 dari skala 4",
  },
  {
    id: "b-6",
    code: "BUG_HUNTER",
    title: "Detektif Bug",
    description: "Menguji algoritma dengan tabel uji, mendeteksi bug logika, dan memperbaikinya.",
    icon: "🔍",
    criteria: "Selesaikan TP 6 dengan akurasi minimal 75%",
  },
  {
    id: "b-7",
    code: "GRANDMASTER_CANTIN",
    title: "Arsitek Utama Kantin Pintar",
    description: "Berhasil menyelesaikan seluruh rangkaian tantangan Problem Based Learning Kelas X-5!",
    icon: "🏆",
    criteria: "Tuntaskan seluruh 6 Misi Pembelajaran",
  },
];
