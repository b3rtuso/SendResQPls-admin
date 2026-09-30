# SendResQPls Admin Dashboard

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

Admin web dashboard for **MDRRMO Balayan** — the command-and-control interface for the **SendResQPls** disaster response platform. Provides real-time incident monitoring, multi-department dispatch coordination, analytics, and report generation.

---

## Overview

SendResQPls Admin is a single-page application built with React 19 and TypeScript. It connects to the [SendResQPls backend](https://sendresqpls.onrender.com) via REST and Server-Sent Events (SSE) to give MDRRMO Balayan administrators a live view of incoming disaster incidents, enabling rapid triage and coordinated response across multiple agencies.

---

## Features

### 🔐 Authentication
- Secure admin login with **JWT**-based sessions
- **Email OTP** verification for added security
- Self-service **password reset** flow

### 📡 Live Dashboard
- **Server-Sent Events (SSE)** for real-time incident feed — no manual refresh required
- At-a-glance incident summary cards with live status counters

### 🚨 Incident Management
- Full status workflow: **Pending → Reviewing → Dispatched → Resolved / Rejected**
- **Concurrent incident locking** — prevents two admins from simultaneously dispatching the same incident
- Incident detail view with responder assignment and notes

### 🗺️ Interactive Map
- **Leaflet** map with live incident location markers
- Click-to-focus navigation from incident list to map pin

### 📊 Analytics
- Trend charts: **daily / weekly / monthly** incident reports
- **Hazard type distribution** breakdown
- **Resolution rate** metrics
- Powered by **Recharts**

### 🏢 Department Management
- Manage response departments: **BFP, PNP, Medical, Engineering, Rescue**
- Configure department details and availability

### 👤 Admin User Management
- Create new admin accounts
- Deactivate or permanently delete admins

### 📄 Report Export
- Generate formatted **DOCX incident reports** via `docxtemplater` + `pizzip`
- Download directly from the browser with `file-saver`

### 📋 Activity Log
- Chronological audit trail of all admin actions

---

## Tech Stack

| Category | Library / Tool |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Routing | react-router-dom |
| HTTP Client | axios |
| Real-time | @microsoft/fetch-event-source (SSE) |
| Maps | leaflet + react-leaflet |
| Charts | recharts |
| Icons | lucide-react, react-icons |
| UI Primitives | @radix-ui |
| Class Utilities | clsx, tailwind-merge, class-variance-authority |
| Word Export | docxtemplater, pizzip, file-saver |
| Hosting | Vercel |

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x (or pnpm / yarn)
- A running instance of the SendResQPls backend

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/b3rtuso/SendResQPls-admin.git
cd SendResQPls-admin

# 2. Install dependencies
npm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Base URL of the SendResQPls backend API
VITE_API_URL=https://sendresqpls.onrender.com
```

> **Note:** All Vite environment variables must be prefixed with `VITE_` to be exposed to the client bundle.

When deploying to Vercel, add `VITE_API_URL` under **Project → Settings → Environment Variables**.

---

## Running Locally

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173` by default.

---

## Build & Deploy

### Production Build

```bash
npm run build        # Compiles and bundles to /dist
npm run preview      # Serves the production build locally for verification
```

### Deploying to Vercel

The repository is configured for zero-config deployment on Vercel:

1. Import the repository in the [Vercel dashboard](https://vercel.com/new).
2. Set the `VITE_API_URL` environment variable.
3. Vercel auto-detects Vite and runs `npm run build` with `/dist` as the output directory.
4. Every push to `main` triggers an automatic production deployment.

---

## Project Structure

```
src/
├── components/       # Shared UI components
├── pages/            # Route-level page components
│   ├── Dashboard/    # Live incident feed + SSE
│   ├── Incidents/    # Incident management & map
│   ├── Analytics/    # Charts and metrics
│   ├── Departments/  # Department management
│   ├── Admins/       # User management
│   └── ActivityLog/  # Audit trail
├── hooks/            # Custom React hooks
├── lib/              # API client (axios), utilities
├── types/            # Shared TypeScript types
└── main.tsx          # Application entry point
```

---

## License

This project was developed for **MDRRMO Balayan** as part of the SendResQPls disaster response system. All rights reserved.
