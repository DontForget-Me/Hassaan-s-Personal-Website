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
- `/api/client/orders` — Authenticated API (list + create)
- Nav shows Dashboard link when logged in

### Phase 3 ✅ — Project Management
- `/dashboard/projects` — Project list with status, amounts, milestones
- `/dashboard/projects/[id]` — 5-tab detail page (overview, milestones, messages, files, timeline)
- Full chat between client and developer (Enter to send)
- File sharing with optional auto-expiry
- Milestone approvals with timeline events
- 7 API routes for projects, messages, files, timeline

### Phase 4 ✅ — Advanced Features
- Extension requests (reason + new deadline, admin approves/denies)
- Payment tracking (submit proof, admin confirms, paid/remaining totals)
- Late penalty auto-calculation (red warning banner)
- Project renewals (completed project → new order)
- Admin extension + payment approval APIs

### Phase 5 ✅ — Admin Enhancement
- `/admin/clients` — All clients with order/project counts
- `/admin/clients/[id]` — Full client history (projects, orders, payments, revenue)
- `/admin/portal-projects` — Project list with status filter
- `/admin/portal-projects/[id]` — Full project management (milestones CRUD, extensions, payments)
- `/admin/orders` — Approve/reject orders, auto-creates project on approval
- Admin Nav updated with CSS variables (dark mode compatible)

### Phase 6 ✅ — Future Enhancements
- `/admin/analytics` — Revenue, project stats, clients, milestones, monthly chart
- Client testimonials (admin CRUD + visibility toggle + home page display)
- In-app notifications (bell icon in dashboard nav, unread count)
- Kanban board (To Do → In Progress → In Review → Done, click to move)
- Time tracking (log hours per milestone, total hours display)

### Phase 7 ✅ — Gig System + Dashboard Order Flow
- Gigs with 3 package tiers (Basic/Standard/Premium)
- Admin gig management with package CRUD
- `/services` — Redesigned with package tier cards
- `/services/[slug]` — Gig detail page with package comparison
- `/dashboard/orders/new` — 4-step order wizard (select gig → package → details → review)
- Quick order via URL params (`?gig=slug&package=basic`)
- Feature templates — 150+ pre-defined features across 7 categories × 3 tiers
- Feature template picker with chip-based suggestions + custom input
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

---

## 📋 Gig Categories — Complete Feature Table (150+ Features)

### 1. Web / Full Stack Development
| Tier | Features |
|------|----------|
| **Basic** | Responsive Design, 1 Page / Landing Page, Contact Form, Basic SEO, Mobile-Friendly, Google Maps, Social Media Links, 1 Revision, Source Code, 7 Days |
| **Standard** | Everything in Basic + Up to 10 Pages, Custom UI/UX, Advanced SEO, REST API, CMS, Admin Dashboard, Payment Gateway, Auth, Database, 3 Revisions, 14 Days |
| **Premium** | Everything in Standard + Unlimited Pages, E-commerce, Custom Animations, Core Web Vitals, Third-party APIs, Multi-language, RBAC, CI/CD, Cloud Deploy, SSL + Domain, 30 Days Support, 5 Revisions, 24/7 Support |

### 2. AI & Machine Learning
| Tier | Features |
|------|----------|
| **Basic** | AI Chatbot, FAQ System, Single Platform, Response Templates, Documentation, 1 Revision, 7 Days |
| **Standard** | Everything in Basic + RAG Pipeline, Multiple Data Sources, Custom Training, Analytics Dashboard, Multi-platform (Web + Slack + WhatsApp), Human Handoff, 3 Revisions, 14 Days |
| **Premium** | Everything in Standard + GPT-4/Claude/Gemini, Custom AI Agents, Multi-language (10+), Custom API, File Analysis, Vector Database (Pinecone/pgvector), Performance Caching, 24/7 Support, 30 Days Support |

### 3. Backend & API Development
| Tier | Features |
|------|----------|
| **Basic** | RESTful API, Swagger Docs, 3 Endpoints, Data Validation, Hosting Setup, Email Support, 1 Revision, 7 Days |
| **Standard** | Everything in Basic + 10 Endpoints, Database Schema, JWT/OAuth Auth, RBAC, Test Suite, Error Handling, Performance Optimization, 3 Revisions, 14 Days |
| **Premium** | Everything in Standard + Unlimited Endpoints, Microservices, CI/CD, Security Audit, Redis Caching, Webhooks, Cloud Deploy (AWS/Docker), DB Migration, Dedicated Support, 30 Days |

### 4. Technical Consulting
| Tier | Features |
|------|----------|
| **Basic** | 1hr Video Call, High-level Review, Summary Report, Email Follow-up, Tech Stack Recommendations, 5 Days |
| **Standard** | Everything in Basic + Code Review (10 files), Architecture Diagram, Recommendations Doc, 30min Follow-up, Performance Analysis, Security Scan, 10 Days |
| **Premium** | Everything in Standard + Full Audit Report, Implementation Plan, DB Review, CI/CD Recommendations, 2 Weeks Support, Monthly Check-in (3 months), 15 Days |

### 5. 🆕 UI/UX Design
| Tier | Features |
|------|----------|
| **Basic** | 3 Screens, Low-fidelity Wireframes, Color Palette, Typography, Clickable Prototype, Figma Source, 2 Revisions, 5 Days |
| **Standard** | Everything in Basic + 6 Screens, High-fidelity Prototype, Responsive (Mobile + Tablet + Desktop), UI Kit, User Flow, Design System Foundation, 4 Revisions, 10 Days |
| **Premium** | Everything in Standard + 12+ Screens, Full Design System, Micro-interactions, User Research, Usability Testing, Developer Handoff Package, HTML/CSS Conversion, Unlimited Revisions, 14 Days |

### 6. 🆕 Mobile App Development
| Tier | Features |
|------|----------|
| **Basic** | Single Platform (iOS OR Android), 3 Screens, Basic UI, Navigation, App Icon + Splash, 1 Revision, Source Code, 14 Days |
| **Standard** | Everything in Basic + Cross-platform (React Native/Flutter), 8 Screens, REST API, Auth, Database (Firebase/Supabase), Push Notifications, Custom UI, 3 Revisions, 21 Days |
| **Premium** | Everything in Standard + Both Platforms, Full App, Backend API, In-app Purchases, Real-time Features, SDK Integration, App Store Submission, Analytics, 5 Revisions, 30 Days Support, 30 Days |

### 7. 🆕 Full Stack Development
| Tier | Features |
|------|----------|
| **Basic** | CRUD App, 2 Pages, REST API, Database Setup, Responsive Frontend (React/Next.js), GitHub, 1 Revision, 14 Days |
| **Standard** | Everything in Basic + 8 Pages, Auth & Authorization, Admin Dashboard, Third-party API, File Upload, Email Notifications, DB Migrations, Cloud Deploy, 3 Revisions, 21 Days |
| **Premium** | Everything in Standard + SaaS/Enterprise Platform, Data Visualization, AI Integration, Real-time (WebSockets), Multi-tenant, CI/CD, Performance Caching, Test Suite, Monitoring, 30 Days Support, 5 Revisions, 30 Days |

---

## ✅ Verification (each phase)

1. `npm run build` — Must pass with no TypeScript errors
2. All new routes return HTTP 200
3. Auth flow: register → login → dashboard
4. Orders API: create → list → detail
5. Projects API: list → detail → messages → files → milestones
6. Admin flow: view orders → manage projects → clients
7. Theme toggle works on all new pages
