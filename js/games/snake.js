/**
 * @file snake.js
 * Classic Snake.
 * Canvas: 480 × 480 (16×16 grid, 30px tiles)
 * Controls: ArrowKeys
 */

import { wasKeyPressed, clearKeys, clearCanvas, fillRect, drawText } from '../utils.js';
import { sfxScore, sfxExplode, sfxGameOver } from '../audio-engine.js';

const TILE  = 30;
const COLS  = 16;
const ROWS  = 16;
const W = COLS * TILE;
const H = ROWS * TILE;

export function start(canvas, onScore, onGameOver) {
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    clearKeys();

    let snake = [{ x: 8, y: 8 }];
    let dir   = { x: 1, y: 0 };
    let nextDir = { x: 1, y: 0 };
    let food  = spawnFood();
    let score = 0;
    let dead  = false;
    let lastMoveTime = 0;
    let interval = 140; // ms per tick
    let raf;

    function spawnFood() {
        let pos;
        do {
            pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
        } while (snake.some(s => s.x === pos.x && s.y === pos.y));
        return pos;
    }

    function update(time) {
        // Input
        if (wasKeyPressed('ArrowUp')    && dir.y !== 1)  nextDir = { x: 0,  y: -1 };
        if (wasKeyPressed('ArrowDown')  && dir.y !== -1) nextDir = { x: 0,  y:  1 };
        if (wasKeyPressed('ArrowLeft')  && dir.x !== 1)  nextDir = { x: -1, y:  0 };
        if (wasKeyPressed('ArrowRight') && dir.x !== -1) nextDir = { x: 1,  y:  0 };

        if (time - lastMoveTime < interval) return;
        lastMoveTime = time;

        dir = nextDir;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

        // Wall collision
        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
            dead = true;
            sfxExplode();
            sfxGameOver();
            onGameOver(score);
            return;
        }

        // Self collision
        if (snake.some(s => s.x === head.x && s.y === head.y)) {
            dead = true;
            sfxExplode();
            sfxGameOver();
            onGameOver(score);
            return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            sfxScore();
            onScore(score);
            food = spawnFood();
            interval = Math.max(60, 140 - score / 10 * 2);
        } else {
            snake.pop();
        }
    }

    function draw() {
        clearCanvas(ctx, '#050a05');

        // Grid lines (subtle)
        ctx.strokeStyle = '#0a140a';
        ctx.lineWidth = 1;
        for (let x = 0; x <= COLS; x++) {
            ctx.beginPath(); ctx.moveTo(x*TILE,0); ctx.lineTo(x*TILE,H); ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
            ctx.beginPath(); ctx.moveTo(0,y*TILE); ctx.lineTo(W,y*TILE); ctx.stroke();
        }

        // Food (neon pink)
        ctx.shadowColor = '#ff00aa';
        ctx.shadowBlur = 12;
        fillRect(ctx, food.x * TILE + 3, food.y * TILE + 3, TILE - 6, TILE - 6, '#ff00aa');
        ctx.shadowBlur = 0;

        // Snake
        snake.forEach((seg, i) => {
            const alpha = 1 - (i / snake.length) * 0.5;
            const g = Math.floor(255 * alpha).toString(16).padStart(2, '0');
            ctx.shadowColor = `#00${g}00`;
            ctx.shadowBlur = i === 0 ? 14 : 4;
            fillRect(ctx, seg.x * TILE + 1, seg.y * TILE + 1, TILE - 2, TILE - 2, `#00${g}00`, '#00ff00', 1);
        });
        ctx.shadowBlur = 0;

        // Score
        drawText(ctx, `SCORE: ${score}`, W / 2, 14, '#00ff88', 8);

        if (dead) {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(0, 0, W, H);
            drawText(ctx, 'GAME OVER', W/2, H/2 - 20, '#ff0055', 24);
            drawText(ctx, `SCORE: ${score}`, W/2, H/2 + 20, '#fff', 14);
        }
    }

    function loop(time) {
        if (!dead) update(time);
        draw();
        raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);

    return () => {
        cancelAnimationFrame(raf);
        clearKeys();
    };
}
