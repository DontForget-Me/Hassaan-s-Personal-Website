'use client';

import { useState } from 'react';
import type { Project } from '@/types/database';

export default function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border p-7 transition-all duration-300"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: hovered ? 'var(--accent)' : 'var(--border)',
        boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Gradient accent line */}
      <div
        className="absolute top-0 left-0 h-0.5 transition-all duration-300"
        style={{
          width: hovered ? '100%' : '0%',
          background: 'linear-gradient(90deg, var(--accent), #d946ef)',
        }}
      />

      {/* Number + GitHub */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-mono"
          style={{ color: hovered ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors"
            style={{ color: hovered ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            GitHub &nearr;
          </a>
        )}
      </div>

      {/* Title */}
      <h2
        className="mt-4 text-xl font-medium tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        {project.title}
      </h2>

      {/* Description */}
      <p
        className="mt-2 text-sm leading-relaxed line-clamp-3"
        style={{ color: 'var(--text-secondary)' }}
      >
        {project.description || 'No description'}
      </p>

      {/* Tech stack */}
      {project.tech_stack && project.tech_stack.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.tech_stack.map((tech) => (
            <span
              key={tech}
              className="rounded-md px-2.5 py-1 text-xs transition-colors"
              style={{
                backgroundColor: hovered ? 'var(--accent-light)' : 'var(--bg-secondary)',
                color: hovered ? 'var(--accent)' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: hovered ? 'var(--accent)' : 'var(--border-light)',
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
