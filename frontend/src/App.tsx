import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';

import AdminDashboard from './features/admin/AdminDashboard';
import UserManagementPage from './features/admin/UserManagementPage';
import AdminCoursesPage from './features/admin/AdminCoursesPage';
import AdminExamsPage from './features/admin/AdminExamsPage';
import AuditLogPage from './features/admin/AuditLogPage';

import TeacherDashboard from './features/teacher/TeacherDashboard';
import CourseManagementPage from './features/teacher/CourseManagementPage';
import QuestionBankPage from './features/teacher/QuestionBankPage';
import ExamCreatePage from './features/teacher/ExamCreatePage';
import ExamListPage from './features/teacher/ExamListPage';
import ExamAnalyticsPage from './features/teacher/ExamAnalyticsPage';

import StudentDashboard from './features/student/StudentDashboard';
import MyExamsPage from './features/student/MyExamsPage';
import ExamInstructionsPage from './features/student/ExamInstructionsPage';
import ExamTakingPage from './features/student/ExamTakingPage';
import ExamResultDetailPage from './features/student/ExamResultDetailPage';
import StudentResultHistoryPage from './features/student/StudentResultHistoryPage';
import StudentQuestionBankPage from './features/student/StudentQuestionBankPage';
import PracticeTestPage from './features/student/PracticeTestPage';

import ProfilePage from './features/common/ProfilePage';
import NotificationsPage from './features/common/NotificationsPage';
import HelpSupportPage from './features/common/HelpSupportPage';

import { getCurrentUser } from './lib/api';

function Home() {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  const home = { ADMIN: '/admin', TEACHER: '/teacher', STUDENT: '/student' }[user.role];
  return <Navigate to={home} replace />;
}

const ALL_ROLES = ['ADMIN', 'TEACHER', 'STUDENT'] as const;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute allow={['ADMIN']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/courses" element={<AdminCoursesPage />} />
        <Route path="/admin/exams" element={<AdminExamsPage />} />
        <Route path="/admin/audit-logs" element={<AuditLogPage />} />
      </Route>

      <Route element={<ProtectedRoute allow={['TEACHER']} />}>
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/courses" element={<CourseManagementPage />} />
        <Route path="/teacher/courses/:courseId/questions" element={<QuestionBankPage />} />
        <Route path="/teacher/exams" element={<ExamListPage />} />
        <Route path="/teacher/exams/new" element={<ExamCreatePage />} />
        <Route path="/teacher/exams/:examId/analytics" element={<ExamAnalyticsPage />} />
      </Route>

      <Route element={<ProtectedRoute allow={['STUDENT']} />}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/exams" element={<MyExamsPage />} />
        <Route path="/student/question-bank" element={<StudentQuestionBankPage />} />
        <Route path="/student/practice" element={<PracticeTestPage />} />
        <Route path="/student/exam-instructions/:examId" element={<ExamInstructionsPage />} />
        {/* Full-screen exam UI intentionally has no shared Layout chrome (no nav away mid-exam) */}
        <Route path="/student/exam/:attemptId" element={<ExamTakingPage />} />
        <Route path="/student/results" element={<StudentResultHistoryPage />} />
        <Route path="/student/results/:resultId" element={<ExamResultDetailPage />} />
      </Route>

      {/* Shared account pages: same component mounted under each role's own
          prefix (rather than one route) so the sidebar's active-item
          highlighting and role-scoped nav config stay simple and correct. */}
      <Route element={<ProtectedRoute allow={[...ALL_ROLES]} />}>
        <Route path="/student/profile" element={<ProfilePage />} />
        <Route path="/student/notifications" element={<NotificationsPage />} />
        <Route path="/student/help" element={<HelpSupportPage />} />

        <Route path="/teacher/profile" element={<ProfilePage />} />
        <Route path="/teacher/notifications" element={<NotificationsPage />} />
        <Route path="/teacher/help" element={<HelpSupportPage />} />

        <Route path="/admin/profile" element={<ProfilePage />} />
        <Route path="/admin/notifications" element={<NotificationsPage />} />
        <Route path="/admin/help" element={<HelpSupportPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
