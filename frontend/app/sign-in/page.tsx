"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Lock, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await login(username, password);

      if (result.success) {
        // Login successful, redirect will be handled by the hook
        console.log("Login successful:", result.user);
      } else {
        setError(result.error || "Login failed");
      }
    } catch (error) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-600 rounded-full">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Sign In
          </CardTitle>
          <CardDescription>Sign in to access admin dashboard</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <Input
                  id="username"
                  type="text"
                  placeholder=""
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <Input
                  id="password"
                  type="password"
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {error && (
              <p className="text-sm text-center text-red-600">{error}</p>
            )}

            <div className="text-xs text-center text-gray-500">
              {/* <p>Demo Credentials:</p>
              <p>Admin: admin | admin123</p>
              <p>User: user | user123</p> */}
              {/* <p className="mt-1 text-blue-600">Secure JWT Authentication</p> */}
            </div>

            {/* <div className="text-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full"
              >
                Back to Home
              </Button>
            </div> */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
