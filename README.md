# Retro Arcade Platform

A unified browser-based gaming platform featuring 5 classic arcade games recreated in vanilla HTML5, CSS3, and JavaScript (ES6+).

## Games Included

1. **Pong** - Classic 2-player paddle action vs AI
2. **Tetris** - Full implementation with rotation, scoring, and levels
3. **Snake** - Grid-based movement with growing mechanics
4. **Breakout** - Brick-breaking physics with paddle control
5. **Space Invaders** - Alien waves, shooting mechanics, and boss levels

## Features

- **Zero Dependencies**: Pure vanilla JS/CSS/HTML implementation
- **Web Audio API**: Procedurally generated 8-bit sound effects (no external assets required)
- **High Scores**: LocalStorage persistence for all games
- **Responsive Design**: Adapts to different screen sizes with CRT scanline effects
- **Modular Architecture**: Clean separation of game logic, rendering, and input handling

## Installation

Since this is a static web application, no build process is required.

1. Clone the repository:
   ```bash
   git clone https://github.com/5hay196/retro-gaming-platform.git
   ```
2. Navigate to the directory:
   ```bash
   cd retro-gaming-platform
   ```
3. Serve the files using any static file server (e.g., Python):
   ```bash
   python3 -m http.server 8000
   ```
4. Open `http://localhost:8000` in your browser.

## Controls

| Game | Controls | Action |
|------|----------|--------|
| **Global** | `Enter` / `Space` | Select Game / Start |
| **Pong** | `↑` / `↓` | Move Paddle |
| **Tetris** | `←` / `→` / `↑` / `↓` | Move / Rotate / Soft Drop |
| **Snake** | Arrow Keys | Change Direction |
| **Breakout** | `←` / `→` | Move Paddle |
| **Space Invaders** | `←` / `→`, `Space` | Move, Shoot |

## License

MIT
