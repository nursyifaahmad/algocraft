"use client";

import React from "react";
import { X, Award, CheckCircle2, Lock } from "lucide-react";
import { BADGES_DATA } from "@/data/badgesData";

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  earnedBadges: { badgeCode: string; unlockedAt?: Date | string }[];
}

export const BadgeModal: React.FC<BadgeModalProps> = ({
  isOpen,
  onClose,
  earnedBadges,
}) => {
  if (!isOpen) return null;

  const earnedCodes = new Set(earnedBadges.map((b) => b.badgeCode));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-white to-purple-50">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">Lencana Prestasi Kamu</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-500">
            Kumpulkan seluruh 7 lencana kehormatan dengan menuntaskan setiap misi Problem Based Learning!
          </p>

          <div className="grid grid-cols-1 gap-3">
            {BADGES_DATA.map((badge) => {
              const isUnlocked = earnedCodes.has(badge.code);
              return (
                <div
                  key={badge.id}
                  className={`flex items-start gap-4 p-3.5 rounded-2xl border transition-all ${
                    isUnlocked
                      ? "bg-emerald-50/60 border-emerald-200/80 shadow-sm"
                      : "bg-slate-50 border-slate-200/60 opacity-60"
                  }`}
                >
                  <div
                    className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                      isUnlocked
                        ? "bg-gradient-to-tr from-amber-200 to-yellow-100 border border-amber-300"
                        : "bg-slate-200 border border-slate-300 text-slate-400 grayscale"
                    }`}
                  >
                    {isUnlocked ? badge.icon : <Lock className="w-5 h-5 text-slate-400" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-bold truncate ${
                          isUnlocked ? "text-emerald-950" : "text-slate-600"
                        }`}
                      >
                        {badge.title}
                      </h4>
                      {isUnlocked && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Tercapai
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{badge.description}</p>
                    <p className="text-[11px] text-slate-400 mt-1 italic">
                      Kriteria: {badge.criteria}
                    </p>
                  </div>
                </div>
              );
            })}
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
