import { BookMarked } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FeaturePending } from '../../components/common';

// The backend's /questions endpoints are locked to Role.TEACHER at the
// controller level — almost certainly deliberate, since a student-facing
// question bank would otherwise let students browse exam answers ahead of
// time. Surfacing this safely needs a purpose-built, student-safe
// endpoint rather than reusing the teacher one. See the redesign report.
export default function StudentQuestionBankPage() {
  return (
    <DashboardLayout title="Question Bank" description="Browse topics and questions to sharpen your revision.">
      <FeaturePending
        icon={<BookMarked className="h-7 w-7" />}
        title="Question bank isn't open to students yet"
        description="The full question bank (with correct answers) is only visible to teachers today, so students can't get an early look at exam content. A separate, answer-free browsing endpoint would be needed to enable this for students."
        unlocksWhen="Needs a student-safe endpoint — the current API's /questions routes are teacher-only by design."
      />
    </DashboardLayout>
  );
}
