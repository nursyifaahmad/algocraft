"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, User, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("guru");
  const [password, setPassword] = useState("guru123");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal login pengajar.");
        setLoading(false);
        return;
      }

      // Simpan session pengajar di localStorage
      localStorage.setItem("algocraft_teacher", JSON.stringify(data.teacher));
      router.push("/teacher/dashboard");
    } catch (err: any) {
      setErrorMsg("Koneksi gagal: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Siswa</span>
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center text-2xl mx-auto shadow-inner">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-white">Portal Pengajar AlgoCraft</h1>
          <p className="text-xs text-slate-400">
            Monitoring Pembelajaran PBL & Rekap Rubrik Asesmen PPG Kelas X-5
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/80 p-3 rounded-xl border border-rose-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Username Pengajar:</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Kata Sandi:</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-800/50 text-[11px] text-indigo-300">
            💡 <strong>Info Akun Default:</strong> Username: <code className="text-white">guru</code> | Kata sandi: <code className="text-white">guru123</code>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {loading ? (
              <span>Memverifikasi...</span>
            ) : (
              <>
                <span>Masuk ke Dashboard Guru</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
