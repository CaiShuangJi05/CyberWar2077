import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Award, Trophy, Skull, ShieldCheck, Clock, RefreshCw, Home } from 'lucide-react';
import { GameScore, GameStats } from '../types/game';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface ScoreModalProps {
  isOpen: boolean;
  isVictory: boolean;
  score: GameScore;
  stats: GameStats;
  currentLevelName?: string;
  currentLevelNumber?: number;
  hasNextLevel?: boolean;
  onNextLevel?: () => void;
  onOpenLevelSelect?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenMainMenu?: () => void;
  onRestart: () => void;
  onClose: () => void;
  currentLanguage?: Language;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  isOpen,
  isVictory,
  score,
  stats,
  currentLevelName = 'Neo-Nights',
  currentLevelNumber = 1,
  hasNextLevel = true,
  onNextLevel,
  onOpenLevelSelect,
  onOpenLeaderboard,
  onOpenMainMenu,
  onRestart,
  onClose,
  currentLanguage = 'zh-TW',
}) => {
  const t = TRANSLATIONS[currentLanguage];

  useEffect(() => {
    if (isOpen && isVictory && (score.rank === 'SSS' || score.rank === 'S' || score.rank === 'A')) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#ff2a85', '#ffaa00', '#ffffff'],
      });
    }
  }, [isOpen, isVictory, score.rank]);

  if (!isOpen) return null;

  const rankColors = {
    SSS: 'from-amber-300 via-yellow-400 to-amber-500 border-amber-300 text-amber-200 shadow-[0_0_50px_rgba(255,215,0,0.7)]',
    S: 'from-amber-400 via-pink-500 to-cyan-400 border-amber-400 text-amber-300 shadow-[0_0_40px_rgba(255,170,0,0.5)]',
    A: 'from-pink-500 to-purple-500 border-pink-400 text-pink-300 shadow-[0_0_35px_rgba(255,42,133,0.4)]',
    B: 'from-cyan-500 to-blue-500 border-cyan-400 text-cyan-300 shadow-[0_0_30px_rgba(0,240,255,0.3)]',
    C: 'from-slate-500 to-slate-700 border-slate-500 text-slate-300',
  };

  const rankTitles = {
    SSS: 'SSS · NEO-NIGHTS LEGEND',
    S: 'S · ELITE OPERATIVE',
    A: 'A · TACTICAL SPECIALIST',
    B: 'B · QUALIFIED MERCENARY',
    C: 'C · RESERVE GUARD',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-2xl bg-[#090d16] border-2 border-cyan-500/80 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.3)] overflow-hidden text-slate-100 p-6"
      >
        {/* Banner Header */}
        <div className="text-center mb-6">
          <div className="inline-block px-4 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-xs font-mono text-cyan-300 mb-2">
            MISSION 0{currentLevelNumber} : {currentLevelName}
          </div>
          <h2
            className={`text-3xl font-extrabold tracking-wider ${
              isVictory ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300' : 'text-red-500'
            }`}
          >
            {isVictory ? t.victoryTitle : t.failureTitle}
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            {t.gameSubtitle}
          </p>
        </div>

        {/* Big Rank Badge + Total Score Display */}
        <div className="flex flex-col sm:flex-row items-center justify-around bg-[#060910] p-4 rounded-xl border border-cyan-900/60 mb-6">
          {/* Rank Badge */}
          <div className="flex flex-col items-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
              PROTOCOL RANK
            </div>
            <div
              className={`w-24 h-24 rounded-2xl bg-gradient-to-br border-2 flex items-center justify-center text-5xl font-black ${rankColors[score.rank]}`}
            >
              {score.rank}
            </div>
            <div className="text-xs font-bold mt-1 text-cyan-300">
              {rankTitles[score.rank]}
            </div>
          </div>

          {/* Total Score */}
          <div className="flex flex-col items-center sm:items-start mt-4 sm:mt-0">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-0.5">
              {t.score}
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 font-mono drop-shadow-[0_0_15px_rgba(0,240,255,0.6)]">
              {score.totalScore.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              {t.rankThresholds}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 text-xs font-mono">
          <div className="bg-[#0b101c] p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Skull className="w-3.5 h-3.5 text-pink-400" />
              <span>{t.kills}</span>
            </div>
            <div className="text-base font-bold text-pink-300">
              {stats.kills.thug + stats.kills.heavy + stats.kills.sniper}
            </div>
          </div>

          <div className="bg-[#0b101c] p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Trophy className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.colScore}</span>
            </div>
            <div className="text-base font-bold text-cyan-300">
              {score.killScore} PTS
            </div>
          </div>

          <div className="bg-[#0b101c] p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.shelfHp}</span>
            </div>
            <div className="text-base font-bold text-emerald-300">
              +{stats.damageBlocked}
            </div>
          </div>

          <div className="bg-[#0b101c] p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.timeRemaining}</span>
            </div>
            <div className="text-base font-bold text-amber-300">
              {Math.floor(stats.elapsedTime / 60)}:{(stats.elapsedTime % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isVictory && hasNextLevel && onNextLevel && (
            <button
              onClick={onNextLevel}
              className="flex-1 min-w-[200px] py-3 px-4 bg-gradient-to-r from-emerald-400 via-cyan-400 to-pink-500 hover:from-emerald-300 hover:to-pink-400 text-black font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,255,136,0.5)] transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" /> {t.nextMission}
            </button>
          )}

          {onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              className="py-3 px-4 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" /> {t.leaderboard}
            </button>
          )}

          {onOpenLevelSelect && (
            <button
              onClick={onOpenLevelSelect}
              className="py-3 px-4 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {t.missionList}
            </button>
          )}

          <button
            onClick={onRestart}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> {t.retry}
          </button>

          {onOpenMainMenu && (
            <button
              onClick={onOpenMainMenu}
              className="py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" /> {t.backToMainMenu}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
