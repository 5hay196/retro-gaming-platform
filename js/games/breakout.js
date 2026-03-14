/**
 * @file breakout.js
 * Breakout / Arkanoid clone.
 * Canvas: 480 × 600
 * Controls: Left/Right Arrows
 */

import { isKeyDown, clearKeys, clearCanvas, fillRect, drawText } from '../utils.js';
import { sfxPaddle, sfxScore, sfxExplode, sfxGameOver, sfxLevelUp } from '../audio-engine.js';

const W = 480, H = 600;
const P_W = 80, P_H = 12;
const BALL_R = 5;
const BRICK_W = 40, BRICK_H = 15;
const COLS = 10, ROWS = 6;

export function start(canvas, onScore, onGameOver) {
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    clearKeys();

    let paddleX = W/2 - P_W/2;
    let ball = { x: W/2, y: H - 50, vx: 4, vy: -4 };
    let bricks = [];
    let score = 0;
    let lives = 3;
    let paused = false;
    let raf;

    function initLevel() {
        bricks = [];
        for(let r=0; r<ROWS; r++) {
            for(let c=0; c<COLS; c++) {
                // simple layout
                bricks.push({
                    x: c * (BRICK_W + 4) + 22,
                    y: r * (BRICK_H + 4) + 50,
                    active: true,
                    color: `hsl(${r * 40}, 70%, 50%)`
                });
            }
        }
        resetBall();
    }

    function resetBall() {
        ball.x = paddleX + P_W/2;
        ball.y = H - 40;
        ball.vx = 4 * (Math.random() > 0.5 ? 1 : -1);
        ball.vy = -4;
    }

    function update() {
        if (paused) return;

        // Paddle
        if (isKeyDown('ArrowLeft'))  paddleX = Math.max(0, paddleX - 7);
        if (isKeyDown('ArrowRight')) paddleX = Math.min(W - P_W, paddleX + 7);

        // Ball
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Walls
        if (ball.x <= 0 || ball.x >= W) { ball.vx *= -1; sfxPaddle(); }
        if (ball.y <= 0) { ball.vy *= -1; sfxPaddle(); }

        // Paddle Collision
        if (ball.y + BALL_R >= H - 30 && ball.y - BALL_R <= H - 30 + P_H &&
            ball.x >= paddleX && ball.x <= paddleX + P_W) {
            
            ball.vy = -Math.abs(ball.vy);
            let hitPos = (ball.x - (paddleX + P_W/2)) / (P_W/2);
            ball.vx = hitPos * 7; 
            sfxPaddle();
        }

        // Bottom (Death)
        if (ball.y > H) {
            lives--;
            sfxExplode();
            if (lives <= 0) {
                sfxGameOver();
                onGameOver(score);
                paused = true;
            } else {
                resetBall();
            }
        }

        // Brick Collision
        let activeCount = 0;
        bricks.forEach(b => {
            if (!b.active) return;
            activeCount++;
            if (ball.x >= b.x && ball.x <= b.x + BRICK_W &&
                ball.y >= b.y && ball.y <= b.y + BRICK_H) {
                    b.active = false;
                    ball.vy *= -1;
                    score += 10;
                    sfxScore();
                    onScore(score);
            }
        });

        if (activeCount === 0) {
            sfxLevelUp();
            initLevel();
        }
    }

    function draw() {
        clearCanvas(ctx, '#050510');

        // Paddle
        fillRect(ctx, paddleX, H - 30, P_W, P_H, '#00e5ff');

        // Ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI*2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Bricks
        bricks.forEach(b => {
            if (b.active) fillRect(ctx, b.x, b.y, BRICK_W, BRICK_H, b.color);
        });

        // HUD
        drawText(ctx, `LIVES: ${lives}`, 50, 20, '#fff', 10);
        drawText(ctx, `SCORE: ${score}`, W - 60, 20, '#fff', 10);
    }

    function loop() {
        if (!paused) update();
        draw();
        raf = requestAnimationFrame(loop);
    }

    initLevel();
    raf = requestAnimationFrame(loop);

    return () => {
        cancelAnimationFrame(raf);
        clearKeys();
    };
}
