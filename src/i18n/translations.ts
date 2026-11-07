/**
 * Neo-Nights: Contraband Protocol - Multilingual Localization (i18n)
 * Supports: Traditional Chinese (繁體中文), English, Indonesian (Bahasa Indonesia)
 */

export type Language = 'zh-TW' | 'en' | 'id';

export interface Translations {
  // Title & Branding
  gameTitle: string;
  gameSubtitle: string;
  gameBadge: string;
  gameDescription: string;

  // Main Menu Buttons
  startMission: string;
  resumeMission: string;
  selectLevel: string;
  leaderboard: string;
  dossier: string;
  backToMainMenu: string;
  options: string;
  languageSelect: string;

  // Feature Highlights
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;

  // Control Guide
  controlsTitle: string;
  ctrlMove: string;
  ctrlPressure: string;
  ctrlView: string;
  ctrlInteract: string;
  ctrlWeapons: string;
  ctrlPause: string;

  // HUD & Combat Metrics
  kills: string;
  killsUnit: string;
  score: string;
  rank: string;
  combo: string;
  timeRemaining: string;
  operativeStatus: string;
  hp: string;
  cyberEnergy: string;
  ammo: string;

  // Soft-Pressure States
  pressureSystemTitle: string;
  pressureValue: string;
  pressureIdle: string;
  pressureIdleDesc: string;
  pressurePhase1: string;
  pressurePhase1Desc: string;
  pressurePhase2: string;
  pressurePhase2Desc: string;
  pressurePhase3: string;
  pressurePhase3Desc: string;
  pressureHint: string;

  // View Comfort & Anti-Dizziness
  viewTactical: string;
  viewFps: string;
  zoomWide: string;
  zoomNormal: string;
  zoomClose: string;
  zoomTitle: string;

  // Leaderboard Modal
  leaderboardTitle: string;
  leaderboardSubtitle: string;
  leaderboardRule: string;
  currentPerformance: string;
  callsignPlaceholder: string;
  submitScore: string;
  submitted: string;
  colRank: string;
  colCallsign: string;
  colTier: string;
  colKills: string;
  colScore: string;
  colDate: string;
  resetLeaderboard: string;
  rankThresholds: string;

  // Level & Result Modals
  victoryTitle: string;
  failureTitle: string;
  nextMission: string;
  retry: string;
  review: string;
  missionList: string;
  tacticalPanel: string;
  shelfHp: string;
  shelfMoving: string;
  shelfStopped: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  'zh-TW': {
    gameTitle: '新夜城：違禁重組',
    gameSubtitle: 'NEO-NIGHTS: CONTRABAND PROTOCOL',
    gameBadge: '賽博龐克戰術協同射擊',
    gameDescription: '潛入被恐怖分子佔領的虛擬樂園，運用「軟壓系統」進行無負擔壓制，奪回高危違禁品並規劃動態移動貨架完成撤離！',

    startMission: '開始作戰',
    resumeMission: '繼續戰役',
    selectLevel: '選擇任務關卡',
    leaderboard: '特務排行榜',
    dossier: '特務檔案與藍圖',
    backToMainMenu: '返回主選單',
    options: '戰術設定',
    languageSelect: '語言切換 (Language)',

    feature1Title: '2.5D 防暈眩舒適視角',
    feature1Desc: '穩定 52° 仰角地平線，杜絕 3D 鏡頭翻滾與劇烈晃動，視野平滑跟隨，久玩不暈眩。',
    feature2Title: '無負擔軟壓壓制系統',
    feature2Desc: '長按輕壓自動減速 75% 並靜默敵軍，中壓自動共振穿透消融，重壓釋放全域 EMP 脈衝清場。',
    feature3Title: '擊殺與積分軍階晉級',
    feature3Desc: '實時跳字統計擊殺敵軍數與累積總分，達到門檻即時晉級 SSS 傳奇評級並登錄排行榜。',

    controlsTitle: '操作指揮指南',
    ctrlMove: 'WASD / 方向鍵：平滑走位移動',
    ctrlPressure: '長按滑鼠左鍵 / 空白鍵：啟動軟壓壓制 (自動瞄準)',
    ctrlView: 'Tab 鍵：切換 2.5D 戰術俯瞰 / FPS 第一人稱',
    ctrlInteract: 'E 鍵：搬運違禁品 / 放置貨架 / 賽博袋救援',
    ctrlWeapons: '數字鍵 1-4：即時切換已解鎖主戰武裝',
    ctrlPause: 'P 鍵 / Esc：暫停與任務面板',

    kills: '擊斃敵軍數',
    killsUnit: '敵',
    score: '獲得總分數',
    rank: '即時評級',
    combo: '連擊倍率',
    timeRemaining: '剩餘作戰時間',
    operativeStatus: '特務機體：ALPHA',
    hp: '生命值',
    cyberEnergy: '賽博能量',
    ammo: '彈藥',

    pressureSystemTitle: '軟壓壓制系統',
    pressureValue: '軟壓值',
    pressureIdle: '軟壓系統待命',
    pressureIdleDesc: '長按滑鼠左鍵 / 空白鍵 啟動壓制力場',
    pressurePhase1: '輕軟壓 · 電磁干擾力場',
    pressurePhase1Desc: '敵軍減速 75% · 射擊機能全面靜默',
    pressurePhase2: '中軟壓 · 共振電漿穿透束',
    pressurePhase2Desc: '持續光束自動穿透融解 · 連擊加成中',
    pressurePhase3: '重軟壓 · 全域 EMP 清場充能',
    pressurePhase3Desc: '鬆開或滿額即可引爆半徑 18m 清除敵陣',
    pressureHint: '💡 長按滑鼠左鍵 / 空白鍵 啟動軟壓壓制',

    viewTactical: '2.5D 防暈俯瞰',
    viewFps: 'FPS 視角',
    zoomWide: '遠',
    zoomNormal: '中',
    zoomClose: '近',
    zoomTitle: '視野縮放',

    leaderboardTitle: '新夜城特務排行榜',
    leaderboardSubtitle: '在地即時排名',
    leaderboardRule: '核心規則：擊殺數與累積積分越高，特務軍階評級越高（SSS / S / A / B / C）',
    currentPerformance: '當前戰役成績',
    callsignPlaceholder: '輸入特務呼號 (例如: ALPHA-01)',
    submitScore: '登錄成績',
    submitted: '已登錄！',
    colRank: '名次',
    colCallsign: '特務代號',
    colTier: '軍階評級',
    colKills: '擊斃敵軍',
    colScore: '最終積分',
    colDate: '戰役日期',
    resetLeaderboard: '重置榜單數據',
    rankThresholds: '評級門檻：SSS ≥ 20,000分 · S ≥ 12,000分 · A ≥ 6,000分',

    victoryTitle: 'EXTRACTION SUCCESSFUL (撤離成功)',
    failureTitle: 'MISSION COMPROMISED (任務失敗)',
    nextMission: '下一關卡 (NEXT MISSION)',
    retry: '再次執行 (RETRY)',
    review: '返回檢視 (REVIEW)',
    missionList: '任務關卡 (LEVELS)',
    tacticalPanel: '戰術重組面板 (TACTICAL PANEL)',
    shelfHp: '移動貨架裝甲值',
    shelfMoving: '貨架自主巡航推進中',
    shelfStopped: '貨架待命中',
  },

  en: {
    gameTitle: 'Neo-Nights: Contraband Protocol',
    gameSubtitle: 'TACTICAL CO-OP SHOOTER × SHELF ROUTING',
    gameBadge: 'CYBERPUNK TACTICAL CO-OP',
    gameDescription: 'Infiltrate the terror-occupied cyber carnival, use the Soft-Pressure System to suppress threats without fatigue, retrieve contrabands, and plan moving shelf routes to extract!',

    startMission: 'Start Mission',
    resumeMission: 'Resume Mission',
    selectLevel: 'Select Mission',
    leaderboard: 'Leaderboard',
    dossier: 'Operative Dossier',
    backToMainMenu: 'Main Menu',
    options: 'Tactical Settings',
    languageSelect: 'Language',

    feature1Title: 'Zero-Dizziness 2.5D View',
    feature1Desc: 'Stable 52° perspective with fixed horizon. Eliminates camera rolling and rapid screen shakes for zero motion sickness.',
    feature2Title: 'Soft-Pressure Suppression',
    feature2Desc: 'Gentle hold automatically slows enemies by 75% and jams guns; medium press beams continuous damage; full press unleashes EMP nova.',
    feature3Title: 'Kill & Score Rank System',
    feature3Desc: 'Real-time telemetry tracks enemy kills and accumulated score. Achieve high milestones to attain SSS Legend rank.',

    controlsTitle: 'Field Operational Guide',
    ctrlMove: 'WASD / Arrow Keys: Smooth Operative Movement',
    ctrlPressure: 'Hold Left Click / Space: Soft-Pressure Suppression (Auto Aim)',
    ctrlView: 'Tab Key: Toggle 2.5D Tactical Overhead / FPS View',
    ctrlInteract: 'E Key: Carry Contraband / Place on Shelf / Bag Rescue',
    ctrlWeapons: '1-4 Keys: Switch Unlocked Weapons Instantly',
    ctrlPause: 'P Key / Esc: Pause Simulation & Mission Panel',

    kills: 'Enemies Eliminated',
    killsUnit: 'Kills',
    score: 'Total Score',
    rank: 'Current Rank',
    combo: 'Combo Multiplier',
    timeRemaining: 'Mission Time Left',
    operativeStatus: 'Operative: ALPHA-01',
    hp: 'Hit Points',
    cyberEnergy: 'Cyber Energy',
    ammo: 'Ammunition',

    pressureSystemTitle: 'Soft-Pressure Suppression',
    pressureValue: 'Pressure',
    pressureIdle: 'System on Standby',
    pressureIdleDesc: 'Hold Left Click or Spacebar to engage suppression',
    pressurePhase1: 'Light Press · EM Stasis Field',
    pressurePhase1Desc: 'Enemies slowed by 75% · Weapons jammed',
    pressurePhase2: 'Resonance Press · Plasma Beam',
    pressurePhase2Desc: 'Continuous beam melts targets · Combo active',
    pressurePhase3: 'Heavy Press · EMP Cleansing Nova',
    pressurePhase3Desc: 'Release or reach 100% to purge all threats (18m)',
    pressureHint: '💡 Hold Left Mouse or Spacebar for effortless suppression',

    viewTactical: '2.5D Tactical (Comfort)',
    viewFps: 'FPS Camera',
    zoomWide: 'Wide',
    zoomNormal: 'Mid',
    zoomClose: 'Close',
    zoomTitle: 'Camera Zoom',

    leaderboardTitle: 'Neo-Nights Hall of Legends',
    leaderboardSubtitle: 'Local Real-Time Rankings',
    leaderboardRule: 'Core Rule: High kills and cumulative score elevate operative rank (SSS / S / A / B / C)',
    currentPerformance: 'Current Operation Performance',
    callsignPlaceholder: 'Enter Callsign (e.g., GHOST-01)',
    submitScore: 'Save Score',
    submitted: 'Saved!',
    colRank: 'Rank #',
    colCallsign: 'Callsign',
    colTier: 'Grade',
    colKills: 'Kills',
    colScore: 'Total Score',
    colDate: 'Date',
    resetLeaderboard: 'Reset Leaderboard',
    rankThresholds: 'Rank Milestones: SSS ≥ 20,000 PTS · S ≥ 12,000 PTS · A ≥ 6,000 PTS',

    victoryTitle: 'EXTRACTION SUCCESSFUL',
    failureTitle: 'MISSION COMPROMISED',
    nextMission: 'Next Mission',
    retry: 'Retry Operation',
    review: 'Review Battlefield',
    missionList: 'Mission Select',
    tacticalPanel: 'Tactical Rerouting Panel',
    shelfHp: 'Shelf Armor HP',
    shelfMoving: 'Shelf Moving Along Rail',
    shelfStopped: 'Shelf Idle on Node',
  },

  id: {
    gameTitle: 'Neo-Nights: Protokol Penyelundupan',
    gameSubtitle: 'PENEMBAK TAKTIS CYBERPUNK × PERENCANAAN JALUR',
    gameBadge: 'TAKTIK CO-OP CYBERPUNK',
    gameDescription: 'Menyusup ke karnaval virtual yang dikuasai teroris, gunakan Sistem Penekanan Lembut tanpa lelah, rebut barang selundupan berbahaya, dan atur rute rak bergerak untuk evakuasi!',

    startMission: 'Mulai Misi',
    resumeMission: 'Lanjutkan Misi',
    selectLevel: 'Pilih Misi',
    leaderboard: 'Papan Peringkat',
    dossier: 'Berkas Agen & Cetak Biru',
    backToMainMenu: 'Menu Utama',
    options: 'Pengaturan Taktis',
    languageSelect: 'Pilihan Bahasa',

    feature1Title: 'Pandangan 2.5D Bebas Pusing',
    feature1Desc: 'Sudut pandang 52° dengan cakrawala stabil. Tanpa putaran kamera liar dan guncangan tajam, bebas dari mabuk visual.',
    feature2Title: 'Sistem Penekanan Lembut',
    feature2Desc: 'Tekan lembut untuk memperlambat musuh 75% dan memacetkan senjata; tekan sedang untuk sinar plasma kontinu; tekan penuh untuk ledakan EMP.',
    feature3Title: 'Sistem Peringkat Eliminasi & Skor',
    feature3Desc: 'Perhitungan langsung jumlah eliminasi musuh dan skor terkumpul. Capai rekor tertinggi untuk meraih pangkat SSS Legenda.',

    controlsTitle: 'Panduan Kendali Lapangan',
    ctrlMove: 'WASD / Tombol Panah: Gerakan Agen Halus',
    ctrlPressure: 'Tahan Klik Kiri / Spasi: Penekanan Lembut (Bidikan Otomatis)',
    ctrlView: 'Tombol Tab: Ganti Tampilan 2.5D Taktis / FPS',
    ctrlInteract: 'Tombol E: Bawa Barang Selundupan / Letakkan di Rak / Evakuasi Tas',
    ctrlWeapons: 'Tombol 1-4: Ganti Senjata Utama Langsung',
    ctrlPause: 'Tombol P / Esc: Jeda Simulasi & Panel Misi',

    kills: 'Musuh Dieliminasi',
    killsUnit: 'Kill',
    score: 'Total Skor',
    rank: 'Peringkat Saat Ini',
    combo: 'Pengali Kombo',
    timeRemaining: 'Sisa Waktu Misi',
    operativeStatus: 'Agen Aktif: ALPHA-01',
    hp: 'Poin Kesehatan (HP)',
    cyberEnergy: 'Energi Siber',
    ammo: 'Amunisi',

    pressureSystemTitle: 'Sistem Penekanan Lembut',
    pressureValue: 'Nilai Tekanan',
    pressureIdle: 'Sistem Siaga',
    pressureIdleDesc: 'Tahan Klik Kiri atau Spasi untuk mengaktifkan medan penekanan',
    pressurePhase1: 'Tekan Ringan · Medan Gangguan EM',
    pressurePhase1Desc: 'Musuh melambat 75% · Senjata macet total',
    pressurePhase2: 'Tekan Sedang · Sinar Plasma Resonansi',
    pressurePhase2Desc: 'Sinar kontinu melumerkan target · Pengali kombo aktif',
    pressurePhase3: 'Tekan Penuh · Ledakan EMP Global',
    pressurePhase3Desc: 'Lepas atau capai 100% untuk membersihkan area sekitar (18m)',
    pressureHint: '💡 Tahan Klik Kiri atau Spasi untuk penekanan tanpa lelah',

    viewTactical: '2.5D Taktis (Bebas Pusing)',
    viewFps: 'Kamera FPS',
    zoomWide: 'Jauh',
    zoomNormal: 'Normal',
    zoomClose: 'Dekat',
    zoomTitle: 'Zoom Pandangan',

    leaderboardTitle: 'Papan Peringkat Agen Neo-Nights',
    leaderboardSubtitle: 'Peringkat Lokal Real-Time',
    leaderboardRule: 'Aturan Utama: Semakin tinggi jumlah eliminasi dan skor, semakin tinggi pangkat agen (SSS / S / A / B / C)',
    currentPerformance: 'Hasil Operasi Saat Ini',
    callsignPlaceholder: 'Masukkan Nama Agen (contoh: GARUDA-01)',
    submitScore: 'Simpan Skor',
    submitted: 'Tersimpan!',
    colRank: 'No.',
    colCallsign: 'Nama Agen',
    colTier: 'Pangkat',
    colKills: 'Eliminasi',
    colScore: 'Skor Akhir',
    colDate: 'Tanggal',
    resetLeaderboard: 'Reset Papan Skor',
    rankThresholds: 'Ambang Batas Peringkat: SSS ≥ 20.000 PTS · S ≥ 12.000 PTS · A ≥ 6.000 PTS',

    victoryTitle: 'EVAKUASI BERHASIL',
    failureTitle: 'MISI GAGAL',
    nextMission: 'Misi Berikutnya',
    retry: 'Ulangi Misi',
    review: 'Tinjau Medan Tempur',
    missionList: 'Pilih Misi',
    tacticalPanel: 'Panel Pengalihan Rute Taktis',
    shelfHp: 'Daya Tahan Rak',
    shelfMoving: 'Rak Bergerak di Jalur',
    shelfStopped: 'Rak Berhenti di Node',
  },
};
