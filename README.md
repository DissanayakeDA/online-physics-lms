# Learning Management System

A full-stack LMS built with **Next.js** (frontend) and **NestJS** (backend) in an [Nx](https://nx.dev) monorepo.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Backend | NestJS 11, Mongoose, Passport JWT |
| Database | MongoDB (local or Atlas) |
| Monorepo | Nx 22 |

---

## Prerequisites

- [Node.js](https://nodejs.org) v18 or later
- [npm](https://www.npmjs.com) v9 or later
- [MongoDB](https://www.mongodb.com) — local instance **or** a [MongoDB Atlas](https://cloud.mongodb.com) connection string

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Learning-Management-System
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

**Option A — Automated setup (Windows PowerShell)**

```powershell
npm run setup
```

This creates `apps/backend/.env` and `apps/frontend/.env.local` with default local values and creates the `uploads/` directory.

**Option B — Manual setup**

Create `apps/backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=lms-super-secret-key-change-in-production
ADMIN_EMAIL=admin@lms.com
ADMIN_PASSWORD=Admin@123
FRONTEND_URL=http://localhost:3000
PORT=3001

# Optional — SMTP config for OTP emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@edunova.com
```

Create `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

> **MongoDB Atlas:** Replace `MONGODB_URI` with your Atlas connection string.

### 4. Start MongoDB (local only)

If you're using a local MongoDB instance, start it before running the app:

```bash
mongod --dbpath C:\data\db
```

Skip this step if using MongoDB Atlas.

### 5. Run the development servers

Open **two terminals** and run each command in a separate one:

**Terminal 1 — Backend** (http://localhost:3001)

```bash
npm run dev:backend
```

**Terminal 2 — Frontend** (http://localhost:3000)

```bash
npm run dev:frontend
```

---

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api |

---

## Default Admin Credentials

| Field | Value |
|-------|-------|
| Email | `admin@lms.com` |
| Password | `Admin@123` |

---

## Build for Production

```bash
# Build backend
npm run build:backend

# Build frontend
npm run build:frontend
```

---

## Project Structure

```
Learning-Management-System/
├── apps/
│   ├── frontend/        # Next.js app
│   └── backend/         # NestJS API
├── uploads/             # Uploaded media files
├── setup.ps1            # Windows environment setup script
└── package.json
```
