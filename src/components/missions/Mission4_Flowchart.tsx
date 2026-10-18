"use client";

import React, { useState } from "react";
import { FLOWCHART_ITEMS, FlowchartNodeData } from "@/data/storyData";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Info,
  HelpCircle,
  Network,
} from "lucide-react";

interface SlotDefinition {
  slotId: number; // 1 s/d 7
  title: string;
  expectedType: "terminator" | "io" | "process" | "decision";
  expectedNodeId: string;
  typeLabel: string;
}

const FLOWCHART_SLOTS: SlotDefinition[] = [
  {
    slotId: 1,
    title: "Titik Awal Alur",
    expectedType: "terminator",
    expectedNodeId: "fc-start",
    typeLabel: "Terminator (Oval)",
  },
  {
    slotId: 2,
    title: "Membaca Data Pembeli",
    expectedType: "io",
    expectedNodeId: "fc-input",
    typeLabel: "Input/Output (Jajar Genjang)",
  },
  {
    slotId: 3,
    title: "Evaluasi Kondisi Saldo",
    expectedType: "decision",
    expectedNodeId: "fc-decision",
    typeLabel: "Decision (Belah Ketupat)",
  },
  {
    slotId: 4,
    title: "Kalkulasi Sisa Saldo (Cabang YA)",
    expectedType: "process",
    expectedNodeId: "fc-process-yes",
    typeLabel: "Proses (Persegi Panjang)",
  },
  {
    slotId: 5,
    title: "Cetak Bukti Berhasil (Cabang YA)",
    expectedType: "io",
    expectedNodeId: "fc-output-yes",
    typeLabel: "Input/Output (Jajar Genjang)",
  },
  {
    slotId: 6,
    title: "Pemberitahuan Ditolak (Cabang TIDAK)",
    expectedType: "io",
    expectedNodeId: "fc-output-no",
    typeLabel: "Input/Output (Jajar Genjang)",
  },
  {
    slotId: 7,
    title: "Titik Akhir Transaksi",
    expectedType: "terminator",
    expectedNodeId: "fc-end",
    typeLabel: "Terminator (Oval)",
  },
];

interface Mission4Props {
  onSuccess: (percentage: number, rubricScore: number, data: any) => void;
  onWrongAttempt: () => void;
}

export const Mission4_Flowchart: React.FC<Mission4Props> = ({ onSuccess, onWrongAttempt }) => {
  // Mapping: slotId -> FlowchartNodeData
  const [slotAssignments, setSlotAssignments] = useState<Record<number, FlowchartNodeData>>({});
  const [selectedItem, setSelectedItem] = useState<FlowchartNodeData | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    correctSlots: number;
    correctSymbols: number;
    rubricScore: number;
    percentage: number;
    isPass: boolean;
    feedback: string;
  } | null>(null);

  // Daftar item yang sudah terpasang di slot
  const assignedItemIds = new Set(Object.values(slotAssignments).map((i) => i.id));
  const unassignedItems = FLOWCHART_ITEMS.filter((item) => !assignedItemIds.has(item.id));

  const handleSelectPalette = (item: FlowchartNodeData) => {
    if (submitted) return;
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const handleSlotClick = (slotId: number) => {
    if (submitted) return;

    if (selectedItem) {
      // Pasang item terpilih ke slot ini
      setSlotAssignments((prev) => ({
        ...prev,
        [slotId]: selectedItem,
      }));
      setSelectedItem(null);
    } else if (slotAssignments[slotId]) {
      // Jika slot sudah ada isinya dan tidak ada item yang dipilih, lepas kembali ke palet
      setSlotAssignments((prev) => {
        const copy = { ...prev };
        delete copy[slotId];
        return copy;
      });
    }
  };

  const handleReset = () => {
    setSlotAssignments({});
    setSelectedItem(null);
    setSubmitted(false);
    setResult(null);
  };

  const handleSubmit = () => {
    let correctSlots = 0;
    let correctSymbols = 0;
    const totalSlots = FLOWCHART_SLOTS.length; // 7

    FLOWCHART_SLOTS.forEach((slot) => {
      const assigned = slotAssignments[slot.slotId];
      if (assigned) {
        // Cek simbol geometri sesuai standar
        if (assigned.type === slot.expectedType) {
          correctSymbols += 1;
        }
        // Cek posisi alur logika yang tepat
        if (assigned.id === slot.expectedNodeId) {
          correctSlots += 1;
        }
      }
    });

    let rubricScore = 1;
    let feedback = "";

    if (correctSlots === totalSlots) {
      rubricScore = 4;
      feedback = "Sempurna! Semua simbol geometris dan alur percabangan flowchart tersusun 100% akurat.";
    } else if (correctSlots >= 5 && correctSymbols >= 6) {
      rubricScore = 3;
      feedback = "Sangat Baik! Simbol dan alur diagram alir sesuai dengan kaidah algoritma (Tuntas).";
    } else if (correctSymbols >= 4) {
      rubricScore = 2;
      feedback = "Cukup, namun terdapat penempatan alur cabang atau simbol standar yang tertukar.";
    } else {
      rubricScore = 1;
      feedback = "Bagan alir belum sesuai aturan standar simbol diagram alir.";
    }

    const percentage = Math.round((correctSlots / totalSlots) * 100);
    const isPass = rubricScore >= 3; // Kriteria TP 4: minimal skor 3 dari 4

    setResult({
      correctSlots,
      correctSymbols,
      rubricScore,
      percentage,
      isPass,
      feedback,
    });
    setSubmitted(true);

    if (isPass) {
      onSuccess(percentage, rubricScore, slotAssignments);
    } else {
      onWrongAttempt();
    }
  };

  // Render bentuk geometris simbol standar
  const renderFlowchartShape = (
    type: "terminator" | "io" | "process" | "decision",
    label: string,
    isGhost: boolean = false,
    isWrong: boolean = false,
    isRight: boolean = false
  ) => {
    // 1. TERMINATOR (OVAL / KAPSUL)
    if (type === "terminator") {
      return (
        <div className="relative w-full max-w-[240px] h-[52px] flex items-center justify-center mx-auto transition-transform">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 52" preserveAspectRatio="none">
            <rect
              x="3"
              y="3"
              width="234"
              height="46"
              rx="23"
              ry="23"
              fill={isGhost ? "#f8fafc" : isWrong ? "#fee2e2" : isRight ? "#d1fae5" : "#ecfdf5"}
              stroke={isGhost ? "#cbd5e1" : isWrong ? "#ef4444" : isRight ? "#059669" : "#10b981"}
              strokeWidth={isGhost ? "2" : "2.5"}
              strokeDasharray={isGhost ? "5,5" : undefined}
            />
          </svg>
          <span
            className={`relative z-10 px-4 text-center font-bold text-xs ${
              isGhost ? "text-slate-400 italic font-normal" : isWrong ? "text-rose-900" : "text-emerald-950"
            }`}
          >
            {label}
          </span>
        </div>
      );
    }

    // 2. INPUT / OUTPUT (JAJAR GENJANG / PARALLELOGRAM MIRING)
    if (type === "io") {
      return (
        <div className="relative w-full max-w-[280px] h-[58px] flex items-center justify-center mx-auto transition-transform">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 58" preserveAspectRatio="none">
            {/* Sudut miring jajar genjang sejati: (24,3) ke (277,3) ke (256,55) ke (3,55) */}
            <polygon
              points="24,3 277,3 256,55 3,55"
              fill={isGhost ? "#f8fafc" : isWrong ? "#fee2e2" : isRight ? "#d1fae5" : "#f0f9ff"}
              stroke={isGhost ? "#cbd5e1" : isWrong ? "#ef4444" : isRight ? "#059669" : "#0ea5e9"}
              strokeWidth={isGhost ? "2" : "2.5"}
              strokeDasharray={isGhost ? "5,5" : undefined}
            />
          </svg>
          <span
            className={`relative z-10 px-8 text-center font-semibold text-xs leading-tight ${
              isGhost ? "text-slate-400 italic font-normal" : isWrong ? "text-rose-900" : "text-sky-950"
            }`}
          >
            {label}
          </span>
        </div>
      );
    }

    // 3. PROSES (PERSEGI PANJANG SIKU-SIKU MURNI)
    if (type === "process") {
      return (
        <div className="relative w-full max-w-[280px] h-[58px] flex items-center justify-center mx-auto transition-transform">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 58" preserveAspectRatio="none">
            <rect
              x="3"
              y="3"
              width="274"
              height="52"
              rx="0"
              ry="0"
              fill={isGhost ? "#f8fafc" : isWrong ? "#fee2e2" : isRight ? "#d1fae5" : "#eef2ff"}
              stroke={isGhost ? "#cbd5e1" : isWrong ? "#ef4444" : isRight ? "#059669" : "#6366f1"}
              strokeWidth={isGhost ? "2" : "2.5"}
              strokeDasharray={isGhost ? "5,5" : undefined}
            />
          </svg>
          <span
            className={`relative z-10 px-4 text-center font-semibold text-xs leading-tight font-mono ${
              isGhost ? "text-slate-400 italic font-normal" : isWrong ? "text-rose-900" : "text-indigo-950"
            }`}
          >
            {label}
          </span>
        </div>
      );
    }

    // 4. DECISION (BELAH KETUPAT / DIAMOND / RHOMBUS SIMETRIS)
    if (type === "decision") {
      return (
        <div className="relative w-full max-w-[290px] h-[90px] flex items-center justify-center mx-auto transition-transform">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 290 90" preserveAspectRatio="none">
            {/* Sudut belah ketupat sejati: Top(145,3), Right(287,45), Bottom(145,87), Left(3,45) */}
            <polygon
              points="145,3 287,45 145,87 3,45"
              fill={isGhost ? "#f8fafc" : isWrong ? "#fee2e2" : isRight ? "#d1fae5" : "#fffbeb"}
              stroke={isGhost ? "#cbd5e1" : isWrong ? "#ef4444" : isRight ? "#059669" : "#f59e0b"}
              strokeWidth={isGhost ? "2" : "2.5"}
              strokeDasharray={isGhost ? "5,5" : undefined}
            />
          </svg>
          <span
            className={`relative z-10 px-10 text-center font-bold text-xs leading-tight ${
              isGhost ? "text-slate-400 italic font-normal" : isWrong ? "text-rose-900" : "text-amber-950"
            }`}
          >
            {label}
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Pengantar Masalah & Pedoman Standar Simbol */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent p-5 rounded-2xl border border-amber-200/80">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-1">
          <Network className="w-4 h-4 text-amber-600" />
          <span>Misi 4: Representasi Diagram Alir Standar (Flowchart Percabangan)</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Dalam ilmu komputer, diagram alir wajib menggunakan simbol geometri standar (ANSI/ISO).
          Pilihlah simbol yang tepat dari palet, lalu tempatkan ke dalam bagan alur bercabang
          <strong> Kantin Digital</strong> di bawah!
        </p>

        {/* Legenda Kaidah Simbol Standar */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-amber-200/60 text-[11px]">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600 flex-shrink-0" />
            <span>Oval = Terminator (Mulai/Selesai)</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-sky-800">
            <span className="w-3 h-3 skew-x-[-12deg] bg-sky-400 border border-sky-600 flex-shrink-0" />
            <span>Jajar Genjang = Input / Output</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-indigo-800">
            <span className="w-3 h-2.5 bg-indigo-500 border border-indigo-600 flex-shrink-0" />
            <span>Persegi Panjang = Proses Hitung</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-amber-800">
            <span className="w-2.5 h-2.5 rotate-45 bg-amber-400 border border-amber-600 flex-shrink-0" />
            <span>Belah Ketupat = Keputusan (IF)</span>
          </div>
        </div>
      </div>

      {/* Palet Simbol yang Belum Terpasang */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="uppercase tracking-wide">
            Palet Simbol Geometris Tersedia ({unassignedItems.length}):
          </span>
          {selectedItem && (
            <span className="text-xs text-indigo-600 font-bold animate-pulse">
              👉 Ketuk slot tujuan pada bagan alir di bawah!
            </span>
          )}
        </div>

        {unassignedItems.length === 0 && !submitted ? (
          <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-semibold text-center">
            Semua simbol telah ditempatkan! Silakan periksa kembali dan klik &quot;Validasi Diagram Alir&quot;.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {unassignedItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  disabled={submitted}
                  onClick={() => handleSelectPalette(item)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-300 shadow-md scale-102"
                      : "bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-bold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : item.type === "terminator"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.type === "decision"
                          ? "bg-amber-100 text-amber-800"
                          : item.type === "io"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {item.type === "terminator"
                        ? "Oval / Terminator"
                        : item.type === "decision"
                        ? "Belah Ketupat / Decision"
                        : item.type === "io"
                        ? "Jajar Genjang / I-O"
                        : "Persegi Panjang / Proses"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold leading-tight">{item.label}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Kanvas Diagram Alir Terstruktur & Bercabang */}
      <div className="bg-slate-900/5 border-2 border-slate-200 rounded-3xl p-4 sm:p-8 shadow-inner overflow-x-auto">
        <div className="min-w-[620px] max-w-2xl mx-auto flex flex-col items-center space-y-4">
          {/* SLOT 1: MULAI (Oval) */}
          <div className="w-full flex flex-col items-center">
            <div
              onClick={() => handleSlotClick(1)}
              className={`cursor-pointer transition-all ${
                selectedItem ? "hover:scale-105" : ""
              }`}
            >
              {slotAssignments[1] ? (
                renderFlowchartShape(
                  slotAssignments[1].type,
                  slotAssignments[1].label,
                  false,
                  submitted && slotAssignments[1].id !== "fc-start",
                  submitted && slotAssignments[1].id === "fc-start"
                )
              ) : (
                renderFlowchartShape("terminator", "Slot 1: [Ketuk untuk pasang MULAI]", true)
              )}
            </div>

            {/* Panah ke Bawah */}
            <div className="flex flex-col items-center my-1 text-slate-500">
              <div className="w-0.5 h-6 bg-slate-500" />
              <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-slate-500" />
            </div>
          </div>

          {/* SLOT 2: INPUT PESANAN (Jajar Genjang) */}
          <div className="w-full flex flex-col items-center">
            <div
              onClick={() => handleSlotClick(2)}
              className={`cursor-pointer transition-all ${
                selectedItem ? "hover:scale-105" : ""
              }`}
            >
              {slotAssignments[2] ? (
                renderFlowchartShape(
                  slotAssignments[2].type,
                  slotAssignments[2].label,
                  false,
                  submitted && slotAssignments[2].id !== "fc-input",
                  submitted && slotAssignments[2].id === "fc-input"
                )
              ) : (
                renderFlowchartShape("io", "Slot 2: [Ketuk untuk pasang INPUT]", true)
              )}
            </div>

            {/* Panah ke Bawah */}
            <div className="flex flex-col items-center my-1 text-slate-500">
              <div className="w-0.5 h-6 bg-slate-500" />
              <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-slate-500" />
            </div>
          </div>

          {/* SLOT 3: DECISION (Belah Ketupat / Diamond) */}
          <div className="w-full flex flex-col items-center relative">
            <div
              onClick={() => handleSlotClick(3)}
              className={`cursor-pointer transition-all ${
                selectedItem ? "hover:scale-105" : ""
              }`}
            >
              {slotAssignments[3] ? (
                renderFlowchartShape(
                  slotAssignments[3].type,
                  slotAssignments[3].label,
                  false,
                  submitted && slotAssignments[3].id !== "fc-decision",
                  submitted && slotAssignments[3].id === "fc-decision"
                )
              ) : (
                renderFlowchartShape("decision", "Slot 3: [Ketuk untuk pasang DECISION]", true)
              )}
            </div>
          </div>

          {/* AREA PERCABANGAN: CABANG YA (Kiri) & CABANG TIDAK (Kanan) */}
          <div className="w-full grid grid-cols-2 gap-8 pt-2">
            {/* CABANG KIRI: YA (TRUE) */}
            <div className="flex flex-col items-center space-y-4 border-r border-slate-300/80 pr-4">
              {/* Panah Keluar Cabang YA */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-black px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                  YA (Saldo Cukup)
                </span>
                <div className="w-0.5 h-6 bg-emerald-600 mt-1" />
                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-emerald-600" />
              </div>

              {/* SLOT 4: PROSES HITUNG SISA SALDO (Persegi Panjang) */}
              <div
                onClick={() => handleSlotClick(4)}
                className={`w-full cursor-pointer transition-all ${
                  selectedItem ? "hover:scale-105" : ""
                }`}
              >
                {slotAssignments[4] ? (
                  renderFlowchartShape(
                    slotAssignments[4].type,
                    slotAssignments[4].label,
                    false,
                    submitted && slotAssignments[4].id !== "fc-process-yes",
                    submitted && slotAssignments[4].id === "fc-process-yes"
                  )
                ) : (
                  renderFlowchartShape("process", "Slot 4: [PROSES sisa_saldo]", true)
                )}
              </div>

              {/* Panah ke Bawah */}
              <div className="flex flex-col items-center my-0.5 text-slate-500">
                <div className="w-0.5 h-6 bg-slate-500" />
                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-slate-500" />
              </div>

              {/* SLOT 5: OUTPUT TRANSAKSI BERHASIL (Jajar Genjang) */}
              <div
                onClick={() => handleSlotClick(5)}
                className={`w-full cursor-pointer transition-all ${
                  selectedItem ? "hover:scale-105" : ""
                }`}
              >
                {slotAssignments[5] ? (
                  renderFlowchartShape(
                    slotAssignments[5].type,
                    slotAssignments[5].label,
                    false,
                    submitted && slotAssignments[5].id !== "fc-output-yes",
                    submitted && slotAssignments[5].id === "fc-output-yes"
                  )
                ) : (
                  renderFlowchartShape("io", "Slot 5: [OUTPUT Berhasil]", true)
                )}
              </div>
            </div>

            {/* CABANG KANAN: TIDAK (FALSE) */}
            <div className="flex flex-col items-center justify-start space-y-4 pl-4">
              {/* Panah Keluar Cabang TIDAK */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-black px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full border border-rose-300">
                  TIDAK (Saldo Kurang)
                </span>
                <div className="w-0.5 h-6 bg-rose-600 mt-1" />
                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-rose-600" />
              </div>

              {/* SLOT 6: OUTPUT SALDO KURANG (Jajar Genjang) */}
              <div
                onClick={() => handleSlotClick(6)}
                className={`w-full cursor-pointer transition-all ${
                  selectedItem ? "hover:scale-105" : ""
                }`}
              >
                {slotAssignments[6] ? (
                  renderFlowchartShape(
                    slotAssignments[6].type,
                    slotAssignments[6].label,
                    false,
                    submitted && slotAssignments[6].id !== "fc-output-no",
                    submitted && slotAssignments[6].id === "fc-output-no"
                  )
                ) : (
                  renderFlowchartShape("io", "Slot 6: [OUTPUT Saldo Kurang]", true)
                )}
              </div>
            </div>
          </div>

          {/* GARIS PENGHUBUNG MENYATU KE SELESAI */}
          <div className="w-full flex flex-col items-center pt-2">
            <div className="w-1/2 h-4 border-b-2 border-x-2 border-slate-400 rounded-b-xl" />
            <div className="w-0.5 h-6 bg-slate-500" />
            <div className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-slate-500" />
          </div>

          {/* SLOT 7: SELESAI (Oval) */}
          <div className="w-full flex flex-col items-center">
            <div
              onClick={() => handleSlotClick(7)}
              className={`cursor-pointer transition-all ${
                selectedItem ? "hover:scale-105" : ""
              }`}
            >
              {slotAssignments[7] ? (
                renderFlowchartShape(
                  slotAssignments[7].type,
                  slotAssignments[7].label,
                  false,
                  submitted && slotAssignments[7].id !== "fc-end",
                  submitted && slotAssignments[7].id === "fc-end"
                )
              ) : (
                renderFlowchartShape("terminator", "Slot 7: [Ketuk untuk pasang SELESAI]", true)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hasil & Aksi */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          Slot terisi: {Object.keys(slotAssignments).length} dari {FLOWCHART_SLOTS.length}
        </div>

        <div className="flex items-center gap-3">
          {submitted ? (
            result?.isPass ? (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold">
                  Bagan Alir Sempurna! Skor Rubrik: {result.rubricScore}/4 ({result.percentage}%)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Skor: {result?.rubricScore}/4. {result?.feedback} (-1 Nyawa)</span>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Ulangi Pasang
                </button>
              </div>
            )
          ) : (
            <button
              disabled={Object.keys(slotAssignments).length < FLOWCHART_SLOTS.length}
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Validasi Diagram Alir</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
