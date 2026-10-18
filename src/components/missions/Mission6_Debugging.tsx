"use client";

import React, { useState, useEffect } from "react";
import { DEBUG_SCENARIOS, DebugScenario } from "@/data/storyData";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Bug,
  Table,
  Wrench,
  HelpCircle,
  Save,
} from "lucide-react";

interface Mission6Props {
  studentId?: string;
  onSuccess: (percentage: number, rubricScore: number, data: any) => void;
  onWrongAttempt: () => void;
}

export const Mission6_Debugging: React.FC<Mission6Props> = ({ studentId, onSuccess, onWrongAttempt }) => {
  const storageKey = `algocraft_draft_m6_${studentId || "default"}`;
  const [draftLoaded, setDraftLoaded] = useState(false);

  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  // Simpan baris yang dicurigai sebagai bug per skenario
  const [selectedLines, setSelectedLines] = useState<Record<string, number>>({});
  // Simpan opsi perbaikan yang dipilih per skenario
  const [selectedFixes, setSelectedFixes] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    correctLines: number;
    correctFixes: number;
    total: number;
    percentage: number;
    rubricScore: number;
    isPass: boolean;
  } | null>(null);

  // Pemulihan draf debugging dari memori HP
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          if (parsed.selectedLines) setSelectedLines(parsed.selectedLines);
          if (parsed.selectedFixes) setSelectedFixes(parsed.selectedFixes);
          if (typeof parsed.currentScenarioIndex === "number") {
            setCurrentScenarioIndex(parsed.currentScenarioIndex);
          }
          if (
            (parsed.selectedLines && Object.keys(parsed.selectedLines).length > 0) ||
            (parsed.selectedFixes && Object.keys(parsed.selectedFixes).length > 0)
          ) {
            setDraftLoaded(true);
          }
        }
      }
    } catch (e) {
      console.error("Error restoring Misi 6 draft:", e);
    }
  }, [storageKey]);

  // Simpan draf otomatis
  useEffect(() => {
    if (
      (Object.keys(selectedLines).length > 0 || Object.keys(selectedFixes).length > 0) &&
      !submitted
    ) {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ selectedLines, selectedFixes, currentScenarioIndex })
        );
      } catch (e) {
        console.error("Error saving Misi 6 draft:", e);
      }
    }
  }, [selectedLines, selectedFixes, currentScenarioIndex, storageKey, submitted]);

  const scenario = DEBUG_SCENARIOS[currentScenarioIndex];

  const handleSelectLine = (lineIdx: number) => {
    if (submitted) return;
    setSelectedLines((prev) => ({
      ...prev,
      [scenario.id]: lineIdx,
    }));
  };

  const handleSelectFix = (fixId: string) => {
    if (submitted) return;
    setSelectedFixes((prev) => ({
      ...prev,
      [scenario.id]: fixId,
    }));
  };

  const handleReset = () => {
    setSelectedLines({});
    setSelectedFixes({});
    setSubmitted(false);
    setResult(null);
    setDraftLoaded(false);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
  };

  const handleSubmit = () => {
    let correctLineCount = 0;
    let correctFixCount = 0;
    const total = DEBUG_SCENARIOS.length; // 2 skenario

    DEBUG_SCENARIOS.forEach((sc) => {
      const chosenLine = selectedLines[sc.id];
      const chosenFix = selectedFixes[sc.id];
      const correctFix = sc.optionsToFix.find((o) => o.isCorrect);

      if (chosenLine === sc.buggyLineIndex) {
        correctLineCount += 1;
      }
      if (chosenFix === correctFix?.id) {
        correctFixCount += 1;
      }
    });

    // Bobot: 40% menemukan letak bug + 60% memilih perbaikan yang tepat
    const percentage = Math.round(
      ((correctLineCount / total) * 0.4 + (correctFixCount / total) * 0.6) * 100
    );

    let rubricScore = 1;
    if (percentage === 100) rubricScore = 4;
    else if (percentage >= 75) rubricScore = 3;
    else if (percentage >= 50) rubricScore = 2;
    else rubricScore = 1;

    const isPass = percentage >= 75; // Kriteria TP 6: minimal 75%

    setResult({
      correctLines: correctLineCount,
      correctFixes: correctFixCount,
      total,
      percentage,
      rubricScore,
      isPass,
    });
    setSubmitted(true);

    if (isPass) {
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}
      onSuccess(percentage, rubricScore, { selectedLines, selectedFixes });
    } else {
      onWrongAttempt();
    }
  };

  const chosenLineIndex = selectedLines[scenario.id];
  const chosenFixId = selectedFixes[scenario.id];

  return (
    <div className="space-y-6">
      {/* Pengantar Masalah (PBL) */}
      <div className="bg-gradient-to-r from-rose-500/10 via-red-500/10 to-transparent p-5 rounded-2xl border border-rose-200/80">
        <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-1">
          <Bug className="w-4 h-4 text-rose-600" />
          <span>Misi 6: Perburuan Bug Kasir (Data Uji & Debugging)</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Kantin mengeluhkan sistem kasir mengalami malfungsi saat pembeli membawa saldo pas atau
          transaksi berdiskon. Telusuri <strong>Data Uji</strong>, temukan baris kode yang rusak,
          dan tentukan perbaikan yang paling akurat!
        </p>
        <div className="mt-2 text-[11px] font-medium text-slate-500 flex items-center gap-2">
          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-bold">
            Target Ketuntasan: Minimal 75% Ketepatan
          </span>
          <span>• Ketuk baris kode yang salah, lalu pilih perbaikan di bawahnya.</span>
        </div>
      </div>

      {/* Notifikasi Pemulihan Draf */}
      {draftLoaded && !submitted && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Draf analisis data uji & debugging sebelumnya dipulihkan otomatis dari memori HP.</span>
          </div>
          <button
            onClick={() => setDraftLoaded(false)}
            className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab Navigasi Kasus Uji */}
      <div className="flex gap-2">
        {DEBUG_SCENARIOS.map((sc, i) => (
          <button
            key={sc.id}
            onClick={() => setCurrentScenarioIndex(i)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentScenarioIndex === i
                ? "bg-rose-600 text-white shadow-md shadow-rose-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Kasus Uji #{i + 1}
          </button>
        ))}
      </div>

      {/* Tabel Data Uji vs Hasil Sistem */}
      <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-3">
          <Table className="w-4 h-4" />
          <span>Tabel Data Uji Kasus #{currentScenarioIndex + 1}: {scenario.title}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-sky-400">📥 Data Masukan Uji (Input):</span>
            <div className="font-mono text-slate-300">Menu: {scenario.testInput.namaMenu}</div>
            <div className="font-mono text-slate-300">Total Harga: Rp {scenario.testInput.hargaTotal.toLocaleString()}</div>
            <div className="font-mono text-slate-300">Saldo Kartu: Rp {scenario.testInput.saldoAwal.toLocaleString()}</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400">📤 Hasil Yang Seharusnya (Expected):</span>
            <div className="font-mono text-slate-300">Status: <span className="text-emerald-400 font-bold">{scenario.expectedOutput.status}</span></div>
            <div className="font-mono text-slate-300">Total Bayar: Rp {scenario.expectedOutput.bayar.toLocaleString()}</div>
            <div className="font-mono text-slate-300">Sisa Saldo: Rp {scenario.expectedOutput.saldoAkhir.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Code Viewer (Klik baris kode yang rusak) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Bug className="w-4 h-4 text-rose-500" />
            <span>Langkah 1: Ketuk baris kode yang dicurigai mengandung BUG:</span>
          </h3>
          {chosenLineIndex !== undefined && (
            <span className="text-xs text-rose-600 font-bold">
              Baris {chosenLineIndex + 1} dipilih
            </span>
          )}
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono space-y-1">
          {scenario.buggyCode.map((line, idx) => {
            const isSelected = chosenLineIndex === idx;
            const isActualBug = submitted && idx === scenario.buggyLineIndex;
            const isWrongGuess = submitted && isSelected && idx !== scenario.buggyLineIndex;

            return (
              <div
                key={idx}
                onClick={() => handleSelectLine(idx)}
                className={`px-3 py-2 rounded-xl text-xs cursor-pointer transition-all flex items-center justify-between ${
                  submitted
                    ? isActualBug
                      ? "bg-rose-950/80 border border-rose-500 text-rose-200 font-bold"
                      : isWrongGuess
                      ? "bg-slate-800 border border-slate-600 text-slate-400 opacity-60"
                      : "text-slate-400 opacity-40"
                    : isSelected
                    ? "bg-rose-900/60 border border-rose-500 text-rose-200 font-bold shadow-sm"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <span>{line}</span>
                {isSelected && !submitted && (
                  <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-sans">
                    Tandai Bug 🎯
                  </span>
                )}
                {submitted && isActualBug && (
                  <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-sans">
                    Letak Bug Ditemukan!
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pilihan Perbaikan Kode */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Wrench className="w-4 h-4 text-emerald-600" />
          <span>Langkah 2: Pilih instruksi perbaikan yang tepat:</span>
        </h3>

        <div className="space-y-2.5">
          {scenario.optionsToFix.map((opt) => {
            const isSelected = chosenFixId === opt.id;
            const isRight = submitted && opt.isCorrect;
            const isWrong = submitted && isSelected && !opt.isCorrect;

            return (
              <div
                key={opt.id}
                onClick={() => handleSelectFix(opt.id)}
                className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                  submitted
                    ? isRight
                      ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold"
                      : isWrong
                      ? "bg-rose-50 border-rose-300 text-rose-950"
                      : "bg-slate-50 border-slate-200 opacity-40"
                    : isSelected
                    ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200 text-emerald-950"
                    : "bg-slate-50 border-slate-200 hover:border-emerald-300 text-slate-800"
                }`}
              >
                <div className="font-semibold">{opt.text}</div>
                {submitted && (
                  <p className="text-[11px] mt-1.5 text-slate-600 italic">{opt.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hasil & Evaluasi */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          Kasus selesai dianalisis: {Object.keys(selectedFixes).length} dari {DEBUG_SCENARIOS.length}
        </div>

        <div className="flex items-center gap-3">
          {submitted ? (
            result?.isPass ? (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold">
                  Bug Terpecahkan! Nilai: {result.percentage}% (Skor Rubrik: {result.rubricScore}/4)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Nilai: {result?.percentage}% (Belum tuntas min 75%). -1 Nyawa.</span>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Ulangi Debug
                </button>
              </div>
            )
          ) : (
            <button
              disabled={
                Object.keys(selectedLines).length < DEBUG_SCENARIOS.length ||
                Object.keys(selectedFixes).length < DEBUG_SCENARIOS.length
              }
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Uji Perbaikan Kode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
