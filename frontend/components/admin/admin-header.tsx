"use client";

import { Button } from "@/components/ui/button";
import { Bell, LogOut } from "lucide-react";
import { UserButton, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export function AdminHeader() {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      console.log("Starting sign out process...");
      
      // Sign out from Clerk
      await signOut({ redirectUrl: "/sign-in" });
      console.log("Sign out completed successfully");
      
      // Force redirect to sign-in page
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Error during sign out:", error);
      setIsSigningOut(false);
      // Fallback: force redirect anyway
      window.location.href = "/sign-in";
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <UserButton />
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={isSigningOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {isSigningOut ? "Signing out..." : "Гарах"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign Out Confirmation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to sign out? You will need to sign in again to access the admin dashboard.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSigningOut}>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleSignOut} 
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? "Signing out..." : "Sign Out"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </header>
  );
}
