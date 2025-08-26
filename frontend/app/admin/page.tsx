"use client";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { NotificationProvider } from "@/contexts/notification-context";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <NotificationProvider>
        <AdminDashboard />
      </NotificationProvider>
    </ProtectedRoute>
  );
}
