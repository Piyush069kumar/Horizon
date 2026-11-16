# Horizon Project Improvement Roadmap & Todo List

## 1. Project Rebranding: Velozity ➔ Horizon
- [x] Rename application from **Velozity** to **Horizon** across the codebase:
  - [ ] Frontend header logo and brand titles (`AppLayout.tsx`, `LoginPage.tsx`, `index.html`)
  - [ ] Page titles, metadata, and HTML title tags
  - [ ] Email addresses & seed accounts (e.g. `admin@horizon.demo`, `pm1@horizon.demo`, etc.)
  - [ ] Backend API welcome message (`server.ts`, `app.ts`)
  - [ ] Root and package names (`package.json`, `client/package.json`, `server/package.json`)
  - [ ] Documentation and README files

---

## 2. User Management, Authentication & Profile
- [ ] **Create User capability for Admin**:
  - [ ] Add a prominent `+ Add User` button on the Users page (`UsersPage.tsx`) visible only to Admins
  - [ ] Build a `UserModal.tsx` form (Name, Email, Password, Role: Admin / Project Manager / Developer)
  - [ ] Connect form to `POST /api/users` endpoint with validation error handling
- [x] **Live Active User Indicators on Users Page**:
  - [x] Update backend Socket.IO to broadcast the list of currently connected user IDs (`activeUserIds: string[]`), not just the count
  - [x] Display real-time **Online** (green glowing badge) vs **Offline** status pill next to each user in `UsersPage.tsx`
  - [x] Display `Last Active` relative timestamp (`lastSeenAt`) using `date-fns` for offline users
- [ ] **User Edit & Status Toggle**:
  - [ ] Allow Admins to toggle user active status (`isActive: true / false`) or edit user roles
- [ ] **Password Visibility Toggle (Show / Hide)**:
  - [ ] Add an eye toggle icon (`Eye` / `EyeOff` from `lucide-react`) on `LoginPage.tsx` and user creation forms
- [ ] **User Profile & Change Password**:
  - [ ] Clicking user profile card in the sidebar opens a Profile modal
  - [ ] Allow authenticated user to update their display name and change password (`oldPassword`, `newPassword`)
  - [ ] Backend endpoint: `PATCH /api/auth/profile` and `PATCH /api/auth/change-password`

---

## 3. Server-Side Pagination & List Performance
- [ ] **Backend Pagination Support**:
  - [ ] Add `page` and `limit` query parameters with Prisma `skip` and `take` to:
    - [ ] `GET /api/activity` (Activity log timeline)
    - [ ] `GET /api/tasks` (Global and project task listings)
    - [ ] `GET /api/projects` (Projects catalog)
    - [ ] `GET /api/notifications` (Notifications tray)
  - [ ] Return standard pagination metadata: `{ items, pagination: { page, limit, totalCount, totalPages } }`
- [ ] **Frontend Pagination UI**:
  - [ ] Create a reusable `Pagination.tsx` component with `Previous`, `Next`, current page indicator, and page size selector (10, 25, 50)
  - [ ] Integrate pagination into `TasksPage.tsx`, `ProjectsPage.tsx`, and `ActivityPage.tsx`

---

## 4. Project & Task Workflow Enhancements
- [ ] **Project Assignment Flow**:
  - [ ] Ensure Admin can assign / reassign the Project Manager (owner) on both project creation and project edit modals
  - [ ] Display the assigned Project Manager name clearly on Project cards and Project Detail page
- [ ] **Instant Search Bar**:
  - [ ] Add a quick search input at the top of `TasksPage.tsx` and `ProjectsPage.tsx` to filter instantly by title, project, or assignee
- [ ] **Sort Tasks by Due Date & Priority**:
  - [ ] Add a sort dropdown/toggle on tasks views: *Earliest Due Date First*, *Latest Due Date*, *Highest Priority First*
- [ ] **Overdue Tasks Filter**:
  - [ ] Add an explicit `Overdue Only` filter toggle switch in the task `FilterBar.tsx`
  - [ ] Add an overdue tasks count badge in the sidebar navigation next to "Tasks"
- [ ] **Task Status Flow & Drag-and-Drop**:
  - [ ] Support drag-and-drop or visual column drag for Kanban boards on developer and PM dashboards
- [ ] **Task Comments / Activity Notes**:
  - [ ] Add a lightweight `Comment` model to Prisma (`id`, `taskId`, `userId`, `content`, `createdAt`)
  - [ ] Allow developers and PMs to post quick discussion notes/updates directly inside a task detail modal
- [ ] **Safe Deletion Confirmation**:
  - [ ] Build a reusable `<ConfirmModal>` with explicit warning (e.g. *"Deleting this project will remove all associated tasks"*)
  - [ ] Replace native alerts with this modal across Projects, Tasks, and Clients
- [ ] **Soft Delete Strategy (Data Safety)**:
  - [ ] Add `deletedAt DateTime?` column to `Project` and `Task` in Prisma schema
  - [ ] Implement soft delete so accidentally deleted projects/tasks can be restored without losing audit trails

---

## 5. Notifications, Feedback & Real-Time Alerts
- [ ] **Toast Notification System**:
  - [ ] Integrate a sleek toast notification library (such as `sonner` or `react-hot-toast`)
  - [ ] Trigger toasts on: task created, status updated, project saved, errors, and real-time socket events
- [ ] **Real-Time Sound / Toast Alerts**:
  - [ ] In-app toast notification when real-time socket events arrive (`task:assigned`, `task:in_review`)
  - [ ] Notification badge animation on real-time arrival
- [ ] **Notification Management**:
  - [ ] Option to clear or delete individual / all notifications

---

## 6. Verification & Quality
- [ ] Update Vitest test suite (`rbac.test.ts`) to verify newly added pagination, user creation, and profile change endpoints
- [ ] Verify Docker PostgreSQL setup and seamless migrations

---

## 7. 🔮 Future Enhancements: Multi-Tenant / Multi-Organization Architecture
- [ ] **Data Model & Tenant Isolation**:
  - [ ] Create `Organization` (or `Workspace`) model (`id`, `name`, `slug`, `plan`, `createdAt`, `updatedAt`)
  - [ ] Add `organizationId` foreign key to `User`, `Project`, `Client`, `Task`, `ActivityLog`, and `Notification`
  - [ ] Enforce row-level isolation via Prisma middleware/extension so queries automatically filter by `organizationId`
- [ ] **Organization Onboarding & Switching**:
  - [ ] Organization signup / registration flow (`POST /api/auth/register-org`)
  - [ ] Workspace switcher UI in frontend header to switch between different organizations
  - [ ] Embed active `organizationId` in JWT token claims
- [ ] **Role Hierarchy Refinement**:
  - [ ] Differentiate **Super Admin** (platform operator) vs **Organization Admin** (controls their company only)
  - [ ] Scope Socket.IO rooms by organization (`org:{orgId}:admin:global`, `org:{orgId}:project:{id}`)
