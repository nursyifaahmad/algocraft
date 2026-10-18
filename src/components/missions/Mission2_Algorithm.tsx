"use client";

import React, { useState, useRef } from "react";
import { ALGO_STEPS_DATA, AlgoStep } from "@/data/storyData";
import {
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  RotateCcw,
  ListOrdered,
  GripVertical,
} from "lucide-react";

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

  // Status Drag & Drop (Desktop & Mobile)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const touchStartIndexRef = useRef<number | null>(null);

  // Pemindahan dengan Tombol Panah (Up / Down)
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

  // Drag & Drop HTML5 (Desktop Mouse)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (submitted) return;
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (submitted) return;
    e.preventDefault();
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    if (submitted) return;
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIndex) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const updatedSteps = [...steps];
    const [removed] = updatedSteps.splice(draggedIdx, 1);
    updatedSteps.splice(targetIndex, 0, removed);

    setSteps(updatedSteps);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  // Drag & Drop Touch (Layar Sentuh HP Android / iOS)
  const handleTouchStart = (index: number) => {
    if (submitted) return;
    touchStartIndexRef.current = index;
    setDraggedIdx(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (submitted || touchStartIndexRef.current === null || e.touches.length === 0) return;
    const touch = e.touches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const stepCard = targetElement?.closest("[data-step-index]");
    if (stepCard) {
      const hoverIndex = Number(stepCard.getAttribute("data-step-index"));
      if (!isNaN(hoverIndex) && hoverIndex !== dragOverIdx) {
        setDragOverIdx(hoverIndex);
      }
    }
  };

  const handleTouchEnd = () => {
    if (
      touchStartIndexRef.current !== null &&
      dragOverIdx !== null &&
      touchStartIndexRef.current !== dragOverIdx
    ) {
      const updatedSteps = [...steps];
      const [removed] = updatedSteps.splice(touchStartIndexRef.current, 1);
      updatedSteps.splice(dragOverIdx, 0, removed);
      setSteps(updatedSteps);
    }
    touchStartIndexRef.current = null;
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleReset = () => {
    setSteps([...ALGO_STEPS_DATA].sort(() => Math.random() - 0.5));
    setSubmitted(false);
    setResult(null);
    setDraggedIdx(null);
    setDragOverIdx(null);
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
        <div className="mt-2 text-[11px] font-medium text-slate-500 flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold">
            Target Ketuntasan: Minimal Skor 3 dari Skala 4
          </span>
          <span>• 💡 <strong>Tips:</strong> Anda bisa <strong>Drag & Drop (geser langsung)</strong> kartu atau gunakan tombol panah Naik / Turun.</span>
        </div>
      </div>

      {/* Daftar Langkah Interaktif dengan Drag & Drop */}
      <div className="space-y-2.5 max-w-2xl mx-auto select-none">
        {steps.map((step, idx) => {
          const isCorrect = submitted && step.order === idx + 1;
          const isWrong = submitted && step.order !== idx + 1;
          const isDragging = draggedIdx === idx;
          const isDragOver = dragOverIdx === idx && draggedIdx !== idx;

          return (
            <div
              key={step.id}
              data-step-index={idx}
              draggable={!submitted}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              onTouchStart={() => handleTouchStart(idx)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                isDragging
                  ? "opacity-40 border-dashed border-indigo-400 bg-indigo-50/50 scale-98"
                  : isDragOver
                  ? "border-2 border-indigo-500 bg-indigo-50/80 shadow-md scale-102"
                  : submitted
                  ? isCorrect
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : "bg-rose-50 border-rose-300 text-rose-950"
                  : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm cursor-grab active:cursor-grabbing"
              }`}
            >
              {/* Grip Handle untuk Drag & Drop */}
              {!submitted && (
                <div
                  className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing p-1 flex-shrink-0"
                  title="Geser untuk memindahkan posisi"
                >
                  <GripVertical className="w-4 h-4" />
                </div>
              )}

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
                <p className="text-xs sm:text-sm font-semibold text-slate-800">{step.text}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
                {submitted && isWrong && (
                  <p className="text-[10px] text-rose-600 mt-1 font-bold">
                    (Seharusnya posisi langkah ke-{step.order})
                  </p>
                )}
              </div>

              {/* Tombol Geser Panah Alternatif */}
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
