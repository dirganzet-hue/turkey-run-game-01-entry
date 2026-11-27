// SoundBank — every sound in the game is synthesized with WebAudio.
// No audio files, no network: oscillators and filtered noise only.
// Zombie edition: groans, squawks, cackles, slime and brain chimes.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.5;
  }

  tone(freq, dur, type, vol, slideTo, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  noise(dur, vol, filterFreq, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq || 1200;
    filter.Q.value = 0.8;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol || 0.2, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t0);
  }

  // The zombie turkey's call: a low wobbling groan.
  groan() {
    this.tone(90, 0.5, 'sawtooth', 0.16, 55);
    this.tone(135, 0.4, 'sawtooth', 0.09, 80, 0.05);
  }

  flap() {
    this.noise(0.12, 0.22, 900);
  }

  jump() {
    this.tone(280, 0.16, 'sine', 0.18, 620);
  }

  thud() {
    this.tone(140, 0.18, 'sine', 0.3, 55);
    this.noise(0.1, 0.18, 300);
  }

  pickup(golden) {
    this.tone(golden ? 880 : 660, 0.09, 'triangle', 0.2, golden ? 1320 : 990);
    if (golden) this.tone(1320, 0.12, 'triangle', 0.16, 1760, 0.08);
  }

  // Brain-corn: a bright rising chime, worth the risk.
  brain() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.14, 'triangle', 0.2, null, i * 0.07));
  }

  dash() {
    this.noise(0.35, 0.28, 2400);
    this.tone(180, 0.3, 'sawtooth', 0.1, 720);
  }

  slime() {
    this.tone(220, 0.2, 'sine', 0.16, 60);
  }

  hurt() {
    this.tone(220, 0.25, 'sawtooth', 0.22, 70);
    this.tone(110, 0.3, 'square', 0.14, 60, 0.05);
  }

  // The zombie crow's harsh cry.
  squawk() {
    this.tone(1200, 0.09, 'square', 0.12, 700);
    this.tone(1400, 0.08, 'square', 0.1, 900, 0.09);
  }

  // The zombie chicken's cackle.
  cackle() {
    [900, 700, 950, 650].forEach((f, i) => this.tone(f, 0.07, 'square', 0.09, null, i * 0.06));
  }

  // Something crawls out of the grave again.
  rise() {
    this.tone(60, 0.6, 'sawtooth', 0.18, 180);
    this.noise(0.4, 0.16, 300);
  }

  fanfare() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.2, null, i * 0.11));
  }

  caughtSting() {
    [392, 370, 349, 311].forEach((f, i) => this.tone(f, 0.28, 'sawtooth', 0.16, f * 0.94, i * 0.16));
  }

  escapedJingle() {
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => this.tone(f, 0.2, 'triangle', 0.2, null, i * 0.1));
  }

  click() {
    this.tone(700, 0.05, 'square', 0.12, 900);
  }
}
