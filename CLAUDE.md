# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a simple static website for saleem.net - a personal website with a single HTML file that serves as a landing page. The site features a minimalist design with a link to an external game.

## Architecture

- **Single-file static site**: The entire website consists of one HTML file (`index.html`)
- **Self-contained styling**: CSS is embedded directly in the HTML file
- **No build process**: Direct deployment of static HTML
- **No dependencies**: Pure HTML/CSS without external libraries or frameworks

## Development

Since this is a static HTML site with no build tools or package managers:

- **Local development**: Open `index.html` directly in a browser
- **Editing**: Modify `index.html` directly for any changes
- **No compilation needed**: Changes are immediately visible when refreshing the browser

## Deployment

This appears to be deployed to a staging environment, as indicated by the git branch `staging` and the staging comment at the end of the HTML file.

## File Structure

```
/
├── index.html          # Main landing page with embedded CSS
└── CLAUDE.md          # This file
```

## Recent Changes

Based on git history, the Emera Game was recently moved to a separate repository (`neon-snake-game`), leaving this as a simple landing page that links to the external game.