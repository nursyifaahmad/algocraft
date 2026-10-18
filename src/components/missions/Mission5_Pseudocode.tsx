"use client";

import React, { useState, useRef, useEffect } from "react";
import { PARSON_DATA, ParsonLine } from "@/data/storyData";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  FileCode2,
  GripVertical,
  Save,
} from "lucide-react";

interface Mission5Props {
  studentId?: string;
  onSuccess: (percentage: number, rubricScore: number, data: any) => void;
  onWrongAttempt: () => void;
}

interface UserLine {
  id: string;
  correctOrder: number;
  expectedIndent: number;
  currentIndent: number;
  text: string;
}

export const Mission5_Pseudocode: React.FC<Mission5Props> = ({ studentId, onSuccess, onWrongAttempt }) => {
  const storageKey = `algocraft_draft_m5_${studentId || "default"}`;
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Acak urutan awal baris pseudocode dan inisialisasi indent = 0
  const [lines, setLines] = useState<UserLine[]>(() => {
    return [...PARSON_DATA]
      .sort(() => Math.random() - 0.5)
      .map((pl) => ({
        id: pl.id,
        correctOrder: pl.correctOrder,
        expectedIndent: pl.indent,
        currentIndent: 0,
        text: pl.text,
      }));
  });

  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    correctOrderCount: number;
    correctIndentCount: number;
    rubricScore: number;
    percentage: number;
    isPass: boolean;
  } | null>(null);

  // Pemulihan draf pseudocode dari memori HP/browser
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === PARSON_DATA.length) {
          setLines(parsed);
          setDraftLoaded(true);
        }
      }
    } catch (e) {
      console.error("Error restoring Misi 5 draft:", e);
    }
  }, [storageKey]);

  // Simpan draf urutan & indentasi pseudocode otomatis
  useEffect(() => {
    if (!submitted) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(lines));
      } catch (e) {
        console.error("Error saving Misi 5 draft:", e);
      }
    }
  }, [lines, storageKey, submitted]);

  // Status Drag & Drop (Desktop & Mobile)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const touchStartIndexRef = useRef<number | null>(null);

  const moveLine = (index: number, direction: "up" | "down") => {
    if (submitted) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= lines.length) return;

    setLines((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const changeIndent = (index: number, delta: number) => {
    if (submitted) return;
    setLines((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const newIndent = Math.max(0, Math.min(3, item.currentIndent + delta));
        return { ...item, currentIndent: newIndent };
      })
    );
  };

  // Drag & Drop HTML5
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

    const updated = [...lines];
    const [removed] = updated.splice(draggedIdx, 1);
    updated.splice(targetIndex, 0, removed);

    setLines(updated);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  // Drag & Drop Touch Mobile
  const handleTouchStart = (index: number) => {
    if (submitted) return;
    touchStartIndexRef.current = index;
    setDraggedIdx(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (submitted || touchStartIndexRef.current === null || e.touches.length === 0) return;
    const touch = e.touches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const lineCard = targetElement?.closest("[data-line-index]");
    if (lineCard) {
      const hoverIndex = Number(lineCard.getAttribute("data-line-index"));
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
      const updated = [...lines];
      const [removed] = updated.splice(touchStartIndexRef.current, 1);
      updated.splice(dragOverIdx, 0, removed);
      setLines(updated);
    }
    touchStartIndexRef.current = null;
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleReset = () => {
    setLines(
      [...PARSON_DATA]
        .sort(() => Math.random() - 0.5)
        .map((pl) => ({
          id: pl.id,
          correctOrder: pl.correctOrder,
          expectedIndent: pl.indent,
          currentIndent: 0,
          text: pl.text,
        }))
    );
    setSubmitted(false);
    setResult(null);
    setDraggedIdx(null);
    setDragOverIdx(null);
    setDraftLoaded(false);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
  };

  const checkLineIndent = (line: UserLine) => {
    // Header & Terminator utama wajib rata kiri (indent 0)
    if (
      line.id === "pl-1" ||
      line.id === "pl-deklarasi" ||
      line.id === "pl-mulai" ||
      line.id === "pl-9"
    ) {
      return line.currentIndent === 0;
    }
    // Deklarasi variabel: bisa rata kiri (0) atau menjorok di bawah DEKLARASI (1)
    if (line.id === "pl-var") {
      return line.currentIndent === 0 || line.currentIndent === 1;
    }
    // Statement utama di dalam blok algoritma MULAI: bisa rata kiri (0) atau 1 tingkat (1)
    if (
      line.id === "pl-2" ||
      line.id === "pl-3" ||
      line.id === "pl-6" ||
      line.id === "pl-8"
    ) {
      return line.currentIndent === 0 || line.currentIndent === 1;
    }
    // Statement di dalam percabangan JIKA & SELAIN ITU:
    // Menjorok 1 tingkat lebih dalam: bisa indent 1 (jika luar 0) atau indent 2 (jika luar 1)
    if (line.id === "pl-4" || line.id === "pl-5" || line.id === "pl-7") {
      return line.currentIndent === 1 || line.currentIndent === 2;
    }
    return line.currentIndent === line.expectedIndent;
  };

  const handleSubmit = () => {
    let correctOrderCount = 0;
    let correctIndentCount = 0;
    const total = lines.length;

    lines.forEach((line, idx) => {
      const isRightOrder = line.correctOrder === idx + 1;
      const isRightIndent = checkLineIndent(line);

      if (isRightOrder) correctOrderCount += 1;
      if (isRightOrder && isRightIndent) correctIndentCount += 1;
    });

    // Rubrik Skala 4 (Target TP 5: Minimal Skor 3 dari 4)
    let rubricScore = 1;
    if (correctIndentCount === total) {
      rubricScore = 4;
    } else if (correctOrderCount === total && correctIndentCount >= total - 2) {
      rubricScore = 3;
    } else if (correctOrderCount >= total - 3) {
      rubricScore = 2;
    } else {
      rubricScore = 1;
    }

    const percentage = Math.round((correctIndentCount / total) * 100);
    const isPass = rubricScore >= 3;

    setResult({
      correctOrderCount,
      correctIndentCount,
      rubricScore,
      percentage,
      isPass,
    });
    setSubmitted(true);

    if (isPass) {
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}
      onSuccess(percentage, rubricScore, lines);
    } else {
      onWrongAttempt();
    }
  };

  return (
    <div className="space-y-6">
      {/* Pengantar Masalah (PBL) */}
      <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-transparent p-5 rounded-2xl border border-blue-200/80">
        <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-1">
          <FileCode2 className="w-4 h-4 text-blue-600" />
          <span>Misi 5: Kode Kasir Kantin (Pseudocode Parson&apos;s Problem)</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Sebelum dikonversi ke kode komputer nyata, algoritma kasir ditulis dalam format
          <strong> Pseudocode (Kode Semu)</strong>. Urutkan baris-baris kode berikut (termasuk 
          <strong> Judul PROGRAM</strong>, <strong>DEKLARASI Variabel</strong>, dan <strong>Blok Algoritma MULAI-SELESAI</strong>) serta atur
          <strong> indentasi (ruang masuk)</strong> pada percabangan `JIKA-SELAIN ITU`.
        </p>
        <div className="mt-2 text-[11px] font-medium text-slate-500 flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-bold">
            Target Ketuntasan: Minimal Skor 3 dari Skala 4
          </span>
          <span>• 💡 <strong>Tips:</strong> Anda bisa <strong>Drag & Drop baris</strong> atau gunakan tombol panah & Tab.</span>
        </div>
      </div>

      {/* Notifikasi Pemulihan Draf */}
      {draftLoaded && !submitted && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Draf susunan pseudocode & indentasi sebelumnya dipulihkan otomatis dari memori HP.</span>
          </div>
          <button
            onClick={() => setDraftLoaded(false)}
            className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Code Editor Style View */}
      <div className="bg-slate-950 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-xl font-mono space-y-2 select-none">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="ml-2 font-bold text-slate-300">kasir_kantin.algo</span>
          </div>
          <span className="text-[11px] text-slate-500">Parson&apos;s Code Puzzle</span>
        </div>

        <div className="space-y-2 pt-2">
          {lines.map((line, idx) => {
            const isRightOrder = submitted && line.correctOrder === idx + 1;
            const isRightIndent = submitted && checkLineIndent(line);
            const isDragging = draggedIdx === idx;
            const isDragOver = dragOverIdx === idx && draggedIdx !== idx;

            return (
              <div
                key={line.id}
                data-line-index={idx}
                draggable={!submitted}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                onTouchStart={() => handleTouchStart(idx)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`flex items-center gap-2 p-2 rounded-xl transition-all ${
                  isDragging
                    ? "opacity-40 border border-dashed border-cyan-400 bg-cyan-950/40"
                    : isDragOver
                    ? "border-2 border-cyan-400 bg-cyan-950/60 shadow-md"
                    : submitted
                    ? isRightOrder && isRightIndent
                      ? "bg-emerald-950/70 border border-emerald-600 text-emerald-200"
                      : "bg-rose-950/70 border border-rose-600 text-rose-200"
                    : "bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 cursor-grab active:cursor-grabbing"
                }`}
              >
                {/* Grip Handle */}
                {!submitted && (
                  <div className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing px-0.5">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Line number */}
                <div className="w-5 text-right text-xs text-slate-500 select-none flex-shrink-0">
                  {idx + 1}
                </div>

                {/* Indented Text Area */}
                <div
                  style={{ paddingLeft: `${line.currentIndent * 24}px` }}
                  className="flex-1 text-xs sm:text-sm font-semibold truncate transition-all flex items-center gap-1.5"
                >
                  {line.currentIndent > 0 && (
                    <span className="text-slate-500 font-mono text-[11px] select-none flex items-center shrink-0">
                      {Array.from({ length: line.currentIndent - 1 }).map((_, i) => (
                        <span key={i} className="text-slate-600/80 mr-1 select-none">│ </span>
                      ))}
                      <span className="text-cyan-400 font-bold select-none">└──</span>
                    </span>
                  )}
                  <span>{line.text}</span>
                  {submitted && !isRightOrder && (
                    <span className="text-[10px] text-rose-400 font-normal ml-2">
                      (Urutan salah)
                    </span>
                  )}
                  {submitted && isRightOrder && !isRightIndent && (
                    <span className="text-[10px] text-amber-400 font-normal ml-2">
                      (Indentasi salah)
                    </span>
                  )}
                </div>

                {/* Mobile Friendly Controls */}
                {!submitted && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Indent Controls */}
                    <button
                      disabled={line.currentIndent === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        changeIndent(idx, -1);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-300 transition-colors cursor-pointer"
                      title="Geser Keluar (Kurangi Indent)"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={line.currentIndent >= 3}
                      onClick={(e) => {
                        e.stopPropagation();
                        changeIndent(idx, 1);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-300 transition-colors cursor-pointer"
                      title="Geser Masuk (Tambah Indent)"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Order Controls */}
                    <button
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLine(idx, "up")}
                      }
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-300 transition-colors cursor-pointer ml-1"
                      title="Naikkan Baris"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === lines.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLine(idx, "down");
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-300 transition-colors cursor-pointer"
                      title="Turunkan Baris"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hasil & Evaluasi */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          Perhatikan hirarki baris di dalam blok JIKA dan SELAIN ITU!
        </div>

        <div className="flex items-center gap-3">
          {submitted ? (
            result?.isPass ? (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold">
                  Pseudocode Sangat Runtut! Skor Rubrik: {result.rubricScore}/4 ({result.percentage}%)
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
                  <RotateCcw className="w-3.5 h-3.5" /> Susun Ulang
                </button>
              </div>
            )
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Validasi Pseudocode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
