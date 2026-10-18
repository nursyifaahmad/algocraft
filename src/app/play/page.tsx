"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeartBar } from "@/components/HeartBar";
import { BadgeModal } from "@/components/BadgeModal";
import { LeaderboardModal } from "@/components/LeaderboardModal";
import { HintModal } from "@/components/HintModal";
import { fireSuccessConfetti } from "@/components/ui/Confetti";
import { Mission1_IPO } from "@/components/missions/Mission1_IPO";
import { Mission2_Algorithm } from "@/components/missions/Mission2_Algorithm";
import { Mission3_Branching } from "@/components/missions/Mission3_Branching";
import { Mission4_Flowchart } from "@/components/missions/Mission4_Flowchart";
import { Mission5_Pseudocode } from "@/components/missions/Mission5_Pseudocode";
import { Mission6_Debugging } from "@/components/missions/Mission6_Debugging";
import {
  Trophy,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  LogOut,
  HelpCircle,
  Award,
  Wifi,
  WifiOff,
  Database,
  ShieldCheck,
} from "lucide-react";

function PlayGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentIdParam = searchParams.get("studentId");

  const [student, setStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<number>(1); // 1 sampai 6
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Modals
  const [showBadges, setShowBadges] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Waktu pengerjaan misi (detik)
  const [timeSpent, setTimeSpent] = useState<number>(0);

  // Deteksi status koneksi internet browser
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    let currentId = studentIdParam;

    // 1. Pemulihan Persisten: Jika param studentId hilang (misal HP restart atau browser reload)
    if (!currentId) {
      try {
        const storedId = localStorage.getItem("algocraft_student_id");
        if (storedId) {
          currentId = storedId;
        } else {
          const session = localStorage.getItem("algocraft_student_session");
          if (session) {
            const parsed = JSON.parse(session);
            if (parsed?.studentId) {
              currentId = parsed.studentId;
            }
          }
        }
      } catch (e) {
        console.error("Storage error:", e);
      }
    }

    if (!currentId) {
      router.push("/");
      return;
    }

    // Jika URL belum memiliki studentId tapi kita temukan di localStorage, perbarui URL
    if (!studentIdParam && currentId) {
      router.replace(`/play?studentId=${currentId}`);
    }

    // 2. Pemulihan Instan dari Cache Lokal (Offline First)
    try {
      const cached = localStorage.getItem(`algocraft_student_cache_${currentId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.id) {
          setStudent(parsed);
          const savedTab = localStorage.getItem(`algocraft_active_tab_${currentId}`);
          if (savedTab) {
            const tabNum = parseInt(savedTab, 10);
            if (!isNaN(tabNum) && tabNum >= 1 && tabNum <= 6) {
              setActiveTab(tabNum);
            } else {
              setActiveTab(parsed.currentLevel || 1);
            }
          } else {
            setActiveTab(parsed.currentLevel || 1);
          }
          setLoading(false);
        }
      }
    } catch (e) {
      console.error("Error reading cache:", e);
    }

    // 3. Sinkronisasi Data Terbaru dari Server API
    fetch(`/api/student/state?studentId=${currentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data dari server");
        return res.json();
      })
      .then((data) => {
        if (data.student) {
          setStudent(data.student);
          setIsOffline(false);

          // Simpan ke storage lokal
          try {
            localStorage.setItem(`algocraft_student_cache_${currentId}`, JSON.stringify(data.student));
            localStorage.setItem("algocraft_student_id", data.student.id);

            const savedTab = localStorage.getItem(`algocraft_active_tab_${currentId}`);
            if (savedTab) {
              const tabNum = parseInt(savedTab, 10);
              if (!isNaN(tabNum) && tabNum >= 1 && tabNum <= 6) {
                setActiveTab(tabNum);
              } else {
                setActiveTab(data.student.currentLevel || 1);
              }
            } else {
              setActiveTab(data.student.currentLevel || 1);
            }
          } catch (e) {
            console.error("Error updating local cache:", e);
          }
        } else {
          router.push("/");
        }
      })
      .catch((err) => {
        console.warn("Koneksi offline atau server tidak merespons, menggunakan data lokal:", err);
        setIsOffline(true);
      })
      .finally(() => setLoading(false));
  }, [studentIdParam, router]);

  // Timer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTabChange = (tabNum: number) => {
    setActiveTab(tabNum);
    setTimeSpent(0);
    if (student?.id) {
      try {
        localStorage.setItem(`algocraft_active_tab_${student.id}`, tabNum.toString());
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleWrongAttempt = async () => {
    if (!student) return;
    try {
      const res = await fetch("/api/student/heart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, action: "decrease" }),
      });
      const data = await res.json();
      const updatedHearts = data.hearts ?? Math.max(0, (student.hearts || 3) - 1);
      const updatedStudent = { ...student, hearts: updatedHearts };
      setStudent(updatedStudent);
      try {
        localStorage.setItem(`algocraft_student_cache_${student.id}`, JSON.stringify(updatedStudent));
      } catch (e) {}
    } catch (e) {
      console.warn("Offline error during heart decrease:", e);
      // Fallback offline lokal
      const updatedStudent = { ...student, hearts: Math.max(0, (student.hearts || 3) - 1) };
      setStudent(updatedStudent);
      try {
        localStorage.setItem(`algocraft_student_cache_${student.id}`, JSON.stringify(updatedStudent));
      } catch (err) {}
    }
  };

  const handleDeductCoins = async (amount: number): Promise<boolean> => {
    if (!student) return false;
    if (student.coins < amount) return false;

    try {
      const res = await fetch("/api/student/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, cost: amount }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedStudent = { ...student, coins: data.coins };
        setStudent(updatedStudent);
        try {
          localStorage.setItem(`algocraft_student_cache_${student.id}`, JSON.stringify(updatedStudent));
        } catch (e) {}
        return true;
      }
      return false;
    } catch (e) {
      console.warn("Offline hint deduction fallback:", e);
      // Fallback offline
      const updatedStudent = { ...student, coins: Math.max(0, student.coins - amount) };
      setStudent(updatedStudent);
      try {
        localStorage.setItem(`algocraft_student_cache_${student.id}`, JSON.stringify(updatedStudent));
      } catch (err) {}
      return true;
    }
  };

  const handleMissionSuccess = async (
    percentage: number,
    rubricScore: number,
    submissionData: any
  ) => {
    if (!student) return;

    const missionMap: Record<number, string> = {
      1: "TP1_IPO",
      2: "TP2_ALGO",
      3: "TP3_BRANCH",
      4: "TP4_FLOWCHART",
      5: "TP5_PSEUDO",
      6: "TP6_DEBUG",
    };

    const missionType = missionMap[activeTab];

    try {
      const res = await fetch("/api/student/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          missionType,
          percentage,
          rubricScore,
          submissionData,
          timeSpent,
        }),
      });

      const data = await res.json();
      if (data.success) {
        fireSuccessConfetti();
        setStudent(data.student);
        try {
          localStorage.setItem(`algocraft_student_cache_${student.id}`, JSON.stringify(data.student));
        } catch (e) {}

        // Jika berhasil dan bukan misi terakhir, buka tab berikutnya
        if (data.isPassing && activeTab < 6) {
          const nextTab = activeTab + 1;
          setTimeout(() => {
            handleTabChange(nextTab);
          }, 1800);
        }
      }
    } catch (e) {
      console.warn("Server submission offline error, updating offline state:", e);
      fireSuccessConfetti();
      const nextLevel = Math.max(student.currentLevel, activeTab + 1);
      const isFinished = activeTab === 6 && percentage >= 75;
      const updatedStudent = {
        ...student,
        xp: (student.xp || 0) + 150,
        coins: (student.coins || 0) + 20,
        currentLevel: nextLevel,
        isFinished,
      };
      setStudent(updatedStudent);
      try {
        localStorage.setItem(`algocraft_student_cache_${student.id}`, JSON.stringify(updatedStudent));
      } catch (err) {}

      if (activeTab < 6) {
        setTimeout(() => {
          handleTabChange(activeTab + 1);
        }, 1800);
      }
    }
  };

  if (loading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Menyiapkan Ruang Belajar AlgoCraft...</p>
        </div>
      </div>
    );
  }

  // Teks Petunjuk Dinamis berdasarkan Misi
  const hintTexts: Record<number, { hint1: string; hint2: string }> = {
    1: {
      hint1: "Input adalah semua data yang dimasukkan oleh pembeli atau sensor kartu RFID. Proses adalah perhitungan harga dan kondisi saldo. Output adalah struk dan informasi pada layar.",
      hint2: "Kartu Pelajar & Pilihan Menu = INPUT. Hitung Subtotal & Pengurangan = PROSES. Struk Antrean = OUTPUT.",
    },
    2: {
      hint1: "Pikirkan urutan alami ketika kamu membeli makanan di kantin: Mulai -> Pilih Menu -> Hitung Harga -> Tempel Kartu -> Verifikasi -> Potong Saldo -> Selesai.",
      hint2: "Langkah 1 pasti MULAI, langkah 2 membaca pesanan, dan langkah 7 pasti SELESAI.",
    },
    3: {
      hint1: "Gunakan operator AND jika kedua syarat (belanja >= 30000 dan jam istirahat pertama) harus terjadi bersamaan.",
      hint2: "Kasus 1: Pilihan dengan operator AND adalah jawaban yang tepat. Kasus 2: Pastikan menggunakan >= agar saldo yang pas tidak ditolak.",
    },
    4: {
      hint1: "Bentuk Oval (Terminator) digunakan untuk MULAI dan SELESAI. Bentuk Belah Ketupat (Decision) digunakan untuk percabangan dengan panah Ya/Tidak.",
      hint2: "Pastikan menghubungkan: MULAI -> INPUT -> DECISION -> OUTPUT BERHASIL (Cabang Ya) -> SELESAI.",
    },
    5: {
      hint1: "Baris di dalam percabangan JIKA harus di-indentasi (menjorok ke dalam 1 tab). Jangan lupa akhiri dengan AKHIR JIKA.",
      hint2: "Baris sisa_saldo dan TULIS Pembayaran Berhasil harus memiliki indentasi 1 tingkat di bawah JIKA.",
    },
    6: {
      hint1: "Perhatikan operator perbandingan pada baris pengecekan saldo: apakah menggunakan > atau >=?",
      hint2: "Baris ke-3 salah karena operator > menolak pembeli dengan saldo Rp25.000 untuk tagihan Rp25.000.",
    },
  };

  const currentHints = hintTexts[activeTab] || {
    hint1: "Baca instruksi misi dengan teliti.",
    hint2: "Gunakan nalar logis pemecahan masalah.",
  };

  const missionTabs = [
    { num: 1, label: "TP 1: IPO", title: "Input-Proses-Output" },
    { num: 2, label: "TP 2: Algoritma", title: "Langkah Alur" },
    { num: 3, label: "TP 3: Cabang", title: "Logika IF-ELSE" },
    { num: 4, label: "TP 4: Flowchart", title: "Bagan Alir" },
    { num: 5, label: "TP 5: Pseudocode", title: "Kode Semu" },
    { num: 6, label: "TP 6: Debugging", title: "Data Uji & Bug" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/30 text-slate-800 pb-16 font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-200">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-tight text-slate-900 leading-none">
                  AlgoCraft PBL
                </h1>
                {/* Indikator Penyimpanan Lokal Persisten */}
                <div
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold"
                  title="Data progres misi tersimpan persisten di HP/browser ini"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Tersimpan di HP</span>
                </div>
                {isOffline && (
                  <div
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-semibold"
                    title="Koneksi terputus, data tersimpan secara lokal"
                  >
                    <WifiOff className="w-3 h-3 text-amber-600" />
                    <span>Mode Offline</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                Sesi: <span className="text-indigo-600 font-bold">{student.session?.code}</span> •
                Absen #{student.absentNo} ({student.name})
              </p>
            </div>
          </div>

          {/* Gamification HeartBar */}
          <HeartBar
            hearts={student.hearts}
            xp={student.xp}
            coins={student.coins}
            currentLevel={student.currentLevel}
            onOpenBadges={() => setShowBadges(true)}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenHint={() => setShowHint(true)}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Offline Warning Banner jika jaringan putus */}
        {isOffline && (
          <div className="bg-amber-500/10 border border-amber-300 text-amber-900 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Koneksi internet bermasalah.</strong> Jangan khawatir! Misi tetap dapat dikerjakan, draf dan progres kamu tersimpan otomatis di perangkat ini.
              </span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-bold shrink-0 hover:bg-amber-700 cursor-pointer"
            >
              Coba Sambung Ulang
            </button>
          </div>
        )}

        {/* Mission Level Navigation Tabs (Responsive Scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {missionTabs.map((tab) => {
            const isUnlocked = tab.num <= student.currentLevel;
            const isActive = activeTab === tab.num;
            const scoreForTab = student.scores?.find(
              (s: any) =>
                s.missionType ===
                ["TP1_IPO", "TP2_ALGO", "TP3_BRANCH", "TP4_FLOWCHART", "TP5_PSEUDO", "TP6_DEBUG"][
                  tab.num - 1
                ]
            );
            const isPassed = scoreForTab && (scoreForTab.percentage >= 75 || scoreForTab.rubricScore >= 3);

            return (
              <button
                key={tab.num}
                disabled={!isUnlocked}
                onClick={() => handleTabChange(tab.num)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md shadow-slate-300 scale-102 ring-2 ring-indigo-500"
                    : isUnlocked
                    ? "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 opacity-60"
                }`}
              >
                <span>{tab.label}</span>
                {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
            );
          })}
        </div>

        {/* Mission Container Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
          {activeTab === 1 && (
            <Mission1_IPO
              studentId={student.id}
              onSuccess={handleMissionSuccess}
              onWrongAttempt={handleWrongAttempt}
            />
          )}
          {activeTab === 2 && (
            <Mission2_Algorithm
              studentId={student.id}
              onSuccess={handleMissionSuccess}
              onWrongAttempt={handleWrongAttempt}
            />
          )}
          {activeTab === 3 && (
            <Mission3_Branching
              studentId={student.id}
              onSuccess={handleMissionSuccess}
              onWrongAttempt={handleWrongAttempt}
            />
          )}
          {activeTab === 4 && (
            <Mission4_Flowchart
              studentId={student.id}
              onSuccess={handleMissionSuccess}
              onWrongAttempt={handleWrongAttempt}
            />
          )}
          {activeTab === 5 && (
            <Mission5_Pseudocode
              studentId={student.id}
              onSuccess={handleMissionSuccess}
              onWrongAttempt={handleWrongAttempt}
            />
          )}
          {activeTab === 6 && (
            <Mission6_Debugging
              studentId={student.id}
              onSuccess={handleMissionSuccess}
              onWrongAttempt={handleWrongAttempt}
            />
          )}
        </div>

        {/* Selesai Semua Misi: Celebratory Card */}
        {student.isFinished && (
          <div className="p-6 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 rounded-3xl text-slate-950 font-bold shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🏆</span>
              <div>
                <h3 className="text-base sm:text-lg">
                  Selamat, {student.name}! Kamu Menyelesaikan Seluruh 6 Misi PBL!
                </h3>
                <p className="text-xs text-slate-900/80 mt-0.5">
                  Lencana &quot;Grandmaster Kantin Pintar&quot; telah ditambahkan ke profilmu.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBadges(true)}
              className="px-5 py-2.5 bg-slate-950 text-white rounded-2xl text-xs font-bold hover:bg-slate-900 transition-colors shadow-md cursor-pointer"
            >
              Lihat Koleksi Lencana
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <BadgeModal
        isOpen={showBadges}
        onClose={() => setShowBadges(false)}
        earnedBadges={student.badges || []}
      />
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        sessionCode={student.session?.code}
        currentStudentId={student.id}
      />
      <HintModal
        isOpen={showHint}
        onClose={() => setShowHint(false)}
        coins={student.coins}
        onDeductCoins={handleDeductCoins}
        hintLevel1Text={currentHints.hint1}
        hintLevel2Text={currentHints.hint2}
      />
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
          Memuat AlgoCraft...
        </div>
      }
    >
      <PlayGameContent />
    </Suspense>
  );
}
