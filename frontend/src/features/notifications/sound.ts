/**
 * The incoming-message sound, synthesized with the Web Audio API (no audio file to ship).
 * A short, low bell: D minor triad, fast attack, ~1s decay.
 *
 * Browsers keep audio locked until the user has interacted with the page once.
 * unlockAudio() runs on the first click/keypress to get past that; until then sounds are skipped silently.
 */

const VOLUME = 0.2;

// [frequency Hz, relative level]
const PARTIALS: [number, number][] = [
    [146.83, 1],    // D3
    [220.0, 0.45],  // A3
    [349.23, 0.2],  // F4
    [587.33, 0.08], // D5, a bit of shimmer
];

let ctx: AudioContext | null = null;

function getContext() {
    if (!ctx && typeof AudioContext !== "undefined") {
        ctx = new AudioContext();
    }
    return ctx;
}

/** Call from a user gesture (or let installAudioUnlock do it). */
export function unlockAudio() {
    const c = getContext();
    if (c && c.state === "suspended") {
        c.resume().catch(() => {});
    }
}

/** Unlocks audio on the first click/keypress. Returns a cleanup function. */
export function installAudioUnlock() {
    const unlock = () => {
        unlockAudio();
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
    };

    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);

    return unlock;
}

/** Plays the bell. */
export function playMessageSound() {
    const c = getContext();
    if (!c || c.state !== "running") return; // still locked, skip quietly

    const t = c.currentTime;
    const out = c.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(VOLUME, t + 0.012);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    out.connect(c.destination);

    for (const [freq, level] of PARTIALS) {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.value = level;
        osc.connect(gain).connect(out);
        osc.start(t);
        osc.stop(t + 1.15);
    }
}
