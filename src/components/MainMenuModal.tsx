import React from 'react';
import { Play, MapPin, Trophy, FileText, Globe, Shield, Zap, Target, Volume2, VolumeX, Eye, ArrowRight, HelpCircle } from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface MainMenuModalProps {
  isOpen: boolean;
  onStartGame: () => void;
  onOpenLevelSelect: () => void;
  onOpenLeaderboard: () => void;
  onOpenDossier: () => void;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  hasActiveSession?: boolean;
  onResumeGame?: () => void;
}

export const MainMenuModal: React.FC<MainMenuModalProps> = ({
  isOpen,
  onStartGame,
  onOpenLevelSelect,
  onOpenLeaderboard,
  onOpenDossier,
  currentLanguage,
  onSelectLanguage,
  isMuted,
  onToggleMute,
  hasActiveSession = false,
  onResumeGame,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLanguage];

  const languages: { id: Language; label: string; nativeName: string; flag: string }[] = [
    { id: 'zh-TW', label: '繁體中文', nativeName: '繁體中文', flag: '🇹🇼' },
    { id: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
    { id: 'id', label: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto font-mono select-none">
      {/* Background Cyber Grid Accent */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative w-full max-w-4xl bg-slate-950/95 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Header: Language Switcher & Audio Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-slate-900/60 backdrop-blur-md">
          {/* Badge */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            <span className="text-xs font-bold tracking-widest text-cyan-300 uppercase">
              {t.gameBadge}
            </span>
          </div>

          {/* Dedicated 3-Language Switcher (繁體中文 · English · Bahasa Indonesia) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-cyan-500/30 rounded-xl shadow-inner">
              <Globe className="w-4 h-4 text-cyan-400 ml-1.5 mr-0.5" />
              {languages.map((lang) => {
                const isActive = currentLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => onSelectLanguage(lang.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_12px_rgba(0,240,255,0.5)] scale-105'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </button>
                );
              })}
            </div>

            {/* Audio Toggle */}
            <button
              onClick={onToggleMute}
              className="p-2 bg-slate-900/90 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
              title={isMuted ? 'Unmute BGM & SFX' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Hero Section: Game Branding & High-Impact Typography */}
        <div className="px-8 py-6 bg-gradient-to-b from-cyan-950/20 via-slate-950/60 to-transparent border-b border-slate-800/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                {t.gameTitle}
              </h1>
              <div className="text-xs sm:text-sm font-bold tracking-widest text-cyan-400 uppercase">
                {t.gameSubtitle}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2">
                {t.gameDescription}
              </p>
            </div>

            {/* Main Action CTAs */}
            <div className="flex flex-col gap-2.5 shrink-0 min-w-[240px]">
              {hasActiveSession && onResumeGame && (
                <button
                  onClick={onResumeGame}
                  className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {t.resumeMission}
                </button>
              )}

              <button
                onClick={onStartGame}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" />
                {t.startMission}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenLevelSelect}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-cyan-400" />
                {t.selectLevel}
              </button>
            </div>
          </div>
        </div>

        {/* Content Section: 3 Innovation Pillars & Field Controls */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* 3 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pillar 1: Anti-Dizziness */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 hover:border-cyan-500/40 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 mb-1">{t.feature1Title}</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">{t.feature1Desc}</p>
            </div>

            {/* Pillar 2: Soft-Pressure */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 hover:border-purple-500/40 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 mb-1">{t.feature2Title}</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">{t.feature2Desc}</p>
            </div>

            {/* Pillar 3: Kills & Score Rank */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 hover:border-amber-500/40 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 mb-1">{t.feature3Title}</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">{t.feature3Desc}</p>
            </div>
          </div>

          {/* Quick Guide & Operation Grid */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 sm:p-5">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              {t.controlsTitle}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-slate-300 font-sans">
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center gap-2">
                <span className="font-mono text-cyan-400 font-bold px-1.5 py-0.5 bg-slate-900 rounded border border-cyan-500/30 text-[11px]">
                  WASD
                </span>
                <span>{t.ctrlMove.split('：')[1] || t.ctrlMove}</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center gap-2">
                <span className="font-mono text-purple-400 font-bold px-1.5 py-0.5 bg-slate-900 rounded border border-purple-500/30 text-[11px]">
                  HOLD CLICK
                </span>
                <span>{t.ctrlPressure.split('：')[1] || t.ctrlPressure}</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center gap-2">
                <span className="font-mono text-amber-400 font-bold px-1.5 py-0.5 bg-slate-900 rounded border border-amber-500/30 text-[11px]">
                  TAB
                </span>
                <span>{t.ctrlView.split('：')[1] || t.ctrlView}</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center gap-2">
                <span className="font-mono text-emerald-400 font-bold px-1.5 py-0.5 bg-slate-900 rounded border border-emerald-500/30 text-[11px]">
                  E
                </span>
                <span>{t.ctrlInteract.split('：')[1] || t.ctrlInteract}</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center gap-2">
                <span className="font-mono text-sky-400 font-bold px-1.5 py-0.5 bg-slate-900 rounded border border-sky-500/30 text-[11px]">
                  1 - 4
                </span>
                <span>{t.ctrlWeapons.split('：')[1] || t.ctrlWeapons}</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center gap-2">
                <span className="font-mono text-yellow-400 font-bold px-1.5 py-0.5 bg-slate-900 rounded border border-yellow-500/30 text-[11px]">
                  P / ESC
                </span>
                <span>{t.ctrlPause.split('：')[1] || t.ctrlPause}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Additional Modal Triggers (Leaderboard, Dossier) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-slate-800 bg-slate-950 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLeaderboard}
              className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              {t.leaderboard}
            </button>

            <button
              onClick={onOpenDossier}
              className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              {t.dossier}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            NEO-NIGHTS PROTOCOL · THREE.JS ENGINE · HTML5 / CSS / JS
          </div>
        </div>
      </div>
    </div>
  );
};
