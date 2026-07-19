# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agentic AI Portfolio & Admin Platform for Muhammad Hassaan Khan — a Next.js 16 (App Router) + TypeScript application with Supabase (PostgreSQL + Auth + pgvector) and a Deepseek V4 Flash AI assistant (RAG-based). Built using Spec-Driven Development (SDD); SPECS.md is the source of truth.

**High-level architecture:**
- Public portfolio routes (`/`, `/projects`, `/about`, `/services`) with an embedded RAG AI assistant
- Client portal routes (`/dashboard`, `/dashboard/orders`, `/dashboard/projects`) secured behind Supabase Auth (client role)
- Admin routes (`/admin/dashboard`, `/admin/projects`, `/admin/profile`, `/admin/ai-logs`, `/admin/orders`) secured behind Supabase Auth (admin role)
- AI assistant pipeline: visitor query → keyword search on content chunks → Deepseek V4 Flash → response
- Rate limiting: 20 messages/IP/hour tracked in `ai_chat_logs` table (not Vercel KV)
- **Keyword-based search** (no external API needed); LLM uses Deepseek V4 Flash

## Project Docs
- `ROADMAP.md` — Full project roadmap with all phases, features, and goals
- `STATUS.md` — Current status of what's built vs what's planned
- `CLAUDE.md` — This file (codebase guide for Claude)
- `SPECS.md` — Original project specification

## Commands

### Development
```bash
npm run dev              # Start dev server on localhost:3000
npm run build            # Production build (use NODE_OPTIONS='--max-old-space-size=2048')
npm run lint             # ESLint
npm run type-check       # Add to scripts if needed: tsc --noEmit (type-checking happens during build)
```

### Database (requires Supabase CLI + Docker)
```bash
npx supabase start      # Start local Supabase stack
npx supabase link       # Link to remote Supabase project
npx supabase db push    # Push schema changes
```

## Code Architecture

### Directory structure
```
src/
  app/                         # Next.js App Router
    layout.tsx                  # Root layout (Geist font, global styles)
    page.tsx                    # Home page (hero + AI chat widget)
    projects/page.tsx           # Public project list (server component, reads Supabase)
    about/page.tsx              # Bio/skills/education from Supabase
    admin/
      layout.tsx                # Auth guard wrapper (redirects to /admin/login if unauthed)
      login/page.tsx            # Supabase Auth sign-in form
      dashboard/page.tsx        # Stats overview (project count, profile sections, chat logs)
      projects/page.tsx         # Full CRUD for projects (client component)
      profile/page.tsx          # Edit bio/skills/education/experience (client component)
      ai-logs/page.tsx          # Monitor visitor AI chat queries (server component)
    api/
      ai/route.ts               # POST: embed query → RAG → Deepseek → log → respond
      admin/projects/route.ts   # CRUD: GET/POST/PUT/DELETE (auto-indexes embeddings on change)
      admin/profile/route.ts    # CRUD: GET/POST/PUT/DELETE (auto-indexes embeddings on change)
      admin/embeddings/route.ts # POST: manually trigger re-indexing for a project or profile
  proxy.ts                      # Next.js 16 proxy (previously middleware)
  components/
    ui/                         # Button, Card, Input, Textarea
    ai/ChatWidget.tsx           # Interactive chat widget (client component)
    admin/
      AuthGuard.tsx             # Session check, redirects to login if unauthenticated
      AdminNav.tsx              # Admin nav bar with sign-out button
    Nav.tsx                     # Public nav bar (Home, Projects, About)
  lib/
    supabase/
      client.ts                 # Browser Supabase client (public anon key)
      server.ts                 # Server-component Supabase client (cookies-based auth)
      admin.ts                  # Service-role client (bypasses RLS, for CRUD API routes)
    ai/
      deepseek.ts               # Deepseek API wrapper: chat + embedding + batch embedding
      rag.ts                    # RAG pipeline: embed query → vector search → context → LLM
    rate-limit.ts               # Rate limiter querying ai_chat_logs table
  types/
    database.ts                 # TypeScript interfaces for all 5 tables
supabase/
  migrations/
    00001_schema.sql            # 5 tables + RLS policies
    00002_vector_search_rpcs.sql # match_project_embeddings + match_profile_embeddings RPCs
.env.local                      # Template for Supabase + Deepseek keys
```

### Key patterns

**Supabase clients — three tiers:**
1. `lib/supabase/client.ts` — Anon key for browser. Used in AuthGuard and AdminNav (client components).
2. `lib/supabase/server.ts` — Server-component client via cookies. Available for server components but not currently used directly (admin API routes use service_role client).
3. `lib/supabase/admin.ts` — Service-role key, bypasses RLS. Used in API routes and server components (projects page, about page, dashboard, ai-logs).

**Vector sync on content change:** When admin creates/updates a project or profile section via the API, the route handler automatically chunks the content, generates embeddings via Deepseek, and upserts into the corresponding `*_embeddings` table with CASCADE delete for old embeddings.

**AI assistant pipeline:** API route `/api/ai` → rate limit check → `deepseek-embedding` on query → `match_*_embeddings` RPCs → build context → `deepseek-chat` (V4 Flash) with hardened system prompt → log to `ai_chat_logs` → respond.

### Data model (5 tables — see `supabase/migrations/00001_schema.sql`)

| Table | Vector | Purpose |
|---|---|---|
| `projects` | — | Portfolio projects (title, description, tech_stack[], github_url) |
| `project_embeddings` | vector(2048) | Chunked embeddings per project, FK→projects CASCADE |
| `profile_content` | — | Bio/skills/education/experience/certifications sections |
| `profile_embeddings` | vector(2048) | Chunked embeddings per section, FK→profile_content CASCADE |
| `ai_chat_logs` | — | Visitor chat history + ip_address for rate limiting |

### Constraints (from SPECS.md §7)
- AI assistant is **read-only** — no tool calls, no admin actions via chat
- If RAG context doesn't cover the question, the AI must **politely decline**
- System prompt is **server-side only** (in `rag.ts`), never sent to client
- No heavy local processing or local LLMs

## Environment Variables (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DEEPSEEK_API_KEY=
```
