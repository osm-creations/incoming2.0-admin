# incoming2.0-admin — Git push workflow

Create an empty GitHub repository named `incoming2.0-admin`, then from the project directory:

```bash
git init
git branch -M main
git add .
git commit -m "Initial Incoming 2.0 admin"
git remote add origin https://github.com/YOUR_USERNAME/incoming2.0-admin.git
git push -u origin main
```

For later updates:

```bash
git add .
git commit -m "Describe the admin change"
git push origin main
```

Once connected to Cloudflare Pages, pushes to `main` can trigger the production deployment automatically.
