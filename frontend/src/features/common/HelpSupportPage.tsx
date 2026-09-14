import { LifeBuoy, Mail, MessageCircleQuestion, ShieldQuestion, Timer } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader } from '../../components/common';
import { getCurrentUser } from '../../lib/api';

const faqsByRole: Record<string, { icon: typeof Timer; question: string; answer: string }[]> = {
  STUDENT: [
    {
      icon: Timer,
      question: 'What happens if I run out of time during an exam?',
      answer:
        'The timer is enforced by the server, so closing or refreshing the tab will not stop it. When time runs out, whatever you have answered so far is submitted automatically.',
    },
    {
      icon: ShieldQuestion,
      question: 'Can I change an answer after submitting?',
      answer: 'No — once an exam is submitted, answers are locked and cannot be changed.',
    },
    {
      icon: MessageCircleQuestion,
      question: 'Why can\u2019t I see the correct answers for a result?',
      answer:
        'Your teacher controls whether answer review is enabled for each exam. If it\u2019s off, you\u2019ll see your own selections but not the correct answers.',
    },
  ],
  TEACHER: [
    {
      icon: Timer,
      question: 'Can I edit an exam after publishing it?',
      answer: 'Once an exam has at least one student attempt, it can no longer be edited — create a new exam instead.',
    },
    {
      icon: ShieldQuestion,
      question: 'Why can\u2019t I delete a course?',
      answer: 'A course with existing questions or exams is protected from deletion. Remove those first, or leave the course in place.',
    },
    {
      icon: MessageCircleQuestion,
      question: 'How does question randomization work?',
      answer:
        'Each exam draws a random subset from its question pool per attempt, and you can independently randomize question and option order when creating the exam.',
    },
  ],
  ADMIN: [
    {
      icon: ShieldQuestion,
      question: 'How do I disable an account without deleting it?',
      answer: 'Use the Disable action in User Management — it blocks sign-in while preserving all of that user\u2019s data.',
    },
    {
      icon: MessageCircleQuestion,
      question: 'Where can I review recent security-relevant activity?',
      answer: 'The Audit Logs page records actions like logins, course changes, and exam publishing across the whole platform.',
    },
    {
      icon: Timer,
      question: 'Can I edit a course or exam that belongs to a teacher?',
      answer: 'Admin views are read-only by design — course and exam edits stay with the owning teacher to keep authorship clear.',
    },
  ],
};

export default function HelpSupportPage() {
  const user = getCurrentUser();
  const faqs = faqsByRole[user?.role ?? 'STUDENT'];

  return (
    <DashboardLayout title="Help & Support" description="Answers to common questions, and how to reach us.">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card>
          <CardHeader title="Frequently asked questions" />
          <div className="divide-y divide-primary-100/60">
            {faqs.map((f) => (
              <div key={f.question} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <f.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{f.question}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-400">{f.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="h-fit">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <p className="mt-3 font-bold text-ink-900">Still stuck?</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-400">
            Reach out and we'll get back to you as soon as we can.
          </p>
          <a
            href="mailto:support@mcqexamportal.test"
            className="mt-4 flex items-center gap-2.5 rounded-xl bg-primary-50 px-3.5 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-100"
          >
            <Mail className="h-4 w-4" />
            support@mcqexamportal.test
          </a>
        </Card>
      </div>
    </DashboardLayout>
  );
}
