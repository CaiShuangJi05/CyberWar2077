import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Eye, Shield, Cpu, Zap, X } from 'lucide-react';

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DossierModal: React.FC<DossierModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'character' | 'concept'>('character');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-['Rajdhani',sans-serif]">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-5xl bg-[#080c16] border-2 border-[#ff2a85]/70 rounded-2xl shadow-[0_0_60px_rgba(255,42,133,0.3)] flex flex-col max-h-[92vh] overflow-hidden text-slate-100"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0c1220] border-b border-[#ff2a85]/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-950/80 border border-pink-500 rounded-lg">
              <FileText className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wider text-pink-300">
                NEO-NIGHTS PROTOCOL DOSSIER (機密企劃與角色藍圖)
              </h2>
              <div className="text-xs font-mono text-slate-400">
                CONTRABAND PROTOCOL // OFFICIAL ASSET REFERENCE
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-[#090d18] px-6">
          <button
            onClick={() => setActiveTab('character')}
            className={`py-3 px-6 text-sm font-bold tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'character'
                ? 'border-pink-500 text-pink-400 bg-pink-950/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" /> 角色設定圖 (NEO-NIGHTS ALPHA)
          </button>
          <button
            onClick={() => setActiveTab('concept')}
            className={`py-3 px-6 text-sm font-bold tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'concept'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" /> 戰術 UI 與機制架構圖 (TACTICAL SUITE)
          </button>
        </div>

        {/* Image Display & Specification Details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'character' ? (
            <div>
              <div className="rounded-xl overflow-hidden border border-pink-500/40 shadow-lg bg-black flex justify-center">
                <img
                  src="/public/assets/aistudio/Gemini_Generated_Image_wc223qwc223qwc22_2a8ee642.jfif"
                  alt="Neo-Nights Alpha Character Sheet"
                  className="w-full max-h-[58vh] object-contain"
                />
              </div>

              {/* Character Specs Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs font-mono">
                <div className="bg-[#0b101c] p-3 rounded border border-slate-800">
                  <span className="text-pink-400 font-bold block mb-1">CYBER SHELL (POWER PACK)</span>
                  <p className="text-slate-300">
                    多電池供電系統、主動散熱通風口、背部外骨骼神經連接介面。
                  </p>
                </div>
                <div className="bg-[#0b101c] p-3 rounded border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-1">VOLT-AR RIFLE</span>
                  <p className="text-slate-300">
                    電磁線圈陣列 (EM Coil Array)、光學全息導軌、高能電池匣，發射高速穿甲電磁束。
                  </p>
                </div>
                <div className="bg-[#0b101c] p-3 rounded border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">COLOR PALETTE</span>
                  <div className="flex gap-2 mt-1">
                    <span className="w-5 h-5 rounded bg-[#12151c] border border-slate-700" title="Dark Gray" />
                    <span className="w-5 h-5 rounded bg-[#ff2a85]" title="Neon Pink" />
                    <span className="w-5 h-5 rounded bg-[#00f0ff]" title="Neon Cyan" />
                    <span className="w-5 h-5 rounded bg-[#4c1d95]" title="Deep Violet" />
                    <span className="w-5 h-5 rounded bg-[#ff7700]" title="Electric Orange" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="rounded-xl overflow-hidden border border-cyan-500/40 shadow-lg bg-black flex justify-center">
                <img
                  src="/public/assets/aistudio/Gemini_Generated_Image_cj7lolcj7lolcj7l_d6a7df7a.jfif"
                  alt="Neo-Nights Tactical Concept Sheet"
                  className="w-full max-h-[58vh] object-contain"
                />
              </div>

              {/* Tactical System Specs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs font-mono">
                <div className="bg-[#0b101c] p-3 rounded border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-1">1. TACTICAL REROUTING PANEL</span>
                  <p className="text-slate-300">
                    虛擬終端即時規劃貨架導軌路線，利用防彈貨架作為推進掩體並運送高危違禁品。
                  </p>
                </div>
                <div className="bg-[#0b101c] p-3 rounded border border-slate-800">
                  <span className="text-pink-400 font-bold block mb-1">2. RESCUE PROTOCOL</span>
                  <p className="text-slate-300">
                    隊友倒地自動折疊進賽博防爆袋，靠近解鎖拉鏈、手動拉出並進行 2 秒電擊重啟重返戰鬥。
                  </p>
                </div>
                <div className="bg-[#0b101c] p-3 rounded border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">3. SCORING & RATING</span>
                  <p className="text-slate-300">
                    違禁品價值 + 擊殺 + 路徑效率 - 裝袋救援懲罰與時間扣分，評定 S/A/B/C 評級。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
