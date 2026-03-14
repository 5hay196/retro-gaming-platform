/**
 * @file pong.js
 * Classic Pong — player vs AI.
 * Canvas: 800 × 500
 * Controls: ArrowUp / ArrowDown
 */

import { isKeyDown, clearKeys, clearCanvas, drawText, fillRect } from '../utils.js';
import { sfxPaddle, sfxScore, sfxGameOver } from '../audio-engine.js';

const W = 800, H = 500;
const PAD_W = 12, PAD_H = 80, PAD_SPEED = 6;
const BALL_SIZE = 10;
const WIN_SCORE = 7;

/** @param {HTMLCanvasElement} canvas */
export function start(canvas, onScore, onGameOver) {
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    clearKeys();

    let playerY = H / 2 - PAD_H / 2;
    let aiY     = H / 2 - PAD_H / 2;
    let ball    = newBall();
    let pScore  = 0, aScore = 0;
    let paused  = false;
    let raf;

    function newBall() {
        const angle = (Math.random() * 60 - 30) * Math.PI / 180;
        const dir   = Math.random() < 0.5 ? 1 : -1;
        return {
            x: W / 2, y: H / 2,
            vx: Math.cos(angle) * 5 * dir,
            vy: Math.sin(angle) * 5
        };
    }

    function update() {
        if (paused) return;

        // Player paddle
        if (isKeyDown('ArrowUp'))   playerY = Math.max(0, playerY - PAD_SPEED);
        if (isKeyDown('ArrowDown')) playerY = Math.min(H - PAD_H, playerY + PAD_SPEED);

        // AI paddle (follows ball with slight lag)
        const aiCenter = aiY + PAD_H / 2;
        if (aiCenter < ball.y - 5) aiY = Math.min(H - PAD_H, aiY + PAD_SPEED * 0.88);
        else if (aiCenter > ball.y + 5) aiY = Math.max(0, aiY - PAD_SPEED * 0.88);

        // Ball movement
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Top / bottom wall bounce
        if (ball.y <= 0)          { ball.y = 0;          ball.vy *= -1; sfxPaddle(); }
        if (ball.y >= H - BALL_SIZE) { ball.y = H - BALL_SIZE; ball.vy *= -1; sfxPaddle(); }

        // Player paddle collision
        if (
            ball.x <= 30 + PAD_W &&
            ball.y + BALL_SIZE >= playerY &&
            ball.y <= playerY + PAD_H &&
            ball.vx < 0
        ) {
            ball.x = 30 + PAD_W;
            ball.vx *= -1.05;
            const hitPos = (ball.y + BALL_SIZE / 2 - playerY) / PAD_H; // 0–1
            ball.vy = (hitPos - 0.5) * 10;
            ball.vx = Math.min(ball.vx, 14);
            sfxPaddle();
        }

        // AI paddle collision
        const aiX = W - 30 - PAD_W;
        if (
            ball.x + BALL_SIZE >= aiX &&
            ball.y + BALL_SIZE >= aiY &&
            ball.y <= aiY + PAD_H &&
            ball.vx > 0
        ) {
            ball.x = aiX - BALL_SIZE;
            ball.vx *= -1.05;
            const hitPos = (ball.y + BALL_SIZE / 2 - aiY) / PAD_H;
            ball.vy = (hitPos - 0.5) * 10;
            sfxPaddle();
        }

        // Scoring
        if (ball.x < 0) {
            aScore++;
            sfxScore();
            onScore(pScore);
            ball = newBall();
        }
        if (ball.x > W) {
            pScore++;
            sfxScore();
            onScore(pScore);
            ball = newBall();
        }

        if (pScore >= WIN_SCORE || aScore >= WIN_SCORE) {
            sfxGameOver();
            onGameOver(pScore);
        }
    }

    function draw() {
        clearCanvas(ctx, '#000010');

        // Centre line
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = '#ffffff22';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
        ctx.setLineDash([]);

        // Paddles
        fillRect(ctx, 30, playerY, PAD_W, PAD_H, '#00ff88');
        fillRect(ctx, W - 30 - PAD_W, aiY, PAD_W, PAD_H, '#ff00aa');

        // Ball
        ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 15;
        fillRect(ctx, ball.x, ball.y, BALL_SIZE, BALL_SIZE, '#00e5ff');
        ctx.shadowBlur = 0;

        // Scores
        drawText(ctx, String(pScore), W / 4,     40, '#00ff88', 28);
        drawText(ctx, String(aScore), W * 3 / 4, 40, '#ff00aa', 28);

        // Labels
        drawText(ctx, 'PLAYER', W / 4,     70, '#ffffff55', 9);
        drawText(ctx, 'CPU',    W * 3 / 4, 70, '#ffffff55', 9);

        // Win message
        if (pScore >= WIN_SCORE) drawText(ctx, 'YOU WIN!', W/2, H/2, '#ffe600', 24);
        if (aScore >= WIN_SCORE) drawText(ctx, 'CPU WINS', W/2, H/2, '#ff00aa', 24);
    }

    function loop() {
        update();
        draw();
        raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);

    // Return cleanup function
    return () => {
        cancelAnimationFrame(raf);
        clearKeys();
    };
}
