import Nav from '@/components/Nav';
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
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
          Projects
        </h1>
        <p className="mt-2 text-zinc-600">
          A selection of projects I&apos;ve built.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {projects.length === 0 && (
            <p className="text-zinc-400 col-span-full text-center py-12">
              Projects coming soon.
            </p>
          )}

          {projects.map((project) => (
            <article
              key={project.id}
              className="rounded-xl border border-zinc-200 p-6 hover:border-zinc-300 transition-colors"
            >
              <h2 className="font-semibold text-lg text-zinc-900">
                {project.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed line-clamp-3">
                {project.description}
              </p>
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-xs rounded-md bg-zinc-100 text-zinc-600"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View on GitHub &rarr;
                </a>
              )}
            </article>
          ))}
        </div>
      </main>

      <footer className="border-t border-zinc-200 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} Muhammad Hassaan Khan
        </div>
      </footer>
    </>
  );
}
