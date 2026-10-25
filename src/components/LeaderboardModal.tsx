"use client";

import React, { useEffect, useState } from "react";
import { X, Trophy, Medal, User } from "lucide-react";

interface LeaderboardStudent {
  id: string;
  name: string;
  absentNo: number;
  avatar: string;
  xp: number;
  coins: number;
  currentLevel: number;
  isFinished: boolean;
  badges: { badgeCode: string; icon: string }[];
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionCode: string;
  currentStudentId?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  sessionCode,
  currentStudentId,
}) => {
  const [students, setStudents] = useState<LeaderboardStudent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !sessionCode) return;

    setLoading(true);
    fetch(`/api/leaderboard?sessionCode=${encodeURIComponent(sessionCode)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.leaderboard) {
          setStudents(data.leaderboard);
        }
      })
      .catch((err) => console.error("Error fetching leaderboard:", err))
      .finally(() => setLoading(false));
  }, [isOpen, sessionCode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 via-white to-yellow-50">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Peringkat Kelas</h2>
              <p className="text-xs text-slate-500">Sesi {sessionCode}</p>
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
        <div className="p-6 overflow-y-auto space-y-3">
          {loading ? (
            <div className="py-10 text-center text-slate-400 text-sm animate-pulse">
              Memuat peringkat kelas...
            </div>
          ) : students.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">
              Belum ada data nilai. Ayo jadi yang pertama menyelesaikan misi!
            </div>
          ) : (
            students.map((student, index) => {
              const isMe = student.id === currentStudentId;
              const rank = index + 1;

              return (
                <div
                  key={student.id}
                  className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all ${
                    isMe
                      ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30"
                      : "bg-slate-50/60 border-slate-200/80"
                  }`}
                >
                  {/* Rank Icon / Number */}
                  <div className="w-8 h-8 flex items-center justify-center font-bold text-sm">
                    {rank === 1 ? (
                      <span className="text-xl">🥇</span>
                    ) : rank === 2 ? (
                      <span className="text-xl">🥈</span>
                    ) : rank === 3 ? (
                      <span className="text-xl">🥉</span>
                    ) : (
                      <span className="text-slate-500 font-semibold">{rank}</span>
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">
                        Absen {student.absentNo}
                      </span>
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {student.name} {isMe && <span className="text-xs text-amber-600">(Kamu)</span>}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span>Misi {student.currentLevel}/6</span>
                      <span>•</span>
                      <span>🪙 {student.coins}</span>
                      <span>•</span>
                      <div className="flex items-center gap-0.5">
                        {student.badges.slice(0, 3).map((b, i) => (
                          <span key={i} className="text-xs">{b.icon}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <div className="text-sm font-black text-indigo-700">{student.xp}</div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">XP</div>
                  </div>
                </div>
              );
            })
          )}
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
