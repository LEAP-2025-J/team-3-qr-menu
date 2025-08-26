import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_CONFIG } from "@/config/api";

interface User {
  id: string;
  username: string;
  role: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });
  
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  // Login function
  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        const { token, user } = data;
        
        // Store in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        // Update state
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        // Redirect based on role
        if (user.role === "admin") {
          router.push("/admin");
        } else if (user.role === "user") {
          router.push("/user");
        }

        return { success: true, user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    }
  }, [router]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (token) {
        // Call logout endpoint
        await fetch(`${API_CONFIG.BACKEND_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Update state
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });

      // Redirect to sign-in
      router.push("/sign-in");
    }
  }, [router]);

  // Verify token function
  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/auth/verify`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Update user data
        const user = data.user;
        localStorage.setItem("user", JSON.stringify(user));
        
        setAuthState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
        }));
        
        return true;
      } else {
        // Token invalid, clear auth
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return false;
      }
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  }, []);

  // Check if user has required role
  const hasRole = useCallback((requiredRole: string) => {
    return authState.user?.role === requiredRole;
  }, [authState.user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole("admin");
  }, [hasRole]);

  // Check if user is regular user
  const isUser = useCallback(() => {
    return hasRole("user");
  }, [hasRole]);

  return {
    ...authState,
    login,
    logout,
    verifyToken,
    hasRole,
    isAdmin,
    isUser,
  };
};
