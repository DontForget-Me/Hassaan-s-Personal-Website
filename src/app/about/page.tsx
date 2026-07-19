import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
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

const SECTION_LABELS: Record<string, string> = {
  bio: 'Bio',
  skills: 'Skills',
  education: 'Education',
  experience: 'Experience',
  certifications: 'Certifications',
};

const defaultContent: Record<string, string> = {
  bio: 'I am a full-stack developer and AI engineer with a passion for building intelligent, user-focused applications. I specialize in modern JavaScript/TypeScript ecosystems including React, Next.js, and Node.js, with growing expertise in AI integrations and RAG systems.',
  skills: 'TypeScript, JavaScript, React, Next.js, Node.js, Python, Supabase, PostgreSQL, Tailwind CSS, Git, REST APIs, AI/ML Integration, RAG Systems',
  education: 'Details coming soon.',
  experience: 'Details coming soon.',
  certifications: 'Details coming soon.',
};

function renderContent(section: string, content: string) {
  if (section === 'skills') {
    const items = content.split(',').map((s) => s.trim()).filter(Boolean);
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((skill) => (
          <span
            key={skill}
            className="rounded-full border px-3.5 py-1.5 text-sm transition-colors"
            style={{
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              borderColor: 'var(--accent)',
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    );
  }

  return (
    <p
      className="text-base leading-relaxed"
      style={{ color: 'var(--text-secondary)' }}
    >
      {content}
    </p>
  );
}

export default async function AboutPage() {
  const sections = await getProfileSections();
  const hasData = sections.length > 0;
  const items = hasData
    ? sections
    : Object.entries(defaultContent).map(([section_name, content]) => ({
        id: section_name,
        section_name,
        content,
        created_at: '',
      }));

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="relative min-h-screen px-4 pt-28 pb-20 sm:pt-36 sm:pb-28">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'var(--glow)' }}
          />

          <div className="relative mx-auto max-w-3xl">
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
                Background
              </span>
              <h1
                className="mt-4 text-3xl font-light tracking-tight sm:text-4xl lg:text-5xl"
                style={{ color: 'var(--text-primary)' }}
              >
                About
              </h1>
              <p
                className="mt-2 text-base"
                style={{ color: 'var(--text-secondary)' }}
              >
                Professional background and resume.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-14">
              {items.map((item, i) => (
                <section key={item.id}>
                  <div className="grid gap-3 sm:grid-cols-[140px_1fr] sm:gap-8">
                    <h2
                      className="text-xs font-semibold uppercase tracking-[0.15em]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {SECTION_LABELS[item.section_name] ?? item.section_name}
                    </h2>
                    <div>
                      {renderContent(item.section_name, item.content)}
                    </div>
                  </div>
                  {/* Separator */}
                  {i < items.length - 1 && (
                    <hr
                      className="mt-10 border-0"
                      style={{
                        height: '1px',
                        background: `linear-gradient(90deg, var(--border) 30%, transparent)`,
                      }}
                    />
                  )}
                </section>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
