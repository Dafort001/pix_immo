import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogOut } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

type MenuItem = {
  label: string;
  href: string;
  testId: string;
};

type GlobalLayoutProps = {
  children: React.ReactNode;
};

// Public menu items (when not authenticated)
const publicMenuItems: MenuItem[] = [
  { label: "Home", href: "/", testId: "menu-link-home" },
  { label: "Preise", href: "/preise", testId: "menu-link-preise" },
  { label: "Galerie", href: "/gallery", testId: "menu-link-gallery" },
  { label: "Blog", href: "/blog", testId: "menu-link-blog" },
  { label: "Kontakt", href: "/kontakt-formular", testId: "menu-link-kontakt" },
  { label: "Login", href: "/login", testId: "menu-link-login" },
];

// Customer menu items (when authenticated)
const customerMenuItems: MenuItem[] = [
  { label: "Dashboard", href: "/dashboard", testId: "menu-link-dashboard" },
  { label: "Jobs", href: "/jobs", testId: "menu-link-jobs" },
  { label: "Galerie", href: "/gallery", testId: "menu-link-gallery" },
  { label: "Preise", href: "/preise", testId: "menu-link-preise" },
  { label: "Blog", href: "/blog", testId: "menu-link-blog" },
  { label: "Kontakt", href: "/kontakt-formular", testId: "menu-link-kontakt" },
];

// Routes that should not show the global layout (they have their own layout)
const ROUTES_WITHOUT_GLOBAL_LAYOUT = [
  "/admin",
  "/editor-dashboard",
  "/editor-job-detail",
  "/capture",
  "/app",
  "/portal",
  "/orders",
  "/qc-quality-check",
];

export function GlobalLayout({ children }: GlobalLayoutProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if current route should use global layout
  const shouldShowLayout = !ROUTES_WITHOUT_GLOBAL_LAYOUT.some((route) =>
    location.startsWith(route)
  );

  // Fetch user authentication status
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn<{ user: User }>({ on401: "returnNull" }),
  });

  const isAuthenticated = !!userData?.user;
  const menuItems = isAuthenticated ? customerMenuItems : publicMenuItems;

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      setIsMenuOpen(false);
      toast({
        title: "Abgemeldet",
        description: "Sie wurden erfolgreich abgemeldet.",
      });
      // Layout will automatically switch to public menu because isAuthenticated becomes false
    },
  });

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // If route doesn't need global layout, render children directly
  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Global Header - Fixed position like homepage */}
      <div className="fixed top-6 left-8 right-8 z-50 flex items-center justify-between">
        <Link href="/">
          <h1
            className="text-[24px] font-medium tracking-[0.05em] cursor-pointer text-black leading-none hover:text-gray-600 transition-colors"
            data-testid="brand-logo"
          >
            PIX.IMMO
          </h1>
        </Link>

        {/* Hamburger Menu Button - size 24 like homepage */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-black hover:text-gray-600 transition-colors"
          aria-label="Menu"
          data-testid="button-menu-toggle"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Main Content */}
      {children}

      {/* Compact Dropdown Menu - like homepage */}
      {isMenuOpen && (
        <div
          className="fixed top-20 right-8 z-50 bg-white shadow-lg rounded-md"
          data-testid="menu-drawer"
        >
          <nav className="flex flex-col px-8 py-6 gap-6">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className="text-[16px] text-black cursor-pointer tracking-[-0.02em] hover:text-gray-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  data-testid={item.testId}
                >
                  {item.label}
                </span>
              </Link>
            ))}

            {/* Logout button (only when authenticated) */}
            {isAuthenticated && (
              <>
                <div className="border-t border-gray-200" />
                <button
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="flex items-center gap-2 text-[16px] text-black cursor-pointer tracking-[-0.02em] hover:text-gray-600 transition-colors text-left"
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Abmelden</span>
                </button>
              </>
            )}

            {/* User Info (when authenticated) */}
            {isAuthenticated && userData?.user && (
              <>
                <div className="border-t border-gray-200" />
                <div className="space-y-1">
                  <div className="text-[13px] text-gray-600" data-testid="user-email">
                    {userData.user.email}
                  </div>
                  <div className="text-[13px] text-gray-500 capitalize" data-testid="user-role">
                    {userData.user.role}
                  </div>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
