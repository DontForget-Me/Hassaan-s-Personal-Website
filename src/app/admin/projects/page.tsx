'use client';

import { useState, useEffect } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import type { Project } from '@/types/database';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', tech_stack: '', github_url: '' });
  const [error, setError] = useState('');

  useEffect(() => { loadProjects(); }, []);

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/projects');
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setProjects([]);
    }
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setForm({ title: '', description: '', tech_stack: '', github_url: '' });
    setShowForm(true);
    setError('');
  }

  function openEdit(project: Project) {
    setEditing(project);
    setForm({
      title: project.title,
      description: project.description,
      tech_stack: project.tech_stack?.join(', ') ?? '',
      github_url: project.github_url ?? '',
    });
    setShowForm(true);
    setError('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');

    const payload = {
      ...(editing ? { id: editing.id } : {}),
      title: form.title,
      description: form.description,
      tech_stack: form.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
      github_url: form.github_url,
    };

    try {
      const res = await fetch('/api/admin/projects', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? 'Failed to save');
        return;
      }

      setShowForm(false);
      await loadProjects();
    } catch {
      setError('Failed to save project');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try {
      await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' });
      await loadProjects();
    } catch {
      // ignore
    }
  }

  return (
    <>
      <AdminNav />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Projects</h1>
            <p className="text-sm text-zinc-500">Manage your portfolio projects.</p>
          </div>
          {!showForm && (
            <Button onClick={openNew} size="sm">+ New Project</Button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-sm text-red-600">{error}</div>
        )}

        {showForm && (
          <Card className="mb-8">
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Project name"
                required
              />
              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the project..."
              />
              <Input
                label="Tech Stack (comma-separated)"
                value={form.tech_stack}
                onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
                placeholder="React, Node.js, PostgreSQL"
              />
              <Input
                label="GitHub URL"
                value={form.github_url}
                onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                placeholder="https://github.com/..."
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <p className="text-zinc-400 text-sm">Loading...</p>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <p>No projects yet.</p>
            <Button onClick={openNew} variant="ghost" className="mt-2">
              Add your first project
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-start justify-between p-4 rounded-lg border border-zinc-200"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-zinc-900 truncate">{project.title}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-2 mt-0.5">
                    {project.description || 'No description'}
                  </p>
                  {project.tech_stack && project.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {project.tech_stack.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 text-xs rounded bg-zinc-100 text-zinc-600">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(project)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(project.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
