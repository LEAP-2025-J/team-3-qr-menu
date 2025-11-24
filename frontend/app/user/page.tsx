"use client";

import { UserDashboard } from "@/components/admin/users/user-dashboard";
import { NotificationProvider } from "@/contexts/notification-context";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function UserPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <NotificationProvider>
        <UserDashboard />
      </NotificationProvider>
    </ProtectedRoute>
  );
}
