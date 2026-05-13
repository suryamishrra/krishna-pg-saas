# 🏠 Multi-Tenant PG & Mess Management SaaS Platform

A production-grade multi-tenant SaaS platform for PG accommodations — managing rooms, bookings, residents, payments, mess automation and billing under one roof with strict tenant isolation.

---

## 🔍 What it does

PG owners can manage their entire operations digitally — onboard residents, allocate rooms, automate mess schedules, handle payments, generate invoices and track everything from a single dashboard. Each tenant's data is completely isolated from others.

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, TailwindCSS |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Cache & Queues | Redis, BullMQ |
| Auth | JWT, RBAC |
| Deployment | Vercel |

---

## 🚀 Features

- **Multi-tenant architecture** — strict tenant_id based data isolation across all operations
- **Room & booking lifecycle** — allocation, check-in, check-out management
- **Subscription & billing engine** — plans, invoices, ledger entries, late fees and refunds
- **Mess automation** — meal scheduling and tracking per tenant
- **Async job processing** — webhooks, reminders and background tasks via Redis + BullMQ
- **Secure backend** — JWT authentication, role-based access control, rate limiting
- **Idempotent payment handling** — prevents duplicate transactions
- **Admin dashboard** — manage everything from one place

---

## 📈 Impact

- Reduced manual administrative effort by ~40%
- Improved system responsiveness by ~30% via async processing

---

## 📁 Project Structure
Multi-Tenant_PG_Mess_Management_SaaS_Platform/
├── backend/        # Node.js + Express API
├── frontend/       # React.js dashboard
├── docs/           # Documentation
└── package.json

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- MySQL
- Redis

### Run Backend
```bash
cd backend
npm install
npm start
```

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔗 Links

- 🌐 Live Demo: (https://krishna-pg-saas.vercel.app)
- 👨‍💻 Author: [Surya Prakash Mishra](https://github.com/suryamishrra)
