/**
 * Procedural Web Audio API sound synthesizer for Neo-Nights: Contraband Protocol
 * Zero external audio files, 100% procedurally synthesized in browser.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmInterval: number | null = null;
  private shelfHumOsc: OscillatorNode | null = null;
  private shelfHumGain: GainNode | null = null;

  constructor() {
    // Lazy init on first user interaction
  }

  private initContext() {
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        this.ctx = new AudioContextClass();
        
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = 0.22;
        this.bgmGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.45;
        this.sfxGain.connect(this.ctx.destination);
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // Audio not permitted yet or not supported in this environment
      this.ctx = null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgmGain && this.sfxGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.bgmGain.gain.setValueAtTime(muted ? 0 : 0.22, now);
      this.sfxGain.gain.setValueAtTime(muted ? 0 : 0.45, now);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Shoot sound for VOLT-AR Electromagnetic Rifle
   */
  public playVoltARShoot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Dual oscillator: FM zap + low punch
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(880, t);
    osc1.frequency.exponentialRampToValueAtTime(75, t + 0.12);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(220, t);
    osc2.frequency.exponentialRampToValueAtTime(30, t + 0.15);

    // Distortion/Overdrive filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(3.5, t);

    gainNode.gain.setValueAtTime(0.7, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.16);
    osc2.stop(t + 0.16);

    // High frequency coil discharge sizzle
    const sizzle = this.ctx.createOscillator();
    const sizzleGain = this.ctx.createGain();
    sizzle.type = 'triangle';
    sizzle.frequency.setValueAtTime(2400, t);
    sizzle.frequency.linearRampToValueAtTime(3600, t + 0.08);

    sizzleGain.gain.setValueAtTime(0.2, t);
    sizzleGain.gain.linearRampToValueAtTime(0.001, t + 0.09);

    sizzle.connect(sizzleGain);
    sizzleGain.connect(this.sfxGain);
    sizzle.start(t);
    sizzle.stop(t + 0.09);
  }

  /**
   * Sniper laser warning charge
   */
  public playSniperCharge() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(1800, t + 0.6);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.55);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.65);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.65);
  }

  /**
   * Sniper rifle powerful firing crack
   */
  public playSniperShot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.4);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  /**
   * Enemy hit marker sound
   */
  public playHitMarker(isHeadshot: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const freq = isHeadshot ? 1760 : 1100;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.08);

    gain.gain.setValueAtTime(isHeadshot ? 0.6 : 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  /**
   * Moving Shelf bullet block sound (heavy metal ping & absorption)
   */
  public playShelfBlock() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.15);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Teammate downed alert
   */
  public playTeammateDown() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    [440, 370, 311].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);

      gain.gain.setValueAtTime(0.4, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.2);
    });
  }

  /**
   * Cyber Containment Bag Unzip Sound (ratchet hiss)
   */
  public playUnzipSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, t);
    filter.frequency.linearRampToValueAtTime(5500, t + 0.25);
    filter.Q.value = 4.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  /**
   * Teammate Electroshock Reboot Sound (defibrillator blast + rising tone)
   */
  public playRebootShock() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    
    // Buzz arc
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.linearRampToValueAtTime(330, t + 0.4);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.45);

    // Heartbeat restore blip
    const blip = this.ctx.createOscillator();
    const blipGain = this.ctx.createGain();
    blip.type = 'sine';
    blip.frequency.setValueAtTime(750, t + 0.35);

    blipGain.gain.setValueAtTime(0.4, t + 0.35);
    blipGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    blip.connect(blipGain);
    blipGain.connect(this.sfxGain);
    blip.start(t + 0.35);
    blip.stop(t + 0.55);
  }

  /**
   * Contraband pickup or deposit sound
   */
  public playContrabandAction() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, t); // D5
    osc.frequency.setValueAtTime(880, t + 0.08); // A5
    osc.frequency.setValueAtTime(1174.66, t + 0.16); // D6

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  /**
   * Start dynamic Synthwave/Cyberpunk Background Music Loop
   */
  public startBGM() {
    if (this.isBgmPlaying) return;
    this.initContext();
    if (!this.ctx || !this.bgmGain) return;

    this.isBgmPlaying = true;
    let step = 0;
    const notes = [65.41, 65.41, 77.78, 65.41, 98.0, 87.31, 77.78, 65.41]; // C2, C2, Eb2, C2, G2, F2, Eb2, C2

    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.bgmGain) return;

      const t = this.ctx.currentTime;
      const freq = notes[step % notes.length];
      step++;

      // Synth bass note
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, t);
      filter.frequency.exponentialRampToValueAtTime(120, t + 0.22);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(t);
      osc.stop(t + 0.25);

      // Hi-hat pulse on every other beat
      if (step % 2 === 0) {
        const hhOsc = this.ctx.createOscillator();
        const hhGain = this.ctx.createGain();
        hhOsc.type = 'triangle';
        hhOsc.frequency.setValueAtTime(6000, t);
        hhGain.gain.setValueAtTime(0.04, t);
        hhGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        hhOsc.connect(hhGain);
        hhGain.connect(this.bgmGain);
        hhOsc.start(t);
        hhOsc.stop(t + 0.05);
      }
    }, 240); // 125 BPM eighth notes
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  /**
   * Sound when moving shelf is moving
   */
  public updateShelfHum(isMoving: boolean) {
    if (this.isMuted || !this.ctx || !this.sfxGain) return;

    if (isMoving && !this.shelfHumOsc) {
      this.initContext();
      const t = this.ctx.currentTime;
      this.shelfHumOsc = this.ctx.createOscillator();
      this.shelfHumGain = this.ctx.createGain();

      this.shelfHumOsc.type = 'sawtooth';
      this.shelfHumOsc.frequency.setValueAtTime(55, t);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 160;

      this.shelfHumGain.gain.setValueAtTime(0.001, t);
      this.shelfHumGain.gain.linearRampToValueAtTime(0.12, t + 0.4);

      this.shelfHumOsc.connect(filter);
      filter.connect(this.shelfHumGain);
      this.shelfHumGain.connect(this.sfxGain);

      this.shelfHumOsc.start(t);
    } else if (!isMoving && this.shelfHumOsc && this.shelfHumGain) {
      const t = this.ctx.currentTime;
      this.shelfHumGain.gain.linearRampToValueAtTime(0.001, t + 0.3);
      setTimeout(() => {
        if (this.shelfHumOsc) {
          this.shelfHumOsc.stop();
          this.shelfHumOsc.disconnect();
          this.shelfHumOsc = null;
          this.shelfHumGain = null;
        }
      }, 350);
    }
  }

  public playReload() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    
    // Magazine eject click
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(320, t);
    g1.gain.setValueAtTime(0.3, t);
    g1.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    osc1.connect(g1);
    g1.connect(this.sfxGain);
    osc1.start(t);
    osc1.stop(t + 0.1);

    // Magazine snap lock
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(800, t + 0.3);
    g2.gain.setValueAtTime(0.35, t + 0.3);
    g2.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
    osc2.connect(g2);
    g2.connect(this.sfxGain);
    osc2.start(t + 0.3);
    osc2.stop(t + 0.45);
  }

  /**
   * Sound for Plasma Cannon Heavy Blast
   */
  public playPlasmaBlast() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.4);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.4);

    gain.gain.setValueAtTime(0.85, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  /**
   * Sound for Cyber SMG Rapid Shot
   */
  public playSMGShoot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.07);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Sound for Nano Shotgun Blast
   */
  public playShotgunShoot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Heavy crack
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.28);

    gain.gain.setValueAtTime(0.75, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  /**
   * Sound when picking up Weapon or Ammo
   */
  public playPickupSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, t); // C5
    osc.frequency.setValueAtTime(783.99, t + 0.08); // G5
    osc.frequency.setValueAtTime(1046.5, t + 0.16); // C6

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  /**
   * Sound when pausing or unpausing
   */
  public playPauseClick(isPause: boolean) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isPause ? 440 : 660, t);
    osc.frequency.linearRampToValueAtTime(isPause ? 330 : 880, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  // Soft-Pressure Suppression Sound System
  private pressureOsc: OscillatorNode | null = null;
  private pressureGain: GainNode | null = null;

  public updatePressureHum(pressure: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    if (pressure > 0.05) {
      if (!this.pressureOsc) {
        this.pressureOsc = this.ctx.createOscillator();
        this.pressureGain = this.ctx.createGain();
        this.pressureOsc.type = 'triangle';
        this.pressureGain.gain.setValueAtTime(0.01, t);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, t);

        this.pressureOsc.connect(filter);
        filter.connect(this.pressureGain);
        this.pressureGain.connect(this.sfxGain);
        this.pressureOsc.start();
      }
      // Pitch rises gently with soft pressure (from 120Hz to 360Hz)
      if (this.pressureOsc && this.pressureGain) {
        const targetFreq = 120 + pressure * 240;
        this.pressureOsc.frequency.setTargetAtTime(targetFreq, t, 0.06);
        this.pressureGain.gain.setTargetAtTime(Math.min(0.3, pressure * 0.28), t, 0.05);
      }
    } else {
      if (this.pressureGain) {
        this.pressureGain.gain.setTargetAtTime(0, t, 0.08);
      }
      if (this.pressureOsc && pressure <= 0.01) {
        try {
          this.pressureOsc.stop(t + 0.1);
        } catch {}
        this.pressureOsc = null;
        this.pressureGain = null;
      }
    }
  }

  public playResonanceBeam() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.linearRampToValueAtTime(720, t + 0.08);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.Q.setValueAtTime(2.0, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  public playEMPNova() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Deep sub-bass boom
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(160, t);
    sub.frequency.exponentialRampToValueAtTime(30, t + 0.6);
    subGain.gain.setValueAtTime(0.8, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(t);
    sub.stop(t + 0.65);

    // Shimmering cleansing ripple
    const shimmer = this.ctx.createOscillator();
    const shimGain = this.ctx.createGain();
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(900, t);
    shimmer.frequency.exponentialRampToValueAtTime(1800, t + 0.35);
    shimGain.gain.setValueAtTime(0.3, t);
    shimGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    shimmer.connect(shimGain);
    shimGain.connect(this.sfxGain);
    shimmer.start(t);
    shimmer.stop(t + 0.4);
  }

  public playScoreGain() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(1320, t + 0.05);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playRankUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Harmonic triad fanfare: C5, E5, G5, C6
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((f, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + i * 0.08);
      gain.gain.setValueAtTime(0.3, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.35);
    });
  }
}

export const soundManager = new SoundManager();

