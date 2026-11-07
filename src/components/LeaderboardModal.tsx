import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, User, RefreshCw, X } from 'lucide-react';
import { LeaderboardEntry, GameRank } from '../types/game';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKills?: number;
  currentScore?: number;
  currentRank?: GameRank;
  currentLevelName?: string;
  onSaveCurrentScore?: (callsign: string) => void;
  currentLanguage?: Language;
}

const STORAGE_KEY = 'neo_nights_leaderboard_v1';

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'lb-1', callsign: 'GHOST-01', kills: 42, score: 26800, rank: 'SSS', date: '2026-03-28', levelName: 'Carnival' },
  { id: 'lb-2', callsign: 'CYBER-VALKYRIE', kills: 35, score: 21500, rank: 'SSS', date: '2026-03-28', levelName: 'Carnival' },
  { id: 'lb-3', callsign: 'NEO-RAVAGER', kills: 28, score: 17400, rank: 'S', date: '2026-03-27', levelName: 'Docks' },
  { id: 'lb-4', callsign: 'VIPER-STRIKE', kills: 22, score: 14200, rank: 'S', date: '2026-03-27', levelName: 'Carnival' },
  { id: 'lb-5', callsign: 'PULSE-RUNNER', kills: 18, score: 9800, rank: 'A', date: '2026-03-26', levelName: 'Reactor' },
  { id: 'lb-6', callsign: 'SHADOW-MERC', kills: 12, score: 6500, rank: 'A', date: '2026-03-26', levelName: 'Carnival' },
  { id: 'lb-7', callsign: 'GARUDA-07', kills: 8, score: 4100, rank: 'B', date: '2026-03-25', levelName: 'Docks' },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentKills = 0,
  currentScore = 0,
  currentRank = 'C',
  currentLevelName = 'Neo-Nights',
  onSaveCurrentScore,
  currentLanguage = 'zh-TW',
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [callsign, setCallsign] = useState('ALPHA-LEADER');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load from localStorage
  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEntries(parsed);
          return;
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LEADERBOARD));
      setEntries(DEFAULT_LEADERBOARD);
    } catch {
      setEntries(DEFAULT_LEADERBOARD);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callsign.trim()) return;

    const newEntry: LeaderboardEntry = {
      id: `lb-${Date.now()}`,
      callsign: callsign.trim().toUpperCase(),
      kills: currentKills,
      score: currentScore,
      rank: currentRank,
      date: new Date().toISOString().split('T')[0],
      levelName: currentLevelName,
    };

    const updated = [...entries, newEntry].sort((a, b) => b.score - a.score).slice(0, 15);
    setEntries(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    setSavedSuccess(true);
    onSaveCurrentScore?.(newEntry.callsign);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset leaderboard data?')) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LEADERBOARD));
      setEntries(DEFAULT_LEADERBOARD);
    }
  };

  const getRankBadge = (rank: GameRank) => {
    switch (rank) {
      case 'SSS':
        return (
          <span className="font-mono font-extrabold text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
            SSS
          </span>
        );
      case 'S':
        return (
          <span className="font-mono font-bold text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]">
            S
          </span>
        );
      case 'A':
        return <span className="font-mono font-bold text-purple-400">A</span>;
      case 'B':
        return <span className="font-mono font-medium text-blue-400">B</span>;
      default:
        return <span className="font-mono text-slate-400">C</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-cyan-500/30 rounded-xl shadow-[0_0_35px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-bold tracking-wider text-slate-100 flex items-center gap-2">
                {t.leaderboardTitle}
                <span className="text-xs font-mono font-normal text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded">
                  {t.leaderboardSubtitle}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {t.leaderboardRule}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Run Highlight Card */}
        <div className="p-4 bg-gradient-to-r from-slate-950/80 via-cyan-950/20 to-slate-950/80 border-b border-slate-800">
          <div className="text-xs font-medium text-cyan-400 mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4" /> {t.currentPerformance}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3 text-center">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="text-[11px] text-slate-400">{t.kills}</div>
              <div className="text-2xl font-mono font-bold text-cyan-300 tabular-nums">{currentKills}</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="text-[11px] text-slate-400">{t.score}</div>
              <div className="text-2xl font-mono font-bold text-amber-400 tabular-nums">
                {currentScore.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="text-[11px] text-slate-400">{t.rank}</div>
              <div className="text-2xl font-mono font-extrabold">{getRankBadge(currentRank)}</div>
            </div>
          </div>

          {/* Save to leaderboard form */}
          <form onSubmit={handleSaveScore} className="flex gap-2">
            <div className="relative flex-1">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                placeholder={t.callsignPlaceholder}
                maxLength={16}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={savedSuccess}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
              }`}
            >
              {savedSuccess ? t.submitted : t.submitScore}
            </button>
          </form>
        </div>

        {/* Leaderboard Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="py-2 px-3">{t.colRank}</th>
                <th className="py-2 px-3">{t.colCallsign}</th>
                <th className="py-2 px-3 text-center">{t.colTier}</th>
                <th className="py-2 px-3 text-right">{t.colKills}</th>
                <th className="py-2 px-3 text-right">{t.colScore}</th>
                <th className="py-2 px-3 text-right">{t.colDate}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {entries.map((entry, index) => {
                const isTop1 = index === 0;
                const isTop2 = index === 1;
                const isTop3 = index === 2;

                return (
                  <tr
                    key={entry.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isTop1
                        ? 'bg-amber-500/10'
                        : isTop2
                        ? 'bg-slate-300/5'
                        : isTop3
                        ? 'bg-amber-700/10'
                        : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {isTop1 ? (
                        <span className="flex items-center gap-1 text-amber-300 font-bold">
                          <Trophy className="w-4 h-4" /> 1
                        </span>
                      ) : isTop2 ? (
                        <span className="flex items-center gap-1 text-slate-200 font-bold">
                          <Medal className="w-4 h-4" /> 2
                        </span>
                      ) : isTop3 ? (
                        <span className="flex items-center gap-1 text-amber-600 font-bold">
                          <Award className="w-4 h-4" /> 3
                        </span>
                      ) : (
                        <span className="text-slate-400 pl-1">{index + 1}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {entry.callsign}
                      <span className="block text-[10px] text-slate-500 font-normal">{entry.levelName}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">{getRankBadge(entry.rank)}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-cyan-300 tabular-nums">
                      {entry.kills}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-400 tabular-nums">
                      {entry.score.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 text-[10px]">{entry.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-500">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> {t.resetLeaderboard}
          </button>
          <span>{t.rankThresholds}</span>
        </div>
      </div>
    </div>
  );
};
