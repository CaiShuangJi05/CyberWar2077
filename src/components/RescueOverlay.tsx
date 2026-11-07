import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, ShieldAlert, Cpu, Zap, Activity } from 'lucide-react';

interface RescueOverlayProps {
  isVisible: boolean;
  isCrouched: boolean;
  extractProgress: number; // 0 - 100
  state: 'extracting' | 'rebooting' | 'idle';
  targetCallsign?: string;
}

export const RescueOverlay: React.FC<RescueOverlayProps> = ({
  isVisible,
  isCrouched,
  extractProgress,
  state,
  targetCallsign = 'TEAMMATE',
}) => {
  if (!isVisible && state === 'idle') return null;

  const currentStep =
    state === 'rebooting'
      ? 4
      : state === 'extracting'
      ? 3
      : isCrouched
      ? 2
      : 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        className="fixed right-6 top-20 z-40 w-80 bg-[#0b0e18]/90 border border-[#ff2a85]/50 backdrop-blur-md rounded-lg p-4 shadow-[0_0_25px_rgba(255,42,133,0.25)] text-slate-100 font-['Rajdhani',sans-serif]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ff2a85]/40 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#ff2a85]" />
            <h3 className="font-bold text-sm tracking-wider text-[#ff2a85] uppercase">
              TEAMMATE RESCUE PROTOCOL
            </h3>
          </div>
          <span className="text-[11px] font-mono bg-[#ff2a85]/20 text-[#ff2a85] px-2 py-0.5 rounded border border-[#ff2a85]/40">
            隊友救援協議
          </span>
        </div>

        <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
          <span>TARGET: <strong className="text-cyan-400">{targetCallsign}</strong></span>
          <span className="text-amber-400 font-mono">PENALTY: -500 PTS</span>
        </div>

        {/* Steps Flow (Matching Concept Sheet Right Column) */}
        <div className="space-y-2">
          {/* Step 1: PLAYER CROUCHED */}
          <div
            className={`flex items-center gap-3 p-2 rounded border transition-all ${
              currentStep >= 1
                ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className={`p-1.5 rounded ${isCrouched ? 'bg-cyan-500 text-black' : 'bg-slate-800'}`}>
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-semibold">1. PLAYER CROUCHED (蹲伏)</div>
              <div className="text-[10px] text-slate-400">{isCrouched ? 'STATUS: READY' : 'PRESS [C] TO CROUCH'}</div>
            </div>
            {isCrouched && <span className="text-xs font-mono text-cyan-400">OK</span>}
          </div>

          {/* Step 2: INTERACT WITH CYBER BAG */}
          <div
            className={`flex items-center gap-3 p-2 rounded border transition-all ${
              currentStep >= 2
                ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className={`p-1.5 rounded ${currentStep >= 2 ? 'bg-cyan-500 text-black' : 'bg-slate-800'}`}>
              <Cpu className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-semibold">2. CYBER CONTAINMENT BAG</div>
              <div className="text-[10px] text-slate-400">HOLD [E] TO UNZIP FLAP</div>
            </div>
          </div>

          {/* Step 3: PULL OUT TEAMMATE BODY */}
          <div
            className={`p-2 rounded border transition-all ${
              state === 'extracting'
                ? 'bg-pink-950/60 border-pink-500 text-pink-300 shadow-[0_0_15px_rgba(255,42,133,0.3)]'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#ff2a85]" />
                3. PULL OUT TEAMMATE BODY
              </span>
              <span className="font-mono text-pink-400">{Math.floor(extractProgress)}%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-pink-900">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 to-cyan-400"
                style={{ width: `${extractProgress}%` }}
              />
            </div>
            <div className="text-[10px] text-pink-300/80 mt-1">
              {state === 'extracting' ? 'UNZIPPING & DECOMPRESSING...' : 'WAITING FOR EXTRACTION'}
            </div>
          </div>

          {/* Step 4: REBOOTING */}
          <div
            className={`flex items-center gap-3 p-2 rounded border transition-all ${
              state === 'rebooting'
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)] animate-pulse'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className={`p-1.5 rounded ${state === 'rebooting' ? 'bg-cyan-400 text-black' : 'bg-slate-800'}`}>
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-semibold">4. 2S ELECTROSHOCK REBOOT</div>
              <div className="text-[10px] text-cyan-400 font-mono">
                {state === 'rebooting' ? 'DEFIBRILLATION IN PROGRESS...' : 'WAITING FOR SIGNAL'}
              </div>
            </div>
          </div>

          {/* Step 5: REJOIN */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pt-1 font-mono">
            <span>5. REJOIN BATTLE (重返戰鬥)</span>
            <span className="text-emerald-400">RESTORE 65% HP</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
