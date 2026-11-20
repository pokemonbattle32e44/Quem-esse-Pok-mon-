class SoundController {
  private audioCtx: AudioContext | null = null;
  private activeCryAudio: HTMLAudioElement | null = null;
  private fxEnabled = true;

  public setFxEnabled(enabled: boolean) {
    this.fxEnabled = enabled;
  }

  public isFxEnabled(): boolean {
    return this.fxEnabled;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!this.audioCtx) {
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    delay = 0,
    gainPeak = 0.08
  ) {
    if (!this.fxEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playHintUnlock() {
    this.playTone(523.25, 0.09, 'triangle', 0, 0.06);
    this.playTone(659.25, 0.14, 'triangle', 0.07, 0.06);
  }

  public playWrongGuess() {
    this.playTone(230, 0.12, 'sawtooth', 0, 0.045);
    this.playTone(175, 0.18, 'sawtooth', 0.09, 0.045);
  }

  public playCorrectFanfare() {
    this.playTone(523.25, 0.12, 'triangle', 0, 0.08);
    this.playTone(659.25, 0.12, 'triangle', 0.09, 0.08);
    this.playTone(783.99, 0.14, 'triangle', 0.18, 0.08);
    this.playTone(1046.5, 0.34, 'triangle', 0.28, 0.09);
  }

  public playRevealLoss() {
    this.playTone(392, 0.15, 'sine', 0, 0.06);
    this.playTone(349.23, 0.15, 'sine', 0.13, 0.06);
    this.playTone(293.66, 0.3, 'sine', 0.26, 0.06);
  }

  public stopCry() {
    if (this.activeCryAudio) {
      this.activeCryAudio.pause();
      this.activeCryAudio.currentTime = 0;
      this.activeCryAudio = null;
    }
  }

  public async playCry(
    cryUrl: string | null,
    onStateChange?: (playing: boolean) => void
  ): Promise<boolean> {
    if (!cryUrl) {
      onStateChange?.(false);
      return false;
    }

    this.stopCry();

    return new Promise((resolve) => {
      try {
        const audio = new Audio(cryUrl);
        audio.volume = 0.55;
        this.activeCryAudio = audio;

        const finish = (ok: boolean) => {
          onStateChange?.(false);
          if (this.activeCryAudio === audio) {
            this.activeCryAudio = null;
          }
          resolve(ok);
        };

        audio.addEventListener('ended', () => finish(true), { once: true });
        audio.addEventListener('error', () => finish(false), { once: true });

        onStateChange?.(true);
        audio
          .play()
          .then(() => {
            // Playback started cleanly; ended listener will reset state
          })
          .catch(() => {
            finish(false);
          });
      } catch {
        onStateChange?.(false);
        resolve(false);
      }
    });
  }
}

export const soundFx = new SoundController();
