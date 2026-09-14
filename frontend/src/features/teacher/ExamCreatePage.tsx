import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckSquare, ClipboardList, ListChecks, Settings2, Square } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Button, Card, CardHeader, InlineError } from '../../components/common';
import { api } from '../../lib/api';

interface Course {
  id: string;
  title: string;
}

interface Question {
  id: string;
  text: string;
  marks: number;
}

export default function ExamCreatePage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [questionsPerAttempt, setQuestionsPerAttempt] = useState(10);
  const [passingMark, setPassingMark] = useState(50);
  const [maxAttempts, setMaxAttempts] = useState<number | ''>('');
  const [revealAnswers, setRevealAnswers] = useState(false);
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(true);
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<Course[]>('/courses/mine')
      .then(setCourses)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load your courses'));
  }, []);

  useEffect(() => {
    if (!courseId) {
      setQuestions([]);
      return;
    }
    api
      .get<Question[]>(`/questions?courseId=${courseId}`)
      .then((qs) => {
        setQuestions(qs);
        setSelectedIds(new Set());
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load questions'));
  }, [courseId]);

  function toggleQuestion(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(questions.map((q) => q.id)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (selectedIds.size === 0) {
      setError('Select at least one question for the pool');
      return;
    }
    if (questionsPerAttempt > selectedIds.size) {
      setError(`Questions per attempt (${questionsPerAttempt}) cannot exceed the selected pool (${selectedIds.size})`);
      return;
    }
    if (scheduledStart && scheduledEnd && new Date(scheduledEnd) <= new Date(scheduledStart)) {
      setError('End time must be after start time');
      return;
    }

    setSaving(true);
    try {
      await api.post('/exams', {
        courseId,
        title,
        description,
        durationMinutes,
        questionsPerAttempt,
        passingMark,
        maxAttempts: maxAttempts === '' ? undefined : maxAttempts,
        revealAnswers,
        randomizeQuestions,
        randomizeOptions,
        scheduledStart: scheduledStart || undefined,
        scheduledEnd: scheduledEnd || undefined,
        questionIds: Array.from(selectedIds),
      });
      navigate('/teacher/exams');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create exam');
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'mt-1 w-full rounded-xl border border-primary-100 px-3 py-2 text-sm outline-none focus:border-primary-300';
  const labelClass = 'text-sm font-medium text-ink-700';

  return (
    <DashboardLayout title="Create Exam" description="Build a new timed exam from your question pool.">
      {error && <InlineError message={error} />}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader
            title="Basics"
            subtitle="Which course this exam belongs to, and what students will see."
            action={
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <BookOpen className="h-4 w-4" />
              </div>
            }
          />
          <label className={`mb-3 block ${labelClass}`}>
            Course
            <select
              required
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a course…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className={`mb-3 block ${labelClass}`}>
            Title
            <input
              required
              minLength={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={`block ${labelClass}`}>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputClass} />
          </label>
        </Card>

        <Card>
          <CardHeader
            title="Rules"
            subtitle="Timing, grading, and scheduling for this exam."
            action={
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-info-50 text-info-600">
                <Settings2 className="h-4 w-4" />
              </div>
            }
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className={labelClass}>
              Duration (min)
              <input
                type="number"
                min={1}
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Questions per attempt
              <input
                type="number"
                min={1}
                required
                value={questionsPerAttempt}
                onChange={(e) => setQuestionsPerAttempt(parseInt(e.target.value, 10))}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Passing mark (%)
              <input
                type="number"
                min={0}
                max={100}
                required
                value={passingMark}
                onChange={(e) => setPassingMark(parseFloat(e.target.value))}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Max attempts
              <input
                type="number"
                min={1}
                placeholder="Unlimited"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Opens at (optional)
              <input
                type="datetime-local"
                value={scheduledStart}
                onChange={(e) => setScheduledStart(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Closes at (optional)
              <input
                type="datetime-local"
                value={scheduledEnd}
                onChange={(e) => setScheduledEnd(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-4">
            <Toggle checked={randomizeQuestions} onChange={setRandomizeQuestions} label="Randomize question order" />
            <Toggle checked={randomizeOptions} onChange={setRandomizeOptions} label="Randomize option order" />
            <Toggle checked={revealAnswers} onChange={setRevealAnswers} label="Reveal correct answers after submission" />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Question pool"
            subtitle={`Selected ${selectedIds.size} of ${questions.length} — each attempt randomly draws ${questionsPerAttempt} from this pool.`}
            action={
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-50 text-success-700">
                <ListChecks className="h-4 w-4" />
              </div>
            }
          />
          {!courseId ? (
            <p className="text-sm text-ink-400">Select a course first.</p>
          ) : questions.length === 0 ? (
            <p className="text-sm text-ink-400">This course has no questions yet — add some in the question bank.</p>
          ) : (
            <>
              <button
                type="button"
                onClick={selectAll}
                className="mb-2 text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                Select all
              </button>
              <div className="max-h-72 space-y-1 overflow-y-auto rounded-xl bg-primary-50/40 p-2">
                {questions.map((q) => {
                  const checked = selectedIds.has(q.id);
                  return (
                    <label
                      key={q.id}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${checked ? 'bg-white shadow-soft' : 'hover:bg-white/70'}`}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggleQuestion(q.id)} className="sr-only" />
                      {checked ? (
                        <CheckSquare className="h-4 w-4 shrink-0 text-primary-600" />
                      ) : (
                        <Square className="h-4 w-4 shrink-0 text-ink-300" />
                      )}
                      <span className="text-ink-700">{q.text}</span>
                      <span className="ml-auto shrink-0 text-xs text-ink-400">{q.marks} mark</span>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </Card>

        <Button type="submit" size="lg" loading={saving} leftIcon={<ClipboardList className="h-4 w-4" />}>
          {saving ? 'Creating…' : 'Create exam (draft)'}
        </Button>
      </form>
    </DashboardLayout>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
      <span
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-ink-900/15'}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-1'}`}
        />
      </span>
      {label}
    </label>
  );
}
