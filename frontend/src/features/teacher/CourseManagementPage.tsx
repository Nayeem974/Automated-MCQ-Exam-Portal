import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ListChecks, Plus, Trash2, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Button, Card, EmptyState, ErrorState, InlineError, Modal, SkeletonCard } from '../../components/common';
import { api } from '../../lib/api';

interface Course {
  id: string;
  title: string;
  description: string | null;
  _count: { questions: number; exams: number; enrollments: number };
}

export default function CourseManagementPage() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Course | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    setError(null);
    api.get<Course[]>('/courses/mine').then(setCourses).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    setTitle('');
    setDescription('');
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(c: Course) {
    setEditing(c);
    setTitle(c.title);
    setDescription(c.description ?? '');
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await api.patch(`/courses/${editing.id}`, { title, description });
      } else {
        await api.post('/courses', { title, description });
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: Course) {
    if (!confirm(`Delete "${c.title}"? This can't be undone.`)) return;
    try {
      await api.delete(`/courses/${c.id}`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <DashboardLayout
      title="Manage Courses"
      description="Create courses and open their question banks."
      actions={
        <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
          New course
        </Button>
      }
    >
      {error && <ErrorState message={error} onRetry={load} />}

      {!error && courses === null && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!error && courses !== null && courses.length === 0 && (
        <Card>
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="No courses yet"
            description="Create your first course to start building exams."
            action={
              <Button size="sm" onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
                New course
              </Button>
            }
          />
        </Card>
      )}

      {!error && courses !== null && courses.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Card key={c.id} className="flex flex-col">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <p className="mt-3 font-bold text-ink-900">{c.title}</p>
              {c.description && <p className="mt-1 line-clamp-2 text-sm text-ink-400">{c.description}</p>}

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-400">
                <span className="flex items-center gap-1">
                  <ListChecks className="h-3.5 w-3.5" /> {c._count.questions} questions
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" /> {c._count.exams} exams
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {c._count.enrollments} enrolled
                </span>
              </div>

              <div className="mt-4 flex flex-1 items-end gap-2">
                <Link
                  to={`/teacher/courses/${c.id}/questions`}
                  className="flex-1 rounded-xl border border-primary-200 px-3 py-2 text-center text-sm font-semibold text-primary-700 hover:bg-primary-50"
                >
                  Question bank
                </Link>
                <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                  Edit
                </Button>
                <button
                  onClick={() => handleDelete(c)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-danger-100 text-danger-600 hover:bg-danger-50"
                  aria-label={`Delete ${c.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit course' : 'New course'}>
        <form onSubmit={handleSubmit}>
          {formError && <InlineError message={formError} />}
          <label className="mb-3 block text-sm font-medium text-ink-700">
            Title
            <input
              required
              minLength={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-primary-100 px-3 py-2 text-sm outline-none focus:border-primary-300"
            />
          </label>
          <label className="mb-5 block text-sm font-medium text-ink-700">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-primary-100 px-3 py-2 text-sm outline-none focus:border-primary-300"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
