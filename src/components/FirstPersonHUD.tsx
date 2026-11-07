import React from 'react';
import { Shield, Zap, AlertTriangle, Crosshair, ChevronRight, Radio, Package, HeartPulse, RefreshCw, Clock, Pause, Play } from 'lucide-react';
import { Contraband, Teammate, WeaponConfig, WeaponType } from '../types/game';

interface FirstPersonHUDProps {
  playerHp: number;
  playerMaxHp: number;
  cyberEnergy: number;
  ammo: number;
  maxAmmo: number;
  reserveAmmo: number;
  isReloading: boolean;
  isAiming: boolean;
  teammates: Teammate[];
  contrabands: Contraband[];
  carriedContraband: Contraband | null;
  interactionPrompt: string | null;
  shelfHp: number;
  maxShelfHp: number;
  isShelfMoving: boolean;
  onOpenTacticalPanel: () => void;
  playerPos: { x: number; z: number };
  shelfPos: { x: number; z: number };
  countdownSeconds: number;
  isPaused?: boolean;
  onTogglePause?: () => void;
  currentWeapon?: WeaponConfig;
  unlockedWeapons?: WeaponType[];
  onSwitchWeapon?: (type: WeaponType) => void;
  currentLevelNumber?: number;
  currentLevelName?: string;
  onOpenLevelSelect?: () => void;
}

export const FirstPersonHUD: React.FC<FirstPersonHUDProps> = ({
  playerHp,
  playerMaxHp,
  cyberEnergy,
  ammo,
  maxAmmo,
  reserveAmmo,
  isReloading,
  isAiming,
  teammates,
  contrabands,
  carriedContraband,
  interactionPrompt,
  shelfHp,
  maxShelfHp,
  isShelfMoving,
  onOpenTacticalPanel,
  playerPos,
  shelfPos,
  countdownSeconds,
  isPaused = false,
  onTogglePause,
  currentWeapon,
  unlockedWeapons = ['volt_ar'],
  onSwitchWeapon,
  currentLevelNumber = 1,
  currentLevelName = '廢棄賽博遊樂園',
  onOpenLevelSelect,
}) => {
  const contrabandsRetrieved = contrabands.filter((c) => c.status === 'on_shelf' || c.status === 'extracted').length;
  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-['Rajdhani',sans-serif]">
      {/* 1. TOP-LEFT: Player & 4-Player Team Status (Matching Center Concept Sheet) */}
      <div className="absolute top-5 left-5 pointer-events-auto flex flex-col gap-2.5 max-w-sm">
        {/* Leader / Player Card: NEO-NIGHTS ALPHA */}
        <div className="bg-[#090e18]/85 border-l-4 border-l-cyan-400 border border-slate-800/80 rounded-r-lg p-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-cyan-600 to-pink-500 flex items-center justify-center font-bold text-xs text-white">
                α
              </div>
              <span className="font-bold text-xs tracking-wider text-cyan-300">
                NEO-NIGHTS ALPHA (PLAYER)
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
              LEADER
            </span>
          </div>

          {/* HP Bar */}
          <div className="space-y-1 text-[11px] font-mono">
            <div className="flex justify-between text-slate-300">
              <span className="flex items-center gap-1">
                <HeartPulse className="w-3 h-3 text-pink-500" /> HP:
              </span>
              <span className={playerHp < 35 ? 'text-red-400 font-bold' : 'text-slate-100'}>
                {Math.max(0, Math.floor(playerHp))} / {playerMaxHp}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-300 ${
                  playerHp < 35 ? 'bg-red-500' : 'bg-gradient-to-r from-pink-500 to-cyan-400'
                }`}
                style={{ width: `${Math.max(0, (playerHp / playerMaxHp) * 100)}%` }}
              />
            </div>

            {/* CYBER SHELL Power Bar */}
            <div className="flex justify-between text-slate-300 mt-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" /> CYBER SHELL:
              </span>
              <span className="text-cyan-300">{Math.floor(cyberEnergy)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-cyan-400 transition-all duration-200"
                style={{ width: `${cyberEnergy}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3 Teammates List (BEX, KAI, VEX) */}
        <div className="space-y-1.5">
          {teammates.map((tm, idx) => (
            <div
              key={tm.id}
              className={`p-2 rounded-r-lg border backdrop-blur-sm transition-all ${
                tm.status === 'downed_in_bag'
                  ? 'bg-pink-950/80 border-pink-500 border-l-4 border-l-pink-500 animate-pulse'
                  : tm.status === 'rebooting'
                  ? 'bg-cyan-950/80 border-cyan-400 border-l-4 border-l-cyan-400'
                  : 'bg-[#090e18]/80 border-slate-800 border-l-2 border-l-cyan-600'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-semibold text-slate-200">
                  {idx + 1}. {tm.callsign} ({tm.role})
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    tm.status === 'downed_in_bag'
                      ? 'bg-pink-600 text-white font-bold'
                      : tm.status === 'rebooting'
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-emerald-950 text-emerald-400'
                  }`}
                >
                  {tm.status === 'downed_in_bag'
                    ? 'IN CYBER BAG [待救援]'
                    : tm.status === 'rebooting'
                    ? 'REBOOTING...'
                    : 'ACTIVE'}
                </span>
              </div>

              {/* Teammate HP Mini Bar */}
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    tm.status === 'downed_in_bag'
                      ? 'bg-red-500 w-0'
                      : tm.status === 'rebooting'
                      ? 'bg-cyan-400 w-1/2'
                      : 'bg-cyan-400'
                  }`}
                  style={{ width: tm.status === 'downed_in_bag' ? '0%' : `${tm.hp}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. TOP-CENTER: Objective & 3-Minute Countdown Progress Banner */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
        {/* Mission Level Badge */}
        <div className="mb-1 flex items-center gap-1.5 bg-[#060a14]/90 border border-cyan-500/50 px-3 py-0.5 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.25)] backdrop-blur-md">
          <span className="text-[10px] font-mono font-bold text-cyan-400">
            MISSION 0{currentLevelNumber} :
          </span>
          <span className="text-xs font-bold text-slate-100 tracking-wide">
            {currentLevelName}
          </span>
          {onOpenLevelSelect && (
            <button
              onClick={onOpenLevelSelect}
              className="ml-1 px-1.5 py-0.2 bg-cyan-950/80 hover:bg-cyan-800 border border-cyan-400/60 rounded text-[9px] font-mono text-cyan-300 hover:text-white cursor-pointer transition-colors"
              title="切換作戰關卡"
            >
              [切換關卡]
            </button>
          )}
        </div>

        <div className="bg-[#090d18]/90 border border-amber-500/70 px-5 py-1.5 rounded-full shadow-[0_0_25px_rgba(255,170,0,0.3)] backdrop-blur-md flex items-center gap-3.5">
          {/* 3-Minute Countdown Timer */}
          <div className="flex items-center gap-1.5 bg-black/70 px-3 py-1 rounded-full border border-slate-700">
            <Clock className={`w-3.5 h-3.5 ${countdownSeconds <= 30 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
            <span className="text-[10px] font-mono text-slate-400">倒數:</span>
            <span
              className={`font-mono text-xs font-bold ${
                countdownSeconds <= 30 ? 'text-red-400 animate-pulse font-extrabold' : 'text-cyan-300'
              }`}
            >
              {timeFormatted}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-700" />

          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 tracking-wider uppercase">
              CONTRABAND PROTOCOL
            </span>
          </div>

          <div className="h-4 w-[1px] bg-amber-500/40" />

          <div className="text-xs font-mono text-cyan-300 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-cyan-400" />
            <span>違禁品:</span>
            <strong className="text-pink-400 text-sm">{contrabandsRetrieved} / 3</strong>
          </div>
        </div>

        {/* Moving Shelf Quick Status */}
        <div className="mt-1.5 flex items-center gap-2 bg-[#090d18]/80 px-3 py-0.5 rounded text-[11px] font-mono border border-slate-800 text-slate-300">
          <span>動態防彈貨架:</span>
          <span className={isShelfMoving ? 'text-emerald-400' : 'text-amber-400'}>
            {isShelfMoving ? '推進中 (2.4m/s)' : '待機中'}
          </span>
          <span className="text-slate-500">|</span>
          <span>裝甲: {shelfHp}/{maxShelfHp}</span>
          <button
            onClick={onOpenTacticalPanel}
            className="ml-2 px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 rounded text-[10px] cursor-pointer"
          >
            [TAB 戰術重組面板]
          </button>
        </div>
      </div>

      {/* 3. CENTER: Reticle / Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          {/* Crosshair ring */}
          <div
            className={`w-8 h-8 rounded-full border border-cyan-400/60 flex items-center justify-center transition-all ${
              isAiming ? 'scale-75 border-pink-400' : 'scale-100'
            }`}
          >
            <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full" />
          </div>
          {/* Subtle tick marks */}
          <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-0.5 h-2 bg-cyan-400/80" />
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0.5 h-2 bg-cyan-400/80" />
          <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 h-0.5 w-2 bg-cyan-400/80" />
          <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 h-0.5 w-2 bg-cyan-400/80" />
        </div>
      </div>

      {/* 4. CENTER-BOTTOM: Contextual Interaction Prompt */}
      {interactionPrompt && (
        <div className="absolute bottom-36 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="bg-[#0b101c]/95 border-2 border-cyan-400 px-5 py-2.5 rounded-lg shadow-[0_0_25px_rgba(0,240,255,0.4)] backdrop-blur-md flex items-center gap-3 animate-bounce">
            <span className="px-2 py-0.5 bg-cyan-400 text-black font-mono font-bold text-xs rounded">
              ACTION
            </span>
            <span className="text-sm font-semibold text-white tracking-wide">
              {interactionPrompt}
            </span>
          </div>
        </div>
      )}

      {/* 5. CARRIED CONTRABAND ENCUMBRANCE WIDGET */}
      {carriedContraband && (
        <div className="absolute bottom-36 left-8 bg-pink-950/90 border border-pink-500 rounded-lg p-3 text-xs shadow-[0_0_20px_rgba(255,42,133,0.3)]">
          <div className="flex items-center gap-2 text-pink-300 font-bold mb-1">
            <AlertTriangle className="w-4 h-4 text-pink-400" />
            <span>CARRIED CONTRABAND (攜帶中高危違禁品)</span>
          </div>
          <div className="text-white font-medium">{carriedContraband.name}</div>
          <div className="text-[11px] text-pink-200/80 font-mono mt-1">
            移動速度降至: {Math.floor(carriedContraband.weightPenalty * 100)}% | 請儘速送往貨架！
          </div>
        </div>
      )}

      {/* 6. BOTTOM-LEFT: Dynamic Mini-Map (Radar) */}
      <div className="absolute bottom-5 left-5 pointer-events-auto">
        <div className="relative w-44 h-44 bg-[#070b14]/90 border border-cyan-500/60 rounded-xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.6)] backdrop-blur-sm p-2 flex flex-col">
          <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 border-b border-cyan-950 pb-1 mb-1">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400" /> DYNAMIC RADAR
            </span>
            <span className="text-slate-400">40M</span>
          </div>

          <div className="relative flex-1 bg-[#050811] rounded border border-cyan-950 overflow-hidden flex items-center justify-center">
            {/* Radar sweep ring */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/20 m-2" />
            <div className="absolute inset-0 rounded-full border border-cyan-500/10 m-7" />
            
            {/* Center Player marker */}
            <div className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_#ffffff] z-10" />

            {/* Shelf marker on radar */}
            <div
              className="absolute w-2.5 h-2.5 bg-amber-400 transform rotate-45 shadow-[0_0_6px_#ffaa00]"
              style={{
                left: `${50 + (shelfPos.x - playerPos.x) * 2.2}%`,
                top: `${50 + (shelfPos.z - playerPos.z) * 2.2}%`,
              }}
              title="Moving Shelf"
            />

            {/* Extraction Zone marker */}
            <div
              className="absolute w-3 h-3 border border-amber-400 rounded-full"
              style={{
                left: `${50 + (10 - playerPos.x) * 2.2}%`,
                top: `${50 + (-16 - playerPos.z) * 2.2}%`,
              }}
              title="Extraction Zone"
            />
          </div>

          <div className="flex justify-between text-[9px] font-mono text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" /> 玩家
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-400 inline-block" /> 貨架
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> 敵軍
            </span>
          </div>
        </div>
      </div>

      {/* TOP-RIGHT: Pause & System Control */}
      <div className="absolute top-5 right-5 pointer-events-auto flex items-center gap-2">
        <button
          onClick={onTogglePause}
          className="px-3.5 py-1.5 bg-[#090e18]/90 hover:bg-cyan-950 border border-cyan-500/60 hover:border-cyan-400 text-cyan-300 text-xs font-mono font-bold rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md"
          title="暫停/繼續遊戲 (快速鍵 P)"
        >
          {isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
              <span>[P] 繼續作戰</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
              <span>[P] 戰術暫停</span>
            </>
          )}
        </button>
      </div>

      {/* 7. BOTTOM-RIGHT: Multi-Weapon Tactical Card */}
      <div className="absolute bottom-5 right-5 pointer-events-auto">
        <div
          className="bg-[#090e18]/92 border border-slate-800 rounded-l-xl p-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.6)] backdrop-blur-md w-80 transition-colors"
          style={{
            borderRightWidth: '4px',
            borderRightColor: currentWeapon ? `#${currentWeapon.color.toString(16).padStart(6, '0')}` : '#ff2a85',
          }}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              WEAPON ARSENAL
            </span>
            <span className="text-[10px] font-mono bg-pink-950/60 text-pink-400 px-1.5 py-0.5 rounded border border-pink-500/30 truncate max-w-[150px]">
              {currentWeapon?.category ?? 'ELECTROMAGNETIC'}
            </span>
          </div>

          <div className="text-base font-bold text-white tracking-wider truncate">
            {currentWeapon?.name ?? 'VOLT-AR 電磁突擊步槍'}
          </div>

          {/* Weapon Description / Specs */}
          <div className="my-1.5 py-1 px-2 bg-slate-950/70 rounded border border-slate-800/80 text-[10px] font-mono text-slate-300 truncate">
            {currentWeapon?.description ?? '標準配發電磁線圈突擊步槍，射速穩定，穿透力強。'}
          </div>

          {/* Quick Weapon Slots [1 - 4] */}
          <div className="grid grid-cols-4 gap-1 my-2 text-[10px] font-mono">
            {[
              { id: 'volt_ar', key: '1', short: 'AR步槍', name: 'VOLT-AR' },
              { id: 'plasma_cannon', key: '2', short: '等離子', name: 'PLASMA' },
              { id: 'cyber_smg', key: '3', short: '衝鋒槍', name: 'SMG' },
              { id: 'nano_shotgun', key: '4', short: '散彈槍', name: 'SHOTGUN' },
            ].map((slot) => {
              const isUnlocked = unlockedWeapons.includes(slot.id as WeaponType);
              const isEquipped = (currentWeapon?.id ?? 'volt_ar') === slot.id;
              return (
                <button
                  key={slot.id}
                  onClick={() => isUnlocked && onSwitchWeapon?.(slot.id as WeaponType)}
                  disabled={!isUnlocked}
                  className={`py-1 px-1 rounded border text-center transition-all cursor-pointer ${
                    isEquipped
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                      : isUnlocked
                      ? 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
                      : 'bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                  }`}
                  title={isUnlocked ? `裝備 ${slot.name} (快速鍵 [${slot.key}])` : `未解鎖 ${slot.name} (場中拾取)`}
                >
                  <div className="font-extrabold text-[10px]">[{slot.key}]</div>
                  <div className="text-[9px] truncate">{isUnlocked ? slot.short : '未拾取'}</div>
                </button>
              );
            })}
          </div>

          {/* Ammo display */}
          <div className="flex items-baseline justify-between mt-1 pt-1.5 border-t border-slate-800">
            <div>
              <span className="text-xs text-slate-400 mr-2">AMMO:</span>
              <span className={`text-2xl font-bold font-mono ${ammo <= 5 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
                {ammo}
              </span>
              <span className="text-sm font-mono text-slate-400"> / {reserveAmmo}</span>
            </div>
            {isReloading && (
              <span className="flex items-center gap-1 text-xs font-mono text-amber-400 animate-spin">
                <RefreshCw className="w-3.5 h-3.5" /> 裝填中
              </span>
            )}
          </div>

          {/* Tactical Action Hotkeys */}
          <div className="grid grid-cols-3 gap-1 mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-center font-mono">
            <div className="bg-slate-900/60 p-1 rounded border border-slate-800 text-slate-300">
              <div className="text-cyan-400 font-bold">[左鍵]</div>
              <div>射擊</div>
            </div>
            <div className="bg-slate-900/60 p-1 rounded border border-slate-800 text-slate-300">
              <div className="text-pink-400 font-bold">[右鍵]</div>
              <div>瞄準</div>
            </div>
            <div className="bg-slate-900/60 p-1 rounded border border-slate-800 text-slate-300">
              <div className="text-amber-400 font-bold">[R]</div>
              <div>裝填</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
