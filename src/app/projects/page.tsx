import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Project } from '@/types/database';

export const dynamic = 'force-dynamic';

async function getProjects(): Promise<Project[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="relative min-h-screen px-4 pt-28 pb-20 sm:pt-36 sm:pb-28">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'var(--glow)' }}
          />

          <div className="relative mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-14">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                style={{
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)',
                  backgroundColor: 'var(--accent-light)',
                }}
              >
                Portfolio
              </span>
              <h1
                className="mt-4 text-3xl font-light tracking-tight sm:text-4xl lg:text-5xl"
                style={{ color: 'var(--text-primary)' }}
              >
                Projects
              </h1>
              <p
                className="mt-2 text-base"
                style={{ color: 'var(--text-secondary)' }}
              >
                A selection of things I&apos;ve built.
              </p>
            </div>

            {/* Grid */}
            {projects.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center rounded-2xl border py-24"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Projects coming soon.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {projects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
