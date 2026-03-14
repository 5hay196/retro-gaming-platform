/**
 * @file audio-engine.js
 * 8-bit sound effects using the Web Audio API.
 * No external dependencies — procedurally generated.
 */

let _ctx = null;

/** Lazily create AudioContext (must be triggered by user gesture). */
function getCtx() {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
    return _ctx;
}

/**
 * Play a simple beep tone.
 * @param {number} freq   - Frequency in Hz
 * @param {number} dur    - Duration in seconds
 * @param {string} type   - OscillatorType ('square'|'sawtooth'|'sine'|'triangle')
 * @param {number} vol    - Volume 0–1
 */
function beep(freq, dur = 0.1, type = 'square', vol = 0.3) {
    try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + dur);
    } catch (_) { /* AudioContext not supported */ }
}

/** Bounce / hit sound */
export const sfxHit    = () => beep(220, 0.05, 'square', 0.25);

/** Score / collect food */
export const sfxScore  = () => beep(660, 0.08, 'square', 0.3);

/** Line clear (Tetris) */
export const sfxClear  = () => {
    beep(440, 0.05, 'square', 0.3);
    setTimeout(() => beep(550, 0.05, 'square', 0.3), 60);
    setTimeout(() => beep(660, 0.1,  'square', 0.3), 120);
};

/** Player shoot */
export const sfxShoot  = () => beep(880, 0.06, 'sawtooth', 0.15);

/** Explosion */
export const sfxExplode = () => {
    try {
        const ctx = getCtx();
        const bufLen = ctx.sampleRate * 0.2;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
        src.connect(gain); gain.connect(ctx.destination);
        src.start();
    } catch (_) {}
};

/** Level up / victory jingle */
export const sfxLevel up = () => {
    [523, 659, 784, 1047].forEach((f, i) =>
        setTimeout(() => beep(f, 0.1, 'square', 0.3), i * 110)
    );
};

/** Game over jingle */
export const sfxGameOver = () => {
    [330, 294, 262].forEach((f, i) =>
        setTimeout(() => beep(f, 0.18, 'sawtooth', 0.35), i * 200)
    );
};

/** Paddle hit (Pong) */
export const sfxPaddle = () => beep(330, 0.04, 'square', 0.2);
