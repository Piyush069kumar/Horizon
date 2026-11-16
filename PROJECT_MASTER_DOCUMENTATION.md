# Horizon Client Project Dashboard — Comprehensive Master Documentation

> **Complete architectural, functional, database, and codebase reference manual.**  
> Covers every file, component, endpoint, database model, security mechanism, real-time event, and capability in this repository.

---

## Table of Contents
1. [Executive Summary & Capabilities](#1-executive-summary--capabilities)
2. [Monorepo Architecture & Setup](#2-monorepo-architecture--setup)
3. [Complete File-by-File Inventory](#3-complete-file-by-file-inventory)
4. [Database Architecture & Data Models (Prisma)](#4-database-architecture--data-models-prisma)
5. [Authentication, Security & Token Lifecycle](#5-authentication-security--token-lifecycle)
6. [Role-Based Access Control (RBAC) Matrix](#6-role-based-access-control-rbac-matrix)
7. [Real-Time WebSocket Architecture (Socket.IO)](#7-real-time-websocket-architecture-socketio)
8. [Background Scheduling & Automation (node-cron)](#8-background-scheduling--automation-node-cron)
9. [Complete REST API Specification](#9-complete-rest-api-specification)
10. [Frontend Architecture, Pages & UI Components](#10-frontend-architecture-pages--ui-components)
11. [Configuration & Environment Variables](#11-configuration--environment-variables)
12. [Testing & Quality Assurance](#12-testing--quality-assurance)

---

## 1. Executive Summary & Capabilities

**Horizon Client Project Dashboard** is an enterprise-grade full-stack project and task management system engineered for multi-tenant software consultancies and product agencies. It connects **Clients**, **Projects**, **Tasks**, **Activity Audit Logs**, and **Notifications** under a strict **Role-Based Access Control (RBAC)** security perimeter.

### Core Capabilities
* **Role-Based Task Management**: Granular isolation where Developers only see/touch assigned tasks, Project Managers control their specific projects, and Admins supervise global organization health.
* **Bi-directional Real-time Collaboration**: Instant live task transitions, activity audit logging, and notification pushes via authenticated Socket.IO rooms.
* **Live User Presence Tracking**: Accurate multi-tab concurrent user connection counts broadcast in real-time.
* **Automated Overdue Task Tracking**: Hourly background cron job that scans due dates, flags overdue tasks in Postgres, and reflects overdue status on Kanban boards.
* **Dual-Token Zero-Trust Security**: Short-lived 15-minute in-memory JWT access tokens combined with 7-day cryptographic rolling refresh tokens stored in secure, HttpOnly cookies.
* **Auto-Seeding & Self-Healing**: Automated idempotent database bootstrapping that ensures demo accounts, sample clients, and mock projects are available on first startup.

---

## 2. Monorepo Architecture & Setup

The project uses **npm Workspaces** to coordinate frontend and backend development within a single Git repository.

```mermaid
graph TD
    Root[Monorepo Root] --> ClientWork[client/ - React + Vite + TS]
    Root --> ServerWork[server/ - Express + Prisma + TS]
    Root --> Docker[docker-compose.yml - PostgreSQL 15 Container]
    ClientWork --> SharedAPI[Communicates via Vite Proxy /api]
    SharedAPI --> ServerWork
```

### Root Package Scripts ([package.json](file:///p:/Horizon/package.json))
* `npm run dev`: Runs `concurrently` to spin up both the Vite frontend (`client`) and the Express/TSX backend (`server`) simultaneously.
* `npm run build`: Runs production builds for both workspaces (`prisma generate && tsc` in server, `vite build` in client).
* `npm run start`: Starts the compiled backend production server (`node dist/server.js`).
* `npm run seed`: Runs the database seed script (`tsx prisma/seed.ts` via server workspace).
* `npm run test`: Executes the backend Vitest integration test suite.

---

## 3. Complete File-by-File Inventory

### Root Directory
| File / Directory | Purpose |
| :--- | :--- |
| [package.json](file:///p:/Horizon/package.json) | Monorepo configuration defining npm workspaces (`client`, `server`) and orchestrator scripts (`concurrently`). |
| [docker-compose.yml](file:///p:/Horizon/docker-compose.yml) | Spins up the official `postgres:15-alpine` container with healthchecks and persistent volume `postgres_data`. |
| [.env](file:///p:/Horizon/.env) | Root environment configuration file. |
| [.env.example](file:///p:/Horizon/.env.example) | Template of required environment variables for quick onboarding. |
| [.gitignore](file:///p:/Horizon/.gitignore) | Ignores `node_modules`, build artifacts (`dist/`), `.env`, and OS temporary files. |
| [.vercelignore](file:///p:/Horizon/.vercelignore) | Optimizes frontend deployments on Vercel by excluding backend assets and Docker configurations. |
| [README.md](file:///p:/Horizon/README.md) | Technical assessment overview, setup instructions, database ER diagram, and demo credentials. |

---

### Backend: `server/`

#### Core Application & Setup
* [server/package.json](file:///p:/Horizon/server/package.json): Server dependencies (Express, Prisma, Socket.IO, bcryptjs, jsonwebtoken, node-cron, zod, helmet, cors) and scripts.
* [server/tsconfig.json](file:///p:/Horizon/server/tsconfig.json): TypeScript configuration for Node.js ES2022 / CommonJS target.
* [server/.env](file:///p:/Horizon/server/.env): Backend database connection string, JWT secrets, and port definition.
* [server/src/server.ts](file:///p:/Horizon/server/src/server.ts): Main process entrypoint; initializes HTTP server, WebSockets, background cron, auto-seed check, and port listening.
* [server/src/app.ts](file:///p:/Horizon/server/src/app.ts): Configures Express middleware (Helmet security headers, dynamic CORS, JSON/URL body parsers, cookie parser) and routes.

#### Configuration, Types & Utilities
* [server/src/config/env.ts](file:///p:/Horizon/server/src/config/env.ts): Strongly-typed runtime validation of environment variables using Zod.
* [server/src/types/index.ts](file:///p:/Horizon/server/src/types/index.ts): TypeScript declarations for authenticated requests (`AuthenticatedRequest`), JWT payloads (`TokenPayload`), and pagination models.
* [server/src/utils/errors.ts](file:///p:/Horizon/server/src/utils/errors.ts): Custom `AppError` class hierarchy (`BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`).
* [server/src/utils/jwt.ts](file:///p:/Horizon/server/src/utils/jwt.ts): Utilities for signing and verifying JWT access tokens (15m) and generating SHA-256 refresh token hashes.

#### Middleware
* [server/src/middleware/auth.ts](file:///p:/Horizon/server/src/middleware/auth.ts): Extracts and verifies Bearer JWT tokens from the `Authorization` header, attaching `req.user`.
* [server/src/middleware/rbac.ts](file:///p:/Horizon/server/src/middleware/rbac.ts): Enforces role authorization (`authorizeRoles`) and object-level task access checks (`authorizeTaskAccess`).
* [server/src/middleware/errorHandler.ts](file:///p:/Horizon/server/src/middleware/errorHandler.ts): Central error responder formatting Zod validation errors into HTTP 422 and handling application errors.

#### Controllers (Request & Response Handling)
* [server/src/controllers/auth.controller.ts](file:///p:/Horizon/server/src/controllers/auth.controller.ts): Login, refresh token exchange, logout, and `/me` profile inspection.
* [server/src/controllers/project.controller.ts](file:///p:/Horizon/server/src/controllers/project.controller.ts): CRUD operations on Projects with role-based filtering.
* [server/src/controllers/task.controller.ts](file:///p:/Horizon/server/src/controllers/task.controller.ts): Task creation, updates, status transitions, and deletions.
* [server/src/controllers/client.controller.ts](file:///p:/Horizon/server/src/controllers/client.controller.ts): Client company management (Admin exclusive).
* [server/src/controllers/user.controller.ts](file:///p:/Horizon/server/src/controllers/user.controller.ts): User listing and developer assignment lookups.
* [server/src/controllers/activity.controller.ts](file:///p:/Horizon/server/src/controllers/activity.controller.ts): Audit log feeds filtered by user role and project ownership.
* [server/src/controllers/notification.controller.ts](file:///p:/Horizon/server/src/controllers/notification.controller.ts): In-app alerts, unread counters, and mark-as-read mutations.
* [server/src/controllers/dashboard.controller.ts](file:///p:/Horizon/server/src/controllers/dashboard.controller.ts): Aggregates KPI statistics tailored to each role.

#### Services (Business Logic)
* [server/src/services/auth.service.ts](file:///p:/Horizon/server/src/services/auth.service.ts): Password verification, refresh token persistence, and revocation.
* [server/src/services/project.service.ts](file:///p:/Horizon/server/src/services/project.service.ts): Project permissions, deletion safeguards, and relationship fetching.
* [server/src/services/task.service.ts](file:///p:/Horizon/server/src/services/task.service.ts): Status state machine, audit log generation, and PM review notifications.
* [server/src/services/client.service.ts](file:///p:/Horizon/server/src/services/client.service.ts): Client entity business logic and project association counting.
* [server/src/services/user.service.ts](file:///p:/Horizon/server/src/services/user.service.ts): Team filtering and user retrieval.
* [server/src/services/activity.service.ts](file:///p:/Horizon/server/src/services/activity.service.ts): Audit feed retrieval logic.
* [server/src/services/notification.service.ts](file:///p:/Horizon/server/src/services/notification.service.ts): Notification delivery and read state management.
* [server/src/services/dashboard.service.ts](file:///p:/Horizon/server/src/services/dashboard.service.ts): Multi-query aggregation calculations for Admin, PM, and Dev dashboards.
* [server/src/services/autoSeedService.ts](file:///p:/Horizon/server/src/services/autoSeedService.ts): Runs on server boot if zero users exist to ensure database readiness.

#### Repositories (Data Access Layer)
* [server/src/repositories/prisma.ts](file:///p:/Horizon/server/src/repositories/prisma.ts): Singleton instantiated `PrismaClient` database connection.
* [server/src/repositories/project.repository.ts](file:///p:/Horizon/server/src/repositories/project.repository.ts): Low-level Prisma queries for projects.
* [server/src/repositories/task.repository.ts](file:///p:/Horizon/server/src/repositories/task.repository.ts): Task queries and bulk overdue updater (`markOverdueTasks`).
* [server/src/repositories/user.repository.ts](file:///p:/Horizon/server/src/repositories/user.repository.ts): User queries and email checks.
* [server/src/repositories/client.repository.ts](file:///p:/Horizon/server/src/repositories/client.repository.ts): Client CRUD queries.
* [server/src/repositories/activity.repository.ts](file:///p:/Horizon/server/src/repositories/activity.repository.ts): Activity log persistence and queries.
* [server/src/repositories/notification.repository.ts](file:///p:/Horizon/server/src/repositories/notification.repository.ts): In-app notification queries.
* [server/src/repositories/token.repository.ts](file:///p:/Horizon/server/src/repositories/token.repository.ts): Refresh token hash persistence, lookup, and revocation.

#### Validators (Zod Schemas)
* [server/src/validators/auth.validator.ts](file:///p:/Horizon/server/src/validators/auth.validator.ts): Validates email format and password presence.
* [server/src/validators/project.validator.ts](file:///p:/Horizon/server/src/validators/project.validator.ts): Enforces project title (`min: 3`), description, and client UUID.
* [server/src/validators/task.validator.ts](file:///p:/Horizon/server/src/validators/task.validator.ts): Enforces task title (`min: 2`), description (`min: 3`), valid dates, and priority enum.
* [server/src/validators/client.validator.ts](file:///p:/Horizon/server/src/validators/client.validator.ts): Validates client company name and contact email.
* [server/src/validators/user.validator.ts](file:///p:/Horizon/server/src/validators/user.validator.ts): Validates user creation, role enums, and password strength.

#### Real-Time & Background Jobs
* [server/src/sockets/socketServer.ts](file:///p:/Horizon/server/src/sockets/socketServer.ts): Authenticated Socket.IO server, room management (`project:${id}`, `admin:global`, `user:${id}`), and live presence tracking.
* [server/src/jobs/overdueJob.ts](file:///p:/Horizon/server/src/jobs/overdueJob.ts): `node-cron` job running every hour to flag overdue tasks.

---

### Frontend: `client/`

#### Core & Architecture
* [client/package.json](file:///p:/Horizon/client/package.json): Frontend dependencies (React 18, Vite, Tailwind CSS, TanStack Query, Zustand, React Hook Form, Lucide React).
* [client/vite.config.ts](file:///p:/Horizon/client/vite.config.ts): Vite build setup and development reverse proxy configuration forwarding `/api` and `/socket.io`.
* [client/tailwind.config.js](file:///p:/Horizon/client/tailwind.config.js): Custom colors (dark glass theme, `brand` cyan/blue palette, status colors).
* [client/src/main.tsx](file:///p:/Horizon/client/src/main.tsx): React root mount point.
* [client/src/App.tsx](file:///p:/Horizon/client/src/App.tsx): TanStack `QueryClientProvider`, React Router setup, and `ProtectedRoute` guard.
* [client/src/lib/apiClient.ts](file:///p:/Horizon/client/src/lib/apiClient.ts): Axios instance with Bearer token injection and automatic 401 refresh token interceptor queue.
* [client/src/stores/authStore.ts](file:///p:/Horizon/client/src/stores/authStore.ts): Zustand store managing the active user object, in-memory access token, and authentication state.
* [client/src/hooks/useAuth.ts](file:///p:/Horizon/client/src/hooks/useAuth.ts): Hook wrapping login, logout, and automatic session restoration.
* [client/src/services/socketService.ts](file:///p:/Horizon/client/src/services/socketService.ts): Socket.IO client manager that listens for real-time events and invalidates TanStack Query caches.
* [client/src/layouts/AppLayout.tsx](file:///p:/Horizon/client/src/layouts/AppLayout.tsx): Global layout containing the dynamic role-filtered **Sidebar**, header, presence counter, notification bell, and `<Outlet />`.

#### Pages
* [client/src/pages/LoginPage.tsx](file:///p:/Horizon/client/src/pages/LoginPage.tsx): Authentication screen with quick-select demo persona buttons (Admin, PM, Developer).
* [client/src/pages/DashboardRouter.tsx](file:///p:/Horizon/client/src/pages/DashboardRouter.tsx): Routes `/dashboard` to the appropriate dashboard component based on `user.role`.
* [client/src/pages/AdminDashboard.tsx](file:///p:/Horizon/client/src/pages/AdminDashboard.tsx): Global organization health, total projects/tasks, status breakdown charts, and active online users.
* [client/src/pages/ManagerDashboard.tsx](file:///p:/Horizon/client/src/pages/ManagerDashboard.tsx): Focuses on owned projects, priority breakdowns, upcoming deadlines, and task review alerts.
* [client/src/pages/DeveloperDashboard.tsx](file:///p:/Horizon/client/src/pages/DeveloperDashboard.tsx): Personal developer Kanban board with status movement sliders and overdue warnings.
* [client/src/pages/ProjectsPage.tsx](file:///p:/Horizon/client/src/pages/ProjectsPage.tsx): Project listing with search/filter, client details, and new project modal.
* [client/src/pages/ProjectDetailPage.tsx](file:///p:/Horizon/client/src/pages/ProjectDetailPage.tsx): Individual project view displaying metadata, associated client, and task grid.
* [client/src/pages/TasksPage.tsx](file:///p:/Horizon/client/src/pages/TasksPage.tsx): Global task catalog with multi-facet filtering (Status, Priority, Project, Developer).
* [client/src/pages/ClientsPage.tsx](file:///p:/Horizon/client/src/pages/ClientsPage.tsx): Client portfolio management (Admin only).
* [client/src/pages/UsersPage.tsx](file:///p:/Horizon/client/src/pages/UsersPage.tsx): Organization user roster with role badges and email lookups.
* [client/src/pages/ActivityPage.tsx](file:///p:/Horizon/client/src/pages/ActivityPage.tsx): Real-time live activity audit feed.

#### UI Components
* [client/src/components/TaskModal.tsx](file:///p:/Horizon/client/src/components/TaskModal.tsx): Create/Edit Task dialog with client-side & server-side validation error handling.
* [client/src/components/ProjectModal.tsx](file:///p:/Horizon/client/src/components/ProjectModal.tsx): Project creation modal with client dropdown.
* [client/src/components/ClientModal.tsx](file:///p:/Horizon/client/src/components/ClientModal.tsx): Client company creation modal.
* [client/src/components/TaskCard.tsx](file:///p:/Horizon/client/src/components/TaskCard.tsx): Interactive task card with status transitions, priority badge, and overdue pill.
* [client/src/components/NotificationBell.tsx](file:///p:/Horizon/client/src/components/NotificationBell.tsx): Notification bell dropdown with unread badge count and mark-as-read toggles.
* [client/src/components/FilterBar.tsx](file:///p:/Horizon/client/src/components/FilterBar.tsx): Multi-parameter filter toolbar for tasks.
* [client/src/components/RoleBadge.tsx](file:///p:/Horizon/client/src/components/RoleBadge.tsx): Color-coded badges for `ADMIN`, `PROJECT_MANAGER`, and `DEVELOPER`.
* [client/src/components/StatusBadge.tsx](file:///p:/Horizon/client/src/components/StatusBadge.tsx): Badges for `TODO`, `IN_PROGRESS`, `IN_REVIEW`, and `DONE`.
* [client/src/components/PriorityBadge.tsx](file:///p:/Horizon/client/src/components/PriorityBadge.tsx): Badges for `LOW`, `MEDIUM`, `HIGH`, and `CRITICAL`.
* [client/src/components/Modal.tsx](file:///p:/Horizon/client/src/components/Modal.tsx): Accessible backdrop dialog wrapper.
* [client/src/components/EmptyState.tsx](file:///p:/Horizon/client/src/components/EmptyState.tsx): Clean placeholder for empty lists or zero search results.
* [client/src/components/LoadingSkeleton.tsx](file:///p:/Horizon/client/src/components/LoadingSkeleton.tsx): Animated pulse skeletons while loading data.

---

## 4. Database Architecture & Data Models (Prisma)

The database runs on **PostgreSQL** configured via [server/prisma/schema.prisma](file:///p:/Horizon/server/prisma/schema.prisma).

```mermaid
erDiagram
    User ||--o{ Project : "owns (as PM)"
    User ||--o{ Task : "assignedTo (as Developer)"
    User ||--o{ ActivityLog : "performs"
    User ||--o{ Notification : "receives"
    User ||--o{ RefreshToken : "owns"
    Client ||--o{ Project : "has"
    Project ||--o{ Task : "contains"
    Project ||--o{ ActivityLog : "logs"
    Task ||--o{ ActivityLog : "tracks"

    User {
        string id PK
        string name
        string email UK
        string passwordHash
        Role role "ADMIN | PROJECT_MANAGER | DEVELOPER"
        datetime createdAt
        datetime updatedAt
        datetime lastSeenAt
        boolean isActive
    }

    Client {
        string id PK
        string name
        string email
        string company
        datetime createdAt
    }

    Project {
        string id PK
        string name
        string description
        string clientId FK
        string ownerId FK
        datetime createdAt
    }

    Task {
        string id PK
        string title
        string description
        string projectId FK
        string assignedDeveloperId FK
        TaskStatus status "TODO | IN_PROGRESS | IN_REVIEW | DONE"
        Priority priority "LOW | MEDIUM | HIGH | CRITICAL"
        datetime dueDate
        boolean isOverdue
    }

    ActivityLog {
        string id PK
        string projectId FK
        string taskId FK
        string userId FK
        string action
        TaskStatus previousStatus
        TaskStatus newStatus
        string description
        datetime createdAt
    }

    Notification {
        string id PK
        string recipientId FK
        string actorId FK
        string taskId FK
        string projectId FK
        NotificationType type "TASK_ASSIGNED | TASK_IN_REVIEW"
        string message
        boolean isRead
        datetime createdAt
    }

    RefreshToken {
        string id PK
        string userId FK
        string tokenHash UK
        datetime expiresAt
        datetime revokedAt
    }
```

### Strategic Database Indexing
* `User`: Indexed on `email` (O(1) login lookup) and `role` (team filtering).
* `Project`: Indexed on `ownerId` (fast PM isolation checks) and `clientId`.
* `Task`: Indexed on `projectId`, `assignedDeveloperId`, `status`, `dueDate`, `isOverdue`, and composite index `[projectId, status]`.
* `ActivityLog`: Composite index on `[projectId, createdAt]` for fast timeline catchup queries.
* `Notification`: Composite index on `[recipientId, isRead]` for instant unread badge counts.
* `RefreshToken`: Unique index on `tokenHash` for rapid rotation and lookup.

---

## 5. Authentication, Security & Token Lifecycle

### Dual-Token Architecture
```mermaid
sequenceDiagram
    participant Browser as Client Browser
    participant API as Express API
    participant DB as PostgreSQL DB

    Browser->>API: POST /api/auth/login { email, password }
    API->>DB: Fetch user & verify bcrypt password
    API->>DB: Store SHA-256 hash of Refresh Token
    API-->>Browser: Returns Access Token (15m, in JSON) + Set-Cookie: refreshToken (7d, HttpOnly)
    Note over Browser: Access Token kept in Zustand memory (never localStorage)

    Browser->>API: GET /api/tasks (Headers: Authorization: Bearer <AccessToken>)
    API-->>Browser: 200 OK (Tasks Data)

    Note over Browser: Access Token expires after 15 minutes
    Browser->>API: GET /api/tasks (Expired Token)
    API-->>Browser: 401 Unauthorized

    Note over Browser: Axios interceptor catches 401 & triggers auto-refresh
    Browser->>API: POST /api/auth/refresh (Cookie: refreshToken)
    API->>DB: Validate hash, revoke old token, issue new token pair
    API-->>Browser: New Access Token + New Refresh Cookie
    Browser->>API: Re-runs original GET /api/tasks
    API-->>Browser: 200 OK
```

### Security Measures Implemented
1. **No Token Storage in LocalStorage**: Access tokens exist only in memory, protecting against Cross-Site Scripting (XSS) extraction.
2. **Refresh Token Rotation (RTR)**: Every refresh request invalidates the old token and generates a new one. Stolen tokens cannot be reused.
3. **Helmet**: Sets secure HTTP response headers (`X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`).
4. **CORS Isolation**: Whitelists only trusted origins (`CLIENT_URL` and `localhost:5173`).

---

## 6. Role-Based Access Control (RBAC) Matrix

| Feature / Action | Admin | Project Manager | Developer |
| :--- | :---: | :---: | :---: |
| **Clients** (View / Create / Edit) | Full CRUD | View Only | View Only |
| **All Projects** (View Any Project) | ✅ Yes | ❌ (Own projects only) | ❌ (Assigned only) |
| **Create Project** | ✅ Yes | ❌ | ❌ |
| **Create Task** | ✅ Yes | ✅ (In own projects) | ❌ |
| **Edit / Delete Task** | ✅ Yes | ✅ (In own projects) | ❌ |
| **Update Task Status** (`TODO` ➔ `DONE`) | ✅ Yes | ✅ Yes | ✅ (Assigned tasks only) |
| **Assign Task to Developer** | ✅ Yes | ✅ Yes | ❌ |
| **Receive Review Notifications** | ✅ Yes | ✅ (When dev submits `IN_REVIEW`) | ❌ |
| **Tamper Protection** (Access via manual URL ID) | Bypass | Blocked with `403` if not owner | Blocked with `403` if not assigned |

---

## 7. Real-Time WebSocket Architecture (Socket.IO)

The real-time layer synchronizes state across active browser tabs without manual page refreshes.

### Socket Authentication
Socket connections require a valid JWT token passed during handshake:
```javascript
const socket = io(SERVER_URL, {
  auth: { token: `Bearer ${accessToken}` }
});
```

### Room Subscriptions & RBAC
* `admin:global`: Admins automatically join to observe organization-wide activities.
* `user:${userId}`: Each user joins their private room for direct notifications.
* `project:${projectId}`: Users join project channels upon visiting the project. The server validates permissions:
  * Admin: Always allowed.
  * Project Manager: Allowed only if `project.ownerId === user.id`.
  * Developer: Allowed only if the developer has at least one assigned task in that project.

### Real-time Event Catalog
| Event Name | Direction | Payload | Trigger / Purpose |
| :--- | :--- | :--- | :--- |
| `presence:update` | Server ➔ All | `{ activeUsersCount: number }` | Fired when any user connects or disconnects. |
| `activity:created` | Server ➔ Project/Admin | `ActivityLog` object | Fired whenever a task status changes or task is edited. |
| `notification:created` | Server ➔ Recipient | `Notification` object | Fired when a task is moved to `IN_REVIEW` or assigned. |
| `join:project` | Client ➔ Server | `projectId: string` | Client requests to listen to live project updates. |
| `leave:project` | Client ➔ Server | `projectId: string` | Client leaves the project page. |

---

## 8. Background Scheduling & Automation (node-cron)

Implemented in [server/src/jobs/overdueJob.ts](file:///p:/Horizon/server/src/jobs/overdueJob.ts):
* **Schedule**: `0 * * * *` (Runs every hour on the hour).
* **Operation**:
  ```sql
  UPDATE "Task"
  SET "isOverdue" = true
  WHERE "dueDate" < NOW()
    AND "status" != 'DONE'
    AND "isOverdue" = false;
  ```
* **Immediate Check**: Executed upon server startup to ensure overdue flags are synchronized immediately.

---

## 9. Complete REST API Specification

### Authentication (`/api/auth`)
* `POST /api/auth/login`: `{ email, password }` ➔ Returns `{ user, accessToken }` + sets refresh cookie.
* `POST /api/auth/refresh`: Reads refresh cookie ➔ Returns new `{ user, accessToken }`.
* `POST /api/auth/logout`: Revokes refresh token in database & clears cookie.
* `GET /api/auth/me`: Returns the authenticated user's profile.

### Projects (`/api/projects`)
* `GET /api/projects`: Lists projects (Admin sees all; PM sees owned; Dev sees projects where they have assigned tasks).
* `POST /api/projects`: `{ name, description, clientId }` ➔ Creates a project (Admin only).
* `GET /api/projects/:id`: Retrieves project details and task roster (Enforces RBAC).
* `PATCH /api/projects/:id`: Updates project metadata (Admin/Owner PM).
* `DELETE /api/projects/:id`: Deletes project and cascades tasks (Admin only).

### Tasks (`/api/tasks`)
* `GET /api/tasks`: Filter tasks by `status`, `priority`, `projectId`, `assignedDeveloperId`.
* `POST /api/tasks`: `{ title (>=2), description (>=3), projectId, assignedDeveloperId?, priority?, dueDate }` ➔ Creates task (Admin & PM).
* `GET /api/tasks/:id`: Retrieves single task details (Enforces developer isolation).
* `PATCH /api/tasks/:id`: Updates task details (Admin & PM).
* `PATCH /api/tasks/:id/status`: `{ status }` ➔ Updates status, creates `ActivityLog`, dispatches notification if `IN_REVIEW` (Admin, PM, or assigned Developer).
* `DELETE /api/tasks/:id`: Deletes task (Admin & PM).

### Dashboard & Analytics (`/api/dashboard`)
* `GET /api/dashboard`: Dynamically returns metrics based on caller role:
  * **Admin**: Total projects, total tasks, tasks by status, overdue count, active online users, organization audit log.
  * **Project Manager**: Owned projects, priority distribution, upcoming deadlines, pending review alerts.
  * **Developer**: Assigned tasks breakdown, personal overdue count, personal activity history.

### Activity & Notifications (`/api/activity`, `/api/notifications`)
* `GET /api/activity`: Role-filtered chronological activity feed.
* `GET /api/notifications`: Retrieves user's notifications.
* `PATCH /api/notifications/:id/read`: Marks notification as read.
* `PATCH /api/notifications/read-all`: Marks all notifications as read.

---

## 10. Frontend Architecture, Pages & UI Components

### State Management Strategy
1. **Global Auth State (`Zustand`)**:
   * Stores `user`, `accessToken`, `isAuthenticated`, and `isLoading`.
   * Cleared instantly on logout or token expiration.
2. **Server Cache State (`TanStack React Query v5`)**:
   * Manages server responses (`projects`, `tasks`, `dashboard`, `activity`).
   * Automatically invalidated and refetched when Socket.IO events arrive.

### Pages Breakdown
1. **`LoginPage`**:
   * Three 1-click persona quick-select buttons (**Admin**, **PM 1**, **Dev 1**).
   * Password input with clear visibility and form feedback.
2. **`AdminDashboard`**:
   * KPI stat cards with gradient accents.
   * Real-time online user pill showing concurrent active users.
   * Visual task distribution bar by status (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`).
3. **`ManagerDashboard`**:
   * Owned project portfolio cards with progress bars.
   * Priority breakdown badges (`CRITICAL`, `HIGH`, etc.).
   * In-Review alert widget for rapid task review.
4. **`DeveloperDashboard`**:
   * Personal Kanban workflow columns.
   * Status change slider controls.
   * Overdue task banners.
5. **`ProjectDetailPage`**:
   * Comprehensive project information, linked client card, and task grid.
   * "Add Task" modal integration with developer assignment dropdown.
6. **`TasksPage`**:
   * Multi-criteria search and filter toolbar (`FilterBar`).
   * Filter by status, priority, or project with instant results.

---

## 11. Configuration & Environment Variables

### Root / Server `.env` File
```env
# Database Connection String (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5433/velozity_db?schema=public"

# Application Configuration
PORT=3000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
SERVER_URL="http://localhost:3000"

# Cryptographic JWT Secrets
JWT_ACCESS_SECRET="horizon_super_secret_access_key_2026_change_in_prod"
JWT_REFRESH_SECRET="horizon_super_secret_refresh_key_2026_change_in_prod"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"
```

---

## 12. Testing & Quality Assurance

The test suite is located in [server/src/__tests__/rbac.test.ts](file:///p:/Horizon/server/src/__tests__/rbac.test.ts) and executed via:
```powershell
npm run test
```

### Verified Test Cases
1. **Admin Access**: Verifies admin can access any project across the database.
2. **PM Isolation**: Verifies PM 1 can access own projects, but receives `403 Forbidden` when attempting to access PM 2's projects.
3. **Developer Isolation**: Verifies Developer 1 can access assigned tasks, but receives `403 Forbidden` if tampering with Developer 2's task ID.
4. **Unauthenticated Gatekeeper**: Verifies requests without a Bearer token receive `401 Unauthorized`.
5. **Activity Log Transaction**: Confirms task status changes write a transactional audit log with previous and new statuses.
6. **Notification Trigger**: Asserts moving a task to `IN_REVIEW` automatically creates a notification for the project's PM.
7. **Overdue Task Automation**: Verifies that tasks past their due date are accurately flagged as `isOverdue = true`.
