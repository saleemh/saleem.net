// ASCII Labs Page - Main Application Logic

class LabsApp {
  constructor() {
    this.projects = [];
    this.currentTheme = 'black';
    this.themes = ['black', 'green', 'blue'];
    this.expandedTiles = new Set();
    
    this.init();
  }

  async init() {
    this.setupTheme();
    this.setupKeyboardNavigation();
    this.setupTouchNavigation();
    this.setupResizeHandler();
    await this.loadProjects();
    this.renderProjects();
  }

  setupTheme() {
    document.body.className = `theme-${this.currentTheme}`;
  }

  cycleTheme() {
    const currentIndex = this.themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.currentTheme = this.themes[nextIndex];
    this.setupTheme();
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        this.cycleTheme();
      }
    });
  }

  setupTouchNavigation() {
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    });

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        this.cycleTheme();
      }
    };
    
    this.handleSwipe = handleSwipe;
  }

  setupResizeHandler() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.renderProjects();
      }, 250);
    });
  }

  async loadProjects() {
    try {
      const response = await fetch('/data/projects.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.projects = data.filter(project => project.visible !== false);
    } catch (error) {
      console.error('Failed to load projects:', error);
      this.showError('Failed to load projects. Please try again later.');
    }
  }

  renderProjects() {
    const container = document.getElementById('tiles-container');
    if (!container) return;

    if (this.projects.length === 0) {
      container.innerHTML = '<div class="error">No projects available.</div>';
      return;
    }

    // Add has-many class for grid layout when 4+ projects
    const grid = document.getElementById('tiles-grid');
    if (grid && this.projects.length >= 4) {
      grid.classList.add('has-many');
    }

    const tilesHTML = this.projects.map(project => this.renderTile(project)).join('');
    container.innerHTML = `<div id="tiles-grid" class="tiles-grid ${this.projects.length >= 4 ? 'has-many' : ''}">${tilesHTML}</div>`;

    this.setupTileInteractions();
  }

  renderTile(project) {
    const content = this.generateTileContent(project);
    return `
      <a href="/r/${project.id}" class="tile" data-project-id="${project.id}" role="listitem">
        <div class="tile-content">${content}</div>
      </a>
    `;
  }

  generateTileContent(project) {
    const lines = [...project.collapsed];
    
    const contentLines = lines.map(line => {
      return line.length > 40 ? line.substring(0, 37) + '...' : line;
    });

    // Add empty lines to maintain consistent height
    while (contentLines.length < 4) {
      contentLines.push('');
    }

    return contentLines.join('\n');
  }

  generateExpandedContent(project) {
    const allLines = [...project.collapsed, ...(project.expanded || [])];
    
    const contentLines = allLines.map(line => {
      return line.length > 40 ? line.substring(0, 37) + '...' : line;
    });

    return contentLines.join('\n');
  }


  setupTileInteractions() {
    const tiles = document.querySelectorAll('.tile');
    
    tiles.forEach(tile => {
      const projectId = tile.dataset.projectId;
      const project = this.projects.find(p => p.id === projectId);
      
      if (!project || !project.expanded || project.expanded.length === 0) {
        return; // No expanded content available
      }

      // Desktop hover/focus
      tile.addEventListener('mouseenter', () => {
        this.expandTile(tile, project);
      });

      tile.addEventListener('mouseleave', () => {
        this.collapseTile(tile, project);
      });

      tile.addEventListener('focus', () => {
        this.expandTile(tile, project);
      });

      tile.addEventListener('blur', () => {
        this.collapseTile(tile, project);
      });

      // Touch interactions
      let touchTimer;
      let hasTapped = false;

      tile.addEventListener('touchstart', (e) => {
        if (!this.expandedTiles.has(projectId)) {
          e.preventDefault(); // Prevent immediate navigation
          this.expandTile(tile, project);
          hasTapped = true;
          
          // Set timer to collapse if no second tap
          touchTimer = setTimeout(() => {
            this.collapseTile(tile, project);
            hasTapped = false;
          }, 3000);
        }
      });

      tile.addEventListener('touchend', (e) => {
        if (hasTapped && this.expandedTiles.has(projectId)) {
          // Second tap - allow navigation
          clearTimeout(touchTimer);
          return true;
        }
      });
    });
  }

  expandTile(tile, project) {
    if (!project.expanded || project.expanded.length === 0) return;
    
    tile.classList.add('expanded');
    this.expandedTiles.add(project.id);
    
    const content = tile.querySelector('.tile-content');
    content.textContent = this.generateExpandedContent(project);
  }

  collapseTile(tile, project) {
    tile.classList.remove('expanded');
    this.expandedTiles.delete(project.id);
    
    const content = tile.querySelector('.tile-content');
    content.textContent = this.generateTileContent(project);
  }

  showError(message) {
    const container = document.getElementById('tiles-container');
    if (container) {
      container.innerHTML = `<div class="error">${message}</div>`;
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LabsApp();
});

// Handle theme switching info
document.addEventListener('DOMContentLoaded', () => {
  const info = document.createElement('div');
  info.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    font-size: 0.8rem;
    opacity: 0.6;
    pointer-events: none;
  `;
  info.textContent = 'Theme: ← → keys or swipe';
  document.body.appendChild(info);
});