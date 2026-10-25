"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Users,
  Target,
  Award,
  Download,
  Printer,
  Plus,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  HelpCircle,
  RotateCcw,
  AlertTriangle,
  Trophy,
  Database,
} from "lucide-react";
import { clearAllStudentStorage } from "@/lib/storage";
import { TeacherLeaderboardView } from "@/components/TeacherLeaderboardView";

export default function TeacherDashboardPage() {
  const router = useRouter();

  const [teacher, setTeacher] = useState<any>(null);
  const [sessionCode, setSessionCode] = useState<string>("X5-KANTIN");
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isBackgroundFetching, setIsBackgroundFetching] = useState(false);
  const [activeTab, setActiveTab] = useState<"matrix" | "leaderboard">("matrix");
  const [isProjectorMode, setIsProjectorMode] = useState(false);

  // Modal Buat Sesi Baru
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newClass, setNewClass] = useState("X-5");
  const [creating, setCreating] = useState(false);

  // Modal Reset Sesi
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");

  // Modal Muat Data Responden Dummy
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("algocraft_teacher");
    if (!stored) {
      router.push("/teacher/login");
      return;
    }
    setTeacher(JSON.parse(stored));
  }, [router]);

  const fetchStats = async (isBackground = false) => {
    if (!sessionCode) return;
    if (isBackground) {
      setIsBackgroundFetching(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(`/api/teacher/stats?sessionCode=${encodeURIComponent(sessionCode)}`);
      const data = await res.json();
      if (!data.error) {
        setStatsData(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Error stats:", err);
    } finally {
      if (isBackground) {
        setIsBackgroundFetching(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (sessionCode) {
      fetchStats(false);
    }
  }, [sessionCode]);

  // Live Update: Polling setiap 3.5 detik jika sesi aktif & tab browser sedang terlihat
  useEffect(() => {
    if (!sessionCode || !isLive) return;

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchStats(true);
      }
    }, 3500);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchStats(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sessionCode, isLive]);

  // Sinkronisasi status layar penuh dengan mode proyektor
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsProjectorMode(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("algocraft_teacher");
    router.push("/");
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle) return;

    setCreating(true);
    try {
      const res = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode,
          title: newTitle,
          className: newClass,
          teacherId: teacher?.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSessionCode(data.session.code);
        setShowCreateModal(false);
        setNewCode("");
        setNewTitle("");
      } else {
        alert(data.error || "Gagal membuat sesi.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleResetSession = async () => {
    if (!sessionCode) return;
    setResetting(true);
    setResetSuccessMsg("");

    try {
      const res = await fetch("/api/session/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowResetModal(false);
        setResetSuccessMsg(data.message || `Sesi ${sessionCode} berhasil di-reset.`);
        clearAllStudentStorage();
        fetchStats();
        setTimeout(() => setResetSuccessMsg(""), 6000);
      } else {
        alert(data.error || "Gagal mereset sesi.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setResetting(false);
    }
  };

  const handleSeedDummy = async () => {
    if (!sessionCode) return;
    setSeeding(true);
    setSeedSuccessMsg("");

    try {
      const res = await fetch("/api/teacher/seed-dummy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowSeedModal(false);
        setSeedSuccessMsg(`Berhasil memuat ${data.totalStudents} data responden siswa ke sesi ${sessionCode}!`);
        await fetchStats(false);
        setTimeout(() => setSeedSuccessMsg(""), 6000);
      } else {
        alert(data.error || "Gagal memuat data responden.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleExportCSV = () => {
    if (!statsData || !statsData.students) return;

    const headers = [
      "No Absen",
      "Nama Siswa",
      "Status Online",
      "Tahap Saat Ini",
      "XP",
      "Koin",
      "TP1_IPO (%)",
      "TP1_Rubrik",
      "TP2_ALGO (%)",
      "TP2_Rubrik",
      "TP3_BRANCH (%)",
      "TP3_Rubrik",
      "TP4_FLOWCHART (%)",
      "TP4_Rubrik",
      "TP5_PSEUDO (%)",
      "TP5_Rubrik",
      "TP6_DEBUG (%)",
      "TP6_Rubrik",
      "Rata-rata Rubrik",
      "Jumlah Tebus Nyawa",
      "Status Ketuntasan",
    ];

    const rows = statsData.students.map((student: any) => {
      const getScore = (mType: string) =>
        student.scores.find((s: any) => s.missionType === mType);

      const s1 = getScore("TP1_IPO");
      const s2 = getScore("TP2_ALGO");
      const s3 = getScore("TP3_BRANCH");
      const s4 = getScore("TP4_FLOWCHART");
      const s5 = getScore("TP5_PSEUDO");
      const s6 = getScore("TP6_DEBUG");

      const rubrics = [s1, s2, s3, s4, s5, s6]
        .map((s) => s?.rubricScore || 0)
        .filter((r) => r > 0);

      const avgRubric =
        rubrics.length > 0
          ? (rubrics.reduce((a, b) => a + b, 0) / rubrics.length).toFixed(2)
          : "0";

      const isCompletedAll = rubrics.length === 6 && rubrics.every((r) => r >= 3);
      const stageText = student.isFinished
        ? "Tuntas (6/6)"
        : `TP ${student.currentStage || 1}`;

      return [
        student.absentNo,
        `"${student.name}"`,
        student.isOnline ? "Online" : "Offline",
        stageText,
        student.xp,
        student.coins,
        s1 ? s1.percentage : 0,
        s1 ? s1.rubricScore : 0,
        s2 ? s2.percentage : 0,
        s2 ? s2.rubricScore : 0,
        s3 ? s3.percentage : 0,
        s3 ? s3.rubricScore : 0,
        s4 ? s4.percentage : 0,
        s4 ? s4.rubricScore : 0,
        s5 ? s5.percentage : 0,
        s5 ? s5.rubricScore : 0,
        s6 ? s6.percentage : 0,
        s6 ? s6.rubricScore : 0,
        avgRubric,
        student.heartRedeems || 0,
        isCompletedAll ? "TUNTAS" : "BELUM TUNTAS",
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Nilai_PBL_${sessionCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={`min-h-screen font-sans ${
        isProjectorMode
          ? "bg-slate-950 text-white p-0 m-0 overflow-x-hidden"
          : "bg-slate-100 text-slate-800 pb-16 print:pb-0 print:bg-white"
      }`}
    >
      {/* Stylesheet Cetak PDF & Print Resmi */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page {
            size: landscape;
            margin: 8mm 10mm;
          }

          *,
          *::before,
          *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          html, body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
          }

          main {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }

          .break-inside-avoid,
          .print-avoid-break,
          tr,
          td,
          th {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          thead {
            display: table-header-group !important;
          }

          tbody {
            display: table-row-group !important;
          }

          .shadow-xs,
          .shadow-sm,
          .shadow-md,
          .shadow-lg,
          .shadow-xl {
            box-shadow: none !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
        }
      `}} />

      {/* Top Header - Sembunyikan sepenuhnya saat Mode Proyektor Layar Penuh aktif */}
      {!isProjectorMode && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-900 leading-none">
                  Dashboard Asesmen Guru
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pengajar: <span className="font-semibold text-indigo-700">{teacher?.name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Live Update Toggle Button */}
              <button
                onClick={() => setIsLive((prev) => !prev)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isLive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-xs"
                    : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
                }`}
                title={
                  isLive
                    ? "Live Update Aktif (Data diperbarui otomatis setiap 3.5 detik). Klik untuk menjeda."
                    : "Live Update Dijeda. Klik untuk mengaktifkan kembali."
                }
              >
                <span className="relative flex h-2 w-2">
                  {isLive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isLive ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                  ></span>
                </span>
                <span>{isLive ? "Live: Aktif" : "Live: Jeda"}</span>
              </button>

              {/* Session Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500">Sesi:</span>
                <input
                  type="text"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  className="w-28 text-xs font-mono font-bold text-indigo-700 bg-transparent uppercase focus:outline-hidden"
                />
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Sesi Baru</span>
              </button>

              <button
                onClick={() => setShowSeedModal(true)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Muat 46 data responden siswa autentik untuk simulasi/uji coba"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Muat Data Responden (46)</span>
              </button>

              <button
                onClick={() => setShowResetModal(true)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Reset Seluruh Data Murid & Nilai pada Sesi Ini"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>Reset Sesi</span>
              </button>

              <button
                onClick={() => fetchStats(false)}
                title="Perbarui Data Manual"
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading || isBackgroundFetching ? "animate-spin text-indigo-600" : ""}`} />
              </button>

              <button
                onClick={handleLogout}
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition-colors cursor-pointer ml-1"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Container */}
      <main
        className={
          isProjectorMode
            ? "w-full min-h-screen p-0 m-0"
            : "max-w-7xl mx-auto px-4 sm:px-6 pt-6 print:pt-2 print:px-0 space-y-6 print:space-y-3"
        }
      >
        {/* Banner Sukses Reset Sesi */}
        {!isProjectorMode && resetSuccessMsg && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-fade-in print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{resetSuccessMsg}</span>
            </div>
            <button
              onClick={() => setResetSuccessMsg("")}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Banner Sukses Muat Data Responden */}
        {!isProjectorMode && seedSuccessMsg && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-fade-in print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{seedSuccessMsg}</span>
            </div>
            <button
              onClick={() => setSeedSuccessMsg("")}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Banner Info Sesi */}
        {!isProjectorMode && (
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 print:p-4 rounded-3xl print:rounded-2xl shadow-md print:shadow-none flex flex-wrap items-center justify-between gap-4 break-inside-avoid print:break-inside-avoid">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 print:py-0.5 rounded-full bg-white/10 text-indigo-300 text-xs print:text-[10px] font-semibold mb-2 print:mb-1">
                <span>Sesi Kelas: {statsData?.session?.code || sessionCode}</span>
                <span>•</span>
                <span>Kelas {statsData?.session?.className || "X-5"}</span>
              </div>
              <h2 className="text-xl sm:text-2xl print:text-lg font-black">
                {statsData?.session?.title || "PBL Algoritma Pemrograman: Kantin Digital Pintar"}
              </h2>
              <p className="text-xs print:text-[10px] text-slate-300 mt-1">
                Rekapitulasi Capaian 6 Indikator Tujuan Pembelajaran Problem Based Learning
              </p>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Ekspor Excel/CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Laporan</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Switcher: Matriks Asesmen vs Leaderboard Kelas */}
        {!isProjectorMode && (
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 print:hidden">
            <button
              onClick={() => setActiveTab("matrix")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "matrix"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Matriks Asesmen & Nilai Otentik</span>
            </button>

            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "leaderboard"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Papan Peringkat (Leaderboard Kelas)</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === "leaderboard"
                    ? "bg-white/20 text-white"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {statsData?.students?.length || 0}
              </span>
            </button>
          </div>
        )}

        {/* Konten Tab 1: Matriks Asesmen & Analitik IKTP */}
        {!isProjectorMode && activeTab === "matrix" && (
          <div className="space-y-6 print:space-y-3">
            {/* 6 TP Indicator Analytic Cards */}
            <div className="break-inside-avoid print:break-inside-avoid">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 print:mb-1.5 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Ketercapaian 6 Indikator Tujuan Pembelajaran (IKTP)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 gap-4 print:gap-2">
                {statsData?.tpAnalytics?.map((tp: any) => {
                  const isPassing = tp.passRate >= 75;
                  return (
                    <div
                      key={tp.code}
                      className="bg-white p-5 print:p-2.5 rounded-2xl print:rounded-xl border border-slate-200 shadow-xs print:shadow-none flex flex-col justify-between space-y-3 print:space-y-1.5 break-inside-avoid print:break-inside-avoid"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono font-bold text-indigo-700 px-2 py-0.5 bg-indigo-50 rounded-md">
                            {tp.code}
                          </span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                              isPassing
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {tp.passRate}% Tuntas
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">{tp.title}</h4>
                        <p className="text-[11px] print:text-[10px] text-slate-500 mt-1">{tp.targetKriteria}</p>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1 pt-2 print:pt-1 border-t border-slate-100 text-xs">
                        <div className="flex items-center justify-between text-[11px] print:text-[10px] text-slate-600">
                          <span>Siswa Tuntas:</span>
                          <span className="font-bold">
                            {tp.passedCount} dari {statsData.totalStudents} siswa
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${tp.passRate}%` }}
                            className={`h-full rounded-full ${
                              isPassing ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] print:text-[9px] text-slate-400 pt-0.5">
                          <span>Rerata Persen: {tp.avgPercentage}%</span>
                          <span>Rerata Rubrik: {tp.avgRubric}/4</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ringkasan Distribusi Tahap Siswa Saat Ini (Live Monitoring) */}
            <div className="bg-white rounded-3xl print:rounded-2xl border border-slate-200 shadow-xs print:shadow-none p-5 sm:p-6 print:p-3 space-y-3 print:space-y-1.5 break-inside-avoid print:break-inside-avoid">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5 print:hidden">
                    {isLive && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        isLive ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    ></span>
                  </span>
                  <h3 className="text-sm font-bold text-slate-800">
                    Distribusi Pengerjaan Misi di Kelas (Live Tracking)
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {lastUpdated && (
                    <span>
                      Update: <span className="font-mono font-bold text-indigo-700">{lastUpdated.toLocaleTimeString("id-ID")}</span>
                    </span>
                  )}
                  {isBackgroundFetching && (
                    <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin print:hidden" />
                  )}
                </div>
              </div>

              {/* Cards Distribusi Tiap Tahap */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 print:grid-cols-7 gap-2.5 print:gap-1.5 pt-1">
                {[
                  {
                    id: 1,
                    name: "TP 1",
                    title: "IPO",
                    count: statsData?.stageDistribution?.tp1 || 0,
                    color: "border-sky-200 bg-sky-50 text-sky-800",
                  },
                  {
                    id: 2,
                    name: "TP 2",
                    title: "Algo",
                    count: statsData?.stageDistribution?.tp2 || 0,
                    color: "border-indigo-200 bg-indigo-50 text-indigo-800",
                  },
                  {
                    id: 3,
                    name: "TP 3",
                    title: "Cabang",
                    count: statsData?.stageDistribution?.tp3 || 0,
                    color: "border-purple-200 bg-purple-50 text-purple-800",
                  },
                  {
                    id: 4,
                    name: "TP 4",
                    title: "Flowchart",
                    count: statsData?.stageDistribution?.tp4 || 0,
                    color: "border-amber-200 bg-amber-50 text-amber-800",
                  },
                  {
                    id: 5,
                    name: "TP 5",
                    title: "Pseudo",
                    count: statsData?.stageDistribution?.tp5 || 0,
                    color: "border-teal-200 bg-teal-50 text-teal-800",
                  },
                  {
                    id: 6,
                    name: "TP 6",
                    title: "Debug",
                    count: statsData?.stageDistribution?.tp6 || 0,
                    color: "border-rose-200 bg-rose-50 text-rose-800",
                  },
                  {
                    id: 7,
                    name: "Selesai",
                    title: "Tuntas 6/6",
                    count: statsData?.stageDistribution?.finished || 0,
                    color: "border-emerald-200 bg-emerald-50 text-emerald-800",
                  },
                ].map((stage) => (
                  <div
                    key={stage.id}
                    className={`p-2.5 print:p-1.5 rounded-2xl print:rounded-xl border text-center transition-all ${stage.color} break-inside-avoid print:break-inside-avoid`}
                  >
                    <div className="text-[10px] print:text-[8px] font-semibold opacity-80">
                      {stage.name} - {stage.title}
                    </div>
                    <div className="text-xl print:text-base font-black mt-0.5">
                      {stage.count}{" "}
                      <span className="text-[11px] print:text-[8px] font-medium opacity-75">siswa</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

        {/* Tabel Rekapitulasi Nilai Siswa (Rubrik Skala 4 & Persentase) */}
        <div className="bg-white rounded-3xl print:rounded-2xl border border-slate-200 shadow-sm print:shadow-none overflow-hidden space-y-4 print:space-y-2 p-5 sm:p-6 print:p-3.5 print:mt-3 break-inside-avoid print:break-inside-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Matriks Penilaian Otentik Siswa (Kelas X-5)</span>
              </h3>
              <p className="text-xs print:text-[10px] text-slate-500 mt-0.5">
                Nilai terkonversi otomatis ke Skala 4 dan Persentase sesuai rubrik asesmen.
              </p>
            </div>
            <div className="text-xs print:text-[10px] font-semibold text-slate-500">
              Total Siswa Terdaftar: {statsData?.totalStudents || 0}
            </div>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-xs print:text-[10px] border-collapse">
              <thead className="print:table-header-group">
                <tr className="bg-slate-50 text-slate-600 border-y border-slate-200 font-bold uppercase tracking-wider text-[10px] print:text-[9px]">
                  <th className="py-3 print:py-1.5 px-3 print:px-1.5">No</th>
                  <th className="py-3 print:py-1.5 px-3 print:px-1.5">Nama Siswa</th>
                  <th className="py-3 print:py-1.5 px-2 print:px-1 text-center">Tahap Saat Ini</th>
                  <th className="py-3 print:py-1.5 px-2 print:px-1 text-center">TP 1 (IPO)</th>
                  <th className="py-3 print:py-1.5 px-2 print:px-1 text-center">TP 2 (Algo)</th>
                  <th className="py-3 print:py-1.5 px-2 print:px-1 text-center">TP 3 (Cabang)</th>
                  <th className="py-3 print:py-1.5 px-2 print:px-1 text-center">TP 4 (Flowchart)</th>
                  <th className="py-3 print:py-1.5 px-2 print:px-1 text-center">TP 5 (Pseudo)</th>
                  <th className="py-3 print:py-1.5 px-2 print:px-1 text-center">TP 6 (Debug)</th>
                  <th className="py-3 print:py-1.5 px-3 print:px-1.5 text-center">Rerata Rubrik</th>
                  <th className="py-3 print:py-1.5 px-3 print:px-1.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:table-row-group">
                {statsData?.students?.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-400 italic">
                      Belum ada siswa yang bergabung pada sesi ini. Minta siswa memasukkan kode sesi:{" "}
                      <strong>{sessionCode}</strong>
                    </td>
                  </tr>
                ) : (
                  statsData?.students?.map((student: any) => {
                    const getScore = (mType: string) =>
                      student.scores.find((s: any) => s.missionType === mType);

                    const s1 = getScore("TP1_IPO");
                    const s2 = getScore("TP2_ALGO");
                    const s3 = getScore("TP3_BRANCH");
                    const s4 = getScore("TP4_FLOWCHART");
                    const s5 = getScore("TP5_PSEUDO");
                    const s6 = getScore("TP6_DEBUG");

                    const scores = [s1, s2, s3, s4, s5, s6];
                    const rubrics = scores
                      .map((s) => s?.rubricScore || 0)
                      .filter((r) => r > 0);

                    const avgRubric =
                      rubrics.length > 0
                        ? (rubrics.reduce((a, b) => a + b, 0) / rubrics.length).toFixed(1)
                        : "-";

                    const isAllPassed =
                      rubrics.length === 6 &&
                      scores.every(
                        (s) => s && (s.percentage >= 75 || s.rubricScore >= 3)
                      );

                    const currentStage = student.currentStage || 1;

                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-slate-50/70 transition-colors break-inside-avoid print:break-inside-avoid"
                      >
                        <td className="py-3 print:py-1.5 px-3 print:px-1.5 font-mono font-bold text-slate-500">
                          #{student.absentNo}
                        </td>
                        <td className="py-3 print:py-1.5 px-3 print:px-1.5 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 print:hidden ${
                                student.isOnline
                                  ? "bg-emerald-500 ring-2 ring-emerald-200 shadow-xs"
                                  : "bg-slate-300"
                              }`}
                              title={
                                student.isOnline
                                  ? "Online (Aktif dalam 45 detik terakhir)"
                                  : "Offline"
                              }
                            />
                            <span className="truncate max-w-[150px] sm:max-w-none print:max-w-none print:text-[10px]">
                              {student.name}
                            </span>
                          </div>
                        </td>

                        {/* Tahap Saat Ini */}
                        <td className="py-3 print:py-1.5 px-2 print:px-1 text-center">
                          {student.isFinished ? (
                            <span className="inline-flex items-center gap-1 px-2.5 print:px-1.5 py-0.5 rounded-full text-[10px] print:text-[8px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              🏆 Tuntas (6/6)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 print:px-1.5 py-0.5 rounded-full text-[10px] print:text-[8px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse print:hidden"></span>
                              Misi TP {currentStage}
                            </span>
                          )}
                        </td>

                        {/* TP 1 */}
                        <td className="py-3 print:py-1.5 px-2 print:px-1 text-center">
                          {s1 ? (
                            <span className="inline-block px-1.5 print:px-1 py-0.5 rounded-md font-semibold text-slate-700 print:text-[9px]">
                              {s1.percentage}% ({s1.rubricScore})
                            </span>
                          ) : currentStage === 1 && !student.isFinished ? (
                            <span className="inline-flex items-center gap-0.5 px-2 print:px-1 py-0.5 rounded-md text-[10px] print:text-[8px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                              ⚡ Aktif
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* TP 2 */}
                        <td className="py-3 print:py-1.5 px-2 print:px-1 text-center">
                          {s2 ? (
                            <span className="inline-block px-1.5 print:px-1 py-0.5 rounded-md font-semibold text-slate-700 print:text-[9px]">
                              Skor {s2.rubricScore}/4
                            </span>
                          ) : currentStage === 2 && !student.isFinished ? (
                            <span className="inline-flex items-center gap-0.5 px-2 print:px-1 py-0.5 rounded-md text-[10px] print:text-[8px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                              ⚡ Aktif
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* TP 3 */}
                        <td className="py-3 print:py-1.5 px-2 print:px-1 text-center">
                          {s3 ? (
                            <span className="inline-block px-1.5 print:px-1 py-0.5 rounded-md font-semibold text-slate-700 print:text-[9px]">
                              {s3.percentage}% ({s3.rubricScore})
                            </span>
                          ) : currentStage === 3 && !student.isFinished ? (
                            <span className="inline-flex items-center gap-0.5 px-2 print:px-1 py-0.5 rounded-md text-[10px] print:text-[8px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                              ⚡ Aktif
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* TP 4 */}
                        <td className="py-3 print:py-1.5 px-2 print:px-1 text-center">
                          {s4 ? (
                            <span className="inline-block px-1.5 print:px-1 py-0.5 rounded-md font-semibold text-slate-700 print:text-[9px]">
                              Skor {s4.rubricScore}/4
                            </span>
                          ) : currentStage === 4 && !student.isFinished ? (
                            <span className="inline-flex items-center gap-0.5 px-2 print:px-1 py-0.5 rounded-md text-[10px] print:text-[8px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                              ⚡ Aktif
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* TP 5 */}
                        <td className="py-3 print:py-1.5 px-2 print:px-1 text-center">
                          {s5 ? (
                            <span className="inline-block px-1.5 print:px-1 py-0.5 rounded-md font-semibold text-slate-700 print:text-[9px]">
                              Skor {s5.rubricScore}/4
                            </span>
                          ) : currentStage === 5 && !student.isFinished ? (
                            <span className="inline-flex items-center gap-0.5 px-2 print:px-1 py-0.5 rounded-md text-[10px] print:text-[8px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                              ⚡ Aktif
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* TP 6 */}
                        <td className="py-3 print:py-1.5 px-2 print:px-1 text-center">
                          {s6 ? (
                            <span className="inline-block px-1.5 print:px-1 py-0.5 rounded-md font-semibold text-slate-700 print:text-[9px]">
                              {s6.percentage}% ({s6.rubricScore})
                            </span>
                          ) : currentStage === 6 && !student.isFinished ? (
                            <span className="inline-flex items-center gap-0.5 px-2 print:px-1 py-0.5 rounded-md text-[10px] print:text-[8px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                              ⚡ Aktif
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Rerata Rubrik */}
                        <td className="py-3 print:py-1.5 px-3 print:px-1.5 text-center font-bold text-indigo-700 print:text-[9px]">
                          {avgRubric}
                        </td>

                        {/* Status & Catatan Tebus Nyawa */}
                        <td className="py-3 print:py-1.5 px-3 print:px-1.5 text-center">
                          <div className="flex flex-col items-center gap-1 print:gap-0.5">
                            {isAllPassed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 print:px-1.5 py-0.5 rounded-full text-[10px] print:text-[8px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 print:w-2.5 print:h-2.5" /> Tuntas
                              </span>
                            ) : rubrics.length > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 print:px-1.5 py-0.5 rounded-full text-[10px] print:text-[8px] font-bold bg-amber-100 text-amber-800">
                                Proses
                              </span>
                            ) : (
                              <span className="text-slate-300 text-[11px] print:text-[9px]">Belum Mulai</span>
                            )}

                            {student.heartRedeems > 0 && (
                              <span
                                className="inline-flex items-center gap-0.5 px-2 print:px-1 py-0.2 rounded-md text-[9px] print:text-[7px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                                title={`Siswa melakukan ${student.heartRedeems} kali tebus/pemulihan nyawa`}
                              >
                                💔 {student.heartRedeems}x
                              </span>
                            )}
                          </div>
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
    )}

    {/* Konten Tab 2: Papan Peringkat (Leaderboard Kelas) */}
    {activeTab === "leaderboard" && (
      <TeacherLeaderboardView
        students={statsData?.students || []}
        sessionCode={sessionCode}
        className={statsData?.session?.className || "X-5"}
        sessionTitle={statsData?.session?.title}
        isProjectorMode={isProjectorMode}
        onProjectorModeChange={setIsProjectorMode}
      />
    )}
  </main>

      {/* Modal Buat Sesi Baru */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Buat Sesi Kelas Pembelajaran Baru</h3>
            <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Kode Sesi (Unik):</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: X5-KANTIN-2"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold uppercase text-indigo-700"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Judul Pembelajaran:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PBL Algoritma Kantin Pintar - Sesi 2"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Kelas:</label>
                <input
                  type="text"
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-200 cursor-pointer"
                >
                  {creating ? "Membuat..." : "Simpan Sesi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Reset Sesi */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                Konfirmasi Reset Sesi Kelas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tindakan ini akan <strong>menghapus seluruh data murid, nilai asesmen (TP 1 - TP 6), dan riwayat pengerjaan</strong> pada sesi:
              </p>
              <div className="inline-block font-mono font-bold text-xs text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                {sessionCode}
              </div>
              <p className="text-[11px] text-slate-500">
                Sesi kelas ini akan kembali kosong (0 murid) dan siap digunakan untuk putaran pembelajaran baru.
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-0.5">
              <span className="font-bold">⚠️ Perhatian Pengajar:</span>
              <p className="text-amber-800">
                Pastikan Anda telah mengekspor nilai (Excel/CSV) atau mencetak laporan jika data sebelumnya masih diperlukan.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={resetting}
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={handleResetSession}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-200 flex items-center gap-1.5 cursor-pointer"
              >
                {resetting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mereset Data...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ya, Reset Sesi Ini</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Muat Data Responden Dummy */}
      {showSeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Database className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                Muat 46 Data Responden Siswa
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tindakan ini akan memasukkan data <strong>46 siswa riil</strong> beserta hasil penilaian 6 indikator PBL (IPO, Algoritma, Percabangan, Flowchart, Pseudocode, Debugging) ke sesi:
              </p>
              <div className="inline-block font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                {sessionCode}
              </div>
              <p className="text-[11px] text-slate-500">
                Data mencakup siswa yang tuntas dengan skor sempurna, siswa dalam proses, maupun yang belum mulai.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-0.5">
              <span className="font-bold">✨ Simulasi Pembelajaran:</span>
              <p className="text-emerald-800">
                Siswa dapat langsung login via portal murid (/play) menggunakan nomor absen 1 s.d. 46.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={seeding}
                onClick={() => setShowSeedModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={seeding}
                onClick={handleSeedDummy}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-200 flex items-center gap-1.5 cursor-pointer"
              >
                {seeding ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memuat 46 Siswa...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ya, Muat Data Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
