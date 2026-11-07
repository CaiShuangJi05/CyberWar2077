import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, Map, Terminal, Volume2, VolumeX, BookOpen, RotateCcw, ChevronDown, ChevronUp, Award, Pause, Play, Layers, Home } from 'lucide-react';

interface ControlDockProps {
  viewMode: 'fps' | 'tactical';
  onToggleView: (mode?: 'fps' | 'tactical') => void;
  onOpenTacticalPanel: () => void;
  onOpenDossier: () => void;
  onOpenScores: () => void;
  onOpenLevelSelect?: () => void;
  onOpenMainMenu?: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  difficulty: number;
  onToggleDifficulty: () => void;
  isPaused?: boolean;
  onTogglePause?: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  viewMode,
  onToggleView,
  onOpenTacticalPanel,
  onOpenDossier,
  onOpenScores,
  onOpenLevelSelect,
  onOpenMainMenu,
  onRestart,
  isMuted,
  onToggleMute,
  difficulty,
  onToggleDifficulty,
  isPaused = false,
  onTogglePause,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-auto font-['Rajdhani',sans-serif]">
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mb-1 px-3 py-0.5 bg-[#0a0f1c]/90 border border-slate-700/80 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 text-[11px] font-mono rounded-t-md flex items-center gap-1 cursor-pointer backdrop-blur-sm transition-all"
        title="收起/展開底部控制塢"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>展開控制塢 (EXPAND)</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>收起控制塢 (CINEMA MODE)</span>
          </>
        )}
      </button>

      {/* Dock Container */}
      {!isCollapsed && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="flex items-center gap-2 px-4 py-2 bg-[#090d18]/92 border border-slate-800 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.7)] backdrop-blur-md"
        >
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => onToggleView('fps')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'fps'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>FPS 第一人稱</span>
            </button>
            <button
              onClick={() => onToggleView('tactical')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'tactical'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(255,42,133,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>戰術俯瞰視角</span>
            </button>
          </div>

          <div className="h-5 w-[1px] bg-slate-800" />

          {/* Tactical Panel Hotkey */}
          <button
            onClick={onOpenTacticalPanel}
            className="px-3 py-1.5 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>戰術重組面板 [TAB]</span>
          </button>

          {/* Mission Level Selection */}
          {onOpenLevelSelect && (
            <button
              onClick={onOpenLevelSelect}
              className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>作戰關卡 (MISSIONS)</span>
            </button>
          )}

          {/* Dossier Blueprint Modal */}
          <button
            onClick={onOpenDossier}
            className="px-3 py-1.5 bg-pink-950/60 hover:bg-pink-900 border border-pink-500/50 text-pink-300 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-pink-400" />
            <span>企劃素材藍圖</span>
          </button>

          {/* Score Evaluation */}
          <button
            onClick={onOpenScores}
            className="px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>結算計分系統</span>
          </button>

          {/* Main Menu Button */}
          {onOpenMainMenu && (
            <button
              onClick={onOpenMainMenu}
              className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/50 text-purple-300 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
              title="返回主選單 (三語言切換)"
            >
              <Home className="w-3.5 h-3.5 text-purple-400" />
              <span>主選單</span>
            </button>
          )}

          <div className="h-5 w-[1px] bg-slate-800" />

          {/* Difficulty Toggle */}
          <button
            onClick={onToggleDifficulty}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono rounded-lg cursor-pointer"
            title="切換難度倍率"
          >
            難度: <strong className="text-cyan-400">{difficulty === 1.0 ? 'NORMAL (1.0x)' : 'HARDCORE (1.5x)'}</strong>
          </button>

          {/* Pause / Resume Button */}
          <button
            onClick={onTogglePause}
            className={`p-2 rounded-lg border cursor-pointer transition-all ${
              isPaused
                ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title={isPaused ? '恢復遊戲 [P]' : '暫停遊戲 [P]'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-black" /> : <Pause className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg cursor-pointer"
            title={isMuted ? '開啟音效與合成器音樂' : '靜音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Reset Game */}
          <button
            onClick={onRestart}
            className="p-2 bg-slate-900 hover:bg-red-950 border border-slate-700 hover:border-red-500 text-slate-300 hover:text-red-300 rounded-lg cursor-pointer"
            title="重新啟動關卡"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};
