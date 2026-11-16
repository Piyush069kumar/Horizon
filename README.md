# Horizon — Client Project Dashboard

Full-stack TypeScript implementation for the Horizon Client Project Dashboard. Built with Node.js, Express, Prisma ORM, PostgreSQL, Socket.IO, node-cron, React, Vite, TanStack Query, Zustand, and Tailwind CSS.

---

## 🚀 Quick Start Guide

### 1. Environment Configuration
Ensure `.env` files are present in the project root and `server/`:
```bash
cp .env.example .env
cp .env.example server/.env
```

### 2. Start PostgreSQL via Docker
```bash
docker compose up -d
```

### 3. Install Dependencies & Setup Database
```bash
# Install workspace packages
npm install

# Push Prisma schema and seed initial data
cd server
npm run prisma:push
npm run seed
cd ..
```

### 4. Run Development Servers
```bash
npm run dev
```
* **Frontend**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Credentials

Development Password for all demo accounts: **`Password123!`**

| Role | Email | Scope |
| :--- | :--- | :--- |
| **Admin** | `admin@horizon.demo` | Unrestricted global access to all clients, projects, tasks, and users |
| **Project Manager 1** | `pm1@horizon.demo` | Manages Website Redesign & Mobile App projects |
| **Project Manager 2** | `pm2@horizon.demo` | Manages Enterprise ERP System project |
| **Developer 1** | `dev1@horizon.demo` | Assigned to tasks in Website Redesign & Mobile App |
| **Developer 2** | `dev2@horizon.demo` | Assigned to tasks in Website Redesign |
| **Developer 3** | `dev3@horizon.demo` | Assigned to tasks in Mobile App |
| **Developer 4** | `dev4@horizon.demo` | Assigned to tasks in Enterprise ERP System |

---

## 🧪 Testing

Run the automated integration test suite:
```bash
cd server
npm run test
```
