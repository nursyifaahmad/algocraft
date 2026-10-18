"use client";

import React from "react";
import {
  Heart,
  Coins,
  Trophy,
  Award,
  Zap,
  Save,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  X,
} from "lucide-react";

interface GamificationRulesModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm: () => void;
  studentName?: string;
  isFirstTime?: boolean;
}

export const GamificationRulesModal: React.FC<GamificationRulesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  studentName,
  isFirstTime = true,
}) => {
  if (!isOpen) return null;

  const rules = [
    {
      icon: <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />,
      bg: "bg-rose-50 border-rose-200 text-rose-900",
      title: "3 Nyawa (Hearts)",
      desc: "Kamu memulai dengan 3 nyawa. Nyawa berkurang 1 jika mengirimkan jawaban yang belum tuntas (< 75%). Uji logikamu sebelum submit!",
    },
    {
      icon: <Coins className="w-5 h-5 text-amber-500 fill-amber-500" />,
      bg: "bg-amber-50 border-amber-200 text-amber-900",
      title: "Koin Kantin Pintar",
      desc: "Dapatkan koin emas setiap kali misi tuntas. Koin bisa ditukar untuk membuka Petunjuk Berpikir (Hints) saat kamu buntu.",
    },
    {
      icon: <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500" />,
      bg: "bg-indigo-50 border-indigo-200 text-indigo-900",
      title: "XP & 6 Tingkat Misi",
      desc: "Raih poin pengalaman (XP) dan selesaikan 6 misi PBL secara berurutan: IPO, Algoritma, Cabang, Flowchart, Pseudocode, & Debugging.",
    },
    {
      icon: <Award className="w-5 h-5 text-purple-500 fill-purple-500" />,
      bg: "bg-purple-50 border-purple-200 text-purple-900",
      title: "7 Lencana Prestasi",
      desc: "Buktikan kemampuan komputasimu untuk mengoleksi seluruh lencana prestasi hingga gelar Grandmaster Kantin Pintar!",
    },
    {
      icon: <Trophy className="w-5 h-5 text-yellow-600 fill-yellow-500" />,
      bg: "bg-yellow-50 border-yellow-200 text-yellow-900",
      title: "Papan Peringkat Kelas",
      desc: "Pantau ranking nilaimu secara real-time di antara teman sekelas dalam sesi yang sama. Bersaing secara positif & suportif.",
    },
    {
      icon: <Save className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
      title: "Penyimpanan Aman di HP",
      desc: "Draf pengerjaan dan diagram otomatis tersimpan di HP. Jika HP mati atau koneksi putus, kamu bisa melanjutkan tanpa panik.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header Modal */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-orange-500/20">
                🎮
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                  Aturan & Mekanisme Permainan
                </h2>
                <p className="text-[11px] text-indigo-300 font-semibold mt-0.5">
                  Petualangan Problem Based Learning • Kelas X-5
                </p>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {studentName && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-medium">
              <span>Selamat Datang, <strong>{studentName}</strong>! Silakan pelajari aturan main berikut:</span>
            </div>
          )}
        </div>

        {/* Scrollable Rules Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all ${rule.bg}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-xl bg-white shadow-xs">
                    {rule.icon}
                  </div>
                  <h3 className="text-xs font-black tracking-tight">{rule.title}</h3>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">{rule.desc}</p>
              </div>
            ))}
          </div>

          {/* Kotak Tips Sukses Belajar */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-slate-700">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 block">Kunci Sukses:</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Manfaatkan simulator uji interaktif di setiap misi sebelum menekan tombol kirim.
                Tanyakan ke teman atau guru jika ragu, dan gunakan koin untuk membuka petunjuk.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Action Button */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Target kelulusan misi: Nilai ≥ 75%
          </div>

          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all transform active:scale-98 cursor-pointer"
          >
            <span>{isFirstTime ? "Saya Paham, Mulai Petualangan! 🚀" : "Kembali ke Permainan"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
