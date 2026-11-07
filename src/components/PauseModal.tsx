import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Terminal, BookOpen, Volume2, VolumeX, Shield, Clock, Crosshair, Package, Home, Globe } from 'lucide-react';
import { GameStats } from '../types/game';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onOpenTactical: () => void;
  onOpenDossier: () => void;
  onOpenLevelSelect?: () => void;
  onOpenMainMenu?: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  countdownSeconds: number;
  stats: GameStats;
  currentWeaponName: string;
  currentLevelName?: string;
  currentLevelNumber?: number;
  currentLanguage?: Language;
  onSelectLanguage?: (lang: Language) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onOpenTactical,
  onOpenDossier,
  onOpenLevelSelect,
  onOpenMainMenu,
  onRestart,
  isMuted,
  onToggleMute,
  countdownSeconds,
  stats,
  currentWeaponName,
  currentLevelName = 'Neo-Nights',
  currentLevelNumber = 1,
  currentLanguage = 'zh-TW',
  onSelectLanguage,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLanguage];

  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const languages: { id: Language; label: string; flag: string }[] = [
    { id: 'zh-TW', label: '繁中', flag: '🇹🇼' },
    { id: 'en', label: 'EN', flag: '🇬🇧' },
    { id: 'id', label: 'ID', flag: '🇮🇩' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono select-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-[#090e18] border-2 border-cyan-400/80 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.35)] overflow-hidden text-slate-100 p-6 flex flex-col"
        >
          {/* Header */}
          <div className="text-center border-b border-cyan-500/30 pb-4 mb-5">
            <div className="inline-block px-3 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/50 text-[11px] font-mono text-cyan-300 mb-1">
              MISSION 0{currentLevelNumber} : {currentLevelName}
            </div>
            <h2 className="text-2xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300">
              MISSION PAUSED
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {t.ctrlPause}
            </p>
          </div>

          {/* Mission Realtime Overview Snapshot */}
          <div className="grid grid-cols-2 gap-2.5 bg-[#060910] p-3.5 rounded-xl border border-slate-800 text-xs font-mono mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">{t.timeRemaining}</span>
                <span className="text-amber-300 font-bold">{timeFormatted}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">{t.ctrlWeapons}</span>
                <span className="text-cyan-300 font-bold text-[11px] truncate">{currentWeaponName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-pink-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">{t.kills}</span>
                <span className="text-pink-300 font-bold">{stats.kills.thug + stats.kills.heavy + stats.kills.sniper}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">{t.shelfHp}</span>
                <span className="text-emerald-300 font-bold">+{stats.damageBlocked}</span>
              </div>
            </div>
          </div>

          {/* Language Switcher in Pause */}
          {onSelectLanguage && (
            <div className="flex items-center justify-between p-2 mb-4 bg-slate-900/80 border border-slate-800 rounded-xl text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Globe className="w-3.5 h-3.5 text-cyan-400" /> {t.languageSelect}:
              </span>
              <div className="flex items-center gap-1">
                {languages.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => onSelectLanguage(l.id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      currentLanguage === l.id
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {/* Resume button */}
            <button
              onClick={onResume}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black" /> {t.resumeMission} [P]
            </button>

            {/* Tactical & Mission Navigation */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenTactical}
                className="py-2.5 px-2 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" /> {t.tacticalPanel}
              </button>

              {onOpenLevelSelect && (
                <button
                  onClick={onOpenLevelSelect}
                  className="py-2.5 px-2 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5" /> {t.missionList}
                </button>
              )}
            </div>

            {/* Main Menu & Restart & Mute */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {onOpenMainMenu && (
                <button
                  onClick={onOpenMainMenu}
                  className="py-2 px-2 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" /> {t.backToMainMenu}
                </button>
              )}

              <button
                onClick={onToggleMute}
                className="py-2 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>

              <button
                onClick={onRestart}
                className="py-2 px-2 bg-slate-900 hover:bg-red-950 border border-slate-700 hover:border-red-500 text-slate-400 hover:text-red-300 text-xs font-mono rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> {t.retry}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
