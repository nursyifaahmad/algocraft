"use client";

import React, { useState } from "react";
import { ALGO_STEPS_DATA, AlgoStep } from "@/data/storyData";
import { CheckCircle2, AlertCircle, ArrowUp, ArrowDown, ArrowRight, RotateCcw, ListOrdered } from "lucide-react";

interface Mission2Props {
  onSuccess: (percentage: number, rubricScore: number, data: any) => void;
  onWrongAttempt: () => void;
}

export const Mission2_Algorithm: React.FC<Mission2Props> = ({ onSuccess, onWrongAttempt }) => {
  // Acak urutan awal
  const [steps, setSteps] = useState<AlgoStep[]>(() => {
    return [...ALGO_STEPS_DATA].sort(() => Math.random() - 0.5);
  });
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    correctPositions: number;
    total: number;
    percentage: number;
    rubricScore: number;
    isPass: boolean;
  } | null>(null);

  const moveStep = (index: number, direction: "up" | "down") => {
    if (submitted) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;
    setSteps(newSteps);
  };

  const handleReset = () => {
    setSteps([...ALGO_STEPS_DATA].sort(() => Math.random() - 0.5));
    setSubmitted(false);
    setResult(null);
  };

  const handleSubmit = () => {
    let correctCount = 0;
    steps.forEach((step, idx) => {
      if (step.order === idx + 1) {
        correctCount += 1;
      }
    });

    const total = steps.length; // 7 langkah
    const percentage = Math.round((correctCount / total) * 100);

    // Rubrik Skala 4 (Target TP 2: Minimal Skor 3 dari 4)
    let rubricScore = 1;
    if (correctCount === 7) rubricScore = 4;
    else if (correctCount >= 5) rubricScore = 3;
    else if (correctCount >= 3) rubricScore = 2;
    else rubricScore = 1;

    const isPass = rubricScore >= 3;

    setResult({
      correctPositions: correctCount,
      total,
      percentage,
      rubricScore,
      isPass,
    });
    setSubmitted(true);

    if (isPass) {
      onSuccess(percentage, rubricScore, steps);
    } else {
      onWrongAttempt();
    }
  };

  return (
    <div className="space-y-6">
      {/* Pengantar Masalah (PBL) */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent p-5 rounded-2xl border border-emerald-200/80">
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
          <ListOrdered className="w-4 h-4 text-emerald-600" />
          <span>Misi 2: Antrean Pemesanan Teratur (Langkah Algoritma)</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Kasir kantin membutuhkan panduan alur langkah yang terstruktur dari awal hingga selesai.
          Susunlah 7 langkah algoritma di bawah ini agar urutan transaksinya logis dan sistematis.
        </p>
        <div className="mt-2 text-[11px] font-medium text-slate-500 flex items-center gap-2">
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold">
            Target Ketuntasan: Minimal Skor 3 dari Skala 4
          </span>
          <span>• Gunakan tombol panah Naik / Turun untuk memindahkan posisi langkah.</span>
        </div>
      </div>

      {/* Daftar Langkah Interaktif */}
      <div className="space-y-2.5 max-w-2xl mx-auto">
        {steps.map((step, idx) => {
          const isCorrect = submitted && step.order === idx + 1;
          const isWrong = submitted && step.order !== idx + 1;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                submitted
                  ? isCorrect
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : "bg-rose-50 border-rose-300 text-rose-950"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
              }`}
            >
              {/* Nomor Urut */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  submitted
                    ? isCorrect
                      ? "bg-emerald-600 text-white"
                      : "bg-rose-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {idx + 1}
              </div>

              {/* Teks Instruksi */}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold">{step.text}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
                {submitted && isWrong && (
                  <p className="text-[10px] text-rose-600 mt-1 font-bold">
                    (Seharusnya posisi langkah ke-{step.order})
                  </p>
                )}
              </div>

              {/* Tombol Geser (Ramah Layar Sentuh Mobile) */}
              {!submitted && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveStep(idx, "up")}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 transition-colors cursor-pointer"
                    title="Geser ke atas"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={idx === steps.length - 1}
                    onClick={() => moveStep(idx, "down")}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 transition-colors cursor-pointer"
                    title="Geser ke bawah"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hasil & Evaluasi */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          Susun hingga semua langkah mengalir logis dari Mulai (1) ke Selesai (7).
        </div>

        <div className="flex items-center gap-3">
          {submitted ? (
            result?.isPass ? (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold">
                  Sangat Logis! Skor Rubrik: {result.rubricScore}/4 ({result.percentage}%)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Skor Rubrik: {result?.rubricScore}/4 (Belum tuntas min skor 3). -1 Nyawa.</span>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Ulangi Susunan
                </button>
              </div>
            )
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Uji Urutan Algoritma</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
