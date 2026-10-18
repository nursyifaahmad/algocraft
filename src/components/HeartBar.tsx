"use client";

import React from "react";
import { Heart, Coins, Trophy, Award, HelpCircle } from "lucide-react";

interface HeartBarProps {
  hearts: number;
  xp: number;
  coins: number;
  currentLevel: number;
  isFinished?: boolean;
  onOpenLeaderboard?: () => void;
  onOpenBadges?: () => void;
  onOpenHint?: () => void;
  onOpenCompletion?: () => void;
}

export const HeartBar: React.FC<HeartBarProps> = ({
  hearts,
  xp,
  coins,
  currentLevel,
  isFinished = false,
  onOpenLeaderboard,
  onOpenBadges,
  onOpenHint,
  onOpenCompletion,
}) => {
  return (
    <div className="flex items-center justify-between gap-1.5 sm:gap-3 bg-white/95 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 rounded-2xl shadow-xs border border-slate-200 whitespace-nowrap overflow-x-auto scrollbar-none w-full md:w-auto">
      {/* Nyawa / Hearts */}
      <div className="flex items-center gap-1 shrink-0">
        {[1, 2, 3].map((index) => {
          const isAlive = index <= hearts;
          return (
            <Heart
              key={index}
              className={`w-4.5 h-4.5 sm:w-5 sm:h-5 transition-all duration-300 ${
                isAlive
                  ? "fill-rose-500 text-rose-500 scale-100 animate-pulse"
                  : "fill-slate-200 text-slate-300 scale-90"
              }`}
            />
          );
        })}
      </div>

      {/* Koin & XP */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Koin */}
        <div className="flex items-center gap-1 bg-amber-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-amber-200/80">
          <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span className="text-[11px] sm:text-xs font-bold text-amber-800">{coins}</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1 bg-indigo-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-indigo-200/80">
          <span className="text-[11px] sm:text-xs font-bold text-indigo-700">{xp} XP</span>
        </div>

        {/* Level / Status Kelulusan */}
        {isFinished ? (
          <button
            onClick={onOpenCompletion}
            className="flex items-center gap-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-amber-300 shadow-xs font-black text-[10px] sm:text-xs transition-all cursor-pointer transform hover:scale-105 active:scale-95"
            title="Lihat Sertifikat & Rapor Kelulusan PBL"
          >
            <Trophy className="w-3 h-3 fill-slate-950 text-slate-950" />
            <span className="hidden sm:inline">Lulus PBL</span>
            <Award className="w-3 h-3 text-slate-950" />
          </button>
        ) : (
          <div className="hidden lg:flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
            <span className="text-xs font-bold text-emerald-700">Misi {currentLevel}/6</span>
          </div>
        )}
      </div>

      {/* Action Buttons: Hint, Badges, Leaderboard */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {onOpenHint && (
          <button
            onClick={onOpenHint}
            title="Gunakan Petunjuk Koin"
            className="flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl border border-amber-200/80 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Petunjuk</span>
          </button>
        )}

        {onOpenBadges && (
          <button
            onClick={onOpenBadges}
            title="Lihat Lencana Prestasi"
            className="p-1 sm:p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200/60 transition-colors cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}

        {onOpenLeaderboard && (
          <button
            onClick={onOpenLeaderboard}
            title="Papan Peringkat Kelas"
            className="p-1 sm:p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200/60 transition-colors cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
