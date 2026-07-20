# CLAUDE.md — Hassaan's Portfolio & Client Portal

## Project Overview
Agentic AI Portfolio & Admin Platform for Muhammad Hassaan Khan — a Next.js 16 (App Router) + TypeScript application with Supabase (PostgreSQL + Auth + pgvector) and a Deepseek V4 Flash AI assistant (RAG-based). Built using Spec-Driven Development (SDD).

## Project Docs
- `ROADMAP.md` — Full project roadmap with all phases, features, and goals
- `STATUS.md` — Current status of what's built vs what's planned
- `CLAUDE.md` — This file (codebase guide for Claude)
- `SPECS.md` — Original project specification

## Commands
```bash
npm run dev              # Start dev server on localhost:3000
npm run build            # Production build (use NODE_OPTIONS='--max-old-space-size=2048')
npm run lint             # ESLint
```

## Architecture
```
Public Routes:     /  /services  /services/[slug]  /projects  /about
Auth Routes:       /login  /register
Client Portal:     /dashboard/* (orders, projects, messages, files, payments)
Admin Panel:       /admin/* (dashboard, analytics, gigs, projects, clients, orders)
API Routes:        28 routes across client, admin, public, and AI
```

## Directory Structure
```
src/
  app/                          # Next.js App Router
    page.tsx                    # Home page (hero + services + testimonials + AI chat)
    services/page.tsx           # Gig listing with package tiers
    services/[slug]/page.tsx    # Gig detail with package comparison
    projects/page.tsx           # Portfolio projects (server component)
    about/page.tsx              # Bio/skills/education from Supabase
    (auth)/                     # Login + register pages
    dashboard/                  # Client portal (orders, projects, messages)
    admin/                      # Full admin panel
    api/                        # 28 API routes
  components/
    ui/                         # Button, Card, Input, Textarea
    ai/ChatWidget.tsx           # AI chat widget
    admin/                      # AdminNav, AuthGuard, FeatureTemplatePicker
    client/                     # DashboardNav, ClientAuthGuard, MilestoneList,
                                # ProjectMessages, ProjectFiles, ProjectTimeline,
                                # KanbanBoard, TimeTracking, PaymentSection,
                                # ExtensionRequestSection, StatusBadge, etc.
    Nav.tsx, Footer.tsx         # Public navigation + footer
    ThemeProvider.tsx            # Dark/light theme toggle
    ProjectCard.tsx             # Portfolio project card
  lib/
    supabase/client.ts          # Browser Supabase client
    supabase/server.ts          # Server-component Supabase client
    supabase/admin.ts           # Service-role client (bypasses RLS)
    ai/deepseek.ts              # Deepseek API wrapper
    ai/rag.ts                   # RAG pipeline + system prompt
    ai/search.ts                # Keyword search
    services.ts                 # Service definitions
    project-penalties.ts        # Late fee calculator
    rate-limit.ts               # Rate limiter (ai_chat_logs table)
  types/database.ts             # All TypeScript interfaces
```

## Key Patterns
- **Supabase clients**: anon (browser), server (cookies), admin (service_role)
- **Admin API routes** use `createAdminClient()` (server-side, bypasses RLS)
- **Client API routes** use `createClient()` (browser anon key + RLS)
- **Admin pages** fetch data via API routes (not direct Supabase queries)
- **Theme**: CSS variables (`--accent`, `--surface`, `--border`, etc.) with rose/crimson accent
- **Gradient accent**: `<span className="gradient-text">...</span>`

## Database (17 tables)
```
core:         projects, project_embeddings, profile_content, profile_embeddings
chat:         ai_chat_logs, service_orders
portal:       profiles, client_orders, portal_projects, project_milestones,
              project_messages, project_files, project_timeline_events,
              extension_requests, payments
features:     notifications, testimonials, time_logs, gigs, gig_packages,
              gig_feature_templates
```

## AI Assistant
- Keyword search → Deepseek V4 Flash → response
- Rate limited: 20 msg/IP/hr via ai_chat_logs
- Knows about services, pricing, and order process
- Read-only — no tool calls, no admin actions

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DEEPSEEK_API_KEY=
```
