# SPECS.md - Agentic AI Portfolio & Admin Platform

## 1. Product Overview
**Description:** A premium personal portfolio and AI-driven platform for Muhammad Hassaan Khan. The system serves two primary functions: a public-facing showcase for hiring managers, clients, and teachers, and a secure, private Admin Panel for the owner to manage content and monitor AI interactions.
**Primary Objective:** To demonstrate advanced Agentic AI engineering skills through a Spec-Driven Development (SDD) workflow, resulting in a production-ready, scalable web application.
**Core Features:** 
- Public portfolio with an embedded AI assistant (RAG-enabled).
- Secure Admin Dashboard for content management.
- Fully serverless, cloud-native deployment pipeline.

## 2. Technology Stack & Architecture
This project utilizes a modern, serverless stack optimized for AI integration and rapid deployment.

* **Frontend Framework & API Routes:** **Next.js (React) with TypeScript**. We are using the Next.js App Router to handle both the UI and the backend API routes (BFF - Backend for Frontend pattern).
* **Main Database & Authentication:** **Supabase**. Supabase will handle user authentication (protecting the Admin panel) and serve as the primary PostgreSQL database for project data.
* **AI Vector Database & Memory:** **Supabase Vector (`pgvector`)**. This natively integrates with our main database to store document embeddings for the AI assistant's Retrieval-Augmented Generation (RAG) capabilities.
* **Source Control:** **GitHub**. 
* **Deployment & Hosting:** **Vercel**. 

## 3. Sitemap & Access Control
The application is split into two distinct routing domains: Public and Admin.

### Public Routes (Unauthenticated)
* `/` **(Home):** Features a premium, modern UI showcasing the developer's identity, core skills, and the interactive AI Assistant chat interface.
* `/projects`: A grid/list view of completed full-stack and AI projects.
* `/about`: Professional background and resume details.

### Admin Routes (Authenticated via Supabase Auth)
* `/admin/dashboard`: Central hub for the site owner.
* `/admin/projects`: Interface to Create, Read, Update, and Delete (CRUD) portfolio projects. 
* `/admin/profile`: Interface to update resume, bio, and skills content.
* `/admin/ai-logs`: A monitoring interface to see what questions visitors are asking the AI assistant.

## 4. AI Assistant Integration (Phase 1 Scope)
The embedded AI assistant acts as a knowledgeable representative of the developer.

* **LLM Engine:** **\Deepseek(via Deepseek API , model will be V4 flash model of deepseek)**. Selected for its exceptionally low latency, cost-effectiveness, and strong context window, making it the ideal choice for real-time public chat.
* **Embedding Model:** **Deepseek Embedding** (`deepseek-embedding`). Selected for cost efficiency, outputting vectors at 2048 dimensions via the Deepseek API.
* **Architecture:** Visitor queries are embedded and sent to Supabase Vector to retrieve context from both projects and profile content. The context is passed to Deepseek V4 Flash to generate the final response.
* **Security & Prompt Injection Defense:** The system prompt explicitly instructs the LLM to ignore any instructions embedded in the user's message (e.g., "ignore previous instructions"). Retrieved context is sanitized to ensure the LLM treats it strictly as data, not as executable commands.
* **Abuse Protection & Rate Limiting:** 
    * Implemented via **Vercel KV (Upstash Redis)** middleware.
    * Limit of 20 messages per IP address per hour.
    * Hard daily budget cap configured on the Anthropic API dashboard to prevent billing exhaustion from DoS attacks or malicious scraping.

## 5. Data Model (Supabase PostgreSQL)
The schema supports strict referential integrity and dimensional vectors.

* **`projects` table:** 
    * `id` (UUID, Primary Key)
    * `title` (String)
    * `description` (Text)
    * `tech_stack` (Array of Strings)
    * `github_url` (String)
* **`project_embeddings` table (Supabase Vector):**
    * `id` (UUID, Primary Key)
    * `project_id` (Foreign Key referencing `projects` with **ON DELETE CASCADE**)
    * `content` (Text chunk)
    * `embedding` (vector(2048))
* **`profile_content` table:**
    * `id` (UUID, Primary Key)
    * `section_name` (String, e.g., 'bio', 'skills', 'education')
    * `content` (Text)
* **`profile_embeddings` table (Supabase Vector):**
    * `id` (UUID, Primary Key)
    * `profile_id` (Foreign Key referencing `profile_content` with **ON DELETE CASCADE**)
    * `content` (Text chunk)
    * `embedding` (vector(2048))
* **`ai_chat_logs` table:**
    * `id` (UUID, Primary Key)
    * `session_id` (UUID) - Enables grouping conversations per user.
    * `visitor_query` (Text)
    * `ai_response` (Text)
    * `created_at` (Timestamp)

## 6. UI/UX Design System
* **Vibe:** Clean, minimal, modern, and premium. It must avoid looking like a standard Bootstrap/Tailwind template.
* **Typography & Layout:** Bold, unique typography with generous whitespace and a distinctive visual identity. 
* **Responsiveness:** Mobile-first approach, ensuring the AI chat interface is highly usable on small screens.

## 7. Constraints & Out of Scope (What it MUST NOT do)
* **No Admin Execution via AI:** The public AI Assistant must be strictly read-only.
* **No AI Hallucinations:** The AI Assistant MUST NOT invent skills or projects. If it does not know the answer based on the RAG context, it must politely decline to answer.
* **No Prompt Leakage:** The AI system prompt must be securely handled on the server side (Next.js API routes) and never revealed.
* **No Heavy Local Processing:** Must not rely on locally hosted LLMs or heavy local databases.
* **No "Jarvis" Admin Bot & No Multi-Role Auth:** Task-running admin bots and teacher tracking systems are explicitly OUT OF SCOPE for Phase 1. 

## 8. Definition of Done (Phase 1)
Phase 1 is considered officially complete and ready for deployment when:
1. The Next.js frontend is deployed on Vercel and successfully connects to the Supabase database.
2. The Admin panel is secured behind Supabase Auth, and the owner can successfully perform CRUD operations on both Projects and Profile Content.
3. Adding/updating content in the Admin panel successfully triggers vector generation and saves to Supabase Vector.
4. The public AI Assistant correctly answers 5 distinct sample questions regarding the developer's background and projects without hallucinating.
5. Rate limiting successfully blocks a user after exceeding the message threshold.
