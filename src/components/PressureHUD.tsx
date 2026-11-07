import React from 'react';
import { Target, Trophy, Zap, Shield, Eye, Pause, Play, Volume2, VolumeX, ListOrdered, Home, Globe } from 'lucide-react';
import { GameRank } from '../types/game';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface PressureHUDProps {
  kills: number;
  score: number;
  rank: GameRank;
  pressureLevel: number; // 0.0 to 1.0
  pressurePhase: 'idle' | 'jamming' | 'resonance' | 'overdrive';
  isSoftPressing: boolean;
  combo: number;
  playerHp: number;
  playerMaxHp: number;
  cyberEnergy: number;
  countdownSeconds: number;
  viewMode: 'fps' | 'tactical';
  onToggleView: () => void;
  zoomLevel: 'wide' | 'normal' | 'close';
  onChangeZoom: (zoom: 'wide' | 'normal' | 'close') => void;
  isPaused: boolean;
  onTogglePause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLeaderboard: () => void;
  onOpenTacticalPanel: () => void;
  currentLevelName: string;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onOpenMainMenu: () => void;
}

export const PressureHUD: React.FC<PressureHUDProps> = ({
  kills,
  score,
  rank,
  pressureLevel,
  pressurePhase,
  isSoftPressing,
  combo,
  playerHp,
  playerMaxHp,
  cyberEnergy,
  countdownSeconds,
  viewMode,
  onToggleView,
  zoomLevel,
  onChangeZoom,
  isPaused,
  onTogglePause,
  isMuted,
  onToggleMute,
  onOpenLeaderboard,
  onOpenTacticalPanel,
  currentLevelName,
  currentLanguage,
  onSelectLanguage,
  onOpenMainMenu,
}) => {
  const t = TRANSLATIONS[currentLanguage];

  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const getRankColor = (r: GameRank) => {
    switch (r) {
      case 'SSS':
        return 'from-amber-400 to-yellow-500 text-amber-300 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
      case 'S':
        return 'from-cyan-400 to-blue-500 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]';
      case 'A':
        return 'from-purple-400 to-indigo-500 text-purple-300 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
      case 'B':
        return 'from-blue-400 to-cyan-500 text-blue-300 border-blue-400';
      default:
        return 'from-slate-400 to-slate-600 text-slate-300 border-slate-500';
    }
  };

  const getPhaseInfo = () => {
    switch (pressurePhase) {
      case 'jamming':
        return {
          title: t.pressurePhase1,
          desc: t.pressurePhase1Desc,
          color: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40',
          barColor: 'bg-cyan-400',
        };
      case 'resonance':
        return {
          title: t.pressurePhase2,
          desc: t.pressurePhase2Desc,
          color: 'text-purple-400 border-purple-500/50 bg-purple-950/40',
          barColor: 'bg-purple-400',
        };
      case 'overdrive':
        return {
          title: t.pressurePhase3,
          desc: t.pressurePhase3Desc,
          color: 'text-amber-400 border-amber-500/50 bg-amber-950/40 animate-pulse',
          barColor: 'bg-amber-400',
        };
      default:
        return {
          title: t.pressureIdle,
          desc: t.pressureIdleDesc,
          color: 'text-slate-400 border-slate-700 bg-slate-900/60',
          barColor: 'bg-cyan-500',
        };
    }
  };

  const phaseInfo = getPhaseInfo();
  const pressurePercent = Math.round(pressureLevel * 100);

  const nextLanguage = (): Language => {
    if (currentLanguage === 'zh-TW') return 'en';
    if (currentLanguage === 'en') return 'id';
    return 'zh-TW';
  };

  const langLabels: Record<Language, string> = {
    'zh-TW': '繁中 🇹🇼',
    en: 'EN 🇬🇧',
    id: 'ID 🇮🇩',
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-4 font-mono select-none">
      {/* 1. TOP HEADER: Essential Display (Kills, Score, Rank, Time, Comfort Controls) */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Left: Player Status & Level Info */}
        <div className="pointer-events-auto flex flex-col gap-2 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-2.5 sm:p-3 rounded-xl shadow-lg min-w-[200px]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold truncate max-w-[140px]">{currentLevelName}</span>
            <span className="text-cyan-400 text-[11px]">{t.operativeStatus}</span>
          </div>

          {/* HP Bar */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1 text-red-400 font-semibold">
                <Shield className="w-3.5 h-3.5" /> {t.hp}
              </span>
              <span className="text-slate-200 tabular-nums">
                {playerHp} / {playerMaxHp}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-rose-400 transition-all duration-200"
                style={{ width: `${(playerHp / playerMaxHp) * 100}%` }}
              />
            </div>
          </div>

          {/* Cyber Shell Energy */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                <Zap className="w-3.5 h-3.5" /> {t.cyberEnergy}
              </span>
              <span className="text-slate-200 tabular-nums">{Math.round(cyberEnergy)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-200"
                style={{ width: `${cyberEnergy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: MANDATORY REQUIREMENT DISPLAY - KILLS, SCORE & RANK */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 bg-slate-950/95 backdrop-blur-md border border-cyan-500/40 p-2 sm:p-2.5 px-4 sm:px-6 rounded-2xl shadow-[0_0_25px_rgba(0,240,255,0.25)]">
          {/* Enemies Killed Counter */}
          <div className="flex items-center gap-2 pr-3 sm:pr-5 border-r border-slate-800">
            <div className="p-1.5 sm:p-2 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30">
              <Target className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                {t.kills}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                {kills}
                <span className="text-xs font-normal text-slate-400 ml-1">{t.killsUnit}</span>
              </div>
            </div>
          </div>

          {/* Total Score Counter */}
          <div className="flex items-center gap-2 px-2 sm:px-4 pr-3 sm:pr-5 border-r border-slate-800">
            <div className="p-1.5 sm:p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                {t.score}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tabular-nums drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                {score.toLocaleString()}
                <span className="text-xs font-normal text-amber-300/70 ml-1">PTS</span>
              </div>
            </div>
          </div>

          {/* Current Rank Badge */}
          <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2">
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                {t.rank}
              </div>
              <div
                className={`text-xl sm:text-2xl font-black px-2.5 sm:px-3 py-0.5 rounded-lg border bg-gradient-to-br ${getRankColor(
                  rank
                )}`}
              >
                {rank}
              </div>
            </div>

            {/* Combo multiplier */}
            {combo > 1.0 && (
              <div className="hidden sm:block bg-purple-950/80 border border-purple-500/40 px-2 py-1 rounded text-center">
                <div className="text-[9px] text-purple-300">{t.combo}</div>
                <div className="text-xs sm:text-sm font-bold text-purple-400">{combo.toFixed(1)}x</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls, 3-Language Switcher, Zoom, Main Menu & Pause */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-2 rounded-xl shadow-lg">
          {/* Mission Timer */}
          <div className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-center">
            <div className="text-[8px] sm:text-[9px] text-slate-400">{t.timeRemaining}</div>
            <div className="text-sm sm:text-base font-bold text-cyan-300 tabular-nums">{timeFormatted}</div>
          </div>

          {/* View Mode Toggle (Anti-Dizziness Isometric vs FPS) */}
          <button
            onClick={onToggleView}
            className={`px-2 sm:px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === 'tactical'
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle View Mode"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{viewMode === 'tactical' ? t.viewTactical : t.viewFps}</span>
          </button>

          {/* Zoom controls for comfortable isometric viewing */}
          {viewMode === 'tactical' && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[11px]">
              <button
                onClick={() => onChangeZoom('wide')}
                className={`px-2 py-1 rounded cursor-pointer ${
                  zoomLevel === 'wide' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title={t.zoomWide}
              >
                {t.zoomWide}
              </button>
              <button
                onClick={() => onChangeZoom('normal')}
                className={`px-2 py-1 rounded cursor-pointer ${
                  zoomLevel === 'normal' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title={t.zoomNormal}
              >
                {t.zoomNormal}
              </button>
              <button
                onClick={() => onChangeZoom('close')}
                className={`px-2 py-1 rounded cursor-pointer ${
                  zoomLevel === 'close' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title={t.zoomClose}
              >
                {t.zoomClose}
              </button>
            </div>
          )}

          {/* 3-Language Fast Switcher */}
          <button
            onClick={() => onSelectLanguage(nextLanguage())}
            className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            title={t.languageSelect}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{langLabels[currentLanguage]}</span>
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 rounded-lg transition-colors cursor-pointer"
            title={t.leaderboard}
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* Main Menu Button */}
          <button
            onClick={onOpenMainMenu}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 rounded-lg transition-colors cursor-pointer"
            title={t.backToMainMenu}
          >
            <Home className="w-4 h-4" />
          </button>

          {/* Audio toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Pause button */}
          <button
            onClick={onTogglePause}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-yellow-400" />}
          </button>
        </div>
      </div>

      {/* 2. BOTTOM CENTER: SOFT-PRESSURE SUPPRESSION SYSTEM STATUS */}
      <div className="flex flex-col items-center">
        <div className="pointer-events-auto w-full max-w-xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 p-3 sm:p-3.5 rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.25)] flex flex-col gap-2">
          {/* Pressure Gauge Header */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${isSoftPressing ? 'text-amber-400 animate-spin' : 'text-cyan-400'}`} />
              <span className="font-bold text-white">{t.pressureSystemTitle}</span>
              <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded border ${phaseInfo.color}`}>
                {phaseInfo.title}
              </span>
            </div>
            <div className="font-bold text-cyan-300 tabular-nums text-xs sm:text-sm">
              {t.pressureValue}: {pressurePercent}%
            </div>
          </div>

          {/* Soft-Pressure Progress Bar */}
          <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            {/* Phase 1 Marker (15%) */}
            <div className="absolute top-0 bottom-0 left-[15%] w-px bg-cyan-500/40 z-10" />
            {/* Phase 2 Marker (45%) */}
            <div className="absolute top-0 bottom-0 left-[45%] w-px bg-purple-500/40 z-10" />
            {/* Phase 3 Marker (75%) */}
            <div className="absolute top-0 bottom-0 left-[75%] w-px bg-amber-500/40 z-10" />

            <div
              className={`h-full ${phaseInfo.barColor} transition-all duration-75`}
              style={{ width: `${pressurePercent}%` }}
            />
          </div>

          {/* Phase Explanations & Instruction */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className={pressurePercent >= 15 ? 'text-cyan-300 font-bold' : 'opacity-60'}>
                [15%]
              </span>
              <span>·</span>
              <span className={pressurePercent >= 45 ? 'text-purple-300 font-bold' : 'opacity-60'}>
                [45%]
              </span>
              <span>·</span>
              <span className={pressurePercent >= 75 ? 'text-amber-300 font-bold' : 'opacity-60'}>
                [75%]
              </span>
            </div>
            <span className="text-cyan-400 font-sans text-[10px] sm:text-[11px] font-medium">
              {t.pressureHint}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
