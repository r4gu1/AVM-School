# App1

A minimal React app created with Vite, including a Tailwind-based login page and a small demo Express server that issues JWTs.

Quick start (PowerShell):

```powershell
Set-Location -Path "D:\admin\ragul\project\ProU\App1"
# Install client deps
npm install

# Install server deps (in a separate terminal or after the client install)
Set-Location -Path "D:\admin\ragul\project\ProU\App1\server"
npm install

# Run the demo auth server (server runs on port 4000)
npm start

# In another terminal: run the client dev server
Set-Location -Path "D:\admin\ragul\project\ProU\App1"
npm run dev
```

Notes
- Demo credentials: username `demo`, password `password`.
- The client posts to `/api/login` and expects the server at the same origin; during development Vite will proxy requests to the server if you configure it, otherwise run the server and use an absolute URL or set up a proxy.

Tailwind
- Tailwind is configured via `tailwind.config.cjs` and `postcss.config.cjs`. After installing dependencies the Tailwind directives in `src/index.css` will be processed by Vite.

Server
- A minimal Express server is in `server/index.js`. It returns a signed JWT for the demo credentials and validates it on `/api/protected`.

Security note
- This demo uses a simple hard-coded secret and user for demonstration only. Do not use this in production. Replace `JWT_SECRET` with a secure secret, store users in a database, and follow best practices for refresh tokens and secure storage of JWTs.
