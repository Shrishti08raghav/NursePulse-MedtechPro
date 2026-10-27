// Synthesized audio alerts using the Web Audio API
// Handles browser autoplay unlock, continuous alarm beeping, and immediate silence controls

class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private alarmInterval: number | null = null;
  public isAlarmRinging: boolean = false;
  private onAlarmStateChange?: (ringing: boolean) => void;

  constructor() {
    // Automatically attempt unlock on first user gesture anywhere on the window
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.unlockContext();
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
      window.addEventListener('touchstart', unlock, { once: true });
    }
  }

  public setAlarmListener(listener: (ringing: boolean) => void) {
    this.onAlarmStateChange = listener;
  }

  public unlockContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Pleasant success chime for "Medicine Given"
  playSuccessChime() {
    if (!this.enabled) return;
    try {
      const ctx = this.unlockContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.25); // C6

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // Audio fallback
    }
  }

  // Warning chime for upcoming / due medicine
  playWarningChime() {
    if (!this.enabled) return;
    try {
      const ctx = this.unlockContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(554.37, now + 0.15); // C#5

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Audio fallback
    }
  }

  // Single clinical monitor alarm pulse
  private triggerAlarmPulse() {
    if (!this.enabled) return;
    try {
      const ctx = this.unlockContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Two urgent high-pitched medical pulses
      [0, 0.18].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(920, now + offset); // High pitch alarm tone

        gain.gain.setValueAtTime(0.12, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.12);
      });
    } catch {
      // Audio fallback
    }
  }

  // Play repeating medical alarm until nurse stops it
  startContinuousAlertAlarm() {
    if (!this.enabled) return;
    this.unlockContext();
    this.triggerAlarmPulse();

    if (!this.alarmInterval) {
      this.isAlarmRinging = true;
      if (this.onAlarmStateChange) this.onAlarmStateChange(true);

      // Repeat alarm beep every 1.8 seconds
      this.alarmInterval = window.setInterval(() => {
        if (!this.enabled) {
          this.stopAlertAlarm();
          return;
        }
        this.triggerAlarmPulse();
      }, 1800);
    }
  }

  // Stop/Silence active alarm immediately
  stopAlertAlarm() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    this.isAlarmRinging = false;
    if (this.onAlarmStateChange) this.onAlarmStateChange(false);
  }

  // Test sound function so the user can verify their device speaker immediately
  testSound() {
    this.unlockContext();
    this.playSuccessChime();
  }
}

export const soundEffects = new SoundEffects();
