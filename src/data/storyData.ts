export interface IPOCard {
  id: string;
  text: string;
  category: "input" | "process" | "output";
  explanation: string;
}

export interface AlgoStep {
  id: string;
  order: number;
  text: string;
  description: string;
}

export interface BranchCase {
  id: string;
  question: string;
  scenario: string;
  conditionBlocks: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

export interface FlowchartNodeData {
  id: string;
  type: "terminator" | "io" | "process" | "decision";
  label: string;
  correctStep: number;
}

export interface ParsonLine {
  id: string;
  correctOrder: number;
  indent: number; // 0, 1, 2
  text: string;
}

export interface DebugCodeLine {
  lineNum: number;
  indent: number;
  text: string;
}

export interface DebugScenario {
  id: string;
  title: string;
  testInput: {
    namaMenu: string;
    hargaTotal: number;
    saldoAwal: number;
    isMember: boolean;
  };
  expectedOutput: {
    diskon: number;
    bayar: number;
    saldoAkhir: number;
    status: string;
  };
  buggyCode: string[];
  codeLines: DebugCodeLine[];
  buggyLineIndex: number; // 0-indexed
  optionsToFix: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export const PBL_STORY = {
  title: "Misi Kantin Digital Pintar SMA 10",
  context:
    "Kantin SMA 10 sering mengalami antrean panjang saat jam istirahat. Sistem pencatatan kasir masih manual sehingga sering terjadi salah hitung kembalian dan rekap stok kacau. Kamu dan tim ditunjuk sebagai Junior Software Architect untuk merancang algoritma sistem kasir pintar kantin!",
  targetAudience: "Siswa Kelas X-5",
};

// TP 1: Input, Proses, Output
export const IPO_DATA: IPOCard[] = [
  {
    id: "ipo-1",
    text: "Pilihan Menu & Jumlah Pesanan Siswa",
    category: "input",
    explanation: "Data masukan yang dipilih dan dikirim oleh siswa saat memesan di layar sentuh kasir.",
  },
  {
    id: "ipo-2",
    text: "Nominal Saldo Kartu Pelajar Digital",
    category: "input",
    explanation: "Data masukan dari kartu RFID siswa yang dibaca oleh sensor kasir.",
  },
  {
    id: "ipo-3",
    text: "Hitung Subtotal: Σ(Harga Satuan × Jumlah)",
    category: "process",
    explanation: "Kalkulasi matematis yang dilakukan oleh sistem untuk menjumlahkan semua harga pesanan.",
  },
  {
    id: "ipo-4",
    text: "Pengecekan: Apakah Saldo Siswa Cukup?",
    category: "process",
    explanation: "Operasi logika perbandingan (kondisi) yang dijalankan oleh prosesor sistem.",
  },
  {
    id: "ipo-5",
    text: "Hitung Sisa Saldo: Saldo Awal - Total Bayar",
    category: "process",
    explanation: "Operasi pengurangan matematis pada memori sistem.",
  },
  {
    id: "ipo-6",
    text: "Struk Pembelian & Kode Antrean Makanan",
    category: "output",
    explanation: "Hasil informasi yang dicetak kasir atau ditampilkan pada layar untuk diambil siswa.",
  },
  {
    id: "ipo-7",
    text: "Pesan Layar: 'Transaksi Berhasil, Sisa Saldo: Rp...'",
    category: "output",
    explanation: "Informasi status transaksi yang ditampilkan kepada pengguna di akhir proses.",
  },
  {
    id: "ipo-8",
    text: "Data Riwayat Penjualan untuk Pengelola Kantin",
    category: "output",
    explanation: "Laporan rekap penjualan yang dihasilkan sistem untuk buku kas sekolah.",
  },
];

// TP 2: Langkah Algoritma Sekuensial
export const ALGO_STEPS_DATA: AlgoStep[] = [
  {
    id: "step-1",
    order: 1,
    text: "Mulai (Sistem Kasir Kantin Aktif)",
    description: "Inisialisasi sistem kasir dalam keadaan siap melayani pembeli.",
  },
  {
    id: "step-2",
    order: 2,
    text: "Input menu yang dipilih dan jumlah porsi makanan",
    description: "Membaca input item dari pembeli.",
  },
  {
    id: "step-3",
    order: 3,
    text: "Hitung total harga belanja seluruh pesanan",
    description: "Menghitung akumulasi harga menu yang dibeli.",
  },
  {
    id: "step-4",
    order: 4,
    text: "Pindai kartu pelajar digital dan baca saldo pembeli",
    description: "Membaca nominal uang digital yang tersedia pada kartu.",
  },
  {
    id: "step-5",
    order: 5,
    text: "Verifikasi kecukupan saldo terhadap total belanja",
    description: "Membandingkan apakah saldo >= total harga.",
  },
  {
    id: "step-6",
    order: 6,
    text: "Kurangi saldo pembeli dan cetak struk antrean makanan",
    description: "Melakukan debet saldo dan mencetak bukti pembelian.",
  },
  {
    id: "step-7",
    order: 7,
    text: "Selesai (Kasir siap untuk antrean berikutnya)",
    description: "Mengakhiri transaksi dan kembali ke posisi standby.",
  },
];

// TP 3: Logika Percabangan IF-ELSE
export const BRANCHING_DATA = [
  {
    id: "branch-1",
    title: "Aturan Diskon Jam Istirahat Pertama",
    problem:
      "Kantin memberikan diskon spesial 15% jika total belanja minimal Rp30.000 DAN pembeli bertransaksi pada jam istirahat pertama (pukul 10:00 - 10:30). Selain kondisi tersebut, tidak ada diskon (diskon = 0).",
    conditions: [
      {
        id: "c-1",
        label: "IF (total_belanja >= 30000 AND jam == 'istirahat_1')",
        actionThen: "diskon = 0.15 * total_belanja",
        actionElse: "diskon = 0",
        isCorrect: true,
      },
      {
        id: "c-2",
        label: "IF (total_belanja > 30000 OR jam == 'istirahat_1')",
        actionThen: "diskon = 0.15 * total_belanja",
        actionElse: "diskon = 0",
        isCorrect: false,
      },
      {
        id: "c-3",
        label: "IF (total_belanja < 30000)",
        actionThen: "diskon = 0",
        actionElse: "diskon = 0.15 * total_belanja",
        isCorrect: false,
      },
    ],
  },
  {
    id: "branch-2",
    title: "Aturan Validasi Saldo Kartu Pelajar",
    problem:
      "Sebelum saldo dipotong, kasir harus memeriksa: JIKA saldo_kartu >= total_bayar MAKA proses pembayaran sukses dan sisa_saldo = saldo_kartu - total_bayar. JIKA TIDAK MAKA batalkan pesanan dan tampilkan 'Saldo Anda Tidak Cukup!'.",
    conditions: [
      {
        id: "c-2a",
        label: "IF (saldo_kartu >= total_bayar)",
        actionThen: "sisa = saldo - total; status = 'Berhasil'",
        actionElse: "status = 'Saldo Kurang; Transaksi Batal'",
        isCorrect: true,
      },
      {
        id: "c-2b",
        label: "IF (saldo_kartu == total_bayar)",
        actionThen: "sisa = 0; status = 'Berhasil'",
        actionElse: "status = 'Batal'",
        isCorrect: false,
      },
      {
        id: "c-2c",
        label: "IF (saldo_kartu <= total_bayar)",
        actionThen: "status = 'Saldo Kurang'",
        actionElse: "sisa = saldo - total",
        isCorrect: false,
      },
    ],
  },
];

// TP 4: Flowchart Nodes
export const FLOWCHART_ITEMS: FlowchartNodeData[] = [
  {
    id: "fc-start",
    type: "terminator",
    label: "MULAI",
    correctStep: 1,
  },
  {
    id: "fc-input",
    type: "io",
    label: "INPUT pesanan, total_belanja, saldo_kartu",
    correctStep: 2,
  },
  {
    id: "fc-decision",
    type: "decision",
    label: "APAKAH saldo_kartu >= total_belanja?",
    correctStep: 3,
  },
  {
    id: "fc-process-yes",
    type: "process",
    label: "sisa_saldo = saldo_kartu - total_belanja",
    correctStep: 4,
  },
  {
    id: "fc-output-yes",
    type: "io",
    label: "OUTPUT 'Transaksi Berhasil', cetak struk antrean",
    correctStep: 5,
  },
  {
    id: "fc-output-no",
    type: "io",
    label: "OUTPUT 'Saldo Kurang, Silakan Top-Up'",
    correctStep: 6,
  },
  {
    id: "fc-end",
    type: "terminator",
    label: "SELESAI",
    correctStep: 7,
  },
];

// TP 5: Parson's Problem Pseudocode
export const PARSON_DATA: ParsonLine[] = [
  {
    id: "pl-1",
    correctOrder: 1,
    indent: 0,
    text: "PROGRAM KasirKantinDigital",
  },
  {
    id: "pl-deklarasi",
    correctOrder: 2,
    indent: 0,
    text: "DEKLARASI",
  },
  {
    id: "pl-var",
    correctOrder: 3,
    indent: 1,
    text: "total_belanja, saldo_kartu, sisa_saldo : integer",
  },
  {
    id: "pl-mulai",
    correctOrder: 4,
    indent: 0,
    text: "MULAI",
  },
  {
    id: "pl-2",
    correctOrder: 5,
    indent: 0,
    text: "BACA total_belanja, saldo_kartu",
  },
  {
    id: "pl-3",
    correctOrder: 6,
    indent: 0,
    text: "JIKA (saldo_kartu >= total_belanja) MAKA",
  },
  {
    id: "pl-4",
    correctOrder: 7,
    indent: 1,
    text: "sisa_saldo <- saldo_kartu - total_belanja",
  },
  {
    id: "pl-5",
    correctOrder: 8,
    indent: 1,
    text: "TULIS \"Pembayaran Berhasil, Sisa Saldo: Rp\", sisa_saldo",
  },
  {
    id: "pl-6",
    correctOrder: 9,
    indent: 0,
    text: "SELAIN ITU",
  },
  {
    id: "pl-7",
    correctOrder: 10,
    indent: 1,
    text: "TULIS \"Maaf, Saldo Anda Tidak Mencukupi!\"",
  },
  {
    id: "pl-8",
    correctOrder: 11,
    indent: 0,
    text: "AKHIR JIKA",
  },
  {
    id: "pl-9",
    correctOrder: 12,
    indent: 0,
    text: "SELESAI",
  },
];

// TP 6: Debugging & Data Uji
export const DEBUG_SCENARIOS: DebugScenario[] = [
  {
    id: "bug-1",
    title: "Kasus Saldo Pas: Transaksi Malah Ditolak",
    testInput: {
      namaMenu: "Nasi Ayam Geprek + Teh Botol",
      hargaTotal: 25000,
      saldoAwal: 25000,
      isMember: true,
    },
    expectedOutput: {
      diskon: 0,
      bayar: 25000,
      saldoAkhir: 0,
      status: "Berhasil",
    },
    buggyCode: [
      "1: MULAI",
      "2: BACA total_harga, saldo_kartu",
      "3: total_bayar = total_harga",
      "4: JIKA saldo_kartu > total_bayar MAKA",
      "5:   saldo_akhir = saldo_kartu - total_bayar",
      "6:   TAMPILKAN 'Transaksi Berhasil'",
      "7: SELAIN ITU",
      "8:   TAMPILKAN 'Saldo Kurang!'",
      "9: SELESAI",
    ],
    codeLines: [
      { lineNum: 1, indent: 0, text: "MULAI" },
      { lineNum: 2, indent: 1, text: "BACA total_harga, saldo_kartu" },
      { lineNum: 3, indent: 1, text: "total_bayar = total_harga" },
      { lineNum: 4, indent: 1, text: "JIKA saldo_kartu > total_bayar MAKA" },
      { lineNum: 5, indent: 2, text: "saldo_akhir = saldo_kartu - total_bayar" },
      { lineNum: 6, indent: 2, text: "TAMPILKAN 'Transaksi Berhasil'" },
      { lineNum: 7, indent: 1, text: "SELAIN ITU" },
      { lineNum: 8, indent: 2, text: "TAMPILKAN 'Saldo Kurang!'" },
      { lineNum: 9, indent: 0, text: "SELESAI" },
    ],
    buggyLineIndex: 3, // Baris 4: JIKA saldo_kartu > total_bayar (seharusnya >=)
    optionsToFix: [
      {
        id: "fix-1a",
        text: "Ganti baris 4 menjadi: JIKA saldo_kartu >= total_bayar MAKA",
        isCorrect: true,
        explanation:
          "Tepat sekali! Operator '>' membuat saldo yang persis sama dengan total bayar (Rp25.000 == Rp25.000) dianggap tidak cukup. Seharusnya menggunakan '>='.",
      },
      {
        id: "fix-1b",
        text: "Ganti baris 5 menjadi: saldo_akhir = total_bayar - saldo_kartu",
        isCorrect: false,
        explanation: "Salah. Perhitungan ini akan menghasilkan saldo akhir negatif.",
      },
      {
        id: "fix-1c",
        text: "Ganti baris 4 menjadi: JIKA saldo_kartu == total_bayar MAKA",
        isCorrect: false,
        explanation: "Kurang tepat. Jika menggunakan '==', siswa yang memiliki saldo lebih banyak justru akan ditolak.",
      },
    ],
  },
  {
    id: "bug-2",
    title: "Kasus Diskon Negatif: Total Bayar Jadi Membengkak",
    testInput: {
      namaMenu: "Paket Roti Bakar + Jus Mangga",
      hargaTotal: 40000,
      saldoAwal: 50000,
      isMember: true,
    },
    expectedOutput: {
      diskon: 6000, // 15% dari 40.000
      bayar: 34000,
      saldoAkhir: 16000,
      status: "Berhasil",
    },
    buggyCode: [
      "1: MULAI",
      "2: BACA total_belanja",
      "3: diskon = 0.15 * total_belanja",
      "4: total_bayar = total_belanja + diskon",
      "5: TAMPILKAN total_bayar",
      "6: SELESAI",
    ],
    codeLines: [
      { lineNum: 1, indent: 0, text: "MULAI" },
      { lineNum: 2, indent: 1, text: "BACA total_belanja" },
      { lineNum: 3, indent: 1, text: "diskon = 0.15 * total_belanja" },
      { lineNum: 4, indent: 1, text: "total_bayar = total_belanja + diskon" },
      { lineNum: 5, indent: 1, text: "TAMPILKAN total_bayar" },
      { lineNum: 6, indent: 0, text: "SELESAI" },
    ],
    buggyLineIndex: 3, // Baris 4: total_belanja + diskon
    optionsToFix: [
      {
        id: "fix-2a",
        text: "Ganti baris 4 menjadi: total_bayar = total_belanja - diskon",
        isCorrect: true,
        explanation:
          "Benar! Diskon adalah potongan harga sehingga harus mengurangi total belanja, bukan menambahnya.",
      },
      {
        id: "fix-2b",
        text: "Ganti baris 3 menjadi: diskon = total_belanja / 0.15",
        isCorrect: false,
        explanation: "Salah. Membagi dengan 0.15 justru akan menghasilkan angka diskon yang sangat besar.",
      },
      {
        id: "fix-2c",
        text: "Ganti baris 5 menjadi: TAMPILKAN diskon",
        isCorrect: false,
        explanation: "Salah. Yang harus dibayar pelanggan adalah total setelah diskon.",
      },
    ],
  },
];
