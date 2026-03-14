/**
 * @file tetris.js
 * Classic Tetris clone.
 * Canvas: 300 × 600 (10x20 grid, 30px blocks)
 * Controls: Arrows to move/rotate
 */

import { wasKeyPressed, isKeyDown, clearKeys, clearCanvas, fillRect, drawText } from '../utils.js';
import { sfxHit, sfxClear, sfxGameOver } from '../audio-engine.js';

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;
const W = COLS * BLOCK;
const H = ROWS * BLOCK;

const SHAPES = [
    [[1,1,1,1]],             // I
    [[1,1,1],[0,1,0]],       // T
    [[1,1,1],[1,0,0]],       // L
    [[1,1,1],[0,0,1]],       // J
    [[1,1],[1,1]],           // O
    [[0,1,1],[1,1,0]],       // S
    [[1,1,0],[0,1,1]]        // Z
];
const COLORS = [
    null,
    '#00f0f0', // I - cyan
    '#a000f0', // T - purple
    '#f0a000', // L - orange
    '#0000f0', // J - blue
    '#f0f000', // O - yellow
    '#00f000', // S - green
    '#f00000'  // Z - red
];

export function start(canvas, onScore, onGameOver) {
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    clearKeys();

    let grid = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    let score = 0;
    let gameOver = false;
    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;
    let raf;

    let piece = newPiece();

    function newPiece() {
        const id = Math.floor(Math.random() * SHAPES.length);
        const shape = SHAPES[id];
        return {
            shape,
            color: COLORS[id + 1],
            x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
            y: 0
        };
    }

    function collide(p, ox, oy) {
        for (let y = 0; y < p.shape.length; y++) {
            for (let x = 0; x < p.shape[y].length; x++) {
                if (p.shape[y][x] !== 0) {
                    let ny = p.y + y + oy;
                    let nx = p.x + x + ox;
                    if (nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && grid[ny][nx])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function merge() {
        piece.shape.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val) {
                    if (piece.y + y < 0) {
                        gameOver = true;
                        sfxGameOver();
                        onGameOver(score);
                        return;
                    }
                    grid[piece.y + y][piece.x + x] = piece.color;
                }
            });
        });
        if (gameOver) return;
        
        // Line clear
        let lines = 0;
        outer: for (let y = ROWS - 1; y >= 0; y--) {
            for (let x = 0; x < COLS; x++) {
                if (!grid[y][x]) continue outer;
            }
            grid.splice(y, 1);
            grid.unshift(Array(COLS).fill(0));
            lines++;
            y++; // Check same row again
        }

        if (lines > 0) {
            score += lines * 100 * lines; // 100, 400, 900, 1600
            sfxClear();
            onScore(score);
            dropInterval = Math.max(100, 1000 - Math.floor(score / 500) * 100);
        } else {
            sfxHit();
        }

        piece = newPiece();
        if (collide(piece, 0, 0)) {
            gameOver = true;
            sfxGameOver();
            onGameOver(score);
        }
    }

    function rotate(matrix) {
        const N = matrix.length;
        const M = matrix[0].length;
        let res = Array(M).fill().map(() => Array(N).fill(0));
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < M; x++) {
                res[x][N - 1 - y] = matrix[y][x];
            }
        }
        return res;
    }

    function update(dt) {
        if (gameOver) return;
        dropCounter += dt;

        // Input
        if (wasKeyPressed('ArrowLeft')) {
            if (!collide(piece, -1, 0)) piece.x--;
        }
        if (wasKeyPressed('ArrowRight')) {
            if (!collide(piece, 1, 0)) piece.x++;
        }
        if (wasKeyPressed('ArrowUp')) {
            const rotated = rotate(piece.shape);
            const oldShape = piece.shape;
            piece.shape = rotated;
            if (collide(piece, 0, 0)) piece.shape = oldShape; // Revert if invalid
        }
        if (isKeyDown('ArrowDown')) {
            dropCounter += dt * 10; // Fast drop
        }

        if (dropCounter > dropInterval) {
            dropCounter = 0;
            if (!collide(piece, 0, 1)) {
                piece.y++;
            } else {
                merge();
            }
        }
    }

    function draw() {
        clearCanvas(ctx, '#111');
        
        // Grid
        grid.forEach((row, y) => {
            row.forEach((color, x) => {
                if (color) {
                    fillRect(ctx, x * BLOCK, y * BLOCK, BLOCK, BLOCK, color, '#000', 2);
                } else {
                    ctx.strokeStyle = '#222';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
                }
            });
        });

        // Active piece
        if (!gameOver) {
            piece.shape.forEach((row, y) => {
                row.forEach((val, x) => {
                    if (val) {
                        const px = (piece.x + x) * BLOCK;
                        const py = (piece.y + y) * BLOCK;
                        fillRect(ctx, px, py, BLOCK, BLOCK, piece.color, '#000', 2);
                    }
                });
            });
        } else {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0,0,W,H);
            drawText(ctx, 'GAME OVER', W/2, H/2, '#fff', 30);
        }
    }

    function loop(time) {
        const dt = time - lastTime;
        lastTime = time;
        update(dt);
        draw();
        raf = requestAnimationFrame(loop);
    }
    
    raf = requestAnimationFrame(loop);

    return () => {
        cancelAnimationFrame(raf);
        clearKeys();
    };
}
