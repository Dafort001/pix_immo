import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { getQueryFn } from "@/lib/queryClient";

type User = {
  id: string;
  email: string;
  role: "client" | "admin" | "editor";
  createdAt: number;
};

/**
 * Auth Guard Hook
 * Redirects to /login if user is not authenticated
 * Optionally validates user role
 */
export function useAuthGuard(options?: { requiredRole?: "admin" | "editor" | "client" }) {
  const [, setLocation] = useLocation();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn<{ user: User }>({ on401: "returnNull" }),
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!userData && !isLoading) {
      setLocation("/login");
    }

    // Optionally check role (admin-only pages)
    if (userData && options?.requiredRole && userData.user.role !== options.requiredRole) {
      setLocation("/dashboard"); // Redirect to dashboard if wrong role
    }
  }, [userData, isLoading, setLocation, options?.requiredRole]);

  return {
    user: userData?.user,
    isLoading,
    isAuthenticated: !!userData,
  };
}
