import { FormEvent, useEffect, useState } from 'react';
import { Ban, CheckCircle2, Pencil, Plus, Trash2, UserCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Avatar, Badge, Button, Card, EmptyState, ErrorState, InlineError, Modal, SkeletonRow } from '../../components/common';
import type { BadgeTone } from '../../components/common';
import { api } from '../../lib/api';

type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

const roleTone: Record<Role, BadgeTone> = { ADMIN: 'primary', TEACHER: 'info', STUDENT: 'success' };

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setError(null);
    const qs = roleFilter ? `?role=${roleFilter}` : '';
    api
      .get<User[]>(`/users${qs}`)
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load users'));
  }

  useEffect(load, [roleFilter]);

  function openCreate() {
    setEditing(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('STUDENT');
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(u: User) {
    setEditing(u);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        const payload: Record<string, unknown> = { name, email, role };
        if (password) payload.password = password;
        await api.patch(`/users/${editing.id}`, payload);
      } else {
        await api.post('/users', { name, email, password, role });
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u: User) {
    setBusyId(u.id);
    setError(null);
    try {
      await api.patch(`/users/${u.id}/active`, { isActive: !u.isActive });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(u: User) {
    if (!confirm(`Delete ${u.name}? This can't be undone.`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Delete failed — this account may still own courses, questions, exams, or attempts. Disable it instead.',
      );
    }
  }

  return (
    <DashboardLayout
      title="Manage Users"
      description="Create, edit, disable, or delete accounts and assign roles."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | '')}
            className="h-10 rounded-xl border border-primary-100 bg-white px-3 text-sm outline-none focus:border-primary-300"
          >
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="TEACHER">Teacher</option>
            <option value="STUDENT">Student</option>
          </select>
          <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
            New user
          </Button>
        </div>
      }
    >
      {error && <ErrorState message={error} onRetry={load} />}

      {!error && users === null && (
        <Card padded={false}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </Card>
      )}

      {!error && users !== null && users.length === 0 && (
        <Card>
          <EmptyState
            icon={<UserCircle2 className="h-6 w-6" />}
            title="No users match"
            description="Try a different role filter, or create a new account."
            action={
              <Button size="sm" onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
                New user
              </Button>
            }
          />
        </Card>
      )}

      {!error && users !== null && users.length > 0 && (
        <Card padded={false}>
          <ul className="divide-y divide-primary-100/60">
            {users.map((u) => (
              <li key={u.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={u.name} email={u.email} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-900">{u.name}</p>
                    <p className="truncate text-xs text-ink-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge tone={roleTone[u.role]}>{u.role}</Badge>
                  <Badge tone={u.isActive ? 'success' : 'danger'} dot>
                    {u.isActive ? 'Active' : 'Disabled'}
                  </Badge>
                  <button
                    onClick={() => openEdit(u)}
                    aria-label={`Edit ${u.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary-100 text-primary-600 hover:bg-primary-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(u)}
                    disabled={busyId === u.id}
                    aria-label={u.isActive ? `Disable ${u.name}` : `Enable ${u.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-warning-100 text-warning-600 hover:bg-warning-50 disabled:opacity-50"
                  >
                    {u.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => remove(u)}
                    aria-label={`Delete ${u.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-danger-100 text-danger-600 hover:bg-danger-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit user' : 'New user'}>
        <form onSubmit={handleSubmit}>
          {formError && <InlineError message={formError} />}

          <label className="mb-3 block text-sm font-medium text-ink-700">
            Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-primary-100 px-3 py-2 text-sm outline-none focus:border-primary-300"
            />
          </label>
          <label className="mb-3 block text-sm font-medium text-ink-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-primary-100 px-3 py-2 text-sm outline-none focus:border-primary-300"
            />
          </label>
          <label className="mb-3 block text-sm font-medium text-ink-700">
            {editing ? 'New password (leave blank to keep current)' : 'Password'}
            <input
              type="password"
              required={!editing}
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-primary-100 px-3 py-2 text-sm outline-none focus:border-primary-300"
            />
          </label>
          <label className="mb-5 block text-sm font-medium text-ink-700">
            Role
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="mt-1 w-full rounded-xl border border-primary-100 px-3 py-2 text-sm outline-none focus:border-primary-300"
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
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
