"use client";

import React, { useState } from "react";
import { X, HelpCircle, Coins, Sparkles, Check, AlertCircle } from "lucide-react";

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  onDeductCoins: (amount: number) => Promise<boolean>;
  hintLevel1Text: string;
  hintLevel2Text: string;
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  onClose,
  coins,
  onDeductCoins,
  hintLevel1Text,
  hintLevel2Text,
}) => {
  const [unlocked1, setUnlocked1] = useState(false);
  const [unlocked2, setUnlocked2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleUnlockHint1 = async () => {
    if (coins < 10) {
      setErrorMsg("Koin tidak cukup! Butuh 10 koin.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    const success = await onDeductCoins(10);
    if (success) {
      setUnlocked1(true);
    } else {
      setErrorMsg("Gagal membuka petunjuk.");
    }
    setLoading(false);
  };

  const handleUnlockHint2 = async () => {
    if (coins < 25) {
      setErrorMsg("Koin tidak cukup! Butuh 25 koin.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    const success = await onDeductCoins(25);
    if (success) {
      setUnlocked2(true);
    } else {
      setErrorMsg("Gagal membuka petunjuk.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Petunjuk Bantuan</h2>
              <div className="flex items-center gap-1 text-xs text-amber-700 font-semibold">
                <Coins className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                <span>Koin Kamu: {coins}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Hint 1 */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">💡 Petunjuk 1 (Arahan Berpikir)</span>
              {unlocked1 ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Terbuka
                </span>
              ) : (
                <button
                  disabled={loading || coins < 10}
                  onClick={handleUnlockHint1}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Coins className="w-3 h-3" /> Buka (-10 Koin)
                </button>
              )}
            </div>
            {unlocked1 ? (
              <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                {hintLevel1Text}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Buka untuk melihat arahan berpikir menyelesaikan tantangan ini.
              </p>
            )}
          </div>

          {/* Hint 2 */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">🎯 Petunjuk 2 (Kunci Sebagian)</span>
              {unlocked2 ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Terbuka
                </span>
              ) : (
                <button
                  disabled={loading || coins < 25}
                  onClick={handleUnlockHint2}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Coins className="w-3 h-3" /> Buka (-25 Koin)
                </button>
              )}
            </div>
            {unlocked2 ? (
              <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                {hintLevel2Text}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Buka untuk melihat bantuan spesifik atau sebagian kunci logika.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-sm transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
