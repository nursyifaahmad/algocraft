"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  CheckCircle2,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
  FileText,
  Calendar,
  User,
  School,
  ExternalLink,
} from "lucide-react";
import { fireGrandmasterConfetti } from "@/components/ui/Confetti";

interface CompletionCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  defaultTab?: "rapor" | "certificate";
}

export const CompletionCertificateModal: React.FC<CompletionCertificateModalProps> = ({
  isOpen,
  onClose,
  student,
  defaultTab = "rapor",
}) => {
  const [activeTab, setActiveTab] = useState<"rapor" | "certificate">(defaultTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      // Trigger ledakan selebrasi konfeti meriah
      fireGrandmasterConfetti();
    }
  }, [isOpen, defaultTab]);

  if (!isOpen || !student) return null;

  // Daftar 6 TP dan pemetaan skor
  const tpList = [
    {
      code: "TP1_IPO",
      tpNum: "TP 1",
      title: "Analisis Kebutuhan Sistem Kasir",
      indicator: "Dekomposisi Masalah (Input - Proses - Output)",
      icon: "📥",
    },
    {
      code: "TP2_ALGO",
      tpNum: "TP 2",
      title: "Perancangan Alur Kasir Otomatis",
      indicator: "Algoritma Sekuensial & Logika Berurutan",
      icon: "🔢",
    },
    {
      code: "TP3_BRANCH",
      tpNum: "TP 3",
      title: "Logika Diskon & Validasi Saldo",
      indicator: "Percabangan & Kondisi Logika (IF-ELSE)",
      icon: "🔀",
    },
    {
      code: "TP4_FLOWCHART",
      tpNum: "TP 4",
      title: "Visualisasi Alur Transaksi Kasir",
      indicator: "Pemodelan Standar Diagram Alir (Flowchart)",
      icon: "📊",
    },
    {
      code: "TP5_PSEUDO",
      tpNum: "TP 5",
      title: "Notasi Algoritma Kasir Terstruktur",
      indicator: "Notasi Kode Semu (Pseudocode & Indentasi)",
      icon: "📝",
    },
    {
      code: "TP6_DEBUG",
      tpNum: "TP 6",
      title: "Pengujian Data Uji & Koreksi Bug",
      indicator: "Penelusuran Galat & Debugging Program",
      icon: "🐞",
    },
  ];

  // Hitung metrik skor
  const scoresMap = new Map<string, any>();
  if (student.scores && Array.isArray(student.scores)) {
    student.scores.forEach((s: any) => {
      scoresMap.set(s.missionType, s);
    });
  }

  let totalPercentage = 0;
  let totalRubric = 0;
  let completedCount = 0;

  tpList.forEach((tp) => {
    const s = scoresMap.get(tp.code);
    if (s && (s.percentage >= 75 || s.rubricScore >= 3)) {
      totalPercentage += s.percentage;
      totalRubric += s.rubricScore;
      completedCount += 1;
    } else {
      totalPercentage += 100;
      totalRubric += 4;
      completedCount += 1;
    }
  });

  const avgScore = Math.round(totalPercentage / 6);
  const avgRubric = (totalRubric / 6).toFixed(1);

  // Predikat
  let predicate = "GRANDMASTER ALGORITMA (SANGAT MEMUASKAN)";
  let gradeLetter = "A+";
  if (avgScore < 80) {
    predicate = "AHLI ALGORITMA KANTIN (BAIK)";
    gradeLetter = "B+";
  } else if (avgScore < 90) {
    predicate = "MASTER ALGORITMA KANTIN (SANGAT BAIK)";
    gradeLetter = "A";
  }

  // Format tanggal Indonesia
  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const teacherName = student.session?.teacher?.name || "Guru Pengampu Informatika";
  const sessionCode = student.session?.code || "X5-KANTIN";
  const className = student.session?.className || "X-5";
  const certNumber = `ALGOCRAFT/PBL/${sessionCode}/${String(student.absentNo || 1).padStart(2, "0")}/${new Date().getFullYear()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print CSS Stylesheet */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-certificate,
          #printable-certificate * {
            visibility: visible !important;
          }
          #printable-certificate {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 8mm !important;
            box-sizing: border-box !important;
            background: white !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 99999999 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-hide {
            display: none !important;
          }
        }
      `}} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in print-hide">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
          
          {/* Header Bar */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-orange-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
                🏆
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight flex items-center gap-2">
                  <span>Kelulusan Purna-Misi PBL Kantin Pintar</span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                    6 / 6 Tuntas
                  </span>
                </h2>
                <p className="text-[11px] text-indigo-300 font-semibold mt-0.5">
                  Bukti Capaian Berpikir Komputasional • Kurikulum Merdeka Informatika
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex items-center justify-between px-6 py-2.5 bg-slate-100 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("rapor")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "rapor"
                    ? "bg-white text-indigo-900 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Rapor Capaian 6 TP</span>
              </button>
              <button
                onClick={() => setActiveTab("certificate")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "certificate"
                    ? "bg-white text-amber-900 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Award className="w-4 h-4 text-amber-600" />
                <span>Sertifikat Kelulusan Resmi</span>
              </button>
            </div>

            {activeTab === "certificate" && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Unduh PDF</span>
              </button>
            )}
          </div>

          {/* Body Content (Scrollable) */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* TAB 1: RAPOR CAPAIAN */}
            {activeTab === "rapor" && (
              <div className="space-y-6">
                {/* Hero Celebration Banner */}
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 shadow-md relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 opacity-15 text-9xl pointer-events-none">
                    🏆
                  </div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-amber-300 text-xs font-extrabold shadow-sm mb-3">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>GELAR KEHORMATAN TERTINGGI</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                      GRANDMASTER ALGORITMA KANTIN PINTAR
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-slate-950/85 mt-1 max-w-xl">
                      Diberikan kepada <strong>{student.name}</strong> (Absen #{student.absentNo}) atas keberhasilan luar biasa memecahkan masalah kasir kantin pintar dari analisis dekomposisi hingga debugging.
                    </p>
                  </div>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-center">
                    <span className="text-[11px] font-semibold text-indigo-700 block">Rata-Rata Nilai</span>
                    <span className="text-xl sm:text-2xl font-black text-indigo-950 mt-0.5 block">
                      {avgScore}%
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600">Predikat {gradeLetter}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-center">
                    <span className="text-[11px] font-semibold text-emerald-700 block">Skor Rubrik Rata-rata</span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-950 mt-0.5 block">
                      {avgRubric} / 4.0
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">Sangat Memuaskan</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-center">
                    <span className="text-[11px] font-semibold text-amber-700 block">Total Pengalaman (XP)</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-950 mt-0.5 block">
                      {student.xp} XP
                    </span>
                    <span className="text-[10px] font-bold text-amber-600">Level Maksimal</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-center">
                    <span className="text-[11px] font-semibold text-rose-700 block">Sisa Ketahanan Nyawa</span>
                    <span className="text-xl sm:text-2xl font-black text-rose-950 mt-0.5 block">
                      {student.hearts} / 3 ❤️
                    </span>
                    <span className="text-[10px] font-bold text-rose-600">Koin: {student.coins}</span>
                  </div>
                </div>

                {/* Tabel Rincian 6 TP */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Matriks Capaian 6 Indikator Berpikir Komputasional
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-600">Semua Lulus (≥ 75%)</span>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {tpList.map((tp) => {
                      const scoreData = scoresMap.get(tp.code);
                      const pct = scoreData?.percentage ?? 100;
                      const rub = scoreData?.rubricScore ?? 4;

                      return (
                        <div key={tp.code} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                          <div className="flex items-start gap-3">
                            <span className="text-xl p-1.5 rounded-xl bg-slate-100 border border-slate-200/60 shrink-0">
                              {tp.icon}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-extrabold text-[10px]">
                                  {tp.tpNum}
                                </span>
                                <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                                  {tp.title}
                                </h5>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Indikator: {tp.indicator}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                            <div className="text-right">
                              <span className="font-black text-slate-900 text-xs block">{pct}%</span>
                              <span className="text-[10px] text-slate-500 font-medium">Rubrik: {rub}/4</span>
                            </div>
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Tuntas</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer CTAs in Tab 1 */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    🔍 Review Kembali Jawaban Portofolio
                  </button>

                  <button
                    onClick={() => setActiveTab("certificate")}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <span>Buka & Cetak Sertifikat Resmi</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: SERTIFIKAT KELULUSAN RESMI */}
            {activeTab === "certificate" && (
              <div className="space-y-4">
                {/* Print Guidance Note */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Petunjuk Cetak:</strong> Gunakan tombol <strong>&quot;Cetak / Unduh PDF&quot;</strong>, pilih tata letak <em>Landscape (Mendatar)</em>, dan pastikan opsi <em>&quot;Background graphics&quot;</em> dicentang.
                    </span>
                  </div>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs cursor-pointer"
                  >
                    🖨️ Cetak Sekarang
                  </button>
                </div>

                {/* Certificate Visual Container */}
                <div className="overflow-x-auto pb-4">
                  <div
                    id="printable-certificate"
                    className="w-full min-w-[700px] max-w-4xl mx-auto bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30 p-6 sm:p-10 rounded-2xl border-8 border-double border-amber-600/70 shadow-lg text-slate-900 font-sans relative"
                  >
                    {/* Corner Ornaments */}
                    <div className="absolute top-2 left-2 text-amber-600/40 text-xl font-serif">❖</div>
                    <div className="absolute top-2 right-2 text-amber-600/40 text-xl font-serif">❖</div>
                    <div className="absolute bottom-2 left-2 text-amber-600/40 text-xl font-serif">❖</div>
                    <div className="absolute bottom-2 right-2 text-amber-600/40 text-xl font-serif">❖</div>

                    {/* Inner Border */}
                    <div className="border border-amber-500/40 p-6 sm:p-8 rounded-xl relative">
                      
                      {/* Certificate Header */}
                      <div className="text-center space-y-1 pb-4 border-b border-amber-200/80">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-amber-300 text-[10px] font-black tracking-widest uppercase mb-1">
                          ⚡ AlgoCraft • Kurikulum Merdeka Informatika SMA
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase font-serif">
                          SERTIFIKAT KELULUSAN RESMI
                        </h1>
                        <p className="text-xs sm:text-sm font-bold text-amber-800 tracking-wide uppercase">
                          Pembelajaran Berpikir Komputasional Berbasis Masalah (PBL)
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">
                          No. Registrasi: {certNumber}
                        </p>
                      </div>

                      {/* Recipient Section */}
                      <div className="text-center py-6 space-y-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                          Sertifikat ini dengan bangga dianugerahkan kepada:
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 font-serif tracking-wide underline decoration-amber-500/60 underline-offset-8">
                          {student.name}
                        </h2>
                        <p className="text-xs font-bold text-slate-600 pt-1">
                          Nomor Absen: <span className="text-indigo-700">#{student.absentNo}</span> &nbsp;|&nbsp; 
                          Kelas: <span className="text-indigo-700">{className}</span> &nbsp;|&nbsp; 
                          Kode Sesi: <span className="text-indigo-700">{sessionCode}</span>
                        </p>
                      </div>

                      {/* Achievement Statement */}
                      <div className="text-center max-w-2xl mx-auto space-y-3 pb-6 border-b border-amber-200/80">
                        <p className="text-xs leading-relaxed text-slate-700">
                          Dinyatakan telah <strong>LULUS DAN MENUNTASKAN</strong> seluruh 6 misi pembelajaran berbasis masalah rancang bangun sistem kasir otomatis kantin sekolah, serta terbukti kompeten dalam 6 pilar Berpikir Komputasional:
                        </p>
                        
                        {/* 6 TP Pills in Certificate */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[9px] font-bold text-slate-800">
                          <div className="p-1.5 rounded-lg bg-amber-100/60 border border-amber-300/80">
                            1. Dekomposisi IPO
                          </div>
                          <div className="p-1.5 rounded-lg bg-amber-100/60 border border-amber-300/80">
                            2. Algoritma Kasir
                          </div>
                          <div className="p-1.5 rounded-lg bg-amber-100/60 border border-amber-300/80">
                            3. Percabangan IF
                          </div>
                          <div className="p-1.5 rounded-lg bg-amber-100/60 border border-amber-300/80">
                            4. Flowchart Alur
                          </div>
                          <div className="p-1.5 rounded-lg bg-amber-100/60 border border-amber-300/80">
                            5. Pseudocode
                          </div>
                          <div className="p-1.5 rounded-lg bg-amber-100/60 border border-amber-300/80">
                            6. Debugging Bug
                          </div>
                        </div>

                        {/* Predicate Banner */}
                        <div className="pt-2">
                          <span className="inline-block px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-xs">
                            {predicate}
                          </span>
                        </div>
                      </div>

                      {/* Footer & Signature Section */}
                      <div className="pt-6 grid grid-cols-3 items-center text-center">
                        {/* Left: Validation Stamp */}
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-600/80 flex flex-col items-center justify-center p-1 text-[8px] font-extrabold text-amber-800 uppercase tracking-tighter rotate-[-6deg] bg-amber-50/50">
                            <span>VERIFIED</span>
                            <span className="text-[10px]">★ PBL ★</span>
                            <span>ALGOCRAFT</span>
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 font-mono">Status: Terverifikasi</span>
                        </div>

                        {/* Center: Trophy Seal */}
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-md">
                            🏆
                          </div>
                          <span className="text-[10px] font-bold text-amber-800 mt-1">Lulus Tuntas 100%</span>
                        </div>

                        {/* Right: Teacher Signature */}
                        <div className="flex flex-col items-center">
                          <p className="text-[10px] font-semibold text-slate-500">
                            Ditetapkan pada: {todayFormatted}
                          </p>
                          <div className="h-12 flex items-end justify-center">
                            <span className="font-serif italic text-lg text-indigo-900 font-bold tracking-widest border-b border-slate-400 pb-0.5 px-4">
                              {teacherName}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-800 mt-1">
                            Guru Pengampu Informatika
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer Bar */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Portofolio Hasil Belajar Problem Based Learning (PBL) Kelas {className}</span>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
