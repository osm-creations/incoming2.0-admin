# incoming2.0-admin — GitHub → Cloudflare Pages production setup

## 1. Push the repository

GitHub repository name:

`incoming2.0-admin`

The repository should contain the React/Vite source; do not commit `dist`, `.env` or `node_modules`.

## 2. Create the Cloudflare Pages project

Cloudflare Dashboard → Workers & Pages → Create application → Pages → Import an existing Git repository.

Select:

`incoming2.0-admin`

Use these production build settings:

- Production branch: `main`
- Root directory: `/`
- Build command: `npm run build`
- Build output directory: `dist`

## 3. Set the production API URL

Pages project → Settings → Environment variables.

Add:

`VITE_API_BASE = https://incoming.yourdomain.com`

This is the public Worker origin, not a secret. Never put passwords, JWT signing secrets or Cloudflare API tokens in a `VITE_` variable because Vite exposes such values to browser code.

## 4. Add the admin custom domain

Recommended example:

`admin.incoming.yourdomain.com`

After the admin domain is active, the server repository must have exactly this origin in `ALLOWED_ORIGINS`:

`ALLOWED_ORIGINS = "https://admin.incoming.yourdomain.com"`

Then push the server change so the Worker redeploys with the correct CORS allowlist.

## 5. Normal production updates

After Git integration is configured, updates are deployed from GitHub:

```bash
git add .
git commit -m "Update admin"
git push origin main
```

Cloudflare Pages will rebuild the Vite application and publish `dist` automatically.
