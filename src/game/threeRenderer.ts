/**
 * Neo-Nights: Contraband Protocol - 3D Engine & Procedural Asset Renderer
 * Using Three.js PBR rendering standards, zero-404 procedural models, dynamic lighting & VFX.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { soundManager } from '../audio/soundManager';
import { Contraband, Enemy, PathNode, Teammate, WeaponConfig, WeaponType, PickupItem, MissionLevel } from '../types/game';
import { MISSION_LEVELS } from './levels';

export const WEAPON_CONFIGS: Record<WeaponType, WeaponConfig> = {
  volt_ar: {
    id: 'volt_ar',
    name: 'VOLT-AR 電磁突擊步槍',
    category: 'ELECTROMAGNETIC RIFLE',
    magSize: 28,
    maxReserve: 140,
    fireRate: 0.12,
    damage: 65,
    pelletCount: 1,
    spread: 0.015,
    color: 0x00f0ff,
    recoil: { y: 0.04, z: 0.12 },
    description: '標準配發電磁線圈突擊步槍，射速穩定，穿透力強。',
  },
  plasma_cannon: {
    id: 'plasma_cannon',
    name: 'PLASMA-CANNON 等離子重砲',
    category: 'HEAVY PLASMA ORDNANCE',
    magSize: 8,
    maxReserve: 32,
    fireRate: 0.75,
    damage: 180,
    pelletCount: 1,
    spread: 0.005,
    color: 0xff2a85,
    recoil: { y: 0.12, z: 0.28 },
    description: '高能熱核等離子重砲，一擊粉碎重裝兵盾牌與密集敵軍。',
  },
  cyber_smg: {
    id: 'cyber_smg',
    name: 'CYBER-SMG 暴風衝鋒槍',
    category: 'RAPID VECTOR SMG',
    magSize: 45,
    maxReserve: 225,
    fireRate: 0.07,
    damage: 32,
    pelletCount: 1,
    spread: 0.04,
    color: 0x00ff88,
    recoil: { y: 0.025, z: 0.08 },
    description: '極致射速向量衝鋒槍，近距離壓制與彈雨洗地。',
  },
  nano_shotgun: {
    id: 'nano_shotgun',
    name: 'NANO-SHOTGUN 奈米散彈槍',
    category: 'BALLISTIC SCATTERGUN',
    magSize: 8,
    maxReserve: 48,
    fireRate: 0.65,
    damage: 30,
    pelletCount: 8,
    spread: 0.085,
    color: 0xffaa00,
    recoil: { y: 0.09, z: 0.22 },
    description: '8重高能散射彈幕，近身提供毀滅性破壞力。',
  },
};

export interface GameEngineCallbacks {
  onScoreUpdate: (delta: { kills?: number; headshot?: boolean; damageBlocked?: number; contrabandCollected?: string }) => void;
  onTeammateDowned: (teammateId: string) => void;
  onTeammateRescued: (teammateId: string) => void;
  onPlayerDamage: (amount: number) => void;
  onObjectiveComplete: () => void;
  onLogMessage: (sender: string, text: string, type: 'tactical' | 'warning' | 'alert' | 'success') => void;
  onInteractionAvailable: (prompt: string | null, type?: 'contraband' | 'shelf' | 'teammate_bag' | 'pickup', targetId?: string) => void;
  onRescueProgressUpdate: (progress: number, state: 'extracting' | 'rebooting' | 'idle') => void;
  onWeaponChange?: (weapon: WeaponConfig) => void;
  onPauseToggle?: (isPaused: boolean) => void;
  onSoftPressureUpdate?: (pressure: number, phase: 'idle' | 'jamming' | 'resonance' | 'overdrive', totalKills: number, totalScore: number) => void;
  onFloatingScore?: (text: string, x: number, y: number, color?: string) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private tacticalCamera!: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean = false;
  private animationFrameId: number = 0;
  private callbacks: GameEngineCallbacks;

  // Game pause state
  public isPaused: boolean = false;

  // View mode: default to 'tactical' for zero-dizziness 2.5D Isometric view
  public viewMode: 'fps' | 'tactical' = 'tactical';
  private targetCameraPos = new THREE.Vector3();
  private targetCameraLookAt = new THREE.Vector3();

  // Soft Pressure & Anti-Dizziness System state
  public isSoftPressing: boolean = false;
  public softPressureLevel: number = 0; // 0.0 to 1.0
  public softPressurePhase: 'idle' | 'jamming' | 'resonance' | 'overdrive' = 'idle';
  public softPressureCombo: number = 1.0;
  public totalKillsCount: number = 0;
  public accumulatedScore: number = 0;
  public mouseAimPoint = new THREE.Vector3(0, 0, 0);
  public antiDizzinessZoom: 'wide' | 'normal' | 'close' = 'normal';
  public screenShakeDisabled: boolean = true;
  private raycaster = new THREE.Raycaster();
  private groundRayPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  // 3rd Person Cyborg Operative Mesh (For zero-dizziness isometric view)
  public playerModelGroup!: THREE.Group;
  private playerTorsoMesh!: THREE.Mesh;
  private playerGunMesh!: THREE.Mesh;
  private playerVisorMesh!: THREE.Mesh;

  // Soft Pressure Visual Meshes
  private softPressureConeGroup!: THREE.Group;
  private softPressureConeMesh!: THREE.Mesh;
  private softPressureBeamMesh!: THREE.Mesh;
  private softPressureShockwaveMesh!: THREE.Mesh;
  private shockwaveActive: boolean = false;
  private shockwaveRadius: number = 0;

  // Player state
  public playerPos = new THREE.Vector3(0, 1.7, 10);
  public playerRotation = { yaw: 0, pitch: 0 };
  public playerVelocity = new THREE.Vector3();
  public isCrouched: boolean = false;
  public isAimingDownSights: boolean = false;
  public currentWeaponType: WeaponType = 'volt_ar';
  public unlockedWeapons: WeaponType[] = ['volt_ar'];
  public ammo: number = 28;
  public maxAmmo: number = 28;
  public reserveAmmo: number = 140;
  public cyberEnergy: number = 100;
  public playerHp: number = 100;
  public playerMaxHp: number = 100;
  public carriedContraband: Contraband | null = null;
  public isReloading: boolean = false;
  private lastShotTime: number = 0;

  // Pickups
  public pickups: (PickupItem & { mesh: THREE.Group })[] = [];

  // Input states
  private keys: { [key: string]: boolean } = {};
  public isPointerLocked: boolean = false;

  // Scene entities
  private playerWeaponGroup!: THREE.Group;
  private weaponRecoil = { x: 0, y: 0, z: 0 };
  private muzzleFlashLight!: THREE.PointLight;
  private muzzleFlashMesh!: THREE.Mesh;
  private weaponCoilMeshes: THREE.Mesh[] = [];
  private weaponMagMesh!: THREE.Mesh;
  private weaponReticleMesh!: THREE.Mesh;
  private enemies: (Enemy & { mesh: THREE.Group; laserLine?: THREE.Line })[] = [];
  private teammates: (Teammate & { mesh: THREE.Group; bagMesh: THREE.Group })[] = [];
  public contrabands: Contraband[] = [];
  private contrabandMeshes: Map<string, THREE.Group> = new Map();

  // Moving Shelf
  public shelfState = {
    x: 0,
    z: 7.5,
    rotation: 0,
    hp: 2000,
    maxHp: 2000,
    speed: 2.4,
    isMoving: false,
    damageBlocked: 0,
    currentNodeIndex: 0,
    path: [
      { id: 'p1', x: 0, z: 7.5, order: 0 },
      { id: 'p2', x: -3, z: 3.5, order: 1 },
      { id: 'p3', x: -3, z: -2.5, order: 2 },
      { id: 'p4', x: 2, z: -7.5, order: 3 },
      { id: 'p5', x: 7, z: -11.5, order: 4 },
      { id: 'p6', x: 10, z: -16, order: 5 }, // Extraction zone
    ] as PathNode[],
    perfectTransport: true,
  };
  private shelfMesh!: THREE.Group;
  private shelfContrabandSlots: (THREE.Group | null)[] = [null, null, null];
  private railLineMesh!: THREE.Line;
  private railNodeMeshes: THREE.Mesh[] = [];

  // Mission Level & Scenery Entities
  public currentLevel: MissionLevel = MISSION_LEVELS[0];
  private environmentGroup: THREE.Group = new THREE.Group();
  private floorMesh!: THREE.Mesh;
  private gridHelper!: THREE.GridHelper;
  private hemiLight!: THREE.HemisphereLight;
  private keyLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;
  private groundNeon!: THREE.PointLight;
  private signMeshes: THREE.Mesh[] = [];

  // Scenery Objects
  private carouselGroup?: THREE.Group;
  private ferrisWheelGroup?: THREE.Group;
  private derrickCraneGroup?: THREE.Group;
  private craneTrolleyLight?: THREE.SpotLight;
  private reactorRingsGroup?: THREE.Group;
  private reactorCoreLight?: THREE.PointLight;
  private extractionZoneMesh!: THREE.Group;

  // Particles & VFX
  private tracerBullets: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
  private particleSparks: { mesh: THREE.Points; life: number }[] = [];

  // Interaction
  private currentInteractable: { type: 'contraband' | 'shelf' | 'teammate_bag' | 'pickup'; id: string } | null = null;
  public isExtractingTeammate: boolean = false;
  private activeRescueTeammateId: string | null = null;
  private reinforcementTimer: number = 14;
  private enemyCounter: number = 7;
  private clock = new THREE.Clock();

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.init();
  }

  private init() {
    // Software WebGL probe
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene & Renderer
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060810);
    const width = this.container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1280) || 1280;
    const height = this.container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 720) || 720;

    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: !this.isSoftwareGl,
        powerPreference: 'high-performance',
      });
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.15;
      this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2));
      this.renderer.shadowMap.enabled = !this.isSoftwareGl;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.setSize(width, height);
      this.container.appendChild(this.renderer.domElement);
    } catch (err) {
      console.warn('WebGL init fallback or context lost:', err);
    }

    // Studio Environment map
    if (this.renderer) {
      try {
        const pmrem = new THREE.PMREMGenerator(this.renderer);
        this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        pmrem.dispose();
      } catch {
        // RoomEnvironment fallback safe
      }
    }

    // Cameras with safe non-zero aspect
    const aspect = width / (height || 1);
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 300);
    this.tacticalCamera = new THREE.PerspectiveCamera(50, aspect, 0.1, 350);
    this.tacticalCamera.position.set(0, 16, 22);
    this.tacticalCamera.lookAt(0, 0.8, 10);

    // Setup Base Architecture
    this.scene.add(this.environmentGroup);
    this.setupLighting();
    this.setupGround();
    this.setupMovingShelf();
    this.setupPlayerWeapon();
    this.setupPlayerModel();
    this.setupSoftPressureVFX();
    this.setupInputListeners();

    // Initial Level Load
    this.loadLevel(this.currentLevel);

    // Start loop
    this.clock.start();
    this.animate();
  }

  private setupLighting() {
    this.hemiLight = new THREE.HemisphereLight(0x00f0ff, 0x120a26, 0.65);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(0xff2a85, 1.2);
    this.keyLight.position.set(20, 35, 15);
    this.keyLight.castShadow = !this.isSoftwareGl;
    if (this.keyLight.castShadow) {
      this.keyLight.shadow.mapSize.width = 1024;
      this.keyLight.shadow.mapSize.height = 1024;
      this.keyLight.shadow.camera.near = 0.5;
      this.keyLight.shadow.camera.far = 100;
      this.keyLight.shadow.camera.left = -30;
      this.keyLight.shadow.camera.right = 30;
      this.keyLight.shadow.camera.top = 30;
      this.keyLight.shadow.camera.bottom = -30;
      this.keyLight.shadow.bias = -0.0005;
    }
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.DirectionalLight(0x00e5ff, 0.9);
    this.rimLight.position.set(-25, 20, -20);
    this.scene.add(this.rimLight);

    this.groundNeon = new THREE.PointLight(0xff0077, 2.0, 30);
    this.groundNeon.position.set(0, 2, 0);
    this.scene.add(this.groundNeon);
  }

  private setupGround() {
    const floorGeo = new THREE.PlaneGeometry(80, 80, 40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090c16,
      roughness: 0.8,
      metalness: 0.4,
    });
    this.floorMesh = new THREE.Mesh(floorGeo, floorMat);
    this.floorMesh.rotation.x = -Math.PI / 2;
    this.floorMesh.receiveShadow = !this.isSoftwareGl;
    this.scene.add(this.floorMesh);

    this.gridHelper = new THREE.GridHelper(80, 40, 0x00f0ff, 0x1a2640);
    this.gridHelper.position.y = 0.02;
    this.scene.add(this.gridHelper);
  }

  /**
   * Load and Initialize a Mission Level dynamically
   */
  public loadLevel(level: MissionLevel) {
    this.currentLevel = level;

    // 1. Clear previous environment meshes
    while (this.environmentGroup.children.length > 0) {
      const obj = this.environmentGroup.children[0];
      this.environmentGroup.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    }
    if (this.carouselGroup) {
      this.scene.remove(this.carouselGroup);
      this.carouselGroup = undefined;
    }
    if (this.ferrisWheelGroup) {
      this.scene.remove(this.ferrisWheelGroup);
      this.ferrisWheelGroup = undefined;
    }
    if (this.derrickCraneGroup) {
      this.scene.remove(this.derrickCraneGroup);
      this.derrickCraneGroup = undefined;
    }
    if (this.reactorRingsGroup) {
      this.scene.remove(this.reactorRingsGroup);
      this.reactorRingsGroup = undefined;
    }
    if (this.extractionZoneMesh) {
      this.scene.remove(this.extractionZoneMesh);
    }
    this.signMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.signMeshes = [];

    // 2. Sky & Fog
    this.scene.background = new THREE.Color(level.skyColor);
    this.scene.fog = new THREE.FogExp2(level.fogColor, 0.022);

    // 3. Lighting adjustment
    if (this.hemiLight) this.hemiLight.color.setHex(level.ambientColor);
    if (this.keyLight) this.keyLight.color.setHex(level.keyLightColor);
    if (this.rimLight) this.rimLight.color.setHex(level.accentLightColor);
    if (this.groundNeon) this.groundNeon.color.setHex(level.keyLightColor);

    // 4. Floor & Grid adjustment
    if (this.floorMesh) {
      (this.floorMesh.material as THREE.MeshStandardMaterial).color.setHex(level.groundColor);
    }
    if (this.gridHelper) {
      this.scene.remove(this.gridHelper);
      this.gridHelper = new THREE.GridHelper(80, 40, level.gridColor, 0x1a2640);
      this.gridHelper.position.y = 0.02;
      this.scene.add(this.gridHelper);
    }

    // 5. Reset Player Position & Attributes
    this.playerPos.set(level.initialPlayerPos.x, level.initialPlayerPos.y, level.initialPlayerPos.z);
    this.playerHp = 100;
    this.cyberEnergy = 100;
    this.totalKillsCount = 0;
    this.accumulatedScore = 0;
    this.softPressureLevel = 0;
    this.softPressureCombo = 1.0;
    this.isSoftPressing = false;
    const curWp = WEAPON_CONFIGS[this.currentWeaponType] || WEAPON_CONFIGS.volt_ar;
    this.ammo = curWp.magSize;
    this.isReloading = false;

    // 6. Reset Shelf Position & Path
    this.shelfState.x = level.initialShelfPos.x;
    this.shelfState.z = level.initialShelfPos.z;
    this.shelfState.hp = 2000;
    this.shelfState.maxHp = 2000;
    this.shelfState.speed = 2.4;
    this.shelfState.isMoving = false;
    this.shelfState.currentNodeIndex = 0;
    this.shelfState.damageBlocked = 0;
    this.shelfState.perfectTransport = true;
    this.shelfState.path = JSON.parse(JSON.stringify(level.initialShelfPath));
    if (this.shelfMesh) {
      this.shelfMesh.position.set(this.shelfState.x, 0, this.shelfState.z);
      this.shelfMesh.rotation.y = 0;
    }
    this.updateRailVisuals();

    // 7. Build Environment
    if (level.environmentType === 'carnival') {
      this.setupCarnivalEnvironment();
    } else if (level.environmentType === 'docks') {
      this.setupDocksEnvironment();
    } else if (level.environmentType === 'reactor') {
      this.setupReactorEnvironment();
    }

    // 8. Extraction Zone
    this.setupExtractionZone(level.extractionZone.x, level.extractionZone.z, level.extractionZone.label);

    // 9. Signs
    level.signs.forEach((s) => this.createNeonSign(s.text, s.x, s.y, s.z, s.color));

    // 10. Spawn Entities
    this.setupTeammatesForLevel(level.teammatePositions);
    this.setupEnemiesForLevel(level.enemies);
    this.setupContrabandsForLevel(level.contrabands);
    this.setupPickupsForLevel(level.pickups);

    this.callbacks.onLogMessage(
      'SYSTEM',
      `【任務已載入】${level.name} (${level.codeName})。目標：奪回違禁品並透過貨架安全撤離！`,
      'tactical'
    );
  }

  /**
   * LEVEL 1 Environment: Broken Virtual Theme Park
   */
  private setupCarnivalEnvironment() {
    // 1. Broken Carousel in center-left (-5, 0, 4)
    this.carouselGroup = new THREE.Group();
    this.carouselGroup.position.set(-5, 0, 4);

    const baseGeo = new THREE.CylinderGeometry(6, 6.4, 0.6, 24);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e2436, roughness: 0.5, metalness: 0.8 });
    const carouselBase = new THREE.Mesh(baseGeo, baseMat);
    carouselBase.position.y = 0.3;
    this.carouselGroup.add(carouselBase);

    const ringGeo = new THREE.TorusGeometry(6.1, 0.1, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff2a85 });
    const neonRing = new THREE.Mesh(ringGeo, ringMat);
    neonRing.rotation.x = Math.PI / 2;
    neonRing.position.y = 0.6;
    this.carouselGroup.add(neonRing);

    const pillarGeo = new THREE.CylinderGeometry(1.2, 1.4, 4.5, 16);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x2a334d, metalness: 0.85, roughness: 0.3 });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 2.5;
    this.carouselGroup.add(pillar);

    const canopyGeo = new THREE.ConeGeometry(6.5, 2.2, 16);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x111624, roughness: 0.4, metalness: 0.7 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = 5.2;
    this.carouselGroup.add(canopy);

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const podGroup = new THREE.Group();
      podGroup.position.set(Math.cos(angle) * 4.2, 0.6, Math.sin(angle) * 4.2);

      const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 4.2, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0xc0c8d8, metalness: 0.9, roughness: 0.2 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 2.1;
      podGroup.add(pole);

      const podGeo = new THREE.BoxGeometry(0.8, 0.6, 1.4);
      const podMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xff2a85 : 0x00f0ff,
        emissive: i % 2 === 0 ? 0x330018 : 0x002233,
        roughness: 0.4,
        metalness: 0.7,
      });
      const pod = new THREE.Mesh(podGeo, podMat);
      pod.position.y = 1.0 + (i % 2 === 0 ? 0.4 : 0);
      podGroup.add(pod);

      this.carouselGroup.add(podGroup);
    }
    this.scene.add(this.carouselGroup);

    // 2. Ferris Wheel backdrop
    this.ferrisWheelGroup = new THREE.Group();
    this.ferrisWheelGroup.position.set(0, 18, -35);
    const wheelRimGeo = new THREE.TorusGeometry(18, 0.4, 8, 36);
    const wheelRimMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const wheelRim = new THREE.Mesh(wheelRimGeo, wheelRimMat);
    this.ferrisWheelGroup.add(wheelRim);

    for (let i = 0; i < 8; i++) {
      const spokeGeo = new THREE.CylinderGeometry(0.12, 0.12, 36, 6);
      const spokeMat = new THREE.MeshBasicMaterial({ color: 0xff2a85 });
      const spoke = new THREE.Mesh(spokeGeo, spokeMat);
      spoke.rotation.z = (i / 8) * Math.PI;
      this.ferrisWheelGroup.add(spoke);
    }
    this.scene.add(this.ferrisWheelGroup);

    // 3. Cover Barriers
    this.createCoverBarrier(6, 1.2, 6, 4, 2.4, 0.8, 0x1f2638);
    this.createCoverBarrier(-12, 1.2, -6, 5, 2.4, 1.0, 0x1f2638);
    this.createCoverBarrier(12, 1.2, -8, 6, 2.4, 1.2, 0x1f2638);
    this.createCoverBarrier(0, 1.2, 0, 4, 2.2, 1.0, 0x1a2133);
  }

  /**
   * LEVEL 2 Environment: Neon Container Shipping Docks
   */
  private setupDocksEnvironment() {
    // 1. Giant Gantry Derrick Crane at back
    this.derrickCraneGroup = new THREE.Group();
    this.derrickCraneGroup.position.set(0, 0, -24);

    // 4 A-frame Steel Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x222a38, metalness: 0.85, roughness: 0.3 });
    const legOffsets = [
      { x: -14, z: -4 },
      { x: -14, z: 4 },
      { x: 14, z: -4 },
      { x: 14, z: 4 },
    ];
    legOffsets.forEach((off) => {
      const legGeo = new THREE.CylinderGeometry(0.35, 0.6, 20, 8);
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(off.x, 10, off.z);
      this.derrickCraneGroup!.add(leg);
    });

    // Horizontal Gantry Truss Bridge
    const bridgeGeo = new THREE.BoxGeometry(32, 1.6, 6);
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.7, roughness: 0.4 });
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.y = 20;
    this.derrickCraneGroup.add(bridge);

    // Hoist Trolley hanging a suspended container
    const trolleyGeo = new THREE.BoxGeometry(3, 1, 3);
    const trolleyMat = new THREE.MeshStandardMaterial({ color: 0x151c28, metalness: 0.9, roughness: 0.2 });
    const trolley = new THREE.Mesh(trolleyGeo, trolleyMat);
    trolley.position.set(0, 19, 0);
    this.derrickCraneGroup.add(trolley);

    // Cables
    for (let cx of [-1, 1]) {
      const cableGeo = new THREE.CylinderGeometry(0.04, 0.04, 10, 6);
      const cableMat = new THREE.MeshBasicMaterial({ color: 0x99a3b5 });
      const cable = new THREE.Mesh(cableGeo, cableMat);
      cable.position.set(cx, 14, 0);
      this.derrickCraneGroup.add(cable);
    }

    // Suspended Glowing Cyber Container
    const suspBoxGeo = new THREE.BoxGeometry(5.8, 2.5, 2.4);
    const suspBoxMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x002233,
      metalness: 0.8,
      roughness: 0.3,
    });
    const suspBox = new THREE.Mesh(suspBoxGeo, suspBoxMat);
    suspBox.position.set(0, 9, 0);
    this.derrickCraneGroup.add(suspBox);

    // Crane Searchlight
    this.craneTrolleyLight = new THREE.SpotLight(0xffddaa, 3.5, 50, Math.PI / 5, 0.3);
    this.craneTrolleyLight.position.set(0, 19, 0);
    this.craneTrolleyLight.target.position.set(0, 0, -5);
    this.scene.add(this.craneTrolleyLight.target);
    this.derrickCraneGroup.add(this.craneTrolleyLight);

    this.scene.add(this.derrickCraneGroup);

    // 2. Shipping Container Stacks (Varied Colors & Orientations)
    // West Container Stack (Sniper high vantage)
    this.createContainer(-11, 1.3, 5, 0, 0x0088ff, 'CARGO-01');
    this.createContainer(-11, 3.9, 5, 0, 0xffaa00, 'HAZARD-02');
    this.createContainer(-11, 1.3, -1, 0, 0x1f2738, 'NAVY-03');
    this.createContainer(-11, 3.9, -1, 0, 0x00f0ff, 'CYBER-04');
    this.createContainer(-11, 1.3, -7, 0, 0xff2a85, 'VIP-05');

    // East Container Stack
    this.createContainer(11, 1.3, 5, 0, 0xffaa00, 'CARGO-06');
    this.createContainer(11, 3.9, 5, 0, 0x0088ff, 'CARGO-07');
    this.createContainer(11, 1.3, -1, 0, 0x00f0ff, 'CYBER-08');
    this.createContainer(11, 3.9, -1, 0, 0x1f2738, 'NAVY-09');
    this.createContainer(11, 1.3, -7, 0, 0xff2a85, 'VIP-10');

    // Central Tactical Chokepoint Crates
    this.createContainer(-3.5, 1.3, -4, Math.PI / 6, 0x253248, 'MID-11');
    this.createContainer(4.0, 1.3, -5, -Math.PI / 6, 0x253248, 'MID-12');
    this.createContainer(-1.5, 1.3, -11, 0, 0xffaa00, 'GATE-13');
    this.createContainer(4.5, 1.3, -12, Math.PI / 2, 0x0088ff, 'DOCK-14');

    // Industrial Cover Barriers & Metal Bollards
    this.createCoverBarrier(-5, 1.0, 7, 3, 2.0, 0.8, 0x1a2130);
    this.createCoverBarrier(5, 1.0, 7, 3, 2.0, 0.8, 0x1a2130);
  }

  /**
   * LEVEL 3 Environment: Subterranean Bio-Reactor Core
   */
  private setupReactorEnvironment() {
    // 1. Left Cooling Tower
    this.createCoolingTower(-16, -13);
    // 2. Right Cooling Tower
    this.createCoolingTower(16, -13);

    // 3. Central Magnetic Plasma Core
    this.reactorRingsGroup = new THREE.Group();
    this.reactorRingsGroup.position.set(0, 4.0, -8);

    // Glowing Inner Plasma Sphere
    const coreGeo = new THREE.SphereGeometry(1.6, 24, 24);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x008844,
      emissiveIntensity: 1.5,
      roughness: 0.2,
      metalness: 0.1,
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);
    this.reactorRingsGroup.add(coreSphere);

    // 3 Concentric Magnetic Containment Rings
    const ringRadii = [2.4, 3.1, 3.8];
    const ringColors = [0x00ff88, 0xbd00ff, 0x00f0ff];
    ringRadii.forEach((rad, idx) => {
      const ringGeo = new THREE.TorusGeometry(rad, 0.14, 12, 36);
      const ringMat = new THREE.MeshBasicMaterial({ color: ringColors[idx] });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      this.reactorRingsGroup!.add(ring);
    });

    // Sub-core Base Pylons
    const basePylonGeo = new THREE.CylinderGeometry(2.8, 3.4, 1.8, 16);
    const basePylonMat = new THREE.MeshStandardMaterial({ color: 0x111b15, metalness: 0.9, roughness: 0.3 });
    const basePylon = new THREE.Mesh(basePylonGeo, basePylonMat);
    basePylon.position.y = -3.1;
    this.reactorRingsGroup.add(basePylon);

    // Radiation Hazard Core Light
    this.reactorCoreLight = new THREE.PointLight(0x00ff88, 2.5, 25);
    this.reactorRingsGroup.add(this.reactorCoreLight);

    this.scene.add(this.reactorRingsGroup);

    // 4. Elevated Catwalks & Safety Railings
    const walkGeo = new THREE.BoxGeometry(4.0, 0.25, 12);
    const walkMat = new THREE.MeshStandardMaterial({ color: 0x18241c, metalness: 0.85, roughness: 0.25 });
    const walkLeft = new THREE.Mesh(walkGeo, walkMat);
    walkLeft.position.set(-8, 2.0, -4);
    this.environmentGroup.add(walkLeft);

    const walkRight = new THREE.Mesh(walkGeo, walkMat);
    walkRight.position.set(8, 2.0, -4);
    this.environmentGroup.add(walkRight);

    // Catwalk guardrails
    for (let wx of [-10, -6, 6, 10]) {
      const railGeo = new THREE.BoxGeometry(0.1, 1.2, 12);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x223628, metalness: 0.9, roughness: 0.2 });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(wx, 2.6, -4);
      this.environmentGroup.add(rail);
    }

    // Heavy Radiation Blast Doors & Barriers
    this.createCoverBarrier(-4, 1.3, 3, 3.5, 2.6, 1.0, 0x16241a);
    this.createCoverBarrier(4, 1.3, 3, 3.5, 2.6, 1.0, 0x16241a);
    this.createCoverBarrier(-3, 1.3, -13, 4.0, 2.6, 1.0, 0x16241a);
    this.createCoverBarrier(3, 1.3, -13, 4.0, 2.6, 1.0, 0x16241a);
  }

  private createCoolingTower(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Hyperbolic concrete body
    const towerGeo = new THREE.CylinderGeometry(5.0, 7.5, 20, 24, 1, true);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x141e17,
      roughness: 0.7,
      metalness: 0.3,
      side: THREE.DoubleSide,
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 10;
    group.add(tower);

    // Top Glowing Toxic Vapor Ring
    const topRingGeo = new THREE.TorusGeometry(5.1, 0.3, 8, 32);
    const topRingMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    const topRing = new THREE.Mesh(topRingGeo, topRingMat);
    topRing.rotation.x = Math.PI / 2;
    topRing.position.y = 20;
    group.add(topRing);

    // Mid Hazard Stripe Ring
    const midRingGeo = new THREE.TorusGeometry(5.9, 0.2, 8, 32);
    const midRingMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const midRing = new THREE.Mesh(midRingGeo, midRingMat);
    midRing.rotation.x = Math.PI / 2;
    midRing.position.y = 10;
    group.add(midRing);

    this.environmentGroup.add(group);
  }

  private createContainer(x: number, y: number, z: number, rotY: number, color: number, label: string) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = rotY;

    // Main Box
    const boxGeo = new THREE.BoxGeometry(2.4, 2.6, 6.0);
    const boxMat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.45,
      metalness: 0.75,
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.castShadow = !this.isSoftwareGl;
    box.receiveShadow = !this.isSoftwareGl;
    group.add(box);

    // Steel Edge Corner Castings
    for (let cx of [-1.2, 1.2]) {
      for (let cy of [-1.3, 1.3]) {
        for (let cz of [-3.0, 3.0]) {
          const cornerGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
          const cornerMat = new THREE.MeshStandardMaterial({ color: 0x121720, metalness: 0.9, roughness: 0.2 });
          const corner = new THREE.Mesh(cornerGeo, cornerMat);
          corner.position.set(cx, cy, cz);
          group.add(corner);
        }
      }
    }

    // Hazard Stripes on Lower Edge
    const stripeGeo = new THREE.BoxGeometry(2.45, 0.2, 6.05);
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.4 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = -1.2;
    group.add(stripe);

    this.environmentGroup.add(group);
  }

  private setupExtractionZone(x: number, z: number, label: string) {
    this.extractionZoneMesh = new THREE.Group();
    this.extractionZoneMesh.position.set(x, 0.05, z);

    const padGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.1, 32);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x151d2f, metalness: 0.6, roughness: 0.4 });
    const pad = new THREE.Mesh(padGeo, padMat);
    this.extractionZoneMesh.add(pad);

    const padRingGeo = new THREE.RingGeometry(3.6, 4.0, 32);
    const padRingMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, side: THREE.DoubleSide });
    const padRing = new THREE.Mesh(padRingGeo, padRingMat);
    padRing.rotation.x = -Math.PI / 2;
    padRing.position.y = 0.06;
    this.extractionZoneMesh.add(padRing);

    // Helipad 'H'
    const hBarGeo = new THREE.PlaneGeometry(0.5, 2.8);
    const hMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const h1 = new THREE.Mesh(hBarGeo, hMat);
    h1.rotation.x = -Math.PI / 2;
    h1.position.set(-1.0, 0.07, 0);
    const h2 = new THREE.Mesh(hBarGeo, hMat);
    h2.rotation.x = -Math.PI / 2;
    h2.position.set(1.0, 0.07, 0);
    const hMid = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.5), hMat);
    hMid.rotation.x = -Math.PI / 2;
    hMid.position.set(0, 0.07, 0);
    this.extractionZoneMesh.add(h1);
    this.extractionZoneMesh.add(h2);
    this.extractionZoneMesh.add(hMid);

    // Beacon Light
    const beacon = new THREE.PointLight(0xffaa00, 1.8, 12);
    beacon.position.set(0, 2.0, 0);
    this.extractionZoneMesh.add(beacon);

    this.scene.add(this.extractionZoneMesh);
  }

  private createNeonSign(text: string, x: number, y: number, z: number, color: number) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(10, 14, 25, 0.85)';
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);

    ctx.font = 'bold 34px "Chakra Petch", sans-serif';
    ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = `#${color.toString(16).padStart(6, '0')}`;
    ctx.shadowBlur = 12;
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const signGeo = new THREE.PlaneGeometry(4.8, 1.2);
    const signMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(x, y, z);
    this.scene.add(sign);
    this.signMeshes.push(sign);
  }

  private createCoverBarrier(x: number, y: number, z: number, w: number, h: number, d: number, color: number) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const boxGeo = new THREE.BoxGeometry(w, h, d);
    const boxMat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.6,
      metalness: 0.7,
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.castShadow = !this.isSoftwareGl;
    box.receiveShadow = !this.isSoftwareGl;
    group.add(box);

    const stripGeo = new THREE.BoxGeometry(w + 0.05, 0.25, d + 0.05);
    const stripMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      roughness: 0.5,
    });
    const stripe = new THREE.Mesh(stripGeo, stripMat);
    stripe.position.y = h / 2 - 0.12;
    group.add(stripe);

    this.environmentGroup.add(group);
  }

  /**
   * Procedural Dynamic Moving Bulletproof Shelf (動態防彈貨架)
   * 3-12 parts: Mag-lev chassis, wheel axles, industrial frame, 3 storage trays,
   * bulletproof ballistic shields, rail guidance beacon.
   */
  private setupMovingShelf() {
    this.shelfMesh = new THREE.Group();
    this.shelfMesh.position.set(this.shelfState.x, 0, this.shelfState.z);

    // 1. Lower chassis frame
    const chassisGeo = new THREE.BoxGeometry(2.6, 0.4, 3.6);
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x182030, metalness: 0.85, roughness: 0.3 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.4;
    chassis.castShadow = !this.isSoftwareGl;
    this.shelfMesh.add(chassis);

    // 2. Mag-lev glow pads underneath
    for (let sx of [-1, 1]) {
      for (let sz of [-1.3, 1.3]) {
        const padGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 12);
        const padMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.position.set(sx * 1.0, 0.1, sz);
        this.shelfMesh.add(pad);
      }
    }

    // 3. Upright industrial steel beams
    for (let sx of [-1.1, 1.1]) {
      for (let sz of [-1.6, 1.6]) {
        const pillarGeo = new THREE.BoxGeometry(0.12, 2.2, 0.12);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x36435c, metalness: 0.9, roughness: 0.2 });
        const p = new THREE.Mesh(pillarGeo, pillarMat);
        p.position.set(sx, 1.5, sz);
        this.shelfMesh.add(p);
      }
    }

    // 4. Bulletproof front & back Ballistic Shields (Transparent polycarbonate + metal frame)
    const shieldGeo = new THREE.BoxGeometry(2.4, 1.8, 0.08);
    const shieldMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      transmission: this.isSoftwareGl ? 0 : 0.7,
      transparent: true,
      opacity: this.isSoftwareGl ? 0.4 : 0.85,
      roughness: 0.15,
      metalness: 0.1,
      ior: 1.5,
    });
    const frontShield = new THREE.Mesh(shieldGeo, shieldMat);
    frontShield.position.set(0, 1.6, 1.6);
    this.shelfMesh.add(frontShield);

    const backShield = new THREE.Mesh(shieldGeo, shieldMat);
    backShield.position.set(0, 1.6, -1.6);
    this.shelfMesh.add(backShield);

    // 5. Middle storage tray for Contrabands
    const trayGeo = new THREE.BoxGeometry(2.3, 0.1, 3.2);
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x222a3d, metalness: 0.7, roughness: 0.4 });
    const tray = new THREE.Mesh(trayGeo, trayMat);
    tray.position.y = 1.0;
    this.shelfMesh.add(tray);

    // 6. Rail guidance beacon light on top
    const beaconGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 2.7, 0);
    this.shelfMesh.add(beacon);

    const beaconLight = new THREE.PointLight(0xffaa00, 1.5, 6);
    beaconLight.position.set(0, 2.7, 0);
    this.shelfMesh.add(beaconLight);

    this.scene.add(this.shelfMesh);

    // Render Rail Line
    this.updateRailVisuals();
  }

  public updateRailVisuals() {
    if (this.railLineMesh) {
      this.scene.remove(this.railLineMesh);
    }
    this.railNodeMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.railNodeMeshes = [];

    const points = this.shelfState.path.map((node) => new THREE.Vector3(node.x, 0.15, node.z));
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineDashedMaterial({
      color: 0x00f0ff,
      dashSize: 0.8,
      gapSize: 0.4,
      linewidth: 3,
    });
    this.railLineMesh = new THREE.Line(lineGeo, lineMat);
    this.railLineMesh.computeLineDistances();
    this.scene.add(this.railLineMesh);

    // Holographic Waypoint Nodes
    this.shelfState.path.forEach((node, idx) => {
      const nodeGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? 0x00ff88 : idx === this.shelfState.path.length - 1 ? 0xffaa00 : 0x00f0ff,
        wireframe: true,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(node.x, 0.16, node.z);
      this.scene.add(nodeMesh);
      this.railNodeMeshes.push(nodeMesh);
    });
  }

  /**
   * Procedural First-Person Volt-AR Electromagnetic Rifle
   * Follows character sheet: EM Coil Array, Optics Rail, Energy Battery, Muzzle
   */
  private setupPlayerWeapon() {
    this.playerWeaponGroup = new THREE.Group();

    // Rifle Receiver Main Chassis
    const receiverGeo = new THREE.BoxGeometry(0.1, 0.18, 0.65);
    const receiverMat = new THREE.MeshStandardMaterial({
      color: 0x161a22,
      metalness: 0.85,
      roughness: 0.25,
    });
    const receiver = new THREE.Mesh(receiverGeo, receiverMat);
    this.playerWeaponGroup.add(receiver);

    // Barrel / EM Coil Array (Neon cyan + pink coils)
    const barrelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 12);
    barrelGeo.rotateX(Math.PI / 2);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x242d3d, metalness: 0.9, roughness: 0.2 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.position.set(0, 0.02, -0.55);
    this.playerWeaponGroup.add(barrel);

    // EM Coils surrounding barrel
    this.weaponCoilMeshes = [];
    for (let i = 0; i < 4; i++) {
      const coilGeo = new THREE.TorusGeometry(0.045, 0.012, 8, 16);
      const coilMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00f0ff : 0xff2a85 });
      const coil = new THREE.Mesh(coilGeo, coilMat);
      coil.position.set(0, 0.02, -0.35 - i * 0.1);
      this.playerWeaponGroup.add(coil);
      this.weaponCoilMeshes.push(coil);
    }

    // Optics Rail + Holographic Sight
    const opticRailGeo = new THREE.BoxGeometry(0.06, 0.03, 0.3);
    const opticRail = new THREE.Mesh(opticRailGeo, receiverMat);
    opticRail.position.set(0, 0.11, -0.05);
    this.playerWeaponGroup.add(opticRail);

    // Holographic Reflex Sight Frame & Reticle
    const sightFrameGeo = new THREE.BoxGeometry(0.09, 0.08, 0.04);
    const sightFrame = new THREE.Mesh(sightFrameGeo, receiverMat);
    sightFrame.position.set(0, 0.16, -0.1);
    this.playerWeaponGroup.add(sightFrame);

    const reticleGeo = new THREE.RingGeometry(0.008, 0.014, 12);
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
    this.weaponReticleMesh = new THREE.Mesh(reticleGeo, reticleMat);
    this.weaponReticleMesh.position.set(0, 0.16, -0.12);
    this.playerWeaponGroup.add(this.weaponReticleMesh);

    // Energy Battery Mag (Detachable translucent power cell)
    const magGeo = new THREE.BoxGeometry(0.07, 0.24, 0.12);
    const magMat = new THREE.MeshStandardMaterial({
      color: 0xff2a85,
      emissive: 0x660033,
      metalness: 0.5,
      roughness: 0.3,
    });
    this.weaponMagMesh = new THREE.Mesh(magGeo, magMat);
    this.weaponMagMesh.position.set(0, -0.16, 0.05);
    this.weaponMagMesh.rotation.x = 0.2;
    this.playerWeaponGroup.add(this.weaponMagMesh);

    // Muzzle flash light & mesh
    this.muzzleFlashLight = new THREE.PointLight(0x00f0ff, 0, 8);
    this.muzzleFlashLight.position.set(0, 0.02, -0.9);
    this.playerWeaponGroup.add(this.muzzleFlashLight);

    const flashGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    this.muzzleFlashMesh = new THREE.Mesh(flashGeo, flashMat);
    this.muzzleFlashMesh.position.set(0, 0.02, -0.9);
    this.playerWeaponGroup.add(this.muzzleFlashMesh);

    // Position weapon relative to camera in FPS view
    this.playerWeaponGroup.position.set(0.32, -0.26, -0.58);
    this.camera.add(this.playerWeaponGroup);
    this.scene.add(this.camera);
  }

  public updateWeaponVisuals(type: WeaponType) {
    const config = WEAPON_CONFIGS[type];
    const coilColors: Record<WeaponType, number[]> = {
      volt_ar: [0x00f0ff, 0xff2a85, 0x00f0ff, 0xff2a85],
      plasma_cannon: [0xff2a85, 0x9900ff, 0xff2a85, 0x9900ff],
      cyber_smg: [0x00ff88, 0x00f0ff, 0x00ff88, 0x00f0ff],
      nano_shotgun: [0xffaa00, 0xff5500, 0xffaa00, 0xff5500],
    };

    const colors = coilColors[type] || coilColors.volt_ar;
    this.weaponCoilMeshes.forEach((mesh, idx) => {
      (mesh.material as THREE.MeshBasicMaterial).color.setHex(colors[idx % colors.length]);
    });

    if (this.weaponMagMesh) {
      const magMat = this.weaponMagMesh.material as THREE.MeshStandardMaterial;
      magMat.color.setHex(config.color);
      magMat.emissive.setHex(config.color);
    }

    if (this.weaponReticleMesh) {
      (this.weaponReticleMesh.material as THREE.MeshBasicMaterial).color.setHex(config.color);
    }

    if (this.muzzleFlashLight) {
      this.muzzleFlashLight.color.setHex(config.color);
    }
  }

  /**
   * Procedural Third-Person Cyborg Operative Model (Neo-Nights Alpha)
   * Follows character design: Composite dark armor, glowing cyan/magenta conduits, power pack, Volt-AR rifle.
   * Visible in 2.5D Isometric view for zero-dizziness tactical gameplay.
   */
  private setupPlayerModel() {
    this.playerModelGroup = new THREE.Group();
    this.playerModelGroup.position.set(this.playerPos.x, 0, this.playerPos.z);

    // 1. Torso & Composite Armor
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.95, 0.45);
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x181e2b,
      metalness: 0.85,
      roughness: 0.25,
    });
    this.playerTorsoMesh = new THREE.Mesh(torsoGeo, armorMat);
    this.playerTorsoMesh.position.y = 1.35;
    this.playerModelGroup.add(this.playerTorsoMesh);

    // Glowing chest emblem / arc reactor
    const chestPlateGeo = new THREE.BoxGeometry(0.35, 0.35, 0.08);
    const chestEmblemMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const chestPlate = new THREE.Mesh(chestPlateGeo, chestEmblemMat);
    chestPlate.position.set(0, 1.45, 0.24);
    this.playerModelGroup.add(chestPlate);

    // 2. Cyber Shell (Backpack Power Pack)
    const powerPackGeo = new THREE.BoxGeometry(0.5, 0.7, 0.26);
    const packMat = new THREE.MeshStandardMaterial({
      color: 0x0f1520,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x220033,
    });
    const powerPack = new THREE.Mesh(powerPackGeo, packMat);
    powerPack.position.set(0, 1.4, -0.32);
    this.playerModelGroup.add(powerPack);

    // Neon pink power heat vents on back
    const ventGeo = new THREE.BoxGeometry(0.08, 0.45, 0.04);
    const ventMat = new THREE.MeshBasicMaterial({ color: 0xff2a85 });
    const ventL = new THREE.Mesh(ventGeo, ventMat);
    ventL.position.set(-0.15, 1.4, -0.46);
    const ventR = new THREE.Mesh(ventGeo, ventMat);
    ventR.position.set(0.15, 1.4, -0.46);
    this.playerModelGroup.add(ventL);
    this.playerModelGroup.add(ventR);

    // 3. Cyber Helmet with Neon Eye Visor
    const headGeo = new THREE.SphereGeometry(0.26, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x242d3d, metalness: 0.8, roughness: 0.3 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.05;
    this.playerModelGroup.add(head);

    const visorGeo = new THREE.BoxGeometry(0.32, 0.12, 0.2);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    this.playerVisorMesh = new THREE.Mesh(visorGeo, visorMat);
    this.playerVisorMesh.position.set(0, 2.05, 0.2);
    this.playerModelGroup.add(this.playerVisorMesh);

    // 4. Arms & High-tech Rifle in hands
    const rifleGeo = new THREE.BoxGeometry(0.1, 0.14, 0.75);
    const rifleMat = new THREE.MeshStandardMaterial({ color: 0x111622, metalness: 0.9, roughness: 0.2 });
    this.playerGunMesh = new THREE.Mesh(rifleGeo, rifleMat);
    this.playerGunMesh.position.set(0.35, 1.25, 0.4);
    this.playerModelGroup.add(this.playerGunMesh);

    const rifleCoilGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.35, 8);
    rifleCoilGeo.rotateX(Math.PI / 2);
    const rifleCoilMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const rifleCoil = new THREE.Mesh(rifleCoilGeo, rifleCoilMat);
    rifleCoil.position.set(0.35, 1.28, 0.6);
    this.playerModelGroup.add(rifleCoil);

    // 5. Tactile Direction Compass on ground under player feet
    const baseBeaconGeo = new THREE.RingGeometry(0.7, 0.85, 24);
    baseBeaconGeo.rotateX(-Math.PI / 2);
    const baseBeaconMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const baseBeacon = new THREE.Mesh(baseBeaconGeo, baseBeaconMat);
    baseBeacon.position.y = 0.04;
    this.playerModelGroup.add(baseBeacon);

    // Aim pointer chevron
    const aimArrowGeo = new THREE.ConeGeometry(0.2, 0.5, 3);
    aimArrowGeo.rotateX(-Math.PI / 2);
    const aimArrowMat = new THREE.MeshBasicMaterial({ color: 0xff2a85 });
    const aimArrow = new THREE.Mesh(aimArrowGeo, aimArrowMat);
    aimArrow.position.set(0, 0.05, 1.1);
    this.playerModelGroup.add(aimArrow);

    this.scene.add(this.playerModelGroup);
    this.playerModelGroup.visible = this.viewMode === 'tactical';
  }

  /**
   * Procedural VFX for Soft-Pressure Suppression System
   */
  private setupSoftPressureVFX() {
    this.softPressureConeGroup = new THREE.Group();
    this.softPressureConeGroup.position.set(this.playerPos.x, 0.08, this.playerPos.z);

    // 1. Conical Sector Geometry (60 degree fan, radius 14m)
    const coneSegments = 24;
    const coneAngle = Math.PI / 3; // 60 degrees
    const coneRadius = 14;
    const vertices: number[] = [0, 0, 0];

    for (let i = 0; i <= coneSegments; i++) {
      const theta = -coneAngle / 2 + (i / coneSegments) * coneAngle;
      const x = Math.sin(theta) * coneRadius;
      const z = Math.cos(theta) * coneRadius;
      vertices.push(x, 0, z);
    }

    const indices: number[] = [];
    for (let i = 1; i <= coneSegments; i++) {
      indices.push(0, i, i + 1);
    }

    const coneGeo = new THREE.BufferGeometry();
    coneGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    coneGeo.setIndex(indices);
    coneGeo.computeVertexNormals();

    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.softPressureConeMesh = new THREE.Mesh(coneGeo, coneMat);
    this.softPressureConeGroup.add(this.softPressureConeMesh);

    // Wireframe perimeter of stasis cone for high tactical legibility
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
      transparent: true,
      opacity: 0,
    });
    const wireframeCone = new THREE.Mesh(coneGeo.clone(), wireframeMat);
    this.softPressureConeGroup.add(wireframeCone);

    this.scene.add(this.softPressureConeGroup);

    // 2. Piercing Resonance Plasma Beam Mesh
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.12, 1, 12);
    beamGeo.rotateX(Math.PI / 2);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.softPressureBeamMesh = new THREE.Mesh(beamGeo, beamMat);
    this.softPressureBeamMesh.visible = false;
    this.scene.add(this.softPressureBeamMesh);

    // 3. Radial EMP Cleansing Shockwave Ring
    const shockGeo = new THREE.RingGeometry(0.1, 0.9, 32);
    shockGeo.rotateX(-Math.PI / 2);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.softPressureShockwaveMesh = new THREE.Mesh(shockGeo, shockMat);
    this.softPressureShockwaveMesh.position.set(0, 0.1, 0);
    this.softPressureShockwaveMesh.visible = false;
    this.scene.add(this.softPressureShockwaveMesh);
  }

  /**
   * Soft-Pressure Suppression Simulation (Zero-fatigue continuous input)
   * Smoothly builds pressure while mouse / touch / spacebar is gently held down.
   */
  private updateSoftPressure(delta: number) {
    if (this.isPaused) return;

    // 1. Charge or Vent Soft-Pressure
    if (this.isSoftPressing) {
      this.softPressureLevel = Math.min(1.0, this.softPressureLevel + delta * 0.9);
      soundManager.updatePressureHum(this.softPressureLevel);
    } else {
      // If released from Overdrive tier (>= 0.75), detonate EMP Cleansing Nova!
      if (this.softPressureLevel >= 0.75) {
        this.triggerEMPNova();
      }
      this.softPressureLevel = Math.max(0, this.softPressureLevel - delta * 2.2);
      soundManager.updatePressureHum(this.softPressureLevel);
    }

    // Determine Active Phase
    if (this.softPressureLevel < 0.15) {
      this.softPressurePhase = 'idle';
      const coneMat = this.softPressureConeMesh.material as THREE.MeshBasicMaterial;
      coneMat.opacity = 0;
      this.softPressureBeamMesh.visible = false;
    } else if (this.softPressureLevel < 0.45) {
      this.softPressurePhase = 'jamming'; // Phase 1: 輕壓干擾力場
      const coneMat = this.softPressureConeMesh.material as THREE.MeshBasicMaterial;
      coneMat.color.setHex(0x00f0ff);
      coneMat.opacity = 0.35 + Math.sin(Date.now() * 0.008) * 0.1;
      this.softPressureBeamMesh.visible = false;
    } else if (this.softPressureLevel < 0.75) {
      this.softPressurePhase = 'resonance'; // Phase 2: 中壓共振穿透光束
      const coneMat = this.softPressureConeMesh.material as THREE.MeshBasicMaterial;
      coneMat.color.setHex(0xa855f7);
      coneMat.opacity = 0.45 + Math.sin(Date.now() * 0.012) * 0.15;
      this.softPressureBeamMesh.visible = true;
    } else {
      this.softPressurePhase = 'overdrive'; // Phase 3: 重壓過載
      const coneMat = this.softPressureConeMesh.material as THREE.MeshBasicMaterial;
      coneMat.color.setHex(0xffaa00);
      coneMat.opacity = 0.65 + Math.sin(Date.now() * 0.02) * 0.2;
      this.softPressureBeamMesh.visible = true;
    }

    // Position and orient Soft-Pressure Cone
    this.softPressureConeGroup.position.set(this.playerPos.x, 0.08, this.playerPos.z);
    const aimDir = new THREE.Vector3(0, 0, -1);
    if (this.viewMode === 'tactical') {
      aimDir.subVectors(this.mouseAimPoint, this.playerPos);
      aimDir.y = 0;
      if (aimDir.lengthSq() > 0.01) {
        aimDir.normalize();
        const angle = Math.atan2(aimDir.x, aimDir.z);
        this.softPressureConeGroup.rotation.y = angle;
        if (this.playerModelGroup) {
          this.playerModelGroup.rotation.y = angle;
        }
      }
    } else {
      this.softPressureConeGroup.rotation.y = this.playerRotation.yaw;
    }

    // 2. Apply Soft-Pressure Suppression to Enemies
    if (this.softPressureLevel >= 0.15) {
      const coneRadius = 14;
      const coneHalfAngle = Math.PI / 6;

      let nearestTargetEnemy: (Enemy & { mesh: THREE.Group; laserLine?: THREE.Line }) | null = null;
      let minTargetDist = 999;

      for (const enemy of this.enemies) {
        if (!enemy.isAlive) continue;

        const toEnemy = new THREE.Vector3(enemy.x - this.playerPos.x, 0, enemy.z - this.playerPos.z);
        const dist = toEnemy.length();

        if (dist <= coneRadius) {
          toEnemy.normalize();
          const angleDiff = Math.abs(aimDir.angleTo(toEnemy));
          if (angleDiff <= coneHalfAngle) {
            // ENEMY IS INSIDE SUPPRESSION CONE!
            // Phase 1 Effect: Stasis & Weapon Jam (relieves combat tension)
            enemy.alertState = 'patrol';
            enemy.attackCooldown = 1.5; // Jam weapon!
            if (Math.random() < 0.25) {
              this.spawnHitSparks(new THREE.Vector3(enemy.x, 1.8, enemy.z), 0x00f0ff);
            }

            // Track target for Phase 2 Resonance Beam
            if (dist < minTargetDist) {
              minTargetDist = dist;
              nearestTargetEnemy = enemy;
            }
          }
        }
      }

      // Phase 2 Effect: Continuous Resonance Beam Damage
      if (this.softPressureLevel >= 0.45 && nearestTargetEnemy) {
        const target = nearestTargetEnemy;
        const beamStart = new THREE.Vector3(this.playerPos.x, 1.3, this.playerPos.z);
        const beamEnd = new THREE.Vector3(target.x, 1.3, target.z);
        const beamDist = beamStart.distanceTo(beamEnd);

        this.softPressureBeamMesh.position.copy(beamStart).lerp(beamEnd, 0.5);
        this.softPressureBeamMesh.scale.set(1, 1, beamDist);
        this.softPressureBeamMesh.lookAt(beamEnd);
        (this.softPressureBeamMesh.material as THREE.MeshBasicMaterial).opacity = 0.85;

        // Continuous resonant damage
        const damageThisTick = (this.softPressureLevel >= 0.75 ? 240 : 150) * delta;
        target.hp -= damageThisTick;
        soundManager.playResonanceBeam();
        this.spawnHitSparks(new THREE.Vector3(target.x, 1.3, target.z), 0xa855f7);

        if (target.hp <= 0) {
          target.isAlive = false;
          target.mesh.visible = false;
          if (target.laserLine) target.laserLine.visible = false;

          // Score and kill progression
          this.totalKillsCount++;
          this.softPressureCombo = Math.min(3.5, this.softPressureCombo + 0.15);
          const baseScore = target.type === 'heavy' ? 300 : target.type === 'sniper' ? 200 : 100;
          const killScore = Math.round(baseScore * this.softPressureCombo);
          this.accumulatedScore += killScore;

          this.callbacks.onScoreUpdate({ kills: killScore });
          this.callbacks.onFloatingScore?.(`+${killScore}`, target.x, target.z, '#00f0ff');
          soundManager.playScoreGain();
          this.callbacks.onLogMessage('SUPPRESSION', `軟壓共振淨化敵軍 [${target.type.toUpperCase()}] · 連擊 ${this.softPressureCombo.toFixed(1)}x`, 'success');
        }
      } else {
        this.softPressureBeamMesh.visible = false;
      }
    }

    // 3. Handle expanding EMP shockwave
    if (this.shockwaveActive) {
      this.shockwaveRadius += delta * 24;
      this.softPressureShockwaveMesh.scale.set(this.shockwaveRadius, this.shockwaveRadius, 1);
      const shockMat = this.softPressureShockwaveMesh.material as THREE.MeshBasicMaterial;
      shockMat.opacity = Math.max(0, 1 - this.shockwaveRadius / 20);

      if (this.shockwaveRadius >= 20) {
        this.shockwaveActive = false;
        this.softPressureShockwaveMesh.visible = false;
      }
    }

    // 4. Report state to React HUD
    this.callbacks.onSoftPressureUpdate?.(
      this.softPressureLevel,
      this.softPressurePhase,
      this.totalKillsCount,
      this.accumulatedScore
    );
  }

  /**
   * Trigger High-Pressure EMP Shockwave Nova
   */
  public triggerEMPNova() {
    this.shockwaveActive = true;
    this.shockwaveRadius = 1.0;
    this.softPressureShockwaveMesh.position.set(this.playerPos.x, 0.1, this.playerPos.z);
    this.softPressureShockwaveMesh.visible = true;
    soundManager.playEMPNova();

    // Cleanse all enemies within 18m
    this.enemies.forEach((enemy) => {
      if (!enemy.isAlive) return;
      const dist = new THREE.Vector2(enemy.x - this.playerPos.x, enemy.z - this.playerPos.z).length();
      if (dist <= 18) {
        enemy.hp -= 350;
        this.spawnHitSparks(new THREE.Vector3(enemy.x, 1.4, enemy.z), 0x00f0ff);
        if (enemy.hp <= 0) {
          enemy.isAlive = false;
          enemy.mesh.visible = false;
          if (enemy.laserLine) enemy.laserLine.visible = false;
          this.totalKillsCount++;
          const killScore = (enemy.type === 'heavy' ? 300 : enemy.type === 'sniper' ? 200 : 100) * 2;
          this.accumulatedScore += killScore;
          this.callbacks.onScoreUpdate({ kills: killScore });
          this.callbacks.onFloatingScore?.(`EMP淨化 +${killScore}`, enemy.x, enemy.z, '#ffaa00');
        }
      }
    });

    this.callbacks.onLogMessage('OVERDRIVE', '【全域 EMP 脈衝釋放】已癱瘓並淨化周遭敵軍威脅！', 'success');
  }

  /**
   * Procedural Teammates (Bex, Kai, Vex) with Cyber Shells + Containment Bag State
   */
  public setupTeammatesForLevel(mateConfigs: { id: string; name: string; callsign: string; role: string; x: number; z: number }[]) {
    this.teammates.forEach((tm) => {
      this.scene.remove(tm.mesh);
      this.scene.remove(tm.bagMesh);
    });
    this.teammates = [];

    mateConfigs.forEach((cfg) => {
      // 1. Teammate Cyborg Model
      const mateGroup = new THREE.Group();
      mateGroup.position.set(cfg.x, 0, cfg.z);

      // Torso Composite Armor
      const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.4);
      const torsoMat = new THREE.MeshStandardMaterial({ color: 0x1f2738, metalness: 0.8, roughness: 0.3 });
      const torso = new THREE.Mesh(torsoGeo, torsoMat);
      torso.position.y = 1.35;
      mateGroup.add(torso);

      // Cyber Shell power pack on back (from character sheet)
      const shellGeo = new THREE.BoxGeometry(0.48, 0.65, 0.22);
      const shellMat = new THREE.MeshStandardMaterial({
        color: 0x0f1520,
        emissive: 0x110022,
        metalness: 0.9,
      });
      const shell = new THREE.Mesh(shellGeo, shellMat);
      shell.position.set(0, 1.4, -0.28);
      mateGroup.add(shell);

      // Battery heat vent light strips
      const ventGeo = new THREE.BoxGeometry(0.08, 0.4, 0.04);
      const ventMat = new THREE.MeshBasicMaterial({ color: 0xff2a85 });
      const vent1 = new THREE.Mesh(ventGeo, ventMat);
      vent1.position.set(-0.14, 1.4, -0.39);
      const vent2 = new THREE.Mesh(ventGeo, ventMat);
      vent2.position.set(0.14, 1.4, -0.39);
      mateGroup.add(vent1);
      mateGroup.add(vent2);

      // Helmet & Visor
      const headGeo = new THREE.SphereGeometry(0.24, 12, 12);
      const headMat = new THREE.MeshStandardMaterial({ color: 0x2a3449, metalness: 0.8, roughness: 0.3 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 2.05;
      mateGroup.add(head);

      const visorGeo = new THREE.BoxGeometry(0.28, 0.1, 0.18);
      const visorMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.position.set(0, 2.05, 0.18);
      mateGroup.add(visor);

      // Teammate Volt-AR rifle in hands
      const rifleGeo = new THREE.BoxGeometry(0.08, 0.12, 0.65);
      const rifleMat = new THREE.MeshStandardMaterial({ color: 0x121722, metalness: 0.9, roughness: 0.2 });
      const rifle = new THREE.Mesh(rifleGeo, rifleMat);
      rifle.position.set(0.35, 1.25, 0.35);
      mateGroup.add(rifle);

      // Rifle barrel coil glow
      const coilGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
      coilGeo.rotateX(Math.PI / 2);
      const coilMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const coil = new THREE.Mesh(coilGeo, coilMat);
      coil.position.set(0.35, 1.26, 0.68);
      mateGroup.add(coil);

      // Legs
      for (let sx of [-0.2, 0.2]) {
        const legGeo = new THREE.BoxGeometry(0.24, 0.9, 0.26);
        const leg = new THREE.Mesh(legGeo, torsoMat);
        leg.position.set(sx, 0.45, 0);
        mateGroup.add(leg);
      }

      this.scene.add(mateGroup);

      // 2. Cyber Containment Bag (賽博防爆袋 - High-tech folded state)
      const bagGroup = new THREE.Group();
      bagGroup.position.set(cfg.x, 0, cfg.z);
      bagGroup.visible = false;

      // Folded capsule bag body
      const bagGeo = new THREE.BoxGeometry(1.4, 0.45, 0.8);
      const bagMat = new THREE.MeshStandardMaterial({
        color: 0x141824,
        roughness: 0.4,
        metalness: 0.6,
      });
      const bagBody = new THREE.Mesh(bagGeo, bagMat);
      bagBody.position.y = 0.25;
      bagGroup.add(bagBody);

      // High-tech metal zipper & warning labels
      const zipGeo = new THREE.BoxGeometry(1.3, 0.05, 0.1);
      const zipMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
      const zipper = new THREE.Mesh(zipGeo, zipMat);
      zipper.position.set(0, 0.48, 0);
      bagGroup.add(zipper);

      // Glowing hazard beacon on containment bag
      const bagBeacon = new THREE.PointLight(0xff2a85, 1.2, 4);
      bagBeacon.position.set(0, 0.6, 0);
      bagGroup.add(bagBeacon);

      this.scene.add(bagGroup);

      this.teammates.push({
        id: cfg.id,
        name: cfg.name,
        callsign: cfg.callsign,
        role: cfg.role,
        hp: 100,
        maxHp: 100,
        cyberShell: 100,
        status: 'active',
        x: cfg.x,
        z: cfg.z,
        extractProgress: 0,
        rebootTimer: 0,
        shootCooldown: 1.0 + Math.random() * 1.5,
        mesh: mateGroup,
        bagMesh: bagGroup,
      });
    });
  }

  public spawnEnemy(type: 'thug' | 'heavy' | 'sniper', x: number, z: number, hp: number) {
    const enemyGroup = new THREE.Group();
    enemyGroup.position.set(x, 0, z);

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.4);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: type === 'heavy' ? 0x2b1016 : 0x1f1f26,
      roughness: 0.5,
      metalness: 0.7,
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.35;
    torso.castShadow = !this.isSoftwareGl;
    enemyGroup.add(torso);

    // Head / Optic eye
    const headGeo = new THREE.SphereGeometry(0.24, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.05;
    enemyGroup.add(head);

    const eyeGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(0, 2.05, 0.22);
    enemyGroup.add(eye);

    // Legs
    for (let sx of [-0.2, 0.2]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.9, 0.24), torsoMat);
      leg.position.set(sx, 0.45, 0);
      enemyGroup.add(leg);
    }

    // Enemy firearm in hand
    const eGunGeo = new THREE.BoxGeometry(0.08, 0.1, 0.5);
    const eGunMat = new THREE.MeshStandardMaterial({ color: 0x181818, metalness: 0.8, roughness: 0.4 });
    const eGun = new THREE.Mesh(eGunGeo, eGunMat);
    eGun.position.set(0.35, 1.25, 0.3);
    enemyGroup.add(eGun);

    // Heavy Shield Unit: Frontal Riot Shield
    if (type === 'heavy') {
      const shieldGeo = new THREE.BoxGeometry(1.6, 1.8, 0.12);
      const shieldMat = new THREE.MeshStandardMaterial({
        color: 0x5a1820,
        metalness: 0.9,
        roughness: 0.25,
      });
      const shield = new THREE.Mesh(shieldGeo, shieldMat);
      shield.position.set(0, 1.35, 0.5);
      enemyGroup.add(shield);
    }

    // Sniper Unit: Laser targeting sight
    let laserLine: THREE.Line | undefined;
    if (type === 'sniper') {
      const laserGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 1.8, 0.5),
        new THREE.Vector3(0, 1.8, 20),
      ]);
      const laserMat = new THREE.LineBasicMaterial({ color: 0xff0033, linewidth: 2 });
      laserLine = new THREE.Line(laserGeo, laserMat);
      enemyGroup.add(laserLine);
    }

    this.scene.add(enemyGroup);

    const enemyData = {
      id: `enemy_${++this.enemyCounter}`,
      type,
      x,
      z,
      hp,
      maxHp: hp,
      rotation: Math.PI,
      isAlive: true,
      alertState: 'alert' as const,
      attackCooldown: 0.8 + Math.random() * 1.5,
      patrolCenter: { x, z },
      shieldHp: type === 'heavy' ? 250 : 0,
      mesh: enemyGroup,
      laserLine,
    };
    this.enemies.push(enemyData);
    return enemyData;
  }

  /**
   * Procedural Terrorists configured per Mission Level
   */
  public setupEnemiesForLevel(enemyConfigs: { type: 'thug' | 'heavy' | 'sniper'; x: number; z: number; hp: number }[]) {
    this.enemies.forEach((e) => {
      this.scene.remove(e.mesh);
      if (e.laserLine) this.scene.remove(e.laserLine);
    });
    this.enemies = [];

    enemyConfigs.forEach((cfg) => {
      this.spawnEnemy(cfg.type, cfg.x, cfg.z, cfg.hp);
    });
  }

  /**
   * Procedural Contraband Items configured per Mission Level
   */
  public setupContrabandsForLevel(contrabandConfigs: {
    id: string;
    type: 'chip' | 'organ' | 'database';
    name: string;
    points: number;
    weightPenalty: number;
    x: number;
    z: number;
    hp: number;
  }[]) {
    this.contrabandMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.contrabandMeshes.clear();
    this.contrabands = [];
    this.shelfContrabandSlots = [null, null, null];
    this.carriedContraband = null;

    this.contrabands = contrabandConfigs.map((c) => ({
      id: c.id,
      type: c.type,
      name: c.name,
      points: c.points,
      weightPenalty: c.weightPenalty,
      x: c.x,
      z: c.z,
      status: 'ground' as const,
      hp: c.hp,
    }));

    this.contrabands.forEach((cb) => {
      const group = new THREE.Group();
      group.position.set(cb.x, 0.4, cb.z);

      if (cb.type === 'chip') {
        const geo = new THREE.BoxGeometry(0.4, 0.15, 0.4);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x00f0ff,
          emissive: 0x004455,
          roughness: 0.2,
          metalness: 0.8,
        });
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
      } else if (cb.type === 'organ') {
        const tubeGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.7, 16);
        const tubeMat = new THREE.MeshPhysicalMaterial({
          color: 0x00ff88,
          transmission: this.isSoftwareGl ? 0 : 0.8,
          transparent: true,
          opacity: 0.85,
        });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        group.add(tube);

        const organGeo = new THREE.SphereGeometry(0.14, 8, 8);
        const organMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
        const organ = new THREE.Mesh(organGeo, organMat);
        group.add(organ);
      } else {
        const caseGeo = new THREE.BoxGeometry(0.7, 0.4, 0.5);
        const caseMat = new THREE.MeshStandardMaterial({
          color: 0xffaa00,
          roughness: 0.4,
          metalness: 0.8,
        });
        const cMesh = new THREE.Mesh(caseGeo, caseMat);
        group.add(cMesh);
      }

      const ringGeo = new THREE.RingGeometry(0.45, 0.55, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -0.38;
      group.add(ring);

      this.scene.add(group);
      this.contrabandMeshes.set(cb.id, group);
    });
  }

  /**
   * Setup Weapon and Ammo Pickups per Mission Level
   */
  public setupPickupsForLevel(pickupsConfig: {
    weapons: { id: string; weaponType: WeaponType; name: string; x: number; z: number; color: number }[];
    ammo: { id: string; x: number; z: number; name: string }[];
  }) {
    this.pickups.forEach((p) => this.scene.remove(p.mesh));
    this.pickups = [];

    // 1. Weapon Stations
    pickupsConfig.weapons.forEach((cfg) => {
      const group = new THREE.Group();
      group.position.set(cfg.x, 0, cfg.z);

      const baseGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.35, 6);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x141a29, metalness: 0.85, roughness: 0.25 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.18;
      group.add(base);

      const ringGeo = new THREE.TorusGeometry(0.75, 0.04, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: cfg.color });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.36;
      group.add(ring);

      const weaponModelGroup = new THREE.Group();
      weaponModelGroup.position.y = 1.05;

      const bodyGeo = new THREE.BoxGeometry(0.18, 0.22, 0.9);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1f2638, metalness: 0.9, roughness: 0.2 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      weaponModelGroup.add(body);

      const coreGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 12);
      coreGeo.rotateX(Math.PI / 2);
      const coreMat = new THREE.MeshBasicMaterial({ color: cfg.color });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(0, 0.04, -0.1);
      weaponModelGroup.add(core);

      group.add(weaponModelGroup);

      const beaconLight = new THREE.PointLight(cfg.color, 1.2, 5);
      beaconLight.position.set(0, 1.3, 0);
      group.add(beaconLight);

      this.scene.add(group);
      this.pickups.push({
        id: cfg.id,
        type: 'weapon',
        weaponType: cfg.weaponType,
        name: cfg.name,
        x: cfg.x,
        z: cfg.z,
        isPickedUp: false,
        mesh: group,
      });
    });

    // 2. Ammo Crates
    pickupsConfig.ammo.forEach((pos) => {
      const group = new THREE.Group();
      group.position.set(pos.x, 0, pos.z);

      const boxGeo = new THREE.BoxGeometry(0.7, 0.45, 0.5);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0x1e2738, metalness: 0.8, roughness: 0.3 });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.y = 0.24;
      group.add(box);

      const stripeGeo = new THREE.BoxGeometry(0.72, 0.08, 0.52);
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.y = 0.28;
      group.add(stripe);

      for (let sx of [-0.18, 0.18]) {
        const cellGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8);
        const cellMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const cell = new THREE.Mesh(cellGeo, cellMat);
        cell.position.set(sx, 0.48, 0);
        group.add(cell);
      }

      const ringGeo = new THREE.RingGeometry(0.45, 0.55, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      group.add(ring);

      this.scene.add(group);
      this.pickups.push({
        id: pos.id,
        type: 'ammo',
        amount: 60,
        name: pos.name,
        x: pos.x,
        z: pos.z,
        isPickedUp: false,
        mesh: group,
      });
    });
  }

  /**
   * Spawn ammo drop at defeated enemy location
   */
  public spawnAmmoDrop(x: number, z: number) {
    const id = `ammo_drop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const cellGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 12);
    const cellMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00aacc,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.7,
    });
    const cell = new THREE.Mesh(cellGeo, cellMat);
    cell.position.y = 0.25;
    group.add(cell);

    const ringGeo = new THREE.RingGeometry(0.25, 0.35, 12);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    group.add(ring);

    this.scene.add(group);
    this.pickups.push({
      id,
      type: 'ammo',
      amount: 40,
      name: '敵人掉落高能彈匣 (+40)',
      x,
      z,
      isPickedUp: false,
      mesh: group,
    });
  }

  /**
   * Pause or Resume Game Engine
   */
  public setPaused(paused: boolean) {
    if (this.isPaused === paused) return;
    this.isPaused = paused;
    try {
      soundManager.playPauseClick(paused);
    } catch {
      // Audio might not be ready yet
    }
    try {
      if (paused && typeof document !== 'undefined' && document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    } catch {
      // Ignore iframe pointer lock restriction
    }
    try {
      this.callbacks.onPauseToggle?.(paused);
      this.callbacks.onLogMessage(
        'SYSTEM',
        paused ? '【戰術暫停中】戰場時間與動作已凍結。可按 [P] 或點擊面板恢復。' : '【作戰繼續】新夜城戰線重新啟動！',
        paused ? 'warning' : 'tactical'
      );
    } catch {
      // Callback error safe
    }
  }

  /**
   * Switch Active Player Weapon
   */
  public switchWeapon(type: WeaponType) {
    if (!this.unlockedWeapons.includes(type)) {
      this.callbacks.onLogMessage('SYSTEM', '尚未解鎖該武裝！請至戰場拾取武器台。', 'warning');
      return;
    }
    if (this.currentWeaponType === type) return;

    this.currentWeaponType = type;
    const config = WEAPON_CONFIGS[type];
    this.maxAmmo = config.magSize;
    this.ammo = Math.min(this.ammo, config.magSize);
    if (this.ammo === 0 && this.reserveAmmo > 0) {
      const take = Math.min(this.maxAmmo, this.reserveAmmo);
      this.ammo = take;
      this.reserveAmmo -= take;
    }

    this.updateWeaponVisuals(type);
    soundManager.playReload();
    this.callbacks.onWeaponChange?.(config);
    this.callbacks.onLogMessage('EQUIP', `切換主戰裝備：${config.name} (${config.category})`, 'tactical');
  }

  private setupInputListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Hotkey: P to toggle Pause
      if (e.code === 'KeyP') {
        e.preventDefault();
        this.setPaused(!this.isPaused);
        return;
      }

      if (this.isPaused) return;

      // Hotkey: TAB switches between FPS and Tactical Overhead
      if (e.code === 'Tab') {
        e.preventDefault();
        this.toggleViewMode();
      }

      // Hotkey: 1-4 weapon switching
      if (e.code === 'Digit1') {
        this.switchWeapon('volt_ar');
      } else if (e.code === 'Digit2') {
        this.switchWeapon('plasma_cannon');
      } else if (e.code === 'Digit3') {
        this.switchWeapon('cyber_smg');
      } else if (e.code === 'Digit4') {
        this.switchWeapon('nano_shotgun');
      }

      // Hotkey: R to reload
      if (e.code === 'KeyR' && !this.isReloading && this.ammo < this.maxAmmo) {
        this.reloadWeapon();
      }

      // Hotkey: C to toggle crouch
      if (e.code === 'KeyC') {
        this.isCrouched = !this.isCrouched;
      }

      // Hotkey: E for Interaction (Contraband pickup / Place on shelf / Teammate rescue / Weapon & Ammo)
      if (e.code === 'KeyE') {
        this.handleInteractPress();
      }
    });

    window.addEventListener('keydown', (e) => {
      // Spacebar hold acts as Soft-Pressure Suppression
      if (e.code === 'Space') {
        e.preventDefault();
        this.isSoftPressing = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'KeyE') {
        this.isExtractingTeammate = false;
      }
      if (e.code === 'Space') {
        this.isSoftPressing = false;
      }
    });

    // Mouse Controls - Soft Pressure on Hold
    this.container.addEventListener('mousedown', (e) => {
      if (this.isPaused) return;
      if (e.button === 0) {
        this.isSoftPressing = true;
        if (this.viewMode === 'fps') {
          this.shootWeapon();
        }
      } else if (e.button === 2) {
        e.preventDefault();
        this.isAimingDownSights = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.isSoftPressing = false;
      } else if (e.button === 2) {
        this.isAimingDownSights = false;
      }
    });

    this.container.addEventListener('contextmenu', (e) => e.preventDefault());

    // Mouse movement: In tactical view, raycast to ground to orient player and suppression cone
    window.addEventListener('mousemove', (e) => {
      if (this.isPaused) return;

      if (this.viewMode === 'tactical') {
        const rect = this.container.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.tacticalCamera);
        const intersect = new THREE.Vector3();
        if (this.raycaster.ray.intersectPlane(this.groundRayPlane, intersect)) {
          this.mouseAimPoint.copy(intersect);
        }
      } else if (this.viewMode === 'fps' && this.isPointerLocked) {
        const sensitivity = 0.0022;
        this.playerRotation.yaw -= e.movementX * sensitivity;
        this.playerRotation.pitch -= e.movementY * sensitivity;
        this.playerRotation.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.playerRotation.pitch));
      }
    });

    // Touch controls for mobile / touchpads
    this.container.addEventListener(
      'touchstart',
      (e) => {
        if (this.isPaused) return;
        this.isSoftPressing = true;
        const touch = e.touches[0];
        if (touch && this.viewMode === 'tactical') {
          const rect = this.container.getBoundingClientRect();
          const mouseX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
          const mouseY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
          this.raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.tacticalCamera);
          const intersect = new THREE.Vector3();
          if (this.raycaster.ray.intersectPlane(this.groundRayPlane, intersect)) {
            this.mouseAimPoint.copy(intersect);
          }
        }
      },
      { passive: true }
    );

    this.container.addEventListener(
      'touchmove',
      (e) => {
        if (this.isPaused) return;
        const touch = e.touches[0];
        if (touch && this.viewMode === 'tactical') {
          const rect = this.container.getBoundingClientRect();
          const mouseX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
          const mouseY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
          this.raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.tacticalCamera);
          const intersect = new THREE.Vector3();
          if (this.raycaster.ray.intersectPlane(this.groundRayPlane, intersect)) {
            this.mouseAimPoint.copy(intersect);
          }
        }
      },
      { passive: true }
    );

    this.container.addEventListener('touchend', () => {
      this.isSoftPressing = false;
    });

    // Request pointer lock only when clicking on canvas in FPS mode
    this.container.addEventListener('click', () => {
      if (!this.isPaused && this.viewMode === 'fps' && !this.isPointerLocked) {
        this.container.requestPointerLock?.();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.container;
    });

    window.addEventListener('resize', () => this.handleResize());
  }

  public toggleViewMode(mode?: 'fps' | 'tactical') {
    this.viewMode = mode || (this.viewMode === 'fps' ? 'tactical' : 'fps');
    if (this.viewMode === 'tactical') {
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      if (this.playerModelGroup) this.playerModelGroup.visible = true;
      if (this.playerWeaponGroup) this.playerWeaponGroup.visible = false;
    } else {
      if (this.playerModelGroup) this.playerModelGroup.visible = false;
      if (this.playerWeaponGroup) this.playerWeaponGroup.visible = true;
    }
  }

  public setZoomLevel(zoom: 'wide' | 'normal' | 'close') {
    this.antiDizzinessZoom = zoom;
  }

  public calculateCurrentRank(): 'SSS' | 'S' | 'A' | 'B' | 'C' {
    if (this.accumulatedScore >= 20000 && this.totalKillsCount >= 25) return 'SSS';
    if (this.accumulatedScore >= 12000 && this.totalKillsCount >= 15) return 'S';
    if (this.accumulatedScore >= 6000 && this.totalKillsCount >= 8) return 'A';
    if (this.accumulatedScore >= 2500) return 'B';
    return 'C';
  }

  public reloadWeapon() {
    if (this.isReloading || this.reserveAmmo <= 0) return;
    this.isReloading = true;
    soundManager.playReload();

    setTimeout(() => {
      const needed = this.maxAmmo - this.ammo;
      const amount = Math.min(needed, this.reserveAmmo);
      this.ammo += amount;
      this.reserveAmmo -= amount;
      this.isReloading = false;
    }, 1200);
  }

  /**
   * Shoot Active Weapon (Volt-AR / Plasma Cannon / Cyber SMG / Nano Shotgun)
   */
  public shootWeapon() {
    if (this.isPaused) return;

    if (this.ammo <= 0) {
      this.reloadWeapon();
      return;
    }
    if (this.isReloading) return;

    const now = performance.now();
    const config = WEAPON_CONFIGS[this.currentWeaponType];
    if (now - this.lastShotTime < config.fireRate * 1000) return;
    this.lastShotTime = now;

    this.ammo--;

    // Weapon Sound Synthesis
    if (this.currentWeaponType === 'volt_ar') {
      soundManager.playVoltARShoot();
    } else if (this.currentWeaponType === 'plasma_cannon') {
      soundManager.playPlasmaBlast();
    } else if (this.currentWeaponType === 'cyber_smg') {
      soundManager.playSMGShoot();
    } else if (this.currentWeaponType === 'nano_shotgun') {
      soundManager.playShotgunShoot();
    }

    // Weapon Recoil
    this.weaponRecoil.z = config.recoil.z;
    this.weaponRecoil.y = config.recoil.y;

    // Muzzle Flash
    this.muzzleFlashLight.intensity = this.currentWeaponType === 'plasma_cannon' ? 5.5 : 3.5;
    (this.muzzleFlashMesh.material as THREE.MeshBasicMaterial).opacity = 0.9;
    setTimeout(() => {
      this.muzzleFlashLight.intensity = 0;
      (this.muzzleFlashMesh.material as THREE.MeshBasicMaterial).opacity = 0;
    }, 45);

    // Base Direction
    const baseDir = new THREE.Vector3(0, 0, -1);
    baseDir.applyEuler(new THREE.Euler(this.playerRotation.pitch, this.playerRotation.yaw, 0, 'YXZ'));

    // Fire pellets (1 for AR, SMG, Plasma; 8 for Shotgun)
    const pelletCount = config.pelletCount;
    for (let p = 0; p < pelletCount; p++) {
      let shootDir = baseDir.clone();
      if (config.spread > 0) {
        const spreadX = (Math.random() - 0.5) * config.spread * 2;
        const spreadY = (Math.random() - 0.5) * config.spread * 2;
        shootDir.add(new THREE.Vector3(spreadX, spreadY, 0)).normalize();
      }

      // Spawn laser tracer VFX
      this.spawnLaserTracer(this.playerPos, shootDir, config.color);

      // Check hit against enemies
      for (const enemy of this.enemies) {
        if (!enemy.isAlive) continue;

        const toEnemy = new THREE.Vector3(enemy.x, 1.4, enemy.z).sub(this.playerPos);
        const angle = shootDir.angleTo(toEnemy);

        if (angle < (this.currentWeaponType === 'plasma_cannon' ? 0.12 : 0.08) && toEnemy.length() < 50) {
          // Hit detected! Check headshot
          const isHeadshot = Math.random() > 0.65;
          let damage = isHeadshot ? config.damage * 2 : config.damage;

          // Special Weapon Effect: Plasma Cannon instantly shatters Heavy Shields
          if (this.currentWeaponType === 'plasma_cannon' && enemy.type === 'heavy' && enemy.shieldHp && enemy.shieldHp > 0) {
            enemy.shieldHp = 0;
            soundManager.playPlasmaBlast();
            this.spawnHitSparks(new THREE.Vector3(enemy.x, 1.4, enemy.z), 0xff2a85);
            this.callbacks.onLogMessage('TACTICAL', '【等離子裂解】重裝兵盾牌遭高能砲擊粉碎！', 'success');
          } else if (enemy.type === 'heavy' && enemy.shieldHp && enemy.shieldHp > 0) {
            enemy.shieldHp -= damage;
            soundManager.playShelfBlock();
            this.spawnHitSparks(new THREE.Vector3(enemy.x, 1.4, enemy.z), 0xffaa00);
            if (enemy.shieldHp <= 0) {
              this.callbacks.onLogMessage('TACTICAL', '重裝兵盾牌已擊碎！', 'success');
            }
            break;
          }

          enemy.hp -= damage;
          soundManager.playHitMarker(isHeadshot);
          this.spawnHitSparks(new THREE.Vector3(enemy.x, isHeadshot ? 2.0 : 1.4, enemy.z), config.color);

          if (enemy.hp <= 0) {
            enemy.isAlive = false;
            enemy.mesh.visible = false;
            if (enemy.laserLine) enemy.laserLine.visible = false;

            // Chance to drop extra ammo canister on death (45% probability)
            if (Math.random() < 0.5) {
              this.spawnAmmoDrop(enemy.x, enemy.z);
            }

            const killScore = enemy.type === 'heavy' ? 300 : enemy.type === 'sniper' ? 200 : 100;
            this.callbacks.onScoreUpdate({ kills: killScore, headshot: isHeadshot });
            this.callbacks.onLogMessage('COMBAT', `擊殺恐怖分子 (${enemy.type.toUpperCase()}) ${isHeadshot ? '【精準爆頭!】' : ''}`, 'success');
          }
          break;
        }
      }
    }
  }

  private spawnLaserTracer(start: THREE.Vector3, dir: THREE.Vector3, color: number = 0x00f0ff) {
    const geo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6);
    geo.rotateX(Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color });
    const tracer = new THREE.Mesh(geo, mat);
    tracer.position.copy(start).add(dir.clone().multiplyScalar(0.8));
    tracer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), dir);

    this.scene.add(tracer);
    this.tracerBullets.push({
      mesh: tracer,
      vel: dir.clone().multiplyScalar(85),
      life: 0.6,
    });
  }

  private spawnHitSparks(pos: THREE.Vector3, color: number) {
    const count = 16;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = pos.x + (Math.random() - 0.5) * 0.4;
      positions[i + 1] = pos.y + (Math.random() - 0.5) * 0.4;
      positions[i + 2] = pos.z + (Math.random() - 0.5) * 0.4;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color, size: 0.08, transparent: true, opacity: 1 });
    const pMesh = new THREE.Points(geo, mat);
    this.scene.add(pMesh);
    this.particleSparks.push({ mesh: pMesh, life: 0.3 });
  }

  /**
   * Handle Interact Key [E]
   */
  private handleInteractPress() {
    if (!this.currentInteractable) return;

    if (this.currentInteractable.type === 'contraband') {
      // Pick up contraband
      const cb = this.contrabands.find((c) => c.id === this.currentInteractable!.id);
      if (cb && !this.carriedContraband) {
        cb.status = 'carried_by_player';
        this.carriedContraband = cb;
        const mesh = this.contrabandMeshes.get(cb.id);
        if (mesh) mesh.visible = false;
        soundManager.playContrabandAction();
        this.callbacks.onLogMessage('TEAM', `已拾取 ${cb.name}，移動速度受重量與輻射影響！`, 'warning');
      }
    } else if (this.currentInteractable.type === 'shelf') {
      // Deposit carried contraband onto Moving Shelf
      if (this.carriedContraband) {
        const slotIdx = this.shelfContrabandSlots.findIndex((s) => s === null);
        if (slotIdx !== -1) {
          this.carriedContraband.status = 'on_shelf';
          soundManager.playContrabandAction();

          // Visual attach to shelf
          const mesh = this.contrabandMeshes.get(this.carriedContraband.id);
          if (mesh) {
            mesh.visible = true;
            mesh.position.set(slotIdx * 0.7 - 0.7, 1.2, 0);
            this.shelfMesh.add(mesh);
            this.shelfContrabandSlots[slotIdx] = mesh;
          }

          this.callbacks.onLogMessage('TEAM', `成功將 ${this.carriedContraband.name} 裝載至動態防彈貨架！`, 'success');
          this.carriedContraband = null;
        } else {
          this.callbacks.onLogMessage('SYSTEM', '貨架空間已滿！', 'warning');
        }
      }
    } else if (this.currentInteractable.type === 'teammate_bag') {
      // Begin Unzip & Extract protocol!
      this.isExtractingTeammate = true;
      this.activeRescueTeammateId = this.currentInteractable.id;
      soundManager.playUnzipSound();
    } else if (this.currentInteractable.type === 'pickup') {
      // Pick up weapon or extra ammo
      const pk = this.pickups.find((p) => p.id === this.currentInteractable!.id);
      if (pk && !pk.isPickedUp) {
        pk.isPickedUp = true;
        if (pk.mesh) pk.mesh.visible = false;
        soundManager.playPickupSound();

        if (pk.type === 'ammo') {
          const added = pk.amount || 60;
          this.reserveAmmo = Math.min(this.reserveAmmo + added, 280);
          this.callbacks.onLogMessage('SUPPLY', `已拾取彈藥箱！補充 +${added} 備彈，當前備彈：${this.reserveAmmo}`, 'success');
        } else if (pk.type === 'weapon' && pk.weaponType) {
          if (!this.unlockedWeapons.includes(pk.weaponType)) {
            this.unlockedWeapons.push(pk.weaponType);
          }
          const config = WEAPON_CONFIGS[pk.weaponType];
          this.switchWeapon(pk.weaponType);
          this.ammo = config.magSize;
          this.reserveAmmo = Math.min(this.reserveAmmo + config.magSize * 2, config.maxReserve);
          this.callbacks.onLogMessage('EQUIP', `成功獲取並裝備：${pk.name}！可在右下角按數字鍵 [1-4] 自由切換。`, 'success');
        }
      }
    }
  }

  /**
   * Main Simulation & Animation Loop
   */
  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // If game is paused, render frozen frame and skip delta updates
    if (this.isPaused) {
      const activeCam = this.viewMode === 'fps' ? this.camera : this.tacticalCamera;
      this.renderer.render(this.scene, activeCam);
      return;
    }

    const delta = Math.min(this.clock.getDelta(), 0.1);

    // 1. Environment animations
    if (this.carouselGroup && this.carouselGroup.parent) {
      this.carouselGroup.rotation.y += delta * 0.25;
    }
    if (this.ferrisWheelGroup && this.ferrisWheelGroup.parent) {
      this.ferrisWheelGroup.rotation.z += delta * 0.08;
    }
    if (this.craneTrolleyLight && this.derrickCraneGroup?.parent) {
      this.craneTrolleyLight.target.position.x = Math.sin(Date.now() * 0.0012) * 8;
      this.craneTrolleyLight.target.updateMatrixWorld();
    }
    if (this.reactorRingsGroup && this.reactorRingsGroup.parent) {
      this.reactorRingsGroup.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.TorusGeometry) {
          child.rotation.x += delta * (0.35 + i * 0.15);
          child.rotation.y += delta * (0.5 - i * 0.15);
        }
      });
    }
    if (this.reactorCoreLight) {
      this.reactorCoreLight.intensity = 2.2 + Math.sin(Date.now() * 0.005) * 0.8;
    }

    // 2. Rotate weapon and ammo pickup pedestals
    this.pickups.forEach((pk) => {
      if (!pk.isPickedUp && pk.mesh) {
        pk.mesh.rotation.y += delta * 1.4;
      }
    });

    // 3. Player movement & camera physics
    this.updatePlayerMovement(delta);

    // 4. Moving Shelf automated travel along user path
    this.updateMovingShelf(delta);

    // 5. Teammates AI & Rescue protocol progress
    this.updateTeammates(delta);

    // 6. Enemy AI, firing & dynamic laser sights
    this.updateEnemies(delta);

    // 7. VFX updates (lasers, sparks, weapon recoil)
    this.updateVFX(delta);

    // 8. Soft-Pressure continuous suppression update
    this.updateSoftPressure(delta);

    // 9. Check interactions
    this.updateInteractions();

    // 10. Render Scene
    const activeCam = this.viewMode === 'fps' ? this.camera : this.tacticalCamera;
    this.renderer.render(this.scene, activeCam);
  };

  private updatePlayerMovement(delta: number) {
    // Calculate move vector from keyboard inputs
    const move = new THREE.Vector3();
    if (this.keys['KeyW'] || this.keys['ArrowUp']) move.z -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) move.z += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) move.x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) move.x += 1;

    let baseSpeed = this.isCrouched ? 3.0 : 5.8;
    // Apply contraband weight penalty
    if (this.carriedContraband) {
      baseSpeed *= this.carriedContraband.weightPenalty;
    }

    if (this.viewMode === 'tactical') {
      // 2.5D Isometric Movement: World axes alignment for intuitive, zero-nausea control
      if (move.lengthSq() > 0) {
        move.normalize();
        this.playerPos.add(move.multiplyScalar(baseSpeed * delta));
        // Boundary containment
        this.playerPos.x = THREE.MathUtils.clamp(this.playerPos.x, -24, 24);
        this.playerPos.z = THREE.MathUtils.clamp(this.playerPos.z, -32, 22);
      }

      // Update 3D player operative model
      if (this.playerModelGroup) {
        this.playerModelGroup.visible = true;
        this.playerModelGroup.position.set(this.playerPos.x, 0, this.playerPos.z);
      }
      if (this.playerWeaponGroup) {
        this.playerWeaponGroup.visible = false;
      }

      // Anti-Dizziness Camera Following with completely stable horizon
      const zoomConfig = {
        wide: { height: 25, dist: 19 },
        normal: { height: 16, dist: 12 },
        close: { height: 11, dist: 8.5 },
      }[this.antiDizzinessZoom] || { height: 16, dist: 12 };

      const targetCamX = this.playerPos.x;
      const targetCamY = zoomConfig.height;
      const targetCamZ = this.playerPos.z + zoomConfig.dist;

      // Smooth lerp tracking (Zero rotational jerk or camera roll)
      this.tacticalCamera.position.x = THREE.MathUtils.lerp(this.tacticalCamera.position.x, targetCamX, delta * 6);
      this.tacticalCamera.position.y = THREE.MathUtils.lerp(this.tacticalCamera.position.y, targetCamY, delta * 6);
      this.tacticalCamera.position.z = THREE.MathUtils.lerp(this.tacticalCamera.position.z, targetCamZ, delta * 6);
      this.tacticalCamera.lookAt(this.playerPos.x, 0.8, this.playerPos.z);
    } else {
      // FPS View (if toggled by player)
      if (this.playerModelGroup) this.playerModelGroup.visible = false;
      if (this.playerWeaponGroup) this.playerWeaponGroup.visible = true;

      if (move.lengthSq() > 0) {
        move.normalize();
        move.applyEuler(new THREE.Euler(0, this.playerRotation.yaw, 0));
        this.playerPos.add(move.multiplyScalar(baseSpeed * delta));
      }

      // Camera height (crouch vs standing)
      const targetHeight = this.isCrouched ? 0.95 : 1.7;
      this.playerPos.y = THREE.MathUtils.damp(this.playerPos.y, targetHeight, 8, delta);

      // Update Camera Transform
      this.camera.position.copy(this.playerPos);
      this.camera.rotation.set(0, 0, 0);
      this.camera.rotation.y = this.playerRotation.yaw;
      this.camera.rotation.x = this.playerRotation.pitch;

      // Weapon ADS and Recoil Damping
      const targetWeaponX = this.isAimingDownSights ? 0.0 : 0.32;
      const targetWeaponY = this.isAimingDownSights ? -0.16 : -0.26;
      const targetWeaponZ = this.isAimingDownSights ? -0.42 : -0.58;

      this.playerWeaponGroup.position.x = THREE.MathUtils.damp(this.playerWeaponGroup.position.x, targetWeaponX, 10, delta);
      this.playerWeaponGroup.position.y = THREE.MathUtils.damp(this.playerWeaponGroup.position.y, targetWeaponY + this.weaponRecoil.y, 10, delta);
      this.playerWeaponGroup.position.z = THREE.MathUtils.damp(this.playerWeaponGroup.position.z, targetWeaponZ + this.weaponRecoil.z, 10, delta);

      this.weaponRecoil.y = THREE.MathUtils.damp(this.weaponRecoil.y, 0, 12, delta);
      this.weaponRecoil.z = THREE.MathUtils.damp(this.weaponRecoil.z, 0, 12, delta);
    }

    // Passive Cyber Shell Shield energy regeneration
    if (this.cyberEnergy < 100) {
      this.cyberEnergy = Math.min(100, this.cyberEnergy + delta * 6.5);
    }
  }

  private updateMovingShelf(delta: number) {
    if (!this.shelfState.isMoving || this.shelfState.path.length < 2) {
      soundManager.updateShelfHum(false);
      return;
    }

    soundManager.updateShelfHum(true);

    const targetNode = this.shelfState.path[this.shelfState.currentNodeIndex];
    if (!targetNode) return;

    const currentPos = new THREE.Vector2(this.shelfState.x, this.shelfState.z);
    const targetPos = new THREE.Vector2(targetNode.x, targetNode.z);
    const dist = currentPos.distanceTo(targetPos);

    if (dist < 0.2) {
      // Arrived at current node
      if (this.shelfState.currentNodeIndex < this.shelfState.path.length - 1) {
        this.shelfState.currentNodeIndex++;
      } else {
        // Reached end / Extraction Point!
        this.shelfState.isMoving = false;
        soundManager.updateShelfHum(false);
        this.callbacks.onObjectiveComplete();
      }
    } else {
      const dir = targetPos.clone().sub(currentPos).normalize();
      this.shelfState.x += dir.x * this.shelfState.speed * delta;
      this.shelfState.z += dir.y * this.shelfState.speed * delta;
      this.shelfState.rotation = Math.atan2(dir.x, dir.y);

      this.shelfMesh.position.set(this.shelfState.x, 0, this.shelfState.z);
      this.shelfMesh.rotation.y = this.shelfState.rotation;
    }
  }

  private updateTeammates(delta: number) {
    this.teammates.forEach((tm) => {
      if (tm.status === 'active') {
        // Stay near moving shelf or player in combat formation
        const targetX = this.shelfState.x + (tm.id === 'tm1' ? -2.2 : tm.id === 'tm2' ? 2.2 : 0);
        const targetZ = this.shelfState.z + (tm.id === 'tm3' ? 1.8 : -0.2);

        tm.x = THREE.MathUtils.damp(tm.x, targetX, 2, delta);
        tm.z = THREE.MathUtils.damp(tm.z, targetZ, 2, delta);
        tm.mesh.position.set(tm.x, 0, tm.z);

        // Find nearest living enemy to shoot at
        let nearestEnemy: (Enemy & { mesh: THREE.Group; laserLine?: THREE.Line }) | null = null;
        let minDist = 30;
        for (const e of this.enemies) {
          if (!e.isAlive) continue;
          const dist = Math.hypot(e.x - tm.x, e.z - tm.z);
          if (dist < minDist) {
            minDist = dist;
            nearestEnemy = e;
          }
        }

        if (nearestEnemy) {
          // Rotate towards enemy
          const dx = nearestEnemy.x - tm.x;
          const dz = nearestEnemy.z - tm.z;
          const angle = Math.atan2(dx, dz);
          tm.mesh.rotation.y = angle;

          // Teammate shooting logic
          tm.shootCooldown = (tm.shootCooldown ?? 1.5) - delta;
          if (tm.shootCooldown <= 0) {
            tm.shootCooldown = 1.2 + Math.random() * 1.4;

            // Spawn cyan laser tracer towards enemy
            const muzzlePos = new THREE.Vector3(tm.x, 1.25, tm.z);
            const shootDir = new THREE.Vector3(dx, 0.2, dz).normalize();
            this.spawnLaserTracer(muzzlePos, shootDir, 0x00f0ff);
            soundManager.playVoltARShoot();

            // Deal damage to enemy
            const damage = 35;
            if (nearestEnemy.type === 'heavy' && nearestEnemy.shieldHp && nearestEnemy.shieldHp > 0) {
              nearestEnemy.shieldHp -= damage;
              soundManager.playShelfBlock();
              this.spawnHitSparks(new THREE.Vector3(nearestEnemy.x, 1.35, nearestEnemy.z), 0xffaa00);
            } else {
              nearestEnemy.hp -= damage;
              this.spawnHitSparks(new THREE.Vector3(nearestEnemy.x, 1.35, nearestEnemy.z), 0x00f0ff);
              if (nearestEnemy.hp <= 0) {
                nearestEnemy.isAlive = false;
                nearestEnemy.mesh.visible = false;
                if (nearestEnemy.laserLine) nearestEnemy.laserLine.visible = false;
                const killScore = nearestEnemy.type === 'heavy' ? 300 : 100;
                this.callbacks.onScoreUpdate({ kills: killScore });
                this.callbacks.onLogMessage('TEAM', `[${tm.callsign}] 成功擊殺敵方 ${nearestEnemy.type.toUpperCase()}！`, 'success');
              }
            }
          }
        }
      } else if (tm.status === 'downed_in_bag') {
        tm.rebootTimer += delta;
        // If player is currently pulling teammate out
        if (this.isExtractingTeammate && this.activeRescueTeammateId === tm.id) {
          tm.extractProgress += delta * 45; // ~2.2s to pull out
          this.callbacks.onRescueProgressUpdate(Math.min(100, Math.floor(tm.extractProgress)), 'extracting');

          if (tm.extractProgress >= 100) {
            // Phase 2: Rebooting (2s electroshock)
            tm.status = 'rebooting';
            tm.rebootTimer = 2.0;
            soundManager.playRebootShock();
            this.spawnHitSparks(new THREE.Vector3(tm.x, 0.8, tm.z), 0x00f0ff);
            this.callbacks.onRescueProgressUpdate(100, 'rebooting');
          }
        } else if (tm.rebootTimer > 14.0) {
          // Autonomous emergency defibrillation if unattended for 14s to keep the 3-minute fight non-stop
          tm.status = 'rebooting';
          tm.rebootTimer = 2.0;
          soundManager.playRebootShock();
          this.spawnHitSparks(new THREE.Vector3(tm.x, 0.8, tm.z), 0x00f0ff);
          this.callbacks.onLogMessage('TEAM', `隊友 ${tm.callsign} 機體內部應急電容自體重啟完畢，重返火線！`, 'tactical');
        }
      } else if (tm.status === 'rebooting') {
        tm.rebootTimer -= delta;
        if (tm.rebootTimer <= 0) {
          // Rejoined battle!
          tm.status = 'active';
          tm.hp = 65;
          tm.extractProgress = 0;
          tm.shootCooldown = 1.0;
          tm.mesh.visible = true;
          tm.bagMesh.visible = false;
          this.isExtractingTeammate = false;
          this.activeRescueTeammateId = null;
          this.callbacks.onRescueProgressUpdate(0, 'idle');
          this.callbacks.onTeammateRescued(tm.id);
          this.callbacks.onLogMessage('TEAM', `隊友 ${tm.callsign} 機體電擊重啟成功，重新加入交火！`, 'success');
        }
      }
    });
  }

  private updateEnemies(delta: number) {
    // 3-Minute Firefight: Continuous Wave Reinforcement
    this.reinforcementTimer -= delta;
    const livingCount = this.enemies.filter((e) => e.isAlive).length;
    if (livingCount < 4 || this.reinforcementTimer <= 0) {
      this.reinforcementTimer = 15 + Math.random() * 5;

      const types: ('thug' | 'heavy' | 'sniper')[] = ['thug', Math.random() > 0.4 ? 'heavy' : 'sniper'];
      types.forEach((t, i) => {
        const sx = (i === 0 ? -5 : 5) + (Math.random() - 0.5) * 3;
        const sz = -4 - Math.random() * 8;
        const hp = t === 'heavy' ? 320 : t === 'sniper' ? 140 : 120;
        this.spawnEnemy(t, sx, sz, hp);
      });

      soundManager.playSniperCharge();
      this.callbacks.onLogMessage('SECURITY', '【增援警告】恐怖分子增援小隊抵達戰場！持續交火壓制中！', 'warning');
    }

    this.enemies.forEach((enemy) => {
      if (!enemy.isAlive) return;

      // Select target: choose between player and active teammates
      const targets: { pos: THREE.Vector3; isPlayer: boolean; teammate?: (Teammate & { mesh: THREE.Group; bagMesh: THREE.Group }) }[] = [
        { pos: this.playerPos, isPlayer: true },
      ];
      this.teammates.forEach((tm) => {
        if (tm.status === 'active') {
          targets.push({ pos: new THREE.Vector3(tm.x, 1.4, tm.z), isPlayer: false, teammate: tm });
        }
      });

      // Find closest target
      let chosenTarget = targets[0];
      let closestDist = Math.hypot(this.playerPos.x - enemy.x, this.playerPos.z - enemy.z);
      for (const t of targets) {
        const d = Math.hypot(t.pos.x - enemy.x, t.pos.z - enemy.z);
        if (d < closestDist) {
          closestDist = d;
          chosenTarget = t;
        }
      }

      // Rotate enemy to face chosen target
      const dx = chosenTarget.pos.x - enemy.x;
      const dz = chosenTarget.pos.z - enemy.z;
      enemy.rotation = Math.atan2(dx, dz);
      enemy.mesh.rotation.y = enemy.rotation;

      // Sniper laser aiming tracking
      if (enemy.type === 'sniper' && enemy.laserLine) {
        const positions = (enemy.laserLine.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
        positions[3] = dx;
        positions[4] = chosenTarget.pos.y - 1.8;
        positions[5] = dz;
        enemy.laserLine.geometry.attributes.position.needsUpdate = true;
      }

      // Attack cooldown & shooting
      enemy.attackCooldown -= delta;
      if (enemy.attackCooldown <= 0) {
        enemy.attackCooldown = enemy.type === 'sniper' ? 3.0 : enemy.type === 'heavy' ? 2.2 : 1.6;

        // Spawn enemy red/orange laser tracer towards target
        const startPos = new THREE.Vector3(enemy.x, 1.35, enemy.z);
        const shootDir = new THREE.Vector3(dx, chosenTarget.pos.y - 1.35, dz).normalize();
        this.spawnLaserTracer(startPos, shootDir, enemy.type === 'sniper' ? 0xff0044 : 0xff7700);

        if (enemy.type === 'sniper') {
          soundManager.playSniperShot();
        } else {
          soundManager.playVoltARShoot();
        }

        // Check if moving shelf blocks bullet path to target
        const targetVec = new THREE.Vector2(chosenTarget.pos.x, chosenTarget.pos.z);
        const enemyVec = new THREE.Vector2(enemy.x, enemy.z);
        const shelfVec = new THREE.Vector2(this.shelfState.x, this.shelfState.z);

        // Distance from shelf to line segment connecting enemy and target
        const lineDir = targetVec.clone().sub(enemyVec);
        const lineLen = lineDir.length();
        lineDir.normalize();
        const toShelf = shelfVec.clone().sub(enemyVec);
        const proj = toShelf.dot(lineDir);

        const isShelfBetween = proj > 0 && proj < lineLen && toShelf.clone().sub(lineDir.clone().multiplyScalar(proj)).length() < 2.0;

        if (isShelfBetween) {
          // Shelf blocked damage!
          this.shelfState.damageBlocked += 80;
          soundManager.playShelfBlock();
          this.spawnHitSparks(this.shelfMesh.position.clone().add(new THREE.Vector3(0, 1.4, 0)), 0xffaa00);
          this.callbacks.onScoreUpdate({ damageBlocked: 80 });
        } else {
          // Hits target!
          const damage = enemy.type === 'sniper' ? 36 : enemy.type === 'heavy' ? 18 : 12;

          if (chosenTarget.isPlayer) {
            let effectiveDmg = damage;
            if (this.cyberEnergy > 0) {
              const absorbed = Math.min(this.cyberEnergy, damage * 1.5);
              this.cyberEnergy = Math.max(0, this.cyberEnergy - absorbed);
              effectiveDmg = Math.max(4, damage - absorbed * 0.6);
            }
            this.playerHp -= effectiveDmg;
            this.spawnHitSparks(this.playerPos.clone(), 0xff0044);

            if (this.playerHp <= 0) {
              this.playerHp = 60;
              this.cyberEnergy = 60;
              soundManager.playRebootShock();
              this.callbacks.onLogMessage('SYSTEM', '【特務防護啟動】生化應急電容自體復甦，重新加入火線！(-500 分)', 'alert');
            } else {
              this.callbacks.onPlayerDamage(effectiveDmg);
            }
          } else if (chosenTarget.teammate) {
            const tm = chosenTarget.teammate;
            tm.hp -= damage;
            this.spawnHitSparks(new THREE.Vector3(tm.x, 1.3, tm.z), 0x00f0ff);
            if (tm.hp <= 0) {
              // Teammate enters Cyber Containment Bag!
              tm.status = 'downed_in_bag';
              tm.extractProgress = 0;
              tm.rebootTimer = 0;
              tm.mesh.visible = false;
              tm.bagMesh.visible = true;
              tm.bagMesh.position.set(tm.x, 0, tm.z);
              soundManager.playTeammateDown();
              this.callbacks.onTeammateDowned(tm.id);
              this.callbacks.onLogMessage('SECURITY', `隊友 ${tm.callsign} 機體受損過載！已觸發緊急防爆袋折疊協議！`, 'alert');
            }
          }
        }
      }
    });
  }

  private updateVFX(delta: number) {
    // Bullets
    for (let i = this.tracerBullets.length - 1; i >= 0; i--) {
      const b = this.tracerBullets[i];
      b.life -= delta;
      b.mesh.position.add(b.vel.clone().multiplyScalar(delta));
      if (b.life <= 0) {
        this.scene.remove(b.mesh);
        this.tracerBullets.splice(i, 1);
      }
    }

    // Sparks
    for (let i = this.particleSparks.length - 1; i >= 0; i--) {
      const sp = this.particleSparks[i];
      sp.life -= delta;
      if (sp.life <= 0) {
        this.scene.remove(sp.mesh);
        this.particleSparks.splice(i, 1);
      }
    }
  }

  private updateInteractions() {
    let nearestPrompt: string | null = null;
    let interactType: 'contraband' | 'shelf' | 'teammate_bag' | 'pickup' | undefined;
    let targetId: string | undefined;

    // 1. Check downed teammate containment bags
    for (const tm of this.teammates) {
      if (tm.status === 'downed_in_bag') {
        const dist = this.playerPos.distanceTo(new THREE.Vector3(tm.x, 0.5, tm.z));
        if (dist < 2.5) {
          nearestPrompt = `[長按 E] 解開防爆袋並拉出隊友 (${tm.callsign})`;
          interactType = 'teammate_bag';
          targetId = tm.id;
          break;
        }
      }
    }

    // 2. Check nearby contrabands on ground
    if (!nearestPrompt) {
      for (const cb of this.contrabands) {
        if (cb.status === 'ground') {
          const dist = this.playerPos.distanceTo(new THREE.Vector3(cb.x, 0.5, cb.z));
          if (dist < 2.2) {
            nearestPrompt = `[E] 拾取 ${cb.name}`;
            interactType = 'contraband';
            targetId = cb.id;
            break;
          }
        }
      }
    }

    // 3. Check moving shelf (if holding contraband)
    if (!nearestPrompt && this.carriedContraband) {
      const distToShelf = this.playerPos.distanceTo(new THREE.Vector3(this.shelfState.x, 1, this.shelfState.z));
      if (distToShelf < 3.2) {
        nearestPrompt = `[E] 將 ${this.carriedContraband.name} 裝載至動態防彈貨架`;
        interactType = 'shelf';
        targetId = 'shelf';
      }
    }

    // 4. Check nearby Weapon & Ammo pickups
    if (!nearestPrompt) {
      for (const pk of this.pickups) {
        if (!pk.isPickedUp) {
          const dist = this.playerPos.distanceTo(new THREE.Vector3(pk.x, 0.5, pk.z));
          if (dist < 2.5) {
            if (pk.type === 'ammo') {
              nearestPrompt = `[E] 拾取 ${pk.name}`;
            } else {
              const isEquipped = this.currentWeaponType === pk.weaponType;
              const isUnlocked = this.unlockedWeapons.includes(pk.weaponType!);
              if (isEquipped) {
                nearestPrompt = `[E] 補充 ${pk.name} 彈藥儲備`;
              } else if (isUnlocked) {
                nearestPrompt = `[E] 換回 ${pk.name}`;
              } else {
                nearestPrompt = `[E] 拾取並解鎖 ${pk.name}`;
              }
            }
            interactType = 'pickup';
            targetId = pk.id;
            break;
          }
        }
      }
    }

    if (nearestPrompt) {
      this.currentInteractable = { type: interactType!, id: targetId! };
      this.callbacks.onInteractionAvailable(nearestPrompt, interactType, targetId);
    } else {
      this.currentInteractable = null;
      this.callbacks.onInteractionAvailable(null);
    }
  }

  public setShelfPath(newPath: PathNode[]) {
    this.shelfState.path = newPath;
    this.shelfState.currentNodeIndex = 0;
    this.updateRailVisuals();
  }

  public toggleShelfMovement(start?: boolean) {
    this.shelfState.isMoving = start !== undefined ? start : !this.shelfState.isMoving;
  }

  private handleResize() {
    if (!this.container || !this.renderer) return;
    const w = this.container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1280) || 1280;
    const h = this.container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 720) || 720;
    if (h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.tacticalCamera.aspect = w / h;
    this.tacticalCamera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  public dispose() {
    cancelAnimationFrame(this.animationFrameId);
    this.renderer?.dispose();
    if (this.container && this.renderer?.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
