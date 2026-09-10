# Solar B2B Platform - Kingsol

A clean, high-performance monorepo architecture for a B2B Solar Energy & Components platform built with React, TypeScript, Vite, Tailwind CSS, Node.js, Express, and Neon DB (PostgreSQL).

---

## 📁 Repository Structure

```
solar-b2b-app/
├── client/                  # Frontend Application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── assets/          # Static images & icons
│   │   ├── components/      # Shared components (Navbar, Footer, Layout)
│   │   ├── pages/           # Page view containers (Landing, Products)
│   │   ├── services/        # Axios API client modules
│   │   ├── types/           # TypeScript type definitions
│   │   ├── App.tsx          # React Router setup
│   │   └── main.tsx         # React app entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                  # Backend API (Express.js + TypeScript + Neon DB)
│   ├── src/
│   │   ├── config/          # Neon DB Pool configuration & environment vars
│   │   ├── controllers/     # Route logic handlers (Health check, etc.)
│   │   ├── routes/          # Express routing (/api/v1/health)
│   │   ├── middleware/      # Global middleware (CORS, Error Handling)
│   │   └── index.ts         # Express server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
└── README.md
```

---

## ⚡ Tech Stack & Tooling

- **Frontend (`/client`)**:
  - **Framework**: React + TypeScript (Vite)
  - **Styling**: Tailwind CSS (Utility-first with dark solar design palette)
  - **Icons**: Lucide React (`lucide-react`)
  - **Routing**: React Router DOM (`react-router-dom` v6)
  - **HTTP Client**: Axios with configured `baseURL` wrapper pointing to `/api/v1`

- **Backend (`/server`)**:
  - **Runtime & Language**: Node.js, Express.js, TypeScript
  - **Hot Reloading**: `ts-node-dev`
  - **Environment & Security**: `dotenv`, `cors`
  - **Database Connection**: `@neondatabase/serverless` PostgreSQL Pool readiness

---

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
cd server
npm install
npm run dev
```

The Express API server will start hot-reloading at **`http://localhost:5000`**.

Test the health check endpoint:
```bash
curl http://localhost:5000/api/v1/health
# Response: {"status":"healthy","timestamp":"2026-08-07T14:45:00.000Z"}
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The Vite dev server will launch at **`http://localhost:3000`**.

---

## 🔌 Environment Variables

Copy `server/.env.example` to `server/.env` and configure your Neon DB PostgreSQL instance:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@ep-sample.neon.tech/neondb?sslmode=require
NODE_ENV=development
```

---

## 📄 API Specifications

| Method | Endpoint | Description | Response Example |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | System health check | `{ "status": "healthy", "timestamp": "2026-08-07T14:45:00.000Z" }` |
