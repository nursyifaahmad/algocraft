"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Target,
  Gamepad2,
  ArrowRight,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
} from "lucide-react";

import { GamificationRulesModal } from "@/components/GamificationRulesModal";
import { clearAllStudentStorage } from "@/lib/storage";

const AVATARS = [
  { id: "avatar-1", icon: "🤖", label: "Cyber Robot" },
  { id: "avatar-2", icon: "👨‍🍳", label: "Master Chef" },
  { id: "avatar-3", icon: "🕵️‍♂️", label: "Bug Detective" },
  { id: "avatar-4", icon: "🧙‍♂️", label: "Logic Wizard" },
];

export default function LandingPage() {
  const router = useRouter();

  // Student Fast-Login Form
  const [name, setName] = useState("");
  const [absentNo, setAbsentNo] = useState("");
  const [sessionCode, setSessionCode] = useState("X5-KANTIN");
  const [selectedAvatar, setSelectedAvatar] = useState("avatar-1");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Gamification Rules Modal Pop-up
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null);
  const [registeredStudentName, setRegisteredStudentName] = useState<string>("");

  // Persistent Saved Session State
  const [savedSession, setSavedSession] = useState<{
    studentId: string;
    name: string;
    absentNo: number;
    sessionCode: string;
    avatar: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("algocraft_student_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.studentId) {
          // Validasi ke server apakah murid/sesi masih aktif atau telah di-reset oleh guru
          fetch(`/api/student/state?studentId=${parsed.studentId}`)
            .then(async (res) => {
              const data = await res.json().catch(() => ({}));
              if (res.status === 404 || data.isReset) {
                // Sesi telah di-reset guru! Bersihkan seluruh storage lokal
                clearAllStudentStorage(parsed.studentId);
                setSavedSession(null);
              } else if (res.ok && data.student) {
                setSavedSession(parsed);
                setName(parsed.name || "");
                setAbsentNo(parsed.absentNo?.toString() || "");
                setSessionCode(parsed.sessionCode || "X5-KANTIN");
                if (parsed.avatar) setSelectedAvatar(parsed.avatar);
              }
            })
            .catch(() => {
              // Jika offline, pertahankan sesi tersimpan lokal
              setSavedSession(parsed);
              setName(parsed.name || "");
              setAbsentNo(parsed.absentNo?.toString() || "");
              setSessionCode(parsed.sessionCode || "X5-KANTIN");
              if (parsed.avatar) setSelectedAvatar(parsed.avatar);
            });
        }
      }
    } catch (e) {
      console.error("Error reading saved session:", e);
    }
  }, []);

  const handleResumeSavedSession = async () => {
    if (!savedSession?.studentId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/student/state?studentId=${savedSession.studentId}`);
      const data = await res.json().catch(() => ({}));
      if (res.status === 404 || data.isReset) {
        clearAllStudentStorage(savedSession.studentId);
        setSavedSession(null);
        setErrorMsg("Sesi belajar sebelumnya telah di-reset oleh guru. Silakan mulai sesi baru.");
        setLoading(false);
        return;
      }
    } catch (e) {
      // Offline fallback
    }
    router.push(`/play?studentId=${savedSession.studentId}`);
  };

  const handleClearSavedSession = () => {
    clearAllStudentStorage(savedSession?.studentId);
    setSavedSession(null);
    setName("");
    setAbsentNo("");
    setSessionCode("X5-KANTIN");
  };

  const handleStudentJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !absentNo || !sessionCode.trim()) {
      setErrorMsg("Nama, Nomor Absen, dan Kode Sesi wajib diisi!");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          absentNo: parseInt(absentNo, 10),
          sessionCode: sessionCode.trim().toUpperCase(),
          avatar: selectedAvatar,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal masuk sesi.");
        setLoading(false);
        return;
      }

      // Bersihkan seluruh data penyimpanan lokal persisten lama sebelum mulai sesi baru
      clearAllStudentStorage();

      // Simpan session persisten ke localStorage agar tahan restart HP / kendala internet
      const sessionData = {
        studentId: data.student.id,
        name: data.student.name,
        absentNo: data.student.absentNo,
        sessionCode: sessionCode.trim().toUpperCase(),
        avatar: selectedAvatar,
      };
      localStorage.setItem("algocraft_student_session", JSON.stringify(sessionData));
      localStorage.setItem("algocraft_student_id", data.student.id);

      // Tampilkan popup aturan gamifikasi sebelum masuk ke arena permainan
      setPendingStudentId(data.student.id);
      setRegisteredStudentName(data.student.name);
      setShowRulesModal(true);
      setLoading(false);
    } catch (err: any) {
      setErrorMsg("Terjadi gangguan jaringan: " + err.message);
      setLoading(false);
    }
  };

  const handleStartAfterRules = () => {
    if (pendingStudentId) {
      router.push(`/play?studentId=${pendingStudentId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 blur-[130px] rounded-full" />
      </div>

      {/* Top Navbar */}
      <nav className="relative z-10 max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden">
            <img src="/AN-Logo.png" alt="AN Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-white block leading-none">
              AlgoCraft
            </span>
            <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">
              PBL Gamification Web
            </span>
          </div>
        </div>
      </nav>

      {/* Hero & Fast Login Section */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Kolom Kiri: Narasi Problem Based Learning */}
        <div className="lg:col-span-6 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>Problem Based Learning • Kelas X-5</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Petualangan Membangun{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              Kantin Digital Pintar
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Pecahkan antrean panjang kantin sekolah dengan merancang sistem algoritma kasir otomatis!
            Pelajari konsep <strong>Input-Proses-Output</strong>, susun alur sekuensial, terapkan
            <strong> percabangan IF-ELSE</strong>, buat diagram alir kanvas bebas, rangkai <strong>pseudocode</strong>,
            dan buru bug sistem dengan tabel uji.
          </p>
        </div>

        {/* Kolom Kanan: Sesi Tersimpan & Form Masuk Cepat */}
        <div className="lg:col-span-6 space-y-4">
          {/* Banner Pemulihan Sesi Persisten (Jika HP baru restart / koneksi terputus) */}
          {savedSession && (
            <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-indigo-950/80 backdrop-blur-xl p-5 rounded-3xl border-2 border-emerald-500/50 shadow-xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Sesi Petualangan Tersimpan!</h3>
                    <p className="text-[11px] text-emerald-300">
                      Terdeteksi data sebelumnya yang tersimpan aman di HP/perangkat ini.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClearSavedSession}
                  className="text-[10px] text-slate-400 hover:text-rose-400 underline cursor-pointer"
                  title="Ganti akun siswa"
                >
                  Ganti Akun
                </button>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {AVATARS.find((a) => a.id === savedSession.avatar)?.icon || "🤖"}
                  </span>
                  <div>
                    <span className="font-bold text-white block">{savedSession.name}</span>
                    <span className="text-[10px] text-slate-400">
                      Absen #{savedSession.absentNo} • Sesi {savedSession.sessionCode}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleResumeSavedSession}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Lanjutkan Misi</span>
                </button>
              </div>
            </div>
          )}

          {/* Form Akses Cepat */}
          <div className="bg-slate-900/90 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-indigo-400" />
                  <span>{savedSession ? "Masuk dengan Identitas Baru" : "Akses Cepat Siswa"}</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Progres Anda tersimpan otomatis di perangkat dan database server.
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                Online
              </span>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/80 p-3 rounded-xl border border-rose-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleStudentJoin} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nama Lengkap Siswa:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Fikri"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nomor Absen:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    placeholder="Contoh: 14"
                    value={absentNo}
                    onChange={(e) => setAbsentNo(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Kode Sesi Kelas:
                  </label>
                  <input
                    type="text"
                    required
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-indigo-300 font-mono font-bold uppercase focus:outline-hidden focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Pilih Avatar Petualang:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATARS.map((av) => {
                    const isSelected = selectedAvatar === av.id;
                    return (
                      <button
                        type="button"
                        key={av.id}
                        onClick={() => setSelectedAvatar(av.id)}
                        className={`p-2 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-400/40"
                            : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <span className="text-xl block">{av.icon}</span>
                        <span className="text-[10px] text-slate-400 font-semibold truncate block mt-0.5">
                          {av.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer mt-1"
              >
                {loading ? (
                  <span>Menghubungkan Sesi...</span>
                ) : (
                  <>
                    <span>Mulai Misi Belajar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-5 text-center text-xs text-slate-500">
        <p>
          AlgoCraft • Inovasi Pembelajaran Berpikir Komputasional & PBL Kelas X-5 Informatika • PPG
          Prajabatan
        </p>
      </footer>

      {/* Modal Pop-up Aturan Gamifikasi */}
      <GamificationRulesModal
        isOpen={showRulesModal}
        studentName={registeredStudentName}
        onConfirm={handleStartAfterRules}
        isFirstTime={true}
      />
    </div>
  );
}
