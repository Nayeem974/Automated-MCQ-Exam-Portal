import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Badge, Button, Card, EmptyState, ErrorState, InlineError, Modal, SkeletonCard } from '../../components/common';
import type { BadgeTone } from '../../components/common';
import { api } from '../../lib/api';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

interface OptionInput {
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  explanation: string | null;
  difficulty: Difficulty | null;
  marks: number;
  negativeMarks: number;
  options: (OptionInput & { id: string })[];
}

const emptyOptions = (): OptionInput[] => [
  { text: '', isCorrect: true },
  { text: '', isCorrect: false },
  { text: '', isCorrect: false },
  { text: '', isCorrect: false },
];

const difficultyTone: Record<Difficulty, BadgeTone> = { EASY: 'success', MEDIUM: 'warning', HARD: 'danger' };

export default function QuestionBankPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Question | null>(null);
  const [text, setText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<Difficulty | ''>('');
  const [marks, setMarks] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0);
  const [options, setOptions] = useState<OptionInput[]>(emptyOptions());

  function load() {
    if (!courseId) return;
    setError(null);
    const params = new URLSearchParams({ courseId });
    if (search) params.set('search', search);
    if (difficulty) params.set('difficulty', difficulty);
    api
      .get<Question[]>(`/questions?${params.toString()}`)
      .then(setQuestions)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load questions'));
  }

  useEffect(load, [courseId, search, difficulty]);

  function openCreate() {
    setEditing(null);
    setText('');
    setExplanation('');
    setFormDifficulty('');
    setMarks(1);
    setNegativeMarks(0);
    setOptions(emptyOptions());
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(q: Question) {
    setEditing(q);
    setText(q.text);
    setExplanation(q.explanation ?? '');
    setFormDifficulty(q.difficulty ?? '');
    setMarks(q.marks);
    setNegativeMarks(q.negativeMarks);
    setOptions(q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })));
    setFormError(null);
    setFormOpen(true);
  }

  function updateOptionText(i: number, value: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, text: value } : o)));
  }

  function setCorrect(i: number) {
    setOptions((prev) => prev.map((o, idx) => ({ ...o, isCorrect: idx === i })));
  }

  function addOption() {
    setOptions((prev) => [...prev, { text: '', isCorrect: false }]);
  }

  function removeOption(i: number) {
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (options.some((o) => !o.text.trim())) {
      setFormError('All options need text');
      return;
    }
    if (!options.some((o) => o.isCorrect)) {
      setFormError('Mark exactly one option as correct');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const payload = { text, explanation, difficulty: formDifficulty || undefined, marks, negativeMarks, options };
        await api.patch(`/questions/${editing.id}`, payload);
      } else {
        const payload = { courseId, text, explanation, difficulty: formDifficulty || undefined, marks, negativeMarks, options };
        await api.post('/questions', payload);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(q: Question) {
    if (!confirm('Delete this question? This cannot be undone.')) return;
    try {
      await api.delete(`/questions/${q.id}`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <DashboardLayout
      title="Question Bank"
      description="Add, edit, and organize the questions exams draw from."
      actions={
        <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
          New question
        </Button>
      }
    >
      <Link
        to="/teacher/courses"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to courses
      </Link>

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="h-10 w-56 rounded-xl border border-primary-100 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary-300"
            />
          </div>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty | '')}
            className="h-10 rounded-xl border border-primary-100 bg-white px-3 text-sm outline-none focus:border-primary-300"
          >
            <option value="">All difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      )}

      {!error && questions === null && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </div>
      )}

      {!error && questions !== null && questions.length === 0 && (
        <Card>
          <EmptyState
            title="No questions match"
            description="Add a question to start building this course's bank, or clear your search/filter."
            action={
              <Button size="sm" onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
                New question
              </Button>
            }
          />
        </Card>
      )}

      {!error && questions !== null && questions.length > 0 && (
        <div className="space-y-3">
          {questions.map((q) => (
            <Card key={q.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900">{q.text}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-400">
                    <span>
                      {q.marks} mark{q.marks !== 1 ? 's' : ''} · −{q.negativeMarks} negative
                    </span>
                    {q.difficulty && <Badge tone={difficultyTone[q.difficulty]}>{q.difficulty}</Badge>}
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {q.options.map((o) => (
                      <li
                        key={o.id}
                        className={`flex items-center gap-2 text-sm ${o.isCorrect ? 'font-semibold text-success-700' : 'text-ink-500'}`}
                      >
                        {o.isCorrect ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success-500" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 shrink-0 text-ink-300" />
                        )}
                        {o.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => openEdit(q)}
                    aria-label="Edit question"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary-100 text-primary-600 hover:bg-primary-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q)}
                    aria-label="Delete question"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-danger-100 text-danger-600 hover:bg-danger-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit question' : 'New question'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          {formError && <InlineError message={formError} />}

          <label className="mb-3 block text-sm font-medium text-ink-700">
            Question text
            <textarea
              required
              minLength={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-primary-100 px-3 py-2 text-sm outline-none focus:border-primary-300"
            />
          </label>

          <div className="mb-4 grid grid-cols-3 gap-3">
            <label className="text-sm font-medium text-ink-700">
              Marks
              <input
                type="number"
                step="0.25"
                min={0.25}
                value={marks}
                onChange={(e) => setMarks(parseFloat(e.target.value))}
                className="mt-1 w-full rounded-xl border border-primary-100 px-3 py-2 text-sm outline-none focus:border-primary-300"
              />
            </label>
            <label className="text-sm font-medium text-ink-700">
              Negative marks
              <input
                type="number"
                step="0.25"
                min={0}
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(parseFloat(e.target.value))}
                className="mt-1 w-full rounded-xl border border-primary-100 px-3 py-2 text-sm outline-none focus:border-primary-300"
              />
            </label>
            <label className="text-sm font-medium text-ink-700">
              Difficulty
              <select
                value={formDifficulty}
                onChange={(e) => setFormDifficulty(e.target.value as Difficulty | '')}
                className="mt-1 w-full rounded-xl border border-primary-100 px-3 py-2 text-sm outline-none focus:border-primary-300"
              >
                <option value="">—</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </label>
          </div>

          <p className="mb-2 text-sm font-medium text-ink-700">Options (select the correct one)</p>
          <div className="mb-4 space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCorrect(i)}
                  aria-label={opt.isCorrect ? 'Correct option' : 'Mark as correct'}
                  className="shrink-0"
                >
                  {opt.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-success-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-ink-300" />
                  )}
                </button>
                <input
                  required
                  value={opt.text}
                  onChange={(e) => updateOptionText(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 rounded-xl border border-primary-100 px-3 py-2 text-sm outline-none focus:border-primary-300"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    aria-label="Remove option"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-400 hover:bg-danger-50 hover:text-danger-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              + Add option
            </button>
          </div>

          <label className="mb-5 block text-sm font-medium text-ink-700">
            Explanation <span className="font-normal text-ink-400">(optional, shown if answer review is enabled)</span>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
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
