import Nav from '@/components/Nav';
import ChatWidget from '@/components/ai/ChatWidget';

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
              Muhammad Hassaan Khan
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-zinc-600 leading-relaxed">
              Full-stack developer and AI engineer. I build modern web applications
              with clean architecture and intelligent features.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                React &bull; Next.js
              </span>
              <span className="px-3 py-1 text-sm rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                TypeScript
              </span>
              <span className="px-3 py-1 text-sm rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                AI / RAG
              </span>
              <span className="px-3 py-1 text-sm rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                Supabase
              </span>
            </div>
          </div>
        </section>

        {/* AI Chat Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28">
          <div className="max-w-lg mx-auto">
            <ChatWidget />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} Muhammad Hassaan Khan
        </div>
      </footer>
    </>
  );
}
