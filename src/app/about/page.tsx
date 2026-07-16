import Nav from '@/components/Nav';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ProfileContent } from '@/types/database';

export const dynamic = 'force-dynamic';

async function getProfileSections(): Promise<ProfileContent[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('profile_content')
    .select('*')
    .order('section_name');
  return data ?? [];
}

export default async function AboutPage() {
  const sections = await getProfileSections();

  // Default content for sections that haven't been filled in yet
  const defaultContent: Record<string, string> = {
    bio: 'I am a full-stack developer and AI engineer with a passion for building intelligent, user-focused applications. I specialize in modern JavaScript/TypeScript ecosystems including React, Next.js, and Node.js, with growing expertise in AI integrations and RAG systems.',
    skills: 'TypeScript, JavaScript, React, Next.js, Node.js, Python, Supabase, PostgreSQL, Tailwind CSS, Git, REST APIs, AI/ML Integration, RAG Systems',
    education: 'Details coming soon.',
    experience: 'Details coming soon.',
    certifications: 'Details coming soon.',
  };

  return (
    <>
      <Nav />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
          About
        </h1>
        <p className="mt-2 text-zinc-600">
          Professional background and resume.
        </p>

        <div className="mt-10 space-y-8">
          {sections.length === 0
            ? Object.entries(defaultContent).map(([section, content]) => (
                <section key={section}>
                  <h2 className="text-lg font-semibold text-zinc-900 capitalize mb-3">
                    {section === 'bio' ? 'Bio' : section.replace('_', ' ')}
                  </h2>
                  {section === 'skills' ? (
                    <div className="flex flex-wrap gap-2">
                      {content.split(', ').map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 text-sm rounded-full bg-zinc-100 text-zinc-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-600 leading-relaxed whitespace-pre-line">
                      {content}
                    </p>
                  )}
                </section>
              ))
            : sections.map((section) => (
                <section key={section.id}>
                  <h2 className="text-lg font-semibold text-zinc-900 capitalize mb-3">
                    {section.section_name === 'bio'
                      ? 'Bio'
                      : section.section_name.replace('_', ' ')}
                  </h2>
                  {section.section_name === 'skills' ? (
                    <div className="flex flex-wrap gap-2">
                      {section.content.split(',').map((skill) => (
                        <span
                          key={skill.trim()}
                          className="px-3 py-1 text-sm rounded-full bg-zinc-100 text-zinc-700"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-600 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  )}
                </section>
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
