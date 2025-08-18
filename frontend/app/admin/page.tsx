"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const adminStatus = localStorage.getItem("admin");
    const username = localStorage.getItem("username");
    
    if (adminStatus === "true" && username) {
      setIsAuthenticated(true);
    } else {
      // Not authenticated, redirect to sign-in
      router.push("/sign-in");
    }
    
    setIsLoading(false);
  }, [router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only render admin dashboard if authenticated
  if (!isAuthenticated) {
    return null; // Will redirect to sign-in
  }

  return <AdminDashboard />;
}
