/**
 * Web Audio Ambient Sound and Chime Synthesis Engine.
 * All sound is synthesized procedurally in Web Audio without external audio files.
 */

export type AmbientSoundId = 'off' | 'brown' | 'pink' | 'white' | 'rain';

export interface AudioSettings {
  sound: AmbientSoundId;
  volume: number; // 0 to 1, default 0.25
  pauseInBreaks: boolean; // default true
  chimeMuted: boolean; // default false
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  sound: 'off',
  volume: 0.25,
  pauseInBreaks: true,
  chimeMuted: false,
};

export const AUDIO_STORAGE_KEY = 'track.focus.audio.v1';

export function loadAudioSettings(): AudioSettings {
  if (typeof window === 'undefined') return DEFAULT_AUDIO_SETTINGS;
  try {
    const raw = localStorage.getItem(AUDIO_STORAGE_KEY);
    if (!raw) return DEFAULT_AUDIO_SETTINGS;
    const parsed = JSON.parse(raw);
    const validSounds: AmbientSoundId[] = ['off', 'brown', 'pink', 'white', 'rain'];
    return {
      sound: validSounds.includes(parsed.sound) ? parsed.sound : DEFAULT_AUDIO_SETTINGS.sound,
      volume: typeof parsed.volume === 'number' && parsed.volume >= 0 && parsed.volume <= 1
        ? parsed.volume
        : DEFAULT_AUDIO_SETTINGS.volume,
      pauseInBreaks: typeof parsed.pauseInBreaks === 'boolean'
        ? parsed.pauseInBreaks
        : DEFAULT_AUDIO_SETTINGS.pauseInBreaks,
      chimeMuted: typeof parsed.chimeMuted === 'boolean'
        ? parsed.chimeMuted
        : DEFAULT_AUDIO_SETTINGS.chimeMuted,
    };
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

export function saveAudioSettings(settings: AudioSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

// Global AudioContext singleton to share across user interactions
let sharedAudioCtx: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * Generate brown (Brownian / red) noise: 4s loop with seamless crossfade.
 */
function createBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate || 44100;
  const duration = 4;
  const totalSamples = Math.floor(sampleRate * duration);
  const crossfade = 3000;
  const rawLength = totalSamples + crossfade;
  const buffer = ctx.createBuffer(2, totalSamples, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    const raw = new Float32Array(rawLength);
    let last = 0.0;
    for (let i = 0; i < rawLength; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      raw[i] = last * 3.5;
    }
    for (let i = 0; i < totalSamples; i++) {
      if (i < crossfade) {
        const t = i / crossfade;
        data[i] = (1 - t) * raw[totalSamples + i] + t * raw[i];
      } else {
        data[i] = raw[i];
      }
    }
  }
  return buffer;
}

/**
 * Generate pink noise using Paul Kellet's filter method: 4s loop.
 */
function createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate || 44100;
  const duration = 4;
  const totalSamples = Math.floor(sampleRate * duration);
  const crossfade = 3000;
  const rawLength = totalSamples + crossfade;
  const buffer = ctx.createBuffer(2, totalSamples, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    const raw = new Float32Array(rawLength);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < rawLength; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
      raw[i] = pink;
    }
    for (let i = 0; i < totalSamples; i++) {
      if (i < crossfade) {
        const t = i / crossfade;
        data[i] = (1 - t) * raw[totalSamples + i] + t * raw[i];
      } else {
        data[i] = raw[i];
      }
    }
  }
  return buffer;
}

/**
 * Generate white noise: 4s loop.
 */
function createWhiteNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate || 44100;
  const duration = 4;
  const totalSamples = Math.floor(sampleRate * duration);
  const crossfade = 3000;
  const rawLength = totalSamples + crossfade;
  const buffer = ctx.createBuffer(2, totalSamples, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    const raw = new Float32Array(rawLength);
    for (let i = 0; i < rawLength; i++) {
      raw[i] = (Math.random() * 2 - 1) * 0.15;
    }
    for (let i = 0; i < totalSamples; i++) {
      if (i < crossfade) {
        const t = i / crossfade;
        data[i] = (1 - t) * raw[totalSamples + i] + t * raw[i];
      } else {
        data[i] = raw[i];
      }
    }
  }
  return buffer;
}

/**
 * Generate rain sound: pink noise bed + randomized raindrops.
 */
function createRainBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate || 44100;
  const duration = 4;
  const totalSamples = Math.floor(sampleRate * duration);
  const crossfade = 3000;
  const rawLength = totalSamples + crossfade;
  const buffer = ctx.createBuffer(2, totalSamples, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    const raw = new Float32Array(rawLength);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < rawLength; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.09;
      b6 = white * 0.115926;

      // Sparse high-frequency raindrop clicks
      let drop = 0;
      if (Math.random() < 0.0025) {
        drop = (Math.random() * 2 - 1) * 0.28;
      }
      raw[i] = pink + drop;
    }

    for (let i = 0; i < totalSamples; i++) {
      if (i < crossfade) {
        const t = i / crossfade;
        data[i] = (1 - t) * raw[totalSamples + i] + t * raw[i];
      } else {
        data[i] = raw[i];
      }
    }
  }
  return buffer;
}

export class AmbientEngine {
  private currentSound: AmbientSoundId = 'off';
  private targetSound: AmbientSoundId = 'off';
  private volume: number = 0.25;
  private isPaused: boolean = false;
  private masterGain: GainNode | null = null;
  private fadeGain: GainNode | null = null;
  private activeSource: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private bufferCache: Map<AmbientSoundId, AudioBuffer> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = loadAudioSettings();
      this.volume = saved.volume;
    }
  }

  private initGraph(): AudioContext | null {
    const ctx = getSharedAudioContext();
    if (!ctx) return null;

    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
      this.masterGain.connect(ctx.destination);
    }
    return ctx;
  }

  private getBuffer(id: AmbientSoundId, ctx: AudioContext): AudioBuffer | null {
    if (id === 'off') return null;
    if (this.bufferCache.has(id)) {
      return this.bufferCache.get(id)!;
    }
    let buf: AudioBuffer;
    switch (id) {
      case 'brown':
        buf = createBrownNoiseBuffer(ctx);
        break;
      case 'pink':
        buf = createPinkNoiseBuffer(ctx);
        break;
      case 'white':
        buf = createWhiteNoiseBuffer(ctx);
        break;
      case 'rain':
        buf = createRainBuffer(ctx);
        break;
      default:
        return null;
    }
    this.bufferCache.set(id, buf);
    return buf;
  }

  private stopCurrentSource(durationMs = 300) {
    if (!this.activeSource || !this.fadeGain) return;
    const ctx = getSharedAudioContext();
    const source = this.activeSource;
    const fade = this.fadeGain;
    const filter = this.filterNode;
    this.activeSource = null;
    this.fadeGain = null;
    this.filterNode = null;

    if (ctx && durationMs > 0) {
      const now = ctx.currentTime;
      fade.gain.cancelScheduledValues(now);
      fade.gain.setValueAtTime(fade.gain.value, now);
      fade.gain.linearRampToValueAtTime(0, now + durationMs / 1000);
      setTimeout(() => {
        try {
          source.stop();
          source.disconnect();
          fade.disconnect();
          filter?.disconnect();
        } catch {}
      }, durationMs + 20);
    } else {
      try {
        source.stop();
        source.disconnect();
        fade.disconnect();
        filter?.disconnect();
      } catch {}
    }
  }

  public setSound(id: AmbientSoundId): void {
    this.targetSound = id;
    if (id === this.currentSound) return;

    const ctx = this.initGraph();
    if (!ctx || !this.masterGain) {
      this.currentSound = id;
      return;
    }

    // Fade out previous source with 300ms fade
    this.stopCurrentSource(300);
    this.currentSound = id;

    if (id === 'off' || this.isPaused) {
      return;
    }

    const buffer = this.getBuffer(id, ctx);
    if (!buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filter node based on sound type
    const filter = ctx.createBiquadFilter();
    if (id === 'brown') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
    } else if (id === 'rain') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(1.0, ctx.currentTime);
    } else if (id === 'white') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(5500, ctx.currentTime);
    } else {
      filter.type = 'allpass';
    }

    const fade = ctx.createGain();
    const now = ctx.currentTime;
    fade.gain.setValueAtTime(0, now);
    fade.gain.linearRampToValueAtTime(1, now + 0.3); // 300ms fade in

    source.connect(filter);
    filter.connect(fade);
    fade.connect(this.masterGain);

    source.start(now);
    this.activeSource = source;
    this.fadeGain = fade;
    this.filterNode = filter;
  }

  public setVolume(v: number): void {
    const clamped = Math.max(0, Math.min(1, v));
    this.volume = clamped;
    const ctx = getSharedAudioContext();
    if (ctx && this.masterGain) {
      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(clamped, now + 0.05);
    }
  }

  public pause(): void {
    this.isPaused = true;
    if (this.fadeGain) {
      const ctx = getSharedAudioContext();
      if (ctx) {
        const now = ctx.currentTime;
        this.fadeGain.gain.cancelScheduledValues(now);
        this.fadeGain.gain.setValueAtTime(this.fadeGain.gain.value, now);
        this.fadeGain.gain.linearRampToValueAtTime(0, now + 0.3);
      }
    }
  }

  public resume(): void {
    this.isPaused = false;
    if (this.currentSound === 'off') return;

    if (!this.activeSource) {
      // Re-create source if it was torn down
      const sound = this.currentSound;
      this.currentSound = 'off';
      this.setSound(sound);
    } else if (this.fadeGain) {
      const ctx = getSharedAudioContext();
      if (ctx) {
        const now = ctx.currentTime;
        this.fadeGain.gain.cancelScheduledValues(now);
        this.fadeGain.gain.setValueAtTime(this.fadeGain.gain.value, now);
        this.fadeGain.gain.linearRampToValueAtTime(1, now + 0.3);
      }
    }
  }

  public fadeOut(durationMs = 300): void {
    if (this.fadeGain) {
      const ctx = getSharedAudioContext();
      if (ctx) {
        const now = ctx.currentTime;
        this.fadeGain.gain.cancelScheduledValues(now);
        this.fadeGain.gain.setValueAtTime(this.fadeGain.gain.value, now);
        this.fadeGain.gain.linearRampToValueAtTime(0, now + durationMs / 1000);
      }
    }
  }

  public fadeIn(durationMs = 300): void {
    if (this.currentSound === 'off' || this.isPaused) return;
    if (!this.activeSource) {
      const sound = this.currentSound;
      this.currentSound = 'off';
      this.setSound(sound);
      return;
    }
    if (this.fadeGain) {
      const ctx = getSharedAudioContext();
      if (ctx) {
        const now = ctx.currentTime;
        this.fadeGain.gain.cancelScheduledValues(now);
        this.fadeGain.gain.setValueAtTime(this.fadeGain.gain.value, now);
        this.fadeGain.gain.linearRampToValueAtTime(1, now + durationMs / 1000);
      }
    }
  }

  public cleanup(): void {
    this.stopCurrentSource(0);
    this.currentSound = 'off';
    this.targetSound = 'off';
  }

  public getSound(): AmbientSoundId {
    return this.currentSound;
  }

  public getVolume(): number {
    return this.volume;
  }
}

// Global ambient engine singleton
let ambientEngineInstance: AmbientEngine | null = null;

export function getAmbientEngine(): AmbientEngine {
  if (!ambientEngineInstance) {
    ambientEngineInstance = new AmbientEngine();
  }
  return ambientEngineInstance;
}

/**
 * Procedurally synthesize soft sine-wave chimes:
 * - "segment": two soft sine notes (~0.8s, gentle envelope, low gain)
 * - "finished": three notes, slightly longer (~1.4s)
 */
export function playChime(type: 'segment' | 'finished', muted = false): void {
  if (muted) return;
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.14, now);
  master.connect(ctx.destination);

  if (type === 'segment') {
    // 2-note chime: C5 (523.25 Hz) then E5 (659.25 Hz)
    const notes = [
      { freq: 523.25, time: 0, duration: 0.4 },
      { freq: 659.25, time: 0.35, duration: 0.5 },
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.8, now + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now + time);
      osc.stop(now + time + duration + 0.05);
    });
  } else {
    // 3-note finished chime: C5 (523.25) -> E5 (659.25) -> G5 (783.99)
    const notes = [
      { freq: 523.25, time: 0, duration: 0.45 },
      { freq: 659.25, time: 0.35, duration: 0.5 },
      { freq: 783.99, time: 0.75, duration: 0.8 },
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.85, now + time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now + time);
      osc.stop(now + time + duration + 0.05);
    });
  }

  // Disconnect master after chime finishes
  setTimeout(() => {
    try {
      master.disconnect();
    } catch {}
  }, 2000);
}

/**
 * Short soft click for skip action (10ms tick, no chime).
 */
export function playSkipTick(muted = false): void {
  if (muted) return;
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.015);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.02);
}
