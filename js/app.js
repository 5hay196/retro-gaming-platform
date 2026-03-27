/**
 * @file app.js
 * Retro Arcade Platform — main application controller.
 * Handles menu routing, game lifecycle, high score persistence (localStorage).
 */

import { start as startPong }          from './games/pong.js';
import { start as startTetris }        from './games/tetris.js';
import { start as startSnake }         from './games/snake.js';
import { start as startBreakout }      from './games/breakout.js';
import { start as startSpaceInvaders } from './games/space-invaders.js';

// ---- Game registry ----
const GAMES = {
    'pong':           { fn: startPong,          hint: 'Arrow Up / Down — first to 7 wins' },
    'tetris':         { fn: startTetris,         hint: 'Arrows: Move & Rotate | Down: Fast drop' },
    'snake':          { fn: startSnake,          hint: 'Arrow Keys — eat food, avoid walls & yourself' },
    'breakout':       { fn: startBreakout,       hint: 'Arrow Keys — break all bricks' },
    'space-invaders': { fn: startSpaceInvaders,  hint: 'Left/Right to move | Space to shoot' }
};

// ---- High Scores (localStorage) ----
const HS_KEY = 'retro-arcade-highscores';

/** @returns {Record<string, number>} */
function loadHighScores() {
    try {
        const data = JSON.parse(localStorage.getItem(HS_KEY)) || {};
        // Validate that all values are numbers
        for (const key in data) {
            if (typeof data[key] !== 'number') delete data[key];
        }
        return data;
    }
    catch(_) { return {}; }
}

// ---- Service Worker ----
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW failed', err));
    });
}

/** @param {Record<string, number>} scores */
function saveHighScores(scores) {
    localStorage.setItem(HS_KEY, JSON.stringify(scores));
}

// ---- DOM refs ----
const $menu       = document.getElementById('menu-screen');
const $gameScreen = document.getElementById('game-screen');
const $canvas     = document.getElementById('game-canvas');
const $overlay    = document.getElementById('game-over-overlay');
const $backBtn    = document.getElementById('back-btn');
const $hint       = document.getElementById('control-hint');
const $scoreVal   = document.getElementById('score-val');
const $finalScore = document.getElementById('final-score');
const $newRecord  = document.getElementById('new-record-msg');
const $playAgain  = document.getElementById('play-again-btn');
const $menuBtn    = document.getElementById('menu-btn');
const $hudScore   = document.getElementById('hud-score');
const $app        = document.getElementById('app');

let currentGame = null;
let cleanupFn   = null;
let scores      = loadHighScores();

// ---- Render high scores on menu ----
function refreshHighScoreDisplay() {
    Object.keys(GAMES).forEach(id => {
        const el = document.getElementById(`hs-${id}`);
        if (el) el.textContent = scores[id] || 0;
    });
}

// ---- Launch a game ----
function launchGame(gameId) {
    const entry = GAMES[gameId];
    if (!entry) return;

    currentGame = gameId;
    $app.dataset.currentGame = gameId;

    // Hide menu, show game
    $menu.classList.add('hidden');
    $gameScreen.classList.remove('hidden');
    $backBtn.classList.remove('hidden');
    $hudScore.classList.remove('hidden');
    $hint.textContent = entry.hint;
    $scoreVal.textContent = '0';

    cleanupFn = entry.fn(
        $canvas,
        // onScore
        (score) => { $scoreVal.textContent = score; },
        // onGameOver
        (score) => {
            const hs = loadHighScores();
            const isNew = score > (hs[gameId] || 0);
            if (isNew) { hs[gameId] = score; saveHighScores(hs); scores = hs; refreshHighScoreDisplay(); }
            $finalScore.textContent = score;
            $newRecord.classList.toggle('hidden', !isNew);
            $overlay.classList.remove('hidden');
        }
    );
}

// ---- Return to menu ----
function goToMenu() {
    if (cleanupFn) { cleanupFn(); cleanupFn = null; }
    currentGame = null;
    $app.dataset.currentGame = '';
    $gameScreen.classList.add('hidden');
    $overlay.classList.add('hidden');
    $backBtn.classList.add('hidden');
    $hudScore.classList.add('hidden');
    $menu.classList.remove('hidden');
    refreshHighScoreDisplay();
}

// ---- Event listeners ----
document.querySelectorAll('.game-card').forEach(card => {
    const launch = () => launchGame(card.dataset.game);
    card.addEventListener('click', launch);
    card.addEventListener('keydown', e => { if (e.code === 'Enter' || e.code === 'Space') launch(); });
});

$backBtn.addEventListener('click', goToMenu);
$menuBtn.addEventListener('click', goToMenu);
$playAgain.addEventListener('click', () => {
    $overlay.classList.add('hidden');
    if (cleanupFn) { cleanupFn(); cleanupFn = null; }
    launchGame(currentGame);
});

// ---- Init ----
refreshHighScoreDisplay();
