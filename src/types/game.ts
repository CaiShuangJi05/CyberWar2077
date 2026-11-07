export type EnemyType = 'thug' | 'heavy' | 'sniper';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  rotation: number;
  isAlive: boolean;
  alertState: 'patrol' | 'alert' | 'aiming' | 'attacking';
  attackCooldown: number;
  laserTarget?: { x: number; y: number; z: number };
  shieldHp?: number;
  patrolCenter: { x: number; z: number };
}

export type ContrabandType = 'chip' | 'organ' | 'database';

export interface Contraband {
  id: string;
  type: ContrabandType;
  name: string;
  points: number;
  weightPenalty: number; // speed multiplier (e.g. 0.8 = -20%)
  x: number;
  z: number;
  status: 'ground' | 'carried_by_player' | 'on_shelf' | 'extracted';
  hp: number; // 100 max, damaged if shelf is shot
}

export interface Teammate {
  id: string;
  name: string;
  callsign: string;
  role: string;
  hp: number;
  maxHp: number;
  cyberShell: number;
  status: 'active' | 'downed_in_bag' | 'extracting' | 'rebooting';
  x: number;
  z: number;
  extractProgress: number; // 0 to 100
  rebootTimer: number; // in seconds
  shootCooldown?: number;
}

export interface PathNode {
  id: string;
  x: number;
  z: number;
  order: number;
}

export interface ShelfState {
  x: number;
  z: number;
  rotation: number;
  hp: number;
  maxHp: number;
  speed: number;
  isMoving: boolean;
  damageBlocked: number;
  contrabands: Contraband[];
  currentNodeIndex: number;
  path: PathNode[];
  perfectTransport: boolean; // true until shelf takes damage
}

export type GameRank = 'SSS' | 'S' | 'A' | 'B' | 'C';

export interface GameScore {
  contrabandScore: number;
  killScore: number;
  headshotBonus: number;
  pathEfficiencyBonus: number;
  perfectDeliveryBonus: number;
  damageBlockedBonus: number;
  teammateRescuePenalty: number;
  damagedGoodsPenalty: number;
  timePenalty: number;
  difficultyMultiplier: number;
  totalScore: number;
  rank: GameRank;
}

export interface GameStats {
  kills: { thug: number; heavy: number; sniper: number; headshots: number };
  rescuesPerformed: number;
  contrabandsRetrieved: number;
  damageBlocked: number;
  elapsedTime: number; // in seconds
  standardTime: number; // e.g. 180s
}

export interface CommMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  type: 'tactical' | 'warning' | 'alert' | 'success';
}

export type WeaponType = 'volt_ar' | 'plasma_cannon' | 'cyber_smg' | 'nano_shotgun';

export interface WeaponConfig {
  id: WeaponType;
  name: string;
  category: string;
  magSize: number;
  maxReserve: number;
  fireRate: number; // in seconds between shots
  damage: number;
  pelletCount: number;
  spread: number;
  color: number;
  recoil: { y: number; z: number };
  description: string;
}

export interface PickupItem {
  id: string;
  type: 'ammo' | 'weapon';
  weaponType?: WeaponType;
  name: string;
  x: number;
  z: number;
  amount?: number;
  isPickedUp: boolean;
}

export interface MissionLevel {
  id: string;
  levelNumber: number;
  name: string;
  subtitle: string;
  codeName: string;
  briefing: string;
  environmentType: 'carnival' | 'docks' | 'reactor';
  fogColor: number;
  skyColor: number;
  groundColor: number;
  gridColor: number;
  keyLightColor: number;
  accentLightColor: number;
  ambientColor: number;
  themeBadgeColor: string;
  timeLimit: number;
  initialShelfPath: PathNode[];
  initialPlayerPos: { x: number; y: number; z: number };
  initialShelfPos: { x: number; z: number };
  teammatePositions: { id: string; name: string; callsign: string; role: string; x: number; z: number }[];
  contrabands: {
    id: string;
    type: ContrabandType;
    name: string;
    points: number;
    weightPenalty: number;
    x: number;
    z: number;
    hp: number;
  }[];
  enemies: {
    type: EnemyType;
    x: number;
    z: number;
    hp: number;
  }[];
  pickups: {
    weapons: { id: string; weaponType: WeaponType; name: string; x: number; z: number; color: number }[];
    ammo: { id: string; x: number; z: number; name: string }[];
  };
  extractionZone: { x: number; z: number; label: string };
  signs: { text: string; x: number; y: number; z: number; color: number }[];
}

export interface LeaderboardEntry {
  id: string;
  callsign: string;
  kills: number;
  score: number;
  rank: GameRank;
  date: string;
  levelName: string;
}

export interface SoftPressureState {
  level: number; // 0.0 to 1.0
  phase: 'idle' | 'jamming' | 'resonance' | 'overdrive';
  isPressing: boolean;
  combo: number;
  totalKills: number;
  totalScore: number;
  currentRank: GameRank;
}

export interface AntiDizzinessConfig {
  viewAngle: 'isometric' | 'overhead' | 'fps';
  zoomLevel: 'wide' | 'normal' | 'close';
  smoothCamera: boolean;
  screenShakeDisabled: boolean;
}

