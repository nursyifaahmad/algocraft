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
} from "lucide-react";

export default function TeacherDashboardPage() {
  const router = useRouter();

  const [teacher, setTeacher] = useState<any>(null);
  const [sessionCode, setSessionCode] = useState<string>("X5-KANTIN");
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal Buat Sesi Baru
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newClass, setNewClass] = useState("X-5");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("algocraft_teacher");
    if (!stored) {
      router.push("/teacher/login");
      return;
    }
    setTeacher(JSON.parse(stored));
  }, [router]);

  const fetchStats = () => {
    if (!sessionCode) return;
    setLoading(true);
    fetch(`/api/teacher/stats?sessionCode=${encodeURIComponent(sessionCode)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setStatsData(data);
        }
      })
      .catch((err) => console.error("Error stats:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (sessionCode) {
      fetchStats();
    }
  }, [sessionCode]);

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

  const handleExportCSV = () => {
    if (!statsData || !statsData.students) return;

    const headers = [
      "No Absen",
      "Nama Siswa",
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

      return [
        student.absentNo,
        `"${student.name}"`,
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
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-16">
      {/* Top Header */}
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
              onClick={fetchStats}
              title="Perbarui Data"
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
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

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Banner Info Sesi */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-md flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold mb-2">
              <span>Sesi Kelas: {statsData?.session?.code || sessionCode}</span>
              <span>•</span>
              <span>Kelas {statsData?.session?.className || "X-5"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              {statsData?.session?.title || "PBL Algoritma Pemrograman: Kantin Digital Pintar"}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
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

        {/* 6 TP Indicator Analytic Cards */}
        <div>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Ketercapaian 6 Indikator Tujuan Pembelajaran (IKTP)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statsData?.tpAnalytics?.map((tp: any) => {
              const isPassing = tp.passRate >= 75;
              return (
                <div
                  key={tp.code}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
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
                    <p className="text-[11px] text-slate-500 mt-1">{tp.targetKriteria}</p>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
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
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Rerata Persen: {tp.avgPercentage}%</span>
                      <span>Rerata Rubrik: {tp.avgRubric}/4</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabel Rekapitulasi Nilai Siswa (Rubrik Skala 4 & Persentase) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Matriks Penilaian Otentik Siswa (Kelas X-5)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nilai terkonversi otomatis ke Skala 4 dan Persentase sesuai rubrik asesmen.
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Total Siswa Terdaftar: {statsData?.totalStudents || 0}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-y border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">No</th>
                  <th className="py-3 px-3">Nama Siswa</th>
                  <th className="py-3 px-2 text-center">TP 1 (IPO)</th>
                  <th className="py-3 px-2 text-center">TP 2 (Algo)</th>
                  <th className="py-3 px-2 text-center">TP 3 (Cabang)</th>
                  <th className="py-3 px-2 text-center">TP 4 (Flowchart)</th>
                  <th className="py-3 px-2 text-center">TP 5 (Pseudo)</th>
                  <th className="py-3 px-2 text-center">TP 6 (Debug)</th>
                  <th className="py-3 px-3 text-center">Rerata Rubrik</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statsData?.students?.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 italic">
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

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-500">
                          #{student.absentNo}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">
                          {student.name}
                        </td>

                        {/* TP 1 */}
                        <td className="py-3 px-2 text-center">
                          {s1 ? (
                            <span className="font-semibold text-slate-700">
                              {s1.percentage}% ({s1.rubricScore})
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* TP 2 */}
                        <td className="py-3 px-2 text-center">
                          {s2 ? (
                            <span className="font-semibold text-slate-700">
                              Skor {s2.rubricScore}/4
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* TP 3 */}
                        <td className="py-3 px-2 text-center">
                          {s3 ? (
                            <span className="font-semibold text-slate-700">
                              {s3.percentage}% ({s3.rubricScore})
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* TP 4 */}
                        <td className="py-3 px-2 text-center">
                          {s4 ? (
                            <span className="font-semibold text-slate-700">
                              Skor {s4.rubricScore}/4
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* TP 5 */}
                        <td className="py-3 px-2 text-center">
                          {s5 ? (
                            <span className="font-semibold text-slate-700">
                              Skor {s5.rubricScore}/4
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* TP 6 */}
                        <td className="py-3 px-2 text-center">
                          {s6 ? (
                            <span className="font-semibold text-slate-700">
                              {s6.percentage}% ({s6.rubricScore})
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Rerata Rubrik */}
                        <td className="py-3 px-3 text-center font-bold text-indigo-700">
                          {avgRubric}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          {isAllPassed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Tuntas
                            </span>
                          ) : rubrics.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Proses
                            </span>
                          ) : (
                            <span className="text-slate-300 text-[11px]">Belum Mulai</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
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
    </div>
  );
}
