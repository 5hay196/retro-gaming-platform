# Warp AI Rules for Gaming Platform

## Project Context

This is a web-based gaming platform built with vanilla HTML5, CSS3, and JavaScript (ES6+). It provides a framework for browser-based games with shared utilities, audio management, and consistent styling.

## Technology Stack

- **Language:** JavaScript (ES6+)
- **Frontend:** Vanilla HTML5, CSS3 (no frameworks)
- **Audio:** Web Audio API
- **Build Tool:** None (static files, consider Vite for future)
- **Server:** Any static file server (Python http.server, http-server, Live Server)

## Code Style & Conventions

- Use ES6+ features (modules, classes, arrow functions, template literals)
- Use `const` and `let`, never `var`
- Use camelCase for variables and functions
- Use PascalCase for classes
- Use descriptive variable names (e.g., `audioEngine` not `ae`)
- Add JSDoc comments for public functions and classes

### JavaScript Example:
```javascript
/**
 * Load and play an audio file
 * @param {string} fileName - Name of audio file
 * @param {object} options - Playback options
 * @returns {Promise<void>}
 */
async function playSound(fileName, options = {}) {
    // Implementation
}
```

## Architecture Patterns

- **Modular Design:** Each game is a separate module in `js/games/`
- **Separation of Concerns:** HTML structure, CSS styling, JS behavior are separate
- **Component-Based:** Reusable utilities and engines (audio, utils)
- **ES6 Modules:** Use import/export for code organization

### Key Design Decisions:
1. No framework dependency - keeps it lightweight and educational
2. Modular game architecture - easy to add new games
3. Shared audio engine - consistent sound management
4. CSS custom properties for theming

## File Organization

- **HTML files:** Root level (`index.html`)
- **CSS:** `css/` directory
  - `main.css` - Platform-wide styles
  - `games.css` - Game-specific styles
- **JavaScript:** `js/` directory
  - `app.js` - Main application entry
  - `audio-engine.js` - Audio management
  - `utils.js` - Utility functions
  - `games/` - Individual game modules
- **Assets:** `assets/` directory
  - Subdirectories by type (images, sounds, fonts)
- **Documentation:** `docs/` directory

## Development Workflow

1. Create feature branch if using git
2. Make changes to relevant files
3. Test in multiple browsers (Chrome, Firefox, Safari)
4. Check browser console for errors
5. Validate HTML/CSS if possible
6. Update documentation if needed
7. Commit with descriptive messages

## Important Commands

```bash
# Start Python web server
python3 -m http.server 8000

# Start Node.js server (if available)
npx http-server -p 8000

# Open in browser
xdg-open http://localhost:8000  # Linux
open http://localhost:8000      # macOS
```

## Testing Requirements

- Test in Chrome/Chromium
- Test in Firefox
- Test in Safari (if available)
- Check browser console for errors
- Verify audio playback works
- Test on different screen sizes

No automated testing framework currently. Consider adding:
- Jest for unit tests
- Playwright or Cypress for E2E tests

## Dependencies

**Current:** None (vanilla JavaScript)

**Potential Future Dependencies:**
- Build tool: Vite or Webpack (for production optimization)
- Testing: Jest, Playwright
- Linting: ESLint
- Formatting: Prettier

Only add dependencies if they provide clear value. Keep the platform lightweight.

## Adding New Games

1. Create `js/games/my-game.js`:
   ```javascript
   export class MyGame {
       constructor(canvas) {
           this.canvas = canvas;
           this.ctx = canvas.getContext('2d');
       }
       
       start() {
           // Initialize game
       }
       
       update(deltaTime) {
           // Update game state
       }
       
       render() {
           // Draw game
       }
   }
   ```

2. Add styles in `css/games.css`

3. Register in `js/app.js`

4. Add documentation in README

## Browser Compatibility

- Target modern browsers (ES6+ support)
- Use feature detection for advanced APIs
- Provide fallbacks for older browsers if needed
- Test on multiple platforms

## Performance Guidelines

- Use `requestAnimationFrame` for game loops
- Minimize DOM manipulations
- Use CSS transforms for animations
- Optimize images (WebP, compressed)
- Lazy load assets when possible
- Profile with browser DevTools

## Common Issues

### CORS Errors
- Always use a web server, don't open HTML files directly
- Ensure all resources are served from same origin

### Audio Not Playing
- User interaction required before audio can play (browser security)
- Add a "Start" button that initializes audio

### Performance Issues
- Check for memory leaks in game loops
- Use Chrome DevTools Performance tab
- Optimize canvas rendering

## Resources

- [MDN Web Docs](https://developer.mozilla.org/)
- [HTML5 Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## Future Enhancements

- Add build process (Vite)
- Implement game state persistence
- Add multiplayer capabilities (WebSockets)
- Create game editor/builder
- Add analytics and telemetry
- Improve mobile touch controls

---

**Last Updated:** 2026-02-16  
**Project Status:** In Development  
**Primary Use:** Educational/Personal
