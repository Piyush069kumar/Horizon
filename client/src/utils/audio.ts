let lastPlayTime = 0;

/**
 * Pure Web Audio API chime synthesizer for real-time notification alerts.
 * Completely self-contained, offline-compatible, and requires no external audio assets.
 */
export function playNotificationSound() {
  const currentTimeMs = Date.now();
  // Prevent duplicate audio triggers within 1000ms
  if (currentTimeMs - lastPlayTime < 1000) {
    return;
  }
  lastPlayTime = currentTimeMs;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic two-tone chime (Eb5 -> Bb5)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(622.25, now); // Eb5
    osc1.frequency.setValueAtTime(932.33, now + 0.1); // Bb5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(622.25, now);
    osc2.frequency.setValueAtTime(932.33, now + 0.1);

    // Smooth envelope attack and decay
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);

    // Close context after playback to avoid resource leaks
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1000);
  } catch (error) {
    // Silently ignore if autoplay policy temporarily blocks audio before user interaction
  }
}
