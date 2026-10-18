export interface RubricLevel {
  score: number; // 1, 2, 3, 4
  label: string; // Kurang, Cukup, Baik, Sangat Baik
  description: string;
}

export interface TPRubric {
  missionType: string;
  code: string;
  title: string;
  targetKriteria: string;
  scaleType: "percentage" | "scale4";
  minPassingScore: number; // 75 (%) atau 3 (skala 4)
  levels: RubricLevel[];
}

export const TP_RUBRICS: TPRubric[] = [
  {
    missionType: "TP1_IPO",
    code: "TP-1",
    title: "Identifikasi Input, Proses, dan Output",
    targetKriteria: "Mampu mengidentifikasi input, proses, dan output dengan ketepatan minimal 75%",
    scaleType: "percentage",
    minPassingScore: 75,
    levels: [
      { score: 4, label: "Sangat Baik (100%)", description: "Mampu mengklasifikasikan seluruh 8 elemen IPO dengan benar tanpa kesalahan." },
      { score: 3, label: "Baik (75% - 99%)", description: "Mampu mengklasifikasikan minimal 6 dari 8 elemen IPO secara tepat (Memenuhi Kriteria Tuntas)." },
      { score: 2, label: "Cukup (50% - 74%)", description: "Hanya mampu mengklasifikasikan 4-5 elemen IPO dengan tepat." },
      { score: 1, label: "Kurang (< 50%)", description: "Hanya mampu mengklasifikasikan kurang dari 4 elemen IPO." },
    ],
  },
  {
    missionType: "TP2_ALGO",
    code: "TP-2",
    title: "Penyusunan Langkah Algoritma Sistematis",
    targetKriteria: "Mampu menyusun langkah algoritma secara logis dan sistematis minimal skor 3 dari skala 4",
    scaleType: "scale4",
    minPassingScore: 3,
    levels: [
      { score: 4, label: "Sangat Baik (Skor 4)", description: "Seluruh 7 tahapan algoritma tersusun runtut dari awal hingga akhir tanpa ada logika yang melompat." },
      { score: 3, label: "Baik (Skor 3)", description: "Langkah algoritma tersusun logis dan sistematis dengan maksimal 1 kesalahan minor pada posisi langkah perantara." },
      { score: 2, label: "Cukup (Skor 2)", description: "Terdapat 2-3 kesalahan urutan langkah sehingga alur transaksi menjadi kurang logis." },
      { score: 1, label: "Kurang (Skor 1)", description: "Urutan langkah acak dan tidak menggambarkan proses transaksi yang benar." },
    ],
  },
  {
    missionType: "TP3_BRANCH",
    code: "TP-3",
    title: "Penerapan Logika Percabangan (IF-ELSE)",
    targetKriteria: "Mampu menerapkan logika percabangan dalam penyelesaian masalah minimal 75%",
    scaleType: "percentage",
    minPassingScore: 75,
    levels: [
      { score: 4, label: "Sangat Baik (100%)", description: "Mampu menentukan seluruh struktur kondisi IF, operator logika AND/OR, dan aksi THEN-ELSE secara sempurna." },
      { score: 3, label: "Baik (75% - 99%)", description: "Mampu menyelesaikan logika percabangan utama dengan tepat (Memenuhi Kriteria Tuntas)." },
      { score: 2, label: "Cukup (50% - 74%)", description: "Memahami percabangan tunggal namun keliru pada kondisi majemuk/operator logika." },
      { score: 1, label: "Kurang (< 50%)", description: "Belum memahami konsep percabangan dan aksi yang harus dijalankan." },
    ],
  },
  {
    missionType: "TP4_FLOWCHART",
    code: "TP-4",
    title: "Representasi Solusi dalam Diagram Alir",
    targetKriteria: "Mampu merepresentasikan diagram alir dengan simbol dan alur yang sesuai minimal skor 3 dari skala 4",
    scaleType: "scale4",
    minPassingScore: 3,
    levels: [
      { score: 4, label: "Sangat Baik (Skor 4)", description: "Semua simbol (Terminator, Input/Output, Process, Decision) dan arah panah konektor tersusun akurat dan valid." },
      { score: 3, label: "Baik (Skor 3)", description: "Simbol dan alur diagram alir sesuai dengan algoritma, hanya terdapat sedikit ketidakrapian minor pada konektor alur alternatif." },
      { score: 2, label: "Cukup (Skor 2)", description: "Terdapat ketidaktepatan penggunaan simbol standar (misal tertukar simbol proses dan input/output)." },
      { score: 1, label: "Kurang (Skor 1)", description: "Bentuk flowchart tidak terhubung dengan benar atau simbol yang digunakan tidak sesuai standar." },
    ],
  },
  {
    missionType: "TP5_PSEUDO",
    code: "TP-5",
    title: "Penulisan Penyelesaian dalam Bentuk Pseudocode",
    targetKriteria: "Mampu menuliskan pseudocode yang runtut dan logis minimal skor 3 dari skala 4",
    scaleType: "scale4",
    minPassingScore: 3,
    levels: [
      { score: 4, label: "Sangat Baik (Skor 4)", description: "Pseudocode tersusun runtut dengan hirarki indentasi blok kondisi percabangan yang presisi." },
      { score: 3, label: "Baik (Skor 3)", description: "Pseudocode runtut dan logis, terdapat maksimal 1 baris dengan indentasi yang kurang pas namun alur tetap dapat dipahami." },
      { score: 2, label: "Cukup (Skor 2)", description: "Urutan kalimat kode semu benar namun tidak menerapkan aturan indentasi struktur blok." },
      { score: 1, label: "Kurang (Skor 1)", description: "Pseudocode tidak runtut dan tidak mencerminkan struktur logika algoritma." },
    ],
  },
  {
    missionType: "TP6_DEBUG",
    code: "TP-6",
    title: "Pengujian, Pelacakan (Tracing), dan Debugging",
    targetKriteria: "Mampu menguji, menemukan kesalahan, dan memperbaiki solusi dengan ketepatan minimal 75%",
    scaleType: "percentage",
    minPassingScore: 75,
    levels: [
      { score: 4, label: "Sangat Baik (100%)", description: "Mampu menelusuri data uji pada tabel tracing, menemukan baris bug secara tepat, dan memilih perbaikan kode yang benar." },
      { score: 3, label: "Baik (75% - 99%)", description: "Mampu melacak data uji dan menemukan letak bug pada kode algoritma (Memenuhi Kriteria Tuntas)." },
      { score: 2, label: "Cukup (50% - 74%)", description: "Dapat mengenali adanya output yang salah tetapi kesulitan mengidentifikasi letak baris penyebab bug." },
      { score: 1, label: "Kurang (< 50%)", description: "Belum mampu melakukan tracing tabel data uji maupun perbaikan kode." },
    ],
  },
];
