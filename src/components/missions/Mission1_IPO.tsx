"use client";

import React, { useState } from "react";
import { IPO_DATA, IPOCard } from "@/data/storyData";
import { CheckCircle2, AlertCircle, ArrowRight, RotateCcw, Sparkles } from "lucide-react";

interface Mission1Props {
  onSuccess: (percentage: number, rubricScore: number, data: any) => void;
  onWrongAttempt: () => void;
}

export const Mission1_IPO: React.FC<Mission1Props> = ({ onSuccess, onWrongAttempt }) => {
  // Mapping kartu ke wadah kategori: null = belum dipilih
  const [placements, setPlacements] = useState<Record<string, "input" | "process" | "output">>({});
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState<{
    correctCount: number;
    total: number;
    percentage: number;
    rubricScore: number;
    isPass: boolean;
  } | null>(null);

  const handleCardClick = (id: string) => {
    if (submitted) return;
    if (selectedCardId === id) {
      setSelectedCardId(null);
    } else {
      setSelectedCardId(id);
    }
  };

  const handleContainerClick = (category: "input" | "process" | "output") => {
    if (submitted) return;
    if (!selectedCardId) return;

    setPlacements((prev) => ({
      ...prev,
      [selectedCardId]: category,
    }));
    setSelectedCardId(null);
  };

  const handleReset = () => {
    setPlacements({});
    setSelectedCardId(null);
    setSubmitted(false);
    setScoreResult(null);
  };

  const handleSubmit = () => {
    const total = IPO_DATA.length;
    let correctCount = 0;

    IPO_DATA.forEach((card) => {
      if (placements[card.id] === card.category) {
        correctCount += 1;
      }
    });

    const percentage = Math.round((correctCount / total) * 100);
    let rubricScore = 1;
    if (percentage === 100) rubricScore = 4;
    else if (percentage >= 75) rubricScore = 3;
    else if (percentage >= 50) rubricScore = 2;
    else rubricScore = 1;

    const isPass = percentage >= 75; // Kriteria TP 1: minimal 75%
    setScoreResult({
      correctCount,
      total,
      percentage,
      rubricScore,
      isPass,
    });
    setSubmitted(true);

    if (isPass) {
      onSuccess(percentage, rubricScore, placements);
    } else {
      onWrongAttempt();
    }
  };

  const unassignedCards = IPO_DATA.filter((c) => !placements[c.id]);
  const inputCards = IPO_DATA.filter((c) => placements[c.id] === "input");
  const processCards = IPO_DATA.filter((c) => placements[c.id] === "process");
  const outputCards = IPO_DATA.filter((c) => placements[c.id] === "output");

  return (
    <div className="space-y-6">
      {/* Kasus & Panduan Masalah (PBL Orientation) */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent p-5 rounded-2xl border border-blue-200/80">
        <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-1">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Misi 1: Kotak Hitam Kasir Pintar (Identifikasi IPO)</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Kantin SMA 10 membutuhkan rancangan awal sistem kasir otomatis. Pilah 8 komponen di bawah
          ini ke dalam kelompok <strong>Input</strong> (data masuk), <strong>Proses</strong> (perhitungan sistem),
          atau <strong>Output</strong> (informasi hasil).
        </p>
        <div className="mt-2 text-[11px] font-medium text-slate-500 flex items-center gap-2">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-bold">
            Target Ketuntasan: Minimal 75% Benar
          </span>
          <span>• Ketuk kartu, lalu ketuk wadah tujuan untuk menempatkannya.</span>
        </div>
      </div>

      {/* Kartu yang belum dipilah */}
      {unassignedCards.length > 0 && !submitted && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
            Kartu Belum Dikelompokkan ({unassignedCards.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {unassignedCards.map((card) => {
              const isSelected = selectedCardId === card.id;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`p-3 text-left rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300 scale-[1.02]"
                      : "bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:shadow-sm"
                  }`}
                >
                  <p>{card.text}</p>
                  {isSelected && (
                    <span className="inline-block mt-1 text-[10px] bg-white/20 text-white px-2 py-0.5 rounded">
                      Pilih wadah di bawah 👇
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3 Wadah: Input, Process, Output */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Wadah INPUT */}
        <div
          onClick={() => handleContainerClick("input")}
          className={`p-4 rounded-2xl border-2 transition-all flex flex-col min-h-[220px] ${
            selectedCardId
              ? "border-sky-400 bg-sky-50/70 hover:bg-sky-100/70 cursor-pointer border-dashed"
              : "border-sky-300 bg-sky-50/30"
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-sky-200 mb-3">
            <span className="text-xs font-black uppercase text-sky-800 tracking-wider flex items-center gap-1.5">
              📥 Input (Masukan)
            </span>
            <span className="text-[11px] font-bold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
              {inputCards.length}
            </span>
          </div>

          <div className="space-y-2 flex-1">
            {inputCards.map((card) => {
              const isWrong = submitted && card.category !== "input";
              const isRight = submitted && card.category === "input";
              return (
                <div
                  key={card.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!submitted) {
                      setPlacements((prev) => {
                        const copy = { ...prev };
                        delete copy[card.id];
                        return copy;
                      });
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    submitted
                      ? isRight
                        ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                        : "bg-rose-100 border-rose-300 text-rose-900"
                      : "bg-white border-sky-200 text-slate-800 shadow-xs cursor-pointer hover:bg-rose-50"
                  }`}
                >
                  <p>{card.text}</p>
                  {submitted && (
                    <p className="text-[10px] mt-1 text-slate-600 italic">{card.explanation}</p>
                  )}
                  {!submitted && (
                    <span className="text-[9px] text-slate-400 hover:text-rose-600 block mt-1">
                      (Ketuk untuk batalkan)
                    </span>
                  )}
                </div>
              );
            })}
            {inputCards.length === 0 && (
              <div className="h-full flex items-center justify-center text-xs text-sky-400 italic py-6">
                Ketuk kartu lalu ketuk wadah ini
              </div>
            )}
          </div>
        </div>

        {/* Wadah PROSES */}
        <div
          onClick={() => handleContainerClick("process")}
          className={`p-4 rounded-2xl border-2 transition-all flex flex-col min-h-[220px] ${
            selectedCardId
              ? "border-amber-400 bg-amber-50/70 hover:bg-amber-100/70 cursor-pointer border-dashed"
              : "border-amber-300 bg-amber-50/30"
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-amber-200 mb-3">
            <span className="text-xs font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
              ⚙️ Proses (Kalkulasi)
            </span>
            <span className="text-[11px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {processCards.length}
            </span>
          </div>

          <div className="space-y-2 flex-1">
            {processCards.map((card) => {
              const isWrong = submitted && card.category !== "process";
              const isRight = submitted && card.category === "process";
              return (
                <div
                  key={card.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!submitted) {
                      setPlacements((prev) => {
                        const copy = { ...prev };
                        delete copy[card.id];
                        return copy;
                      });
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    submitted
                      ? isRight
                        ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                        : "bg-rose-100 border-rose-300 text-rose-900"
                      : "bg-white border-amber-200 text-slate-800 shadow-xs cursor-pointer hover:bg-rose-50"
                  }`}
                >
                  <p>{card.text}</p>
                  {submitted && (
                    <p className="text-[10px] mt-1 text-slate-600 italic">{card.explanation}</p>
                  )}
                  {!submitted && (
                    <span className="text-[9px] text-slate-400 hover:text-rose-600 block mt-1">
                      (Ketuk untuk batalkan)
                    </span>
                  )}
                </div>
              );
            })}
            {processCards.length === 0 && (
              <div className="h-full flex items-center justify-center text-xs text-amber-400 italic py-6">
                Ketuk kartu lalu ketuk wadah ini
              </div>
            )}
          </div>
        </div>

        {/* Wadah OUTPUT */}
        <div
          onClick={() => handleContainerClick("output")}
          className={`p-4 rounded-2xl border-2 transition-all flex flex-col min-h-[220px] ${
            selectedCardId
              ? "border-emerald-400 bg-emerald-50/70 hover:bg-emerald-100/70 cursor-pointer border-dashed"
              : "border-emerald-300 bg-emerald-50/30"
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200 mb-3">
            <span className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
              📤 Output (Hasil)
            </span>
            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              {outputCards.length}
            </span>
          </div>

          <div className="space-y-2 flex-1">
            {outputCards.map((card) => {
              const isWrong = submitted && card.category !== "output";
              const isRight = submitted && card.category === "output";
              return (
                <div
                  key={card.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!submitted) {
                      setPlacements((prev) => {
                        const copy = { ...prev };
                        delete copy[card.id];
                        return copy;
                      });
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    submitted
                      ? isRight
                        ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                        : "bg-rose-100 border-rose-300 text-rose-900"
                      : "bg-white border-emerald-200 text-slate-800 shadow-xs cursor-pointer hover:bg-rose-50"
                  }`}
                >
                  <p>{card.text}</p>
                  {submitted && (
                    <p className="text-[10px] mt-1 text-slate-600 italic">{card.explanation}</p>
                  )}
                  {!submitted && (
                    <span className="text-[9px] text-slate-400 hover:text-rose-600 block mt-1">
                      (Ketuk untuk batalkan)
                    </span>
                  )}
                </div>
              );
            })}
            {outputCards.length === 0 && (
              <div className="h-full flex items-center justify-center text-xs text-emerald-400 italic py-6">
                Ketuk kartu lalu ketuk wadah ini
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hasil & Aksi */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          Kartu terisi: {Object.keys(placements).length} dari {IPO_DATA.length}
        </div>

        <div className="flex items-center gap-3">
          {submitted ? (
            scoreResult?.isPass ? (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold">
                  Hebat! Nilai: {scoreResult.percentage}% (Skor Rubrik: {scoreResult.rubricScore}/4)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Nilai: {scoreResult?.percentage}% (Belum tuntas min 75%). -1 Nyawa.</span>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Ulangi
                </button>
              </div>
            )
          ) : (
            <button
              disabled={Object.keys(placements).length < IPO_DATA.length}
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Periksa Jawaban</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
