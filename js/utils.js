/**
 * @file utils.js
 * Shared utilities for the Retro Arcade Platform.
 * Provides keyboard input tracking and canvas drawing helpers.
 */

// ---- Keyboard Input ----

/** @type {Set<string>} */
const _keys = new Set();

window.addEventListener('keydown', e => {
    _keys.add(e.code);
    // Prevent page scroll on arrow keys / space
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', e => _keys.delete(e.code));

/** Returns true while the given key is held down. @param {string} code */
export const isKeyDown = code => _keys.has(code);

/** One-shot key press — clears the key after reading. @param {string} code */
export const wasKeyPressed = code => {
    if (_keys.has(code)) { _keys.delete(code); return true; }
    return false;
};

/** Clear all tracked keys (call on game start/stop). */
export const clearKeys = () => _keys.clear();

// ---- Canvas helpers ----

/**
 * Fill a rectangle with an optional border.
 * @param {CanvasRenderingContext2D} ctx
 */
export function fillRect(ctx, x, y, w, h, fillColor, strokeColor = null, lineWidth = 1) {
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, w, h);
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(x, y, w, h);
    }
}

/**
 * Draw pixel-art text centered at cx.
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawText(ctx, text, cx, cy, color = '#ffffff', size = 14, align = 'center') {
    ctx.fillStyle = color;
    ctx.font = `${size}px "Press Start 2P", monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy);
}

/**
 * Clear the canvas to a solid color.
 * @param {CanvasRenderingContext2D} ctx
 */
export function clearCanvas(ctx, color = '#000000') {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * Draw a glowing neon rectangle outline.
 * @param {CanvasRenderingContext2D} ctx
 */
export function glowRect(ctx, x, y, w, h, color, blur = 12) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
}

/** Random integer between min (inclusive) and max (inclusive). */
export const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Clamp value between lo and hi. */
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
