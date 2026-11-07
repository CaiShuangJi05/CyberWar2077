import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Terminal, Navigation, Shield, Play, Pause, RotateCcw, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { CommMessage, Contraband, PathNode } from '../types/game';

interface TacticalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  shelfPath: PathNode[];
  onUpdatePath: (path: PathNode[]) => void;
  isShelfMoving: boolean;
  onToggleShelfMove: () => void;
  damageBlocked: number;
  shelfHp: number;
  maxShelfHp: number;
  contrabandsOnShelf: Contraband[];
  commMessages: CommMessage[];
  onSendPing: (text: string) => void;
  playerPos: { x: number; z: number };
  shelfPos: { x: number; z: number };
  currentMissionName?: string;
  currentMissionCode?: string;
  onOpenLevelSelect?: () => void;
}

export const TacticalPanel: React.FC<TacticalPanelProps> = ({
  isOpen,
  onClose,
  shelfPath,
  onUpdatePath,
  isShelfMoving,
  onToggleShelfMove,
  damageBlocked,
  shelfHp,
  maxShelfHp,
  contrabandsOnShelf,
  commMessages,
  onSendPing,
  playerPos,
  shelfPos,
  currentMissionName = '廢棄賽博遊樂園',
  currentMissionCode = 'PROTOCOL-01',
  onOpenLevelSelect,
}) => {
  const [customMsg, setCustomMsg] = useState('');

  if (!isOpen) return null;

  // Map coordinate transformation (-20 to 20 range mapped to 300x300 svg)
  const mapScale = 7;
  const mapCenter = 150;
  const toSvgX = (x: number) => mapCenter + x * mapScale;
  const toSvgY = (z: number) => mapCenter + z * mapScale;

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = e.clientX - rect.left;
    const svgY = e.clientY - rect.top;
    const worldX = Math.round(((svgX - mapCenter) / mapScale) * 10) / 10;
    const worldZ = Math.round(((svgY - mapCenter) / mapScale) * 10) / 10;

    // Add node before destination
    const newPath = [...shelfPath];
    newPath.splice(newPath.length - 1, 0, {
      id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      x: worldX,
      z: worldZ,
      order: newPath.length,
    });
    onUpdatePath(newPath);
  };

  const handleResetDefaultRoute = () => {
    const defaultRoute: PathNode[] = [
      { id: 'p1', x: 0, z: 7.5, order: 0 },
      { id: 'p2', x: -3, z: 3.5, order: 1 },
      { id: 'p3', x: -3, z: -2.5, order: 2 },
      { id: 'p4', x: 2, z: -7.5, order: 3 },
      { id: 'p5', x: 7, z: -11.5, order: 4 },
      { id: 'p6', x: 10, z: -16, order: 5 },
    ];
    onUpdatePath(defaultRoute);
  };

  const handleFlankRoute = () => {
    const flankRoute: PathNode[] = [
      { id: 'p1', x: 0, z: 7.5, order: 0 },
      { id: 'p2', x: 6, z: 4.5, order: 1 },
      { id: 'p3', x: 8, z: -2.0, order: 2 },
      { id: 'p4', x: 10, z: -8.0, order: 3 },
      { id: 'p5', x: 10, z: -16, order: 4 },
    ];
    onUpdatePath(flankRoute);
  };

  const handleClearNodes = () => {
    // Keep start and destination
    onUpdatePath([shelfPath[0], shelfPath[shelfPath.length - 1]]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    onSendPing(customMsg);
    setCustomMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-4xl bg-[#090d16] border-2 border-cyan-500/70 rounded-xl shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col max-h-[92vh] overflow-hidden text-slate-100 font-['Rajdhani',sans-serif]"
      >
        {/* Top Terminal Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#0d1320] border-b border-cyan-500/40">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-cyan-950 border border-cyan-400 rounded">
              <Terminal className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wider text-cyan-300">
                TACTICAL REROUTING PANEL (戰術重組面板)
              </h2>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <span>{currentMissionCode} : {currentMissionName}</span>
                {onOpenLevelSelect && (
                  <button
                    onClick={onOpenLevelSelect}
                    className="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-800 border border-cyan-500/50 text-[10px] text-cyan-300 cursor-pointer transition-colors"
                  >
                    [選擇任務關卡]
                  </button>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-red-950/60 hover:bg-red-900 border border-red-500 text-red-200 text-xs font-mono rounded cursor-pointer transition-colors"
          >
            [ESC / 關閉終端]
          </button>
        </div>

        {/* Content Body: 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 overflow-y-auto">
          {/* Left Column: Interactive Hologram Map */}
          <div className="md:col-span-7 flex flex-col bg-[#060910] p-4 rounded-lg border border-cyan-900/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                <Navigation className="w-4 h-4" />
                <span>USER-DESIGNED SHELF PATH (點擊地圖自訂路徑節點)</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                WAYPOINTS: {shelfPath.length}
              </span>
            </div>

            {/* SVG Interactive Map */}
            <div className="relative w-full aspect-square bg-[#050811] rounded border border-cyan-950 overflow-hidden flex items-center justify-center">
              <svg
                viewBox="0 0 300 300"
                className="w-full h-full cursor-crosshair"
                onClick={handleMapClick}
              >
                {/* Grid Lines */}
                <defs>
                  <pattern id="tacGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#121d30" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="300" height="300" fill="url(#tacGrid)" />

                {/* Broken Carousel Landmark */}
                <circle cx={toSvgX(-5)} cy={toSvgY(4)} r="26" fill="rgba(255, 42, 133, 0.1)" stroke="#ff2a85" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x={toSvgX(-5)} y={toSvgY(4)} fill="#ff2a85" fontSize="8" textAnchor="middle" dominantBaseline="middle" fontFamily="Rajdhani">
                  NEON CAROUSEL
                </text>

                {/* Extraction Zone */}
                <circle cx={toSvgX(10)} cy={toSvgY(-16)} r="20" fill="rgba(255, 170, 0, 0.15)" stroke="#ffaa00" strokeWidth="2" />
                <text x={toSvgX(10)} y={toSvgY(-16)} fill="#ffaa00" fontSize="9" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                  VIP EXTRACT
                </text>

                {/* Rail Path Polyline */}
                <polyline
                  points={shelfPath.map((p) => `${toSvgX(p.x)},${toSvgY(p.z)}`).join(' ')}
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />

                {/* Waypoint Nodes */}
                {shelfPath.map((node, i) => (
                  <g key={node.id}>
                    <circle
                      cx={toSvgX(node.x)}
                      cy={toSvgY(node.z)}
                      r={i === 0 ? 6 : i === shelfPath.length - 1 ? 6 : 4.5}
                      fill={i === 0 ? '#00ff88' : i === shelfPath.length - 1 ? '#ffaa00' : '#00f0ff'}
                    />
                    <text
                      x={toSvgX(node.x)}
                      y={toSvgY(node.z) - 7}
                      fill="#ffffff"
                      fontSize="7"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      P{i + 1}
                    </text>
                  </g>
                ))}

                {/* Player Current Position */}
                <g transform={`translate(${toSvgX(playerPos.x)}, ${toSvgY(playerPos.z)})`}>
                  <circle r="5" fill="#ffffff" stroke="#00f0ff" strokeWidth="2" />
                  <text y="-8" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                    ALPHA
                  </text>
                </g>

                {/* Moving Shelf Position */}
                <g transform={`translate(${toSvgX(shelfPos.x)}, ${toSvgY(shelfPos.z)})`}>
                  <rect x="-7" y="-7" width="14" height="14" fill="#ffaa00" stroke="#ffffff" strokeWidth="1.5" />
                  <text y="14" fill="#ffaa00" fontSize="8" fontWeight="bold" textAnchor="middle">
                    SHELF
                  </text>
                </g>
              </svg>

              <div className="absolute bottom-2 left-2 text-[10px] font-mono text-cyan-400 bg-[#090e1a]/80 px-2 py-1 rounded border border-cyan-800">
                [CLICK ON GRID TO INSERT ROUTE NODE]
              </div>
            </div>

            {/* Route Presets Bar */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleResetDefaultRoute}
                className="flex-1 py-1.5 px-2 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs rounded transition-colors font-mono"
              >
                [標準正面路線]
              </button>
              <button
                onClick={handleFlankRoute}
                className="flex-1 py-1.5 px-2 bg-pink-950/60 hover:bg-pink-900 border border-pink-500/60 text-pink-300 text-xs rounded transition-colors font-mono"
              >
                [右側掩體側襲]
              </button>
              <button
                onClick={handleClearNodes}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs rounded transition-colors font-mono"
              >
                清除中繼
              </button>
            </div>
          </div>

          {/* Right Column: Shelf Status & Comms Log */}
          <div className="md:col-span-5 flex flex-col gap-4">
            {/* Shelf Configuration Card */}
            <div className="bg-[#060910] p-4 rounded-lg border border-cyan-900/60">
              <div className="flex items-center justify-between mb-3 border-b border-cyan-900/40 pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">SHELF CONFIGURATION (貨架配置)</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ONLINE
                </span>
              </div>

              {/* Status metrics */}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>ARMOR INTEGRITY (防彈裝甲值)</span>
                    <span className="font-mono text-cyan-400">{shelfHp} / {maxShelfHp} HP</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${(shelfHp / maxShelfHp) * 100}%` }} />
                  </div>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">DAMAGE BLOCKED (阻擋傷害)</span>
                  <span className="font-mono text-emerald-400">+{damageBlocked} PTS</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">CARGO SLOTS (已裝載違禁品)</span>
                  <span className="font-mono text-pink-400">{contrabandsOnShelf.length} / 3 件</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">SPEED (推進速度)</span>
                  <span className="font-mono text-cyan-300">2.4 M/S</span>
                </div>
              </div>

              {/* Toggle Movement Button */}
              <button
                onClick={onToggleShelfMove}
                className={`w-full mt-3 py-2.5 px-4 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isShelfMoving
                    ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(255,170,0,0.4)]'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                }`}
              >
                {isShelfMoving ? (
                  <>
                    <Pause className="w-4 h-4" /> 暫停貨架推進 (HALT SHELF)
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> 啟動貨架推進 (ENGAGE SHELF)
                  </>
                )}
              </button>
            </div>

            {/* Communication Log */}
            <div className="flex-1 flex flex-col bg-[#060910] p-4 rounded-lg border border-cyan-900/60 min-h-[220px]">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-cyan-900/40 text-xs font-bold text-cyan-400">
                <MessageSquare className="w-4 h-4" />
                <span>COMMUNICATION LOG (通訊頻道)</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[160px] text-xs font-mono">
                {commMessages.map((msg, idx) => (
                  <div
                    key={`${msg.id}_${idx}`}
                    className={`p-1.5 rounded ${
                      msg.type === 'alert'
                        ? 'bg-red-950/40 text-red-300 border-l-2 border-red-500'
                        : msg.type === 'warning'
                        ? 'bg-amber-950/40 text-amber-300 border-l-2 border-amber-500'
                        : msg.type === 'success'
                        ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500'
                        : 'bg-slate-900/40 text-cyan-200 border-l-2 border-cyan-500'
                    }`}
                  >
                    <div className="flex justify-between text-[10px] opacity-75">
                      <span>[{msg.sender}]</span>
                      <span>{msg.time}</span>
                    </div>
                    <div>{msg.text}</div>
                  </div>
                ))}
              </div>

              {/* Tactical Ping Send */}
              <form onSubmit={handleSendMessage} className="flex gap-2 mt-3 pt-2 border-t border-cyan-900/40">
                <input
                  type="text"
                  placeholder="輸入戰術指令或按 [發送]..."
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs rounded transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
