/**
 * AudioSystem - Web Audio API 音效合成
 *
 * 复用 snake 的 AudioSystem 模式：
 * - 首次播放时懒加载 AudioContext
 * - 提供 enable / disable 开关
 * - 全部为正弦波 / 三角波合成，无外部资源
 */

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private masterGain: GainNode | null = null;
  /** v3.0 音量（0-1，默认 70%） */
  private volume: number = 0.7;

  private ensureCtx(): AudioContext | null {
    if (this.ctx) return this.ctx;
    try {
      // 兼容性写法（Safari 旧版）
      const AudioCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return null;
      this.ctx = new AudioCtor();
      this.masterGain = this.ctx.createGain();
      // v3.0 使用可调节音量替代硬编码 0.15
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
      return this.ctx;
    } catch {
      return null;
    }
  }

  /** v3.0 设置音量（0-1） */
  public setVolume(v: number): void {
    this.volume = v;
    if (this.masterGain) {
      this.masterGain.gain.value = v;
    }
  }

  public setEnabled(b: boolean): void {
    this.enabled = b;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 唤醒 AudioContext（iOS Safari 需要用户交互后才能播放）
   */
  public resume(): void {
    const ctx = this.ensureCtx();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume();
    }
  }

  /**
   * 移动音效 - 短促 click
   */
  public playMove(): void {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  /**
   * 合并音效 - 频率随 value 升高
   */
  public playMerge(value: number): void {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;

    // value 越大，音高越高（200-800Hz）
    const baseFreq = Math.min(800, 200 + value * 8);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  }

  /**
   * 新方块生成 - 轻柔 pop
   */
  public playSpawn(): void {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.03);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  }

  /**
   * 胜利音效 - 上行三音 C5-E5-G5
   */
  public playWin(): void {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;
    const master = this.masterGain;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.4, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }

  /**
   * 失败音效 - 下行音
   */
  public playLose(): void {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  }

  /**
   * 暂停/继续点击
   */
  public playClick(): void {
    if (!this.enabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  }
}
