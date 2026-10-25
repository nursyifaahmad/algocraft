"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Trophy,
  Medal,
  Award,
  Coins,
  Zap,
  Maximize2,
  Minimize2,
  Users,
  CheckCircle2,
  Flame,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";

export interface StudentLeaderboardItem {
  id: string;
  name: string;
  absentNo: number;
  avatar?: string;
  xp: number;
  coins: number;
  currentLevel: number;
  isFinished: boolean;
  activeTab?: number;
  lastActiveAt?: string | Date;
  isOnline?: boolean;
  currentStage?: number;
  heartRedeems?: number;
  scores?: Array<{
    missionType: string;
    percentage: number;
    rubricScore: number;
  }>;
  badges?: Array<{
    badgeCode: string;
    title: string;
    icon: string;
  }>;
}

interface TeacherLeaderboardViewProps {
  students: StudentLeaderboardItem[];
  sessionCode: string;
  className?: string;
  sessionTitle?: string;
  isProjectorMode?: boolean;
  onProjectorModeChange?: (active: boolean) => void;
}

type SortCriteria = "xp" | "coins" | "progress";

export const TeacherLeaderboardView: React.FC<TeacherLeaderboardViewProps> = ({
  students,
  sessionCode,
  className = "X-5",
  sessionTitle,
  isProjectorMode: isProjectorModeProp,
  onProjectorModeChange,
}) => {
  const [sortBy, setSortBy] = useState<SortCriteria>("xp");
  const [isProjectorModeLocal, setIsProjectorModeLocal] = useState(false);

  const isProjector =
    isProjectorModeProp !== undefined ? isProjectorModeProp : isProjectorModeLocal;

  const setProjector = (active: boolean) => {
    setIsProjectorModeLocal(active);
    onProjectorModeChange?.(active);
  };

  // Masuk ke mode proyektor layar penuh (Native Fullscreen API)
  const enterFullscreen = async () => {
    setProjector(true);
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request error:", err);
    }
  };

  // Keluar dari mode proyektor layar penuh
  const exitFullscreen = async () => {
    setProjector(false);
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen exit error:", err);
    }
  };

  // Sinkronisasi state ketika user menekan ESC bawaan browser untuk keluar fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setProjector(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Tangkap tombol Escape sebagai fallback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isProjector) {
        exitFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProjector]);

  // Sorting list siswa berdasarkan kriteria
  const sortedStudents = useMemo(() => {
    if (!students || students.length === 0) return [];
    const list = [...students];

    return list.sort((a, b) => {
      if (sortBy === "xp") {
        if (b.xp !== a.xp) return b.xp - a.xp;
        if (b.coins !== a.coins) return b.coins - a.coins;
        return a.absentNo - b.absentNo;
      } else if (sortBy === "coins") {
        if (b.coins !== a.coins) return b.coins - a.coins;
        if (b.xp !== a.xp) return b.xp - a.xp;
        return a.absentNo - b.absentNo;
      } else {
        // progress: Misi selesai terbanyak / level tertinggi
        const aScoreCount = a.scores?.length || 0;
        const bScoreCount = b.scores?.length || 0;
        if (bScoreCount !== aScoreCount) return bScoreCount - aScoreCount;
        return b.xp - a.xp;
      }
    });
  }, [students, sortBy]);

  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];
  const remainingStudents = sortedStudents.slice(3);

  // Perhitungan statistik cepat
  const totalXP = useMemo(
    () => sortedStudents.reduce((acc, curr) => acc + (curr.xp || 0), 0),
    [sortedStudents]
  );
  const totalCoins = useMemo(
    () => sortedStudents.reduce((acc, curr) => acc + (curr.coins || 0), 0),
    [sortedStudents]
  );
  const totalBadgesEarned = useMemo(
    () => sortedStudents.reduce((acc, curr) => acc + (curr.badges?.length || 0), 0),
    [sortedStudents]
  );

  // Jika mode proyektor aktif, render secara eksklusif layout layar penuh tanpa navbar atau elemen dashboard lain
  if (isProjector) {
    return (
      <div className="fixed inset-0 z-[99999] min-h-screen w-screen bg-slate-950 text-white flex flex-col p-6 sm:p-10 overflow-y-auto">
        {/* Header Mode Proyektor */}
        <div className="flex items-center justify-between pb-4 pt-1 border-b border-slate-800 sticky top-0 bg-slate-950/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
              🏆
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Papan Peringkat Prestasi Pembelajaran
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                {sessionTitle || "PBL Algoritma Pemrograman: Kantin Digital Pintar"} • Kelas {className} • Sesi {sessionCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Urutan di Header Proyektor */}
            <div className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setSortBy("xp")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  sortBy === "xp" ? "bg-amber-500 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                XP Tertinggi
              </button>
              <button
                onClick={() => setSortBy("coins")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  sortBy === "coins" ? "bg-yellow-500 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                Koin Terbanyak
              </button>
              <button
                onClick={() => setSortBy("progress")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  sortBy === "progress" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                Misi Selesai
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Live Update Aktif</span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-400">Tekan ESC untuk keluar</span>
            </div>

            <button
              onClick={exitFullscreen}
              className="px-4 py-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-rose-500 transition-colors cursor-pointer shadow-md shadow-rose-950"
              title="Keluar dari Layar Penuh (Esc)"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Tutup Layar Penuh (Esc)</span>
            </button>
          </div>
        </div>

        {sortedStudents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-slate-500">
            <Trophy className="w-16 h-16 mx-auto mb-3 opacity-30 text-amber-400" />
            <p className="text-base font-bold text-slate-300">Belum ada murid yang bergabung pada sesi ini.</p>
            <p className="text-xs text-slate-500 mt-1">Siswa yang login akan otomatis muncul di papan peringkat ini secara live.</p>
          </div>
        ) : (
          <>
            {/* Konten Proyektor: Podium Raksasa */}
            <div className="my-8">
              <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto items-end pt-8">
                {/* Juara 2 (Perak) */}
                <div className="flex flex-col items-center">
                  {top2 && (
                    <>
                      <span className="text-4xl mb-2">🥈</span>
                      <div className="w-20 h-20 rounded-3xl bg-slate-700 p-1 mb-2 border-2 border-slate-400 shadow-xl">
                        <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-200">
                          {top2.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <p className="text-base sm:text-lg font-bold text-white text-center truncate max-w-[150px]">
                        {top2.name}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">Absen {top2.absentNo}</p>
                      <div className="mt-2 text-sm font-black text-slate-200 px-3 py-1 rounded-full bg-slate-800 border border-slate-600">
                        {top2.xp} XP
                      </div>
                      <div className="w-full h-28 sm:h-36 bg-gradient-to-t from-slate-900 to-slate-800 rounded-t-3xl mt-4 flex flex-col items-center justify-center border-t-4 border-slate-400">
                        <span className="text-3xl font-black text-slate-300">2</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Juara 1 (Emas) */}
                <div className="flex flex-col items-center -mt-8">
                  {top1 && (
                    <>
                      <span className="text-5xl mb-2 animate-bounce">👑</span>
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-200 p-1 mb-2 border-4 border-amber-300 shadow-2xl shadow-amber-500/40">
                        <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-3xl font-black text-amber-300">
                          {top1.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <p className="text-lg sm:text-xl font-extrabold text-amber-300 text-center truncate max-w-[180px]">
                        {top1.name}
                      </p>
                      <p className="text-xs text-amber-200 font-medium">Absen {top1.absentNo}</p>
                      <div className="mt-2 text-base font-black text-amber-300 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400 shadow-md">
                        {top1.xp} XP
                      </div>
                      <div className="w-full h-40 sm:h-48 bg-gradient-to-t from-amber-600 to-yellow-400 rounded-t-3xl mt-4 flex flex-col items-center justify-center text-slate-950 font-black shadow-xl">
                        <span className="text-4xl">1</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Juara 3 (Perunggu) */}
                <div className="flex flex-col items-center">
                  {top3 && (
                    <>
                      <span className="text-4xl mb-2">🥉</span>
                      <div className="w-20 h-20 rounded-3xl bg-amber-900 p-1 mb-2 border-2 border-amber-600 shadow-xl">
                        <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center text-2xl font-black text-amber-600">
                          {top3.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <p className="text-base sm:text-lg font-bold text-white text-center truncate max-w-[150px]">
                        {top3.name}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">Absen {top3.absentNo}</p>
                      <div className="mt-2 text-sm font-black text-amber-300 px-3 py-1 rounded-full bg-slate-800 border border-amber-800">
                        {top3.xp} XP
                      </div>
                      <div className="w-full h-24 sm:h-30 bg-gradient-to-t from-slate-900 to-amber-950 rounded-t-3xl mt-4 flex flex-col items-center justify-center border-t-4 border-amber-700">
                        <span className="text-3xl font-black text-amber-500">3</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Daftar Top Siswa Lainnya di Mode Proyektor */}
            <div className="max-w-4xl mx-auto w-full space-y-2 pb-10">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Peringkat Selanjutnya (Peringkat 4+)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {remainingStudents.map((student, idx) => {
                  const rank = idx + 4;
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-400 w-6">#{rank}</span>
                        <div>
                          <div className="text-sm font-bold text-white">{student.name}</div>
                          <div className="text-[11px] text-slate-400">
                            Absen {student.absentNo} • 🪙 {student.coins} Koin
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-indigo-400">{student.xp} XP</div>
                        <div className="text-[10px] text-emerald-400">
                          {student.isFinished ? "🏆 Tuntas" : `Misi ${student.scores?.length || 0}/6`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Bar Statistik Ringkas & Tombol Kontrol */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Total XP Kelas: {totalXP.toLocaleString()} XP</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-bold">
            <Coins className="w-4 h-4 text-yellow-600" />
            <span>Total Koin Pintar: {totalCoins}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
            <Award className="w-4 h-4 text-purple-600" />
            <span>Lencana Terbuka: {totalBadgesEarned}</span>
          </div>
        </div>

        {/* Filter Urutan & Tombol Proyektor */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 pl-2 pr-1">Urutkan:</span>
            <button
              onClick={() => setSortBy("xp")}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                sortBy === "xp"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              XP Tertinggi
            </button>
            <button
              onClick={() => setSortBy("coins")}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                sortBy === "coins"
                  ? "bg-yellow-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Koin Terbanyak
            </button>
            <button
              onClick={() => setSortBy("progress")}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                sortBy === "progress"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Misi Selesai
            </button>
          </div>

          <button
            onClick={enterFullscreen}
            className="px-3.5 py-2 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-slate-900/20 transition-all cursor-pointer"
            title="Buka tampilan layar penuh (Fullscreen) untuk proyektor kelas"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Mode Proyektor (Layar Penuh)</span>
          </button>
        </div>
      </div>

      {/* Podium 3 Besar (Top 3 Pedestal) */}
      {sortedStudents.length > 0 && (
        <div className="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden break-inside-avoid print:break-inside-avoid">
          {/* Latar Belakang Estetik */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

          <div className="relative z-10 text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Peringkat Teratas Sesi {sessionCode}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Podium Bintang Algoritma
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Siswa dengan akumulasi XP dan prestasi terbaik pada pemecahan masalah kantin digital
            </p>
          </div>

          {/* Kolom Podium (2nd - 1st - 3rd) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 max-w-3xl mx-auto items-end pt-4 pb-2">
            {/* Juara 2 (Perak) */}
            <div className="flex flex-col items-center">
              {top2 ? (
                <>
                  <div className="relative mb-2 flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl mb-1">🥈</span>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 p-0.5 shadow-lg shadow-slate-500/20">
                      <div className="w-full h-full bg-slate-800 rounded-2xl flex items-center justify-center text-lg sm:text-xl font-black text-slate-200">
                        {top2.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    {top2.isOnline && (
                      <span className="absolute bottom-0 right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-white text-center truncate max-w-[90px] sm:max-w-[140px]">
                    {top2.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">Absen {top2.absentNo}</p>

                  <div className="mt-2 text-center">
                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-600 text-slate-200 text-xs font-black">
                      {top2.xp} XP
                    </div>
                    <div className="text-[10px] text-yellow-400 font-semibold mt-0.5">
                      🪙 {top2.coins} • {top2.scores?.length || 0}/6 Misi
                    </div>
                  </div>

                  {/* Blok Podium 2 */}
                  <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-slate-800 to-slate-700/80 rounded-t-2xl mt-3 flex flex-col items-center justify-center border-t-2 border-slate-400 shadow-inner">
                    <span className="text-2xl sm:text-3xl font-black text-slate-300">2</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Perak
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-500 text-xs italic py-8">
                  Belum ada juara 2
                </div>
              )}
            </div>

            {/* Juara 1 (Emas - Tertinggi & Terpusat) */}
            <div className="flex flex-col items-center -mt-6">
              {top1 ? (
                <>
                  <div className="relative mb-2 flex flex-col items-center">
                    <span className="text-3xl sm:text-4xl animate-bounce mb-1">👑</span>
                    <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 p-1 shadow-xl shadow-amber-500/30">
                      <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black text-amber-300">
                        {top1.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    {top1.isOnline && (
                      <span className="absolute bottom-0 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                    )}
                  </div>

                  <p className="text-sm sm:text-base font-extrabold text-amber-300 text-center truncate max-w-[110px] sm:max-w-[170px]">
                    {top1.name}
                  </p>
                  <p className="text-xs text-amber-200/80 font-medium">Absen {top1.absentNo}</p>

                  <div className="mt-2 text-center">
                    <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-sm font-black shadow-xs">
                      {top1.xp} XP
                    </div>
                    <div className="text-xs text-yellow-300 font-semibold mt-1">
                      🪙 {top1.coins} • {top1.scores?.length || 0}/6 Misi
                    </div>
                  </div>

                  {/* Blok Podium 1 */}
                  <div className="w-full h-32 sm:h-38 bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400 rounded-t-2xl mt-3 flex flex-col items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
                    <span className="text-3xl sm:text-4xl">1</span>
                    <span className="text-xs uppercase font-extrabold tracking-wider">
                      Emas Juara
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-500 text-xs italic py-8">
                  Belum ada peserta
                </div>
              )}
            </div>

            {/* Juara 3 (Perunggu) */}
            <div className="flex flex-col items-center">
              {top3 ? (
                <>
                  <div className="relative mb-2 flex flex-col items-center">
                    <span className="text-2xl sm:text-3xl mb-1">🥉</span>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-800 to-amber-600 p-0.5 shadow-lg shadow-amber-900/30">
                      <div className="w-full h-full bg-slate-800 rounded-2xl flex items-center justify-center text-lg sm:text-xl font-black text-amber-600">
                        {top3.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    {top3.isOnline && (
                      <span className="absolute bottom-0 right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-white text-center truncate max-w-[90px] sm:max-w-[140px]">
                    {top3.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">Absen {top3.absentNo}</p>

                  <div className="mt-2 text-center">
                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-amber-800/80 text-amber-300 text-xs font-black">
                      {top3.xp} XP
                    </div>
                    <div className="text-[10px] text-yellow-400 font-semibold mt-0.5">
                      🪙 {top3.coins} • {top3.scores?.length || 0}/6 Misi
                    </div>
                  </div>

                  {/* Blok Podium 3 */}
                  <div className="w-full h-20 sm:h-24 bg-gradient-to-t from-slate-800 to-amber-950/80 rounded-t-2xl mt-3 flex flex-col items-center justify-center border-t-2 border-amber-700 shadow-inner">
                    <span className="text-2xl sm:text-3xl font-black text-amber-500">3</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600/80">
                      Perunggu
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-500 text-xs italic py-8">
                  Belum ada juara 3
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabel Lengkap Peringkat Siswa (Peringkat 1 s.d. N) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Daftar Peringkat Lengkap Siswa (Kelas {className})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Diperbarui secara langsung (live update) seiring siswa menyelesaikan misi pembelajaran.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Total Siswa Terdaftar: {sortedStudents.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-y border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 text-center w-16">Peringkat</th>
                <th className="py-3 px-3">Nama Siswa</th>
                <th className="py-3 px-3 text-center">Status / Misi</th>
                <th className="py-3 px-3 text-right">Total XP</th>
                <th className="py-3 px-3 text-center">Koin</th>
                <th className="py-3 px-3">Lencana Prestasi</th>
                <th className="py-3 px-3 text-center">Rerata Rubrik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    Belum ada siswa yang bergabung pada sesi ini.
                  </td>
                </tr>
              ) : (
                sortedStudents.map((student, index) => {
                  const rank = index + 1;
                  const rubrics = (student.scores || [])
                    .map((s) => s.rubricScore)
                    .filter((r) => r > 0);
                  const avgRubric =
                    rubrics.length > 0
                      ? (rubrics.reduce((a, b) => a + b, 0) / rubrics.length).toFixed(1)
                      : "-";

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/70 transition-colors break-inside-avoid print:break-inside-avoid ${
                        rank <= 3 ? "bg-amber-50/20" : ""
                      }`}
                    >
                      {/* Peringkat */}
                      <td className="py-3 px-3 text-center">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black text-sm">
                            🥇
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-black text-sm">
                            🥈
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-200/60 text-amber-900 font-black text-sm">
                            🥉
                          </span>
                        ) : (
                          <span className="font-bold text-slate-500 text-sm">#{rank}</span>
                        )}
                      </td>

                      {/* Nama Siswa & Presensi */}
                      <td className="py-3 px-3 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              student.isOnline
                                ? "bg-emerald-500 ring-2 ring-emerald-200 shadow-xs"
                                : "bg-slate-300"
                            }`}
                            title={student.isOnline ? "Online (Aktif)" : "Offline"}
                          />
                          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">
                            Absen {student.absentNo}
                          </span>
                          <span className="truncate max-w-[160px] sm:max-w-none">
                            {student.name}
                          </span>
                        </div>
                      </td>

                      {/* Status / Misi */}
                      <td className="py-3 px-3 text-center">
                        {student.isFinished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Tuntas (6/6)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Misi {student.scores?.length || 0}/6 Selesai
                          </span>
                        )}
                      </td>

                      {/* Total XP */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-black text-indigo-700 text-sm">
                          {student.xp.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">XP</span>
                        </div>
                      </td>

                      {/* Koin */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-yellow-50 text-yellow-800 border border-yellow-200">
                          🪙 {student.coins}
                        </span>
                      </td>

                      {/* Lencana */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {student.badges && student.badges.length > 0 ? (
                            student.badges.map((b, bi) => (
                              <span
                                key={bi}
                                title={b.title}
                                className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 text-sm hover:scale-125 transition-transform cursor-help"
                              >
                                {b.icon}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Belum ada</span>
                          )}
                        </div>
                      </td>

                      {/* Rerata Rubrik */}
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {avgRubric}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
