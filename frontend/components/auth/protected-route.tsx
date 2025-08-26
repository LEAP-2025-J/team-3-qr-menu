"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "user";
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isAdmin, isUser, verifyToken } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading) {
        const isValid = await verifyToken();
        
        if (!isValid) {
          router.push("/sign-in");
          return;
        }

        // Check role if required
        if (requiredRole) {
          if (requiredRole === "admin" && !isAdmin()) {
            router.push("/sign-in");
            return;
          }
          
          if (requiredRole === "user" && !isUser()) {
            router.push("/sign-in");
            return;
          }
        }
      }
    };

    checkAuth();
  }, [isLoading, requiredRole, isAdmin, isUser, verifyToken, router]);

  // Show loading
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

  // Show fallback or nothing if not authenticated
  if (!isAuthenticated) {
    return fallback || null;
  }

  // Check role if required
  if (requiredRole) {
    if (requiredRole === "admin" && !isAdmin()) {
      return fallback || null;
    }
    
    if (requiredRole === "user" && !isUser()) {
      return fallback || null;
    }
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
}
