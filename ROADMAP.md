# Project Roadmap: Client Portal & Project Management System

> **Goal:** Replace Upwork/Fiverr with a self-hosted client portal where clients can register, order services, track projects via milestones, message, share files, manage payments, and handle extensions — all without third-party platforms.

---

## 🏁 Completed Phases

### Phase 1 ✅ — Foundation
- Database schema (9 tables: profiles, client_orders, projects, milestones, messages, files, timeline, extensions, payments)
- TypeScript interfaces for all tables
- Client authentication (register/login via Supabase Auth)
- ClientAuthGuard for dashboard routes
- Dashboard layout + navigation
- AI assistant now knows about all 4 services

### Phase 2 ✅ — Client Dashboard & Orders
- `/dashboard` — Stats overview, recent orders, quick actions
- `/dashboard/orders` — Full order history with status badges
- `/dashboard/orders/[id]` — Order detail page with admin notes
- `/api/client/orders` — Authenticated API (list + create orders)
- Nav shows Dashboard link when logged in

---

## 🚀 Upcoming Phases

### Phase 3 ⏳ — Project Management (Next)

**Core experience** — where clients work with you on projects.

#### Pages:
- `/dashboard/projects` — Project list (status, progress, deadlines)
- `/dashboard/projects/[id]` — Full project detail with tabs:
  - **Overview tab**: Status, progress bar, milestones summary, timeline
  - **Milestones tab**: List with amounts, deadlines, approve/reject buttons
  - **Messages tab**: Chat-style messaging between client and developer
  - **Files tab**: Upload/download files with auto-delete timers
  - **Timeline tab**: Activity log (events, milestone completions, file uploads)

#### API Routes:
- `GET /api/client/projects` — List client's projects
- `GET /api/client/projects/[id]` — Single project with milestones + timeline
- `POST /api/client/projects/[id]/messages` — Send message
- `GET /api/client/projects/[id]/messages` — Get messages
- `POST /api/client/projects/[id]/files` — Upload file (Supabase Storage)
- `GET /api/client/projects/[id]/files` — List files
- `POST /api/client/milestones/[id]/approve` — Approve milestone
- `GET /api/client/projects/[id]/timeline` — Get timeline events

#### New DB Tables Needed:
- Already created in Phase 1 SQL! (`project_milestones`, `project_messages`, `project_files`, `project_timeline_events`)

---

### Phase 4 ⏳ — Advanced Features

**Making it a full business platform.**

#### Features:
- **Extension Requests** — Client or developer requests deadline extension, other party approves/denies
- **Payment Tracking** — Manual payment records with proof upload, status tracking (pending → paid)
- **Penalties/Fines** — Late fees per project, auto-calculated at render time
- **Project Renewals** — Completed project → New order with reference to original
- **Admin Payment Dashboard** — See all payments, confirm/reject
- **Email Notifications** — Notify client when milestone is completed, message received, order status changes

#### New API Routes:
- `POST /api/client/projects/[id]/extensions` — Request extension
- `GET /api/client/extensions` — List extension requests
- `POST /api/client/projects/[id]/payments` — Submit payment proof
- `GET /api/client/payments` — Payment history
- `POST /api/client/projects/[id]/renewal` — Submit renewal

---

### Phase 5 ⏳ — Admin Enhancement

**Full business management for you.**

#### Pages:
- `/admin/orders` — Enhanced with approve/reject actions, convert to project flow
- `/admin/projects` — Full project list with status filters
- `/admin/projects/[id]` — Detailed project management:
  - Create/edit milestones with amounts and deadlines
  - Send messages as developer
  - Upload files
  - Approve/reject extension requests
  - Record payments
  - Update project status
- `/admin/clients` — Client list with their orders/projects
- `/admin/clients/[id]` — Client detail with full history

#### API Routes:
- `GET /api/admin/orders` — List all orders with filters
- `PUT /api/admin/orders/[id]` — Update order status
- `GET /api/admin/projects` — List all projects
- `PUT /api/admin/projects/[id]` — Update project
- `POST /api/admin/milestones` — Create milestone
- `PUT /api/admin/milestones/[id]` — Update milestone
- `GET /api/admin/clients` — List all clients
- `PUT /api/admin/extensions/[id]` — Approve/reject extension
- `POST /api/admin/payments` — Record payment
- `PUT /api/admin/payments/[id]` — Update payment status

---

### Phase 6 ⏳ — Future Enhancements (Post-MVP)

#### Nice-to-Have Features:
- **Sprint/Kanban Board** — Task-level tracking within milestones (To Do → In Progress → In Review → Done)
- **Invoice Generation** — Auto-generate PDF invoices from milestones/payments
- **Time Tracking** — Log hours per milestone/task
- **Client Onboarding Questionnaire** — Form before starting a project
- **Automated Emails** — SendGrid or Resend for email notifications
- **Client Approval with Visual Feedback** — Clients can annotate/comment on deliverables
- **GitHub Integration** — Link repos, auto-populate tasks from issues
- **Public Client Testimonials** — Auto-request after project completion
- **Analytics Dashboard** — Revenue, project completion rates, client retention
- **Mobile App** — Basic mobile view or PWA

---

## 🎯 Design Standards (all phases)

- CSS variables: `var(--bg-primary)`, `var(--surface)`, `var(--accent)`, `var(--border)`, etc.
- Gradient accent on headings: `<span className="gradient-text">...</span>`
- Section glow effect: `<div style={{ background: 'var(--glow)' }} />`
- Compatible with both light and dark themes
- Mobile-responsive
- Rose/crimson accent theme (`#e11d48` light, `#f43f5e` dark)

## ✅ Verification (each phase)

1. `npm run build` — Must pass with no TypeScript errors
2. All new routes return HTTP 200
3. Auth flow: register → login → dashboard
4. Orders API: create → list → detail
5. Projects API: list → detail → messages → files → milestones
6. Admin flow: view orders → manage projects → clients
7. Theme toggle works on all new pages
