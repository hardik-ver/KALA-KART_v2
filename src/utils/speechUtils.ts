/**
 * Text-to-Speech (TTS) & Web Audio Synthesizer Engine
 * Tailored for low-literacy Indian artisans in Hindi and English
 */

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

export function playTextToSpeech(
  text: string,
  lang: string = "hi",
  onStart?: () => void,
  onEnd?: () => void
) {
  if (!isSpeechSupported()) {
    return;
  }

  // Cancel any prior speech cleanly without firing error events on the detached utterance
  stopTextToSpeech();

  if (!text || text.trim() === "") {
    onEnd?.();
    return;
  }

  try {
    const targetLang = lang.startsWith("hi") ? "hi-IN" : "en-IN";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    utterance.rate = 0.92; // Slightly slowed for low-literacy comprehension
    utterance.pitch = 1.0;

    // Try to pick an authentic Indian voice if available
    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const matchedVoice = voices.find(
          (v) =>
            (targetLang === "hi-IN" && (v.lang.includes("hi") || v.name.toLowerCase().includes("hindi") || v.name.toLowerCase().includes("india"))) ||
            (targetLang === "en-IN" && (v.lang.includes("en-IN") || v.name.toLowerCase().includes("india") || v.name.toLowerCase().includes("indian")))
        ) || voices.find((v) => v.lang.startsWith(targetLang.slice(0, 2)));

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }
    } catch {
      // Voice detection is a non-blocking progressive enhancement
    }

    utterance.onstart = () => {
      activeUtterance = utterance;
      onStart?.();
    };

    utterance.onend = () => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
      }
      onEnd?.();
    };

    utterance.onerror = (e: any) => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
      }

      // Expected operational states in browsers and sandboxed iframes:
      // - "canceled": Triggered normally when speech is stopped or screen changes
      // - "interrupted": Triggered when another speech request supersedes
      // - "not-allowed": Browser autoplay policy when user hasn't yet interacted
      const errType = e?.error;
      if (
        errType === "canceled" ||
        errType === "interrupted" ||
        errType === "not-allowed" ||
        !errType
      ) {
        onEnd?.();
        return;
      }

      console.warn("TTS Speech notice:", errType);
      onEnd?.();
    };

    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis unavailable:", err);
    activeUtterance = null;
    onEnd?.();
  }
}

export function stopTextToSpeech() {
  if (isSpeechSupported()) {
    try {
      if (activeUtterance) {
        activeUtterance.onstart = null;
        activeUtterance.onend = null;
        activeUtterance.onerror = null;
        activeUtterance = null;
      }
      window.speechSynthesis.cancel();
    } catch {
      // Ignore cancel errors
    }
  }
}

/**
 * Web Audio Chimes & Haptic Feedback Sounds
 */
class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Camera snap shutter sound
  playCameraShutter() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch (e) {
      // Audio context might fail on un-interacted browser
    }
  }

  // Voice recording start beep
  playMicStart() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.setValueAtTime(780, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.24);
    } catch (e) {}
  }

  // Celebration fanfare on publishing
  playCelebration() {
    try {
      const ctx = this.getContext();
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + index * 0.09;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.36);
      });
    } catch (e) {}
  }
}

export const soundEffects = new SoundEngine();
