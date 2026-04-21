# Production Deployment Guide: Static HTML Export (SSG)

This guide outlines the steps to deploy **Coptogram Docs** as a 100% static website. This is the most robust method for shared hosting like Hostinger as it requires no Node.js server to run.

## Step 1: Build the Project Locally

Run the build command to generate the static files:
```bash
npm run build
```
Next.js will generate a folder named `out` in your project root. This folder contains all your HTML, CSS, JavaScript, and Images.

## Step 2: Upload to Hostinger

1.  Log in to your **Hostinger hPanel**.
2.  Go to **Websites** > **Manage** (for your domain).
3.  Navigate to **Files** > **File Manager**.
4.  Go to your domain's root (usually `public_html`).
5.  Upload the **contents** of the `out` folder directly into `public_html`.

### Resulting Structure in File Manager:
```text
public_html/
├── _next/
├── ar/
├── en/
├── index.html
├── metadata.json
└── ... other files
```

## Step 3: Handle URL Prettying (Optional but Recommended)

Since this is a static export, Hostinger's standard Apache/Nginx configuration might show `.html` in the URL or return 404s on sub-pages if not configured.

Create a `.htaccess` file in your `public_html` to handle clean URLs:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Remove .html extension
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^([^/]+)/?$ $1.html [L]

  # Fallback for nested routes
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^([^/]+)/([^/]+)/?$ $1/$2.html [L]
</IfModule>
```

## Advantages of this Method
- **Zero Runtime Errors**: No Node.js "EEXIST" or "stdin" errors.
- **Speed**: Pure HTML served directly by Nginx/Apache.
- **Security**: No server-side code execution.
- **SEO**: Every section and item has its own pre-rendered HTML file with custom meta tags.

---
*Created for Coptogram Docs Static Migration.*
