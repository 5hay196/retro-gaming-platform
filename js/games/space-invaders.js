/**
 * @file space-invaders.js
 * Space Invaders clone.
 * Canvas: 560 × 640
 * Controls: Left/Right to move, Space to shoot
 */

import { isKeyDown, wasKeyPressed, clearKeys, clearCanvas, fillRect, drawText } from '../utils.js';
import { sfxShoot, sfxExplode, sfxGameOver, sfxLevelUp } from '../audio-engine.js';

const W = 560, H = 640;
const PLAYER_W = 40, PLAYER_H = 16;
const BULLET_W = 4, BULLET_H = 14;
const ALIEN_W = 32, ALIEN_H = 24;
const A_COLS = 11, A_ROWS = 5;
const A_MARGIN_X = 20, A_MARGIN_Y = 70;

const ALIEN_COLORS = ['#ff00aa','#ff00aa','#ff6600','#ff6600','#ffe600'];

export function start(canvas, onScore, onGameOver) {
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    clearKeys();

    let playerX = W/2 - PLAYER_W/2;
    let bullets = [];
    let alienBullets = [];
    let aliens = [];
    let score = 0;
    let lives = 3;
    let dead = false;
    let shootCooldown = 0;
    let alienMoveTimer = 0;
    let alienDir = 1;
    let alienDropPending = false;
    let raf;
    let lastTime = 0;

    function initAliens() {
        aliens = [];
        for (let r=0; r<A_ROWS; r++) {
            for (let c=0; c<A_COLS; c++) {
                aliens.push({
                    x: A_MARGIN_X + c * (ALIEN_W + 8),
                    y: A_MARGIN_Y + r * (ALIEN_H + 10),
                    row: r,
                    alive: true,
                    frame: 0
                });
            }
        }
    }

    function update(dt) {
        if (dead) return;
        shootCooldown = Math.max(0, shootCooldown - dt);
        alienMoveTimer += dt;

        // Player movement
        if (isKeyDown('ArrowLeft'))  playerX = Math.max(0, playerX - 6);
        if (isKeyDown('ArrowRight')) playerX = Math.min(W - PLAYER_W, playerX + 6);

        // Shooting
        if (isKeyDown('Space') && shootCooldown <= 0 && bullets.length < 3) {
            bullets.push({ x: playerX + PLAYER_W/2 - BULLET_W/2, y: H - 40 });
            sfxShoot();
            shootCooldown = 300;
        }

        // Player bullets
        bullets = bullets.filter(b => {
            b.y -= 9;
            return b.y > 0;
        });

        // Alien movement
        const alive = aliens.filter(a => a.alive);
        const interval = Math.max(200, 800 - alive.length * 6);

        if (alienMoveTimer > interval) {
            alienMoveTimer = 0;

            if (alienDropPending) {
                aliens.forEach(a => a.y += 20);
                alienDropPending = false;
            } else {
                aliens.forEach(a => a.x += alienDir * 12);
                a => a.frame = (a.frame + 1) % 2;

                const rightEdge = Math.max(...alive.map(a => a.x + ALIEN_W));
                const leftEdge  = Math.min(...alive.map(a => a.x));
                if (rightEdge >= W - 5 || leftEdge <= 5) {
                    alienDir *= -1;
                    alienDropPending = true;
                }
            }
        }

        // Alien shoots randomly
        if (alive.length > 0 && Math.random() < 0.008) {
            const shooter = alive[Math.floor(Math.random() * alive.length)];
            alienBullets.push({ x: shooter.x + ALIEN_W/2, y: shooter.y + ALIEN_H });
        }

        // Alien bullets
        alienBullets = alienBullets.filter(b => {
            b.y += 5;
            return b.y < H;
        });

        // Collisions: player bullets vs aliens
        bullets = bullets.filter(bull => {
            let hit = false;
            aliens.forEach(a => {
                if (!a.alive) return;
                if (bull.x < a.x+ALIEN_W && bull.x+BULLET_W > a.x &&
                    bull.y < a.y+ALIEN_H && bull.y+BULLET_H > a.y) {
                    a.alive = false;
                    score += 10 * (5 - a.row);
                    sfxExplode();
                    onScore(score);
                    hit = true;
                }
            });
            return !hit;
        });

        // Alien bullets vs player
        alienBullets = alienBullets.filter(b => {
            const pCenterX = playerX + PLAYER_W/2;
            if (b.x > playerX && b.x < playerX + PLAYER_W &&
                b.y > H - 50 && b.y < H - 50 + PLAYER_H) {
                lives--;
                sfxExplode();
                if (lives <= 0) { dead = true; sfxGameOver(); onGameOver(score); }
                return false;
            }
            return true;
        });

        // Aliens reach bottom
        if (alive.some(a => a.y + ALIEN_H >= H - 50)) {
            dead = true; sfxGameOver(); onGameOver(score);
        }

        // Level clear
        if (alive.length === 0) { sfxLevelUp(); initAliens(); }
    }

    function drawAlien(a) {
        if (!a.alive) return;
        const color = ALIEN_COLORS[a.row];
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;

        // Alien body (simple pixel art)
        fillRect(ctx, a.x + 8, a.y, 16, 8, color);
        fillRect(ctx, a.x + 4, a.y + 8, 24, 8, color);
        fillRect(ctx, a.x, a.y + 16, 8, 8, color);
        fillRect(ctx, a.x + 24, a.y + 16, 8, 8, color);
        // Antennae
        if (a.frame % 2 === 0) {
            fillRect(ctx, a.x + 2, a.y - 4, 4, 4, color);
            fillRect(ctx, a.x + 26, a.y - 4, 4, 4, color);
        } else {
            fillRect(ctx, a.x + 0, a.y - 2, 4, 4, color);
            fillRect(ctx, a.x + 28, a.y - 2, 4, 4, color);
        }
        ctx.shadowBlur = 0;
    }

    function draw() {
        clearCanvas(ctx, '#000005');

        // Stars
        ctx.fillStyle = '#ffffff33';
        for (let i=0; i<40; i++) {
            ctx.fillRect((i * 113) % W, (i * 97 + lastTime * 0.01) % H, 1, 1);
        }

        // Player ship
        const px = playerX;
        ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 12;
        fillRect(ctx, px + 16, H - 55, 8, 12, '#00ff88');  // nose
        fillRect(ctx, px,      H - 43, PLAYER_W, 8, '#00ff88');  // body
        fillRect(ctx, px - 8,  H - 38, PLAYER_W + 16, 6, '#00ff88'); // wings
        ctx.shadowBlur = 0;

        // Bullets
        bullets.forEach(b => {
            ctx.shadowColor = '#fff'; ctx.shadowBlur = 6;
            fillRect(ctx, b.x, b.y, BULLET_W, BULLET_H, '#fff');
        });
        ctx.shadowBlur = 0;

        // Alien bullets
        alienBullets.forEach(b => {
            fillRect(ctx, b.x - 2, b.y, 4, 10, '#ff0000');
        });

        // Aliens
        aliens.forEach(drawAlien);

        // HUD
        drawText(ctx, `SCORE: ${score}`, W/2, 20, '#00ff88', 10);
        drawText(ctx, `LIVES: ${lives}`, 60, 20, '#fff', 10);

        if (dead) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, W, H);
            drawText(ctx, 'GAME OVER', W/2, H/2, '#ff00aa', 26);
        }
    }

    function loop(time) {
        const dt = time - lastTime;
        lastTime = time;
        update(dt);
        draw();
        raf = requestAnimationFrame(loop);
    }

    initAliens();
    raf = requestAnimationFrame(loop);

    return () => {
        cancelAnimationFrame(raf);
        clearKeys();
    };
}
