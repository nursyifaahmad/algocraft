"use client";

import React from "react";
import { Heart, Coins, Trophy, Award, HelpCircle } from "lucide-react";

interface HeartBarProps {
  hearts: number;
  xp: number;
  coins: number;
  currentLevel: number;
  onOpenLeaderboard?: () => void;
  onOpenBadges?: () => void;
  onOpenHint?: () => void;
}

export const HeartBar: React.FC<HeartBarProps> = ({
  hearts,
  xp,
  coins,
  currentLevel,
  onOpenLeaderboard,
  onOpenBadges,
  onOpenHint,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200">
      {/* Nyawa / Hearts */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">
          Nyawa:
        </span>
        {[1, 2, 3].map((index) => {
          const isAlive = index <= hearts;
          return (
            <Heart
              key={index}
              className={`w-6 h-6 transition-all duration-300 ${
                isAlive
                  ? "fill-rose-500 text-rose-500 scale-100 animate-pulse"
                  : "fill-slate-200 text-slate-300 scale-90"
              }`}
            />
          );
        })}
      </div>

      {/* Koin & XP */}
      <div className="flex items-center gap-3">
        {/* Koin */}
        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">
          <Coins className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span className="text-xs font-bold text-amber-800">{coins}</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/80">
          <span className="text-xs font-bold text-indigo-700">{xp} XP</span>
        </div>

        {/* Level */}
        <div className="hidden md:flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
          <span className="text-xs font-bold text-emerald-700">Misi {currentLevel}/6</span>
        </div>
      </div>

      {/* Action Buttons: Hint, Badges, Leaderboard */}
      <div className="flex items-center gap-2">
        {onOpenHint && (
          <button
            onClick={onOpenHint}
            title="Gunakan Petunjuk Koin"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Petunjuk</span>
          </button>
        )}

        {onOpenBadges && (
          <button
            onClick={onOpenBadges}
            title="Lihat Lencana Prestasi"
            className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200/60 transition-colors cursor-pointer"
          >
            <Award className="w-4 h-4" />
          </button>
        )}

        {onOpenLeaderboard && (
          <button
            onClick={onOpenLeaderboard}
            title="Papan Peringkat Kelas"
            className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200/60 transition-colors cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
