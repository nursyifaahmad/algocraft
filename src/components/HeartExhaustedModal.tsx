"use client";

import React, { useState, useEffect } from "react";
import { Heart, Coins, AlertTriangle, Sparkles, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";

interface HeartExhaustedModalProps {
  isOpen: boolean;
  coins: number;
  activeTab: number;
  onRedeemWithCoins: () => Promise<void>;
  onCooldownFinish: () => Promise<void>;
  isRedeeming: boolean;
}

const PBL_MINI_TIPS: Record<number, { title: string; tip: string }> = {
  1: {
    title: "Tips Misi 1: Klasifikasi IPO",
    tip: "Input adalah data yang dimasukkan (nama, item menu). Proses adalah kalkulasi formula (hitung subtotal, periksa diskon). Output adalah hasil jadi (tampilan total, cetak struk).",
  },
  2: {
    title: "Tips Misi 2: Langkah Algoritma Sekuensial",
    tip: "Pastikan urutan logis: Inisialisasi kasir -> Input pesanan -> Hitung subtotal -> Cek diskon -> Proses bayar -> Cetak struk belanja.",
  },
  3: {
    title: "Tips Misi 3: Logika Percabangan IF-ELSE",
    tip: "Periksa syarat ganda: Diskon 15% HANYA aktif jika total belanja >= Rp 50.000 DAN waktu istirahat 1. Pastikan juga saldo kartu >= total bayar sebelum transaksi disetujui.",
  },
  4: {
    title: "Tips Misi 4: Diagram Alir Kasir",
    tip: "Hubungkan Terminator (Mulai/Selesai), Jajargenjang (Input data), Belah Ketupat (Keputusan kondisi Diskon/Saldo), dan Persegi (Proses kalkulasi) dengan garis siku tegak lurus.",
  },
  5: {
    title: "Tips Misi 5: Pseudocode & Indentasi",
    tip: "Baris logika di dalam blok 'JIKA ... MAKA' wajib diberi indentasi (menjorok masuk 1 tab). Pastikan blok ditutup rapi dengan 'AKHIR-JIKA'.",
  },
  6: {
    title: "Tips Misi 6: Debugging & Data Uji",
    tip: "Cermati operator logika: Jika saldo siswa sama persis dengan total belanja (saldo == total), transaksi harus DITERIMA (gunakan operator >=, bukan >).",
  },
};

export const HeartExhaustedModal: React.FC<HeartExhaustedModalProps> = ({
  isOpen,
  coins,
  activeTab,
  onRedeemWithCoins,
  onCooldownFinish,
  isRedeeming,
}) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [cooldownDone, setCooldownDone] = useState(false);

  const canAffordCoins = coins >= 25;
  const currentTip = PBL_MINI_TIPS[activeTab] || PBL_MINI_TIPS[1];

  // Efek cooldown refleksi otomatis jika koin < 25
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(30);
      setCooldownDone(false);
      return;
    }

    // Jika koin < 25, jalankan timer 30 detik
    if (!canAffordCoins) {
      setTimeLeft(30);
      setCooldownDone(false);

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCooldownDone(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, canAffordCoins]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* Header Visual */}
        <div className="p-6 text-center bg-gradient-to-b from-rose-50 via-rose-50/50 to-white border-b border-rose-100 relative">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 border-2 border-rose-200 flex items-center justify-center text-3xl shadow-lg shadow-rose-200/50 mb-3 animate-pulse">
            💔
          </div>
          <h3 className="text-xl font-black text-slate-900">Nyawa Kamu Habis (0/3 ❤️)</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Dalam pemecahan masalah komputasional, kesalahan adalah kesempatan berharga untuk memperbaiki alur logika!
          </p>
        </div>

        {/* Konten Berdasarkan Kondisi Koin */}
        <div className="p-6 space-y-5">
          {canAffordCoins ? (
            /* KONDISI 1: Koin Cukup (>= 25 Koin) -> HANYA Tebus 25 Koin */
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl">
                    🪙
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-amber-700">Saldo Koin Pintar</div>
                    <div className="text-base font-black text-amber-900">{coins} Koin</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-semibold text-slate-500">Biaya Tebus</div>
                  <div className="text-sm font-black text-rose-600">25 Koin</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Aturan Tebus Nyawa:</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tebus 25 koin untuk mendapatkan <strong>1 Nyawa (+1 ❤️)</strong> sebagai kesempatan mencoba kembali. Analisis jawabanmu dengan teliti sebelum mengirim!
                </p>
              </div>

              <button
                onClick={onRedeemWithCoins}
                disabled={isRedeeming}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isRedeeming ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memproses Tebus Nyawa...</span>
                  </>
                ) : (
                  <>
                    <span>🪙 Tebus 1 Nyawa (25 Koin)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* KONDISI 2: Koin Habis (< 25 Koin) -> Cooldown Refleksi 30 Detik + Mini Tips PBL */
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Koin Tidak Mencukupi:</span> Sisa koinmu <strong>{coins} koin</strong> (butuh 25 koin). Kamu masuk ke tahap <strong>Jeda Refleksi Belajar</strong>.
                </div>
              </div>

              {/* Timer Cooldown */}
              <div className="text-center py-2">
                {!cooldownDone ? (
                  <div className="inline-flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 flex items-center justify-center font-black text-2xl text-indigo-700 animate-spin-slow">
                      {timeLeft}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 mt-2">
                      Detik Refleksi Tersisa
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl">
                      ✅
                    </div>
                    <span className="text-xs font-bold text-emerald-700 mt-2">
                      Jeda Refleksi Selesai!
                    </span>
                  </div>
                )}
              </div>

              {/* Mini Tips Logika PBL */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 text-xs space-y-1.5">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{currentTip.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {currentTip.tip}
                </p>
              </div>

              {/* Tombol Pemulihan */}
              <button
                onClick={onCooldownFinish}
                disabled={!cooldownDone || isRedeeming}
                className={`w-full py-3.5 font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  cooldownDone && !isRedeeming
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                {isRedeeming ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memulihkan Nyawa...</span>
                  </>
                ) : cooldownDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ambil 3 Nyawa Penuh & Lanjut Misi</span>
                  </>
                ) : (
                  <span>Tunggu {timeLeft} Detik...</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
