# Nurturely — Modern Lead Management System & Sales CRM (MERN)

**Nurturely** is a maintainable, high-performance CRM built for managing prospective clients, sales pipelines, client interaction histories, and follow-up tasks for digital agencies, web development, SEO, and high-ticket B2B/B2C services.

The design language, responsive drawer navigation, and components are crafted to match the design system of **inquisitvemind** (`#D6451B` terracotta accent, soft slate neutrals, `academy-card` containers, smooth badges, and responsive drawers).

---

## Architecture Overview

```
Frontend (Windows)                      Backend (Ubuntu WSL / Render)
d:\Anti-Websitees\Nurturely             /home/rohit/nurturely-backend
├── Next.js 15 (App Router)             ├── Express.js 5 / Node.js 22
├── React 19                            ├── MongoDB Atlas (Mongoose 9)
├── Tailwind CSS v4                     ├── JWT (HTTP-only cookies + Bearer fallback)
├── TanStack React Query                ├── Nodemailer SMTP & Follow-up Scheduler
├── Framer Motion & Lucide/React Icons  ├── Role-based Access Control (Admin / Sales)
└── Zustand Store & Sonner Toasts       └── node:test automated test suite
```

---

## 1. Quick Start & Running Both Servers

### Backend (Ubuntu WSL)
The backend is located in Ubuntu WSL at `/home/rohit/nurturely-backend`.

```bash
# In Ubuntu WSL:
cd /home/rohit/nurturely-backend

# Start development server on port 5000:
npm start

# Run tests:
npm test

# (Optional) Seed demo leads, tasks, and users:
npm run seed
```

### Frontend (Windows)
The frontend resides in `d:\Anti-Websitees\Nurturely`.

```powershell
# In Windows PowerShell:
cd d:\Anti-Websitees\Nurturely

# Start development server on port 3002:
npm run dev
```

Open your browser at [http://localhost:3002](http://localhost:3002).

---

## 2. Environment Variables Configuration

### Backend (`/home/rohit/nurturely-backend/.env`)
```env
PORT=5000
NODE_ENV=development
Frontend_Url=http://localhost:3002

# MongoDB Atlas Connection URI
# Paste your MongoDB connection string here:
Mongoose_uri=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/nurturely?retryWrites=true&w=majority

# JWT Authentication Secrets
JWT_SECRET=nurturely_super_secure_jwt_secret_key_2026_dev
ACCESS_SECRET=nurturely_super_secure_access_secret_key_2026_dev
REFRESH_SECRET=nurturely_super_secure_refresh_secret_key_2026_dev

# SMTP Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=Nurturely CRM <no-reply@nurturely.io>
```

> **Note on Personal Data:** As requested, keep your personal MongoDB Atlas connection string and SMTP password inside `.env`. The backend has safe fallbacks so you can test routes and UI immediately before adding your personal connection string.

### Frontend (`d:\Anti-Websitees\Nurturely\.env.local`)
```env
NEXT_PUBLIC_API=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Nurturely
```

---

## 3. Demo Credentials (For Testing)

When seeded using `npm run seed`:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Admin** | `admin@nurturely.io` | `Password@123` | Full workspace leads, team management, analytics |
| **Sales** | `sales@nurturely.io` | `Password@123` | Assigned and created leads, task scheduler |

Quick-fill demo buttons are also integrated directly into the login page.

---

## 4. Key CRM Features

1. **Dashboard & Executive Analytics**
   - Live metrics: Total Leads, Open Pipeline Value, Won Revenue, Conversion Rate %, Follow-ups Due Today, Overdue Tasks.
   - Interactive pipeline distribution bar.
   - Channel breakdown (Website, Referral, WhatsApp, Social Media, Cold Outreach).
   - Real-time interaction timeline.

2. **Lead Management**
   - Full search by name, company, email, and phone.
   - Stage filter pills (`New`, `Contacted`, `Qualified`, `Proposal`, `Won`, `Lost`).
   - Priority and source filtering.
   - Server-side sorting and pagination.
   - Slide-over lead details drawer with overview and activity timeline.
   - Duplicate warning detection on email / phone input.

3. **Interactive Sales Pipeline (Kanban Board)**
   - 6 column stage workflow.
   - Live stage total value calculation.
   - Quick stage transitions.
   - Mandatory lost-reason capture when moving to `Lost`.

4. **Follow-ups & Task Reminders**
   - Filter by Today, Upcoming, Overdue, and Completed.
   - Background scheduler checks tasks due in the next 30 minutes.
   - Idempotent reminder dispatching (prevents duplicate emails).

5. **Role-Based Team Administration (Admin Only)**
   - Add/invite team members.
   - Workload analytics: active leads, won revenue deals, pending follow-ups.
   - Promote/demote roles between Admin and Sales.
   - Safe deactivation preventing removal of the last remaining Admin.
