/**
 * 《新夜城：違禁重組》（Neo-Nights: Contraband Protocol）
 * HTML5 賽博龐克戰術射擊 × 軟壓壓制系統 × 動態防暈眩 2.5D 戰術視角
 */

import React, { useEffect, useRef, useState } from 'react';
import { soundManager } from './audio/soundManager';
import { ControlDock } from './components/ControlDock';
import { DossierModal } from './components/DossierModal';
import { FirstPersonHUD } from './components/FirstPersonHUD';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { MainMenuModal } from './components/MainMenuModal';
import { PauseModal } from './components/PauseModal';
import { PressureHUD } from './components/PressureHUD';
import { RescueOverlay } from './components/RescueOverlay';
import { ScoreModal } from './components/ScoreModal';
import { TacticalPanel } from './components/TacticalPanel';
import { MISSION_LEVELS } from './game/levels';
import { GameEngine, WEAPON_CONFIGS } from './game/threeRenderer';
import { Language } from './i18n/translations';
import { CommMessage, Contraband, GameRank, GameScore, GameStats, PathNode, Teammate, WeaponConfig, WeaponType } from './types/game';

interface FloatingScore {
  id: string;
  text: string;
  x: number;
  y: number;
  color?: string;
}

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Trilingual system state (Traditional Chinese, English, Indonesian)
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('neo_nights_lang');
      if (saved === 'zh-TW' || saved === 'en' || saved === 'id') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'zh-TW';
  });

  // Main Menu states - initial load opens Main Menu with language & mission options
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(true);
  const [hasActiveSession, setHasActiveSession] = useState(false);

  // Mission Level states
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const currentLevel = MISSION_LEVELS[currentLevelIndex] || MISSION_LEVELS[0];

  // View & UI states - Default to 'tactical' 2.5D Isometric for zero motion sickness!
  const [viewMode, setViewMode] = useState<'fps' | 'tactical'>('tactical');
  const [zoomLevel, setZoomLevel] = useState<'wide' | 'normal' | 'close'>('normal');
  const [isTacticalPanelOpen, setIsTacticalPanelOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isVictory, setIsVictory] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [difficulty, setDifficulty] = useState(1.0);
  const [countdownSeconds, setCountdownSeconds] = useState(currentLevel.timeLimit);

  // Soft-Pressure Suppression System states (Essential for low-stress gameplay)
  const [softPressureLevel, setSoftPressureLevel] = useState(0);
  const [softPressurePhase, setSoftPressurePhase] = useState<'idle' | 'jamming' | 'resonance' | 'overdrive'>('idle');
  const [isSoftPressing, setIsSoftPressing] = useState(false);
  const [softPressureCombo, setSoftPressureCombo] = useState(1.0);
  const [totalKillsCount, setTotalKillsCount] = useState(0);
  const [accumulatedScore, setAccumulatedScore] = useState(0);
  const [currentRank, setCurrentRank] = useState<GameRank>('C');
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);

  // Player & HUD Real-time states
  const [playerHp, setPlayerHp] = useState(100);
  const [cyberEnergy, setCyberEnergy] = useState(100);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponConfig>(WEAPON_CONFIGS.volt_ar);
  const [unlockedWeapons, setUnlockedWeapons] = useState<WeaponType[]>(['volt_ar']);
  const [ammo, setAmmo] = useState(28);
  const [reserveAmmo, setReserveAmmo] = useState(140);
  const [isReloading, setIsReloading] = useState(false);
  const [isAiming, setIsAiming] = useState(false);
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [carriedContraband, setCarriedContraband] = useState<Contraband | null>(null);

  // Moving Shelf states
  const [shelfHp, setShelfHp] = useState(2000);
  const [isShelfMoving, setIsShelfMoving] = useState(false);
  const [shelfPath, setShelfPath] = useState<PathNode[]>([
    { id: 'p1', x: 0, z: 7.5, order: 0 },
    { id: 'p2', x: -3, z: 3.5, order: 1 },
    { id: 'p3', x: -3, z: -2.5, order: 2 },
    { id: 'p4', x: 2, z: -7.5, order: 3 },
    { id: 'p5', x: 7, z: -11.5, order: 4 },
    { id: 'p6', x: 10, z: -16, order: 5 },
  ]);
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 10 });
  const [shelfPos, setShelfPos] = useState({ x: 0, z: 7.5 });

  // Rescue states
  const [isCrouched, setIsCrouched] = useState(false);
  const [rescueProgress, setRescueProgress] = useState(0);
  const [rescueState, setRescueState] = useState<'extracting' | 'rebooting' | 'idle'>('idle');
  const [targetRescueCallsign, setTargetRescueCallsign] = useState('BEX');

  // Teammates & Contrabands
  const [teammates, setTeammates] = useState<Teammate[]>([
    { id: 'tm1', name: 'BEX (ALPHA-2)', callsign: 'BEX', role: 'Vanguard', hp: 100, maxHp: 100, cyberShell: 100, status: 'active', x: -2.4, z: 7.5, extractProgress: 0, rebootTimer: 0 },
    { id: 'tm2', name: 'KAI (ALPHA-3)', callsign: 'KAI', role: 'Support', hp: 100, maxHp: 100, cyberShell: 100, status: 'active', x: 2.4, z: 7.5, extractProgress: 0, rebootTimer: 0 },
    { id: 'tm3', name: 'VEX (ALPHA-4)', callsign: 'VEX', role: 'Recon', hp: 100, maxHp: 100, cyberShell: 100, status: 'active', x: 0, z: 9.5, extractProgress: 0, rebootTimer: 0 },
  ]);

  const [contrabands, setContrabands] = useState<Contraband[]>([
    { id: 'cb1', type: 'chip', name: '普通違禁晶片', points: 500, weightPenalty: 0.95, x: -2.5, z: 3.5, status: 'ground', hp: 100 },
    { id: 'cb2', type: 'organ', name: '高危賽博器官', points: 1200, weightPenalty: 0.8, x: 2.0, z: -1.5, status: 'ground', hp: 100 },
    { id: 'cb3', type: 'database', name: '核心機密數據庫', points: 3000, weightPenalty: 0.65, x: 5.0, z: -7.5, status: 'ground', hp: 100 },
  ]);

  // Tactical Chat Comms
  const [commMessages, setCommMessages] = useState<CommMessage[]>([
    { id: '1', sender: 'SYSTEM', text: '新夜城戰線已就緒。已載入 2.5D 防暈眩俯瞰模式與軟壓壓制系統。', time: '00:01', type: 'tactical' },
    { id: '2', sender: 'BEX', text: '前鋒偵測到恐怖分子重裝盾牌兵！建議長按軟壓啟動電磁靜默力場。', time: '00:04', type: 'tactical' },
    { id: '3', sender: 'KAI', text: '壓制力場可使敵方減速 75% 並凍結射擊，舒緩指關節疲勞。', time: '00:07', type: 'warning' },
  ]);

  // Game Stats & Score
  const [stats, setStats] = useState<GameStats>({
    kills: { thug: 0, heavy: 0, sniper: 0, headshots: 0 },
    rescuesPerformed: 0,
    contrabandsRetrieved: 0,
    damageBlocked: 0,
    elapsedTime: 0,
    standardTime: 180,
  });

  const [score, setScore] = useState<GameScore>({
    contrabandScore: 0,
    killScore: 0,
    headshotBonus: 0,
    pathEfficiencyBonus: 0,
    perfectDeliveryBonus: 1000,
    damageBlockedBonus: 0,
    teammateRescuePenalty: 0,
    damagedGoodsPenalty: 0,
    timePenalty: 0,
    difficultyMultiplier: 1.0,
    totalScore: 0,
    rank: 'C',
  });

  // Calculate live score and determine rank (SSS / S / A / B / C)
  const calculateScore = (currentStats: GameStats, diff: number, extraScore: number): GameScore => {
    let contrabandScore = 0;
    if (contrabands[0]?.status === 'on_shelf' || contrabands[0]?.status === 'extracted') contrabandScore += 500;
    if (contrabands[1]?.status === 'on_shelf' || contrabands[1]?.status === 'extracted') contrabandScore += 1200;
    if (contrabands[2]?.status === 'on_shelf' || contrabands[2]?.status === 'extracted') contrabandScore += 3000;

    const killScore =
      currentStats.kills.thug * 100 +
      currentStats.kills.heavy * 300 +
      currentStats.kills.sniper * 200 +
      extraScore;
    const headshotBonus = currentStats.kills.headshots * 50;

    const damageBlockedBonus = currentStats.damageBlocked >= 1000 ? 800 : Math.floor(currentStats.damageBlocked * 0.8);
    const perfectDeliveryBonus = 1000;
    const pathEfficiencyBonus = damageBlockedBonus + perfectDeliveryBonus;

    const teammateRescuePenalty = currentStats.rescuesPerformed * 500;
    const damagedGoodsPenalty = 0;
    const timePenalty = Math.max(0, Math.floor(currentStats.elapsedTime - currentStats.standardTime) * 10);

    const subtotal = (contrabandScore + killScore + headshotBonus + pathEfficiencyBonus) * diff;
    const totalScore = Math.max(0, subtotal - (teammateRescuePenalty + damagedGoodsPenalty + timePenalty));

    const totalKills = currentStats.kills.thug + currentStats.kills.heavy + currentStats.kills.sniper;
    let rank: GameRank = 'C';
    if (totalScore >= 20000 && totalKills >= 25) rank = 'SSS';
    else if (totalScore >= 12000 && totalKills >= 15) rank = 'S';
    else if (totalScore >= 6000 && totalKills >= 8) rank = 'A';
    else if (totalScore >= 2500) rank = 'B';

    return {
      contrabandScore,
      killScore,
      headshotBonus,
      pathEfficiencyBonus,
      perfectDeliveryBonus,
      damageBlockedBonus,
      teammateRescuePenalty,
      damagedGoodsPenalty,
      timePenalty,
      difficultyMultiplier: diff,
      totalScore,
      rank,
    };
  };

  // Mount Three.js Game Engine once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    let engine: GameEngine | null = null;
    try {
      engine = new GameEngine(canvasMountRef.current, {
        onScoreUpdate: (delta) => {
          setStats((prev) => {
            const next = { ...prev };
            if (delta.kills) {
              next.kills.thug++;
            }
            if (delta.headshot) {
              next.kills.headshots++;
            }
            if (delta.damageBlocked) {
              next.damageBlocked += delta.damageBlocked;
            }
            return next;
          });
        },
        onTeammateDowned: (teammateId) => {
          setTeammates((prev) =>
            prev.map((tm) => (tm.id === teammateId ? { ...tm, status: 'downed_in_bag', hp: 0 } : tm))
          );
          const tm = teammates.find((t) => t.id === teammateId);
          if (tm) setTargetRescueCallsign(tm.callsign);
        },
        onTeammateRescued: (teammateId) => {
          setTeammates((prev) =>
            prev.map((tm) => (tm.id === teammateId ? { ...tm, status: 'active', hp: 65 } : tm))
          );
          setStats((prev) => ({ ...prev, rescuesPerformed: prev.rescuesPerformed + 1 }));
        },
        onPlayerDamage: (amount) => {
          setPlayerHp((prev) => {
            const next = Math.max(0, prev - amount);
            if (next <= 0) {
              setIsVictory(false);
              setIsScoreModalOpen(true);
            }
            return next;
          });
        },
        onObjectiveComplete: () => {
          setIsVictory(true);
          setIsScoreModalOpen(true);
        },
        onLogMessage: (sender, text, type) => {
          const time = new Date().toLocaleTimeString('zh-TW', { minute: '2-digit', second: '2-digit' });
          const uniqueId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
          setCommMessages((prev) => [
            ...prev.slice(-12),
            { id: uniqueId, sender, text, time, type },
          ]);
        },
        onInteractionAvailable: (prompt) => {
          setInteractionPrompt(prompt);
        },
        onRescueProgressUpdate: (progress, state) => {
          setRescueProgress(progress);
          setRescueState(state);
        },
        onWeaponChange: (weapon) => {
          setCurrentWeapon(weapon);
        },
        onPauseToggle: (paused) => {
          setIsPaused(paused);
        },
        onSoftPressureUpdate: (pressure, phase, kills, extraScore) => {
          setSoftPressureLevel(pressure);
          setSoftPressurePhase(phase);
          setTotalKillsCount(kills);
          setAccumulatedScore(extraScore);
        },
        onFloatingScore: (text, _x, _z, color) => {
          const id = `fs_${Date.now()}_${Math.random()}`;
          setFloatingScores((prev) => [
            ...prev.slice(-6),
            { id, text, x: 45 + (Math.random() - 0.5) * 15, y: 40 + (Math.random() - 0.5) * 10, color },
          ]);
          setTimeout(() => {
            setFloatingScores((prev) => prev.filter((item) => item.id !== id));
          }, 1100);
        },
      });

      engineRef.current = engine;
      // Keep simulation loop silently paused on initial load until player clicks start
      engine.isPaused = true;
    } catch (err) {
      console.warn('GameEngine mount safe caught:', err);
    }

    // Start Procedural BGM safely
    try {
      soundManager.startBGM();
    } catch {
      // Audio autoplay deferred to user interaction
    }

    // High frequency UI sync timer
    const syncTimer = window.setInterval(() => {
      if (!engineRef.current) return;
      const eng = engineRef.current;
      setPlayerHp(eng.playerHp);
      setAmmo(eng.ammo);
      setReserveAmmo(eng.reserveAmmo);
      setIsReloading(eng.isReloading);
      setIsAiming(eng.isAimingDownSights);
      setIsCrouched(eng.isCrouched);
      setViewMode(eng.viewMode);
      setUnlockedWeapons([...eng.unlockedWeapons]);
      if (WEAPON_CONFIGS[eng.currentWeaponType]) {
        setCurrentWeapon(WEAPON_CONFIGS[eng.currentWeaponType]);
      }
      setCarriedContraband(eng.carriedContraband);
      setShelfHp(eng.shelfState.hp);
      setIsShelfMoving(eng.shelfState.isMoving);
      setPlayerPos({ x: Math.round(eng.playerPos.x * 10) / 10, z: Math.round(eng.playerPos.z * 10) / 10 });
      setShelfPos({ x: Math.round(eng.shelfState.x * 10) / 10, z: Math.round(eng.shelfState.z * 10) / 10 });
      setContrabands([...eng.contrabands]);
      setSoftPressureLevel(eng.softPressureLevel);
      setSoftPressurePhase(eng.softPressurePhase);
      setIsSoftPressing(eng.isSoftPressing);
      setSoftPressureCombo(eng.softPressureCombo);
      setTotalKillsCount(eng.totalKillsCount);
      setCurrentRank(eng.calculateCurrentRank());
    }, 100);

    // 3-Minute countdown & elapsed timer
    const countdownTimer = window.setInterval(() => {
      if (engineRef.current?.isPaused) return;

      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          setIsVictory(true);
          setIsScoreModalOpen(true);
          return 0;
        }
        return prev - 1;
      });
      setStats((prev) => ({
        ...prev,
        elapsedTime: prev.elapsedTime + 1,
      }));
    }, 1000);

    return () => {
      clearInterval(syncTimer);
      clearInterval(countdownTimer);
      try {
        engine?.dispose();
      } catch {}
      try {
        soundManager.stopBGM();
      } catch {}
    };
  }, []);

  // Update calculated score when stats, contrabands, or accumulated score change
  useEffect(() => {
    setScore(calculateScore(stats, difficulty, accumulatedScore));
  }, [stats, contrabands, difficulty, accumulatedScore]);

  // Handlers
  const handleSelectLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    try {
      localStorage.setItem('neo_nights_lang', lang);
    } catch {
      // ignore
    }
  };

  const handleStartGameFromMenu = () => {
    setIsMainMenuOpen(false);
    setHasActiveSession(true);
    if (engineRef.current) {
      engineRef.current.setPaused(false);
    }
    setIsPaused(false);
  };

  const handleResumeGameFromMenu = () => {
    setIsMainMenuOpen(false);
    if (engineRef.current) {
      engineRef.current.setPaused(false);
    }
    setIsPaused(false);
  };

  const handleOpenMainMenu = () => {
    if (engineRef.current) {
      engineRef.current.setPaused(true);
    }
    setIsPaused(false);
    setIsMainMenuOpen(true);
  };

  const handleToggleView = (mode?: 'fps' | 'tactical') => {
    const nextMode = mode || (viewMode === 'fps' ? 'tactical' : 'fps');
    setViewMode(nextMode);
    engineRef.current?.toggleViewMode(nextMode);
  };

  const handleChangeZoom = (zoom: 'wide' | 'normal' | 'close') => {
    setZoomLevel(zoom);
    engineRef.current?.setZoomLevel(zoom);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const handleToggleDifficulty = () => {
    const next = difficulty === 1.0 ? 1.5 : 1.0;
    setDifficulty(next);
  };

  const handleUpdateShelfPath = (newPath: PathNode[]) => {
    setShelfPath(newPath);
    engineRef.current?.setShelfPath(newPath);
  };

  const handleToggleShelfMove = () => {
    engineRef.current?.toggleShelfMovement();
    setIsShelfMoving((prev) => !prev);
  };

  const handleSendPing = (text: string) => {
    const time = new Date().toLocaleTimeString('zh-TW', { minute: '2-digit', second: '2-digit' });
    const uniqueId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    setCommMessages((prev) => [
      ...prev,
      { id: uniqueId, sender: 'ALPHA (YOU)', text, time, type: 'tactical' },
    ]);
  };

  const handleRestart = () => {
    handleSelectLevel(currentLevelIndex);
  };

  const handleSelectLevel = (index: number) => {
    const level = MISSION_LEVELS[index];
    if (!level) return;
    setCurrentLevelIndex(index);
    engineRef.current?.loadLevel(level);
    setCountdownSeconds(level.timeLimit);
    setShelfPath(level.initialShelfPath);
    setContrabands(level.contrabands.map((c) => ({ ...c, status: 'ground' })));
    setTeammates(
      level.teammatePositions.map((t) => ({
        id: t.id,
        name: t.name,
        callsign: t.callsign,
        role: t.role,
        hp: 100,
        maxHp: 100,
        cyberShell: 100,
        status: 'active',
        x: t.x,
        z: t.z,
        extractProgress: 0,
        rebootTimer: 0,
      }))
    );
    setShelfHp(2000);
    setIsShelfMoving(false);
    setPlayerHp(100);
    setCyberEnergy(100);
    setCarriedContraband(null);
    setTotalKillsCount(0);
    setAccumulatedScore(0);
    setStats({
      kills: { thug: 0, heavy: 0, sniper: 0, headshots: 0 },
      rescuesPerformed: 0,
      contrabandsRetrieved: 0,
      damageBlocked: 0,
      elapsedTime: 0,
      standardTime: level.timeLimit,
    });
    setIsScoreModalOpen(false);
    setIsPaused(false);
    setIsLevelSelectOpen(false);
    setIsMainMenuOpen(false);
    setHasActiveSession(true);
    engineRef.current?.setPaused(false);
  };

  const handleNextLevel = () => {
    if (currentLevelIndex < MISSION_LEVELS.length - 1) {
      handleSelectLevel(currentLevelIndex + 1);
    } else {
      handleSelectLevel(0);
    }
  };

  const handleTogglePause = () => {
    if (!engineRef.current) return;
    const next = !engineRef.current.isPaused;
    engineRef.current.setPaused(next);
    setIsPaused(next);
  };

  const handleSwitchWeapon = (type: WeaponType) => {
    engineRef.current?.switchWeapon(type);
  };

  // Total kills combined
  const totalDisplayKills = Math.max(
    totalKillsCount,
    stats.kills.thug + stats.kills.heavy + stats.kills.sniper
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07090e] font-['Rajdhani',sans-serif]">
      {/* 1. Dedicated 3D Canvas Mount (Zero Viewport Occlusion) */}
      <div ref={canvasMountRef} className="absolute inset-0 z-0 cursor-crosshair" />

      {/* 2. Floating Score Popups (Soft-Pressure feedback) */}
      <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
        {floatingScores.map((fs) => (
          <div
            key={fs.id}
            className="absolute font-mono font-extrabold text-sm animate-bounce drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]"
            style={{
              left: `${fs.x}%`,
              top: `${fs.y}%`,
              color: fs.color || '#00f0ff',
            }}
          >
            {fs.text}
          </div>
        ))}
      </div>

      {/* 0. Cyberpunk Trilingual Main Menu Modal (Traditional Chinese, English, Indonesian) */}
      <MainMenuModal
        isOpen={isMainMenuOpen}
        onStartGame={() => {
          handleRestart();
          handleStartGameFromMenu();
        }}
        onResumeGame={handleResumeGameFromMenu}
        hasActiveSession={hasActiveSession}
        onOpenLevelSelect={() => {
          setIsMainMenuOpen(false);
          setIsLevelSelectOpen(true);
        }}
        onOpenLeaderboard={() => {
          setIsMainMenuOpen(false);
          setIsLeaderboardOpen(true);
        }}
        onOpenDossier={() => {
          setIsMainMenuOpen(false);
          setIsDossierOpen(true);
        }}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* 3. PRIMARY HUD: Dedicated Soft-Pressure & Anti-Dizziness HUD Layer */}
      <PressureHUD
        kills={totalDisplayKills}
        score={score.totalScore}
        rank={currentRank}
        pressureLevel={softPressureLevel}
        pressurePhase={softPressurePhase}
        isSoftPressing={isSoftPressing}
        combo={softPressureCombo}
        playerHp={playerHp}
        playerMaxHp={100}
        cyberEnergy={cyberEnergy}
        countdownSeconds={countdownSeconds}
        viewMode={viewMode}
        onToggleView={() => handleToggleView()}
        zoomLevel={zoomLevel}
        onChangeZoom={handleChangeZoom}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenTacticalPanel={() => setIsTacticalPanelOpen(true)}
        currentLevelName={currentLevel.name}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        onOpenMainMenu={handleOpenMainMenu}
      />

      {/* 4. Secondary FPS HUD Layer (Active when player switches to FPS view) */}
      {viewMode === 'fps' && (
        <FirstPersonHUD
          playerHp={playerHp}
          playerMaxHp={100}
          cyberEnergy={cyberEnergy}
          ammo={ammo}
          maxAmmo={currentWeapon.magSize}
          reserveAmmo={reserveAmmo}
          isReloading={isReloading}
          isAiming={isAiming}
          teammates={teammates}
          contrabands={contrabands}
          carriedContraband={carriedContraband}
          interactionPrompt={interactionPrompt}
          shelfHp={shelfHp}
          maxShelfHp={2000}
          isShelfMoving={isShelfMoving}
          onOpenTacticalPanel={() => setIsTacticalPanelOpen(true)}
          playerPos={playerPos}
          shelfPos={shelfPos}
          countdownSeconds={countdownSeconds}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          currentWeapon={currentWeapon}
          unlockedWeapons={unlockedWeapons}
          onSwitchWeapon={handleSwitchWeapon}
          currentLevelNumber={currentLevel.levelNumber}
          currentLevelName={currentLevel.name}
          onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
        />
      )}

      {/* 5. Teammate Rescue Protocol Overlay */}
      <RescueOverlay
        isVisible={interactionPrompt?.includes('防爆袋') || rescueState !== 'idle'}
        isCrouched={isCrouched}
        extractProgress={rescueProgress}
        state={rescueState}
        targetCallsign={targetRescueCallsign}
      />

      {/* 6. Tactical Rerouting Panel Modal */}
      <TacticalPanel
        isOpen={isTacticalPanelOpen}
        onClose={() => setIsTacticalPanelOpen(false)}
        shelfPath={shelfPath}
        onUpdatePath={handleUpdateShelfPath}
        isShelfMoving={isShelfMoving}
        onToggleShelfMove={handleToggleShelfMove}
        damageBlocked={stats.damageBlocked}
        shelfHp={shelfHp}
        maxShelfHp={2000}
        contrabandsOnShelf={contrabands.filter((c) => c.status === 'on_shelf')}
        commMessages={commMessages}
        onSendPing={handleSendPing}
        playerPos={playerPos}
        shelfPos={shelfPos}
        currentMissionName={currentLevel.name}
        currentMissionCode={currentLevel.codeName}
        onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
      />

      {/* 7. Cyberpunk Tactical Pause Modal */}
      <PauseModal
        isOpen={isPaused && !isMainMenuOpen}
        onResume={handleTogglePause}
        onOpenTactical={() => {
          setIsPaused(false);
          engineRef.current?.setPaused(false);
          setIsTacticalPanelOpen(true);
        }}
        onOpenDossier={() => {
          setIsPaused(false);
          engineRef.current?.setPaused(false);
          setIsDossierOpen(true);
        }}
        onOpenLevelSelect={() => {
          setIsPaused(false);
          engineRef.current?.setPaused(false);
          setIsLevelSelectOpen(true);
        }}
        onOpenMainMenu={handleOpenMainMenu}
        onRestart={handleRestart}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        countdownSeconds={countdownSeconds}
        stats={stats}
        currentWeaponName={currentWeapon.name}
        currentLevelName={currentLevel.name}
        currentLevelNumber={currentLevel.levelNumber}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* 8. Dossier & Blueprint Viewer Modal */}
      <DossierModal isOpen={isDossierOpen} onClose={() => setIsDossierOpen(false)} />

      {/* 9. Score & Victory Evaluation Modal */}
      <ScoreModal
        isOpen={isScoreModalOpen}
        isVictory={isVictory}
        score={score}
        stats={stats}
        currentLevelName={currentLevel.name}
        currentLevelNumber={currentLevel.levelNumber}
        hasNextLevel={currentLevelIndex < MISSION_LEVELS.length - 1}
        onNextLevel={handleNextLevel}
        onOpenLevelSelect={() => {
          setIsScoreModalOpen(false);
          setIsLevelSelectOpen(true);
        }}
        onOpenLeaderboard={() => {
          setIsScoreModalOpen(false);
          setIsLeaderboardOpen(true);
        }}
        onOpenMainMenu={handleOpenMainMenu}
        onRestart={handleRestart}
        onClose={() => setIsScoreModalOpen(false)}
        currentLanguage={currentLanguage}
      />

      {/* 10. Mission Level Selection Modal */}
      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        currentLevelIndex={currentLevelIndex}
        onSelectLevel={handleSelectLevel}
        onClose={() => setIsLevelSelectOpen(false)}
      />

      {/* 11. Persistent Local Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentKills={totalDisplayKills}
        currentScore={score.totalScore}
        currentRank={currentRank}
        currentLevelName={currentLevel.name}
        currentLanguage={currentLanguage}
      />

      {/* 12. Collapsible Bottom Control Dock */}
      <ControlDock
        viewMode={viewMode}
        onToggleView={handleToggleView}
        onOpenTacticalPanel={() => setIsTacticalPanelOpen((prev) => !prev)}
        onOpenDossier={() => setIsDossierOpen(true)}
        onOpenScores={() => setIsScoreModalOpen(true)}
        onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
        onOpenMainMenu={handleOpenMainMenu}
        onRestart={handleRestart}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        difficulty={difficulty}
        onToggleDifficulty={handleToggleDifficulty}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
      />
    </div>
  );
}
