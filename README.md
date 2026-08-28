# disaster-admin

MDRRMO Balayan Admin Dashboard — web-only, zero mobile code.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- shadcn/ui component primitives
- React Router, Axios, Recharts, Leaflet

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev
```

## Build & Deploy

```bash
npm run build          # outputs to dist/
```

Deploy to Vercel. The `vercel.json` handles SPA fallback routing.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `https://your-api.com/api`) |

## Routes

| Path | Page |
|---|---|
| `/` | Landing page |
| `/get-the-app` | App download page |
| `/admin/login` | Admin login |
| `/dashboard` | Live emergency dashboard |
| `/requests` | Incident request queue |
| `/requests/:id` | Request detail + triage |
| `/call-logs` | MDRRMO call log tracker |
| `/analytics` | Historical analytics + reports |
| `/departments` | Department management |
| `/settings` | Admin account settings |