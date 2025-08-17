# saleem.net

A minimalist personal website featuring a retro project showcase with redirect-based analytics.

## Overview

This is a static website that displays projects in a clean, terminal-inspired design. Each project is displayed as a bordered tile that links to external URLs through a redirect system for analytics tracking.

## Architecture

- **Frontend**: Vanilla HTML/CSS/JavaScript (no build tools required)
- **Backend**: Static files with server-side redirects via Nginx
- **Analytics**: Server log analysis via redirect tracking
- **Deployment**: Direct file serving (index.html + assets)

## File Structure

```
/
├── index.html              # Main landing page
├── assets/
│   ├── styles.css         # All styling and responsive design
│   └── app.js             # Project loading and interaction logic
├── data/
│   └── projects.json      # Project data (edit this to add/remove projects)
├── CLAUDE.md              # Instructions for Claude Code AI assistant
└── README.md              # This file
```

## Adding New Projects

### 1. Edit Project Data

Edit `/data/projects.json` to add your new project:

```json
[
  {
    "id": "project-slug",
    "collapsed": [
      "Project Name",
      "Short description line",
      "Another detail line"
    ],
    "expanded": [
      "More details shown on hover",
      "Additional information"
    ],
    "visible": true
  }
]
```

**Project Fields:**
- `id`: URL-safe identifier (used in redirect URLs like `/r/project-slug`)
- `collapsed`: Array of text lines shown by default (3-4 lines recommended)
- `expanded`: Array of additional text lines shown on hover/focus (optional)
- `visible`: Boolean to show/hide project (set to `false` to temporarily hide)

### 2. Configure Server Redirect

Add a redirect mapping in your Nginx configuration. Edit `/etc/nginx/snippets/project_redirects.map`:

```nginx
# Add this line for your new project:
/r/project-slug    https://example.com/your-project-url;
```

### 3. Test and Apply

```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx to apply changes
sudo systemctl reload nginx
```

## Analytics Setup

### Server Configuration

The site uses redirect-based analytics. When users click project tiles, they go to `/r/project-id` which redirects to the actual project URL, allowing server logs to track clicks.

#### Nginx Configuration

Create `/etc/nginx/snippets/project_redirects.map`:

```nginx
map $uri $project_target {
    default "";
    
    # Projects (add one line per project)
    /r/emera-game    https://saleem.net/emera-game;
    /r/other-project https://example.com/project;
}
```

Add to your site configuration:

```nginx
# Include the redirects map
include /etc/nginx/snippets/project_redirects.map;

# Redirect handler
location ~ ^/r/ {
    if ($project_target = "") { return 404; }
    return 302 $project_target;
}
```

#### Optional: Enhanced Logging

For better analytics, create `/etc/nginx/snippets/labs_logging.conf`:

```nginx
log_format labs_combined '$remote_addr - $remote_user [$time_local] '
                         '"$request" $status $body_bytes_sent '
                         '"$http_referer" "$http_user_agent"';
```

### Analytics Tools

#### GoAccess (Recommended)

Install and generate reports:

```bash
# Install
sudo apt-get update && sudo apt-get install -y goaccess

# Generate analytics report
sudo goaccess /var/log/nginx/access.log \
  --log-format=COMBINED \
  --ignore-crawlers \
  -o /var/www/saleem.net/analytics.html

# View at https://saleem.net/analytics.html
```

#### Quick Command Line Stats

```bash
# Total page views
sudo grep 'GET / ' /var/log/nginx/access.log | wc -l

# Project clicks (example)
sudo grep 'GET /r/emera-game' /var/log/nginx/access.log | wc -l

# Unique IPs today
sudo grep "$(date +%d/%b/%Y)" /var/log/nginx/access.log | cut -d' ' -f1 | sort -u | wc -l
```

## Development

### Local Development

Since this is a static site, you can:

1. **Simple**: Open `index.html` directly in a browser
2. **With server**: Use any local server (Python, Node.js, etc.)

```bash
# Python 3
python -m http.server 8000

# Node.js (if you have http-server installed)
npx http-server
```

### Theme System

The site includes multiple color themes accessible via:
- **Keyboard**: Left/Right arrow keys
- **Touch**: Swipe left/right
- **Themes**: Black (default), Green (CRT), Blue (DOS)

Themes are defined in `assets/styles.css` under the theme system section.

### Responsive Design

The design automatically adapts to different screen sizes:
- **Mobile**: Single column, smaller text
- **Tablet**: Adaptive columns
- **Desktop**: Multi-column grid when 4+ projects

## Deployment

### Static Hosting

Deploy the entire directory to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Traditional web hosting

### Server Requirements

For analytics and redirects, you need:
- Web server with redirect capability (Nginx recommended)
- Log file access for analytics
- Ability to edit server configuration

## Troubleshooting

### Common Issues

1. **Projects not showing**: Check `data/projects.json` syntax with a JSON validator
2. **Redirects not working**: Verify Nginx configuration and reload
3. **Analytics missing**: Check log file permissions and paths
4. **Mobile layout issues**: Test on actual devices, not just browser resize

### Debug Mode

Add to browser console to debug project loading:

```javascript
// Check if projects loaded
console.log(window.labsApp?.projects);

// Check current theme
console.log(document.body.className);
```

## Security Notes

- Analytics files contain IP addresses - consider privacy implications
- Log rotation recommended for long-term deployments
- Bot filtering available in Nginx configuration
- No sensitive data should be stored in project data

## Contributing

This is a personal website, but the structure can be adapted for other project showcases. Key files to modify:
- `data/projects.json` for content
- `assets/styles.css` for styling
- `assets/app.js` for functionality

---

For questions or issues, refer to the git commit history or check server logs for debugging information.