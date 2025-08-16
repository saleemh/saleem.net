# Site Configuration Instructions

This document contains instructions for configuring Nginx to support the ASCII Labs page with redirect-based analytics. These commands should be run by a user with sudo privileges.

## 1. Create Project Redirects Map

Create the redirect map file:

```bash
sudo nano /etc/nginx/snippets/project_redirects.map
```

Add the following content:

```nginx
# Maps the incoming request URI to a target URL.
# Keep this file in sync with your projects. One line per project.
# NOTE: Use absolute URLs as values.

map $uri $project_target {
    default "";

    # --- Projects ---
    /r/emera-game    https://saleem.net/emera-game;

    # Add more projects here as needed:
    # /r/project-name  https://example.com/project-url;
}
```

## 2. Update Nginx Site Configuration

Edit the site configuration:

```bash
sudo nano /etc/nginx/sites-available/saleem.net
```

Add the following to your HTTPS server block (after any existing includes):

```nginx
# Include the redirects map
include /etc/nginx/snippets/project_redirects.map;

# Redirect handler for /r/<id>
location ~ ^/r/ {
    if ($project_target = "") { return 404; }
    return 302 $project_target;
}
```

## 3. Optional: Custom Log Format for Better Analytics

Add this to `/etc/nginx/nginx.conf` in the `http` block or create a separate snippets file:

```bash
sudo nano /etc/nginx/snippets/labs_logging.conf
```

Content:

```nginx
log_format labs_combined '$remote_addr - $remote_user [$time_local] '
                         '"$request" $status $body_bytes_sent '
                         '"$http_referer" "$http_user_agent"';
```

Then include this in your site config:

```nginx
include /etc/nginx/snippets/labs_logging.conf;
access_log /var/log/nginx/access.log labs_combined;
```

## 4. Optional: Bot Filtering

To filter out bots from analytics, add this to your site config:

```nginx
map $http_user_agent $is_bot {
    default 0;
    ~*(bot|crawler|spider|slurp|bingpreview|yandex|ahrefs|semrush) 1;
}

location ~ ^/r/ {
    if ($is_bot) { return 403; }
    if ($project_target = "") { return 404; }
    return 302 $project_target;
}
```

## 5. Test and Apply Configuration

Test the configuration:

```bash
sudo nginx -t
```

If successful, reload Nginx:

```bash
sudo systemctl reload nginx
```

## 6. Install and Configure GoAccess for Analytics

Install GoAccess:

```bash
sudo apt-get update
sudo apt-get install -y goaccess
```

Generate analytics report (run as needed):

```bash
sudo goaccess /var/log/nginx/access.log \
  --log-format=COMBINED \
  --ignore-crawlers \
  -o /var/www/saleem.net/analytics.html
```

Or if using custom log format:

```bash
sudo goaccess /var/log/nginx/access.log \
  --log-format='%h - %^ [%d:%t %^] "%r" %s %b "%R" "%u"' \
  --date-format=%d/%b/%Y \
  --time-format=%H:%M:%S \
  --ignore-crawlers \
  -o /var/www/saleem.net/analytics.html
```

## 7. Adding New Projects

When adding new projects:

1. Update `/var/www/saleem.net/data/projects.json` with the new project data
2. Add the redirect mapping to `/etc/nginx/snippets/project_redirects.map`:
   ```nginx
   /r/new-project-id    https://example.com/new-project-url;
   ```
3. Test and reload Nginx:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

## 8. Viewing Analytics

### Quick Stats via Command Line

Page views (visits to main page):
```bash
sudo grep 'GET / ' /var/log/nginx/access.log | wc -l
```

Project clicks (example for emera-game):
```bash
sudo grep 'GET /r/emera-game' /var/log/nginx/access.log | wc -l
```

### Full Dashboard

Visit `https://saleem.net/analytics.html` (if you generated the report) or keep the file local for private viewing.

## Troubleshooting

1. **404 errors on /r/ paths**: Check that the project_redirects.map file exists and has the correct syntax
2. **Redirects not working**: Verify Nginx config includes the map file and reload Nginx
3. **Analytics not showing**: Check that access.log exists and has proper permissions
4. **Bot filtering too aggressive**: Review the bot detection patterns and adjust as needed

## Security Notes

- The analytics.html file contains access log data - consider whether to expose it publicly
- Log files contain IP addresses and user agents - handle according to your privacy policy
- Bot filtering is optional but recommended for cleaner analytics