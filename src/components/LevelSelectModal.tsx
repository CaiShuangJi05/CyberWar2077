import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Crosshair, MapPin, ChevronRight, X, Play, Clock, Sparkles } from 'lucide-react';
import { MissionLevel } from '../types/game';
import { MISSION_LEVELS } from '../game/levels';

interface LevelSelectModalProps {
  isOpen: boolean;
  currentLevelIndex: number;
  onSelectLevel: (index: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  currentLevelIndex,
  onSelectLevel,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-['Rajdhani',sans-serif]">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-4xl bg-[#090d18] border-2 border-cyan-500/70 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden text-slate-100 p-6 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-900/60 pb-4 mb-5">
            <div>
              <div className="inline-block px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-[11px] font-mono text-cyan-300 mb-1">
                TACTICAL DEPLOYMENT PROTOCOLS // 戰術關卡任務選擇
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300">
                新夜城任務區域 (SELECT MISSION ZONE)
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Level Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto pr-1">
            {MISSION_LEVELS.map((level, idx) => {
              const isSelected = idx === currentLevelIndex;
              const themeStyles = {
                carnival: {
                  badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60',
                  cardBorder: isSelected ? 'border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.4)]' : 'border-slate-800 hover:border-cyan-500/50',
                  accent: 'text-cyan-400',
                  tag: 'NEON PARK',
                },
                docks: {
                  badge: 'bg-amber-950/80 text-amber-300 border-amber-500/60',
                  cardBorder: isSelected ? 'border-amber-400 shadow-[0_0_25px_rgba(255,170,0,0.4)]' : 'border-slate-800 hover:border-amber-500/50',
                  accent: 'text-amber-400',
                  tag: 'CARGO LOGISTICS',
                },
                reactor: {
                  badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60',
                  cardBorder: isSelected ? 'border-emerald-400 shadow-[0_0_25px_rgba(0,255,136,0.4)]' : 'border-slate-800 hover:border-emerald-500/50',
                  accent: 'text-emerald-400',
                  tag: 'SUB-CORE HAZARD',
                },
              }[level.environmentType];

              return (
                <div
                  key={level.id}
                  className={`relative flex flex-col justify-between p-4 rounded-xl bg-[#060a14] border-2 transition-all duration-300 ${themeStyles.cardBorder}`}
                >
                  {/* Top status indicator */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${themeStyles.badge}`}>
                        MISSION 0{level.levelNumber}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" /> {level.timeLimit}s
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
                      {level.name}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400 mb-3">{level.subtitle}</p>

                    {/* Briefing summary */}
                    <div className="bg-[#0b1020] p-2.5 rounded-lg border border-slate-800/80 text-xs text-slate-300 mb-3 leading-relaxed min-h-[70px]">
                      {level.briefing}
                    </div>

                    {/* Contrabands preview */}
                    <div className="space-y-1 mb-4 text-[11px] font-mono">
                      <div className="text-slate-400 font-bold flex items-center gap-1">
                        <Crosshair className="w-3 h-3 text-pink-400" /> 目標違禁品:
                      </div>
                      {level.contrabands.map((cb) => (
                        <div key={cb.id} className="flex justify-between text-slate-300 pl-2">
                          <span className="truncate max-w-[150px]">{cb.name.split(' (')[0]}</span>
                          <span className="text-amber-400">+{cb.points}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deploy Action Button */}
                  <div>
                    {isSelected ? (
                      <div className="w-full py-2.5 rounded-lg bg-cyan-950/80 border border-cyan-400/80 text-cyan-300 text-xs font-bold text-center flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4 text-cyan-400" />
                        <span>目前作戰區域 (ACTIVE)</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          onSelectLevel(idx);
                          onClose();
                        }}
                        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>進入該關卡 (DEPLOY)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>※ 切換關卡將重新載入專屬 3D 場景、動態貨架導軌、敵軍配置與違禁品目標。</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              關閉 (CLOSE)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
