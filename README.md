# SendResQPls — Admin Dashboard

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)

Web dashboard for **MDRRMO Balayan**. It is the command center of the **SendResQPls** disaster response system, used for real-time incident monitoring, multi-department dispatch coordination, analytics, and report generation.

---

## Features

- **Secure Admin Access**: Sign-in with email verification and password recovery
- **Live Dashboard**: Real-time incident feed with status counters
- **Incident Management**: Pending → Reviewing → Dispatched → Resolved / Rejected workflow, with protection against two admins dispatching the same incident
- **Interactive Map**: Incident locations with click-to-focus navigation
- **Analytics**: Daily, weekly, and monthly trends, hazard distribution, and resolution rates
- **AI Recommendations**: Severity ranking and suggested response actions
- **Department Management**: BFP, PNP, Medical, Engineering, and Rescue
- **Admin User Management**: Create, deactivate, and remove admin accounts
- **Report Export**: Downloadable DOCX incident reports
- **Activity Log**: Chronological audit trail of admin actions

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5 |
| Build Tool | Vite |
| Styling | Tailwind CSS 4 |
| Maps | Leaflet |
| Charts | Recharts |

---

## Getting Started

**Prerequisites:** Node.js >= 18, npm >= 9

```bash
npm install
npm run dev       # development server
npm run build     # production build
npm run preview   # preview production build
```

> Configuration values are provided by the project maintainers and must never be committed to version control.

---

## License

Developed for **MDRRMO Balayan** as part of the SendResQPls disaster response system. All rights reserved.
