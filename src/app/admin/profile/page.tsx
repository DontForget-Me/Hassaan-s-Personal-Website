'use client';

import { useState, useEffect } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import type { ProfileContent } from '@/types/database';

const SECTION_LABELS: Record<string, string> = {
  bio: 'Bio',
  skills: 'Skills (comma-separated)',
  education: 'Education',
  experience: 'Experience',
  certifications: 'Certifications',
};

const VALID_SECTIONS = ['bio', 'skills', 'education', 'experience', 'certifications'];

export default function AdminProfilePage() {
  const [sections, setSections] = useState<ProfileContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => { loadSections(); }, []);

  async function loadSections() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/profile');
      const data = await res.json();
      const items = Array.isArray(data) ? data : [];
      setSections(items);

      // Populate editing content
      const content: Record<string, string> = {};
      for (const item of items) {
        content[item.id] = item.content;
      }
      for (const section of VALID_SECTIONS) {
        const existing = items.find((s: ProfileContent) => s.section_name === section);
        if (!existing) content[`new:${section}`] = '';
      }
      setEditingContent(content);
    } catch {
      setSections([]);
    }
    setLoading(false);
  }

  async function handleSave(item: ProfileContent | { id: string; section_name: string }) {
    const key = item.id;
    const content = editingContent[key] ?? '';
    setSaving(key);
    setError('');

    try {
      const isNew = key.startsWith('new:');
      const res = await fetch('/api/admin/profile', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isNew ? {} : { id: key }),
          section_name: item.section_name,
          content,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? 'Failed to save');
        return;
      }

      await loadSections();
    } catch {
      setError('Failed to save');
    }
    setSaving(null);
  }

  async function handleDelete(item: ProfileContent) {
    if (!confirm('Delete this section?')) return;
    try {
      await fetch(`/api/admin/profile?id=${item.id}`, { method: 'DELETE' });
      await loadSections();
    } catch {
      // ignore
    }
  }

  function getSectionItems() {
    const items: Array<ProfileContent | { id: string; section_name: string; content?: string }> = [];

    for (const section of VALID_SECTIONS) {
      const existing = sections.find((s) => s.section_name === section);
      if (existing) {
        items.push(existing);
      } else {
        items.push({ id: `new:${section}`, section_name: section });
      }
    }

    return items;
  }

  if (loading) {
    return (
      <>
        <AdminNav />
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-zinc-400 text-sm">Loading...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">Profile Content</h1>
          <p className="text-sm text-zinc-500">
            Manage your bio, skills, education, and more. Changes trigger AI embedding updates.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-6">
          {getSectionItems().map((item) => {
            const key = item.id;
            const content = editingContent[key] ?? '';
            const isNew = key.startsWith('new:');

            return (
              <Card key={key}>
                <h2 className="font-semibold text-zinc-900 mb-3 capitalize">
                  {SECTION_LABELS[item.section_name] ?? item.section_name}
                </h2>
                <Textarea
                  value={content}
                  onChange={(e) =>
                    setEditingContent({ ...editingContent, [key]: e.target.value })
                  }
                  placeholder={`Enter your ${item.section_name}...`}
                  rows={item.section_name === 'skills' ? 3 : 5}
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => handleSave(item as any)}
                    disabled={saving === key}
                  >
                    {saving === key ? 'Saving...' : isNew ? 'Create' : 'Save'}
                  </Button>
                  {!isNew && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(item as ProfileContent)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
