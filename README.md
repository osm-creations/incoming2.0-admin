# Repository: incoming2.0-admin

This repository contains the React/Vite administrator web application.

See `GIT_SETUP.md` for first-push and branch workflow instructions.

---

# Incoming 2.0 Admin

React + Vite + TypeScript admin console.

## Included
- Secure cookie-based admin login
- Automatic access-token refresh through the backend refresh cookie
- CSRF header on state-changing requests
- Dashboard counts/recent accounts
- User list/search
- Create magician/admin account
- Edit email/public user ID
- Enable/disable user
- Audit log
- Responsive dark Incoming-style UI

## Run locally
1. Start the backend first on `http://localhost:8787`.
2. Install dependencies:
```bash
npm install
```
3. Create local env:
```bash
cp .env.example .env
```
4. Run:
```bash
npm run dev
```
5. Open `http://localhost:5173`.

## Production
Set:
```env
VITE_API_BASE=https://incoming.your-domain.com
```
Then:
```bash
npm run build
```
Deploy the `dist/` directory to Cloudflare Pages or another static host.

### Backend requirement
Add the deployed admin origin to the backend `ALLOWED_ORIGINS`, e.g.
`https://admin.incoming.example.com`.

## Security notes
- The browser never receives the refresh token in JavaScript; it is HttpOnly.
- Do not move authentication tokens into localStorage.
- `VITE_*` values are public browser configuration. Never place secrets in them.
- Password-reset UI is intentionally not implemented yet; the backend schema is ready for it.
