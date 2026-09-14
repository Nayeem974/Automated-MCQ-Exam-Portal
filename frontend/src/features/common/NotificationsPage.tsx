import { BellRing } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FeaturePending } from '../../components/common';

// No Notification model/endpoint exists on the backend yet (see the
// redesign report). This keeps the nav item and bell icon fully wired up
// visually without inventing fake alerts.
export default function NotificationsPage() {
  return (
    <DashboardLayout title="Notifications" description="Stay on top of exam updates and announcements.">
      <FeaturePending
        icon={<BellRing className="h-7 w-7" />}
        title="No notifications yet"
        description="This portal doesn't push live notifications yet — once it does, exam reminders, published results, and announcements will land here."
        unlocksWhen="Needs a Notification model and a GET /notifications endpoint on the backend."
      />
    </DashboardLayout>
  );
}
