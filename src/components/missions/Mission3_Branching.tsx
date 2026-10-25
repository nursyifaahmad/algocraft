"use client";

import React, { useState, useEffect } from "react";
import { BRANCHING_DATA } from "@/data/storyData";
import { CheckCircle2, AlertCircle, ArrowRight, RotateCcw, GitBranch, Play, Terminal, Save } from "lucide-react";

interface Mission3Props {
  studentId?: string;
  onSuccess: (percentage: number, rubricScore: number, data: any) => void;
  onWrongAttempt: () => void;
}

export const Mission3_Branching: React.FC<Mission3Props> = ({ studentId, onSuccess, onWrongAttempt }) => {
  const storageKey = `algocraft_draft_m3_${studentId || "default"}`;
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Pilihan siswa per kasus percabangan
  const [selectedConditions, setSelectedConditions] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    correctCount: number;
    total: number;
    percentage: number;
    rubricScore: number;
    isPass: boolean;
  } | null>(null);

  // Simulasi Interaktif Kasus 1
  const [simBelanja, setSimBelanja] = useState<number>(35000);
  const [simJam, setSimJam] = useState<string>("istirahat_1");

  // Pemulihan draf pengerjaan
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          setSelectedConditions(parsed);
          setDraftLoaded(true);
        }
      }
    } catch (e) {
      console.error("Error restoring Misi 3 draft:", e);
    }
  }, [storageKey]);

  // Simpan draf otomatis
  useEffect(() => {
    if (Object.keys(selectedConditions).length > 0 && !submitted) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(selectedConditions));
      } catch (e) {
        console.error("Error saving Misi 3 draft:", e);
      }
    }
  }, [selectedConditions, storageKey, submitted]);

  const handleSelect = (caseId: string, condId: string) => {
    if (submitted) return;
    setSelectedConditions((prev) => ({
      ...prev,
      [caseId]: condId,
    }));
  };

  const handleReset = () => {
    setSelectedConditions({});
    setSubmitted(false);
    setResult(null);
    setDraftLoaded(false);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
  };

  const handleSubmit = () => {
    let correctCount = 0;
    const total = BRANCHING_DATA.length; // 2 kasus

    BRANCHING_DATA.forEach((bCase) => {
      const selectedId = selectedConditions[bCase.id];
      const correctCond = bCase.conditions.find((c) => c.isCorrect);
      if (selectedId === correctCond?.id) {
        correctCount += 1;
      }
    });

    const percentage = Math.round((correctCount / total) * 100);
    let rubricScore = 1;
    if (percentage === 100) rubricScore = 4;
    else if (percentage >= 75) rubricScore = 3;
    else if (percentage >= 50) rubricScore = 2;
    else rubricScore = 1;

    const isPass = percentage >= 75;

    setResult({
      correctCount,
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
      onSuccess(percentage, rubricScore, selectedConditions);
    } else {
      onWrongAttempt();
    }
  };

  // Kalkulasi simulator Kasus 1 secara live
  const isCondMet = simBelanja >= 30000 && simJam === "istirahat_1";
  const calculatedDiskon = isCondMet ? 0.15 * simBelanja : 0;
  const calculatedTotal = simBelanja - calculatedDiskon;

  return (
    <div className="space-y-6">
      {/* Pengantar Masalah (PBL) */}
      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-transparent p-5 rounded-2xl border border-purple-200/80">
        <div className="flex items-center gap-2 text-purple-800 font-bold text-sm mb-1">
          <GitBranch className="w-4 h-4 text-purple-600" />
          <span>Misi 3: Diskon & Validasi Saldo (Logika Percabangan IF-ELSE)</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Sistem kasir kantin perlu mengambil keputusan secara otomatis: kapan diskon 15% harus
          diberikan, dan bagaimana memvalidasi apakah saldo kartu siswa cukup untuk membayar.
        </p>
        <div className="mt-2 text-[11px] font-medium text-slate-500 flex items-center gap-2">
          <span>💡 <strong>Petunjuk:</strong> Analisis skenario dan pilih struktur percabangan yang tepat.</span>
        </div>
      </div>

      {/* Notifikasi Pemulihan Draf */}
      {draftLoaded && !submitted && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Draf pilihan logika percabangan sebelumnya dipulihkan otomatis dari memori HP.</span>
          </div>
          <button
            onClick={() => setDraftLoaded(false)}
            className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Simulator Interaktif Cepat */}
      <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
            <Terminal className="w-4 h-4" />
            <span>Simulasi Uji Percabangan Diskon Kasir:</span>
          </div>
          <span className="text-[10px] text-slate-400">Uji coba logika secara live</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Input Total Belanja (Rp):</label>
            <input
              type="number"
              step="5000"
              value={simBelanja}
              onChange={(e) => setSimBelanja(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Waktu Transaksi:</label>
            <select
              value={simJam}
              onChange={(e) => setSimJam(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono"
            >
              <option value="istirahat_1">Jam Istirahat 1 (10:00 - 10:30)</option>
              <option value="istirahat_2">Jam Istirahat 2 (12:00 - 12:45)</option>
              <option value="pulang">Jam Pulang Sekolah</option>
            </select>
          </div>
        </div>

        {/* Hasil Evaluasi Kondisi Live */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="font-mono">
            <span className="text-slate-400">Kondisi: </span>
            <span className={isCondMet ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {isCondMet ? "TRUE (Memenuhi Syarat)" : "FALSE (Tidak Memenuhi)"}
            </span>
          </div>
          <div className="font-mono text-slate-300">
            Potongan Diskon: <span className="text-amber-400 font-bold">Rp {calculatedDiskon.toLocaleString()}</span> |
            Bayar: <span className="text-cyan-400 font-bold">Rp {calculatedTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Daftar Kasus Percabangan */}
      <div className="space-y-6">
        {BRANCHING_DATA.map((bCase, idx) => {
          return (
            <div
              key={bCase.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </span>
                <h3 className="text-sm font-bold text-slate-800">{bCase.title}</h3>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                <strong>Permasalahan:</strong> {bCase.problem}
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-slate-500">
                  Pilih struktur percabangan yang paling tepat:
                </p>

                {bCase.conditions.map((cond) => {
                  const isSelected = selectedConditions[bCase.id] === cond.id;
                  const isRight = submitted && cond.isCorrect;
                  const isWrong = submitted && isSelected && !cond.isCorrect;

                  return (
                    <div
                      key={cond.id}
                      onClick={() => handleSelect(bCase.id, cond.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        submitted
                          ? isRight
                            ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold"
                            : isWrong
                            ? "bg-rose-50 border-rose-300 text-rose-950"
                            : "bg-slate-50 border-slate-200 opacity-50"
                          : isSelected
                          ? "bg-purple-50 border-purple-400 ring-2 ring-purple-200"
                          : "bg-white border-slate-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="font-mono text-xs text-purple-950 font-bold mb-1">
                        {cond.label}
                      </div>
                      <div className="text-[11px] text-slate-600 pl-4 border-l-2 border-slate-300 space-y-0.5">
                        <div>THEN: {cond.actionThen}</div>
                        <div>ELSE: {cond.actionElse}</div>
                      </div>
                      {submitted && isRight && (
                        <div className="text-[10px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pilihan Logika Tepat
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hasil & Aksi */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          Kasus terjawab: {Object.keys(selectedConditions).length} dari {BRANCHING_DATA.length}
        </div>

        <div className="flex items-center gap-3">
          {submitted ? (
            result?.isPass ? (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold">
                  Logika Sempurna! Nilai: {result.percentage}% (Skor Rubrik: {result.rubricScore}/4)
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
                  <RotateCcw className="w-3.5 h-3.5" /> Coba Lagi
                </button>
              </div>
            )
          ) : (
            <button
              disabled={Object.keys(selectedConditions).length < BRANCHING_DATA.length}
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-md shadow-purple-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Uji Keputusan Logika</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
