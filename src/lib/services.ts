export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon: string;
}

export const SERVICES: Service[] = [
  {
    id: 'web-development',
    title: 'Web Development',
    description:
      'Modern, performant web applications built with React, Next.js, and TypeScript. Responsive, accessible, and optimized for speed.',
    features: [
      'Single-page & multi-page apps',
      'Server-side rendering (SSR)',
      'REST & GraphQL APIs',
      'Payment & auth integration',
      'Responsive design',
    ],
    icon: '🌐',
  },
  {
    id: 'ai-integration',
    title: 'AI Integration',
    description:
      'Integrate LLMs, RAG pipelines, and intelligent features into your applications. From chatbots to content generation.',
    features: [
      'RAG (Retrieval-Augmented Generation)',
      'AI chatbots & assistants',
      'Content summarization',
      'Semantic search',
      'Custom LLM workflows',
    ],
    icon: '🤖',
  },
  {
    id: 'backend-apis',
    title: 'Backend & APIs',
    description:
      'Scalable backend services, database design, and API development using Node.js, Supabase, and PostgreSQL.',
    features: [
      'RESTful API design',
      'Supabase & PostgreSQL',
      'Authentication & authorization',
      'Database schema design',
      'Cloud deployment (Vercel)',
    ],
    icon: '⚡',
  },
  {
    id: 'consulting',
    title: 'Technical Consulting',
    description:
      'Architecture review, code audits, technology selection, and guidance for your software projects.',
    features: [
      'Architecture & tech stack advice',
      'Code quality reviews',
      'Performance optimization',
      'Migration planning',
      'Mentoring & best practices',
    ],
    icon: '📋',
  },
];
